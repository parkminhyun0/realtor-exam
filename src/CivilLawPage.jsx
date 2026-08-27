import { useMemo, useState } from 'react'
import LawTextViewer from './LawTextViewer'
import { civilLawParts, civilLawPointCount, civilLawTopicCount } from './data/civilLawToc3Level'
import { civilLawContent } from './data/civilLawContent'
import { civilLawPart2Content } from './data/civilLawPart2Content'
import { civilLawPart3Content } from './data/civilLawPart3Content'
import { civilLawPart4Content } from './data/civilLawPart4Content'
import './law-viewer.css'
import './civil-law.css'
import './civil-law-3level.css'

const civilLawStudyContent = {
  ...civilLawContent,
  ...civilLawPart2Content,
  ...civilLawPart3Content,
  ...civilLawPart4Content,
}

const CIVIL_LAW_NAMES = [
  '부동산 실권리자명의 등기에 관한 법률',
  '집합건물의 소유 및 관리에 관한 법률',
  '상가건물 임대차보호법',
  '주택임대차보호법',
  '가등기담보 등에 관한 법률',
  '민법',
]
const INLINE_ARTICLE_PATTERN = new RegExp(`(?:(${CIVIL_LAW_NAMES.join('|')})\\s*)?(제\\s*\\d+\\s*조(?:의\\s*\\d+)?)`, 'g')
const NUMBER_PATTERN = /(\d+(?:[.,]\d+)*(?:\s*(?:년|개월|일|명|개|회|%))?)/g
const GENERIC_TOPIC_WORDS = new Set([
  '일반', '의의', '효력', '법률관계', '종류', '범위', '적용범위', '계약', '권리', '법률', '관계', '경우',
])

function normalizeArticle(value = '') {
  return String(value).replace(/\s+/g, '')
}

function normalizeTopicText(value = '') {
  return String(value)
    .toLowerCase()
    .replace(/[^0-9a-z가-힣]/g, '')
}

function getTopicKeywords(topic = '') {
  return String(topic)
    .split(/[\s·,()/]+/)
    .map((token) => token.trim())
    .filter((token) => token.length >= 2 && !GENERIC_TOPIC_WORDS.has(token))
}

function scoreTopicMatch(topic, candidate) {
  const topicText = normalizeTopicText(topic)
  const candidateText = normalizeTopicText(candidate)
  if (!topicText || !candidateText) return 0

  let score = 0
  if (candidateText.includes(topicText) || topicText.includes(candidateText)) score += 12

  getTopicKeywords(topic).forEach((keyword) => {
    const normalizedKeyword = normalizeTopicText(keyword)
    if (normalizedKeyword && candidateText.includes(normalizedKeyword)) {
      score += normalizedKeyword.length >= 4 ? 4 : 2
    }
  })

  return score
}

function buildTopicView(content, point, selectedTopicIndex) {
  const topic = point.topics[selectedTopicIndex] || point.topics[0] || point.title
  const entries = (content.sections || []).flatMap((section, sectionIndex) => (
    (section.items || []).map(([term, body], itemIndex) => ({
      sectionTitle: section.title,
      sectionNote: section.note,
      term,
      body,
      sectionIndex,
      itemIndex,
    }))
  ))

  const rankedEntries = entries
    .map((entry) => ({
      ...entry,
      score: scoreTopicMatch(topic, `${entry.sectionTitle} ${entry.term} ${entry.body}`),
    }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.sectionIndex - b.sectionIndex || a.itemIndex - b.itemIndex)

  let relatedEntries = rankedEntries.slice(0, 6)
  let usedFallback = false

  if (!relatedEntries.length && entries.length) {
    usedFallback = true
    const topicCount = Math.max(point.topics.length, 1)
    const start = Math.floor((selectedTopicIndex * entries.length) / topicCount)
    const end = Math.max(start + 1, Math.floor(((selectedTopicIndex + 1) * entries.length) / topicCount))
    relatedEntries = entries.slice(start, Math.min(end, entries.length))
    if (!relatedEntries.length) relatedEntries = entries.slice(0, Math.min(3, entries.length))
  }

  const relatedTables = (content.tables || [])
    .map((table) => ({
      ...table,
      score: scoreTopicMatch(topic, `${table.title} ${table.headers?.join(' ') || ''} ${table.rows?.flat().join(' ') || ''}`),
    }))
    .filter((table) => table.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 2)

  return { topic, relatedEntries, relatedTables, usedFallback }
}

function HighlightNumbers({ children }) {
  if (typeof children !== 'string') return children
  const parts = children.split(NUMBER_PATTERN)
  return parts.map((part, index) => (
    index % 2 === 1
      ? <span className="civil-exam-number" key={`${part}-${index}`}>{part}</span>
      : part
  ))
}

function CivilLawText({ children, onOpenLaw }) {
  if (typeof children !== 'string') return children

  const nodes = []
  let lastIndex = 0
  let match
  INLINE_ARTICLE_PATTERN.lastIndex = 0

  while ((match = INLINE_ARTICLE_PATTERN.exec(children)) !== null) {
    const [fullMatch, explicitLawName, article] = match
    if (match.index > lastIndex) {
      nodes.push(<HighlightNumbers key={`text-${lastIndex}`}>{children.slice(lastIndex, match.index)}</HighlightNumbers>)
    }

    if (explicitLawName) nodes.push(<span key={`law-${match.index}`}>{explicitLawName} </span>)

    const normalized = normalizeArticle(article)
    nodes.push(
      <button
        type="button"
        className="civil-law-inline-reference"
        data-law-reference="true"
        key={`article-${match.index}-${normalized}`}
        onClick={() => onOpenLaw(explicitLawName || '민법', normalized)}
        title={`${explicitLawName || '민법'} ${normalized} 조문 보기`}
      >
        {normalized}
      </button>,
    )

    lastIndex = match.index + fullMatch.length
  }

  if (lastIndex < children.length) {
    nodes.push(<HighlightNumbers key={`text-${lastIndex}`}>{children.slice(lastIndex)}</HighlightNumbers>)
  }

  return nodes.length ? nodes : <HighlightNumbers>{children}</HighlightNumbers>
}

export default function CivilLawPage({ onBack }) {
  const [selectedId, setSelectedId] = useState('p1s1')
  const [selectedTopicIndex, setSelectedTopicIndex] = useState(0)
  const [lawTarget, setLawTarget] = useState(null)

  const selected = useMemo(() => {
    for (const part of civilLawParts) {
      const point = part.points.find((item) => item.id === selectedId)
      if (point) return { part, point }
    }
    return { part: civilLawParts[0], point: civilLawParts[0].points[0] }
  }, [selectedId])

  const safeTopicIndex = Math.min(selectedTopicIndex, Math.max(selected.point.topics.length - 1, 0))
  const selectedTopic = selected.point.topics[safeTopicIndex] || selected.point.title
  const content = civilLawStudyContent[selected.point.id]

  const openLawArticle = (lawName, article) => {
    setLawTarget({
      subjectId: 'civil-law',
      lawName,
      article: normalizeArticle(article),
    })
  }

  const selectPoint = (id, topicIndex = 0) => {
    setLawTarget(null)
    setSelectedId(id)
    setSelectedTopicIndex(topicIndex)
  }

  return (
    <>
      <main className="public-law-page civil-law-page" id="main-content">
        <div className="public-law-topline">
          <button className="back-button" type="button" onClick={onBack}>← 전체 과목</button>
          <span>공인중개사 1차 · 민법 및 민사특별법</span>
        </div>

        <section className="public-law-hero civil-law-hero">
          <div>
            <span className="eyebrow">CIVIL LAW · 2026</span>
            <h1>민법 및 민사특별법 핵심정리</h1>
            <p>새 목차를 PART → POINT → 세부항목의 3단계로 구성하고, 기존 법조문·해설·판례·시험함정을 선택한 세부항목과 연결해 학습할 수 있도록 재정리했습니다.</p>
          </div>
          <div className="public-law-hero__badges">
            <span>4개 PART</span>
            <span>{civilLawPointCount}개 POINT</span>
            <span>{civilLawTopicCount}개 세부항목</span>
            <span>3단계 메뉴 · 관련내용 연결</span>
          </div>
        </section>

        <div className="public-law-layout" data-mobile-toc-layout>
          <aside className="public-law-nav" aria-label="민법 및 민사특별법 3단계 목차" data-mobile-toc>
            <div className="public-law-nav__title">
              <strong>민법 및 민사특별법</strong>
              <span>PART → POINT → 세부항목</span>
            </div>
            {civilLawParts.map((part) => (
              <details key={part.id} open={part.points.some((item) => item.id === selectedId)}>
                <summary>
                  <i style={{ background: part.color }} />
                  <span>PART {part.number} {part.title}</span>
                </summary>
                <div className="civil-nav-point-list">
                  {part.points.map((point) => {
                    const isSelectedPoint = point.id === selectedId
                    return (
                      <details className="civil-nav-point" key={point.id} open={isSelectedPoint}>
                        <summary onClick={() => {
                          if (!isSelectedPoint) selectPoint(point.id, 0)
                        }}>
                          <span className="civil-nav-point__label">
                            <span>POINT {point.number} · {point.title}</span>
                            {civilLawStudyContent[point.id] && <b className="civil-nav__ready">본문</b>}
                          </span>
                        </summary>
                        <ol className="civil-nav-topic-list">
                          {point.topics.map((topic, topicIndex) => (
                            <li key={`${point.id}-${topic}`}>
                              <button
                                type="button"
                                className={`civil-nav-topic-button ${isSelectedPoint && safeTopicIndex === topicIndex ? 'active' : ''}`}
                                onClick={() => selectPoint(point.id, topicIndex)}
                              >
                                <span className="civil-nav-topic-number">{String(topicIndex + 1).padStart(2, '0')}</span>
                                <span>{topic}</span>
                              </button>
                            </li>
                          ))}
                        </ol>
                      </details>
                    )
                  })}
                </div>
              </details>
            ))}
          </aside>

          <article className="public-law-content" data-mobile-toc-content>
            <div className="public-law-breadcrumb">
              PART {selected.part.number} {selected.part.title} <span>›</span> POINT {selected.point.number} · {selected.point.title} <span>›</span> {selectedTopic}
            </div>

            <header className="study-section-heading" style={{ '--chapter-color': selected.part.color }}>
              <div>
                <span className="study-section-heading__number">{selected.point.number}-{String(safeTopicIndex + 1).padStart(2, '0')}</span>
                <div>
                  <span className="study-section-heading__chapter">PART {selected.part.number} · {selected.part.title} / POINT {selected.point.number} · {selected.point.title}</span>
                  <h2>{selectedTopic}</h2>
                </div>
              </div>
              <span className="law-reference">
                {content ? content.statusLabel : '공인중개사 시험범위 목차'}
              </span>
            </header>

            {content
              ? (
                <CivilStudyContent
                  content={content}
                  point={selected.point}
                  selectedTopicIndex={safeTopicIndex}
                  onOpenLaw={openLawArticle}
                />
              )
              : (
                <CivilOutlineContent
                  point={selected.point}
                  part={selected.part}
                  selectedId={selectedId}
                  selectedTopicIndex={safeTopicIndex}
                  onSelectPoint={selectPoint}
                />
              )}

            {content && (
              <CivilPartMap
                part={selected.part}
                selectedId={selectedId}
                onSelectPoint={selectPoint}
              />
            )}
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

function CivilStudyContent({ content, point, selectedTopicIndex, onOpenLaw }) {
  const topicView = buildTopicView(content, point, selectedTopicIndex)

  return (
    <>
      <CivilStatuteCards statutes={content.statutes} onOpenLaw={onOpenLaw} />

      <div className="study-tldr civil-study-tldr">
        <span>📌 POINT 핵심</span>
        <strong><CivilLawText onOpenLaw={onOpenLaw}>{content.headline}</CivilLawText></strong>
        <p><CivilLawText onOpenLaw={onOpenLaw}>{content.summary}</CivilLawText></p>
      </div>

      <section className="study-block civil-topic-focus">
        <div className="study-block__title">
          <span>{String(selectedTopicIndex + 1).padStart(2, '0')}</span>
          <h3>{topicView.topic}</h3>
        </div>
        <span className="civil-topic-focus__eyebrow">3단계 세부항목 · 관련 내용 재배치</span>
        <p className="civil-topic-focus__meta">이 세부항목과 직접 연결되는 기존 POINT의 해설을 우선 모아서 표시합니다. 법조문·판례·O/X·함정은 같은 POINT의 공통 학습자료로 이어집니다.</p>
        {topicView.usedFallback && (
          <p className="civil-topic-fallback">현재 POINT의 기존 본문에 세부항목명이 그대로 쓰이지 않은 경우, 목차 순서와 가까운 핵심 해설을 연결해 표시합니다.</p>
        )}
        <div className="civil-topic-entry-grid">
          {topicView.relatedEntries.map((entry) => (
            <article className="civil-topic-entry-card" key={`${entry.sectionTitle}-${entry.term}`}>
              <small>{entry.sectionTitle}</small>
              <b><CivilLawText onOpenLaw={onOpenLaw}>{entry.term}</CivilLawText></b>
              <p><CivilLawText onOpenLaw={onOpenLaw}>{entry.body}</CivilLawText></p>
            </article>
          ))}
        </div>
      </section>

      {topicView.relatedTables.map((table, index) => (
        <section className="study-block" key={table.title}>
          <div className="study-block__title"><span>표{index + 1}</span><h3>{table.title}</h3></div>
          <div className="table-wrap">
            <table className="study-table">
              <thead>
                <tr>{table.headers.map((header) => <th key={header}>{header}</th>)}</tr>
              </thead>
              <tbody>
                {table.rows.map((row) => (
                  <tr key={row.join('-')}>
                    {row.map((cell, cellIndex) => (
                      cellIndex === 0
                        ? <th key={`${cell}-${cellIndex}`}><CivilLawText onOpenLaw={onOpenLaw}>{cell}</CivilLawText></th>
                        : <td key={`${cell}-${cellIndex}`}><CivilLawText onOpenLaw={onOpenLaw}>{cell}</CivilLawText></td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}

      <CivilPrecedents precedents={content.precedents} onOpenLaw={onOpenLaw} />
      <CivilExamChecks checks={content.examChecks} onOpenLaw={onOpenLaw} />

      <section className="study-block study-block--split">
        <div className="trap-card">
          <span>⚠️ 함정 선지</span>
          <ul>
            {content.traps.map((trap) => (
              <li key={trap}><CivilLawText onOpenLaw={onOpenLaw}>{trap}</CivilLawText></li>
            ))}
          </ul>
        </div>
        <div className="memory-card">
          <span>🧠 암기</span>
          <strong><CivilLawText onOpenLaw={onOpenLaw}>{content.memory[0]}</CivilLawText></strong>
          <p><CivilLawText onOpenLaw={onOpenLaw}>{content.memory[1]}</CivilLawText></p>
        </div>
      </section>

      <section className="source-note civil-source-note">
        <b>법령·판례 근거</b>
        <p>각 POINT의 법조문 카드는 해당 현행 법령을 기준으로 정리했습니다. 본문에서 법령명과 조문이 함께 표시되면 해당 법령의 조문만 팝업으로 확인할 수 있고, 판례가 있는 항목은 국가법령정보센터 원문 링크를 별도로 표시합니다.</p>
        <div className="theory-source-links">
          {content.sources.map((source) => (
            <a className="theory-source-item" key={`${source.label}-${source.detail}`} href={source.url} target="_blank" rel="noreferrer">
              <span>{source.type}</span>
              <strong>{source.label}</strong>
              <small>{source.detail}</small>
              <b aria-hidden="true">↗</b>
            </a>
          ))}
        </div>
      </section>
    </>
  )
}

function CivilPrecedents({ precedents, onOpenLaw }) {
  if (!precedents?.length) return null

  return (
    <section className="study-block civil-precedent-section" aria-label="핵심 판례">
      <div className="study-block__title"><span>⚖</span><h3>시험에 연결되는 핵심 판례</h3></div>
      <p className="study-note">조문만으로 풀리지 않는 제3자 관계·성립요건·견련성은 판례의 결론과 판단기준을 함께 봅니다.</p>
      <div className="civil-precedent-grid">
        {precedents.map((item) => (
          <article className="civil-precedent-card" key={item.caseNo}>
            <div className="civil-precedent-card__meta">
              <span>{item.court}</span>
              <b>{item.caseNo}</b>
            </div>
            <strong>{item.title}</strong>
            <p><CivilLawText onOpenLaw={onOpenLaw}>{item.holding}</CivilLawText></p>
            <a href={item.url} target="_blank" rel="noreferrer">판례 원문 확인 ↗</a>
          </article>
        ))}
      </div>
    </section>
  )
}

function CivilExamChecks({ checks, onOpenLaw }) {
  if (!checks?.length) return null

  return (
    <section className="study-block civil-exam-checks" aria-label="민법 OX 확인문제">
      <div className="study-block__title"><span>✓</span><h3>바로 확인하는 O/X</h3></div>
      <div className="civil-exam-check-list">
        {checks.map(([question, answer, explanation], index) => (
          <details key={question}>
            <summary>
              <span>Q{index + 1}</span>
              <strong><CivilLawText onOpenLaw={onOpenLaw}>{question}</CivilLawText></strong>
            </summary>
            <div>
              <b className={answer === '○' ? 'is-correct' : 'is-wrong'}>{answer}</b>
              <p><CivilLawText onOpenLaw={onOpenLaw}>{explanation}</CivilLawText></p>
            </div>
          </details>
        ))}
      </div>
    </section>
  )
}

function CivilStatuteCards({ statutes, onOpenLaw }) {
  return (
    <section className="study-block civil-statute-section" aria-label="핵심 법조문">
      <div className="study-block__title"><span>§</span><h3>가장 먼저 읽는 법조문</h3></div>
      <p className="study-note">조문을 먼저 읽은 뒤 아래의 해설·비교·함정을 확인합니다. 조문 번호를 누르면 국가법령정보센터의 해당 조문만 작은 팝업으로 다시 확인할 수 있습니다.</p>
      <div className="civil-statute-grid">
        {statutes.map((statute) => (
          <article className="civil-statute-card" key={`${statute.lawName}-${statute.article}`}>
            <header>
              <button
                type="button"
                className="civil-statute-card__article"
                data-law-reference="true"
                onClick={() => onOpenLaw(statute.lawName, statute.article)}
                title={`${statute.lawName} ${statute.article} 조문 보기`}
              >
                {statute.article}
              </button>
              <strong>{statute.title}</strong>
            </header>
            <div className="civil-statute-card__body">
              {statute.lines.map((line) => <p key={line}>{line}</p>)}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

function CivilOutlineContent({ point, part, selectedId, selectedTopicIndex, onSelectPoint }) {
  return (
    <>
      <section className="civil-outline-intro">
        <span>3단계 세부항목</span>
        <strong>{point.topics[selectedTopicIndex] || point.title}</strong>
        <p>이 POINT는 새 3단계 목차에 맞춰 세부항목을 선택할 수 있도록 구성되어 있습니다. 본문 확장 시에도 같은 항목 아래에 법조문·핵심원칙·요건·효과·판례·시험함정을 배치합니다.</p>
      </section>

      <section className="study-block civil-outline-block">
        <div className="study-block__title"><span>TOC</span><h3>POINT {point.number} 세부 목차</h3></div>
        <ol className="civil-outline-list">
          {point.topics.map((topic, index) => (
            <li key={topic}>
              <span className="civil-outline-list__number">{String(index + 1).padStart(2, '0')}</span>
              <strong>{topic}</strong>
            </li>
          ))}
        </ol>
      </section>

      <CivilPartMap part={part} selectedId={selectedId} onSelectPoint={onSelectPoint} />
    </>
  )
}

function CivilPartMap({ part, selectedId, onSelectPoint }) {
  return (
    <section className="study-block civil-part-map">
      <div className="study-block__title"><span>MAP</span><h3>PART {part.number} 전체 흐름</h3></div>
      <div className="civil-part-map__items">
        {part.points.map((point) => (
          <button
            key={point.id}
            type="button"
            className={point.id === selectedId ? 'active' : ''}
            onClick={() => onSelectPoint(point.id, 0)}
          >
            <small>POINT {point.number}</small>
            <strong>{point.title}</strong>
            {civilLawStudyContent[point.id] && <span>본문 공개</span>}
          </button>
        ))}
      </div>
    </section>
  )
}
