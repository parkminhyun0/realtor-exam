(() => {
  const guides = {
    '수요의 가격탄력성': {
      general: '예시: 10 ÷ 50 = 0.2 → 10 ÷ 100 = 0.1 → 0.2 ÷ 0.1 = 2. 부호는 마지막에 절댓값 처리.',
      scientific: '예시: (10 ÷ 50) ÷ (10 ÷ 100) = 2. 괄호키가 있으면 한 줄 입력.',
    },
    '중간점(평균점) 탄력성': {
      general: '평균Q: (50+60)÷2=55, 평균P: (100+90)÷2=95 → 10÷55=0.1818… → 10÷95=0.10526… → 0.1818…÷0.10526…=1.727…',
      scientific: '예시: (10 ÷ ((50+60)÷2)) ÷ (10 ÷ ((100+90)÷2)) = 1.727…',
    },
    '탄력성과 총수입': {
      general: '변경 전 가격 × 수량 = 총수입1 → 변경 후 가격 × 수량 = 총수입2 → 두 값을 바로 비교.',
      scientific: '동일. TR1=P1×Q1, TR2=P2×Q2를 각각 계산해 비교하면 가장 빠름.',
    },
    '지가와 지대': {
      general: '예시: 600 ÷ 0.05 = 12000. 5%는 %키 대신 0.05로 입력.',
      scientific: '600 ÷ 0.05 = 12000. 공학계산기도 %키보다 소수입력이 안전.',
    },
    '경제적 지대': {
      general: '예시: 100 − 60 = 40.',
      scientific: '예시: 100 − 60 = 40. 별도 함수키 불필요.',
    },
    '레일리 소매인력': {
      general: 'A: 400 ÷ 10 ÷ 10 = 4 → B: 100 ÷ 5 ÷ 5 = 4. 거리²은 같은 거리로 두 번 나누면 제곱키가 없어도 됨.',
      scientific: 'A: 400 ÷ 10 xʸ 2 = 4, B: 100 ÷ 5 xʸ 2 = 4. xʸ 표시는 기종에 따라 ^ 또는 yˣ.',
    },
    '컨버스 분기점': {
      general: '예시: 100÷400=0.25 → √0.25=0.5 → 1+0.5=1.5 → 30÷1.5=20. √키가 없으면 완전제곱 비율은 먼저 간단히 약분.',
      scientific: '30 ÷ (1 + √(100 ÷ 400)) = 20. 괄호와 √를 그대로 입력.',
    },
    '허프 확률모형': {
      general: '예시(마찰계수 2): A=4000÷2÷2=1000, B=9000÷3÷3=1000 → 1000÷(1000+1000)=0.5 → 50%.',
      scientific: 'A=4000÷(2 xʸ 2)=1000, B=9000÷(3 xʸ 2)=1000 → 1000÷(1000+1000)=0.5. 비정수 마찰계수는 공학계산기 사용.',
    },
    '기대수익률': {
      general: '예시: 0.3×5=1.5 → 0.7×10=7 → 1.5+7=8.5%. 확률만 소수로 바꾸고 수익률은 % 숫자 그대로 계산 가능.',
      scientific: '0.3×5 + 0.7×10 = 8.5. 괄호 없이 한 줄 입력 가능.',
    },
    '요구수익률': {
      general: '예시: 3 + 2 + 2 = 7%. 같은 단위(%)끼리 단순 합산.',
      scientific: '예시: 3 + 2 + 2 = 7%. 별도 함수키 불필요.',
    },
    '일시불 미래가치·현재가치': {
      general: '제곱키가 없으면 복리계수 F=(1+r)^n을 반복곱셈으로 먼저 계산. 예: 1.02×1.02×1.02×1.02×1.02=1.1040808 → FV=10×F=11.040808. PV는 FV÷F.',
      scientific: 'FV 예시: 10 × (1.02 xʸ 5) = 11.040808. PV는 미래금액 ÷ (1+r xʸ n). xʸ는 ^/yˣ 표기일 수 있음.',
    },
    '연금 미래가치·현재가치': {
      general: '먼저 F=(1+r)^n을 반복곱셈으로 계산. 연금FV계수=(F−1)÷r, 연금PV계수=(F−1)÷(r×F). 마지막에 매기 금액을 곱함. 이 형태는 음의 지수키가 없어도 정확함.',
      scientific: 'FVAF: ((1+r) xʸ n − 1) ÷ r. PVAF: (1 − (1+r) xʸ (−n)) ÷ r. 마지막에 매기 금액 × 계수.',
    },
    '감채기금계수·저당상수': {
      general: 'F=(1+r)^n을 반복곱셈으로 계산 → 감채기금계수=r÷(F−1), 저당상수=r×F÷(F−1). 음의 지수 없이 계산 가능.',
      scientific: '감채기금: r ÷ ((1+r) xʸ n − 1). 저당상수: r ÷ (1 − (1+r) xʸ (−n)).',
    },
    '잔금비율': {
      general: '같은 r이면 r이 약분됨. Fm=(1+r)^남은기간, Fn=(1+r)^전체기간을 반복곱으로 구한 뒤 [(Fm−1)÷Fm] ÷ [(Fn−1)÷Fn] = 잔금비율. 원금×잔금비율=잔금.',
      scientific: 'PVAF(남은기간) ÷ PVAF(전체기간). 또는 [(1−(1+r)^−m)] ÷ [(1−(1+r)^−n)]처럼 r을 약분해 입력하면 더 빠름.',
    },
    '영업흐름': {
      general: '예시: 1000 − 100 + 50 − 300 − 200 = 450. 순서대로 한 줄 계산.',
      scientific: '동일: 1000−100+50−300−200=450. 메모리키 없이 한 줄 입력이 가장 안전.',
    },
    '매각흐름': {
      general: '예시: 10 − 0.5 − 4 = 5.5억. 단위를 모두 억/만원 중 하나로 통일 후 입력.',
      scientific: '동일: 매도가격−매도경비−미상환잔금. 지수/함수키 불필요.',
    },
    '순현재가치법 NPV': {
      general: '제곱키가 없으면 각 기간 할인분모를 반복곱으로 계산. 예: CF1÷1.1 + CF2÷1.1÷1.1 + CF3÷1.1÷1.1÷1.1 − 초기투자액. 각 현가를 적어두고 마지막에 합산.',
      scientific: 'CF1÷(1+r)^1 + CF2÷(1+r)^2 + … + CFn÷(1+r)^n − 초기투자액. xʸ/^키로 기간별 현가를 바로 계산.',
    },
    '수익성지수 PI': {
      general: '현금유입 현가합을 먼저 구해 적고 → 현금유출 현가합을 구해 적고 → 유입현가합 ÷ 유출현가합 = PI. 예: 120÷100=1.2.',
      scientific: '동일. PV 계산 후 PV유입합÷PV유출합. PI≥1이면 채택.',
    },
    '내부수익률 IRR': {
      general: '보간형 문제: 낮은 할인율 r1에서 NPV가 +A, 높은 할인율 r2에서 NPV가 −B라면 A÷(A+B)=비율 → 비율×(r2−r1) → +r1. 즉 IRR≈r1+[A÷(A+B)]×(r2−r1).',
      scientific: '같은 보간식 한 줄: r1 + (NPV1 ÷ (NPV1 + |NPV2|)) × (r2−r1). 일반 공학계산기에 IRR 전용키가 없으면 이 방식 사용.',
    },
    '회수기간·회계적수익률': {
      general: '회계적수익률 예시: 20÷200×100=10%. 회수기간은 연도별 현금유입을 차례로 누적해 초기투자액에 도달하는 시점을 찾음.',
      scientific: 'ARR=(평균순이익÷평균투자액)×100. 회수기간은 누적합 계산이므로 일반계산기와 동일.',
    },
    'LTV · 지분비율 · 부채비율': {
      general: '예시 LTV: 6÷10×100=60%. 지분=10−6=4 → 지분비율 4÷10×100=40%, 부채비율 6÷4=1.5.',
      scientific: '동일. %키 대신 ×100을 사용하면 기종 차이를 피할 수 있음.',
    },
    '부채감당률 DCR': {
      general: '예시: NOI 120 ÷ DS 100 = 1.2.',
      scientific: 'NOI ÷ DS = DCR. 단위만 동일하게 맞추면 됨.',
    },
    '채무불이행률·영업경비비율': {
      general: '예시 채무불이행률: (30+40)÷100×100 = 70%. 영업경비비율은 OE÷총소득×100.',
      scientific: '(OE+DS)÷EGI×100. 괄호를 지원하면 한 줄 입력.',
    },
    '변이계수': {
      general: '예시: 8÷10=0.8. 표준편차와 기대수익률을 둘 다 % 숫자로 쓰면 %기호를 따로 입력하지 않아도 됨.',
      scientific: '표준편차 ÷ 기대수익률 = CV. 단위를 동일하게 맞춤.',
    },
    '원리금균등상환액': {
      general: '음의 지수 없이 계산: F=(1+r)^n을 반복곱 → 저당상수 k=r×F÷(F−1) → 융자액×k=매기 상환액. 월문제는 r=연이율÷12, n=개월수로 통일.',
      scientific: '융자액 × [r ÷ (1 − (1+r) xʸ (−n))] = 상환액. 월상환이면 월이율·개월수 사용.',
    },
    '대출가능액 역산': {
      general: '저당상수 k가 주어지면 부채서비스액 DS ÷ k = 융자액. k가 없으면 F=(1+r)^n → k=r×F÷(F−1)부터 계산.',
      scientific: 'DS ÷ [r ÷ (1−(1+r)^−n)] = 융자액. 기간 단위를 반드시 일치.',
    },
    '원가법': {
      general: '예시: 5 − 1 = 4억. 재조달원가와 감가누계액의 단위를 통일.',
      scientific: '동일. 재조달원가−감가누계액.',
    },
    '거래사례비교법': {
      general: '예시: 100×1.00×1.05×0.98×1.02 = 104.958. 면적이 따로 주어지면 마지막에 ×면적. 각 보정치는 소수로 입력.',
      scientific: '사례가액×사정보정×시점수정×지역요인×개별요인×면적×기타요인. 곱셈만 이어서 한 줄 입력.',
    },
    '직접환원법': {
      general: '예시: 5000÷0.05=100000만원=10억원. 5%는 0.05로 입력.',
      scientific: 'NOI ÷ 환원이율(소수) = 수익가액. %키보다 0.05 방식 권장.',
    },
    '적산법': {
      general: '예시: 10억×0.04=0.4억 → 경비 0.1억을 더해 0.5억(5,000만원). 단위를 먼저 통일.',
      scientific: '기초가액×기대이율(소수)+필요제경비. 한 줄 입력 가능.',
    },
    '문제 유형별 공식 선택': {
      general: '재조달원가·감가 → 원가법(빼기), 사례·보정치 → 비교법(곱하기), NOI·환원이율 → 직접환원(NOI÷율), 임료·기대이율·경비 → 적산법(곱하고 더하기).',
      scientific: '계산기보다 공식 선택이 먼저. 공식 선택 후 %는 소수로 바꾸고 한 줄 입력.',
    },
  }

  const commonRule = '공통 원칙: %키 동작은 기종마다 달라 5%는 0.05처럼 소수로 입력합니다. xʸ/^키가 없으면 반복곱셈을 사용합니다. GT·M+·반복 = 기능은 기종별 동작 차이가 있어 기본 풀이에서는 의존하지 않습니다.'

  function addStyles() {
    if (document.getElementById('calculator-guide-styles')) return
    const style = document.createElement('style')
    style.id = 'calculator-guide-styles'
    style.textContent = `
      .calc-fast-guide{margin:10px 0 14px;padding:12px 14px;border:1px solid #b9d4e5;border-radius:12px;background:#f2f8fc;color:#2c465c}
      .calc-fast-guide strong{display:block;margin-bottom:5px;font-size:12px}
      .calc-fast-guide p{margin:0;font-size:11px;line-height:1.65;color:#536b7d}
      .theory-calc-keypad.calc-guide-enhanced{gap:8px}
      .calc-device-row{display:grid;grid-template-columns:92px minmax(0,1fr);gap:8px;align-items:start;padding-top:7px;border-top:1px dashed #e4cf8c}
      .calc-device-row:first-of-type{border-top:0;padding-top:2px}
      .calc-device-label{display:inline-flex;align-items:center;justify-content:center;min-height:26px;padding:4px 7px;border-radius:7px;background:#fff1c3;color:#765817;font-size:9px;font-weight:900}
      .calc-device-row code{display:block;white-space:normal!important;overflow-wrap:anywhere;color:#594516!important;font-size:11px;line-height:1.7}
      .calc-common-rule{margin:2px 0 0;padding-top:8px;border-top:1px solid #ead69c;color:#7a642d;font-size:10px;line-height:1.65}
      @media(max-width:700px){.calc-device-row{grid-template-columns:1fr}.calc-device-label{justify-self:start}}
    `
    document.head.appendChild(style)
  }

  function makeDeviceRow(label, text) {
    const row = document.createElement('div')
    row.className = 'calc-device-row'
    const badge = document.createElement('span')
    badge.className = 'calc-device-label'
    badge.textContent = label
    const code = document.createElement('code')
    code.textContent = text
    row.append(badge, code)
    return row
  }

  function enhanceCard(card) {
    if (card.dataset.calculatorGuideEnhanced === 'true') return
    const title = card.querySelector('.theory-calc-card__head strong')?.textContent?.trim()
    const guide = guides[title]
    if (!guide) return
    const keypad = card.querySelector('.theory-calc-keypad')
    if (!keypad) return

    keypad.replaceChildren()
    keypad.classList.add('calc-guide-enhanced')

    const heading = document.createElement('b')
    heading.textContent = '⌨ 계산기 최단입력 · 기종별'
    keypad.appendChild(heading)
    keypad.appendChild(makeDeviceRow('일반계산기', guide.general))
    keypad.appendChild(makeDeviceRow('기본 공학계산기', guide.scientific))

    const note = document.createElement('p')
    note.className = 'calc-common-rule'
    note.textContent = commonRule
    keypad.appendChild(note)

    card.dataset.calculatorGuideEnhanced = 'true'
  }

  function enhanceSection(section) {
    if (section.dataset.calculatorIntroEnhanced !== 'true') {
      const note = section.querySelector(':scope > .study-note')
      const intro = document.createElement('div')
      intro.className = 'calc-fast-guide'
      intro.innerHTML = '<strong>⚡ 시험장 계산기 빠른 사용 기준</strong><p>각 공식마다 “일반계산기”와 “기본 공학계산기”의 실제 입력 순서를 분리했습니다. 일반계산기에서 제곱키가 없는 경우에는 반복곱셈 또는 음의 지수를 없앤 동치식으로 계산합니다.</p>'
      if (note) note.insertAdjacentElement('afterend', intro)
      else section.prepend(intro)
      section.dataset.calculatorIntroEnhanced = 'true'
    }
    section.querySelectorAll('.theory-calc-card').forEach(enhanceCard)
  }

  function enhance() {
    addStyles()
    document.querySelectorAll('.theory-calculations').forEach(enhanceSection)
  }

  let scheduled = false
  const scheduleEnhance = () => {
    if (scheduled) return
    scheduled = true
    requestAnimationFrame(() => {
      scheduled = false
      enhance()
    })
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scheduleEnhance, { once: true })
  } else {
    scheduleEnhance()
  }

  const observer = new MutationObserver(scheduleEnhance)
  observer.observe(document.documentElement, { childList: true, subtree: true })
})()
