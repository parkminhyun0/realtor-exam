import { useMemo, useState } from 'react'
import { publicLawChapters, publicLawGeneralTerms, publicLawHierarchy } from './data/publicLaw'

export default function PublicLawPage({ onBack }) {
  const [selectedId, setSelectedId] = useState('c1s1')
  const selected = useMemo(() => {
    for (const chapter of publicLawChapters) {
      const section = chapter.sections.find((item) => item.id === selectedId)
      if (section) return { chapter, section }
    }
    return { chapter: publicLawChapters[0], section: publicLawChapters[0].sections[0] }
  }, [selectedId])

  return (
    <main className="public-law-page" id="main-content">
      <div className="public-law-topline">
        <button className="back-button" type="button" onClick={onBack}>← 전체 과목</button>
        <span>공인중개사 2차 · 부동산공법</span>
      </div>

      <section className="public-law-hero">
        <div>
          <span className="eyebrow">PUBLIC LAW · 2026</span>
          <h1>부동산공법 핵심정리</h1>
          <p>국토계획법 · 도시개발법 · 도시정비법 · 건축법 · 주택법 · 농지법을 한 구조 안에서 공부합니다.</p>
        </div>
        <div className="public-law-hero__badges">
          <span>6개 법률</span>
          <span>선택한 절만 표시</span>
          <span>절차·비교·함정 중심</span>
        </div>
      </section>

      <div className="public-law-layout">
        <aside className="public-law-nav" aria-label="부동산공법 목차">
          <div className="public-law-nav__title">
            <strong>부동산공법</strong>
            <span>전체 목차</span>
          </div>
          {publicLawChapters.map((chapter) => (
            <details key={chapter.id} open={chapter.sections.some((item) => item.id === selectedId)}>
              <summary>
                <i style={{ background: chapter.color }} />
                <span>제{chapter.number}장 {chapter.shortTitle}</span>
              </summary>
              <ul>
                {chapter.sections.map((section) => (
                  <li key={section.id}>
                    <button
                      type="button"
                      className={selectedId === section.id ? 'active' : ''}
                      onClick={() => setSelectedId(section.id)}
                    >
                      <span>{section.title}</span>
                      {section.ready ? <b>공개</b> : <small>편입 중</small>}
                    </button>
                  </li>
                ))}
              </ul>
            </details>
          ))}
        </aside>

        <article className="public-law-content">
          <div className="public-law-breadcrumb">
            제{selected.chapter.number}장 {selected.chapter.shortTitle} <span>›</span> {selected.section.title}
          </div>

          {selected.section.ready ? <GeneralSection chapter={selected.chapter} /> : <ImportingSection chapter={selected.chapter} section={selected.section} />}
        </article>
      </div>
    </main>
  )
}

function GeneralSection({ chapter }) {
  return (
    <>
      <header className="study-section-heading" style={{ '--chapter-color': chapter.color }}>
        <div>
          <span className="study-section-heading__number">01</span>
          <div>
            <span className="study-section-heading__chapter">제1장 국토계획법</span>
            <h2>제1절 총칙</h2>
          </div>
        </div>
        <span className="law-reference">국토의 계획 및 이용에 관한 법률</span>
      </header>

      <div className="study-tldr">
        <span>📌 핵심 한줄</span>
        <strong>국가계획 → 광역도시계획 → 도시·군기본계획 → 도시·군관리계획</strong>
        <p>큰 방향에서 실제 토지 규제로 내려가는 계획 위계를 먼저 잡으면 뒤의 용도지역·시설사업·개발행위허가가 연결됩니다.</p>
      </div>

      <section className="study-block">
        <div className="study-block__title"><span>01</span><h3>이 절을 먼저 이해하기</h3></div>
        <div className="understanding-grid">
          <div><b>제도의 목적·의미</b><p>국토계획법 전체 구조를 잡는 출발점입니다. 계획의 위계와 각 계획의 역할을 구분하는 것이 핵심입니다.</p></div>
          <div><b>법률상 구조</b><p>광역도시계획과 도시·군기본계획은 장기 방향을, 도시·군관리계획은 용도지역·지구·구역·기반시설 등 실제 규제를 구체화합니다.</p></div>
          <div><b>문제 판단 순서</b><p>상위 방향계획인지 실제 규제·결정계획인지 먼저 구분한 뒤 수립권자·결정권자·효력발생시점을 확인합니다.</p></div>
          <div><b>자주 틀리는 포인트</b><p>광역도시계획을 도시·군계획에 포함시키거나 도시·군기본계획에 직접 처분성을 인정하는 선지를 주의합니다.</p></div>
        </div>
      </section>

      <section className="study-block">
        <div className="study-block__title"><span>02</span><h3>계획 체계</h3></div>
        <div className="hierarchy-flow" aria-label="국토계획 체계">
          {publicLawHierarchy.map((item, index) => (
            <div className="hierarchy-flow__group" key={item}>
              <div className="hierarchy-flow__step"><small>STEP {index + 1}</small><strong>{item}</strong></div>
              {index < publicLawHierarchy.length - 1 && <span className="hierarchy-flow__arrow">→</span>}
            </div>
          ))}
        </div>
        <div className="study-note">🧠 <b>연결 암기:</b> 국가 → 광역 → 기본 → 관리. 아래 계획은 위 계획과의 정합성을 확인합니다.</div>
      </section>

      <section className="study-block">
        <div className="study-block__title"><span>03</span><h3>용어의 정의</h3></div>
        <div className="table-wrap">
          <table className="study-table">
            <thead><tr><th>용어</th><th>핵심 정의</th><th>시험 포인트</th></tr></thead>
            <tbody>
              {publicLawGeneralTerms.map(([term, definition, point]) => (
                <tr key={term}><th>{term}</th><td>{definition}</td><td>{point}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="study-block study-block--split">
        <div className="trap-card">
          <span>⚠️ 함정 선지</span>
          <ul>
            <li>“광역도시계획은 도시·군계획에 포함된다.” → <b>×</b></li>
            <li>“도시·군기본계획이 광역도시계획보다 우선한다.” → <b>×</b></li>
            <li>“도시·군기본계획은 일반 국민에게 직접적인 처분성이 있다.” → <b>×</b></li>
          </ul>
        </div>
        <div className="memory-card">
          <span>🧠 암기</span>
          <strong>“국·광·기·관”</strong>
          <p>국가 → 광역 → 기본 → 관리 순으로 큰 틀에서 구체적 규제로 내려갑니다.</p>
        </div>
      </section>

      <section className="source-note">
        <b>편입 상태</b>
        <p>기존 부동산공법 핵심정리의 전체 목차를 먼저 통합했고, 현재 첫 화면인 ‘국토계획법 제1절 총칙’을 새 통합 UI에 편입했습니다. 나머지 절은 원본 내용을 유지하면서 순차 편입합니다.</p>
      </section>
    </>
  )
}

function ImportingSection({ chapter, section }) {
  return (
    <section className="importing-section" style={{ '--chapter-color': chapter.color }}>
      <span className="importing-section__label">CONTENT MIGRATION</span>
      <h2>{section.title}</h2>
      <p><b>{chapter.shortTitle}</b>의 기존 핵심정리 내용을 통합 사이트 규격으로 편입 중입니다.</p>
      <div className="importing-section__steps">
        <span>핵심 한줄</span><span>상세 이해</span><span>핵심표</span><span>절차 인포그래픽</span><span>함정</span><span>암기</span><span>확인문제</span>
      </div>
    </section>
  )
}
