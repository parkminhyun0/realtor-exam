import { useMemo, useState } from 'react'
import { realEstateTheoryParts } from './data/realEstateTheory'
import { realEstateTheoryContent } from './data/realEstateTheoryContent'
import { realEstateTheoryHandoutContent } from './data/realEstateTheoryHandoutContent'
import { realEstateTheoryHandoutSupplements } from './data/realEstateTheoryHandoutSupplement'
import { realEstateTheoryCalculations } from './data/realEstateTheoryCalculations'
import { realEstateTheoryRelations } from './data/realEstateTheoryRelations'
import { realEstateTheoryExtraChapters, realEstateTheoryExtraContent, realEstateTheoryExtraRelations } from './data/realEstateTheoryExtra'
import TheoryPastQuestion from './TheoryPastQuestion'
import './real-estate-theory.css'

const NUMBER_PATTERN = /([①②③④⑤⑥⑦⑧⑨⑩]|\d+(?:[.,]\d+)*(?:\s*(?:개|종|일|년|월|㎡|m²|%|호|조|항|세대|층))?)/g

const theoryParts = realEstateTheoryParts.map((part) => (
  part.id === 'part8'
    ? { ...part, chapters: [...part.chapters, ...realEstateTheoryExtraChapters] }
    : part
))

const theoryChapterCount = theoryParts.reduce((sum, part) => sum + part.chapters.length, 0)
const calculationChapterCount = Object.keys(realEstateTheoryCalculations).length

const chapterMeta = Object.fromEntries(
  theoryParts.flatMap((part) => (
    part.chapters.map((chapter) => [chapter.id, { part, chapter }])
  )),
)

function mergeTheoryContent(base, supplement) {
  if (!base) return supplement
  if (!supplement) return base

  return {
    ...base,
    statusLabel: supplement.statusLabel || base.statusLabel,
    summary: [base.summary, supplement.summary].filter(Boolean).join(' '),
    verification: [...(base.verification || []), ...(supplement.verification || [])],
    sections: [...(base.sections || []), ...(supplement.sections || [])],
    tables: [...(base.tables || []), ...(supplement.tables || [])],
    traps: [...(base.traps || []), ...(supplement.traps || [])],
    sources: [...(base.sources || []), ...(supplement.sources || [])],
  }
}

function getTheoryContent(chapterId) {
  const base = realEstateTheoryExtraContent[chapterId]
    || realEstateTheoryHandoutContent[chapterId]
    || realEstateTheoryContent[chapterId]

  return mergeTheoryContent(base, realEstateTheoryHandoutSupplements[chapterId])
}

function getTheoryRelations(chapterId) {
  return [
    ...(realEstateTheoryRelations[chapterId] || []),
    ...(realEstateTheoryExtraRelations[chapterId] || []),
  ]
}

function HighlightNumbers({ children }) {
  if (typeof children !== 'string') return children
  const parts = children.split(NUMBER_PATTERN)
  return parts.map((part, index) => (
    index % 2 === 1
      ? <span className="theory-exam-number" key={`${part}-${index}`}>{part}</span>
      : part
  ))
}

function scrollToTheoryContentOnMobile() {
  if (!window.matchMedia('(max-width: 980px)').matches) return
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      const target = document.querySelector('.real-estate-theory-page .public-law-content')
      if (!target) return
      const header = document.querySelector('.site-header')
      const offset = (header?.offsetHeight || 0) + 12
      const top = target.getBoundingClientRect().top + window.scrollY - offset
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      window.scrollTo({ top: Math.max(0, top), behavior: reduceMotion ? 'auto' : 'smooth' })
    })
  })
}

export default function RealEstateTheoryPage({ onBack }) {
  const [selectedId, setSelectedId] = useState('p1c1')

  const selected = useMemo(() => chapterMeta[selectedId] || chapterMeta.p1c1, [selectedId])
  const chapterContent = getTheoryContent(selected.chapter.id)
  const calculations = realEstateTheoryCalculations[selected.chapter.id]
  const relations = getTheoryRelations(selected.chapter.id)

  const openChapter = (chapterId) => {
    setSelectedId(chapterId)
    scrollToTheoryContentOnMobile()
  }

  return (
    <main className="public-law-page real-estate-theory-page" id="main-content">
      <div className="public-law-topline">
        <button className="back-button" type="button" onClick={onBack}>← 전체 과목</button>
        <span>공인중개사 1차 · 부동산학개론</span>
      </div>

      <section className="public-law-hero">
        <div>
          <span className="eyebrow">REAL ESTATE PRINCIPLES · 제37회 대비</span>
          <h1>부동산학개론 핵심정리</h1>
          <p>첨부 교안의 기본이론을 공법·공시법과 동일한 학습 UI로 재구성하고, 핵심개념·전체 흐름·비교표·함정·암기·계산·연결 학습을 한 구조로 정리합니다.</p>
        </div>
        <div className="public-law-hero__badges" aria-label="부동산학개론 학습 구성">
          <span>8개 대단원</span>
          <span>{theoryChapterCount}개 장</span>
          <span>🧮 계산 {calculationChapterCount}개 장 강화</span>
          <span>연결 학습 적용</span>
        </div>
      </section>

      <div className="public-law-layout">
        <aside className="public-law-nav" aria-label="부동산학개론 목차">
          <div className="public-law-nav__title">
            <strong>부동산학개론</strong>
            <span>대단원 → 장 → 본문 · 공법/공시법 공통 구조</span>
          </div>

          {theoryParts.map((part) => (
            <details key={part.id} open={part.chapters.some((chapter) => chapter.id === selectedId)}>
              <summary>
                <i style={{ background: part.color }} />
                <span>제{Number(part.number)}편 {part.title}</span>
              </summary>
              <ul>
                {part.chapters.map((chapter) => (
                  <li key={chapter.id}>
                    <button
                      type="button"
                      className={selectedId === chapter.id ? 'active' : ''}
                      onClick={() => openChapter(chapter.id)}
                    >
                      <span>제{Number(chapter.number)}장 · {chapter.title}</span>
                      <span className="theory-nav__badges">
                        {realEstateTheoryCalculations[chapter.id] && <b className="theory-nav__calc">계산</b>}
                        {getTheoryContent(chapter.id)
                          ? <b className="theory-nav__ready">본문</b>
                          : <small>목차</small>}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </details>
          ))}
        </aside>

        <article className="public-law-content">
          <div className="public-law-breadcrumb">
            제{Number(selected.part.number)}편 {selected.part.title} <span>›</span> 제{Number(selected.chapter.number)}장 {selected.chapter.title}
          </div>

          <header className="study-section-heading" style={{ '--chapter-color': selected.part.color }}>
            <div>
              <span className="study-section-heading__number">{selected.chapter.number}</span>
              <div>
                <span className="study-section-heading__chapter">제{Number(selected.part.number)}편 · {selected.part.title}</span>
                <h2>{selected.chapter.title}</h2>
              </div>
            </div>
            <span className="law-reference">
              {chapterContent
                ? (chapterContent.statusLabel || '검증 본문 반영 · 2026 기준')
                : '목차 확정 · 본문 검증 진행 중'}
            </span>
          </header>

          {chapterContent
            ? (
              <TheoryStudyContent
                content={chapterContent}
                chapter={selected.chapter}
                calculations={calculations}
                relations={relations}
                onOpenRelation={openChapter}
              />
            )
            : (
              <TheoryTocOnly
                chapter={selected.chapter}
                relations={relations}
                onOpenRelation={openChapter}
              />
            )}
        </article>
      </div>
    </main>
  )
}

function TheoryStudyContent({ content, chapter, calculations, relations, onOpenRelation }) {
  const isHandoutContent = content.statusLabel?.includes('교안')

  return (
    <>
      <div className="study-tldr">
        <span>📌 핵심 한줄</span>
        <strong><HighlightNumbers>{content.headline}</HighlightNumbers></strong>
        <p><HighlightNumbers>{content.summary}</HighlightNumbers></p>
      </div>

      <section className="study-block theory-basis-panel">
        <div className="study-block__title"><span>핵심</span><h3>시험 핵심 · 근거 구분</h3></div>
        <p className="study-note">법령에 직접 정의된 내용과 부동산학의 시험이론을 같은 층위로 섞지 않고 구분해서 표시합니다.</p>
        <div className="understanding-grid">
          {content.verification.map((item) => (
            <div className={`theory-basis-card theory-basis-card--${item.kind}`} key={item.label}>
              <b>{item.label}</b>
              <p><HighlightNumbers>{item.value}</HighlightNumbers></p>
            </div>
          ))}
        </div>
      </section>

      <section className="study-block">
        <div className="study-block__title"><span>01</span><h3>전체 흐름</h3></div>
        <div className="hierarchy-flow" aria-label={`${chapter.title} 전체 흐름`}>
          {content.sections.map((section, index) => (
            <div className="hierarchy-flow__group" key={section.title}>
              <div className="hierarchy-flow__step">
                <small>STEP {index + 1}</small>
                <strong>{section.title}</strong>
              </div>
              {index < content.sections.length - 1 && <span className="hierarchy-flow__arrow">→</span>}
            </div>
          ))}
        </div>
      </section>

      {content.sections.map((section, sectionIndex) => (
        <section className="study-block" key={section.title}>
          <div className="study-block__title">
            <span>{String(sectionIndex + 2).padStart(2, '0')}</span>
            <h3>{section.title}</h3>
          </div>
          <p className="study-note"><HighlightNumbers>{section.note}</HighlightNumbers></p>
          <div className="understanding-grid">
            {section.items.map(([term, body]) => (
              <div key={term}>
                <b><HighlightNumbers>{term}</HighlightNumbers></b>
                <p><HighlightNumbers>{body}</HighlightNumbers></p>
              </div>
            ))}
          </div>
        </section>
      ))}

      {content.tables?.map((table, index) => (
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
                        ? <th key={`${cell}-${cellIndex}`}><HighlightNumbers>{cell}</HighlightNumbers></th>
                        : <td key={`${cell}-${cellIndex}`}><HighlightNumbers>{cell}</HighlightNumbers></td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}

      {content.keyList && (
        <section className="study-block">
          <div className="study-block__title"><span>법</span><h3><HighlightNumbers>{content.keyList.title}</HighlightNumbers></h3></div>
          <div className="system-note__items theory-key-items" aria-label={content.keyList.title}>
            {content.keyList.items.map((item) => <span key={item}><HighlightNumbers>{item}</HighlightNumbers></span>)}
          </div>
        </section>
      )}

      <TheoryCalculationSection calculations={calculations} />

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

      <RelationSection relations={relations} onOpenRelation={onOpenRelation} />

      <section className="source-note theory-source-note">
        <b>확인 가능한 근거</b>
        <p>
          {isHandoutContent
            ? '첨부 교안의 핵심을 현재 목차에 맞게 재구성했습니다. 법령형 숫자·요건은 교안의 이론 설명과 분리하고, 현행 법령을 확인한 경우에만 별도 표시합니다.'
            : '법령은 국가법령정보센터, 시험범위·기출은 Q-Net을 우선하고, 비법령 이론은 별도로 구분합니다.'}
        </p>
        <div className="theory-source-links">
          {content.sources.map((source) => (
            <TheorySourceItem source={source} key={`${source.label}-${source.detail}`} />
          ))}
        </div>
      </section>
    </>
  )
}

function TheoryCalculationSection({ calculations }) {
  if (!calculations?.cards?.length) return null

  return (
    <section className="study-block theory-calculations" aria-label="계산문제 공식과 계산기 최단풀이">
      <div className="study-block__title"><span>🧮</span><h3>{calculations.title}</h3></div>
      <p className="study-note">{calculations.note}</p>
      <div className="theory-calculation-grid">
        {calculations.cards.map((item, index) => (
          <article className="theory-calc-card" key={`${item.title}-${item.source}`}>
            <header className="theory-calc-card__head">
              <span>{String(index + 1).padStart(2, '0')}</span>
              <div>
                <strong>{item.title}</strong>
                <small>{item.source}</small>
              </div>
            </header>

            <div className="theory-calc-formula">
              <span>공식</span>
              <code><HighlightNumbers>{item.formula}</HighlightNumbers></code>
            </div>

            <div className="theory-calc-body">
              <div>
                <b>문제에서 이 말이 나오면</b>
                <p><HighlightNumbers>{item.when}</HighlightNumbers></p>
              </div>
              <div>
                <b>먼저 찾을 값</b>
                <p><HighlightNumbers>{item.find}</HighlightNumbers></p>
              </div>
            </div>

            <div className="theory-calc-steps">
              <b>계산 순서</b>
              <ol>
                {item.steps.map((step) => <li key={step}><HighlightNumbers>{step}</HighlightNumbers></li>)}
              </ol>
            </div>

            <div className="theory-calc-keypad">
              <b>⌨ 계산기 최단입력</b>
              <code><HighlightNumbers>{item.calculator}</HighlightNumbers></code>
            </div>

            {item.example && (
              <div className="theory-calc-example">
                <b>예시</b>
                <p><HighlightNumbers>{item.example}</HighlightNumbers></p>
                {item.result && <strong>→ <HighlightNumbers>{item.result}</HighlightNumbers></strong>}
              </div>
            )}

            <TheoryPastQuestion cardTitle={item.title} />

            <div className="theory-calc-trap">
              <b>⚠️ 계산 함정</b>
              <p><HighlightNumbers>{item.trap}</HighlightNumbers></p>
            </div>

            {item.tip && (
              <div className="theory-calc-tip">
                <b>💡 최단풀이 팁</b>
                <p><HighlightNumbers>{item.tip}</HighlightNumbers></p>
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  )
}

function TheorySourceItem({ source }) {
  const body = (
    <>
      <span>{source.type}</span>
      <strong>{source.label}</strong>
      <small><HighlightNumbers>{source.detail}</HighlightNumbers></small>
      <b aria-hidden="true">{source.url ? '↗' : '자료'}</b>
    </>
  )

  if (source.url) {
    return (
      <a className="theory-source-item" href={source.url} target="_blank" rel="noreferrer">
        {body}
      </a>
    )
  }

  return <div className="theory-source-item theory-source-item--static">{body}</div>
}

function TheoryTocOnly({ chapter, relations, onOpenRelation }) {
  const flowItems = chapter.sections.map((section) => section.title)

  return (
    <>
      <div className="study-tldr theory-tldr--pending">
        <span>📌 현재 단계</span>
        <strong>{chapter.title}의 목차는 확정되었고, 검증 가능한 본문을 채우는 단계입니다.</strong>
        <p>확인되지 않은 법령·수치·정의를 임의로 넣지 않고, 법령·공식자료·기출을 확인한 내용부터 순차적으로 공개합니다.</p>
      </div>

      <section className="study-block">
        <div className="study-block__title"><span>01</span><h3>이 장에서 공부할 내용</h3></div>
        <div className="understanding-grid">
          {chapter.sections.map((section) => (
            <div key={section.title}>
              <b>{section.title}</b>
              <p>{section.items.length > 0 ? section.items.join(' · ') : '세부 항목은 본문 검증 단계에서 확장합니다.'}</p>
            </div>
          ))}
        </div>
      </section>

      {flowItems.length > 0 && (
        <section className="study-block">
          <div className="study-block__title"><span>02</span><h3>전체 흐름</h3></div>
          <div className="hierarchy-flow" aria-label={`${chapter.title} 목차 흐름`}>
            {flowItems.map((item, index) => (
              <div className="hierarchy-flow__group" key={item}>
                <div className="hierarchy-flow__step">
                  <small>STEP {index + 1}</small>
                  <strong>{item}</strong>
                </div>
                {index < flowItems.length - 1 && <span className="hierarchy-flow__arrow">→</span>}
              </div>
            ))}
          </div>
        </section>
      )}

      <RelationSection relations={relations} onOpenRelation={onOpenRelation} />

      <section className="source-note">
        <b>본문 검증 원칙</b>
        <p>법령상 정의와 시험이론을 구분하고, 공식자료로 확인 가능한 근거를 붙인 뒤 “본문” 상태로 전환합니다.</p>
      </section>
    </>
  )
}

function RelationSection({ relations, onOpenRelation }) {
  if (!relations.length) return null

  return (
    <section className="study-block theory-relations" aria-label="연결 학습">
      <div className="study-block__title"><span>🔗</span><h3>연결 학습</h3></div>
      <p className="study-note">이 장과 개념적으로 직접 이어지는 목차입니다. 카드를 누르면 해당 장으로 바로 이동합니다.</p>
      <div className="theory-relation-grid">
        {relations.map((relation) => {
          const target = chapterMeta[relation.target]
          if (!target) return null
          return (
            <button
              type="button"
              className="theory-relation-card"
              key={`${relation.target}-${relation.type}-${relation.reason}`}
              onClick={() => onOpenRelation(relation.target)}
            >
              <span className="theory-relation-card__type">{relation.type}</span>
              <strong>제{Number(target.part.number)}편 · 제{Number(target.chapter.number)}장 {target.chapter.title}</strong>
              <p>{relation.reason}</p>
              <small>해당 내용으로 이동 →</small>
            </button>
          )
        })}
      </div>
    </section>
  )
}
