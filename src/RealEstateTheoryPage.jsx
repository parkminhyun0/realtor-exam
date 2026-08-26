import { useMemo, useState } from 'react'
import { realEstateTheoryChapterCount, realEstateTheoryParts } from './data/realEstateTheory'
import './real-estate-theory.css'

export default function RealEstateTheoryPage({ onBack }) {
  const [selectedId, setSelectedId] = useState('p1c1')

  const selected = useMemo(() => {
    for (const part of realEstateTheoryParts) {
      const chapter = part.chapters.find((item) => item.id === selectedId)
      if (chapter) return { part, chapter }
    }
    return { part: realEstateTheoryParts[0], chapter: realEstateTheoryParts[0].chapters[0] }
  }, [selectedId])

  return (
    <main className="public-law-page real-estate-theory-page" id="main-content">
      <div className="public-law-topline">
        <button className="back-button" type="button" onClick={onBack}>← 전체 과목</button>
        <span>공인중개사 1차 · 부동산학개론</span>
      </div>

      <section className="public-law-hero theory-hero">
        <div>
          <span className="eyebrow">REAL ESTATE PRINCIPLES · 2026</span>
          <h1>부동산학개론 핵심정리</h1>
          <p>공법과 동일하게 대단원 → 장 → 세부항목의 3단계 목차로 구성했습니다. 현재 단계에서는 전체 학습 지도를 먼저 확정하고, 각 장의 본문은 이 구조 위에 순차적으로 채웁니다.</p>
        </div>
        <div className="public-law-hero__badges" aria-label="부동산학개론 목차 구성">
          <span>8개 대단원</span>
          <span>{realEstateTheoryChapterCount}개 장</span>
          <span>선택한 장만 표시</span>
          <span>연결 학습은 다음 단계</span>
        </div>
      </section>

      <div className="public-law-layout theory-layout">
        <aside className="public-law-nav theory-nav" aria-label="부동산학개론 목차">
          <div className="public-law-nav__title">
            <strong>부동산학개론</strong>
            <span>8개 대단원 · {realEstateTheoryChapterCount}개 장</span>
          </div>

          {realEstateTheoryParts.map((part) => (
            <details key={part.id} open={part.chapters.some((chapter) => chapter.id === selectedId)}>
              <summary>
                <i style={{ background: part.color }} />
                <span>{part.number} {part.title}</span>
              </summary>
              <ul>
                {part.chapters.map((chapter) => (
                  <li key={chapter.id}>
                    <button
                      type="button"
                      className={selectedId === chapter.id ? 'active' : ''}
                      onClick={() => setSelectedId(chapter.id)}
                    >
                      <span>{chapter.number} · {chapter.title}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </details>
          ))}
        </aside>

        <article className="public-law-content theory-content">
          <div className="public-law-breadcrumb">
            제{Number(selected.part.number)}편 {selected.part.title} <span>›</span> 제{Number(selected.chapter.number)}장 {selected.chapter.title}
          </div>

          <header className="study-section-heading theory-section-heading" style={{ '--chapter-color': selected.part.color }}>
            <div>
              <span className="study-section-heading__number">{selected.chapter.number}</span>
              <div>
                <span className="study-section-heading__chapter">제{Number(selected.part.number)}편 · {selected.part.title}</span>
                <h2>{selected.chapter.title}</h2>
              </div>
            </div>
            <span className="law-reference">목차 구축 완료 · 본문 확장 예정</span>
          </header>

          <section className="theory-toc-intro">
            <span>TABLE OF CONTENTS</span>
            <strong>이 장에서 공부할 세부 목차</strong>
            <p>아래 항목을 기준으로 핵심정리·비교표·계산문제·함정 선지·암기 포인트를 차례대로 추가합니다.</p>
          </section>

          <section className="theory-section-list" aria-label={`${selected.chapter.title} 세부 목차`}>
            {selected.chapter.sections.map((section, index) => (
              <article className="theory-section-card" key={`${selected.chapter.id}-${section.title}`}>
                <div className="theory-section-card__head">
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <h3>{section.title}</h3>
                </div>
                {section.items.length > 0 ? (
                  <ol className="theory-topic-list">
                    {section.items.map((item) => <li key={item}>{item}</li>)}
                  </ol>
                ) : (
                  <p className="theory-topic-empty">세부 항목은 본문 정리 단계에서 확장합니다.</p>
                )}
              </article>
            ))}
          </section>

          <section className="theory-next-step" aria-label="다음 구축 단계">
            <div>
              <span>NEXT STEP</span>
              <strong>목차를 기준으로 본문을 채웁니다.</strong>
            </div>
            <p>연결 목차 표시는 다음 단계에서 별도로 추가하고, 지금은 전체 목차 구조를 고정한 상태입니다.</p>
          </section>
        </article>
      </div>
    </main>
  )
}
