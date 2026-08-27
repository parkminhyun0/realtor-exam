// 민법 판례 강화 레이어 · 1차: PART 1 민법총칙
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

  const lawFirst = page.querySelector('[data-civil-law-part1-first="true"], [data-civil-law-first="true"]')
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
