import { useMemo, useState } from 'react'
import LawTextViewer from './LawTextViewer'
import { taxLawParts, taxLawPointCount } from './data/taxLaw'
import { taxLawContent } from './data/taxLawContent'
import './civil-law.css'
import './tax-law.css'

const TAX_KEYWORD_PATTERN = /(장기보유특별공제|공정시장가액비율|제2차 납세의무|인별·전국합산|부동산에 관한 권리|사실상취득가격|조세법률주의|조세평등주의|종합부동산세|등록면허세|양도소득세|과세기준일|조세우선권|법정기일|연대납세의무|사실상 취득|간주취득|과점주주|시가인정액|신고납부|보통징수|종합합산|별도합산|분리과세|종합소득|분류과세|사업소득|필요경비|양도차익|1세대 1주택|대금청산일|예정신고|확정신고|납세의무|성립|확정|소멸|재산세|취득세|소득세|국세|지방세|보통세|목적세|직접세|간접세|지방교육세|지역자원시설세|교육세|농어촌특별세|소득과세|소비과세|재산과세|유통과세|취득단계|보유단계|양도단계|등기·등록단계|제\s*\d+\s*조(?:의\s*\d+)?|\d+(?:[.,]\d+)*(?:\s*(?:개|종|일|년|월|%|㎡|m²|억원|만원))?)/g
const NUMBER_LIKE_PATTERN = /^(?:제\s*\d+\s*조|\d|①|②|③|④|⑤|⑥|⑦|⑧|⑨|⑩)/

export default function TaxLawPage({ onBack }) {
  const [selectedId, setSelectedId] = useState('p1s1')
  const [lawTarget, setLawTarget] = useState(null)

  const selected = useMemo(() => {
    for (const part of taxLawParts) {
      const point = part.points.find((item) => item.id === selectedId)
      if (point) return { part, point }
    }
    return { part: taxLawParts[0], point: taxLawParts[0].points[0] }
  }, [selectedId])

  const content = taxLawContent[selected.point.id]
  const selectPoint = (id) => {
    setLawTarget(null)
    setSelectedId(id)
  }
  const openLaw = (lawName, article) => {
    setLawTarget({ subjectId: 'tax-law', lawName, article })
  }

  return (
    <>
      <main className="public-law-page civil-law-page tax-law-page" id="main-content">
        <div className="public-law-topline">
          <button className="back-button" type="button" onClick={onBack}>← 전체 과목</button>
          <span>공인중개사 2차 · 부동산세법</span>
        </div>

        <section className="public-law-hero tax-law-hero">
          <div>
            <span className="eyebrow">REAL ESTATE TAX LAW · 2026</span>
            <h1>부동산세법 핵심정리</h1>
            <p>공법과 동일한 핵심 한줄 · 상세 이해 · 비교표 · 함정 · 암기 · 확인문제 구조로 정리하고, 관련 조세 법령은 조문별 텍스트 팝업으로 바로 확인합니다.</p>
          </div>
          <div className="public-law-hero__badges">
            <span>3개 PART</span>
            <span>{taxLawPointCount}개 POINT</span>
            <span>시험형 상세정리</span>
            <span>조문 TEXT POPUP</span>
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
                        {taxLawContent[point.id]
                          ? <b className="civil-nav__ready">공개</b>
                          : <b className="civil-nav__ready civil-nav__ready--outline">목차</b>}
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
              <span className="law-reference">
                {content ? '근거법령 · 현행 조문' : '상세 목차 공개'}
              </span>
            </header>

            {content
              ? <TaxStudyPoint part={selected.part} point={selected.point} content={content} onOpenLaw={openLaw} />
              : <TaxOutlineContent part={selected.part} point={selected.point} />}

            <TaxPartMap part={selected.part} selectedId={selectedId} onSelectPoint={selectPoint} />
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

function HighlightTaxText({ children }) {
  if (typeof children !== 'string') return children
  const pieces = children.split(TAX_KEYWORD_PATTERN)
  return pieces.map((piece, index) => {
    if (!piece) return null
    if (index % 2 === 0) return piece
    if (NUMBER_LIKE_PATTERN.test(piece)) {
      return <span className="tax-exam-number" key={`${piece}-${index}`}>{piece}</span>
    }
    return <mark className="tax-exam-keyword" key={`${piece}-${index}`}>{piece}</mark>
  })
}

function TaxLawButtons({ references = [], onOpenLaw, compact = false }) {
  const buttons = references.flatMap((reference) => (
    (reference.articles || []).map((article) => ({ lawName: reference.lawName, article }))
  ))
  if (!buttons.length) return null

  return (
    <div className={`tax-law-articles${compact ? ' tax-law-articles--compact' : ''}`} aria-label="관련 조세 법령">
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

function TaxStudyPoint({ part, point, content, onOpenLaw }) {
  return (
    <>
      <div className="study-tldr tax-study-tldr">
        <span>📌 핵심 한줄</span>
        <strong><HighlightTaxText>{content.headline}</HighlightTaxText></strong>
        <p><HighlightTaxText>{content.summary}</HighlightTaxText></p>
      </div>

      <section className="study-block tax-exam-core" aria-label="시험 핵심">
        <div className="tax-exam-core__heading">
          <span>EXAM CORE</span>
          <div>
            <h3>⭐ POINT {point.number}에서 먼저 잡아야 할 핵심</h3>
            <p>{point.title}에서 먼저 체크할 빈출 기준과 숫자입니다.</p>
          </div>
        </div>
        <div className="tax-exam-core__grid">
          {content.examCore.map(([label, text], index) => (
            <article key={label}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <div>
                <strong><HighlightTaxText>{label}</HighlightTaxText></strong>
                <p><HighlightTaxText>{text}</HighlightTaxText></p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="study-block tax-legal-basis">
        <div className="study-block__title"><span>법령</span><h3>현행 조세 법령 바로보기</h3></div>
        <p className="tax-legal-basis__intro">빨간 밑줄 조문 버튼을 누르면 공법과 동일하게 해당 조문만 작은 텍스트 팝업으로 확인할 수 있습니다.</p>
        <div className="tax-legal-basis__grid">
          {content.legalBases.map((reference) => (
            <article key={reference.lawName}>
              <strong>{reference.lawName}</strong>
              <p>{reference.note}</p>
              <TaxLawButtons references={[reference]} onOpenLaw={onOpenLaw} />
            </article>
          ))}
        </div>
      </section>

      <section className="study-block">
        <div className="study-block__title"><span>01</span><h3>이 POINT를 먼저 이해하기</h3></div>
        <div className="understanding-grid">
          {content.understanding.map(([title, body]) => (
            <div key={title}>
              <b><HighlightTaxText>{title}</HighlightTaxText></b>
              <p><HighlightTaxText>{body}</HighlightTaxText></p>
            </div>
          ))}
        </div>
      </section>

      <section className="study-block">
        <div className="study-block__title"><span>02</span><h3>문제 풀이 전체 흐름</h3></div>
        <div className="hierarchy-flow tax-classification-flow" aria-label="조세 분류 판단 순서">
          {content.flow.map((item, index) => (
            <div className="hierarchy-flow__group" key={item}>
              <div className="hierarchy-flow__step">
                <small>STEP {index + 1}</small>
                <strong><HighlightTaxText>{item}</HighlightTaxText></strong>
              </div>
              {index < content.flow.length - 1 && <span className="hierarchy-flow__arrow">→</span>}
            </div>
          ))}
        </div>
      </section>

      {content.sections.map((section) => (
        <section className="study-block tax-detail-section" key={section.number}>
          <div className="tax-detail-section__head">
            <div>
              <span>{section.number}</span>
              <h3>{section.title}</h3>
            </div>
            <TaxLawButtons references={section.articles} onOpenLaw={onOpenLaw} compact />
          </div>
          <div className="table-wrap">
            <table className="study-table tax-study-table">
              <thead><tr><th>구분</th><th>핵심 내용</th><th>시험 포인트</th></tr></thead>
              <tbody>
                {section.rows.map(([term, definition, exam]) => (
                  <tr key={term}>
                    <th><HighlightTaxText>{term}</HighlightTaxText></th>
                    <td><HighlightTaxText>{definition}</HighlightTaxText></td>
                    <td><HighlightTaxText>{exam}</HighlightTaxText></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}

      <section className="study-block study-block--split tax-trap-memory">
        <div className="trap-card">
          <span>⚠️ 함정 선지</span>
          <ul>
            {content.traps.map((trap) => <li key={trap}><HighlightTaxText>{trap}</HighlightTaxText></li>)}
          </ul>
        </div>
        <div className="memory-card">
          <span>🧠 암기</span>
          <strong><HighlightTaxText>{content.memory[0]}</HighlightTaxText></strong>
          <p><HighlightTaxText>{content.memory[1]}</HighlightTaxText></p>
        </div>
      </section>

      <section className="study-block tax-ox-panel">
        <div className="study-block__title"><span>OX</span><h3>시험형 OX 체크</h3></div>
        <div className="tax-ox-grid">
          {content.ox.map(([question, answer], index) => (
            <article key={question}>
              <span>{index + 1}</span>
              <div>
                <b><HighlightTaxText>{question}</HighlightTaxText></b>
                <p><HighlightTaxText>{answer}</HighlightTaxText></p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="study-block tax-quiz-panel">
        <div className="study-block__title"><span>Q</span><h3>확인문제</h3></div>
        <div className="tax-quiz-list">
          {content.quiz.map((quiz, quizIndex) => (
            <details key={quiz.question}>
              <summary><b>Q{quizIndex + 1}.</b> <HighlightTaxText>{quiz.question}</HighlightTaxText></summary>
              <ul>{quiz.options.map((option) => <li key={option}><HighlightTaxText>{option}</HighlightTaxText></li>)}</ul>
              <div className="tax-quiz-answer">
                <strong>정답 · <HighlightTaxText>{quiz.answer}</HighlightTaxText></strong>
                <p><HighlightTaxText>{quiz.explanation}</HighlightTaxText></p>
              </div>
            </details>
          ))}
        </div>
      </section>

      <section className="source-note tax-source-note">
        <b>법령 대조 기준</b>
        <p><HighlightTaxText>{content.lawVersion}</HighlightTaxText></p>
        <p><HighlightTaxText>{content.source}</HighlightTaxText></p>
        <TaxLawButtons references={content.legalBases} onOpenLaw={onOpenLaw} />
      </section>
    </>
  )
}

function TaxOutlineContent({ part, point }) {
  return (
    <>
      <section className="civil-outline-intro tax-outline-intro">
        <span>부동산세법 4단계 학습 구조</span>
        <strong>{point.title}</strong>
        <p>목차는 확정되어 있습니다. POINT 01부터 순서대로 현행 법령, 시험 핵심 숫자, 비교표, 계산 흐름, 함정 선지와 확인문제를 공법과 동일한 형식으로 채웁니다.</p>
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
            <span>{taxLawContent[point.id] ? '상세정리 공개' : `${point.groups.length}개 중분류`}</span>
          </button>
        ))}
      </div>
    </section>
  )
}
