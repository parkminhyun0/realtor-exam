import { useMemo, useState } from 'react'
import { landCategories, registrationLawContent, registrationLawParts } from './data/registrationLaw'
import { registrationLawDeepDive } from './data/registrationLawDeepDive'
import { registrationLawExamCore } from './data/registrationLawExamCore'
import { registrationLawExamDetail } from './data/registrationLawExamDetail'
import './registration-law.css'

const NUMBER_PATTERN = /([①②③④⑤⑥⑦⑧⑨⑩]|\d+(?:[.,]\d+)*(?:\s*(?:개|종|일|년|월|㎡|m²|%|호|조|항|권리|사유|필지|개소))?)/g
const ARTICLE_PATTERN = /제\s*(\d+)\s*조(?:의\s*(\d+))?/g

function extractArticleReferences(value = '') {
  const articles = []
  let match
  ARTICLE_PATTERN.lastIndex = 0
  while ((match = ARTICLE_PATTERN.exec(String(value)))) {
    const article = `제${match[1]}조${match[2] ? `의${match[2]}` : ''}`
    if (!articles.includes(article)) articles.push(article)
  }
  ARTICLE_PATTERN.lastIndex = 0
  return articles
}

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
    <main className="public-law-page registration-law-page" id="main-content">
      <div className="public-law-topline">
        <button className="back-button" type="button" onClick={onBack}>← 전체 과목</button>
        <span>공인중개사 2차 · 부동산공시법</span>
      </div>

      <section className="public-law-hero">
        <div>
          <span className="eyebrow">REGISTRATION & CADASTRE · 2026</span>
          <h1>부동산공시법 핵심정리</h1>
          <p>공간정보법과 부동산등기법을 시험형 판단순서·비교표·함정 OX까지 확장하고, 관련 조문은 본문에서 바로 텍스트 팝업으로 확인합니다.</p>
        </div>
        <div className="public-law-hero__badges">
          <span>2개 PART</span>
          <span>9개 POINT</span>
          <span>시험형 상세정리</span>
          <span>조문 TEXT POPUP</span>
        </div>
      </section>

      <div className="public-law-layout">
        <aside className="public-law-nav" aria-label="부동산공시법 목차">
          <div className="public-law-nav__title">
            <strong>부동산공시법</strong>
            <span>시험 목차 · PART 1~2</span>
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
            ? (
              <StudyPoint
                part={selected.part}
                point={selected.point}
                content={registrationLawContent[selected.point.id]}
                deepDive={registrationLawDeepDive[selected.point.id]}
                examCore={registrationLawExamCore[selected.point.id]}
                examDetail={registrationLawExamDetail[selected.point.id]}
              />
            )
            : <ImportingSection part={selected.part} point={selected.point} />}
        </article>
      </div>
    </main>
  )
}

function HighlightNumbers({ children }) {
  if (typeof children !== 'string') return children
  const parts = children.split(NUMBER_PATTERN)
  return parts.map((part, index) => (
    index % 2 === 1
      ? <span className="exam-number" key={`${part}-${index}`}>{part}</span>
      : part
  ))
}

function LawArticleButtons({ part, articles = [], compact = false }) {
  const uniqueArticles = [...new Set(articles.filter(Boolean))]
  if (!uniqueArticles.length) return null

  const openArticle = (article) => {
    window.dispatchEvent(new CustomEvent('realtor:open-law-viewer', {
      detail: {
        subjectId: 'registration-law',
        lawName: part.title,
        article,
      },
    }))
  }

  return (
    <div className={`registration-law-articles${compact ? ' registration-law-articles--compact' : ''}`} aria-label="관련 법령 조문">
      {!compact && <span className="registration-law-articles__label">법령 원문</span>}
      {uniqueArticles.map((article) => (
        <button
          type="button"
          key={article}
          onClick={() => openArticle(article)}
          title={`${part.title} ${article} 조문 보기`}
        >
          {article}
        </button>
      ))}
    </div>
  )
}

function StudyPoint({ part, point, content, deepDive, examCore, examDetail }) {
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
        <span className="law-reference"><HighlightNumbers>{part.lawVersion}</HighlightNumbers></span>
      </header>

      <div className="study-tldr">
        <span>📌 핵심 한줄</span>
        <strong><HighlightNumbers>{content.headline}</HighlightNumbers></strong>
        <p><HighlightNumbers>{content.summary}</HighlightNumbers></p>
      </div>

      {examCore && <ExamCoreSection examCore={examCore} />}
      {examDetail && <ExamDetailSection detail={examDetail} part={part} />}

      <section className="study-block">
        <div className="study-block__title"><span>01</span><h3>이 POINT를 먼저 이해하기</h3></div>
        <div className="understanding-grid">
          {content.understanding.map(([title, body]) => (
            <div key={title}>
              <b><HighlightNumbers>{title}</HighlightNumbers></b>
              <p><HighlightNumbers>{body}</HighlightNumbers></p>
            </div>
          ))}
        </div>
      </section>

      <section className="study-block">
        <div className="study-block__title"><span>02</span><h3>전체 흐름</h3></div>
        <div className="hierarchy-flow" aria-label={`${content.heading} 흐름`}>
          {content.flow.map((item, index) => (
            <div className="hierarchy-flow__group" key={item}>
              <div className="hierarchy-flow__step">
                <small>STEP {index + 1}</small>
                <strong><HighlightNumbers>{item}</HighlightNumbers></strong>
              </div>
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
                <tr key={term}>
                  <th><HighlightNumbers>{term}</HighlightNumbers></th>
                  <td><HighlightNumbers>{definition}</HighlightNumbers></td>
                  <td>
                    <HighlightNumbers>{pointText}</HighlightNumbers>
                    <LawArticleButtons part={part} articles={extractArticleReferences(pointText)} compact />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {deepDive && <DeepDiveSection deepDive={deepDive} part={part} />}

      {content.extra === 'landCategories' && (
        <section className="study-block">
          <div className="study-block__title"><span>지목</span><h3>지목 <span className="exam-number">28종</span></h3></div>
          <div className="system-note__items" aria-label="법정 지목 28종">
            {landCategories.map((category) => <span key={category}>{category}</span>)}
          </div>
          <div className="study-note">📍 법정 지목은 총 <b><span className="exam-number">28종</span></b>입니다. 지목은 토지의 주된 용도에 따라 하나를 설정하는 것이 기본입니다.</div>
        </section>
      )}

      <section className="study-block study-block--split">
        <div className="trap-card">
          <span>⚠️ 함정 선지</span>
          <ul>{content.traps.map((trap) => <li key={trap}><HighlightNumbers>{trap}</HighlightNumbers></li>)}</ul>
        </div>
        <div className="memory-card">
          <span>🧠 암기</span>
          <strong><HighlightNumbers>{content.memory[0]}</HighlightNumbers></strong>
          <p><HighlightNumbers>{content.memory[1]}</HighlightNumbers></p>
        </div>
      </section>

      <section className="study-block">
        <div className="study-block__title"><span>Q</span><h3>확인문제</h3></div>
        <div className="understanding-grid">
          {content.quiz.map(([question, answer]) => (
            <div key={question}>
              <b><HighlightNumbers>{question}</HighlightNumbers></b>
              <p><HighlightNumbers>{answer}</HighlightNumbers></p>
            </div>
          ))}
        </div>
      </section>

      <section className="source-note">
        <b>법령 대조 기준</b>
        <p><HighlightNumbers>{`${part.lawVersion} · ${content.source}. PART 1은 2026.7.1 시행 공간정보관리법 체계, PART 2는 업로드된 국가법령정보센터 부동산등기법 [시행 2025.1.31.] [법률 제20435호] 원문을 기준으로 확장했습니다.`}</HighlightNumbers></p>
        <LawArticleButtons part={part} articles={extractArticleReferences(content.source)} />
      </section>
    </>
  )
}

function ExamCoreSection({ examCore }) {
  return (
    <section className="study-block exam-core-panel" aria-label="시험 핵심">
      <div className="exam-core-panel__heading">
        <span className="exam-core-panel__badge">EXAM CORE</span>
        <div>
          <h3>⭐ {examCore.title}</h3>
          <p>기출·함정 선지에서 우선 확인할 내용을 먼저 보고, 아래 세부 법령으로 내려갑니다.</p>
        </div>
      </div>
      <div className="exam-core-panel__grid">
        {examCore.items.map(([label, text], index) => (
          <article className="exam-core-item" key={label}>
            <span className="exam-core-item__index">{String(index + 1).padStart(2, '0')}</span>
            <div>
              <strong>{label}</strong>
              <p><HighlightNumbers>{text}</HighlightNumbers></p>
            </div>
          </article>
        ))}
      </div>
      <div className="exam-core-panel__legend">
        <span className="exam-number">숫자</span>
        <b> = 반드시 비교·암기할 수치 · 기간 · 개수 · 순위 포인트</b>
      </div>
    </section>
  )
}

function ExamDetailSection({ detail, part }) {
  return (
    <section className="study-block registration-exam-detail" style={{ '--chapter-color': part.color }} aria-label="시험대비 상세정리">
      <div className="registration-exam-detail__heading">
        <span>EXAM DETAIL</span>
        <div>
          <h3>{detail.title}</h3>
          <p>{detail.intro}</p>
        </div>
      </div>

      <div className="registration-exam-detail__topics">
        {detail.topics.map((topic, index) => (
          <article className="registration-exam-topic" key={topic.title}>
            <div className="registration-exam-topic__head">
              <span>{String(index + 1).padStart(2, '0')}</span>
              <div>
                <h4>{topic.title}</h4>
                <LawArticleButtons part={part} articles={topic.articles} />
              </div>
            </div>
            <ul>
              {topic.points.map((point) => <li key={point}><HighlightNumbers>{point}</HighlightNumbers></li>)}
            </ul>
            <div className="registration-exam-topic__trap">
              <b>⚠ 오답유도</b>
              <span><HighlightNumbers>{topic.trap}</HighlightNumbers></span>
            </div>
          </article>
        ))}
      </div>

      <div className="registration-ox">
        <div className="registration-ox__title">
          <strong>시험형 OX 체크</strong>
          <span>문장을 읽고 주체·기한·절차·효과 중 무엇이 바뀌었는지 확인합니다.</span>
        </div>
        <div className="registration-ox__grid">
          {detail.ox.map(([question, answer], index) => (
            <div className="registration-ox__item" key={question}>
              <span className="registration-ox__number">{index + 1}</span>
              <div>
                <b><HighlightNumbers>{question}</HighlightNumbers></b>
                <p><HighlightNumbers>{answer}</HighlightNumbers></p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function DeepDiveSection({ deepDive, part }) {
  return (
    <section className="study-block law-deep-dive" style={{ '--chapter-color': part.color }}>
      <div className="study-block__title"><span>법령</span><h3><HighlightNumbers>{deepDive.title}</HighlightNumbers></h3></div>
      <p className="law-deep-dive__intro"><HighlightNumbers>{deepDive.intro}</HighlightNumbers></p>
      <div className="law-deep-dive__list">
        {deepDive.sections.map((section) => (
          <details className="law-detail-card" key={section.title} open>
            <summary>
              <span><HighlightNumbers>{section.title}</HighlightNumbers></span>
              <small><HighlightNumbers>{section.articles}</HighlightNumbers></small>
            </summary>
            <div className="law-detail-card__body">
              <LawArticleButtons part={part} articles={extractArticleReferences(section.articles)} />
              <p><HighlightNumbers>{section.body}</HighlightNumbers></p>
              <ul>{section.bullets.map((bullet) => <li key={bullet}><HighlightNumbers>{bullet}</HighlightNumbers></li>)}</ul>
              <div className="law-detail-card__exam">
                <b>시험 포인트</b>
                <span><HighlightNumbers>{section.exam}</HighlightNumbers></span>
              </div>
            </div>
          </details>
        ))}
      </div>
    </section>
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
