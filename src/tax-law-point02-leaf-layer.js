import { taxLawPart1Point02Leaves, taxLawPart1Point02LeafCount } from './data/taxLawPart1Point02Leaves.js'

const esc = (value = '') => String(value).replace(/[&<>"']/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[char]))

function isTargetPoint(page) {
  const heading = page.querySelector('.study-section-heading h2')?.textContent?.trim()
  const breadcrumb = page.querySelector('.public-law-breadcrumb')?.textContent || ''
  return heading === '납세의무의 성립·확정·소멸·확장' && breadcrumb.includes('PART 1')
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

function buildLayer() {
  const section = document.createElement('section')
  section.className = 'study-block tax-leaf-study tax-leaf-study--timing'
  section.dataset.taxLeafStudy = 'true'
  section.dataset.taxPoint = 'p1s2'
  section.innerHTML = `<header class="tax-leaf-study__head">
    <div><small>LEAF STUDY · 중분류 → 소분류</small><h3>POINT 02 세부항목 완전분해</h3><p>성립 → 확정 → 소멸 → 확장 순서를 먼저 잡고, 취득세·등록면허세·재산세·종합부동산세·소득세의 시간기준을 ${taxLawPart1Point02LeafCount}개 소분류에 연결합니다.</p></div>
    <span>PART 1 · POINT 02 · ${taxLawPart1Point02LeafCount}/${taxLawPart1Point02LeafCount}</span>
  </header>
  <aside class="tax-leaf-exam-anchor" aria-label="POINT 02 출제축">
    <strong>EXAM AXIS</strong>
    <p><b>성립시기</b>와 <b>신고기한·납기·과세기간</b>을 서로 바꾸어 내는 선지를 먼저 경계합니다. 특히 <b>취득 즉시 vs 60일 신고</b>, <b>6월 1일 기준일</b>, <b>소득세 과세기간 종료 vs 예정·확정신고</b>를 분리해서 판단합니다.</p>
  </aside>
  <div class="tax-leaf-study__groups">${taxLawPart1Point02Leaves.map((group, groupIndex) => {
    const start = taxLawPart1Point02Leaves.slice(0, groupIndex).reduce((sum, item) => sum + item.topics.length, 0)
    return renderGroup(group, groupIndex, start)
  }).join('')}</div>`
  return section
}

function sync() {
  const page = document.querySelector('.tax-law-page')
  if (!page) return
  const existing = page.querySelector('[data-tax-leaf-study="true"][data-tax-point="p1s2"]')
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
  if (!chip || chip.closest('[data-tax-leaf-study]')?.dataset.taxPoint !== 'p1s2') return
  const page = chip.closest('.tax-law-page')
  if (!page) return
  const sourceButton = findLawButton(page, chip.dataset.lawName, chip.dataset.lawArticle)
  if (sourceButton) {
    sourceButton.click()
  } else {
    const previous = chip.textContent
    chip.textContent = `${chip.dataset.lawName} ${chip.dataset.lawArticle} · 상단 법령 기준 참조`
    window.setTimeout(() => { chip.textContent = previous }, 1500)
  }
})

const observer = new MutationObserver(scheduleSync)
observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'open'] })
window.addEventListener('hashchange', scheduleSync)
window.setTimeout(scheduleSync, 0)
