// 민법 판례 강화 레이어 · PART 1 민법총칙 + PART 2 물권법
// 법령 LAW-FIRST 카드 뒤에 시험상 결론을 좌우하는 대법원 판례만 별도로 표시합니다.
// 판례는 국가법령정보센터 원문 URL을 사용하고, 법령 조문과 시각적으로 구분합니다.

const PRECEDENTS = {
  'PART 1|이중매매의 법률관계': [
    {
      caseNo: '2001다8097, 8103',
      title: '제2매수인의 적극가담과 제2매매의 무효',
      holding: '부동산의 제2매수인이 매도인의 배임행위에 적극 가담하여 제2매매가 반사회질서의 법률행위가 된 경우 그 제2매매는 무효가 될 수 있습니다. 단순히 선행매매 사실을 알았다는 것만으로 적극가담이 인정되는 것은 아닙니다.',
      exam: '제2매수인의 단순 악의 ≠ 곧바로 무효. 매도인의 배임행위를 유인·교사하거나 협력하는 등 적극가담 여부가 핵심입니다.',
      url: 'https://www.law.go.kr/LSW/precInfoP.do?precSeq=81471',
    },
  ],
  'PART 1|오표시무해의 원칙': [
    {
      caseNo: '93다2629, 2636(병합)',
      title: '계약서 표시가 잘못되어도 합치된 진의가 우선되는 경우',
      holding: '쌍방이 실제로 갑 토지를 매매하려는 의사로 합치하였으나 지번 착오로 계약서에 을 토지를 표시한 경우, 대법원은 갑 토지에 관한 매매가 성립한 것으로 보았습니다.',
      exam: '당사자 쌍방의 의사가 동일하게 합치된 경우에는 표시의 오기 자체보다 합치된 진정한 의사를 기준으로 계약내용을 확정하는 문제가 됩니다.',
      url: 'https://law.go.kr/LSW/precInfoP.do?evtNo=93다2629%2C+2636%28병합%29',
    },
    {
      caseNo: '93다3103',
      title: '계약문언이 불명확한 경우의 해석기준',
      holding: '계약 문언의 객관적 의미가 명확하지 않으면 계약의 동기와 경위, 목적, 당사자의 진정한 의사, 거래관행 등을 종합하여 합리적으로 해석하여야 합니다.',
      exam: '오표시무해는 민법에 독립 조문명이 있는 제도가 아니라 계약해석 법리와 연결하여 이해합니다.',
      url: 'https://www.law.go.kr/LSW/precInfoP.do?evtNo=93다3103',
    },
  ],
  'PART 1|제126조의 표현대리': [
    {
      caseNo: '2023다232526',
      title: '제126조 표현대리의 기본대리권과 정당한 이유',
      holding: '민법 제126조 표현대리는 기본대리권과 권한을 넘은 행위가 전제가 되고, 상대방에게 그 권한이 있다고 믿을 만한 정당한 이유가 있어야 합니다. 대법원은 2025년 판결에서도 이 요건을 엄격히 확인하였습니다.',
      exam: '기본대리권이 없으면 정당한 이유 판단까지 갈 필요가 없습니다. 기본대리권 → 권한초과 → 상대방의 정당한 이유 순으로 풉니다.',
      url: 'https://www.law.go.kr/LSW/precInfoP.do?precSeq=606763',
    },
    {
      caseNo: '79다234',
      title: '제126조 기본대리권의 존재시점과 제129조와의 중첩',
      holding: '제126조 표현대리는 원칙적으로 현재의 기본대리권을 전제로 하며, 제129조의 대리권 소멸 후 표현대리가 인정되는 범위에서 다시 권한을 넘은 경우에는 제126조가 연결될 수 있습니다.',
      exam: '과거에 대리권이 있었다는 사실만으로 제126조가 바로 성립하는 것은 아닙니다. 제129조와 결합되는 유형을 구별합니다.',
      url: 'https://www.law.go.kr/LSW/precInfoP.do?mode=0&precSeq=94240',
    },
  ],
  'PART 1|토지거래허가구역 내의 토지거래 계약': [
    {
      caseNo: '90다12243 전원합의체',
      title: '허가 전 계약의 유동적 무효와 협력의무',
      holding: '토지거래허가를 받을 것을 전제로 한 계약은 허가 전에는 유동적 무효 상태이지만, 허가를 받으면 소급하여 유효하게 되고 당사자는 허가신청절차에 협력할 의무를 부담합니다.',
      exam: '허가 전에는 본래적 계약이행을 청구할 수 없지만 허가신청 협력의무는 인정됩니다. 처음부터 허가를 배제·잠탈하려는 계약의 확정적 무효와 구별합니다.',
      url: 'https://www.law.go.kr/LSW/precInfoP.do?evtNo=90다12243',
    },
  ],

  'PART 2|등기의 추정력': [
    {
      caseNo: '2023다316363',
      title: '소유권이전등기의 추정력은 전 소유자에게도 미친다',
      holding: '대법원은 2025년 판결에서 소유권이전등기가 마쳐진 경우 등기명의자는 제3자뿐 아니라 전 소유자에 대해서도 적법한 등기원인으로 소유권을 취득한 것으로 추정된다고 다시 확인하였습니다. 등기사항증명서 기재와 다른 원인을 주장하는 쪽이 그 사실을 주장·증명해야 합니다.',
      exam: '등기의 추정력과 등기의 공신력을 혼동하지 않습니다. 추정력은 등기명의자의 권리취득을 일응 진실로 보는 증명책임의 문제이고, 무권리자 등기를 믿은 제3자의 권리를 일반적으로 보호하는 공신력은 인정되지 않습니다.',
      url: 'https://www.law.go.kr/LSW/precInfoP.do?precSeq=608433',
    },
    {
      caseNo: '2004다27273',
      title: '소유권이전등기의 추정력과 전 소유자',
      holding: '소유권이전등기가 경료되어 있으면 그 등기명의자는 제3자뿐 아니라 전 소유자에 대하여도 적법한 등기원인에 의하여 소유권을 취득한 것으로 추정됩니다.',
      exam: '등기원인이 무효라고 다투는 쪽이 그 무효사유를 주장·증명하는 것이 원칙입니다.',
      url: 'https://www.law.go.kr/LSW/precInfoP.do?precSeq=83464',
    },
  ],
  'PART 2|중간생략등기': [
    {
      caseNo: '91다5761',
      title: '중간생략등기청구에는 관계당사자 전원의 합의가 필요',
      holding: '부동산이 순차로 양도된 경우 최종 양수인이 최초 양도인에게 직접 자기 명의로 소유권이전등기를 청구하려면 중간생략등기에 관한 관계당사자 전원의 의사합치가 있어야 합니다.',
      exam: '전전양도 사실만으로 최종양수인이 최초양도인에게 직접 등기를 청구할 수 있는 것은 아닙니다. 최초양도인·중간자·최종양수인 사이의 중간생략등기 합의를 확인합니다.',
      url: 'https://www.law.go.kr/LSW/precInfoP.do?precSeq=108488',
    },
  ],
  'PART 2|취득시효완성 후의 법률관계': [
    {
      caseNo: '97다56495',
      title: '시효완성 후 등기 전에 소유권을 취득한 제3자',
      holding: '점유취득시효가 완성되었더라도 점유자가 아직 이전등기를 하지 않은 사이 제3자 명의로 소유권이전등기가 마쳐지면 원칙적으로 그 제3자에게 시효취득을 대항할 수 없습니다.',
      exam: '취득시효 완성만으로 곧바로 등기명의인과 동일한 대세적 소유권 지위가 생기는 것이 아닙니다. 완성 후 제3자의 등기 여부를 반드시 확인합니다.',
      url: 'https://www.law.go.kr/LSW/precInfoP.do?evtNo=97다56495',
    },
  ],
  'PART 2|제366조의 법정지상권': [
    {
      caseNo: '2003다26051',
      title: '저당권 설정 당시 건물이 존재해야 한다',
      holding: '민법 제366조 법정지상권은 저당권 설정 당시부터 그 토지 위에 건물이 존재한 경우에 한하여 성립합니다. 건물이 없는 토지에 저당권이 설정된 뒤 건축된 경우에는 저당권자가 건축에 동의했더라도 원칙적으로 제366조 법정지상권이 성립하지 않습니다.',
      exam: '판단기준 시점은 경매시가 아니라 저당권 설정 당시입니다. 「저당권 설정 당시 건물 존재」를 먼저 확인합니다.',
      url: 'https://www.law.go.kr/LSW/precInfoP.do?precSeq=194456',
    },
    {
      caseNo: '2020다224821',
      title: '가설건축물과 제366조 법정지상권',
      holding: '법정지상권이 성립하려면 경매절차에서 매수인이 매각대금을 완납할 때까지 해당 건물이 독립된 부동산으로서 건물의 요건을 갖추어야 합니다. 일정 기간 뒤 철거가 예정된 가설건축물은 원칙적으로 토지에 정착한 건물로 보기 어려워 법정지상권이 인정되지 않습니다.',
      exam: '건물의 등기 여부와 건물로서의 독립성은 구별합니다. 무등기건물도 건물 요건을 갖추면 제366조의 대상이 될 수 있지만, 독립된 부동산인 건물 자체가 아니면 성립하지 않습니다.',
      url: 'https://www.law.go.kr/LSW/precInfoP.do?precSeq=218437',
    },
  ],
  'PART 2|관습법상의 법정지상권': [
    {
      caseNo: '98다58696, 58702',
      title: '관습법상 법정지상권과 건물철거 특약',
      holding: '토지와 건물이 동일인 소유였다가 매매 등으로 소유자를 달리하게 된 경우 원칙적으로 관습법상 법정지상권이 문제되지만, 당사자 사이에 건물을 철거하기로 한 특약이 있다면 그 법정지상권은 발생하지 않습니다.',
      exam: '동일인 소유 → 매매 등으로 소유자 분리 → 철거특약 없음의 흐름으로 판단합니다. 제366조처럼 저당권 실행만을 전제로 하는 제도가 아닙니다.',
      url: 'https://www.law.go.kr/precInfoP.do?mode=0&precSeq=145330',
    },
    {
      caseNo: '2013다43345',
      title: '관습법상 법정지상권의 존속기간과 건물 성질',
      holding: '관습법상 법정지상권의 존속기간은 민법상 지상권 존속기간 규정을 기준으로 판단하고, 견고한 건물인지 여부는 건물의 구조·재질·내구성 등 객관적 사정을 종합하여 판단합니다.',
      exam: '관습법상 법정지상권도 존속기간 문제에서는 민법 제280조·제281조와 연결하여 출제될 수 있습니다.',
      url: 'https://www.law.go.kr/LSW/precInfoP.do?evtNo=2013다43345',
    },
  ],
  'PART 2|유치권의 의의와 성립요건': [
    {
      caseNo: '2011다44788',
      title: '유치권의 점유는 성립요건이자 존속요건',
      holding: '민법 제320조의 점유는 사회통념상 사실적 지배가 인정되는 객관적 관계를 뜻하고 직접점유뿐 아니라 간접점유도 포함될 수 있습니다. 유치권은 이러한 점유가 계속되어야 존속합니다.',
      exam: '유치권은 점유를 잃으면 원칙적으로 소멸합니다. 단순히 공사대금채권이 남아 있다는 사실만으로 유치권이 계속되는 것은 아닙니다.',
      url: 'https://www.law.go.kr/LSW/precInfoP.do?precSeq=173000',
    },
    {
      caseNo: '2005다16942',
      title: '피담보채권의 견련성과 유치권의 불가분성',
      holding: '유치권의 피담보채권인 「그 물건에 관하여 생긴 채권」에는 목적물 자체에서 발생한 채권뿐 아니라 목적물 반환청구권과 동일한 법률관계나 사실관계에서 발생한 채권도 포함될 수 있습니다. 유치권의 불가분성은 목적물이 분할 가능하거나 여러 물건인 경우에도 적용됩니다.',
      exam: '채권과 목적물 사이의 견련관계 → 변제기 → 적법한 점유를 순서대로 확인하고, 성립한 유치권은 채권 전부 변제 때까지 유치물 전부에 미치는 불가분성을 가집니다.',
      url: 'https://law.go.kr/LSW/precInfoP.do?precSeq=85287',
    },
  ],
  'PART 2|공동저당': [
    {
      caseNo: '2003다18401',
      title: '동시배당과 이시배당에서 차순위저당권자를 보호하는 구조',
      holding: '공동저당 부동산의 매각대금이 같은 배당절차에서 배당되는 동시배당에서는 각 부동산의 책임을 안분하고, 일부 부동산의 대가가 먼저 배당되는 이시배당에서는 차순위저당권자가 다른 공동담보 부동산에 관하여 선순위저당권자를 대위할 수 있습니다.',
      exam: '제368조 제1항 = 동시배당·비례안분, 제2항 = 이시배당·차순위자 대위. 이 사건은 차순위저당권자의 대위권이 배당기일 종료 시 발생한다는 점도 확인했습니다.',
      url: 'https://www.law.go.kr/LSW/precInfoP.do?precSeq=193986',
    },
  ],
}

function esc(value = '') {
  return String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]))
}

function renderPrecedentSection(topic, items) {
  return `<section class="study-block civil-precedent-section civil-leaf-precedents" data-civil-law-leaf-precedents="true" data-topic="${esc(topic)}"><div class="study-block__title"><span>⚖</span><h3>이 세부항목의 핵심 대법원 판례</h3></div><p class="study-note">법령 원문을 먼저 확인한 뒤, 조문만으로 결론이 완성되지 않는 부분을 판례 법리로 보강합니다.</p><div class="civil-precedent-grid">${items.map((item) => `<article class="civil-precedent-card"><div class="civil-precedent-card__meta"><span>대법원</span><b>${esc(item.caseNo)}</b></div><strong>${esc(item.title)}</strong><p>${esc(item.holding)}</p><div class="civil-leaf-precedents__exam"><b>시험 포인트</b><p>${esc(item.exam)}</p></div><a href="${esc(item.url)}" target="_blank" rel="noreferrer">국가법령정보센터 판례 원문 ↗</a></article>`).join('')}</div></section>`
}

function syncCivilLawPrecedents() {
  const page = document.querySelector('.civil-law-page')
  if (!page) return
  const breadcrumb = page.querySelector('.public-law-breadcrumb')?.textContent || ''
  const topic = page.querySelector('.study-section-heading h2')?.textContent?.trim() || ''
  const old = page.querySelector('[data-civil-law-leaf-precedents="true"]')
  const partMatch = breadcrumb.match(/PART\s+(\d+)/)
  const key = partMatch && topic ? `PART ${partMatch[1]}|${topic}` : ''
  const items = PRECEDENTS[key]

  if (!items) {
    old?.remove()
    return
  }
  if (old?.dataset.topic === topic) return
  old?.remove()

  const lawFirst = page.querySelector('[data-civil-law-part1-first="true"], [data-civil-law-part2-first="true"], [data-civil-law-first="true"]')
  if (!lawFirst) return
  const wrap = document.createElement('div')
  wrap.innerHTML = renderPrecedentSection(topic, items)
  const node = wrap.firstElementChild
  lawFirst.insertAdjacentElement('afterend', node)
}

let queued = false
function schedulePrecedentSync() {
  if (queued) return
  queued = true
  requestAnimationFrame(() => {
    queued = false
    syncCivilLawPrecedents()
  })
}

if (typeof document !== 'undefined') {
  const observer = new MutationObserver(schedulePrecedentSync)
  observer.observe(document.documentElement, { subtree: true, childList: true, characterData: true })
  document.addEventListener('click', (event) => {
    if (event.target.closest('.civil-nav-topic-button, .civil-nav-point summary')) schedulePrecedentSync()
  })
  schedulePrecedentSync()
}
