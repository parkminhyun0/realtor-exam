import { useMemo, useState } from 'react'
import LawTextViewer from './LawTextViewer'
import {
  brokerageLawContent,
  brokerageLawParts,
  brokerageLawPointCount,
  brokerageLawSource,
} from './data/brokerageLaw'
import './brokerage-law.css'

const NUMBER_TOKEN = /^(5배|5년|3년|10일|3개월|6개월|300만원|1년|2년|45시간|30일)$/
const NUMBER_SPLIT = /(5배|5년|3년|10일|3개월|6개월|300만원|1년|2년|45시간|30일)/g

function Highlight({ children }) {
  if (typeof children !== 'string') return children
  return children.split(NUMBER_SPLIT).map((piece, index) => (
    NUMBER_TOKEN.test(piece)
      ? <span className="brokerage-exam-number" key={`${piece}-${index}`}>{piece}</span>
      : piece
  ))
}

function LawButtons({ references = [], onOpenLaw, compact = false }) {
  const buttons = references.flatMap((reference) => (
    (reference.articles || []).map((article) => ({ lawName: reference.lawName, article }))
  ))
  if (!buttons.length) return null

  return (
    <div className={`brokerage-law-articles${compact ? ' brokerage-law-articles--compact' : ''}`} aria-label="관련 법령">
      {!compact && <span>법령 원문</span>}
      {buttons.map(({ lawName, article }) => (
        <button
          key={`${lawName}-${article}`}
          type="button"
          onClick={() => onOpenLaw(lawName, article)}
          title={`${lawName} ${article} 본문 보기`}
        >
          {lawName} {article}
        </button>
      ))}
    </div>
  )
}

function BrokerageStudyPoint({ point, content, onOpenLaw }) {
  return (
    <>
      <div className="study-tldr brokerage-study-tldr">
        <span>📌 핵심 한줄</span>
        <strong><Highlight>{content.headline}</Highlight></strong>
        <p><Highlight>{content.summary}</Highlight></p>
      </div>

      <section className="study-block brokerage-exam-core" aria-label="시험 핵심">
        <div className="brokerage-exam-core__heading">
          <span>EXAM CORE</span>
          <div>
            <h3>⭐ POINT {point.number}에서 먼저 잡아야 할 핵심</h3>
            <p>공인중개사법의 주체·행위·절차·기한·제재를 기준으로 선지의 바꿔치기를 확인합니다.</p>
          </div>
        </div>
        <div className="brokerage-exam-core__grid">
          {content.examCore.map(([label, text], index) => (
            <article key={label}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <div><strong>{label}</strong><p><Highlight>{text}</Highlight></p></div>
            </article>
          ))}
        </div>
      </section>

      <section className="study-block brokerage-legal-basis">
        <div className="study-block__title"><span>법령</span><h3>제37회 시험 기준 법령 바로보기</h3></div>
        <p className="brokerage-legal-basis__intro">중개사법 학습에 필요한 해당 조문만 팝업으로 확인합니다.</p>
        <div className="brokerage-legal-basis__grid">
          {content.legalBases.map((reference) => (
            <article key={`${reference.lawName}-${reference.articles.join('-')}`}>
              <strong>{reference.lawName}</strong>
              <p>{reference.note}</p>
              <LawButtons references={[reference]} onOpenLaw={onOpenLaw} />
            </article>
          ))}
        </div>
      </section>

      <section className="study-block brokerage-detail-section">
        <div className="brokerage-detail-section__head">
          <div><span>01</span><h3>조문 구조와 시험 포인트</h3></div>
          <LawButtons references={content.legalBases} onOpenLaw={onOpenLaw} compact />
        </div>
        <div className="table-wrap">
          <table className="study-table brokerage-study-table">
            <thead><tr><th>구분</th><th>핵심 내용</th><th>시험 포인트</th></tr></thead>
            <tbody>
              {content.rows.map(([term, definition, exam]) => (
                <tr key={term}><th><Highlight>{term}</Highlight></th><td><Highlight>{definition}</Highlight></td><td><Highlight>{exam}</Highlight></td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="study-block study-block--split brokerage-trap-memory">
        <div className="trap-card">
          <span>⚠️ 시험에서 자주 바꿔 출제하는 부분</span>
          <ul>{content.traps.map((trap) => <li key={trap}><Highlight>{trap}</Highlight></li>)}</ul>
        </div>
        <div className="memory-card">
          <span>🧠 암기</span>
          <strong><Highlight>{content.memory[0]}</Highlight></strong>
          <p><Highlight>{content.memory[1]}</Highlight></p>
        </div>
      </section>

      <section className="study-block brokerage-ox-panel">
        <div className="study-block__title"><span>OX</span><h3>시험형 OX 체크</h3></div>
        <div className="brokerage-ox-grid">
          {content.ox.map(([question, answer], index) => (
            <article key={question}><span>{index + 1}</span><div><b><Highlight>{question}</Highlight></b><p><Highlight>{answer}</Highlight></p></div></article>
          ))}
        </div>
      </section>
    </>
  )
}

function BrokerageOutline({ point }) {
  return (
    <>
      <div className="study-tldr brokerage-study-tldr">
        <span>📚 다음 상세화 대상</span>
        <strong>{point.title}</strong>
        <p>공인중개사법령 및 중개실무 범위만 유지한 채 제37회 기준 조문·숫자·함정·OX를 순차적으로 채웁니다.</p>
      </div>
      <section className="study-block">
        <div className="study-block__title"><span>TOC</span><h3>이 POINT의 세부 논점</h3></div>
        <div className="understanding-grid">
          {point.topics.map((topic, index) => (
            <div key={topic}>
              <b>{String(index + 1).padStart(2, '0')} · {topic}</b>
              <p>제36회 기출 논점과 공인중개사법령 체계를 연결한 상세화 대기 항목입니다.</p>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}

export default function BrokerageLawPage({ onBack }) {
  const [selectedId, setSelectedId] = useState('b1s1')
  const [lawTarget, setLawTarget] = useState(null)

  const selected = useMemo(() => {
    for (const part of brokerageLawParts) {
      const point = part.points.find((item) => item.id === selectedId)
      if (point) return { part, point }
    }
    return { part: brokerageLawParts[0], point: brokerageLawParts[0].points[0] }
  }, [selectedId])

  const content = brokerageLawContent[selected.point.id]
  const readyCount = Object.keys(brokerageLawContent).length
  const selectPoint = (id) => {
    setLawTarget(null)
    setSelectedId(id)
  }
  const openLaw = (lawName, article) => setLawTarget({ subjectId: 'brokerage-law', lawName, article })

  return (
    <>
      <main className="public-law-page brokerage-law-page" id="main-content" data-subject-page="brokerage-law">
        <div className="public-law-topline">
          <button className="back-button" type="button" onClick={onBack}>← 전체 과목</button>
          <span>공인중개사 2차 · 공인중개사법령 및 중개실무</span>
        </div>

        <section className="public-law-hero brokerage-law-hero">
          <div>
            <span className="eyebrow">BROKERAGE LAW · 제37회 기준</span>
            <h1>공인중개사법령 및 중개실무 핵심정리</h1>
            <p>공인중개사법 조문을 중심으로 등록·중개업무·확인설명·보수·제재·거래신고·중개실무를 시험형으로 정리합니다.</p>
          </div>
          <div className="public-law-hero__badges">
            <span>{brokerageLawParts.length}개 PART</span>
            <span>{brokerageLawPointCount}개 POINT</span>
            <span>상세 본문 {readyCount}개 공개</span>
            <span>중개사법 전용 페이지</span>
          </div>
        </section>

        <section className="study-guide" aria-label="법령 기준">
          <span className="study-guide__label">LAW-FIRST</span>
          <strong>{brokerageLawSource.version}</strong>
          <span>{brokerageLawSource.examRule} · 공인중개사법령 및 중개실무 범위만 표시합니다.</span>
        </section>

        <div className="public-law-layout" data-mobile-toc-layout>
          <aside className="public-law-nav brokerage-law-nav" aria-label="공인중개사법 목차" data-mobile-toc>
            <div className="public-law-nav__title"><strong>중개사법</strong><span>PART → POINT → 세부 논점</span></div>
            {brokerageLawParts.map((part) => (
              <details key={part.id} open={part.points.some((item) => item.id === selectedId)}>
                <summary><i style={{ background: part.color }} /><span>PART {part.number} {part.title}</span></summary>
                <ul>
                  {part.points.map((point) => (
                    <li key={point.id}>
                      <button type="button" className={selectedId === point.id ? 'active' : ''} onClick={() => selectPoint(point.id)}>
                        <span>POINT {point.number} · {point.title}</span>
                        {brokerageLawContent[point.id]
                          ? <b className="brokerage-nav__status">공개</b>
                          : <b className="brokerage-nav__status brokerage-nav__status--outline">목차</b>}
                      </button>
                    </li>
                  ))}
                </ul>
              </details>
            ))}
          </aside>

          <article className="public-law-content" data-mobile-toc-content>
            <div className="public-law-breadcrumb">PART {selected.part.number} {selected.part.title} <span>›</span> POINT {selected.point.number} · {selected.point.title}</div>
            <header className="study-section-heading" style={{ '--chapter-color': selected.part.color }}>
              <div>
                <span className="study-section-heading__number">{selected.point.number}</span>
                <div><span className="study-section-heading__chapter">PART {selected.part.number} · {selected.part.title}</span><h2>{selected.point.title}</h2></div>
              </div>
              <span className="law-reference">{content ? '근거법령 · 제37회 기준 조문' : '상세 목차 공개'}</span>
            </header>

            {content
              ? <BrokerageStudyPoint point={selected.point} content={content} onOpenLaw={openLaw} />
              : <BrokerageOutline point={selected.point} />}
          </article>
        </div>
      </main>

      <LawTextViewer open={Boolean(lawTarget)} target={lawTarget} onClose={() => setLawTarget(null)} />
    </>
  )
}
