import { useMemo, useState } from 'react'
import { civilLawParts, civilLawPointCount } from './data/civilLaw'
import './civil-law.css'

export default function CivilLawPage({ onBack }) {
  const [selectedId, setSelectedId] = useState('p1s1')

  const selected = useMemo(() => {
    for (const part of civilLawParts) {
      const point = part.points.find((item) => item.id === selectedId)
      if (point) return { part, point }
    }
    return { part: civilLawParts[0], point: civilLawParts[0].points[0] }
  }, [selectedId])

  return (
    <main className="public-law-page civil-law-page" id="main-content">
      <div className="public-law-topline">
        <button className="back-button" type="button" onClick={onBack}>← 전체 과목</button>
        <span>공인중개사 1차 · 민법 및 민사특별법</span>
      </div>

      <section className="public-law-hero civil-law-hero">
        <div>
          <span className="eyebrow">CIVIL LAW · 2026</span>
          <h1>민법 및 민사특별법</h1>
          <p>교재의 기본 목차를 그대로 유지하고, 민법의 쟁점 구조를 따라 세부 목차를 더 촘촘하게 펼쳤습니다.</p>
        </div>
        <div className="public-law-hero__badges">
          <span>4개 PART</span>
          <span>{civilLawPointCount}개 POINT</span>
          <span>교재 기본 틀 유지</span>
          <span>세부 목차 확장</span>
        </div>
      </section>

      <div className="public-law-layout" data-mobile-toc-layout>
        <aside className="public-law-nav" aria-label="민법 및 민사특별법 목차" data-mobile-toc>
          <div className="public-law-nav__title">
            <strong>민법 및 민사특별법</strong>
            <span>PART → POINT → 세부목차</span>
          </div>
          {civilLawParts.map((part) => (
            <details key={part.id} open={part.points.some((item) => item.id === selectedId)}>
              <summary>
                <i style={{ background: part.color }} />
                <span>PART {part.number} {part.title}</span>
              </summary>
              <ul>
                {part.points.map((point) => (
                  <li key={point.id}>
                    <button
                      type="button"
                      className={selectedId === point.id ? 'active' : ''}
                      onClick={() => setSelectedId(point.id)}
                    >
                      <span>POINT {point.number} · {point.title}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </details>
          ))}
        </aside>

        <article className="public-law-content" data-mobile-toc-content>
          <div className="public-law-breadcrumb">
            PART {selected.part.number} {selected.part.title} <span>›</span> POINT {selected.point.number} · {selected.point.title}
          </div>

          <header className="study-section-heading" style={{ '--chapter-color': selected.part.color }}>
            <div>
              <span className="study-section-heading__number">{selected.point.number}</span>
              <div>
                <span className="study-section-heading__chapter">PART {selected.part.number} · {selected.part.title}</span>
                <h2>{selected.point.title}</h2>
              </div>
            </div>
            <span className="law-reference">공인중개사 시험범위 목차</span>
          </header>

          <section className="civil-outline-intro">
            <span>목차 구성</span>
            <strong>{selected.point.title}의 세부 학습 항목</strong>
            <p>현재 단계에서는 목차를 먼저 고정합니다. 이후 각 항목에 핵심원칙·요건·효과·제3자·판례·시험함정·비교·관련 조문을 순차적으로 채웁니다.</p>
          </section>

          <section className="study-block civil-outline-block">
            <div className="study-block__title"><span>TOC</span><h3>세부 목차</h3></div>
            <ol className="civil-outline-list">
              {selected.point.topics.map((topic, index) => (
                <li key={topic}>
                  <span className="civil-outline-list__number">{String(index + 1).padStart(2, '0')}</span>
                  <strong>{topic}</strong>
                </li>
              ))}
            </ol>
          </section>

          <section className="study-block civil-part-map">
            <div className="study-block__title"><span>MAP</span><h3>PART {selected.part.number} 전체 흐름</h3></div>
            <div className="civil-part-map__items">
              {selected.part.points.map((point) => (
                <button
                  key={point.id}
                  type="button"
                  className={point.id === selectedId ? 'active' : ''}
                  onClick={() => setSelectedId(point.id)}
                >
                  <small>POINT {point.number}</small>
                  <strong>{point.title}</strong>
                </button>
              ))}
            </div>
          </section>
        </article>
      </div>
    </main>
  )
}
