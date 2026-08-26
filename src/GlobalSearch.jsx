import { useEffect, useRef, useState } from 'react'
import LawTextViewer from './LawTextViewer'
import { subjectLawSources } from './data/lawSources'
import { searchSite } from './siteSearch'
import './law-viewer.css'

function getActiveSubjectId() {
  return window.location.hash.replace(/^#\/?/, '') || ''
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
    const onOpenLawReference = (event) => {
      setOpen(false)
      setLawViewerTarget(event.detail || null)
      setLawViewerOpen(true)
    }

    window.addEventListener('realtor:open-law-viewer', onOpenLawReference)
    return () => window.removeEventListener('realtor:open-law-viewer', onOpenLawReference)
  }, [])

  useEffect(() => {
    const theoryLawNames = subjectLawSources['real-estate-theory'].laws.map((law) => law.name)

    const getTheoryLawTarget = (element) => {
      const articleMatch = element.textContent?.trim().match(/^(\d+(?:의\d+)?)조$/)
      if (!articleMatch) return null

      const context = element.parentElement?.textContent || ''
      const lawName = theoryLawNames
        .slice()
        .sort((a, b) => b.length - a.length)
        .find((name) => context.includes(name))

      if (!lawName) return null

      return {
        subjectId: 'real-estate-theory',
        lawName,
        article: `제${articleMatch[1]}조`,
      }
    }

    const onTheoryLawNumberClick = (event) => {
      if (!(event.target instanceof Element)) return
      const number = event.target.closest('.real-estate-theory-page .theory-exam-number')
      if (!number) return

      const target = getTheoryLawTarget(number)
      if (!target) return

      event.preventDefault()
      event.stopPropagation()
      window.dispatchEvent(new CustomEvent('realtor:open-law-viewer', { detail: target }))
    }

    document.addEventListener('click', onTheoryLawNumberClick)
    return () => document.removeEventListener('click', onTheoryLawNumberClick)
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
