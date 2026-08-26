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

function getLawNameFromContext(element, subjectId) {
  const subject = subjectLawSources[subjectId]
  if (!subject) return null

  const laws = [...subject.laws].sort((a, b) => b.name.length - a.name.length)
  const containers = [
    element.closest('tr'),
    element.closest('li'),
    element.closest('p'),
    element.closest('.law-detail-card'),
    element.closest('.study-block'),
    element.closest('.public-law-content'),
  ].filter(Boolean)

  for (const container of containers) {
    const text = container.textContent || ''
    const matchedLaw = laws.find((law) => text.includes(law.name))
    if (matchedLaw) return matchedLaw.name
  }

  if (subjectId === 'registration-law') {
    const breadcrumb = document.querySelector('.registration-law-page .public-law-breadcrumb')?.textContent || ''
    if (/PART\s*1/i.test(breadcrumb)) return subject.laws[0]?.name || null
    if (/PART\s*2/i.test(breadcrumb)) return subject.laws[1]?.name || null
  }

  if (subject.laws.length === 1) return subject.laws[0].name
  return null
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
    'h1', 'h2', 'h3', 'h4',
    'p', 'li', 'th', 'td',
    'strong', 'b',
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

  window.scrollTo({
    top: Math.max(0, targetTop),
    behavior: reduceMotion ? 'auto' : 'smooth',
  })
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
        // Same-origin iframe is expected. If the browser blocks access, fall through to the section heading.
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
      if (!target?.lawName || !target?.article) return
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
    const clickableSelector = '.theory-exam-number[data-law-reference], .exam-number[data-law-reference]'

    const getLawTarget = (element) => {
      const article = getArticleFromNumber(element)
      if (!article) return null

      const subjectId = getActiveSubjectId()
      if (!subjectLawSources[subjectId]) return null

      const lawName = getLawNameFromContext(element, subjectId)
      if (!lawName) return null

      return { subjectId, lawName, article }
    }

    const decorateLawNumbers = () => {
      document.querySelectorAll(numberSelector).forEach((number) => {
        const target = getLawTarget(number)
        if (!target) {
          number.removeAttribute('data-law-reference')
          number.removeAttribute('role')
          number.removeAttribute('tabindex')
          number.removeAttribute('title')
          return
        }

        number.setAttribute('data-law-reference', 'true')
        number.setAttribute('role', 'button')
        number.setAttribute('tabindex', '0')
        number.setAttribute('title', `${target.lawName} ${target.article} 조문 보기`)
      })
    }

    const openFromNumber = (number, event) => {
      const target = getLawTarget(number)
      if (!target) return

      event.preventDefault()
      event.stopPropagation()
      window.dispatchEvent(new CustomEvent('realtor:open-law-viewer', { detail: target }))
    }

    const onLawNumberClick = (event) => {
      if (!(event.target instanceof Element)) return
      const number = event.target.closest(clickableSelector)
      if (!number) return
      openFromNumber(number, event)
    }

    const onLawNumberKeyDown = (event) => {
      if (!(event.target instanceof Element)) return
      const number = event.target.closest(clickableSelector)
      if (!number || !['Enter', ' '].includes(event.key)) return
      openFromNumber(number, event)
    }

    decorateLawNumbers()
    const observer = new MutationObserver(decorateLawNumbers)
    observer.observe(document.body, { childList: true, subtree: true, characterData: true })
    document.addEventListener('click', onLawNumberClick)
    document.addEventListener('keydown', onLawNumberKeyDown)

    return () => {
      observer.disconnect()
      document.removeEventListener('click', onLawNumberClick)
      document.removeEventListener('keydown', onLawNumberKeyDown)
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
