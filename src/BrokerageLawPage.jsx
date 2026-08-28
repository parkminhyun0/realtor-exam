import { useMemo, useState } from 'react'
import LawTextViewer from './LawTextViewer'
import {
  brokerageLawCategories,
  brokerageMajorCount,
  brokerageMiddleCount,
  brokerageLeafCount,
  brokerageReadyMiddleCount,
  brokerageReadyLeafCount,
  findBrokerageMiddle,
} from './data/brokerageLawHierarchy'
import {
  brokerageExamSource,
  brokerageExpandedContent,
} from './data/brokerageLawExpandedContent'
import './brokerage-law.css'

const NUMBER_TOKEN = /^(5배|5년|3년|2년|10일|3개월|6개월|300만원|45시간|7일|2주일|2주|4억원|2억원|3년|5년|30일|15일)$/
const NUMBER_SPLIT = /(5배|5년|3년|2년|10일|3개월|6개월|300만원|45시간|7일|2주일|2주|4억원|2억원|30일|15일)/g

function Highlight({ children }) {
  if (typeof children !== 'string') return children
  return children.split(NUMBER_SPLIT).map((piece, index) => (
    NUMBER_TOKEN.test(piece)
      ? <span className="brokerage-exam-number" key={`${piece}-${index}`}>{piece}</span>
      : piece
  ))
}

function LawButtons({ lawName, articles = [], onOpenLaw, compact = false }) {
  if (!lawName || !articles.length || lawName === '중개실무') return null
  return (
    <div className={`brokerage-law-articles${compact ? ' brokerage-law-articles--compact' : ''}`} aria-label="관련 법령">
      {!compact && <span>법령 원문</span>}
      {articles.map((article) => (
        <button key={`${lawName}-${article}`} type="button" onClick={() => onOpenLaw(lawName, article)} title={`${lawName} ${article} 본문 보기`}>
          {lawName} {article}
        </button>
      ))}
    </div>
  )
}

function findContext(index, content) {
  const core = content?.examCore?.[index % (content.examCore.length || 1)] || ['핵심 판정', '법령 요건과 주체를 먼저 확인합니다.']
  const trap = content?.traps?.[index % (content.traps.length || 1)] || '비슷한 제도의 주체·기간·효과를 바꾼 선지를 주의합니다.'
  return { core, trap }
}

function LeafStudyCards({ selected, content, onOpenLaw, targetLeafId }) {
  return (
    <section className="study-block brokerage-leaf-study" aria-label={`${selected.title} 소분류 상세`}>
      <header className="brokerage-leaf-study__head">
        <div>
          <span>4단계 · 소분류</span>
          <h3>{selected.title} 세부 논점 {selected.leaves.length}개</h3>
          <p>각 소분류를 법조문·핵심 판정·시험 함정과 연결하여 바로 복습하도록 분해했습니다.</p>
        </div>
        <b>{selected.leaves.length}/{selected.leaves.length}</b>
      </header>
      <div className="brokerage-leaf-grid">
        {selected.leaves.map((item, index) => {
          const context = findContext(index, content)
          return (
            <article
              className={`brokerage-leaf-card${targetLeafId === item.id ? ' is-target' : ''}`}
              id={`brokerage-leaf-${item.id}`}
              key={item.id}
              tabIndex="-1"
            >
              <header>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <div><small>소분류 · LEAF</small><h4>{item.title}</h4></div>
              </header>
              <dl>
                <div><dt>핵심 판정</dt><dd><Highlight>{item.note || context.core[1]}</Highlight></dd></div>
                <div><dt>시험 연결</dt><dd><b>{context.core[0]}</b> · <Highlight>{context.core[1]}</Highlight></dd></div>
                <div className="is-trap"><dt>함정</dt><dd><Highlight>{context.trap}</Highlight></dd></div>
                <div className="is-memory"><dt>암기</dt><dd><Highlight>{content?.memory?.[0] || `${selected.title}의 주체·요건·효과를 순서대로 정리`}</Highlight></dd></div>
              </dl>
              <LawButtons lawName={selected.lawName} articles={selected.articles} onOpenLaw={onOpenLaw} compact />
            </article>
          )
        })}
      </div>
    </section>
  )
}

function DetailedStudy({ selected, content, onOpenLaw, targetLeafId }) {
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
            <h3>⭐ {selected.title}에서 먼저 잡아야 할 핵심</h3>
            <p>주체 → 요건 → 기간·숫자 → 효과 → 제재 순으로 정답 선지를 판정합니다.</p>
          </div>
        </div>
        <div className="brokerage-exam-core__grid">
          {content.examCore.map(([label, text], index) => (
            <article key={`${label}-${index}`}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <div><strong>{label}</strong><p><Highlight>{text}</Highlight></p></div>
            </article>
          ))}
        </div>
      </section>

      <section className="study-block brokerage-legal-basis">
        <div className="study-block__title"><span>법령</span><h3>제37회 시험 기준 근거법령</h3></div>
        <p className="brokerage-legal-basis__intro">
          첨부 법률 제21024호를 기본 원문으로 하고, 프로젝트 컷오프 안의 2026.2.27 법률 개정과 2025.10.21 시행령 개정을 보완 반영합니다.
        </p>
        <div className="brokerage-legal-basis__grid">
          <article>
            <strong>{selected.lawName}</strong>
            <p>{selected.articles.length ? selected.articles.join(' · ') : '중개실무 종합논점'}</p>
            <LawButtons lawName={selected.lawName} articles={selected.articles} onOpenLaw={onOpenLaw} />
          </article>
          <article className="brokerage-source-card">
            <strong>법령 기준</strong>
            <p>{brokerageExamSource.attached}</p>
            <p>{brokerageExamSource.supplement}</p>
            <p>{brokerageExamSource.subordinate}</p>
          </article>
        </div>
      </section>

      <LeafStudyCards selected={selected} content={content} onOpenLaw={onOpenLaw} targetLeafId={targetLeafId} />

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

function OutlineStudy({ selected, onOpenLaw, targetLeafId }) {
  return (
    <>
      <div className="study-tldr brokerage-study-tldr">
        <span>📚 세부 목차 공개</span>
        <strong>{selected.title}</strong>
        <p>4단계 카테고리는 먼저 확정했습니다. 이 영역은 관련 법령·실무 자료를 기준으로 소분류별 상세본문을 순차 검증·확장합니다.</p>
      </div>
      <LeafStudyCards
        selected={selected}
        content={{ examCore: [['상세화 대기', '현재는 시험 범위와 소분류 위치를 먼저 고정한 상태입니다.']], traps: ['검증 전 수치·기간을 임의로 채우지 않습니다.'], memory: ['목차 위치 먼저 고정', '관련 법령과 기출을 대조한 뒤 상세 내용을 채웁니다.'] }}
        onOpenLaw={onOpenLaw}
        targetLeafId={targetLeafId}
      />
    </>
  )
}

function BrokerageNav({ selectedId, onSelectMiddle, onSelectLeaf }) {
  return (
    <aside className="public-law-nav brokerage-law-nav" aria-label="공인중개사법령 및 중개실무 4단계 목차" data-mobile-toc>
      <div className="public-law-nav__title"><strong>중개사법</strong><span>카테고리 → 대분류 → 중분류 → 소분류</span></div>
      {brokerageLawCategories.map((category) => {
        const categoryActive = category.majors.some((major) => major.middles.some((middle) => middle.id === selectedId))
        return (
          <details className="brokerage-category" key={category.id} open={categoryActive}>
            <summary><i style={{ background: category.color }} /><span>카테고리 {category.number} · {category.title}</span></summary>
            <div className="brokerage-category__body">
              {category.majors.map((major) => {
                const majorActive = major.middles.some((middle) => middle.id === selectedId)
                return (
                  <details className="brokerage-major" key={major.id} open={majorActive}>
                    <summary><span>대분류 {major.number}</span><b>{major.title}</b></summary>
                    <ol className="brokerage-middle-nav">
                      {major.middles.map((middle) => {
                        const middleActive = middle.id === selectedId
                        return (
                          <li key={middle.id}>
                            <button className={middleActive ? 'active' : ''} type="button" onClick={() => onSelectMiddle(middle.id)}>
                              <span><small>중분류 {middle.number}</small>{middle.title}</span>
                              <b className={`brokerage-nav__status${middle.status === 'ready' ? '' : ' brokerage-nav__status--outline'}`}>{middle.status === 'ready' ? '상세' : '목차'}</b>
                            </button>
                            {middleActive && (
                              <ol className="brokerage-leaf-nav" aria-label={`${middle.title} 소분류`}>
                                {middle.leaves.map((leaf, index) => (
                                  <li key={leaf.id}>
                                    <button type="button" onClick={() => onSelectLeaf(middle.id, leaf.id)}>
                                      <span>{String(index + 1).padStart(2, '0')}</span><b>{leaf.title}</b>
                                    </button>
                                  </li>
                                ))}
                              </ol>
                            )}
                          </li>
                        )
                      })}
                    </ol>
                  </details>
                )
              })}
            </div>
          </details>
        )
      })}
    </aside>
  )
}

export default function BrokerageLawPage({ onBack }) {
  const [selectedId, setSelectedId] = useState('ba01m01')
  const [targetLeafId, setTargetLeafId] = useState(null)
  const [lawTarget, setLawTarget] = useState(null)

  const selected = useMemo(() => findBrokerageMiddle(selectedId), [selectedId])
  const content = brokerageExpandedContent[selected.id]

  const selectMiddle = (id) => {
    setTargetLeafId(null)
    setLawTarget(null)
    setSelectedId(id)
  }

  const selectLeaf = (middleId, leafId) => {
    setLawTarget(null)
    setSelectedId(middleId)
    setTargetLeafId(leafId)
    window.setTimeout(() => {
      document.getElementById(`brokerage-leaf-${leafId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      document.getElementById(`brokerage-leaf-${leafId}`)?.focus({ preventScroll: true })
    }, 80)
  }

  const openLaw = (lawName, article) => setLawTarget({ subjectId: 'brokerage-law', lawName, article })

  return (
    <>
      <main className="public-law-page brokerage-law-page" id="main-content" data-subject-page="brokerage-law" data-brokerage-hierarchy="4-level">
        <div className="public-law-topline">
          <button className="back-button" type="button" onClick={onBack}>← 전체 과목</button>
          <span>공인중개사 2차 · 공인중개사법령 및 중개실무</span>
        </div>

        <section className="public-law-hero brokerage-law-hero">
          <div>
            <span className="eyebrow">BROKERAGE LAW · 제37회 시험준비</span>
            <h1>공인중개사법령 및 중개실무 완전정리</h1>
            <p>법령 → 대주제 → 세부제도 → 출제논점의 4단계 구조로 정리하고, 숫자·기한·주체·필요적/임의적 처분을 시험형으로 반복합니다.</p>
          </div>
          <div className="public-law-hero__badges">
            <span>{brokerageLawCategories.length} 카테고리</span>
            <span>{brokerageMajorCount} 대분류</span>
            <span>{brokerageMiddleCount} 중분류</span>
            <span>{brokerageLeafCount} 소분류</span>
          </div>
        </section>

        <section className="brokerage-progress" aria-label="중개사법 상세화 진행상황">
          <div><span>4단계 분류</span><strong>카테고리 → 대분류 → 중분류 → 소분류</strong></div>
          <div><span>상세본문</span><strong>{brokerageReadyMiddleCount}/{brokerageMiddleCount} 중분류 · {brokerageReadyLeafCount}/{brokerageLeafCount} 소분류</strong></div>
          <div><span>시험 법령 컷오프</span><strong>~ 2026.5.31 공포·개정</strong></div>
        </section>

        <section className="study-guide" aria-label="법령 기준">
          <span className="study-guide__label">LAW-FIRST</span>
          <strong>{brokerageExamSource.attached}</strong>
          <span>{brokerageExamSource.supplement} · {brokerageExamSource.cutoff}</span>
        </section>

        <div className="public-law-layout" data-mobile-toc-layout>
          <BrokerageNav selectedId={selectedId} onSelectMiddle={selectMiddle} onSelectLeaf={selectLeaf} />

          <article className="public-law-content" data-mobile-toc-content>
            <div className="public-law-breadcrumb">
              {selected.category.title} <span>›</span> {selected.major.title} <span>›</span> {selected.title}
            </div>
            <header className="study-section-heading" style={{ '--chapter-color': selected.category.color }}>
              <div>
                <span className="study-section-heading__number">{selected.number}</span>
                <div>
                  <span className="study-section-heading__chapter">카테고리 {selected.category.number} · 대분류 {selected.major.number}</span>
                  <h2>{selected.title}</h2>
                </div>
              </div>
              <span className="law-reference">{content ? `상세 · 소분류 ${selected.leaves.length}개` : `목차 · 소분류 ${selected.leaves.length}개`}</span>
            </header>

            {content
              ? <DetailedStudy selected={selected} content={content} onOpenLaw={openLaw} targetLeafId={targetLeafId} />
              : <OutlineStudy selected={selected} onOpenLaw={openLaw} targetLeafId={targetLeafId} />}
          </article>
        </div>
      </main>

      <LawTextViewer open={Boolean(lawTarget)} target={lawTarget} onClose={() => setLawTarget(null)} />
    </>
  )
}
