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
      { id: 'p1s2', number: '02', title: '지적공부 및 부동산종합공부', ready: true },
      { id: 'p1s3', number: '03', title: '토지의 이동 및 지적정리', ready: true },
      { id: 'p1s4', number: '04', title: '지적측량', ready: true },
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

const landCategories = [
  '전', '답', '과수원', '목장용지', '임야', '광천지', '염전', '대', '공장용지', '학교용지',
  '주차장', '주유소용지', '창고용지', '도로', '철도용지', '제방', '하천', '구거', '유지', '양어장',
  '수도용지', '공원', '체육용지', '유원지', '종교용지', '사적지', '묘지', '잡종지',
]

const pointContent = {
  p1s1: {
    heading: '토지의 등록',
    headline: '토지는 필지별로 소재·지번·지목·면적·경계 또는 좌표를 조사·측량하여 지적공부에 등록합니다.',
    summary: '토지의 이동이 생기면 원칙적으로 토지소유자의 신청을 받아 지적소관청이 등록사항을 결정하고, 신청이 없으면 직권으로 조사·측량하여 결정할 수 있습니다.',
    flow: ['필지 확인', '소재·지번·지목·면적·경계/좌표 조사', '토지 이동 시 소유자 신청', '지적소관청 결정', '지적공부 등록·정리'],
    understanding: [
      ['제도의 목적·의미', '토지를 공적으로 특정하기 위해 위치·번호·이용상태·넓이·경계를 일정한 기준으로 조사하고 기록하는 출발점입니다.'],
      ['법률상 구조', '최초의 조사·등록과 토지 이동 뒤의 등록사항 결정을 구별합니다. 토지 이동 시에는 소유자 신청과 지적소관청의 결정이 핵심입니다.'],
      ['문제 판단 순서', '① 무엇을 등록하는가 → ② 토지 이동이 있는가 → ③ 누가 신청하는가 → ④ 누가 결정·등록하는가 순서로 판단합니다.'],
      ['자주 틀리는 포인트', '국토교통부장관과 지적소관청의 역할, 지번 부여 주체, 면적 단위, 지목 개수를 바꾸는 선지를 주의합니다.'],
    ],
    rows: [
      ['토지의 조사·등록', '국토교통부장관은 모든 토지를 필지별로 소재·지번·지목·면적·경계 또는 좌표 등을 조사·측량하여 지적공부에 등록합니다.', '제64조 제1항'],
      ['토지 이동 시 결정', '토지 이동이 있으면 토지소유자의 신청을 받아 지적소관청이 결정합니다. 신청이 없으면 지적소관청이 직권 조사·측량하여 결정할 수 있습니다.', '제64조 제2항'],
      ['지상경계', '둑·담장·구획의 목표가 될 구조물·경계점표지 등으로 구분합니다. 새 경계를 정한 경우 지상경계점등록부를 작성·관리합니다.', '제65조'],
      ['지번', '지적소관청이 지번부여지역별로 차례대로 부여합니다. 지번 변경이 필요하면 시·도지사 또는 대도시 시장의 승인을 받아 새로 부여할 수 있습니다.', '제66조'],
      ['지목', '전·답·과수원부터 묘지·잡종지까지 28종으로 구분합니다.', '제67조'],
      ['면적', '면적의 단위는 제곱미터(㎡)입니다.', '제68조'],
    ],
    traps: [
      '“지번은 국토교통부장관이 부여한다.” → × · 지적소관청이 부여',
      '“토지 이동 시 신청이 없으면 지적소관청은 아무 조치도 못 한다.” → × · 직권 조사·측량 가능',
      '“토지 면적의 법정 단위는 평(坪)이다.” → × · 제곱미터(㎡)',
    ],
    memory: ['소·번·목·면·경(좌)', '소재 → 지번 → 지목 → 면적 → 경계 또는 좌표'],
    quiz: [
      ['Q1. 지번의 부여 주체는?', '지적소관청입니다.'],
      ['Q2. 법정 지목은 몇 종인가?', '28종입니다.'],
      ['Q3. 토지 이동 후 신청이 없으면?', '지적소관청이 직권으로 조사·측량하여 결정할 수 있습니다.'],
      ['Q4. 면적의 법정 단위는?', '제곱미터(㎡)입니다.'],
    ],
    extra: 'landCategories',
  },
  p1s2: {
    heading: '지적공부 및 부동산종합공부',
    headline: '지적공부는 토지의 표시와 소유자 등을 기록한 대장·도면이고, 부동산종합공부는 토지·건축물·규제·가격 정보를 종합한 정보체계입니다.',
    summary: '시험에서는 지적공부의 종류별 등록사항, 보존·복구·열람의 주체, 부동산종합공부에 통합되는 정보의 범위를 서로 비교하는 문제가 핵심입니다.',
    flow: ['토지·소유자 정보 발생', '지적공부 작성·보존', '필요 시 복구·열람·등본 발급', '건축물·규제·가격 정보 연계', '부동산종합공부 통합 관리'],
    understanding: [
      ['지적공부의 의미', '토지대장·임야대장·공유지연명부·대지권등록부·지적도·임야도·경계점좌표등록부 등 토지의 표시와 소유자 등을 기록한 대장 및 도면입니다.'],
      ['대장과 도면 구별', '토지대장·임야대장은 소재·지번·지목·면적·소유자 정보를, 지적도·임야도는 소재·지번·지목·경계를 중심으로 등록합니다.'],
      ['부동산종합공부', '토지 표시·소유자, 건축물 표시·소유자, 토지이용·규제, 부동산 가격 등의 정보를 정보관리체계를 통해 종합합니다.'],
      ['시험 판단 순서', '① 어느 공부인가 → ② 무엇을 등록하는가 → ③ 누가 보존·복구·열람을 담당하는가 → ④ 종합공부에 어떤 정보가 연계되는가를 확인합니다.'],
    ],
    rows: [
      ['지적공부', '토지대장·임야대장·공유지연명부·대지권등록부·지적도·임야도·경계점좌표등록부 등', '법 제2조 제19호'],
      ['토지대장·임야대장', '소재·지번·지목·면적·소유자의 성명/명칭·주소·주민등록번호 등', '제71조 제1항'],
      ['공유지연명부', '소재·지번·소유권 지분·공유자의 인적사항 등', '제71조 제2항'],
      ['대지권등록부', '소재·지번·대지권 비율·소유자의 인적사항 등', '제71조 제3항'],
      ['지적도·임야도', '소재·지번·지목·경계 등', '제72조'],
      ['경계점좌표등록부', '도시개발사업 등에 따라 새로 등록하는 토지의 소재·지번·좌표 등', '제73조'],
      ['보존', '지적공부는 원칙적으로 영구 보존하며, 법정 사유 외에는 청사 밖으로 반출할 수 없습니다.', '제69조'],
      ['복구', '지적공부의 전부 또는 일부가 멸실·훼손되면 지체 없이 복구합니다.', '제74조'],
      ['열람·등본', '원칙적으로 해당 지적소관청에 신청합니다. 전산 기록·저장된 공부는 법이 정한 범위에서 시·군·구 또는 읍·면·동에도 신청할 수 있습니다.', '제75조'],
      ['부동산종합공부', '지적공부·건축물대장·토지이용계획확인서·공시가격 등 정보를 종합 관리합니다.', '제76조의2~제76조의4'],
    ],
    traps: [
      '“지적도와 임야도에는 면적을 등록한다.” → × · 법 제72조의 핵심은 소재·지번·지목·경계',
      '“공유자가 둘 이상이면 대지권등록부에 지분을 등록한다.” → × · 공유지연명부',
      '“부동산종합공부에는 토지 정보만 들어간다.” → × · 건축물·규제·가격 정보도 포함',
    ],
    memory: ['대·도·좌 + 종합', '대장(소재·지번·지목·면적·소유자) / 도면(소재·지번·지목·경계) / 좌표부(좌표)'],
    quiz: [
      ['Q1. 지적도·임야도의 핵심 등록사항은?', '소재·지번·지목·경계입니다.'],
      ['Q2. 공유자가 둘 이상인 경우 사용하는 공부는?', '공유지연명부입니다.'],
      ['Q3. 부동산종합공부의 열람·증명서 발급은 어디에 신청할 수 있는가?', '지적소관청 또는 읍·면·동의 장에게 신청할 수 있습니다.'],
      ['Q4. 지적공부가 멸실·훼손되면?', '대통령령이 정하는 바에 따라 지체 없이 복구하여야 합니다.'],
    ],
  },
  p1s3: {
    heading: '토지의 이동 및 지적정리',
    headline: '신규등록·등록전환·지목변경 등 주요 토지이동은 “사유 발생일부터 60일”이라는 기간 규정이 반복됩니다.',
    summary: '토지이동은 신규등록·등록전환·분할·합병·지목변경·등록말소·축척변경·등록사항 정정 등으로 나뉘며, 각각 신청의무·직권처리·승인요건을 구별해야 합니다.',
    flow: ['토지 이동 사유 발생', '신청 대상·기한 판단', '필요 시 지적측량', '지적소관청 조사·결정', '지적공부 정리·통지'],
    understanding: [
      ['60일 규정', '신규등록과 등록전환, 지목변경은 사유 발생일부터 60일 이내 신청이 원칙입니다. 일부 분할·합병에도 60일 의무 규정이 있습니다.'],
      ['분할·합병 구별', '분할은 1필지를 나누는 것이고, 합병은 여러 필지를 합치는 것입니다. 합병은 지번부여지역·지목·소유자 불일치 등 제한사유가 중요합니다.'],
      ['등록말소·축척변경', '바다로 된 토지는 요건을 충족하면 등록말소 절차를 거치며, 축척변경은 토지소유자 동의·위원회 의결·승인이 필요한 경우가 있습니다.'],
      ['정정·행정구역·개발사업', '등록사항 정정은 신청 또는 직권으로 가능하며, 행정구역 명칭 변경은 지적공부의 소재가 새 명칭으로 변경된 것으로 봅니다. 개발사업에서는 시행자가 토지이동을 신청합니다.'],
    ],
    rows: [
      ['신규등록', '신규등록할 토지가 있으면 사유 발생일부터 60일 이내 신청', '제77조'],
      ['등록전환', '등록전환할 토지가 있으면 사유 발생일부터 60일 이내 신청', '제78조'],
      ['분할', '토지를 분할하려면 신청. 1필지 일부의 용도가 변경된 경우에는 변경일부터 60일 이내 신청', '제79조'],
      ['합병', '합병 신청. 공동주택 부지·도로·제방·하천·구거·유지 등 법정 토지는 사유 발생일부터 60일 이내 신청', '제80조'],
      ['지목변경', '지목변경 사유 발생일부터 60일 이내 신청', '제81조'],
      ['바다로 된 토지', '등록말소 통지를 받고 90일 이내 신청하지 않으면 지적소관청이 등록을 말소', '제82조'],
      ['축척변경', '일정한 경우 토지소유자 신청 또는 직권으로 실시. 원칙적으로 토지소유자 3분의 2 이상 동의 → 축척변경위원회 의결 → 시·도지사 또는 대도시 시장 승인', '제83조'],
      ['등록사항 정정', '토지소유자 신청 또는 지적소관청 직권 정정 가능. 인접 토지 경계가 바뀌면 승낙서 또는 확정판결서 정본 필요', '제84조'],
      ['행정구역 변경', '행정구역 명칭 변경 시 토지 소재는 새 명칭으로 변경된 것으로 봄', '제85조'],
      ['도시개발사업 등', '사업시행자가 착수·변경·완료를 신고하고 필요한 토지이동을 신청', '제86조'],
    ],
    traps: [
      '“신규등록은 90일 이내 신청한다.” → × · 60일',
      '“바다로 된 토지는 소유자가 신청하지 않으면 영원히 말소할 수 없다.” → × · 통지 후 90일 미신청 시 직권 말소',
      '“축척변경은 언제나 토지소유자 전원의 동의가 필요하다.” → × · 원칙적 동의요건은 3분의 2 이상이며 예외도 있음',
    ],
    memory: ['60·60·60 / 바다 90', '신규등록 60 · 등록전환 60 · 지목변경 60 / 바다 등록말소 통지 후 90'],
    quiz: [
      ['Q1. 신규등록 신청기간은?', '사유 발생일부터 60일 이내입니다.'],
      ['Q2. 지목변경 신청기간은?', '사유 발생일부터 60일 이내입니다.'],
      ['Q3. 바다로 된 토지의 등록말소 통지 후 미신청 직권말소 기준은?', '통지를 받은 날부터 90일입니다.'],
      ['Q4. 축척변경의 원칙적 동의비율은?', '시행지역 토지소유자 3분의 2 이상입니다.'],
    ],
  },
  p1s4: {
    heading: '지적측량',
    headline: '지적측량은 토지를 지적공부에 등록하거나 등록된 경계점을 지상에 복원하기 위해 필지의 경계·좌표와 면적을 정하는 측량입니다.',
    summary: '시험에서는 지적측량을 해야 하는 경우, 누구에게 의뢰하는지, 측량성과 검사 대상과 검사권자, 성과에 다툼이 있을 때의 적부심사 절차를 연결해서 봐야 합니다.',
    flow: ['측량 필요 사유 발생', '지적측량수행자에게 의뢰', '지적측량 실시·성과 결정', '필요한 경우 성과 검사', '성과 다툼 시 적부심사'],
    understanding: [
      ['지적측량의 정의', '토지를 지적공부에 등록하거나 등록된 경계점을 지상에 복원하기 위해 필지의 경계 또는 좌표와 면적을 정하는 측량입니다.'],
      ['측량 실시 사유', '지적기준점 설정, 측량성과 검사, 신규등록·등록전환·분할·등록말소·축척변경·정정·도시개발사업 등 토지이동, 경계복원 등에 필요합니다.'],
      ['의뢰 대상', '토지소유자 등 이해관계인은 법이 정한 경우 지적측량업 등록자 또는 한국국토정보공사에 지적측량을 의뢰합니다.'],
      ['성과검사·적부심사', '측량성과는 원칙적으로 시·도지사, 대도시 시장 또는 지적소관청의 검사를 받습니다. 성과에 다툼이 있으면 관할 시·도지사를 거쳐 지방지적위원회에 적부심사를 청구할 수 있습니다.'],
    ],
    rows: [
      ['지적측량 실시', '지적기준점 설정, 측량성과 검사, 주요 토지이동·경계복원 등 법정 사유에 지적측량 실시', '제23조'],
      ['지적측량수행자', '지적측량업 등록자 또는 한국국토정보공사', '제24조'],
      ['측량성과 결정', '지적측량수행자는 의뢰를 받으면 지적측량을 실시하고 그 측량성과를 결정', '제24조 제2항'],
      ['성과 검사', '원칙적으로 시·도지사, 대도시 시장 또는 지적소관청으로부터 측량성과 검사', '제25조'],
      ['검사 예외', '지적공부를 정리하지 않는 측량 중 국토교통부령으로 정하는 측량은 검사 예외', '제25조 단서'],
      ['적부심사', '토지소유자·이해관계인·지적측량수행자는 성과에 다툼이 있으면 관할 시·도지사를 거쳐 지방지적위원회에 청구', '제29조'],
      ['시·도지사 조사기간', '적부심사 청구를 받으면 30일 이내 조사하여 지방지적위원회에 회부', '제29조'],
      ['지방지적위원회 심의', '회부받은 날부터 60일 이내 심의·의결이 원칙', '제29조'],
    ],
    traps: [
      '“지적측량은 반드시 한국국토정보공사에만 의뢰한다.” → × · 지적측량업 등록자도 가능',
      '“모든 지적측량성과는 예외 없이 검사받아야 한다.” → × · 법정 검사 예외가 있음',
      '“적부심사는 바로 중앙지적위원회에 청구한다.” → × · 관할 시·도지사를 거쳐 지방지적위원회에 청구',
    ],
    memory: ['의뢰 → 측량 → 검사 → 적부', '수행자가 측량성과 결정 → 행정기관 검사 → 다툼이 있으면 적부심사'],
    quiz: [
      ['Q1. 지적측량을 의뢰할 수 있는 수행자는?', '지적측량업 등록자 또는 한국국토정보공사입니다.'],
      ['Q2. 성과검사권자는?', '시·도지사, 대도시 시장 또는 지적소관청입니다.'],
      ['Q3. 적부심사 청구는 어디에?', '관할 시·도지사를 거쳐 지방지적위원회에 청구합니다.'],
      ['Q4. 시·도지사의 적부심사 조사기간은?', '30일 이내입니다.'],
    ],
  },
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
          <span>2개 PART</span>
          <span>9개 POINT</span>
          <span>선택한 POINT만 표시</span>
        </div>
      </section>

      <div className="public-law-layout">
        <aside className="public-law-nav" aria-label="부동산공시법 목차">
          <div className="public-law-nav__title">
            <strong>부동산공시법</strong>
            <span>교재 목차 기준 · PART 1~2</span>
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
            ? <StudyPoint part={selected.part} point={selected.point} content={pointContent[selected.point.id]} />
            : <ImportingSection part={selected.part} point={selected.point} />}
        </article>
      </div>
    </main>
  )
}

function StudyPoint({ part, point, content }) {
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
        <span className="law-reference">{part.lawVersion}</span>
      </header>

      <div className="study-tldr">
        <span>📌 핵심 한줄</span>
        <strong>{content.headline}</strong>
        <p>{content.summary}</p>
      </div>

      <section className="study-block">
        <div className="study-block__title"><span>01</span><h3>이 POINT를 먼저 이해하기</h3></div>
        <div className="understanding-grid">
          {content.understanding.map(([title, body]) => <div key={title}><b>{title}</b><p>{body}</p></div>)}
        </div>
      </section>

      <section className="study-block">
        <div className="study-block__title"><span>02</span><h3>전체 흐름</h3></div>
        <div className="hierarchy-flow" aria-label={`${content.heading} 흐름`}>
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
                <tr key={term}><th>{term}</th><td>{definition}</td><td>{pointText}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {content.extra === 'landCategories' && (
        <section className="study-block">
          <div className="study-block__title"><span>04</span><h3>지목 28종</h3></div>
          <div className="system-note__items" aria-label="법정 지목 28종">
            {landCategories.map((category) => <span key={category}>{category}</span>)}
          </div>
          <div className="study-note">📍 법정 지목은 총 <b>28종</b>이며, 세부 구분·설정방법은 대통령령에서 정합니다.</div>
        </section>
      )}

      <section className="study-block study-block--split">
        <div className="trap-card">
          <span>⚠️ 함정 선지</span>
          <ul>{content.traps.map((trap) => <li key={trap}>{trap}</li>)}</ul>
        </div>
        <div className="memory-card">
          <span>🧠 암기</span>
          <strong>{content.memory[0]}</strong>
          <p>{content.memory[1]}</p>
        </div>
      </section>

      <section className="study-block">
        <div className="study-block__title"><span>05</span><h3>확인문제</h3></div>
        <div className="understanding-grid">
          {content.quiz.map(([question, answer]) => <div key={question}><b>{question}</b><p>{answer}</p></div>)}
        </div>
      </section>

      <section className="source-note">
        <b>법령 대조 기준</b>
        <p>2026.08.26 국가법령정보센터 현행 「공간정보의 구축 및 관리 등에 관한 법률」(법률 제21447호, 2026.7.1 시행)을 기준으로 해당 POINT 관련 조문을 대조하여 구성했습니다.</p>
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
        <p>검증된 내용만 공개 상태로 전환합니다.</p>
      </div>
    </section>
  )
}
