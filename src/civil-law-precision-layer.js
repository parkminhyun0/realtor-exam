// 민법 182개 세부목차 정밀검수 보조 레이어
// 1) PART 4에서 주택/상가가 동일한 세부항목명을 쓰는 경우 POINT까지 포함해 구별합니다.
// 2) 각 PART의 세부항목 LAW-FIRST 패널을 POINT 공통요약보다 먼저 배치합니다.

const H_BASE = 'https://www.law.go.kr/법령/주택임대차보호법/'
const HE_BASE = 'https://www.law.go.kr/법령/주택임대차보호법시행령/'
const C_BASE = 'https://www.law.go.kr/법령/상가건물임대차보호법/'
const CE_BASE = 'https://www.law.go.kr/법령/상가건물임대차보호법시행령/'

const ref = (law, base, no, title, text) => ({ law, no: `제${no}조`, title, text, url: `${base}제${no}조` })

const H = {
  2: ref('주택임대차보호법', H_BASE, '2', '적용 범위', '이 법은 주거용 건물의 전부 또는 일부의 임대차에 관하여 적용하며, 임차주택의 일부가 주거 외의 목적으로 사용되는 경우에도 적용합니다.'),
  3: ref('주택임대차보호법', H_BASE, '3', '대항력 등', '임대차는 등기가 없어도 임차인이 주택의 인도와 주민등록을 마친 때에는 그 다음 날부터 제3자에 대하여 효력이 생기며, 전입신고를 한 때에 주민등록을 마친 것으로 봅니다.'),
  '3의2': ref('주택임대차보호법', H_BASE, '3의2', '보증금의 회수', '대항요건과 임대차계약증서상의 확정일자를 갖춘 임차인은 경매 또는 공매 시 임차주택의 환가대금에서 후순위권리자나 그 밖의 채권자보다 우선하여 보증금을 변제받을 권리가 있습니다.'),
  4: ref('주택임대차보호법', H_BASE, '4', '임대차기간 등', '기간을 정하지 아니하거나 2년 미만으로 정한 임대차는 그 기간을 2년으로 봅니다. 다만 임차인은 2년 미만으로 정한 기간이 유효함을 주장할 수 있습니다.'),
  6: ref('주택임대차보호법', H_BASE, '6', '계약의 갱신', '법정 통지기간 안에 갱신거절 또는 조건변경 통지가 없으면 전 임대차와 동일한 조건으로 다시 임대차한 것으로 보며, 묵시적으로 갱신된 임대차의 존속기간은 2년입니다.'),
  '6의2': ref('주택임대차보호법', H_BASE, '6의2', '묵시적 갱신의 경우 계약의 해지', '묵시적으로 갱신된 경우 임차인은 언제든지 임대인에게 계약해지를 통지할 수 있고, 임대인이 통지를 받은 날부터 3개월이 지나면 효력이 발생합니다.'),
  '6의3': ref('주택임대차보호법', H_BASE, '6의3', '계약갱신 요구 등', '임차인은 계약갱신요구권을 1회 행사할 수 있고, 그 갱신되는 임대차의 존속기간은 2년으로 봅니다. 법정 갱신거절사유가 있는 경우에는 예외입니다.'),
  7: ref('주택임대차보호법', H_BASE, '7', '차임 등의 증감청구권', '경제사정 등의 변동으로 약정한 차임이나 보증금이 적절하지 아니하게 된 때에는 장래에 대하여 증감을 청구할 수 있습니다. 증액청구는 1년 이내에 다시 할 수 없고 법정 상한의 제한을 받습니다.'),
  8: ref('주택임대차보호법', H_BASE, '8', '보증금 중 일정액의 보호', '법정 요건을 갖춘 소액임차인은 보증금 중 일정액을 다른 담보물권자보다 우선하여 변제받을 권리가 있습니다. 구체적 범위와 금액은 대통령령으로 정합니다.'),
}

const HE = {
  10: ref('주택임대차보호법 시행령', HE_BASE, '10', '보증금 중 일정액의 범위 등', '최우선변제액은 지역별로 정해지고, 임차인별 우선변제액 합계에는 주택가액에 대한 법정 한도가 적용됩니다.'),
  11: ref('주택임대차보호법 시행령', HE_BASE, '11', '우선변제를 받을 임차인의 범위', '소액임차인에 해당하는 보증금 기준은 지역별로 구분하여 정합니다.'),
}

const C = {
  2: ref('상가건물 임대차보호법', C_BASE, '2', '적용범위', '이 법은 사업자등록의 대상이 되는 상가건물의 임대차에 적용합니다. 환산보증금 기준과 그 기준을 초과하는 임대차에 적용되는 조항의 범위는 본법과 시행령을 함께 확인해야 합니다.'),
  3: ref('상가건물 임대차보호법', C_BASE, '3', '대항력 등', '임대차는 등기가 없어도 임차인이 건물의 인도와 사업자등록을 신청하면 그 다음 날부터 제3자에 대하여 효력이 생기며, 임차건물의 양수인은 임대인의 지위를 승계한 것으로 봅니다.'),
  5: ref('상가건물 임대차보호법', C_BASE, '5', '보증금의 회수', '대항요건을 갖추고 관할 세무서장으로부터 임대차계약서상의 확정일자를 받은 임차인은 경매 또는 공매에서 후순위권리자나 그 밖의 채권자보다 우선하여 보증금을 변제받을 권리가 있습니다.'),
  9: ref('상가건물 임대차보호법', C_BASE, '9', '임대차기간 등', '기간을 정하지 아니하거나 1년 미만으로 정한 임대차는 그 기간을 1년으로 봅니다. 다만 임차인은 1년 미만으로 정한 기간이 유효함을 주장할 수 있습니다.'),
  10: ref('상가건물 임대차보호법', C_BASE, '10', '계약갱신 요구 등', '임차인의 계약갱신요구권은 최초 임대차기간을 포함한 전체 임대차기간이 10년을 초과하지 아니하는 범위에서 행사할 수 있으며, 법정 갱신거절사유가 있으면 임대인은 거절할 수 있습니다.'),
  11: ref('상가건물 임대차보호법', C_BASE, '11', '차임 등의 증감청구권', '경제사정 등의 변동으로 차임 또는 보증금이 상당하지 아니하게 된 경우 장래에 대하여 증감을 청구할 수 있으며, 증액청구는 대통령령상 상한과 1년의 재증액 제한을 받습니다.'),
  14: ref('상가건물 임대차보호법', C_BASE, '14', '보증금 중 일정액의 보호', '법정 요건을 갖춘 소액임차인은 보증금 중 일정액을 다른 담보물권자보다 우선하여 변제받을 수 있고, 구체적인 범위와 금액은 대통령령으로 정합니다.'),
}

const CE = {
  2: ref('상가건물 임대차보호법 시행령', CE_BASE, '2', '적용범위', '환산보증금은 보증금과 월 차임에 100을 곱한 금액을 합산하는 방식으로 산정하고, 지역별 상한은 시행령이 정합니다.'),
  4: ref('상가건물 임대차보호법 시행령', CE_BASE, '4', '차임 등 증액청구의 기준', '차임 또는 보증금의 증액청구는 청구 당시 차임 또는 보증금의 100분의 5를 초과하지 못합니다.'),
}

const O = {
  'p4s1|입법목적과 적용범위': { refs: [H[2]], core: '주택임대차보호법은 실제 용도가 주거인지부터 판단합니다. 주택의 일부가 비주거용으로 사용되더라도 법정 요건 아래 적용될 수 있습니다.', checks: ['공부상 용도만으로 적용 여부를 단정하지 않고 실제 주거용 사용 여부를 확인합니다.', '상가임대차의 사업자등록 대상·환산보증금 기준과 섞지 않습니다.'], diagram: 'lease-special-scope' },
  'p4s2|입법목적과 적용범위': { refs: [C[2], CE[2]], core: '상가건물 임대차보호법은 사업자등록 대상 상가건물인지와 환산보증금 적용범위를 먼저 확인합니다.', checks: ['주택임대차처럼 주민등록이 아니라 사업자등록 체계를 전제로 합니다.', '환산보증금 기준을 넘는다는 이유만으로 상가임대차보호법의 모든 보호가 배제된다고 단정하면 안 됩니다.'], diagram: 'lease-special-scope' },

  'p4s1|대항력': { refs: [H[3]], core: '주택 대항력의 핵심은 주택의 인도와 주민등록입니다. 두 요건을 갖춘 그 날이 아니라 다음 날부터 제3자에 대하여 효력이 생깁니다.', checks: ['주택: 인도 + 주민등록 → 다음 날.', '확정일자는 대항력 자체의 요건이 아니라 우선변제권에서 추가로 문제됩니다.'], diagram: 'lease-special-opposability' },
  'p4s2|대항력': { refs: [C[3]], core: '상가 대항력의 핵심은 건물의 인도와 사업자등록 신청입니다. 두 요건을 갖춘 다음 날부터 제3자에 대하여 효력이 생깁니다.', checks: ['상가: 인도 + 사업자등록 신청 → 다음 날.', '주택의 주민등록·전입신고와 혼동하지 않습니다.'], diagram: 'lease-special-opposability' },

  'p4s1|우선변제권과 최우선변제권': { refs: [H['3의2'], H[8], HE[10], HE[11]], core: '주택의 우선변제권은 대항요건과 확정일자의 결합이고, 최우선변제권은 소액임차인에게 보증금 중 일정액을 별도로 보호하는 제도입니다.', checks: ['대항력·우선변제권·최우선변제권의 요건을 각각 나누어 봅니다.', '소액임차인 기준과 최우선변제액은 시행령의 지역별 기준을 적용하므로 본법 제8조만으로 숫자를 확정하지 않습니다.'], diagram: 'lease-special-priority' },
  'p4s2|우선변제권과 최우선변제권': { refs: [C[5], C[14]], core: '상가 우선변제권은 대항요건과 확정일자를 결합하여 판단하고, 최우선변제권은 법정 소액임차인 범위와 시행령상 금액기준을 별도로 확인합니다.', checks: ['상가의 확정일자는 관할 세무서장 체계와 연결됩니다.', '주택 시행령의 소액보증금 기준을 상가에 적용하면 안 됩니다.'], diagram: 'lease-special-priority' },

  'p4s1|존속기간': { refs: [H[4], H[6], H['6의2'], H['6의3']], core: '주택은 최소보호기간 2년, 묵시적 갱신, 계약갱신요구권 1회·2년, 묵시갱신 후 임차인의 해지통고와 3개월이라는 숫자를 서로 다른 제도로 구별해야 합니다.', checks: ['2년 미만 약정은 원칙적으로 2년으로 보지만 임차인은 짧은 약정의 유효를 주장할 수 있습니다.', '묵시적 갱신과 계약갱신요구권은 별개의 제도입니다.'], diagram: 'lease-special-duration' },
  'p4s2|존속기간': { refs: [C[9], C[10]], core: '상가는 1년 미만 임대차의 보호와 계약갱신요구권의 전체 10년 범위를 구별합니다.', checks: ['주택의 2년과 상가의 1년을 혼동하지 않습니다.', '상가 갱신요구권은 최초 임대차기간을 포함한 전체 임대차기간 10년 한도에서 판단합니다.'], diagram: 'lease-special-duration' },

  'p4s1|차임증감청구권': { refs: [H[7]], core: '주택 차임·보증금 증감청구는 경제사정 등의 변동을 전제로 장래효가 문제되고, 증액청구는 1년 재청구 제한과 법정 상한을 함께 봅니다.', checks: ['감액청구와 증액청구의 제한을 기계적으로 동일시하지 않습니다.', '증액의 5% 상한과 1년 제한을 함께 확인합니다.'], diagram: 'lease-special-rent' },
  'p4s2|차임증감청구권': { refs: [C[11], CE[4]], core: '상가 차임·보증금 증감청구도 경제사정 변동을 전제로 하고, 증액은 시행령상 5% 상한과 1년 재증액 제한을 받습니다.', checks: ['상가 증액상한은 시행령 제4조와 함께 확인합니다.', '권리금은 차임·보증금과 다른 제도이므로 차임증감 규정과 섞지 않습니다.'], diagram: 'lease-special-rent' },
}

function esc(value = '') {
  return String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]))
}

function renderLaw(item) {
  return `<article class="civil-law-first__law"><header><b>${esc(item.law)}</b><a href="${esc(item.url)}" target="_blank" rel="noreferrer">${esc(item.no)}</a><strong>${esc(item.title)}</strong></header><blockquote>${esc(item.text)}</blockquote></article>`
}

function renderOverride(topic, data, key) {
  const diagram = `${import.meta.env.BASE_URL}civil-law-diagrams/${data.diagram}.svg`
  return `<section class="civil-law-first" data-civil-law-part4-first="true" data-civil-law-precision-key="${esc(key)}" data-topic="${esc(topic)}"><header class="civil-law-first__head"><span>LAW-FIRST · PART 4 민사특별법 · 정밀검수</span><h3>${esc(topic)}</h3><p>${esc(data.core)}</p></header><section class="civil-law-first__source"><div class="civil-law-first__title"><span>§</span><div><small>PRIMARY SOURCE</small><h4>해당 특별법·시행령 핵심 문언</h4></div></div><div class="civil-law-first__law-grid">${data.refs.map(renderLaw).join('')}</div></section><section class="civil-law-first__checks"><div class="civil-law-first__title"><span>✓</span><div><small>EXAM CORE</small><h4>주택·상가를 섞지 않는 판단기준</h4></div></div><ul>${data.checks.map((item) => `<li>${esc(item)}</li>`).join('')}</ul></section><figure class="civil-law-first__diagram"><div class="civil-law-first__title"><span>↔</span><div><small>VISUAL MAP</small><h4>주택 ↔ 상가 비교 다이어그램</h4></div></div><div><img src="${diagram}" alt="${esc(topic)} 주택 상가 비교 다이어그램" loading="lazy"></div><figcaption>동일한 목차명이더라도 적용 법률과 요건이 다르므로 POINT를 포함해 비교합니다.</figcaption></figure></section>`
}

function getPart4PointKey(breadcrumb = '') {
  if (breadcrumb.includes('POINT 01 · 주택임대차보호법')) return 'p4s1'
  if (breadcrumb.includes('POINT 02 · 상가건물 임대차보호법')) return 'p4s2'
  return ''
}

function moveLawFirstPanelToTop(page) {
  const panel = page.querySelector('[data-civil-law-part1-first="true"], [data-civil-law-part2-first="true"], [data-civil-law-part3-first="true"], [data-civil-law-part4-first="true"]')
  const statute = page.querySelector('.civil-statute-section')
  if (!panel || !statute || panel === statute.previousElementSibling) return
  statute.parentNode?.insertBefore(panel, statute)
}

function syncPrecisionLayer() {
  const page = document.querySelector('.civil-law-page')
  if (!page) return
  const breadcrumb = page.querySelector('.public-law-breadcrumb')?.textContent || ''
  const topic = page.querySelector('.study-section-heading h2')?.textContent?.trim() || ''
  const pointKey = breadcrumb.includes('PART 4') ? getPart4PointKey(breadcrumb) : ''
  const key = pointKey && topic ? `${pointKey}|${topic}` : ''
  const data = key ? O[key] : null

  if (data) {
    const old = page.querySelector('[data-civil-law-part4-first="true"]')
    if (old?.dataset.civilLawPrecisionKey !== key) {
      const wrap = document.createElement('div')
      wrap.innerHTML = renderOverride(topic, data, key)
      const next = wrap.firstElementChild
      if (old?.parentNode) old.parentNode.replaceChild(next, old)
      else {
        const anchor = page.querySelector('.civil-statute-section') || page.querySelector('.civil-topic-focus')
        anchor?.parentNode?.insertBefore(next, anchor)
      }
    }
  }

  moveLawFirstPanelToTop(page)
}

let queued = false
function schedulePrecisionSync() {
  if (queued) return
  queued = true
  requestAnimationFrame(() => {
    queued = false
    syncPrecisionLayer()
  })
}

if (typeof document !== 'undefined') {
  const observer = new MutationObserver(schedulePrecisionSync)
  observer.observe(document.documentElement, { subtree: true, childList: true, characterData: true })
  document.addEventListener('click', (event) => {
    if (event.target.closest('.civil-nav-topic-button, .civil-nav-point summary')) schedulePrecisionSync()
  })
  schedulePrecisionSync()
}
