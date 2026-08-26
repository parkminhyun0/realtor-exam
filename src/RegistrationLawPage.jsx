import { useMemo, useState } from 'react'

const registrationLawParts = [
  {
    id: 'part1',
    number: '1',
    shortTitle: '공간정보법',
    title: '공간정보의 구축 및 관리 등에 관한 법률',
    color: '#2E5E8C',
    lawVersion: '법률 제21447호 · 2026.7.1 시행',
    points: [
      { id: 'p1s1', number: '01', title: '토지의 등록', ready: true },
      { id: 'p1s2', number: '02', title: '지적공부 및 부동산종합공부', ready: false },
      { id: 'p1s3', number: '03', title: '토지의 이동 및 지적정리', ready: false },
      { id: 'p1s4', number: '04', title: '지적측량', ready: false },
    ],
  },
  {
    id: 'part2',
    number: '2',
    shortTitle: '부동산등기법',
    title: '부동산등기법',
    color: '#7A3E7A',
    lawVersion: '법률 제20435호 · 2025.1.31 시행',
    points: [
      { id: 'p2s1', number: '01', title: '등기제도 총칙', ready: false },
      { id: 'p2s2', number: '02', title: '등기소와 등기부', ready: false },
      { id: 'p2s3', number: '03', title: '등기절차 총론', ready: false },
      { id: 'p2s4', number: '04', title: '각종 권리의 등기절차', ready: false },
      { id: 'p2s5', number: '05', title: '각종의 등기절차', ready: false },
    ],
  },
]

const cadastralRegistrationFlow = [
  '토지(필지) 확인',
  '소재·지번·지목·면적·경계/좌표 조사·측량',
  '토지 이동 시 소유자 신청',
  '지적소관청 결정',
  '지적공부 등록·정리',
]

const landCategories = [
  '전', '답', '과수원', '목장용지', '임야', '광천지', '염전', '대', '공장용지', '학교용지',
  '주차장', '주유소용지', '창고용지', '도로', '철도용지', '제방', '하천', '구거', '유지', '양어장',
  '수도용지', '공원', '체육용지', '유원지', '종교용지', '사적지', '묘지', '잡종지',
]

const registrationBasics = [
  [
    '토지의 조사·등록',
    '국토교통부장관은 모든 토지를 필지별로 소재·지번·지목·면적·경계 또는 좌표 등을 조사·측량하여 지적공부에 등록하여야 합니다.',
    '제64조 제1항. 최초의 조사·등록 주체와 토지 이동 뒤의 결정 주체를 구별합니다.',
  ],
  [
    '토지 이동 시 결정',
    '토지의 이동이 있을 때 지번·지목·면적·경계 또는 좌표는 토지소유자의 신청을 받아 지적소관청이 결정합니다. 신청이 없으면 지적소관청이 직권으로 조사·측량하여 결정할 수 있습니다.',
    '제64조 제2항. “신청이 없으면 아무것도 못 한다”는 선지는 틀립니다.',
  ],
  [
    '지상경계',
    '토지의 지상경계는 둑·담장이나 그 밖에 구획의 목표가 될 만한 구조물 및 경계점표지 등으로 구분합니다.',
    '토지 이동에 따라 지상경계를 새로 정한 경우 지상경계점등록부를 작성·관리합니다.',
  ],
  [
    '지번',
    '지번은 지적소관청이 지번부여지역별로 차례대로 부여합니다. 등록된 지번을 새로 부여할 필요가 있으면 시·도지사나 대도시 시장의 승인을 받아 처리합니다.',
    '제66조. 지번의 직접 부여 주체는 지적소관청입니다.',
  ],
  [
    '지목',
    '법정 지목은 전·답·과수원부터 묘지·잡종지까지 28종으로 구분합니다.',
    '제67조. 시험에서는 지목의 수와 서로 비슷한 명칭을 묶어 확인합니다.',
  ],
  [
    '면적',
    '면적의 단위는 제곱미터(㎡)입니다.',
    '제68조. 평(坪)은 법정 면적 단위가 아닙니다.',
  ],
]

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
          <p>공간정보의 구축 및 관리 등에 관한 법률과 부동산등기법을 같은 학습 구조 안에서 정리합니다.</p>
        </div>
        <div className="public-law-hero__badges">
          <span>2개 법률</span>
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
                <span>PART {part.number} {part.shortTitle}</span>
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
            PART {selected.part.number} {selected.part.shortTitle} <span>›</span> POINT {selected.point.number} · {selected.point.title}
          </div>

          {selected.point.ready
            ? <LandRegistrationSection part={selected.part} point={selected.point} />
            : <ImportingSection part={selected.part} point={selected.point} />}
        </article>
      </div>
    </main>
  )
}

function LandRegistrationSection({ part, point }) {
  return (
    <>
      <header className="study-section-heading" style={{ '--chapter-color': part.color }}>
        <div>
          <span className="study-section-heading__number">{point.number}</span>
          <div>
            <span className="study-section-heading__chapter">PART 1 · 공간정보의 구축 및 관리 등에 관한 법률</span>
            <h2>토지의 등록</h2>
          </div>
        </div>
        <span className="law-reference">{part.lawVersion}</span>
      </header>

      <div className="study-tldr">
        <span>📌 핵심 한줄</span>
        <strong>토지는 필지별로 소재·지번·지목·면적·경계 또는 좌표를 조사·측량하여 지적공부에 등록합니다.</strong>
        <p>토지의 이동이 생기면 원칙적으로 토지소유자의 신청을 받아 지적소관청이 등록사항을 결정하고, 신청이 없는 경우에는 법이 정한 범위에서 직권 조사·측량이 가능합니다.</p>
      </div>

      <section className="study-block">
        <div className="study-block__title"><span>01</span><h3>이 POINT를 먼저 이해하기</h3></div>
        <div className="understanding-grid">
          <div><b>제도의 목적·의미</b><p>토지를 공적으로 특정하기 위해 위치와 번호, 이용상태, 넓이, 경계를 일정한 기준으로 조사하고 지적공부에 기록하는 출발점입니다.</p></div>
          <div><b>법률상 구조</b><p>국가의 최초 조사·등록과 토지 이동 뒤의 등록사항 결정을 구별합니다. 토지 이동 시에는 소유자 신청과 지적소관청의 결정이 핵심입니다.</p></div>
          <div><b>문제 판단 순서</b><p>① 무엇을 등록하는가 → ② 토지 이동이 있는가 → ③ 누가 신청하는가 → ④ 누가 결정·등록하는가 순서로 판단합니다.</p></div>
          <div><b>자주 틀리는 포인트</b><p>국토교통부장관과 지적소관청의 역할을 바꾸거나, 지번 부여 주체·면적 단위·지목 개수를 바꾸는 선지를 주의합니다.</p></div>
        </div>
      </section>

      <section className="study-block">
        <div className="study-block__title"><span>02</span><h3>토지 등록의 기본 흐름</h3></div>
        <div className="hierarchy-flow" aria-label="토지 등록 기본 흐름">
          {cadastralRegistrationFlow.map((item, index) => (
            <div className="hierarchy-flow__group" key={item}>
              <div className="hierarchy-flow__step"><small>STEP {index + 1}</small><strong>{item}</strong></div>
              {index < cadastralRegistrationFlow.length - 1 && <span className="hierarchy-flow__arrow">→</span>}
            </div>
          ))}
        </div>
        <div className="study-note">🧠 <b>연결 암기:</b> “소·번·목·면·경(좌)” = 소재 → 지번 → 지목 → 면적 → 경계 또는 좌표.</div>
      </section>

      <section className="study-block">
        <div className="study-block__title"><span>03</span><h3>핵심 조문 정리</h3></div>
        <div className="table-wrap">
          <table className="study-table">
            <thead><tr><th>구분</th><th>핵심 내용</th><th>시험 포인트</th></tr></thead>
            <tbody>
              {registrationBasics.map(([term, definition, pointText]) => (
                <tr key={term}><th>{term}</th><td>{definition}</td><td>{pointText}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="study-block">
        <div className="study-block__title"><span>04</span><h3>지목 28종</h3></div>
        <div className="system-note__items" aria-label="법정 지목 28종">
          {landCategories.map((category) => <span key={category}>{category}</span>)}
        </div>
        <div className="study-note">📍 법정 지목은 총 <b>28종</b>입니다. 지목의 구분·설정방법의 세부 기준은 대통령령에서 정합니다.</div>
      </section>

      <section className="study-block study-block--split">
        <div className="trap-card">
          <span>⚠️ 함정 선지</span>
          <ul>
            <li>“지번은 국토교통부장관이 지번부여지역별로 부여한다.” → <b>×</b> · 지적소관청이 부여</li>
            <li>“토지 이동 시 소유자의 신청이 없으면 지적소관청은 등록사항을 결정할 수 없다.” → <b>×</b> · 직권 조사·측량 가능</li>
            <li>“토지 면적의 법정 단위는 평(坪)이다.” → <b>×</b> · 제곱미터(㎡)</li>
          </ul>
        </div>
        <div className="memory-card">
          <span>🧠 암기</span>
          <strong>소·번·목·면·경(좌)</strong>
          <p>필지별 핵심 등록정보를 소재 → 지번 → 지목 → 면적 → 경계 또는 좌표 순으로 연결합니다.</p>
        </div>
      </section>

      <section className="study-block">
        <div className="study-block__title"><span>05</span><h3>확인문제</h3></div>
        <div className="understanding-grid">
          <div><b>Q1. 지번의 부여 주체는?</b><p>지적소관청입니다.</p></div>
          <div><b>Q2. 법정 지목은 모두 몇 종인가?</b><p>28종입니다.</p></div>
          <div><b>Q3. 토지 이동 후 신청이 없으면?</b><p>지적소관청이 직권으로 조사·측량하여 결정할 수 있습니다.</p></div>
          <div><b>Q4. 면적의 법정 단위는?</b><p>제곱미터(㎡)입니다.</p></div>
        </div>
      </section>

      <section className="source-note">
        <b>법령 대조 기준</b>
        <p>2026.08.26 국가법령정보센터 현행 「공간정보의 구축 및 관리 등에 관한 법률」 제64조부터 제68조까지를 대조하여 첫 POINT를 구성했습니다. 다음 POINT도 같은 방식으로 법률·시행령·시행규칙을 확인하며 순차 편입합니다.</p>
      </section>
    </>
  )
}

function ImportingSection({ part, point }) {
  return (
    <section className="importing-section" style={{ '--chapter-color': part.color }}>
      <span className="importing-section__label">CONTENT MIGRATION · PART {part.number}</span>
      <h2>POINT {point.number} · {point.title}</h2>
      <p><b>{part.title}</b>의 해당 POINT를 국가법령정보센터 현행법령과 대조하여 공법과 동일한 학습 규격으로 편입합니다.</p>
      <div className="importing-section__steps">
        <span>핵심 한줄</span><span>상세 이해</span><span>핵심표</span><span>절차 인포그래픽</span><span>함정</span><span>암기</span><span>확인문제</span>
      </div>
      <div className="source-note">
        <b>{part.lawVersion}</b>
        <p>현재는 목차와 선택형 화면 구조를 먼저 확정한 상태이며, 검증된 내용만 공개 상태로 전환합니다.</p>
      </div>
    </section>
  )
}
