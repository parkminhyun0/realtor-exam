import { useEffect, useMemo, useState } from 'react'
import LawTextViewer from './LawTextViewer'
import { publicLawChapters } from './data/publicLaw'
import './law-viewer.css'
import './public-law-integrated.css'

const LAW_ARTICLE_PATTERN = /^제\s*\d+\s*조(?:의\s*\d+)?$/

function hardenEmbeddedTableScrolling(frame) {
  const doc = frame?.contentDocument
  const view = frame?.contentWindow
  if (!doc?.head || !doc?.body || !view) return

  if (!doc.getElementById('public-law-mobile-table-scroll-fix')) {
    const style = doc.createElement('style')
    style.id = 'public-law-mobile-table-scroll-fix'
    style.textContent = `
      .mobile-table-host {
        box-sizing: border-box !important;
        width: 100% !important;
        min-width: 0 !important;
        max-width: 100% !important;
        overflow: visible !important;
        contain: layout !important;
      }
      .mobile-table-scroll {
        position: relative !important;
        display: block !important;
        box-sizing: border-box !important;
        inline-size: min(100%, var(--embedded-table-visible-width, 100%)) !important;
        width: min(100%, var(--embedded-table-visible-width, 100%)) !important;
        min-width: 0 !important;
        max-width: min(100%, var(--embedded-table-visible-width, 100%)) !important;
        margin: 0 0 10px !important;
        padding: 0 16px 10px 0 !important;
        overflow-x: scroll !important;
        overflow-y: hidden !important;
        -webkit-overflow-scrolling: touch !important;
        overscroll-behavior-inline: contain !important;
        scroll-behavior: auto !important;
        scroll-snap-type: none !important;
        scroll-padding-inline-end: 16px !important;
        touch-action: pan-x pan-y !important;
        scrollbar-gutter: auto !important;
        isolation: isolate !important;
      }
      .mobile-table-scroll > table {
        display: table !important;
        box-sizing: border-box !important;
        width: max(100%, 720px) !important;
        min-width: 720px !important;
        max-width: none !important;
        margin: 0 !important;
      }
      .mobile-table-scroll > table th:last-child,
      .mobile-table-scroll > table td:last-child {
        border-right-width: 2px !important;
      }
      .mobile-table-scroll::after {
        content: '';
        display: block;
        width: 16px;
        height: 1px;
      }
    `
    doc.head.appendChild(style)
  }

  const syncWidths = () => {
    const vv = view.visualViewport
    const viewportWidth = vv?.width || doc.documentElement.clientWidth || view.innerWidth
    const offsetLeft = vv?.offsetLeft || 0

    doc.querySelectorAll('.mobile-table-scroll').forEach((wrapper) => {
      const rect = wrapper.getBoundingClientRect()
      const parentRect = wrapper.parentElement?.getBoundingClientRect()
      const visibleLeft = Math.max(offsetLeft, rect.left)
      const visibleRight = offsetLeft + viewportWidth
      const viewportAvailable = Math.max(220, visibleRight - visibleLeft - 8)
      const parentAvailable = Math.max(220, parentRect?.width || rect.width || viewportAvailable)
      const resolved = Math.max(220, Math.min(viewportAvailable, parentAvailable))
      wrapper.style.setProperty('--embedded-table-visible-width', `${resolved}px`)
    })
  }

  const wrapTables = () => {
    doc.querySelectorAll('table').forEach((table) => {
      if (table.parentElement?.classList.contains('mobile-table-scroll')) return
      const parent = table.parentElement
      if (!parent) return
      parent.classList.add('mobile-table-host')
      const wrapper = doc.createElement('div')
      wrapper.className = 'mobile-table-scroll'
      parent.insertBefore(wrapper, table)
      wrapper.appendChild(table)
    })
    syncWidths()
  }

  wrapTables()
  view.requestAnimationFrame(wrapTables)
  view.setTimeout(wrapTables, 120)
  view.setTimeout(wrapTables, 500)

  if (!view.__publicLawTableViewportInstalled) {
    view.__publicLawTableViewportInstalled = true
    view.addEventListener('resize', syncWidths, { passive: true })
    view.visualViewport?.addEventListener('resize', syncWidths, { passive: true })
    view.visualViewport?.addEventListener('scroll', syncWidths, { passive: true })
    if ('ResizeObserver' in view) {
      const resizeObserver = new view.ResizeObserver(syncWidths)
      resizeObserver.observe(doc.documentElement)
      view.__publicLawTableResizeObserver = resizeObserver
    }
  }
}

export default function PublicLawPage({ onBack }) {
  const [selectedId, setSelectedId] = useState('c1s1')
  const [frameHeight, setFrameHeight] = useState(900)
  const [lawTarget, setLawTarget] = useState(null)

  const selected = useMemo(() => {
    for (const chapter of publicLawChapters) {
      const section = chapter.sections.find((item) => item.id === selectedId)
      if (section) return { chapter, section }
    }
    return { chapter: publicLawChapters[0], section: publicLawChapters[0].sections[0] }
  }, [selectedId])

  useEffect(() => {
    const onMessage = (event) => {
      if (event.origin !== window.location.origin) return

      if (event.data?.type === 'public-law:height') {
        const nextHeight = Number(event.data.height)
        if (!Number.isFinite(nextHeight)) return
        setFrameHeight(Math.max(620, Math.ceil(nextHeight) + 4))
        return
      }

      if (event.data?.type !== 'public-law:open-law-reference') return

      const detail = event.data?.detail
      const isKnownLaw = publicLawChapters.some((chapter) => chapter.title === detail?.lawName)
      if (!isKnownLaw || !LAW_ARTICLE_PATTERN.test(String(detail?.article || ''))) return

      setLawTarget({
        subjectId: 'public-law',
        lawName: detail.lawName,
        article: detail.article,
      })
    }

    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [])

  const frameSrc = `${import.meta.env.BASE_URL}public-law.html?embed=1&law=${encodeURIComponent(selected.chapter.title)}#${selectedId}`

  return (
    <>
      <main className="public-law-page" id="main-content">
        <div className="public-law-topline">
          <button className="back-button" type="button" onClick={onBack}>← 전체 과목</button>
          <span>공인중개사 2차 · 부동산공법</span>
        </div>

        <section className="public-law-hero">
          <div>
            <span className="eyebrow">PUBLIC LAW · 2026</span>
            <h1>부동산공법 핵심정리</h1>
            <p>국토계획법 · 도시개발법 · 도시정비법 · 건축법 · 주택법 · 농지법을 공시법과 동일한 학습 페이지 구조로 정리합니다.</p>
          </div>
          <div className="public-law-hero__badges">
            <span>6개 법률</span>
            <span>33개 세부 절</span>
            <span>법령명·조문 바로보기</span>
            <span>절차·비교·함정 중심</span>
          </div>
        </section>

        <div className="public-law-layout">
          <aside className="public-law-nav" aria-label="부동산공법 목차">
            <div className="public-law-nav__title">
              <strong>부동산공법</strong>
              <span>전체 목차 · 제1장~제6장</span>
            </div>
            {publicLawChapters.map((chapter) => (
              <details key={chapter.id} open={chapter.sections.some((item) => item.id === selectedId)}>
                <summary>
                  <i style={{ background: chapter.color }} />
                  <span>제{chapter.number}장 {chapter.shortTitle}</span>
                </summary>
                <ul>
                  {chapter.sections.map((section) => (
                    <li key={section.id}>
                      <button
                        type="button"
                        className={selectedId === section.id ? 'active' : ''}
                        onClick={() => {
                          setLawTarget(null)
                          setFrameHeight(900)
                          setSelectedId(section.id)
                        }}
                      >
                        <span>{section.title}</span>
                        <b>공개</b>
                      </button>
                    </li>
                  ))}
                </ul>
              </details>
            ))}
          </aside>

          <article className="public-law-content public-law-content--source">
            <div className="public-law-breadcrumb">
              제{selected.chapter.number}장 {selected.chapter.shortTitle} <span>›</span> {selected.section.title}
            </div>

            <header className="study-section-heading" style={{ '--chapter-color': selected.chapter.color }}>
              <div>
                <span className="study-section-heading__number">{String(selected.chapter.number).padStart(2, '0')}</span>
                <div>
                  <span className="study-section-heading__chapter">제{selected.chapter.number}장 · {selected.chapter.shortTitle}</span>
                  <h2>{selected.section.title}</h2>
                </div>
              </div>
              <span
                className="law-reference public-law-source-label"
                title="아래 본문의 빨간 밑줄 법조문을 누르면 해당 조문만 팝업으로 확인할 수 있습니다."
              >
                근거법령 · {selected.chapter.title}
              </span>
            </header>

            <iframe
              key={selectedId}
              className="public-law-frame"
              src={frameSrc}
              title={`부동산공법 ${selected.chapter.shortTitle} ${selected.section.title}`}
              style={{ height: `${frameHeight}px` }}
              scrolling="no"
              onLoad={(event) => hardenEmbeddedTableScrolling(event.currentTarget)}
            />
          </article>
        </div>
      </main>

      <LawTextViewer
        open={Boolean(lawTarget)}
        target={lawTarget}
        onClose={() => setLawTarget(null)}
      />
    </>
  )
}
