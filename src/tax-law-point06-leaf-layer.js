import { taxLawPart2Point03Leaves, taxLawPart2Point03LeafCount } from './data/taxLawPart2Point03Leaves.js'

const esc = (value = '') => String(value).replace(/[&<>"']/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[char]))

function isTargetPoint(page) {
  const heading = page.querySelector('.study-section-heading h2')?.textContent?.trim()
  const breadcrumb = page.querySelector('.public-law-breadcrumb')?.textContent || ''
  return heading === '재산세' && breadcrumb.includes('PART 2')
}

function findLawButton(page, lawName, article) {
  const target = `${lawName} ${article}`.replace(/\s+/g, ' ').trim()
  return [...page.querySelectorAll('.tax-law-articles button')]
    .find((button) => button.textContent.replace(/\s+/g, ' ').trim() === target) || null
}

function basisMarkup(item) {
  return item.basis.map((basis) => (
    `<button type="button" class="tax-leaf-basis" data-tax-leaf-law="true" data-law-name="${esc(basis.lawName)}" data-law-article="${esc(basis.article)}" title="${esc(basis.lawName)} ${esc(basis.article)} 근거 확인">${esc(basis.lawName)} ${esc(basis.article)} · ${esc(basis.label)}</button>`
  )).join('')
}

function renderLeaf(item, index) {
  return `<article class="tax-leaf-card" data-tax-leaf-topic="${esc(item.topic)}" tabindex="-1">
    <header>
      <span>${String(index + 1).padStart(2, '0')}</span>
      <div><small>소분류 · LEAF</small><h4>${esc(item.topic)}</h4></div>
    </header>
    <dl>
      <div><dt>핵심</dt><dd>${esc(item.core)}</dd></div>
      <div><dt>시험 포인트</dt><dd>${esc(item.exam)}</dd></div>
      <div class="is-trap"><dt>함정</dt><dd>${esc(item.trap)}</dd></div>
      <div class="is-memory"><dt>암기</dt><dd>${esc(item.memory)}</dd></div>
    </dl>
    <div class="tax-leaf-card__basis" aria-label="관련 근거">${basisMarkup(item)}</div>
  </article>`
}

function renderGroup(group, groupIndex, startIndex) {
  return `<section class="tax-leaf-group" data-tax-leaf-group="${esc(group.group)}">
    <header class="tax-leaf-group__head">
      <span>${String(groupIndex + 1).padStart(2, '0')}</span>
      <div><small>중분류</small><h3>${esc(group.group)}</h3></div>
      <b>${group.topics.length}개 소분류</b>
    </header>
    <div class="tax-leaf-grid">${group.topics.map((item, index) => renderLeaf(item, startIndex + index)).join('')}</div>
  </section>`
}

function propertyFlowMarkup() {
  const steps = [
    ['1', '과세대상', '토지·건축물·주택·선박·항공기'],
    ['2', '토지구분', '종합합산·별도합산·분리과세'],
    ['3', '납세의무자', '6월 1일 사실상 소유자 원칙'],
    ['4', '과세표준', '시가표준액 × 공정시장가액비율'],
    ['5', '세율', '토지·건축물·주택·도시지역분 구별'],
    ['6', '부과·납기', '보통징수 · 7월/9월 납기'],
  ]
  return `<section class="tax-property-flow" aria-label="재산세 문제풀이 6단계">
    <header><span>재산세 6단계</span><h4>6월 1일 소유관계에서 납기까지 순서대로 판정</h4></header>
    <div>${steps.map(([no, title, note], index) => `<article><b>${no}</b><strong>${title}</strong><small>${note}</small></article>${index < steps.length - 1 ? '<i>→</i>' : ''}`).join('')}</div>
  </section>`
}

function calendarMarkup() {
  return `<section class="tax-property-calendar" aria-label="재산세 과세기준일과 납기 비교">
    <header><span>날짜축</span><h4>6월 1일 기준 · 건축물 7월 · 토지 9월 · 주택 7월+9월</h4></header>
    <div>
      <article><small>과세기준일</small><b>6월 1일</b><strong>사실상 소유자 판단</strong></article>
      <article><small>건축물</small><b>7.16~7.31</b><strong>7월 납기</strong></article>
      <article><small>토지</small><b>9.16~9.30</b><strong>9월 납기</strong></article>
      <article><small>주택</small><b>7월 + 9월</b><strong>원칙적으로 1/2씩</strong></article>
    </div>
  </section>`
}

function collectionMarkup() {
  return `<section class="tax-property-collection" aria-label="재산세 징수 숫자 비교">
    <header><span>징수 숫자</span><h4>물납 1천만원 초과 · 분납 250만원 초과 · 소액 2천원 미만</h4></header>
    <div>
      <article><small>물납</small><b>1천만원 초과</b><strong>관할구역 내 부동산</strong></article>
      <article><small>분할납부</small><b>250만원 초과</b><strong>납부기한 후 3개월 이내</strong></article>
      <article><small>소액징수면제</small><b>2천원 미만</b><strong>고지서 1장당</strong></article>
    </div>
  </section>`
}

function buildLayer() {
  const section = document.createElement('section')
  section.className = 'study-block tax-leaf-study tax-leaf-study--property'
  section.dataset.taxLeafStudy = 'true'
  section.dataset.taxPoint = 'p2s3'
  section.innerHTML = `<header class="tax-leaf-study__head">
    <div><small>LEAF STUDY · 중분류 → 소분류</small><h3>PART 2 · POINT 03 재산세 완전분해</h3><p>제37회 프로젝트 기준에 따라 <b>2025년까지 개정된 규정</b>을 시험 본문으로 사용하고, 2026년 개정분은 비교 전용으로 둡니다. 과세대상 → 토지구분 → 6월 1일 납세자 → 과표 → 세율 → 부과·납기 순서로 34개 소분류를 연결합니다.</p></div>
    <span>PART 2 · POINT 03 · ${taxLawPart2Point03LeafCount}/${taxLawPart2Point03LeafCount}</span>
  </header>
  <aside class="tax-leaf-exam-anchor" aria-label="재산세 출제축">
    <strong>EXAM AXIS</strong>
    <p><b>6월 1일</b>, <b>종합합산·별도합산·분리과세</b>, <b>사실상 소유자</b>, <b>시가표준액 × 공정시장가액비율</b>, <b>토지 9월 / 건축물 7월 / 주택 7·9월</b>, <b>물납 1천만원·분납 250만원·소액 2천원</b>을 서로 바꾸어 내는 선지를 우선 점검합니다.</p>
  </aside>
  ${propertyFlowMarkup()}
  ${calendarMarkup()}
  ${collectionMarkup()}
  <div class="tax-leaf-study__groups">${taxLawPart2Point03Leaves.map((group, groupIndex) => {
    const start = taxLawPart2Point03Leaves.slice(0, groupIndex).reduce((sum, item) => sum + item.topics.length, 0)
    return renderGroup(group, groupIndex, start)
  }).join('')}</div>`
  return section
}

function sync() {
  const page = document.querySelector('.tax-law-page')
  if (!page) return
  const existing = page.querySelector('[data-tax-leaf-study="true"][data-tax-point="p2s3"]')
  if (!isTargetPoint(page)) {
    existing?.remove()
    return
  }
  if (existing) return

  const anchor = page.querySelector('.tax-exam-core')
  if (!anchor) return
  anchor.insertAdjacentElement('afterend', buildLayer())
}

let queued = false
function scheduleSync() {
  if (queued) return
  queued = true
  window.requestAnimationFrame(() => {
    queued = false
    sync()
  })
}

document.addEventListener('click', (event) => {
  const chip = event.target instanceof Element ? event.target.closest('[data-tax-leaf-law="true"]') : null
  if (!chip || chip.closest('[data-tax-leaf-study]')?.dataset.taxPoint !== 'p2s3') return
  const page = chip.closest('.tax-law-page')
  if (!page) return
  const sourceButton = findLawButton(page, chip.dataset.lawName, chip.dataset.lawArticle)
  if (sourceButton) {
    sourceButton.click()
  } else {
    const previous = chip.textContent
    chip.textContent = `${chip.dataset.lawName} ${chip.dataset.lawArticle} · POINT 법령 기준 참조`
    window.setTimeout(() => { chip.textContent = previous }, 1500)
  }
})

const observer = new MutationObserver(scheduleSync)
observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'open'] })
window.addEventListener('hashchange', scheduleSync)
window.setTimeout(scheduleSync, 0)
