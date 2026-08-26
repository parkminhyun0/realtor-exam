import { useEffect, useRef, useState } from 'react'
import LawTextViewer from './LawTextViewer'
import { subjectLawSources } from './data/lawSources'
import { publicLawChapters } from './data/publicLaw'
import { realEstateTheoryParts } from './data/realEstateTheory'
import { realEstateTheoryExtraChapters } from './data/realEstateTheoryExtra'
import { registrationLawParts } from './data/registrationLaw'
import { searchSite } from './siteSearch'
import './law-viewer.css'

const SEARCH_JUMP_ATTEMPTS = 60
const SEARCH_JUMP_DELAY = 75

const theoryPartsWithExtras = realEstateTheoryParts.map((part) => (
  part.id === 'part8'
    ? { ...part, chapters: [...part.chapters, ...realEstateTheoryExtraChapters] }
    : part
))

const searchTargetMeta = {
  'public-law': Object.fromEntries(
    publicLawChapters.flatMap((chapter) => chapter.sections.map((section) => [
      section.id,
      { label: section.title, groupLabel: `제${chapter.number}장 ${chapter.shortTitle}` },
    ])),
  ),
  'registration-law': Object.fromEntries(
    registrationLawParts.flatMap((part) => part.points.map((point) => [
      point.id,
      { label: point.title, groupLabel: `PART ${part.number} ${part.title}` },
    ])),
  ),
  'real-estate-theory': Object.fromEntries(
    theoryPartsWithExtras.flatMap((part) => part.chapters.map((chapter) => [
      chapter.id,
      { label: chapter.title, groupLabel: `제${Number(part.number)}편 ${part.title}` },
    ])),
  ),
}

function getActiveSubjectId() {
  return window.location.hash.replace(/^#\/?/, '') || ''
}

function normalizeSearchText(value = '') {
  return String(value)
    .toLocaleLowerCase('ko-KR')
    .replace(/[\u00b7·•|/_,()[\]{}:;!?"'`~<>+=*\\-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function delay(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

function getArticleFromNumber(element) {
  const text = element.textContent?.trim().replace(/\s+/g, '') || ''
  const match = text.match(/^(\d+)조(?:의(\d+))?$/)
  if (!match) return null
  return `제${match[1]}조${match[2] ? `의${match[2]}` : ''}`
}

function getLawTokens(subjectId) {
  const subject = subjectLawSources[subjectId]
  if (!subject) return []

  return subject.laws
    .flatMap((law) => [law.name, ...(law.aliases || [])].map((token) => ({ law, token })))
    .sort((a, b) => b.token.length - a.token.length)
}

function findLawMentions(text, subjectId) {
  const mentions = []
  getLawTokens(subjectId).forEach(({ law, token }) => {
    let from = 0
    while (from < text.length) {
      const index = text.indexOf(token, from)
      if (index < 0) break
      mentions.push({ index, end: index + token.length, law, token })
      from = index + token.length
    }
  })

  mentions.sort((a, b) => a.index - b.index || b.token.length - a.token.length)
  const filtered = []
  mentions.forEach((mention) => {
    const overlaps = filtered.some((item) => mention.index < item.end && mention.end > item.index)
    if (!overlaps) filtered.push(mention)
  })
  return filtered.sort((a, b) => a.index - b.index)
}

function parseArticles(text = '') {
  const entries = []
  const rangeSpans = []
  const add = (article, position) => {
    if (!entries.some((item) => item.article === article)) entries.push({ article, position })
  }

  const rangePattern = /제\s*(\d+)\s*조(?:의\s*(\d+))?\s*(?:~|～|−|–|—|-)\s*제?\s*(\d+)\s*조(?:의\s*(\d+))?/g
  let rangeMatch
  while ((rangeMatch = rangePattern.exec(text))) {
    rangeSpans.push([rangeMatch.index, rangePattern.lastIndex])
    const start = Number(rangeMatch[1])
    const startSub = rangeMatch[2]
    const end = Number(rangeMatch[3])
    const endSub = rangeMatch[4]

    if (!startSub && !endSub && end >= start && end - start <= 30) {
      for (let number = start; number <= end; number += 1) {
        add(`제${number}조`, rangeMatch.index + ((number - start) / 100))
      }
    } else {
      add(`제${start}조${startSub ? `의${startSub}` : ''}`, rangeMatch.index)
      add(`제${end}조${endSub ? `의${endSub}` : ''}`, rangeMatch.index + 0.01)
    }
  }

  const articlePattern = /제\s*(\d+)\s*조(?:의\s*(\d+))?/g
  let articleMatch
  while ((articleMatch = articlePattern.exec(text))) {
    const insideRange = rangeSpans.some(([start, end]) => articleMatch.index >= start && articleMatch.index < end)
    if (insideRange) continue
    add(`제${articleMatch[1]}조${articleMatch[2] ? `의${articleMatch[2]}` : ''}`, articleMatch.index)
  }

  return entries.sort((a, b) => a.position - b.position).map((item) => item.article)
}

function parseNamedReference(text = '') {
  const match = text.match(/별표\s*(\d+(?:\s*의\s*\d+)?)/)
  return match ? `별표 ${match[1].replace(/\s+/g, '')}` : null
}

function mergeLawReferences(references) {
  const merged = []
  references.forEach((reference) => {
    if (!reference?.lawName) return
    const key = `${reference.lawName}::${reference.reference || 'law'}`
    const existing = merged.find((item) => item.key === key)
    if (!existing) {
      merged.push({ ...reference, key, articles: [...new Set(reference.articles || [])] })
      return
    }

    existing.articles = [...new Set([...(existing.articles || []), ...(reference.articles || [])])]
    if (!existing.officialUrl && reference.officialUrl) existing.officialUrl = reference.officialUrl
  })
  return merged.map(({ key, ...reference }) => reference)
}

function resolveLawReferencesFromText(text = '', subjectId, officialUrl = null) {
  const mentions = findLawMentions(text, subjectId)
  if (!mentions.length) return []

  return mergeLawReferences(mentions.map((mention, index) => {
    const next = mentions[index + 1]
    const segment = text.slice(mention.index, next?.index ?? text.length)
    return {
      subjectId,
      lawName: mention.law.name,
      articles: parseArticles(segment),
      reference: parseNamedReference(segment),
      officialUrl,
    }
  }))
}

function getLawNameFromContext(element, subjectId) {
  const subject = subjectLawSources[subjectId]
  if (!subject) return null

  const containers = [
    element.closest('tr'),
    element.closest('li'),
    element.closest('p'),
    element.closest('.law-detail-card'),
    element.closest('.theory-source-item'),
    element.closest('.theory-basis-card'),
    element.closest('.study-block'),
    element.closest('.public-law-content'),
  ].filter(Boolean)

  for (const container of containers) {
    const reference = resolveLawReferencesFromText(container.textContent || '', subjectId)[0]
    if (reference?.lawName) return reference.lawName
  }

  if (subjectId === 'registration-law') {
    const breadcrumb = document.querySelector('.registration-law-page .public-law-breadcrumb')?.textContent || ''
    if (/PART\s*1/i.test(breadcrumb)) return subject.laws[0]?.name || null
    if (/PART\s*2/i.test(breadcrumb)) return subject.laws[1]?.name || null
  }

  if (subject.laws.length === 1) return subject.laws[0].name
  return null
}

function isTheoryLawSource(element) {
  if (!element.matches('.theory-source-item')) return false
  return element.querySelector('span')?.textContent?.trim() === '법령'
}

function getLawCardReferences(element, subjectId) {
  if (element.matches('.theory-source-item') && !isTheoryLawSource(element)) return []

  const direct = resolveLawReferencesFromText(
    element.textContent || '',
    subjectId,
    element instanceof HTMLAnchorElement ? element.href : null,
  )
  if (direct.length) return direct

  if (!element.matches('.theory-basis-card--law')) return []
  const content = element.closest('.public-law-content')
  if (!content) return []

  const related = []
  content.querySelectorAll('.theory-source-item').forEach((source) => {
    if (!isTheoryLawSource(source)) return
    related.push(...resolveLawReferencesFromText(
      source.textContent || '',
      subjectId,
      source instanceof HTMLAnchorElement ? source.href : null,
    ))
  })
  return mergeLawReferences(related)
}

function hasViewerTarget(target) {
  return Boolean(
    (target?.lawName && (target?.article || target?.articles?.length || target?.reference || target?.wholeLaw))
    || target?.references?.length,
  )
}

function findTargetNavigationButton(result) {
  if (!result?.targetId) return null
  const targetMeta = searchTargetMeta[result.subjectId]?.[result.targetId]
  if (!targetMeta) return null

  const nav = document.querySelector('.public-law-nav')
  if (!nav) return null

  const wantedGroup = normalizeSearchText(targetMeta.groupLabel)
  const wantedLabel = normalizeSearchText(targetMeta.label)
  const details = [...nav.querySelectorAll('details')]
  const group = details.find((detail) => (
    normalizeSearchText(detail.querySelector('summary')?.textContent).includes(wantedGroup)
  ))
  const buttons = [...(group || nav).querySelectorAll('li button')]
  return buttons.find((button) => normalizeSearchText(button.textContent).includes(wantedLabel)) || null
}

function findBestTextMatch(root, query, resultText = '') {
  if (!root?.querySelectorAll) return null

  const queryTokens = normalizeSearchText(query).split(' ').filter(Boolean)
  const resultNeedle = normalizeSearchText(resultText)
  const candidates = [...root.querySelectorAll([
    'h1', 'h2', 'h3', 'h4', 'p', 'li', 'th', 'td', 'strong', 'b',
    '.study-note', '.law-detail-card__exam', '.exam-core-item',
    '.understanding-grid > div', '.hierarchy-flow__step',
  ].join(','))]
    .filter((element) => {
      if (element?.nodeType !== 1) return false
      const text = normalizeSearchText(element.textContent)
      return text && element.getClientRects().length > 0
    })

  if (resultNeedle && resultNeedle.length <= 260) {
    const resultMatches = candidates
      .filter((element) => normalizeSearchText(element.textContent).includes(resultNeedle))
      .sort((a, b) => (a.textContent?.length || 0) - (b.textContent?.length || 0))
    if (resultMatches[0]) return resultMatches[0]
  }

  if (!queryTokens.length) return null
  return candidates
    .filter((element) => {
      const text = normalizeSearchText(element.textContent)
      return queryTokens.every((token) => text.includes(token))
    })
    .sort((a, b) => (a.textContent?.length || 0) - (b.textContent?.length || 0))[0] || null
}

function flashElement(element) {
  if (!element) return

  if (typeof element.animate === 'function') {
    element.animate([
      { backgroundColor: 'rgba(255, 224, 102, .72)', outline: '3px solid rgba(185, 133, 43, .48)' },
      { backgroundColor: 'rgba(255, 224, 102, .18)', outline: '3px solid rgba(185, 133, 43, .18)', offset: .62 },
      { backgroundColor: 'transparent', outline: '3px solid transparent' },
    ], { duration: 1900, easing: 'ease-out' })
    return
  }

  const previousOutline = element.style.outline
  const previousBackground = element.style.backgroundColor
  element.style.outline = '3px solid rgba(185, 133, 43, .48)'
  element.style.backgroundColor = 'rgba(255, 224, 102, .48)'
  window.setTimeout(() => {
    element.style.outline = previousOutline
    element.style.backgroundColor = previousBackground
  }, 1800)
}

function scrollToMatch(element, iframe = null) {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const headerHeight = document.querySelector('.site-header')?.getBoundingClientRect().height ?? 0
  let targetTop

  if (iframe) {
    const frameRect = iframe.getBoundingClientRect()
    const innerRect = element.getBoundingClientRect()
    const innerScroll = iframe.contentWindow?.scrollY || 0
    targetTop = window.scrollY + frameRect.top + innerRect.top + innerScroll - headerHeight - 24
  } else {
    const rect = element.getBoundingClientRect()
    targetTop = window.scrollY + rect.top - headerHeight - 24
  }

  window.scrollTo({ top: Math.max(0, targetTop), behavior: reduceMotion ? 'auto' : 'smooth' })
  flashElement(element)
}

async function jumpToSearchResult(result, query) {
  let targetClicked = false

  for (let attempt = 0; attempt < SEARCH_JUMP_ATTEMPTS; attempt += 1) {
    if (getActiveSubjectId() !== result.subjectId) {
      await delay(SEARCH_JUMP_DELAY)
      continue
    }

    if (result.targetId && !targetClicked) {
      const targetButton = findTargetNavigationButton(result)
      if (!targetButton) {
        await delay(SEARCH_JUMP_DELAY)
        continue
      }
      if (!targetButton.classList.contains('active')) targetButton.click()
      targetClicked = true
      await delay(120)
    }

    const content = document.querySelector('.public-law-content')
    if (!content) {
      await delay(SEARCH_JUMP_DELAY)
      continue
    }

    if (result.subjectId === 'public-law') {
      const iframe = content.querySelector('.public-law-frame')
      try {
        const frameBody = iframe?.contentDocument?.body
        const match = findBestTextMatch(frameBody, query, result.text)
        if (match) {
          scrollToMatch(match, iframe)
          return
        }
      } catch {
        // Same-origin iframe is expected. If access is blocked, use the section fallback below.
      }
    } else {
      const match = findBestTextMatch(content, query, result.text)
      if (match) {
        scrollToMatch(match)
        return
      }
    }

    if (!result.targetId && attempt > 4) {
      scrollToMatch(content.querySelector('.study-section-heading') || content)
      return
    }

    await delay(SEARCH_JUMP_DELAY)
  }

  const fallback = document.querySelector('.public-law-content .study-section-heading')
    || document.querySelector('.public-law-content')
    || document.querySelector('#main-content')
  if (fallback) scrollToMatch(fallback)
}

export default function GlobalSearch({ onNavigate }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [submittedQuery, setSubmittedQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [lawViewerOpen, setLawViewerOpen] = useState(false)
  const [lawViewerTarget, setLawViewerTarget] = useState(null)
  const rootRef = useRef(null)

  useEffect(() => {
    const onPointerDown = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [])

  useEffect(() => {
    const openLawViewer = (target) => {
      if (!hasViewerTarget(target)) return
      setOpen(false)
      setLawViewerTarget(target)
      setLawViewerOpen(true)
    }

    const onOpenLawReference = (event) => openLawViewer(event.detail)
    window.addEventListener('realtor:open-law-viewer', onOpenLawReference)
    return () => window.removeEventListener('realtor:open-law-viewer', onOpenLawReference)
  }, [])

  useEffect(() => {
    const numberSelector = '.theory-exam-number, .exam-number'
    const lawCardSelector = '.theory-source-item, .theory-basis-card--law'
    const clickableSelector = [
      '.theory-exam-number[data-law-reference]',
      '.exam-number[data-law-reference]',
      '.theory-source-item[data-law-reference]',
      '.theory-basis-card--law[data-law-reference]',
    ].join(', ')

    const getLawTarget = (element) => {
      const article = getArticleFromNumber(element)
      if (!article) return null

      const subjectId = getActiveSubjectId()
      if (!subjectLawSources[subjectId]) return null

      const lawName = getLawNameFromContext(element, subjectId)
      if (!lawName) return null
      return { subjectId, lawName, article }
    }

    const clearDecoration = (element) => {
      element.removeAttribute('data-law-reference')
      element.removeAttribute('role')
      element.removeAttribute('tabindex')
      element.removeAttribute('title')
    }

    const decorateLawReferences = () => {
      const subjectId = getActiveSubjectId()

      document.querySelectorAll(numberSelector).forEach((number) => {
        const target = getLawTarget(number)
        if (!target) {
          clearDecoration(number)
          return
        }
        number.setAttribute('data-law-reference', 'true')
        number.setAttribute('role', 'button')
        number.setAttribute('tabindex', '0')
        number.setAttribute('title', `${target.lawName} ${target.article} 조문 보기`)
      })

      document.querySelectorAll(lawCardSelector).forEach((card) => {
        const references = subjectLawSources[subjectId] ? getLawCardReferences(card, subjectId) : []
        if (!references.length) {
          if (card.matches('.theory-basis-card--law') || isTheoryLawSource(card)) clearDecoration(card)
          return
        }
        card.setAttribute('data-law-reference', 'true')
        card.setAttribute('role', 'button')
        card.setAttribute('tabindex', '0')
        card.setAttribute('title', '관련 법령을 텍스트 팝업으로 보기')
      })
    }

    const openFromElement = (element, event) => {
      const subjectId = getActiveSubjectId()
      let target = null

      if (element.matches('.theory-exam-number, .exam-number')) {
        target = getLawTarget(element)
      } else {
        const references = getLawCardReferences(element, subjectId)
        if (references.length) target = { subjectId, references }
      }
      if (!hasViewerTarget(target)) return

      event.preventDefault()
      event.stopPropagation()
      window.dispatchEvent(new CustomEvent('realtor:open-law-viewer', { detail: target }))
    }

    const onLawReferenceClick = (event) => {
      if (!(event.target instanceof Element)) return
      const element = event.target.closest(clickableSelector)
      if (!element) return
      openFromElement(element, event)
    }

    const onLawReferenceKeyDown = (event) => {
      if (!(event.target instanceof Element)) return
      const element = event.target.closest(clickableSelector)
      if (!element || !['Enter', ' '].includes(event.key)) return
      openFromElement(element, event)
    }

    decorateLawReferences()
    const observer = new MutationObserver(decorateLawReferences)
    observer.observe(document.body, { childList: true, subtree: true, characterData: true })
    document.addEventListener('click', onLawReferenceClick)
    document.addEventListener('keydown', onLawReferenceKeyDown)

    return () => {
      observer.disconnect()
      document.removeEventListener('click', onLawReferenceClick)
      document.removeEventListener('keydown', onLawReferenceKeyDown)
    }
  }, [])

  const runSearch = () => {
    const trimmed = query.trim()
    if (!trimmed) {
      setResults([])
      setSubmittedQuery('')
      setOpen(false)
      return
    }
    setSubmittedQuery(trimmed)
    setResults(searchSite(trimmed))
    setOpen(true)
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    runSearch()
  }

  const handleResultClick = (result) => {
    setOpen(false)
    onNavigate(result.subjectId)
    void jumpToSearchResult(result, submittedQuery || query)
  }

  return (
    <>
      <div className="global-search" ref={rootRef}>
        <form className="global-search__form" role="search" onSubmit={handleSubmit}>
          <span className="global-search__icon" aria-hidden="true">⌕</span>
          <input
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              if (!event.target.value.trim()) setOpen(false)
            }}
            onFocus={() => submittedQuery && setOpen(true)}
            onKeyDown={(event) => {
              if (event.key === 'Escape') setOpen(false)
            }}
            placeholder="전체 과목 내용 검색 · 예: 용적률, 취득세, 지상권"
            aria-label="전체 과목 내용 검색"
            autoComplete="off"
          />
          <button type="submit">검색</button>
        </form>

        {open && (
          <div className="global-search__results" role="region" aria-label="검색 결과">
            <div className="global-search__results-head">
              <strong>“{submittedQuery}” 검색 결과</strong>
              <span>{results.length}건</span>
            </div>

            {results.length > 0 ? (
              <div className="global-search__result-list">
                {results.map((result, index) => (
                  <button
                    type="button"
                    className="global-search__result"
                    key={`${result.subjectId}-${result.path}-${index}`}
                    onClick={() => handleResultClick(result)}
                  >
                    <span className="global-search__result-meta">
                      <b>{result.subjectTitle}</b>
                      <span>{result.context}</span>
                    </span>
                    <span className="global-search__result-snippet">{result.snippet}</span>
                    <span className="global-search__result-action">해당 위치로 이동 →</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="global-search__empty">
                <strong>일치하는 내용을 찾지 못했습니다.</strong>
                <span>띄어쓰기를 줄이거나 핵심 단어 하나로 다시 검색해 보세요.</span>
              </div>
            )}
          </div>
        )}
      </div>

      <LawTextViewer
        open={lawViewerOpen}
        onClose={() => setLawViewerOpen(false)}
        target={lawViewerTarget}
      />
    </>
  )
}
