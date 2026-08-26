import { useEffect, useMemo, useState } from 'react'
import { publicLawChapters } from './data/publicLaw'
import './public-law-integrated.css'

export default function PublicLawPage({ onBack }) {
  const [selectedId, setSelectedId] = useState('c1s1')
  const [frameHeight, setFrameHeight] = useState(900)

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
      if (event.data?.type !== 'public-law:height') return
      const nextHeight = Number(event.data.height)
      if (!Number.isFinite(nextHeight)) return
      setFrameHeight(Math.max(620, Math.ceil(nextHeight) + 4))
    }

    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [])

  const frameSrc = `${import.meta.env.BASE_URL}public-law.html?embed=1#${selectedId}`

  return (
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
            <span className="law-reference">{selected.chapter.title}</span>
          </header>

          <iframe
            key={selectedId}
            className="public-law-frame"
            src={frameSrc}
            title={`부동산공법 ${selected.chapter.shortTitle} ${selected.section.title}`}
            style={{ height: `${frameHeight}px` }}
            scrolling="no"
          />
        </article>
      </div>
    </main>
  )
}
