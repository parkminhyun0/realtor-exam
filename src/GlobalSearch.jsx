import { useEffect, useRef, useState } from 'react'
import LawTextViewer from './LawTextViewer'
import { subjectLawSources } from './data/lawSources'
import { searchSite } from './siteSearch'
import './law-viewer.css'

function getActiveSubjectId() {
  return window.location.hash.replace(/^#\/?/, '') || ''
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
      merged.push({
        ...reference,
        key,
        articles: [...new Set(reference.articles || [])],
      })
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

  const references = mentions.map((mention, index) => {
    const next = mentions[index + 1]
    const segment = text.slice(mention.index, next?.index ?? text.length)
    return {
      subjectId,
      lawName: mention.law.name,
      articles: parseArticles(segment),
      reference: parseNamedReference(segment),
      officialUrl,
    }
  })

  return mergeLawReferences(references)
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
  const badge = element.querySelector('span')?.textContent?.trim()
  return badge === '법령'
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
    const onFrameMessage = (event) => {
      if (event.origin !== window.location.origin) return
      if (event.data?.type !== 'public-law:open-law-reference') return
      openLawViewer(event.data.detail)
    }

    window.addEventListener('realtor:open-law-viewer', onOpenLawReference)
    window.addEventListener('message', onFrameMessage)
    return () => {
      window.removeEventListener('realtor:open-law-viewer', onOpenLawReference)
      window.removeEventListener('message', onFrameMessage)
    }
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
    window.setTimeout(() => window.scrollTo({ top: 0, behavior: 'auto' }), 0)
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
                    <span className="global-search__result-action">과목 열기 →</span>
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
