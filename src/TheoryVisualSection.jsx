import './theory-visuals.css'

const VISUALS = {
  p2c1: { file: 'demand-supply.svg', title: '수요·공급 이동과 균형', subtitle: '수요와 공급 곡선의 이동 방향을 가격·거래량 변화와 함께 확인합니다.' },
  p2c2: { file: 'demand-supply.svg', title: '수요·공급 이동과 균형', subtitle: '수요와 공급 곡선의 이동 방향을 가격·거래량 변화와 함께 확인합니다.' },
  p2c3: { file: 'demand-supply.svg', title: '수요·공급 이동과 균형', subtitle: '새로운 균형점에서 가격과 거래량이 어떻게 바뀌는지 확인합니다.' },
  p2c4: { file: 'elasticity.svg', title: '수요의 가격탄력성', subtitle: '탄력적·비탄력적 수요와 총수입의 방향을 실제 그래프로 정리했습니다.' },
  p3c6: { file: 'market-area.svg', title: '상권분석 핵심 모형', subtitle: '레일리·컨버스·허프를 거리·규모·경계·확률의 관점에서 비교합니다.' },
  p5c4: { file: 'time-value.svg', title: '화폐의 시간가치', subtitle: 'PV·FV·연금계수·감채기금계수·저당상수·잔금비율을 하나의 그림으로 연결합니다.' },
  p5c5: { file: 'cash-flow.svg', title: '부동산 투자 현금흐름', subtitle: 'PGI→EGI→NOI→BTCF와 매각 시 지분복귀액 계산순서를 시각화했습니다.' },
  p8c8: { file: 'appraisal.svg', title: '감정평가 핵심 방식 비교', subtitle: '원가법·거래사례비교법·수익환원법·적산법의 입력자료와 산식을 비교합니다.' },
  p8c9: { file: 'appraisal.svg', title: '감정평가 공식 선택 지도', subtitle: '문제에서 주어진 자료를 보고 어떤 평가방식을 선택할지 빠르게 판별합니다.' },
}

export default function TheoryVisualSection({ chapterId }) {
  const visual = VISUALS[chapterId]
  if (!visual) return null

  const src = `${import.meta.env.BASE_URL}theory-visuals/${visual.file}`

  return (
    <section className="study-block theory-visual-section" aria-label={`${visual.title} 그래프 및 이미지`}>
      <div className="study-block__title"><span>📊</span><h3>{visual.title}</h3></div>
      <p className="study-note">{visual.subtitle}</p>
      <figure className="theory-visual-figure">
        <img src={src} alt={`${visual.title} 시험용 인포그래픽`} loading="lazy" decoding="async" />
        <figcaption>시험용 도식 · 축·공식·방향을 모바일에서도 확대해 확인할 수 있도록 SVG 원본으로 삽입</figcaption>
      </figure>
    </section>
  )
}
