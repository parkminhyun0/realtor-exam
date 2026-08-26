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
      setOpen(false)
      setLawViewerTarget(target || null)
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
        number.setAttribute('title', `${target.lawName} ${target.article} 본문 열기`)
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
      const number = event.target.closest(`${numberSelector.split(', ').join('[data-law-reference], ')}[data-law-reference]`)
      if (!number) return
      openFromNumber(number, event)
    }

    const onLawNumberKeyDown = (event) => {
      if (!(event.target instanceof Element)) return
      const number = event.target.closest(`${numberSelector.split(', ').join('[data-law-reference], ')}[data-law-reference]`)
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

      <button
        className="law-open-button"
        type="button"
        onClick={() => {
          setOpen(false)
          setLawViewerTarget(null)
          setLawViewerOpen(true)
        }}
        aria-haspopup="dialog"
        aria-label="관련 법령 본문 열기"
        title="관련 법령 본문"
      >
        <span className="law-open-button__icon" aria-hidden="true">§</span>
        <span className="law-open-button__text">법령 본문</span>
      </button>

      <LawTextViewer
        open={lawViewerOpen}
        onClose={() => setLawViewerOpen(false)}
        activeSubjectId={getActiveSubjectId()}
        target={lawViewerTarget}
      />
    </>
  )
}
