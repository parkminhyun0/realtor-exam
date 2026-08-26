import './theory-visuals.css'

const VISUALS = {
  p2c3: { title:'수요·공급 이동과 균형', subtitle:'곡선의 이동이 균형가격·균형거래량을 어떻게 바꾸는지 한눈에 확인', type:'supply-demand' },
  p2c4: { title:'수요의 가격탄력성 그래프', subtitle:'탄력적·비탄력적 수요와 총수입의 방향을 그래프로 연결', type:'elasticity' },
  p2c5: { title:'부동산 경기변동 순환', subtitle:'회복 → 상향 → 후퇴 → 하향의 순환과 거래·가격의 방향', type:'cycle' },
  p2c6: { title:'거미집이론 조정경로', subtitle:'수요·공급 탄력성 차이에 따라 수렴·발산하는 가격조정 과정', type:'cobweb' },
  p3c6: { title:'상권분석 모형 지도', subtitle:'레일리·컨버스·허프를 거리·규모·경계·확률의 관점에서 비교', type:'trade-area' },
  p4c5: { title:'임대료 상한과 초과수요', subtitle:'균형임대료보다 낮은 상한규제가 공급부족을 만드는 구조', type:'rent-ceiling' },
  p5c4: { title:'화폐의 시간가치 타임라인', subtitle:'현재가치·미래가치·연금·저당상수를 시간축 위에서 연결', type:'time-value' },
  p5c5: { title:'부동산 투자 현금흐름', subtitle:'운영흐름과 매각흐름을 분리하여 계산순서를 시각화', type:'cash-flow' },
  p5c6: { title:'NPV와 IRR의 관계', subtitle:'할인율이 올라갈수록 NPV가 낮아지고 NPV=0이 되는 지점이 IRR', type:'npv-irr' },
  p5c8: { title:'위험·수익과 분산투자', subtitle:'효율적 프런티어와 변이계수의 의미를 그래프로 확인', type:'portfolio' },
  p6c2: { title:'원리금균등상환의 구성 변화', subtitle:'총 원리금은 일정하지만 이자는 감소하고 원금상환액은 증가', type:'amortization' },
  p8c8: { title:'감정평가 핵심 방식 비교', subtitle:'원가·비교·수익방식과 임료 산정법을 입력자료 기준으로 선택', type:'appraisal' },
  p8c9: { title:'감정평가 계산 공식 선택 지도', subtitle:'문제에서 주어진 값을 보고 어떤 평가방식을 선택할지 빠르게 판별', type:'appraisal' },
}

function Axes({ x='수량(Q)', y='가격(P)' }) {
  return <>
    <line x1="52" y1="238" x2="335" y2="238" className="viz-axis" />
    <line x1="52" y1="238" x2="52" y2="28" className="viz-axis" />
    <text x="290" y="260" className="viz-label">{x}</text>
    <text x="12" y="24" className="viz-label">{y}</text>
  </>
}

function SupplyDemandVisual() {
  return <svg viewBox="0 0 760 290" role="img" aria-label="수요 증가와 공급 증가에 따른 균형 이동 그래프">
    <g transform="translate(0 0)"><Axes/><line x1="80" y1="48" x2="310" y2="220" className="viz-demand"/><line x1="125" y1="42" x2="345" y2="210" className="viz-demand viz-dashed"/><line x1="82" y1="220" x2="305" y2="55" className="viz-supply"/><circle cx="193" cy="137" r="5" className="viz-dot"/><circle cx="217" cy="119" r="5" className="viz-dot-accent"/><text x="270" y="202" className="viz-line-label">D₀</text><text x="320" y="190" className="viz-line-label">D₁</text><text x="292" y="70" className="viz-line-label">S</text><text x="78" y="278" className="viz-caption">수요 증가 → P↑ · Q↑</text></g>
    <g transform="translate(380 0)"><Axes/><line x1="80" y1="48" x2="310" y2="220" className="viz-demand"/><line x1="82" y1="220" x2="305" y2="55" className="viz-supply"/><line x1="42" y1="210" x2="265" y2="45" className="viz-supply viz-dashed"/><circle cx="193" cy="137" r="5" className="viz-dot"/><circle cx="169" cy="155" r="5" className="viz-dot-accent"/><text x="270" y="202" className="viz-line-label">D</text><text x="292" y="70" className="viz-line-label">S₀</text><text x="238" y="57" className="viz-line-label">S₁</text><text x="78" y="278" className="viz-caption">공급 증가 → P↓ · Q↑</text></g>
  </svg>
}

function ElasticityVisual() {
  return <svg viewBox="0 0 760 300" role="img" aria-label="탄력적 수요와 비탄력적 수요 비교 그래프">
    <g transform="translate(0 0)"><Axes/><line x1="76" y1="72" x2="330" y2="198" className="viz-demand"/><text x="115" y="52" className="viz-title-small">탄력적 |ε| &gt; 1</text><text x="92" y="278" className="viz-caption">가격↑ → 총수입↓</text></g>
    <g transform="translate(380 0)"><Axes/><line x1="150" y1="42" x2="226" y2="220" className="viz-demand"/><text x="112" y="52" className="viz-title-small">비탄력적 |ε| &lt; 1</text><text x="92" y="278" className="viz-caption">가격↑ → 총수입↑</text></g>
    <line x1="365" y1="20" x2="365" y2="275" className="viz-divider"/>
  </svg>
}

function CycleVisual() {
  return <svg viewBox="0 0 760 260" role="img" aria-label="부동산 경기변동 순환 그래프">
    <line x1="55" y1="205" x2="710" y2="205" className="viz-axis"/><line x1="55" y1="205" x2="55" y2="30" className="viz-axis"/>
    <path d="M70 180 C150 55, 245 55, 315 160 S500 255, 585 120 S680 60, 710 95" className="viz-curve"/>
    <line x1="55" y1="130" x2="710" y2="130" className="viz-guide"/><text x="8" y="133" className="viz-label">장기추세</text>
    <text x="115" y="235" className="viz-caption">회복</text><text x="250" y="235" className="viz-caption">상향</text><text x="400" y="235" className="viz-caption">후퇴</text><text x="535" y="235" className="viz-caption">하향</text><text x="650" y="235" className="viz-caption">회복</text>
  </svg>
}

function CobwebVisual() {
  return <svg viewBox="0 0 760 290" role="img" aria-label="거미집이론의 수렴형 조정 그래프">
    <Axes/><line x1="85" y1="52" x2="320" y2="220" className="viz-demand"/><line x1="90" y1="220" x2="310" y2="60" className="viz-supply"/>
    <polyline points="100,210 100,63 300,63 300,210 115,210 115,75 285,75 285,198 130,198 130,87 270,87 270,187 145,187 145,100 255,100 255,176 160,176 160,112 240,112 240,165 175,165 175,125 225,125 225,154" className="viz-cobweb"/>
    <text x="295" y="215" className="viz-line-label">D</text><text x="295" y="72" className="viz-line-label">S</text><text x="380" y="70" className="viz-title-small">수렴형 핵심</text><text x="380" y="105" className="viz-body">공급곡선이 상대적으로 더 가파르면</text><text x="380" y="132" className="viz-body">가격·수량의 진폭이 점차 줄어든다.</text><text x="380" y="180" className="viz-caption">|공급탄력성| &lt; |수요탄력성| → 수렴</text>
  </svg>
}

function TradeAreaVisual() {
  return <svg viewBox="0 0 760 280" role="img" aria-label="레일리 컨버스 허프 상권분석 모형">
    <circle cx="85" cy="115" r="34" className="viz-city"/><circle cx="340" cy="115" r="24" className="viz-city-alt"/><line x1="120" y1="115" x2="315" y2="115" className="viz-road"/><circle cx="255" cy="115" r="7" className="viz-dot-accent"/><text x="68" y="120" className="viz-city-text">A</text><text x="330" y="120" className="viz-city-text">B</text><text x="220" y="92" className="viz-caption">컨버스 경계점</text><text x="72" y="175" className="viz-body">레일리: 인구/거리²</text><text x="72" y="202" className="viz-body">컨버스: 두 도시의 경계거리</text>
    <circle cx="560" cy="125" r="17" className="viz-person"/><rect x="450" y="65" width="72" height="45" rx="6" className="viz-shop"/><rect x="605" y="58" width="90" height="55" rx="6" className="viz-shop-alt"/><line x1="545" y1="118" x2="518" y2="100" className="viz-guide"/><line x1="578" y1="117" x2="610" y2="102" className="viz-guide"/><text x="455" y="145" className="viz-caption">허프: 면적/거리ᵇ</text><text x="445" y="188" className="viz-body">선택확률 = 점포 유인력 ÷ 전체 유인력</text>
  </svg>
}

function RentCeilingVisual() {
  return <svg viewBox="0 0 760 290" role="img" aria-label="임대료 상한과 초과수요 그래프">
    <Axes/><line x1="85" y1="50" x2="325" y2="220" className="viz-demand"/><line x1="90" y1="220" x2="310" y2="60" className="viz-supply"/><circle cx="200" cy="140" r="5" className="viz-dot"/><line x1="52" y1="180" x2="335" y2="180" className="viz-ceiling"/><line x1="140" y1="180" x2="140" y2="238" className="viz-guide"/><line x1="270" y1="180" x2="270" y2="238" className="viz-guide"/><text x="62" y="170" className="viz-line-label">상한임대료</text><text x="124" y="258" className="viz-label">Qs</text><text x="260" y="258" className="viz-label">Qd</text><line x1="145" y1="265" x2="265" y2="265" className="viz-shortage"/><text x="170" y="283" className="viz-caption">초과수요(부족)</text><text x="390" y="88" className="viz-title-small">시험 포인트</text><text x="390" y="125" className="viz-body">균형보다 낮은 가격상한 → Qd &gt; Qs</text><text x="390" y="155" className="viz-body">단기보다 장기에 공급 감소가 커질 수 있음</text><text x="390" y="185" className="viz-body">암시장·질 저하 등의 부작용 가능</text>
  </svg>
}

function TimeValueVisual() {
  return <svg viewBox="0 0 760 285" role="img" aria-label="화폐의 시간가치 타임라인">
    <line x1="85" y1="128" x2="680" y2="128" className="viz-road"/><circle cx="100" cy="128" r="8" className="viz-dot"/><circle cx="260" cy="128" r="6" className="viz-dot"/><circle cx="420" cy="128" r="6" className="viz-dot"/><circle cx="660" cy="128" r="8" className="viz-dot-accent"/><text x="84" y="158" className="viz-label">t0</text><text x="244" y="158" className="viz-label">t1</text><text x="404" y="158" className="viz-label">t2</text><text x="640" y="158" className="viz-label">tn</text>
    <path d="M120 90 C260 38, 500 38, 640 90" className="viz-arrow"/><text x="300" y="52" className="viz-title-small">FV = PV(1+r)ⁿ</text><path d="M640 188 C500 238, 260 238, 120 188" className="viz-arrow reverse"/><text x="292" y="242" className="viz-title-small">PV = FV/(1+r)ⁿ</text><text x="86" y="205" className="viz-body">현재가치</text><text x="610" y="205" className="viz-body">미래가치</text><text x="266" y="105" className="viz-caption">동일금액 반복 → 연금계수</text>
  </svg>
}

function CashFlowVisual() {
  const Box = ({ x,y,w=150,label,sub }) => <g><rect x={x} y={y} width={w} height="50" rx="10" className="viz-flow-box"/><text x={x+w/2} y={y+21} textAnchor="middle" className="viz-flow-title">{label}</text><text x={x+w/2} y={y+38} textAnchor="middle" className="viz-flow-sub">{sub}</text></g>
  return <svg viewBox="0 0 760 300" role="img" aria-label="부동산 투자 운영 현금흐름과 매각 현금흐름">
    <Box x={20} y={35} label="PGI" sub="가능총소득"/><Box x={205} y={35} label="EGI" sub="유효총소득"/><Box x={390} y={35} label="NOI" sub="순영업소득"/><Box x={575} y={35} label="BTCF" sub="세전현금수지"/><line x1="170" y1="60" x2="205" y2="60" className="viz-arrow-line"/><line x1="355" y1="60" x2="390" y2="60" className="viz-arrow-line"/><line x1="540" y1="60" x2="575" y2="60" className="viz-arrow-line"/><text x="180" y="25" className="viz-caption">-공실 +기타</text><text x="360" y="25" className="viz-caption">-OE</text><text x="545" y="25" className="viz-caption">-DS</text>
    <Box x={70} y={190} w={160} label="매도가격" sub="- 매도경비"/><Box x={300} y={190} w={160} label="순매도액" sub="- 미상환저당잔금"/><Box x={530} y={190} w={170} label="세전지분복귀액" sub="- 자본이득세"/><line x1="230" y1="215" x2="300" y2="215" className="viz-arrow-line"/><line x1="460" y1="215" x2="530" y2="215" className="viz-arrow-line"/><text x="24" y="145" className="viz-title-small">운영 흐름</text><text x="24" y="175" className="viz-title-small">매각 흐름</text>
  </svg>
}

function NpvIrrVisual() {
  return <svg viewBox="0 0 760 280" role="img" aria-label="할인율과 순현재가치 관계 그래프">
    <line x1="70" y1="210" x2="700" y2="210" className="viz-axis"/><line x1="70" y1="240" x2="70" y2="30" className="viz-axis"/><path d="M90 60 C210 85, 310 120, 410 165 S600 230, 690 240" className="viz-curve"/><circle cx="500" cy="210" r="6" className="viz-dot-accent"/><line x1="500" y1="210" x2="500" y2="240" className="viz-guide"/><text x="485" y="262" className="viz-label">IRR</text><text x="16" y="45" className="viz-label">NPV</text><text x="620" y="260" className="viz-label">할인율</text><text x="390" y="70" className="viz-body">할인율↑ → NPV↓</text><text x="390" y="96" className="viz-body">NPV=0이 되는 할인율 = IRR</text>
  </svg>
}

function PortfolioVisual() {
  return <svg viewBox="0 0 760 280" role="img" aria-label="위험과 기대수익률 효율적 프런티어">
    <line x1="70" y1="230" x2="700" y2="230" className="viz-axis"/><line x1="70" y1="230" x2="70" y2="30" className="viz-axis"/><path d="M125 205 C170 135, 260 80, 420 55 C520 40, 610 38, 680 42" className="viz-frontier"/><circle cx="195" cy="130" r="7" className="viz-dot"/><circle cx="355" cy="72" r="7" className="viz-dot-accent"/><text x="360" y="55" className="viz-line-label">효율적 프런티어</text><text x="600" y="260" className="viz-label">위험(σ)</text><text x="10" y="40" className="viz-label">기대수익률</text><text x="460" y="126" className="viz-body">변이계수 = σ ÷ E(R)</text><text x="460" y="155" className="viz-body">같은 수익이면 위험↓가 우월</text><text x="460" y="184" className="viz-body">같은 위험이면 수익↑가 우월</text>
  </svg>
}

function AmortizationVisual() {
  const bars = [0,1,2,3,4].map((i) => { const interest=95-i*15; const principal=35+i*15; const x=110+i*105; return <g key={i}><rect x={x} y={210-interest} width="52" height={interest} className="viz-interest"/><rect x={x} y={210-interest-principal} width="52" height={principal} className="viz-principal"/><text x={x+26} y="236" textAnchor="middle" className="viz-label">{i+1}회</text></g> })
  return <svg viewBox="0 0 760 275" role="img" aria-label="원리금균등상환에서 이자와 원금 구성 변화">
    <line x1="75" y1="210" x2="660" y2="210" className="viz-axis"/>{bars}<text x="550" y="72" className="viz-body">총 원리금 = 일정</text><text x="550" y="102" className="viz-interest-text">이자 ↓</text><text x="550" y="132" className="viz-principal-text">원금상환 ↑</text><text x="85" y="36" className="viz-title-small">매 회차 원리금 구성</text>
  </svg>
}

function AppraisalVisual() {
  const items=[['원가법','재조달원가 − 감가','가액'],['거래사례비교법','사례 × 각 보정치','가액'],['수익환원법','NOI ÷ 환원이율','가액'],['적산법','기초가액×기대이율+경비','임료']]
  return <svg viewBox="0 0 760 300" role="img" aria-label="감정평가 핵심 방식 비교">
    {items.map((it,i)=>{const x=20+i*185;return <g key={it[0]}><rect x={x} y="45" width="165" height="185" rx="14" className={`viz-appraisal viz-appraisal-${i}`}/><text x={x+82.5} y="82" textAnchor="middle" className="viz-flow-title">{it[0]}</text><text x={x+82.5} y="120" textAnchor="middle" className="viz-flow-sub">{it[2]} 산정</text><text x={x+82.5} y="165" textAnchor="middle" className="viz-appraisal-formula">{it[1]}</text></g>})}
    <text x="20" y="270" className="viz-caption">문제 첫 줄에서 재조달원가·사례·NOI·임료 중 무엇이 주어졌는지 먼저 찾는다.</text>
  </svg>
}

const renderers = {
  'supply-demand': SupplyDemandVisual,
  elasticity: ElasticityVisual,
  cycle: CycleVisual,
  cobweb: CobwebVisual,
  'trade-area': TradeAreaVisual,
  'rent-ceiling': RentCeilingVisual,
  'time-value': TimeValueVisual,
  'cash-flow': CashFlowVisual,
  'npv-irr': NpvIrrVisual,
  portfolio: PortfolioVisual,
  amortization: AmortizationVisual,
  appraisal: AppraisalVisual,
}

export default function TheoryVisualSection({ chapterId }) {
  const visual = VISUALS[chapterId]
  if (!visual) return null
  const Renderer = renderers[visual.type]
  if (!Renderer) return null

  return (
    <section className="study-block theory-visual-section" aria-label={`${visual.title} 시각자료`}>
      <div className="study-block__title"><span>📊</span><h3>{visual.title}</h3></div>
      <p className="study-note">{visual.subtitle}</p>
      <div className="theory-visual-frame"><Renderer /></div>
      <p className="theory-visual-note">그래프는 시험 개념을 빠르게 이해하기 위한 개념도입니다. 실제 계산에서는 각 장의 공식·기출 조건을 우선합니다.</p>
    </section>
  )
}
