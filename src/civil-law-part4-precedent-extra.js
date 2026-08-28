// 민법 PART 4 민사특별법 · 추가 직접 판례 레이어
// 기존 PART 4 판례 레이어가 다루지 않는 판례 의존도가 높은 세부항목만 보강합니다.
// 판례 원문은 국가법령정보센터(law.go.kr)로 직접 연결합니다.

const PART4_EXTRA_PRECEDENTS = {
  'POINT 01|우선변제권과 최우선변제권': [
    {
      caseNo: '2020다38952, 38969',
      title: '새로운 임대차계약이면 우선변제·최우선변제 지위도 새 계약을 기준으로 다시 판단',
      holding: '선행 경매에서 종전 임대차에 따른 우선변제권을 행사해 일부 배당을 받은 임차인이 이후 새 소유자와 종전 계약을 소멸시키는 별개의 임대차계약을 새로 체결한 경우, 새 계약이 주택임대차보호법의 요건을 갖추면 그 새 계약에 기한 우선변제권 또는 최우선변제권이 인정될 수 있습니다.',
      exam: '우선변제권은 과거 임대차의 지위가 영구히 이어지는 권리가 아닙니다. 경매·소유자 변경 뒤 새 계약이 체결되었다면 종전 계약과 동일한지, 별개의 계약인지부터 판단합니다.',
      url: 'https://law.go.kr/LSW/precInfoP.do?mode=0&precSeq=212913',
    },
  ],
  'POINT 02|대항력': [
    {
      caseNo: '2005다64002',
      title: '상가 사업자등록은 대항력의 취득요건이자 존속요건',
      holding: '상가건물 임차인이 대항력을 취득하려면 상가건물의 인도와 사업자등록을 갖추어야 하고, 사업자등록은 대항력 취득 때뿐 아니라 이를 유지하기 위해서도 계속 존속해야 합니다. 사실상 폐업하거나 공시기능을 잃은 사업자등록만으로는 대항력을 유지할 수 없습니다.',
      exam: '상가 대항력은 인도 + 사업자등록의 조합입니다. 사업자등록은 한 번 갖추면 끝나는 요건이 아니라 계속 유지되어야 하는 공시요건이라는 점을 확인합니다.',
      url: 'https://www.law.go.kr/LSW/precInfoP.do?mode=0&precSeq=193939',
    },
  ],
  'POINT 02|우선변제권과 최우선변제권': [
    {
      caseNo: '2005다64002',
      title: '상가 우선변제권은 인도·사업자등록·확정일자의 결합과 계속성이 핵심',
      holding: '상가건물 임차인이 우선변제권을 가지려면 목적물의 인도와 사업자등록을 갖추고 관할세무서장으로부터 확정일자를 받아야 하며, 사업자등록은 우선변제권의 취득요건일 뿐 아니라 존속요건이므로 배당요구 종기까지 유지되어야 합니다.',
      exam: '대항력과 우선변제권의 요건을 혼동하지 않습니다. 우선변제권에서는 대항요건에 더해 확정일자가 필요하고, 배당 단계까지 사업자등록의 공시기능이 유지되는지도 확인합니다.',
      url: 'https://www.law.go.kr/LSW/precInfoP.do?mode=0&precSeq=193939',
    },
  ],
  'POINT 03|공용부분': [
    {
      caseNo: '2023다240879',
      title: '다른 구분소유자의 이익과 충돌할 수 있는 공용부분 조치는 관리단집회 결의가 필요',
      holding: '집합건물 공용부분의 사용·관리 상태를 원상회복시키는 행위라도 그 결과가 다른 구분소유자들의 이익과 충돌할 수 있다면 각 구분소유자가 단독으로 할 수 있는 보존행위가 아니라 관리행위로 보아 관리단집회의 결의를 거쳐야 합니다.',
      exam: '공용부분 문제는 무조건 각 구분소유자가 단독으로 보존행위를 할 수 있다고 처리하지 않습니다. 다른 구분소유자의 이해관계와 충돌하면 관리행위인지 먼저 구별합니다.',
      url: 'https://www.law.go.kr/LSW/precInfoP.do?precSeq=239903',
    },
  ],
  'POINT 03|관리단과 관리인': [
    {
      caseNo: '2023다287861',
      title: '관리인이 관리단집회 결의 없이 한 공용부분 관리 법률행위는 원칙적으로 무효',
      holding: '관리단규약에 별도의 정함이 없는 상태에서 집합건물법상 관리단집회의 결의로 결정해야 하는 공용부분의 관리에 관한 사항을 관리인이 임의로 계약한 경우, 그 법률행위는 관리단집회의 결의를 거치지 않았으므로 효력이 인정되지 않습니다.',
      exam: '관리인의 대표권이 무제한이라고 보지 않습니다. 공용부분의 관리처럼 법이 관리단집회의 결의를 요구하는 사항은 규약 또는 적법한 결의가 있는지 먼저 확인합니다.',
      url: 'https://www.law.go.kr/LSW/precInfoP.do?precSeq=241623',
    },
  ],
  'POINT 03|재건축': [
    {
      caseNo: '2023다295022',
      title: '재건축 매수지정자 지위는 사업시행자 지위와 분리해 형식적으로만 판단할 수 없음',
      holding: '재건축결의에 따라 사업시행자이자 매수지정자로 선정된 자가 사업시행권을 포기·양도한 경우, 매수지정자 지위가 그대로 남는지는 선정 경위, 사업시행권 양도의 내용, 당사자의 진정한 의사 등을 종합하여 판단해야 합니다. 매수지정자 지위의 포기에 다시 참가자 전원의 합의가 반드시 필요한 것은 아닙니다.',
      exam: '재건축 매도청구 문제에서는 결의·최고·회답기간뿐 아니라 누가 적법한 매수청구권자 또는 매수지정자인지도 확인합니다.',
      url: 'https://www.law.go.kr/LSW/precInfoP.do?precSeq=600405',
    },
  ],
  'POINT 04|가등기담보등에 관한 법률의 적용범위': [
    {
      caseNo: '2015다63138, 63145',
      title: '매매대금 채무를 담보하기 위한 가등기에는 가등기담보법이 적용되지 않음',
      holding: '가등기담보법은 차용물의 반환에 관하여 다른 재산권을 이전할 것을 예약한 경우를 전제로 하므로, 매매대금 채무를 담보하기 위하여 가등기를 마친 경우에는 가등기담보법이 적용되지 않습니다. 이런 경우 약정의 실질에 따라 별도의 양도담보 법리가 문제될 수 있습니다.',
      exam: '가등기가 있다는 이유만으로 가등기담보법을 적용하지 않습니다. 먼저 피담보채무가 차용물 반환채무인지, 매매대금 채무인지 등 적용범위를 구별합니다.',
      url: 'https://law.go.kr/precInfoP.do?precSeq=183589',
    },
  ],
  'POINT 05|경매에 있어서의 명의신탁': [
    {
      caseNo: '2008다62687',
      title: '경매에서 타인 명의로 매각허가를 받으면 소유권은 그 명의인이 취득',
      holding: '부동산경매에서 실제 매수대금을 부담한 사람이 따로 있더라도 다른 사람 명의로 매각허가결정을 받기로 약정하여 그 명의로 매각허가가 이루어지면 경매절차상 매수인은 명의인이고 소유권도 명의인이 취득합니다. 대금부담자와 명의인 사이에는 명의신탁관계가 성립할 수 있습니다.',
      exam: '경매 명의신탁은 자금부담자가 곧 소유자가 되는 구조가 아닙니다. 경매절차상 매수인 명의가 누구인지와 부동산실명법상 명의신탁약정의 효력을 분리합니다.',
      url: 'https://law.go.kr/LSW/precInfoP.do?evtNo=2008%EB%8B%A462687',
    },
  ],
}

const esc = (value = '') => String(value).replace(/[&<>'"]/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;',
}[char]))

function renderPart4ExtraPrecedents(topic, items) {
  return `<section class="study-block civil-precedent-section civil-leaf-precedents" data-civil-law-part4-extra-precedents="true" data-topic="${esc(topic)}">
    <div class="study-block__title"><span>⚖</span><h3>이 세부항목의 핵심 대법원 판례</h3></div>
    <p class="study-note">특별법 조문을 먼저 확인한 뒤, 판례가 결론을 좌우하는 요건·효과·제3자 관계만 직접 연결합니다.</p>
    <div class="civil-precedent-grid">${items.map((item) => `<article class="civil-precedent-card">
      <div class="civil-precedent-card__meta"><span>대법원</span><b>${esc(item.caseNo)}</b></div>
      <strong>${esc(item.title)}</strong>
      <p>${esc(item.holding)}</p>
      <div class="civil-leaf-precedents__exam"><b>시험 포인트</b><p>${esc(item.exam)}</p></div>
      <a href="${esc(item.url)}" target="_blank" rel="noreferrer">국가법령정보센터 판례 원문 ↗</a>
    </article>`).join('')}</div>
  </section>`
}

function syncPart4ExtraPrecedents() {
  const page = document.querySelector('.civil-law-page')
  if (!page) return

  const breadcrumb = page.querySelector('.public-law-breadcrumb')?.textContent || ''
  const topic = page.querySelector('.study-section-heading h2')?.textContent?.trim() || ''
  const old = page.querySelector('[data-civil-law-part4-extra-precedents="true"]')

  if (!breadcrumb.includes('PART 4')) {
    old?.remove()
    return
  }

  const point = (breadcrumb.match(/POINT\s+\d+/) || [''])[0]
  const key = `${point}|${topic}`
  const items = PART4_EXTRA_PRECEDENTS[key]

  if (!items) {
    old?.remove()
    return
  }
  if (old?.dataset.topic === topic) return

  old?.remove()
  const lawFirst = page.querySelector('[data-civil-law-part4-first="true"], [data-civil-law-first="true"]')
  if (!lawFirst) return

  const wrap = document.createElement('div')
  wrap.innerHTML = renderPart4ExtraPrecedents(topic, items)
  lawFirst.insertAdjacentElement('afterend', wrap.firstElementChild)
}

let queued = false
function schedulePart4ExtraPrecedents() {
  if (queued) return
  queued = true
  requestAnimationFrame(() => {
    queued = false
    syncPart4ExtraPrecedents()
  })
}

if (typeof document !== 'undefined') {
  const observer = new MutationObserver(schedulePart4ExtraPrecedents)
  observer.observe(document.documentElement, { subtree: true, childList: true, characterData: true })
  document.addEventListener('click', (event) => {
    if (event.target.closest('.civil-nav-topic-button, .civil-nav-point summary')) schedulePart4ExtraPrecedents()
  })
  schedulePart4ExtraPrecedents()
}
