import { useMemo, useState } from 'react'
import { taxLawParts, taxLawPointCount } from './data/taxLaw'
import './civil-law.css'
import './tax-law.css'

export default function TaxLawPage({ onBack }) {
  const [selectedId, setSelectedId] = useState('p1s1')

  const selected = useMemo(() => {
    for (const part of taxLawParts) {
      const point = part.points.find((item) => item.id === selectedId)
      if (point) return { part, point }
    }
    return { part: taxLawParts[0], point: taxLawParts[0].points[0] }
  }, [selectedId])

  const selectPoint = (id) => setSelectedId(id)

  return (
    <main className="public-law-page civil-law-page tax-law-page" id="main-content">
      <div className="public-law-topline">
        <button className="back-button" type="button" onClick={onBack}>← 전체 과목</button>
        <span>공인중개사 2차 · 부동산세법</span>
      </div>

      <section className="public-law-hero tax-law-hero">
        <div>
          <span className="eyebrow">REAL ESTATE TAX LAW · 2026</span>
          <h1>부동산세법 핵심정리</h1>
          <p>교재의 PART 1 조세총론 · PART 2 지방세 · PART 3 국세 구조를 유지하면서, 시험 학습용으로 카테고리 → 대분류 → 중분류 → 소분류까지 세분화한 목차입니다.</p>
        </div>
        <div className="public-law-hero__badges">
          <span>3개 PART</span>
          <span>{taxLawPointCount}개 POINT</span>
          <span>4단계 목차</span>
          <span>2026 시험 기준</span>
        </div>
      </section>

      <div className="public-law-layout" data-mobile-toc-layout>
        <aside className="public-law-nav" aria-label="부동산세법 목차" data-mobile-toc>
          <div className="public-law-nav__title">
            <strong>부동산세법</strong>
            <span>카테고리 → 대분류 → 중분류 → 소분류</span>
          </div>
          {taxLawParts.map((part) => (
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
                      onClick={() => selectPoint(point.id)}
                    >
                      <span>POINT {point.number} · {point.title}</span>
                      <b className="civil-nav__ready">목차</b>
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
            <span className="law-reference">상세 목차 공개</span>
          </header>

          <TaxOutlineContent part={selected.part} point={selected.point} />
          <TaxPartMap part={selected.part} selectedId={selectedId} onSelectPoint={selectPoint} />
        </article>
      </div>
    </main>
  )
}

function TaxOutlineContent({ part, point }) {
  return (
    <>
      <section className="civil-outline-intro tax-outline-intro">
        <span>부동산세법 4단계 학습 구조</span>
        <strong>{point.title}</strong>
        <p>현재 단계에서는 목차를 먼저 확정합니다. 이후 각 소분류에 현행 법령, 시험 핵심 숫자, 비교표, 계산 흐름, 함정 선지와 확인문제를 같은 구조로 채웁니다.</p>
      </section>

      <section className="study-block tax-hierarchy-block" aria-label="목차 단계 안내">
        <div className="study-block__title"><span>MAP</span><h3>목차 단계</h3></div>
        <div className="tax-hierarchy-flow">
          <div><small>카테고리</small><strong>PART {part.number} {part.title}</strong></div>
          <span aria-hidden="true">→</span>
          <div><small>대분류</small><strong>POINT {point.number} {point.title}</strong></div>
          <span aria-hidden="true">→</span>
          <div><small>중분류</small><strong>{point.groups.length}개 주제</strong></div>
          <span aria-hidden="true">→</span>
          <div><small>소분류</small><strong>{point.groups.reduce((sum, group) => sum + group.topics.length, 0)}개 항목</strong></div>
        </div>
      </section>

      <section className="study-block tax-outline-block">
        <div className="study-block__title"><span>TOC</span><h3>중분류 · 소분류 상세 목차</h3></div>
        <div className="tax-outline-groups">
          {point.groups.map((group, groupIndex) => (
            <article className="tax-outline-group" key={group.title}>
              <header>
                <span>중분류 {String(groupIndex + 1).padStart(2, '0')}</span>
                <h4>{group.title}</h4>
              </header>
              <ol>
                {group.topics.map((topic, topicIndex) => (
                  <li key={topic}>
                    <span>{String(topicIndex + 1).padStart(2, '0')}</span>
                    <strong>{topic}</strong>
                  </li>
                ))}
              </ol>
            </article>
          ))}
        </div>
      </section>
    </>
  )
}

function TaxPartMap({ part, selectedId, onSelectPoint }) {
  return (
    <section className="study-block civil-part-map tax-part-map">
      <div className="study-block__title"><span>PART</span><h3>PART {part.number} {part.title} 전체 흐름</h3></div>
      <div className="civil-part-map__items">
        {part.points.map((point) => (
          <button
            key={point.id}
            type="button"
            className={point.id === selectedId ? 'active' : ''}
            onClick={() => onSelectPoint(point.id)}
          >
            <small>POINT {point.number}</small>
            <strong>{point.title}</strong>
            <span>{point.groups.length}개 중분류</span>
          </button>
        ))}
      </div>
    </section>
  )
}
