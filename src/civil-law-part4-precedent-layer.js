// 민법 판례 강화 레이어 · PART 4 민사특별법
// 법령 LAW-FIRST 카드 뒤에 국가법령정보센터의 핵심 대법원 판례를 배치합니다.
// 법령 문언이 1차 근거이고 판례는 조문의 해석·적용기준만 시험용으로 요약합니다.

const PART4_PRECEDENTS = {
  'POINT 01|대항력': [
    {
      caseNo: '2025다213466',
      title: '주민등록은 대항력의 취득뿐 아니라 유지에도 유효한 공시방법이어야 함',
      holding: '주택임대차보호법 제3조의 주민등록이 대항력의 공시방법이 되려면 임차인이 그 주택에 주소 또는 거소를 둔 사람으로 등록되어 있음을 제3자가 인식할 수 있어야 합니다. 주택의 인도와 주민등록이라는 대항요건은 대항력의 취득 시뿐 아니라 유지되는 동안에도 계속 존속하여야 합니다.',
      exam: '대항력은 인도 + 주민등록을 갖춘 다음 날 발생하지만, 취득 후에도 대항요건의 계속성이 중요합니다. 주민등록은 단순 행정신고가 아니라 거래안전을 위한 공시기능을 합니다.',
      url: 'https://www.law.go.kr/precInfoP.do?precSeq=615767',
    },
  ],
  'POINT 01|임차권등기명령': [
    {
      caseNo: '2024다326398',
      title: '점유 상실 뒤 마쳐진 임차권등기는 종전 대항력을 소급 회복시키지 않음',
      holding: '대항력 있는 주택임차인이 주택의 점유를 상실하면 기존 대항력은 소멸합니다. 그 후 임차권등기가 마쳐져도 상실된 대항력이 소급하여 회복되는 것은 아니고, 임차권등기가 마쳐진 때부터 새로운 대항력이 발생합니다.',
      exam: '임차권등기명령을 신청한 때가 아니라 임차권등기가 마쳐진 때의 효과를 봅니다. 종전 대항요건을 잃기 전에 등기를 마쳤는지 여부가 중요합니다.',
      url: 'https://www.law.go.kr/precInfoP.do?precSeq=605771',
    },
  ],
  'POINT 01|존속기간': [
    {
      caseNo: '2022다279795',
      title: '실제 거주를 이유로 한 갱신거절의 증명책임은 임대인에게 있음',
      holding: '임차인이 계약갱신을 요구한 경우 임대인이 자신 또는 법정 가족의 실제 거주를 이유로 갱신을 거절하려면 실제 거주하려는 의사가 존재한다는 점을 임대인이 증명하여야 합니다. 법원은 임대인의 주거상황, 거주 필요성, 갱신거절 전후의 사정 등을 종합하여 실제 거주의사를 판단합니다.',
      exam: '계약갱신요구권은 1회·2년이 기본이고, 실거주 갱신거절은 임대인의 단순한 주장만으로 충분하지 않습니다. 실제 거주의사와 그 증명이 핵심입니다.',
      url: 'https://www.law.go.kr/precInfoP.do?precSeq=238197',
    },
  ],

  'POINT 02|권리금보호': [
    {
      caseNo: '2022다260586',
      title: '권리금 회수기회 방해 손해배상은 상가임대차법이 정한 특별 법정책임',
      holding: '임대인이 상가건물 임대차보호법 제10조의4의 권리금 회수기회를 방해하여 부담하는 손해배상책임은 그 법이 요건·배상범위·소멸시효를 특별히 정한 법정책임입니다. 손해배상채무는 임대차 종료일에 이행기가 도래하고 그 다음 날부터 지체책임이 발생합니다.',
      exam: '권리금 자체를 임대인이 보장하는 제도가 아니라 임차인의 권리금 회수기회를 보호하는 제도입니다. 손해배상액도 법정 상한과 종료시점 기준을 함께 봅니다.',
      url: 'https://law.go.kr/precInfoP.do?precSeq=233883',
    },
    {
      caseNo: '2025다210307, 210308',
      title: '3기 이상 차임연체 이력이 있으면 갱신거절과 권리금보호 예외가 문제됨',
      holding: '임차인이 임대차기간 중 3기 이상의 차임액에 이르도록 차임을 연체한 사실이 있다면, 이후 건물 양수인이 연체차임채권 자체를 양수하지 않았더라도 임대인 지위를 승계한 자는 법정 요건 아래 계약갱신을 거절할 수 있고 권리금 회수기회 보호의무도 부담하지 않을 수 있습니다.',
      exam: '현재 연체액만 보지 말고 임대차기간 중 3기 이상 연체 사실이 있었는지를 확인합니다. 갱신거절사유와 권리금보호 예외사유가 연결됩니다.',
      url: 'https://www.law.go.kr/precInfoP.do?precSeq=613157',
    },
  ],
  'POINT 02|차임연체와 해지': [
    {
      caseNo: '2025다210307, 210308',
      title: '3기 차임연체 이력과 임대인 지위 승계 후의 갱신거절',
      holding: '상가 임차인이 임대차기간 중 3기 이상의 차임액에 이르도록 연체한 사실이 있으면 임대인의 지위를 승계한 건물 양수인도 법정 요건 아래 그 연체 사실을 근거로 계약갱신을 거절할 수 있습니다.',
      exam: '상가의 핵심 숫자는 3기입니다. 단순히 “현재 3기분이 미납 중인지”만 볼 것이 아니라 법이 문제 삼는 연체사실과 각 조문의 효과를 구별합니다.',
      url: 'https://www.law.go.kr/precInfoP.do?precSeq=613157',
    },
  ],

  'POINT 03|대지사용권': [
    {
      caseNo: '2009다26145',
      title: '전유부분과 대지사용권의 분리처분은 원칙적으로 무효',
      holding: '집합건물법 제20조에 따라 규약 등 특별한 사정이 없는 한 대지사용권은 전유부분의 처분에 따르고 전유부분과 분리하여 처분할 수 없습니다. 이를 위반한 대지사용권 처분은 강제경매절차에 의한 경우라도 원칙적으로 무효입니다.',
      exam: '전유부분 ↔ 대지사용권의 일체성이 원칙입니다. 제20조 제3항의 선의의 제3자는 집합건물의 대지라는 사정을 모른 채 토지를 취득한 자를 중심으로 판단합니다.',
      url: 'https://www.law.go.kr/LSW/precInfoP.do?evtNo=2009다26145',
    },
    {
      caseNo: '2013다33577',
      title: '구분소유자는 지분비율과 관계없이 대지 전부를 용도에 따라 사용할 수 있음',
      holding: '집합건물 구분소유자들이 건물의 대지를 공유하는 경우 특별한 사정이 없으면 각 구분소유자는 자신의 공유지분 비율과 관계없이 그 대지 전부를 건물의 용도에 따라 사용할 수 있는 적법한 권원을 가집니다.',
      exam: '대지지분의 수치와 실제 대지사용범위를 기계적으로 일치시키지 않습니다. 대지사용권은 전유부분을 소유하기 위해 대지를 사용할 수 있는 권리라는 점에서 접근합니다.',
      url: 'https://www.law.go.kr/LSW/precInfoP.do?precSeq=171634',
    },
  ],

  'POINT 04|가등기담보권의 실행': [
    {
      caseNo: '2002다42001',
      title: '사적 실행은 청산통지 → 2개월 청산기간 → 청산금 지급의 귀속청산 구조',
      holding: '가등기담보법은 사적 실행에서 귀속청산을 원칙으로 하므로 채권자가 청산금 지급 전에 임의로 본등기와 목적물 인도를 받아 처분정산하는 방식은 허용되지 않습니다. 청산통지 후 2개월의 청산기간과 청산금 지급 등 법정 절차를 따라야 합니다.',
      exam: '가등기담보권 실행은 “변제기 도래 → 청산금 평가액 통지 → 도달 후 2개월 → 청산금 지급 → 소유권취득·본등기” 순서를 고정해서 봅니다.',
      url: 'https://www.law.go.kr/LSW/precInfoP.do?precSeq=194710',
    },
    {
      caseNo: '2017다202296',
      title: '청산절차 없이 한 본등기는 무효, 후속 적법한 청산으로 실체관계에 부합할 수 있음',
      holding: '가등기담보법 제3조·제4조는 강행규정이므로 청산절차를 거치지 않고 담보가등기에 기한 본등기를 하면 원칙적으로 무효입니다. 다만 이후 적법한 통지와 청산금 지급 또는 청산금이 없는 경우 2개월의 청산기간 경과 등 법정 절차를 마치면 실체관계에 부합하는 유효한 등기가 될 수 있습니다.',
      exam: '“본등기 완료 = 곧바로 소유권 확정취득”으로 풀면 틀립니다. 강행적인 청산절차 이행 여부를 먼저 확인합니다.',
      url: 'https://law.go.kr/precInfoP.do?precSeq=184822',
    },
  ],

  'POINT 05|유효한 명의신탁': [
    {
      caseNo: '2011다99498',
      title: '제8조의 부부간 명의신탁이 유효하게 성립하면 배우자 사망 후에도 곧바로 무효가 되지 않음',
      holding: '조세포탈·강제집행면탈·법령상 제한회피 목적이 없는 부부간 명의신탁이 부동산실명법 제8조에 따라 유효하게 성립한 경우, 이후 배우자 일방의 사망으로 부부관계가 해소되었다는 이유만으로 명의신탁약정이 당연히 무효로 전환되는 것은 아닙니다.',
      exam: '제8조 특례는 무조건 유효가 아니라 먼저 불법목적이 없는지 확인합니다. 유효하게 성립한 부부간 명의신탁의 후속 상속관계도 별도로 판단합니다.',
      url: 'https://www.law.go.kr/LSW/precInfoP.do?precSeq=167451',
    },
  ],
  'POINT 05|등기명의신탁': [
    {
      caseNo: '2016두43091',
      title: '3자간 등기명의신탁과 계약명의신탁은 실제 계약당사자가 누구인지로 구별',
      holding: '명의신탁 유형의 구별은 부동산 매매계약의 당사자가 누구인지 확정하는 문제입니다. 명의수탁자가 형식상 계약명의자라도 매매계약의 법률효과를 명의신탁자에게 직접 귀속시킬 의도로 계약한 사정이 인정되면 3자간 등기명의신탁으로 볼 수 있습니다.',
      exam: '돈을 누가 냈는지만으로 유형을 정하지 않습니다. 매도인과의 계약당사자가 명의신탁자인지 명의수탁자인지를 먼저 확정합니다.',
      url: 'https://www.law.go.kr/LSW/precInfoP.do?precSeq=187880',
    },
    {
      caseNo: '2001다61654',
      title: '3자간 등기명의신탁은 매도인과 신탁자의 매매계약이 계속 유효',
      holding: '3자간 등기명의신탁에서 명의신탁약정과 수탁자 명의 등기가 무효가 되면 부동산 소유권은 매도인에게 남거나 복귀하고, 매도인과 명의신탁자 사이의 매매계약은 여전히 유효합니다. 명의신탁자는 매도인에 대한 이전등기청구권을 보전하기 위해 매도인을 대위하여 수탁자 명의의 무효등기 말소를 구할 수 있습니다.',
      exam: '3자간 등기명의신탁에서는 “명의신탁약정·수탁자 등기 무효”와 “매도인↔명의신탁자 매매계약 유효”를 동시에 기억합니다.',
      url: 'https://www.law.go.kr/LSW/precInfoP.do?precSeq=81343',
    },
    {
      caseNo: '2018다284233 전원합의체',
      title: '수탁자가 제3자에게 처분하면 제3자는 원칙적으로 유효하게 취득',
      holding: '3자간 등기명의신탁에서 명의수탁자가 제3자에게 부동산을 처분하여 제3자가 부동산실명법 제4조 제3항에 따라 권리를 취득하면 특별한 사정이 없는 한 제3자의 권리취득은 유효합니다. 이 경우 명의신탁자는 일정한 요건 아래 명의수탁자에게 직접 부당이득반환을 청구할 수 있습니다.',
      exam: '부동산실명법 제4조 제3항은 제3자 보호 규정입니다. 명의신탁약정의 무효를 이유로 선행 제3자 권리까지 자동으로 무효화하지 않습니다.',
      url: 'https://www.law.go.kr/LSW/precInfoP.do?precSeq=217425',
    },
  ],
  'POINT 05|계약명의신탁': [
    {
      caseNo: '2017다257715',
      title: '계약명의신탁에서 매도인의 선의·악의는 매매계약 체결 당시를 기준으로 판단',
      holding: '명의수탁자가 당사자가 되어 매도인과 계약하는 계약명의신탁에서는 매도인이 명의신탁약정의 존재를 알았는지를 매매계약 체결 당시를 기준으로 판단합니다. 당시 매도인이 선의였다면 이후 명의신탁 사실을 알게 되더라도 이미 유효하게 성립한 계약과 등기의 효력에는 영향이 없습니다.',
      exam: '계약명의신탁은 매도인의 선의 여부가 핵심 분기입니다. 판단시점은 등기시가 아니라 매매계약 체결 당시입니다.',
      url: 'https://law.go.kr/precInfoP.do?precSeq=194898',
    },
  ],
  'POINT 05|2자간 명의신탁': [
    {
      caseNo: '2019도1721',
      title: '부동산실명법 위반 양자간 명의신탁의 약정과 위탁관계는 법적으로 보호되지 않음',
      holding: '부동산실명법에 위반한 양자간 명의신탁에서는 명의신탁약정과 그에 부수한 위임약정 등이 무효이고, 그 약정을 전제로 한 사실상의 위탁관계를 법적으로 보호할 수 없습니다. 대법원은 이러한 관계에서 수탁자가 신탁자에 대한 관계에서 타인의 재물을 보관하는 자에 해당하지 않는다고 보았습니다.',
      exam: '민사시험에서는 형사책임 결론 자체보다 “양자간 명의신탁약정은 제4조에 따라 무효”라는 전제를 확인하는 자료로 사용합니다. 수탁자 명의 등기의 효력과 제3자 보호를 별도로 봅니다.',
      url: 'https://www.law.go.kr/LSW/precInfoP.do?precSeq=216993',
    },
  ],
}

function escPart4Precedent(value = '') {
  return String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]))
}

function renderPart4Precedents(topic, items) {
  return `<section class="study-block civil-precedent-section civil-leaf-precedents" data-civil-law-part4-precedents="true" data-topic="${escPart4Precedent(topic)}"><div class="study-block__title"><span>⚖</span><h3>이 세부항목의 핵심 대법원 판례</h3></div><p class="study-note">특별법 조문을 먼저 확인한 뒤, 대법원 판례가 구체화한 요건·효과·제3자 관계를 시험 포인트로 확인합니다.</p><div class="civil-precedent-grid">${items.map((item) => `<article class="civil-precedent-card"><div class="civil-precedent-card__meta"><span>대법원</span><b>${escPart4Precedent(item.caseNo)}</b></div><strong>${escPart4Precedent(item.title)}</strong><p>${escPart4Precedent(item.holding)}</p><div class="civil-leaf-precedents__exam"><b>시험 포인트</b><p>${escPart4Precedent(item.exam)}</p></div><a href="${escPart4Precedent(item.url)}" target="_blank" rel="noreferrer">국가법령정보센터 판례 원문 ↗</a></article>`).join('')}</div></section>`
}

function syncPart4Precedents() {
  const page = document.querySelector('.civil-law-page')
  if (!page) return
  const breadcrumb = page.querySelector('.public-law-breadcrumb')?.textContent || ''
  const topic = page.querySelector('.study-section-heading h2')?.textContent?.trim() || ''
  const old = page.querySelector('[data-civil-law-part4-precedents="true"]')
  if (!breadcrumb.includes('PART 4')) {
    old?.remove()
    return
  }
  const point = (breadcrumb.match(/POINT\s+\d+/) || [''])[0]
  const key = `${point}|${topic}`
  const items = PART4_PRECEDENTS[key]
  if (!items) {
    old?.remove()
    return
  }
  if (old?.dataset.topic === key) return
  old?.remove()

  const lawFirst = page.querySelector('[data-civil-law-part4-first="true"]')
  if (!lawFirst) return
  const wrap = document.createElement('div')
  wrap.innerHTML = renderPart4Precedents(key, items)
  const node = wrap.firstElementChild
  node.dataset.topic = key
  lawFirst.insertAdjacentElement('afterend', node)
}

let part4PrecedentQueued = false
function schedulePart4PrecedentSync() {
  if (part4PrecedentQueued) return
  part4PrecedentQueued = true
  requestAnimationFrame(() => {
    part4PrecedentQueued = false
    syncPart4Precedents()
  })
}

if (typeof document !== 'undefined') {
  new MutationObserver(schedulePart4PrecedentSync).observe(document.documentElement, { subtree: true, childList: true, characterData: true })
  document.addEventListener('click', (event) => {
    if (event.target.closest('.civil-nav-topic-button, .civil-nav-point summary')) schedulePart4PrecedentSync()
  })
  schedulePart4PrecedentSync()
}
