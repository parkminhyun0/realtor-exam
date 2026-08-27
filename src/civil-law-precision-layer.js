// 민법 182개 세부목차 정밀검수 보조 레이어
// 1) 각 PART의 세부항목 LAW-FIRST 패널을 POINT 공통자료보다 먼저 배치합니다.
// 2) 주택·상가에서 동일한 세부항목명을 쓰는 경우 기존 PART 4의 POINT-aware ALIAS를 유지한 채
//    두 특별법의 차이를 비교하는 SVG만 추가합니다.

const SHARED_SPECIAL_LEASE_TOPICS = {
  '입법목적과 적용범위': 'lease-special-scope',
  '대항력': 'lease-special-opposability',
  '우선변제권과 최우선변제권': 'lease-special-priority',
  '존속기간': 'lease-special-duration',
  '차임증감청구권': 'lease-special-rent',
}

function esc(value = '') {
  return String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]))
}

function moveLawFirstPanelToTop(page) {
  const panel = page.querySelector('[data-civil-law-part1-first="true"], [data-civil-law-part2-first="true"], [data-civil-law-part3-first="true"], [data-civil-law-part4-first="true"]')
  const statute = page.querySelector('.civil-statute-section')
  if (!panel || !statute || panel === statute.previousElementSibling) return
  statute.parentNode?.insertBefore(panel, statute)
}

function syncSpecialLeaseComparison(page) {
  const breadcrumb = page.querySelector('.public-law-breadcrumb')?.textContent || ''
  const topic = page.querySelector('.study-section-heading h2')?.textContent?.trim() || ''
  const old = page.querySelector('[data-civil-law-special-lease-comparison="true"]')
  const isHousing = breadcrumb.includes('POINT 01 · 주택임대차보호법')
  const isCommercial = breadcrumb.includes('POINT 02 · 상가건물 임대차보호법')
  const diagramName = (isHousing || isCommercial) ? SHARED_SPECIAL_LEASE_TOPICS[topic] : ''

  if (!diagramName) {
    old?.remove()
    return
  }

  const key = `${isHousing ? 'housing' : 'commercial'}|${topic}`
  if (old?.dataset.key === key) return
  old?.remove()

  const lawFirst = page.querySelector('[data-civil-law-part4-first="true"]')
  if (!lawFirst) return

  const section = document.createElement('section')
  section.className = 'civil-law-first civil-law-first--comparison'
  section.dataset.civilLawSpecialLeaseComparison = 'true'
  section.dataset.key = key
  const diagram = `${import.meta.env.BASE_URL}civil-law-diagrams/${diagramName}.svg`
  section.innerHTML = `<header class="civil-law-first__head"><span>COMPARE · 주택 ↔ 상가</span><h3>${esc(topic)} 비교</h3><p>현재 선택한 특별법의 LAW-FIRST 내용을 먼저 읽고, 아래 그림으로 다른 임대차특별법과 요건·숫자를 교차 확인합니다.</p></header><figure class="civil-law-first__diagram"><div class="civil-law-first__title"><span>↔</span><div><small>VISUAL CROSS-CHECK</small><h4>동일 명칭 세부항목 비교</h4></div></div><div><img src="${diagram}" alt="${esc(topic)} 주택 상가 비교 다이어그램" loading="lazy"></div><figcaption>동일한 목차명이라도 주택임대차보호법과 상가건물 임대차보호법의 공시요건·기간·시행령 기준은 서로 다릅니다.</figcaption></figure>`
  lawFirst.insertAdjacentElement('afterend', section)
}

function syncPrecisionLayer() {
  const page = document.querySelector('.civil-law-page')
  if (!page) return
  moveLawFirstPanelToTop(page)
  syncSpecialLeaseComparison(page)
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
