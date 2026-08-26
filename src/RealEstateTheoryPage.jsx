import { useMemo, useState } from 'react'
import { realEstateTheoryChapterCount, realEstateTheoryParts } from './data/realEstateTheory'
import { realEstateTheoryContent } from './data/realEstateTheoryContent'
import './real-estate-theory.css'

const NUMBER_PATTERN = /([①②③④⑤⑥⑦⑧⑨⑩]|\d+(?:[.,]\d+)*(?:\s*(?:개|종|일|년|월|㎡|m²|%|호|조|항|세대|층))?)/g

function HighlightNumbers({ children }) {
  if (typeof children !== 'string') return children
  const parts = children.split(NUMBER_PATTERN)
  return parts.map((part, index) => (
    index % 2 === 1
      ? <span className="theory-exam-number" key={`${part}-${index}`}>{part}</span>
      : part
  ))
}

export default function RealEstateTheoryPage({ onBack }) {
  const [selectedId, setSelectedId] = useState('p1c1')

  const selected = useMemo(() => {
    for (const part of realEstateTheoryParts) {
      const chapter = part.chapters.find((item) => item.id === selectedId)
      if (chapter) return { part, chapter }
    }
    return { part: realEstateTheoryParts[0], chapter: realEstateTheoryParts[0].chapters[0] }
  }, [selectedId])

  const chapterContent = realEstateTheoryContent[selected.chapter.id]

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
          <p>법령에 정의된 내용과 부동산학 시험이론을 구분하고, 국가법령정보센터·Q-Net 등 확인 가능한 근거를 함께 표시합니다.</p>
        </div>
        <div className="public-law-hero__badges" aria-label="부동산학개론 학습 구성">
          <span>8개 대단원</span>
          <span>{realEstateTheoryChapterCount}개 장</span>
          <span>법령·이론 구분</span>
          <span>출처 확인 가능</span>
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
                      {realEstateTheoryContent[chapter.id]
                        ? <b className="theory-nav__ready">본문</b>
                        : <small>목차</small>}
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
            <span className="law-reference">
              {chapterContent ? '검증 본문 반영 · 2026 기준' : '목차 구축 완료 · 본문 검증 예정'}
            </span>
          </header>

          {chapterContent
            ? <TheoryStudyContent content={chapterContent} chapter={selected.chapter} color={selected.part.color} />
            : <TheoryTocOnly chapter={selected.chapter} />}
        </article>
      </div>
    </main>
  )
}

function TheoryStudyContent({ content, chapter, color }) {
  return (
    <>
      <section className="theory-study-intro" style={{ '--chapter-color': color }}>
        <span>{content.eyebrow}</span>
        <strong><HighlightNumbers>{content.headline}</HighlightNumbers></strong>
        <p><HighlightNumbers>{content.summary}</HighlightNumbers></p>
      </section>

      <section className="theory-verification" aria-label="근거 구분">
        {content.verification.map((item) => (
          <article key={item.label} className={`theory-verification__item theory-verification__item--${item.kind}`}>
            <span>{item.label}</span>
            <strong><HighlightNumbers>{item.value}</HighlightNumbers></strong>
          </article>
        ))}
      </section>

      {content.sections.map((section, sectionIndex) => (
        <section className="study-block theory-study-block" key={section.title}>
          <div className="study-block__title">
            <span>{String(sectionIndex + 1).padStart(2, '0')}</span>
            <h3>{section.title}</h3>
          </div>
          <p className="theory-study-block__note"><HighlightNumbers>{section.note}</HighlightNumbers></p>
          <div className="theory-detail-grid">
            {section.items.map(([term, body]) => (
              <article className="theory-detail-card" key={term}>
                <div className="theory-detail-card__label">
                  <strong><HighlightNumbers>{term}</HighlightNumbers></strong>
                  <span>시험 핵심</span>
                </div>
                <p><HighlightNumbers>{body}</HighlightNumbers></p>
              </article>
            ))}
          </div>
        </section>
      ))}

      {content.tables?.map((table, index) => (
        <section className="study-block" key={table.title}>
          <div className="study-block__title"><span>표{index + 1}</span><h3>{table.title}</h3></div>
          <div className="table-wrap">
            <table className="study-table theory-study-table">
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
        <section className="study-block theory-key-list">
          <div className="study-block__title"><span>법</span><h3><HighlightNumbers>{content.keyList.title}</HighlightNumbers></h3></div>
          <div className="theory-key-list__items">
            {content.keyList.items.map((item, index) => (
              <span key={item}><b>{String(index + 1).padStart(2, '0')}</b>{item}</span>
            ))}
          </div>
        </section>
      )}

      <section className="study-block study-block--split theory-trap-memory">
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

      <section className="theory-sources" aria-label={`${chapter.title} 확인 출처`}>
        <div className="theory-sources__heading">
          <div>
            <span>SOURCES</span>
            <h3>확인 가능한 근거</h3>
          </div>
          <p>법령은 국가법령정보센터, 시험범위·기출은 Q-Net을 우선합니다. 비법령 이론은 그 성격을 따로 표시했습니다.</p>
        </div>
        <div className="theory-sources__list">
          {content.sources.map((source) => (
            <a key={`${source.label}-${source.detail}`} href={source.url} target="_blank" rel="noreferrer">
              <span className={`theory-source-type theory-source-type--${source.type === '법령' ? 'law' : source.type === '공식' ? 'official' : 'reference'}`}>{source.type}</span>
              <span>
                <strong>{source.label}</strong>
                <small><HighlightNumbers>{source.detail}</HighlightNumbers></small>
              </span>
              <b aria-hidden="true">↗</b>
            </a>
          ))}
        </div>
        <div className="theory-source-caution">
          <b>근거 구분 원칙</b>
          <p>“법령상 정의”와 “공인중개사 시험이론”을 동일한 수준의 법적 정의로 취급하지 않습니다. 법률별로 같은 용어의 정의가 달라질 수 있는 경우에는 해당 법률의 문맥을 우선합니다.</p>
        </div>
      </section>
    </>
  )
}

function TheoryTocOnly({ chapter }) {
  return (
    <>
      <section className="theory-toc-intro">
        <span>TABLE OF CONTENTS</span>
        <strong>이 장에서 공부할 세부 목차</strong>
        <p>현재는 목차가 확정된 상태입니다. 법령·공식자료·기출을 확인한 뒤 검증된 본문으로 순차 확장합니다.</p>
      </section>

      <section className="theory-section-list" aria-label={`${chapter.title} 세부 목차`}>
        {chapter.sections.map((section, index) => (
          <article className="theory-section-card" key={`${chapter.id}-${section.title}`}>
            <div className="theory-section-card__head">
              <span>{String(index + 1).padStart(2, '0')}</span>
              <h3>{section.title}</h3>
            </div>
            {section.items.length > 0 ? (
              <ol className="theory-topic-list">
                {section.items.map((item) => <li key={item}>{item}</li>)}
              </ol>
            ) : (
              <p className="theory-topic-empty">세부 항목은 본문 검증 단계에서 확장합니다.</p>
            )}
          </article>
        ))}
      </section>

      <section className="theory-next-step" aria-label="다음 구축 단계">
        <div>
          <span>NEXT STEP</span>
          <strong>법령·기출 검증 후 본문을 채웁니다.</strong>
        </div>
        <p>확인되지 않은 수치·법령·정의를 임의로 채우지 않고, 검증 완료된 장부터 “본문” 표시로 전환합니다.</p>
      </section>
    </>
  )
}
