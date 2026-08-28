import { taxLawPart1Point03Leaves, taxLawPart1Point03LeafCount } from './data/taxLawPart1Point03Leaves.js'

const esc = (value = '') => String(value).replace(/[&<>"']/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[char]))

function isTargetPoint(page) {
  const heading = page.querySelector('.study-section-heading h2')?.textContent?.trim()
  const breadcrumb = page.querySelector('.public-law-breadcrumb')?.textContent || ''
  return heading === '조세우선권 및 배당순서·조세불복절차' && breadcrumb.includes('PART 1')
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

function priorityFlowMarkup() {
  const steps = [
    ['1', '집행비용', '경매·강제집행·파산 비용부터 확인'],
    ['2', '최우선보호', '소액임차보증금 등 법정 예외 확인'],
    ['3', '당해재산세', '해당 재산에 부과된 조세인지 판정'],
    ['4', '날짜 비교', '법정기일 ↔ 담보권 설정·확정일자'],
    ['5', '후순위', '별도 우선권 없는 일반채권 확인'],
  ]
  return `<section class="tax-priority-flow" aria-label="배당순위 판단 흐름">
    <header><span>배당판단</span><h4>고정 순위 암기보다 5단계 판정</h4></header>
    <div>${steps.map(([no, title, note], index) => `<article><b>${no}</b><strong>${title}</strong><small>${note}</small></article>${index < steps.length - 1 ? '<i>→</i>' : ''}`).join('')}</div>
  </section>`
}

function appealFlowMarkup() {
  return `<section class="tax-appeal-flow" aria-label="조세불복 시간축">
    <header><span>불복시간축</span><h4>사전 30일 · 사후 90일</h4></header>
    <div class="tax-appeal-flow__track">
      <article><small>과세 전</small><strong>과세전적부심사</strong><b>30일</b></article>
      <i>→</i>
      <article><small>처분 후</small><strong>이의·심사·심판</strong><b>90일</b></article>
      <i>→</i>
      <article><small>전심 후</small><strong>행정소송</strong><b>90일</b></article>
    </div>
    <p><b>국세</b>는 심사청구 또는 심판청구 전심, <b>지방세</b>는 심판청구 전심을 중심으로 구별합니다. 이의신청은 선택절차입니다.</p>
  </section>`
}

function buildLayer() {
  const section = document.createElement('section')
  section.className = 'study-block tax-leaf-study tax-leaf-study--priority'
  section.dataset.taxLeafStudy = 'true'
  section.dataset.taxPoint = 'p1s3'
  section.innerHTML = `<header class="tax-leaf-study__head">
    <div><small>LEAF STUDY · 중분류 → 소분류</small><h3>POINT 03 우선권·배당·불복 완전분해</h3><p>조세우선권을 절대순위로 외우지 않고 법정기일·선행 담보권·당해재산세·임차인 보호를 순서대로 판정한 뒤, 과세전 <b>30일</b>과 사후 불복 <b>90일</b>을 구별합니다.</p></div>
    <span>PART 1 · POINT 03 · ${taxLawPart1Point03LeafCount}/${taxLawPart1Point03LeafCount}</span>
  </header>
  <aside class="tax-leaf-exam-anchor" aria-label="POINT 03 출제축">
    <strong>EXAM AXIS</strong>
    <p><b>배당</b>은 “집행비용 → 최우선보호 → 당해재산세 여부 → 법정기일과 권리설정일 비교”로 풀고, <b>불복</b>은 “사전 30일 / 사후 90일 / 국세와 지방세의 전심구조 차이”로 풉니다.</p>
  </aside>
  ${priorityFlowMarkup()}
  ${appealFlowMarkup()}
  <div class="tax-leaf-study__groups">${taxLawPart1Point03Leaves.map((group, groupIndex) => {
    const start = taxLawPart1Point03Leaves.slice(0, groupIndex).reduce((sum, item) => sum + item.topics.length, 0)
    return renderGroup(group, groupIndex, start)
  }).join('')}</div>`
  return section
}

function sync() {
  const page = document.querySelector('.tax-law-page')
  if (!page) return
  const existing = page.querySelector('[data-tax-leaf-study="true"][data-tax-point="p1s3"]')
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
  if (!chip || chip.closest('[data-tax-leaf-study]')?.dataset.taxPoint !== 'p1s3') return
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
