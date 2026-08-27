import { useMemo, useState } from 'react'
import { landCategories, registrationLawContent, registrationLawParts } from './data/registrationLaw'
import { registrationLawDeepDive } from './data/registrationLawDeepDive'
import { registrationLawExamCore } from './data/registrationLawExamCore'
import { registrationLawExamDetail } from './data/registrationLawExamDetail'
import './registration-law.css'
import './registration-law-toc.css'

const NUMBER_PATTERN = /([①②③④⑤⑥⑦⑧⑨⑩]|\d+(?:[.,]\d+)*(?:\s*(?:개|종|일|년|월|㎡|m²|%|호|조|항|권리|사유|필지|개소))?)/g
const ARTICLE_PATTERN = /제\s*(\d+)\s*조(?:의\s*(\d+))?/g

const POINT01_OUTLINE = [
  { id: 'meaning', label: '1 지적의 의의', keywords: ['제도의 목적', '필지', '토지의 조사·등록'] },
  {
    id: 'terms',
    label: '2 용어의 정의',
    keywords: ['등록사항', '토지 이동', '필지'],
    children: [
      { id: 'terms-office', label: '(1) 지적소관청', keywords: ['지적소관청', '결정 주체'] },
      { id: 'terms-display', label: '(2) 토지의 표시', keywords: ['소재', '지번', '지목', '면적', '경계', '좌표'] },
      { id: 'terms-move', label: '(3) 토지의 이동', keywords: ['토지 이동', '토지이동'] },
      { id: 'terms-parcel', label: '(4) 필지', keywords: ['필지'] },
    ],
  },
  { id: 'principles', label: '3 등록의 기본원칙', keywords: ['조사·등록', '등록사항', '신청', '직권'] },
  {
    id: 'lot-number',
    label: '4 지번',
    keywords: ['지번'],
    children: [
      { id: 'lot-number-rule', label: '(1) 지번부여의 기본원칙', keywords: ['지번', '지번부여지역', '부여'] },
      {
        id: 'lot-number-move',
        label: '(2) 토지이동에 따른 지번 부여',
        keywords: ['지번', '토지이동', '신규등록', '등록전환', '분할', '합병'],
        children: [
          { id: 'lot-number-new', label: 'a. 신규등록 밑 등록전환(영 제56조 제3항 제2호)', keywords: ['신규등록', '등록전환', '지번'] },
          { id: 'lot-number-split', label: 'b.분할(영 제56조 제3항 제3호)', keywords: ['분할', '지번'] },
          { id: 'lot-number-merge', label: 'c. 합병(영 제56조 제3항 제4호)', keywords: ['합병', '지번'] },
          { id: 'lot-number-survey', label: 'd. 지적확정측량 실시지역(=도시개발사업 등 실시지역)', keywords: ['지적확정측량', '도시개발사업', '지번'] },
        ],
      },
      { id: 'lot-number-change', label: '(3) 지번번경', keywords: ['지번 변경', '지번'] },
      { id: 'lot-number-missing', label: '(4) 결번', keywords: ['결번', '지번'] },
    ],
  },
  {
    id: 'land-category',
    label: '5 지목',
    keywords: ['지목'],
    children: [
      { id: 'land-category-rule', label: '(1) 지목의 설정원칙', keywords: ['지목', '주된 용도', '하나의 지목'] },
      { id: 'land-category-types', label: '(2) 지목의 구분(영 제58조)', keywords: ['지목', '28종'] },
      { id: 'land-category-mark', label: '(3) 지목의 표기방법', keywords: ['지목', '표기'] },
    ],
  },
  {
    id: 'boundary',
    label: '6 경계',
    keywords: ['경계'],
    children: [
      { id: 'boundary-ground', label: '(1) 지상경계의 구분', keywords: ['지상경계', '경계점표지', '구조물'] },
      { id: 'boundary-standard', label: '(2) 지상경계 결정기준(영 제55조 제1항 제2항)', keywords: ['지상경계', '결정기준', '경계'] },
      { id: 'boundary-split', label: '(3) 분할에 따른 지상경계', keywords: ['분할', '지상경계', '경계'] },
      { id: 'boundary-development', label: '(4) 도시개발사업 등의 경계결정', keywords: ['도시개발사업', '경계결정', '경계'] },
    ],
  },
  {
    id: 'area',
    label: '7 면적',
    keywords: ['면적'],
    children: [
      { id: 'area-measurement', label: '(1) 면적측정', keywords: ['면적', '측정', '제곱미터'] },
      { id: 'area-rounding', label: '(2) 끝수처리 연습', keywords: ['면적', '계산', '끝수'] },
      { id: 'area-basis', label: '(3) 근거 규정 : 면적의 결정 및 측량계산의 끝수처리(영 제60조)', keywords: ['면적', '측량', '계산', '끝수'] },
    ],
  },
]

function flattenOutline(nodes, parentLabels = []) {
  return nodes.flatMap((node) => {
    const path = [...parentLabels, node.label]
    const current = [{ ...node, path }]
    return node.children ? [...current, ...flattenOutline(node.children, path)] : current
  })
}

const POINT01_FLAT = flattenOutline(POINT01_OUTLINE)

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
        <button type="button" key={article} onClick={() => openArticle(article)}>{article}</button>
      ))}
    </div>
  )
}

function textMatches(value, keywords) {
  const text = String(value || '').replace(/\s+/g, '').toLowerCase()
  return keywords.some((keyword) => text.includes(String(keyword).replace(/\s+/g, '').toLowerCase()))
}

function buildFocusView(content, deepDive, examCore, examDetail, focus) {
  if (!focus) return null
  const keywords = focus.keywords || []
  const matchingUnderstanding = (content?.understanding || []).filter((entry) => textMatches(entry.join(' '), keywords))
  const matchingRows = (content?.rows || []).filter((entry) => textMatches(entry.join(' '), keywords))
  const matchingSections = (deepDive?.sections || []).filter((section) => textMatches(`${section.title} ${section.body} ${(section.bullets || []).join(' ')}`, keywords))
  const matchingCore = (examCore?.items || []).filter((entry) => textMatches(entry.join(' '), keywords))
  const matchingTopics = (examDetail?.topics || []).filter((topic) => textMatches(`${topic.title} ${(topic.points || []).join(' ')} ${topic.trap || ''}`, keywords))

  const hasDirect = matchingUnderstanding.length || matchingRows.length || matchingSections.length || matchingCore.length || matchingTopics.length
  if (hasDirect) return { matchingUnderstanding, matchingRows, matchingSections, matchingCore, matchingTopics, fallback: false }

  const parentKeywords = focus.id.startsWith('lot-number') ? ['지번']
    : focus.id.startsWith('land-category') ? ['지목']
      : focus.id.startsWith('boundary') ? ['경계']
        : focus.id.startsWith('area') ? ['면적']
          : ['등록']

  return buildFocusView(content, deepDive, examCore, examDetail, { ...focus, keywords: parentKeywords, id: `${focus.id}-fallback` })
}

function OutlineNode({ node, selectedFocusId, onSelect, depth = 0 }) {
  const hasChildren = Boolean(node.children?.length)
  if (!hasChildren) {
    return (
      <li className={`registration-toc-node registration-toc-node--depth-${depth}`}>
        <button
          type="button"
          className={selectedFocusId === node.id ? 'active' : ''}
          onClick={() => onSelect(node.id)}
        >
          <span>{node.label}</span>
        </button>
      </li>
    )
  }

  const containsSelected = flattenOutline([node]).some((item) => item.id === selectedFocusId)
  return (
    <li className={`registration-toc-node registration-toc-node--depth-${depth}`}>
      <details open={containsSelected || depth === 0}>
        <summary>
          <button
            type="button"
            className={selectedFocusId === node.id ? 'active' : ''}
            onClick={(event) => {
              event.preventDefault()
              event.stopPropagation()
              onSelect(node.id)
            }}
          >
            <span>{node.label}</span>
          </button>
        </summary>
        <ul>
          {node.children.map((child) => (
            <OutlineNode key={child.id} node={child} selectedFocusId={selectedFocusId} onSelect={onSelect} depth={depth + 1} />
          ))}
        </ul>
      </details>
    </li>
  )
}

export default function RegistrationLawPageV2({ onBack }) {
  const [selectedId, setSelectedId] = useState('p1s1')
  const [selectedFocusId, setSelectedFocusId] = useState('meaning')

  const selected = useMemo(() => {
    for (const part of registrationLawParts) {
      const point = part.points.find((item) => item.id === selectedId)
      if (point) return { part, point }
    }
    return { part: registrationLawParts[0], point: registrationLawParts[0].points[0] }
  }, [selectedId])

  const focus = selectedId === 'p1s1'
    ? POINT01_FLAT.find((item) => item.id === selectedFocusId) || POINT01_FLAT[0]
    : null

  const selectPoint = (pointId) => {
    setSelectedId(pointId)
    if (pointId === 'p1s1') setSelectedFocusId('meaning')
  }

  return (
    <main className="public-law-page registration-law-page registration-law-page--v2" id="main-content">
      <div className="public-law-topline">
        <button className="back-button" type="button" onClick={onBack}>← 전체 과목</button>
        <span>공인중개사 2차 · 부동산공시법</span>
      </div>

      <section className="public-law-hero">
        <div>
          <span className="eyebrow">REGISTRATION & CADASTRE · 2026</span>
          <h1>부동산공시법 핵심정리</h1>
          <p>공간정보법 POINT 01을 제공하신 목차대로 세분화하고, 기존 토지등록 본문을 각 하위 목차에 연결해 선택한 항목 중심으로 표시합니다.</p>
        </div>
        <div className="public-law-hero__badges">
          <span>2개 PART</span>
          <span>9개 POINT</span>
          <span>POINT 01 상세 트리</span>
          <span>기존 본문 재배치</span>
        </div>
      </section>

      <div className="public-law-layout" data-mobile-toc-layout>
        <aside className="public-law-nav registration-law-nav-v2" aria-label="부동산공시법 상세 목차" data-mobile-toc>
          <div className="public-law-nav__title">
            <strong>부동산공시법</strong>
            <span>PART → POINT → 세부항목</span>
          </div>

          {registrationLawParts.map((part) => (
            <details key={part.id} open={part.points.some((item) => item.id === selectedId)}>
              <summary>
                <i style={{ background: part.color }} />
                <span>PART {part.number} {part.title}</span>
              </summary>
              <div className="registration-point-list">
                {part.points.map((point) => {
                  const isSelected = point.id === selectedId
                  const isDetailedPoint = point.id === 'p1s1'
                  return (
                    <details className="registration-point" key={point.id} open={isSelected || isDetailedPoint}>
                      <summary onClick={() => !isSelected && selectPoint(point.id)}>
                        <span className="registration-point__summary">
                          <span>POINT {point.number} · {point.title}</span>
                          {point.ready ? <b>공개</b> : <small>편입 중</small>}
                        </span>
                      </summary>

                      {isDetailedPoint ? (
                        <ul className="registration-detailed-toc">
                          {POINT01_OUTLINE.map((node) => (
                            <OutlineNode
                              key={node.id}
                              node={node}
                              selectedFocusId={selectedFocusId}
                              onSelect={(focusId) => {
                                setSelectedId('p1s1')
                                setSelectedFocusId(focusId)
                              }}
                            />
                          ))}
                        </ul>
                      ) : (
                        <button
                          type="button"
                          className={`registration-point-open${isSelected ? ' active' : ''}`}
                          onClick={() => selectPoint(point.id)}
                        >
                          기존 POINT 본문 보기
                        </button>
                      )}
                    </details>
                  )
                })}
              </div>
            </details>
          ))}
        </aside>

        <article className="public-law-content" data-mobile-toc-content>
          <div className="public-law-breadcrumb">
            PART {selected.part.number} {selected.part.title} <span>›</span> POINT {selected.point.number} · {selected.point.title}
            {focus?.path?.map((item) => <span className="registration-breadcrumb-leaf" key={item}>› {item}</span>)}
          </div>

          {selected.point.ready ? (
            <RegistrationStudyContent
              part={selected.part}
              point={selected.point}
              content={registrationLawContent[selected.point.id]}
              deepDive={registrationLawDeepDive[selected.point.id]}
              examCore={registrationLawExamCore[selected.point.id]}
              examDetail={registrationLawExamDetail[selected.point.id]}
              focus={focus}
            />
          ) : (
            <section className="placeholder-card">
              <span>편입 중</span>
              <h2>{selected.point.title}</h2>
              <p>기존 공시법 본문을 유지하면서 새 목차 체계에 맞춰 순차적으로 연결합니다.</p>
            </section>
          )}
        </article>
      </div>
    </main>
  )
}

function RegistrationStudyContent({ part, point, content, deepDive, examCore, examDetail, focus }) {
  if (!content) return null
  const focusView = focus ? buildFocusView(content, deepDive, examCore, examDetail, focus) : null

  return (
    <>
      <header className="study-section-heading" style={{ '--chapter-color': part.color }}>
        <div>
          <span className="study-section-heading__number">{point.number}</span>
          <div>
            <span className="study-section-heading__chapter">PART {part.number} · {part.title} / POINT {point.number} · {point.title}</span>
            <h2>{focus ? focus.label : content.heading}</h2>
          </div>
        </div>
        <span className="law-reference"><HighlightNumbers>{part.lawVersion}</HighlightNumbers></span>
      </header>

      {focus && (
        <section className="study-block registration-focus-panel">
          <div className="study-block__title"><span>목차</span><h3>{focus.label}</h3></div>
          <p>기존 <b>POINT 01 · 토지의 등록</b> 본문에서 이 세부 목차와 직접 관련된 내용만 우선 재배치해 표시합니다.</p>
          <div className="registration-focus-path">{focus.path.join(' → ')}</div>
        </section>
      )}

      <div className="study-tldr">
        <span>📌 핵심 한줄</span>
        <strong><HighlightNumbers>{content.headline}</HighlightNumbers></strong>
        <p><HighlightNumbers>{content.summary}</HighlightNumbers></p>
      </div>

      {focusView ? (
        <FocusedExistingContent focusView={focusView} content={content} part={part} focus={focus} />
      ) : (
        <FullExistingContent content={content} deepDive={deepDive} examCore={examCore} examDetail={examDetail} part={part} />
      )}

      {content.extra === 'landCategories' && (!focus || focus.id.startsWith('land-category')) && (
        <section className="study-block">
          <div className="study-block__title"><span>지목</span><h3>지목 <span className="exam-number">28종</span></h3></div>
          <div className="system-note__items" aria-label="법정 지목 28종">
            {landCategories.map((category) => <span key={category}>{category}</span>)}
          </div>
        </section>
      )}

      <section className="source-note">
        <b>기존 법령대조 기준 유지</b>
        <p><HighlightNumbers>{`${part.lawVersion} · ${content.source}`}</HighlightNumbers></p>
        <LawArticleButtons part={part} articles={extractArticleReferences(content.source)} />
      </section>
    </>
  )
}

function FocusedExistingContent({ focusView, content, part, focus }) {
  return (
    <>
      {focusView.matchingCore.length > 0 && (
        <section className="study-block exam-core-panel">
          <div className="study-block__title"><span>CORE</span><h3>시험 핵심 · {focus.label}</h3></div>
          <div className="exam-core-panel__grid">
            {focusView.matchingCore.map(([label, text], index) => (
              <article className="exam-core-item" key={`${label}-${index}`}>
                <span className="exam-core-item__index">{String(index + 1).padStart(2, '0')}</span>
                <div><strong>{label}</strong><p><HighlightNumbers>{text}</HighlightNumbers></p></div>
              </article>
            ))}
          </div>
        </section>
      )}

      {focusView.matchingUnderstanding.length > 0 && (
        <section className="study-block">
          <div className="study-block__title"><span>01</span><h3>기존 이해내용 재배치</h3></div>
          <div className="understanding-grid">
            {focusView.matchingUnderstanding.map(([title, body]) => (
              <div key={title}><b>{title}</b><p><HighlightNumbers>{body}</HighlightNumbers></p></div>
            ))}
          </div>
        </section>
      )}

      {focusView.matchingRows.length > 0 && (
        <section className="study-block">
          <div className="study-block__title"><span>02</span><h3>핵심정리·근거</h3></div>
          <div className="table-wrap">
            <table className="study-table">
              <thead><tr><th>구분</th><th>핵심 내용</th><th>근거·시험 포인트</th></tr></thead>
              <tbody>
                {focusView.matchingRows.map(([term, definition, pointText]) => (
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
      )}

      {focusView.matchingSections.map((section) => (
        <section className="study-block registration-focused-section" key={section.title}>
          <div className="study-block__title"><span>해설</span><h3>{section.title}</h3></div>
          <LawArticleButtons part={part} articles={extractArticleReferences(section.articles)} />
          <p><HighlightNumbers>{section.body}</HighlightNumbers></p>
          <ul>{(section.bullets || []).map((bullet) => <li key={bullet}><HighlightNumbers>{bullet}</HighlightNumbers></li>)}</ul>
          {section.exam && <div className="registration-focus-exam"><b>시험 포인트</b><span><HighlightNumbers>{section.exam}</HighlightNumbers></span></div>}
        </section>
      ))}

      {focusView.matchingTopics.map((topic) => (
        <section className="study-block registration-exam-topic" key={topic.title}>
          <div className="study-block__title"><span>DETAIL</span><h3>{topic.title}</h3></div>
          <LawArticleButtons part={part} articles={topic.articles} />
          <ul>{(topic.points || []).map((item) => <li key={item}><HighlightNumbers>{item}</HighlightNumbers></li>)}</ul>
          {topic.trap && <div className="registration-exam-topic__trap"><b>⚠ 오답유도</b><span>{topic.trap}</span></div>}
        </section>
      ))}

      {focusView.matchingUnderstanding.length === 0 && focusView.matchingRows.length === 0 && focusView.matchingSections.length === 0 && focusView.matchingTopics.length === 0 && (
        <section className="study-block"><p>{content.summary}</p></section>
      )}
    </>
  )
}

function FullExistingContent({ content, deepDive, examCore, examDetail, part }) {
  return (
    <>
      {examCore && (
        <section className="study-block exam-core-panel">
          <div className="study-block__title"><span>CORE</span><h3>{examCore.title}</h3></div>
          <div className="exam-core-panel__grid">
            {examCore.items.map(([label, text], index) => (
              <article className="exam-core-item" key={`${label}-${index}`}>
                <span className="exam-core-item__index">{String(index + 1).padStart(2, '0')}</span>
                <div><strong>{label}</strong><p><HighlightNumbers>{text}</HighlightNumbers></p></div>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="study-block">
        <div className="study-block__title"><span>01</span><h3>이 POINT를 먼저 이해하기</h3></div>
        <div className="understanding-grid">
          {content.understanding.map(([title, body]) => <div key={title}><b>{title}</b><p><HighlightNumbers>{body}</HighlightNumbers></p></div>)}
        </div>
      </section>

      <section className="study-block">
        <div className="study-block__title"><span>02</span><h3>전체 흐름</h3></div>
        <div className="hierarchy-flow">
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
                <tr key={term}><th>{term}</th><td><HighlightNumbers>{definition}</HighlightNumbers></td><td><HighlightNumbers>{pointText}</HighlightNumbers><LawArticleButtons part={part} articles={extractArticleReferences(pointText)} compact /></td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {(deepDive?.sections || []).map((section) => (
        <section className="study-block registration-focused-section" key={section.title}>
          <div className="study-block__title"><span>해설</span><h3>{section.title}</h3></div>
          <LawArticleButtons part={part} articles={extractArticleReferences(section.articles)} />
          <p>{section.body}</p>
          <ul>{(section.bullets || []).map((bullet) => <li key={bullet}><HighlightNumbers>{bullet}</HighlightNumbers></li>)}</ul>
          {section.exam && <div className="registration-focus-exam"><b>시험 포인트</b><span>{section.exam}</span></div>}
        </section>
      ))}

      {(examDetail?.topics || []).map((topic) => (
        <section className="study-block registration-exam-topic" key={topic.title}>
          <div className="study-block__title"><span>DETAIL</span><h3>{topic.title}</h3></div>
          <LawArticleButtons part={part} articles={topic.articles} />
          <ul>{topic.points.map((item) => <li key={item}><HighlightNumbers>{item}</HighlightNumbers></li>)}</ul>
          <div className="registration-exam-topic__trap"><b>⚠ 오답유도</b><span>{topic.trap}</span></div>
        </section>
      ))}

      <section className="study-block study-block--split">
        <div className="trap-card"><span>⚠️ 시험에서 자주 바꿔 출제하는 부분</span><ul>{content.traps.map((trap) => <li key={trap}>{trap}</li>)}</ul></div>
        <div className="memory-card"><span>🧠 암기</span><strong>{content.memory[0]}</strong><p>{content.memory[1]}</p></div>
      </section>
    </>
  )
}
