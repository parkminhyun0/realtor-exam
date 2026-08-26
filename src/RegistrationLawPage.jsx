import { useMemo, useState } from 'react'
import { landCategories, registrationLawContent, registrationLawParts } from './data/registrationLaw'

export default function RegistrationLawPage({ onBack }) {
  const [selectedId, setSelectedId] = useState('p1s1')

  const selected = useMemo(() => {
    for (const part of registrationLawParts) {
      const point = part.points.find((item) => item.id === selectedId)
      if (point) return { part, point }
    }
    return { part: registrationLawParts[0], point: registrationLawParts[0].points[0] }
  }, [selectedId])

  return (
    <main className="public-law-page" id="main-content">
      <div className="public-law-topline">
        <button className="back-button" type="button" onClick={onBack}>← 전체 과목</button>
        <span>공인중개사 2차 · 부동산공시법</span>
      </div>

      <section className="public-law-hero">
        <div>
          <span className="eyebrow">REGISTRATION & CADASTRE · 2026</span>
          <h1>부동산공시법 핵심정리</h1>
          <p>공간정보의 구축 및 관리 등에 관한 법률과 부동산등기법을 공법과 동일한 학습 구조로 정리합니다.</p>
        </div>
        <div className="public-law-hero__badges">
          <span>2개 PART</span>
          <span>9개 POINT</span>
          <span>선택한 POINT만 표시</span>
        </div>
      </section>

      <div className="public-law-layout">
        <aside className="public-law-nav" aria-label="부동산공시법 목차">
          <div className="public-law-nav__title">
            <strong>부동산공시법</strong>
            <span>교재 목차 그대로 · PART 1~2</span>
          </div>
          {registrationLawParts.map((part) => (
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
                      {point.ready ? <b>공개</b> : <small>편입 중</small>}
                    </button>
                  </li>
                ))}
              </ul>
            </details>
          ))}
        </aside>

        <article className="public-law-content">
          <div className="public-law-breadcrumb">
            PART {selected.part.number} {selected.part.title} <span>›</span> POINT {selected.point.number} · {selected.point.title}
          </div>
          {selected.point.ready
            ? <StudyPoint part={selected.part} point={selected.point} content={registrationLawContent[selected.point.id]} />
            : <ImportingSection part={selected.part} point={selected.point} />}
        </article>
      </div>
    </main>
  )
}

function StudyPoint({ part, point, content }) {
  return (
    <>
      <header className="study-section-heading" style={{ '--chapter-color': part.color }}>
        <div>
          <span className="study-section-heading__number">{point.number}</span>
          <div>
            <span className="study-section-heading__chapter">PART {part.number} · {part.title}</span>
            <h2>{content.heading}</h2>
          </div>
        </div>
        <span className="law-reference">{part.lawVersion}</span>
      </header>

      <div className="study-tldr">
        <span>📌 핵심 한줄</span>
        <strong>{content.headline}</strong>
        <p>{content.summary}</p>
      </div>

      <section className="study-block">
        <div className="study-block__title"><span>01</span><h3>이 POINT를 먼저 이해하기</h3></div>
        <div className="understanding-grid">
          {content.understanding.map(([title, body]) => <div key={title}><b>{title}</b><p>{body}</p></div>)}
        </div>
      </section>

      <section className="study-block">
        <div className="study-block__title"><span>02</span><h3>전체 흐름</h3></div>
        <div className="hierarchy-flow" aria-label={`${content.heading} 흐름`}>
          {content.flow.map((item, index) => (
            <div className="hierarchy-flow__group" key={item}>
              <div className="hierarchy-flow__step"><small>STEP {index + 1}</small><strong>{item}</strong></div>
              {index < content.flow.length - 1 && <span className="hierarchy-flow__arrow">→</span>}
            </div>
          ))}
        </div>
      </section>

      <section className="study-block">
        <div className="study-block__title"><span>03</span><h3>핵심정리·비교표</h3></div>
        <div className="table-wrap">
          <table className="study-table">
            <thead><tr><th>구분</th><th>핵심 내용</th><th>근거·시험 포인트</th></tr></thead>
            <tbody>
              {content.rows.map(([term, definition, pointText]) => (
                <tr key={term}><th>{term}</th><td>{definition}</td><td>{pointText}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {content.extra === 'landCategories' && (
        <section className="study-block">
          <div className="study-block__title"><span>04</span><h3>지목 28종</h3></div>
          <div className="system-note__items" aria-label="법정 지목 28종">
            {landCategories.map((category) => <span key={category}>{category}</span>)}
          </div>
          <div className="study-note">📍 법정 지목은 총 <b>28종</b>입니다.</div>
        </section>
      )}

      <section className="study-block study-block--split">
        <div className="trap-card">
          <span>⚠️ 함정 선지</span>
          <ul>{content.traps.map((trap) => <li key={trap}>{trap}</li>)}</ul>
        </div>
        <div className="memory-card">
          <span>🧠 암기</span>
          <strong>{content.memory[0]}</strong>
          <p>{content.memory[1]}</p>
        </div>
      </section>

      <section className="study-block">
        <div className="study-block__title"><span>05</span><h3>확인문제</h3></div>
        <div className="understanding-grid">
          {content.quiz.map(([question, answer]) => <div key={question}><b>{question}</b><p>{answer}</p></div>)}
        </div>
      </section>

      <section className="source-note">
        <b>법령 대조 기준</b>
        <p>{part.lawVersion} · {content.source}. 국가법령정보센터 법령 원문을 기준으로 정리했습니다.</p>
      </section>
    </>
  )
}

function ImportingSection({ part, point }) {
  return (
    <section className="importing-section" style={{ '--chapter-color': part.color }}>
      <span className="importing-section__label">CONTENT MIGRATION · PART {part.number}</span>
      <h2>POINT {point.number} · {point.title}</h2>
      <p><b>{part.title}</b>의 해당 POINT를 현행법령과 대조하여 편입합니다.</p>
    </section>
  )
}
