import { taxLawPart2Point01Leaves, taxLawPart2Point01LeafCount } from './data/taxLawPart2Point01Leaves.js'

const esc = (value = '') => String(value).replace(/[&<>"']/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[char]))

function isTargetPoint(page) {
  const heading = page.querySelector('.study-section-heading h2')?.textContent?.trim()
  const breadcrumb = page.querySelector('.public-law-breadcrumb')?.textContent || ''
  return heading === '취득세' && breadcrumb.includes('PART 2')
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

function acquisitionFlowMarkup() {
  const steps = [
    ['1', '취득 해당?', '사실상 취득·간주취득부터 판정'],
    ['2', '취득시기', '대금청산·등기·상속·원시취득'],
    ['3', '과세표준', '유상·무상·원시·간주 유형 구별'],
    ['4', '세율', '표준·주택·중과·특례 순서'],
    ['5', '비과세', '법정 비과세·사후추징 확인'],
    ['6', '신고납부', '일반 60일 · 무상 3개월 · 상속 6개월'],
  ]
  return `<section class="tax-acquisition-flow" aria-label="취득세 문제풀이 6단계">
    <header><span>취득세 6단계</span><h4>취득 사실부터 신고기한까지 순서대로 판정</h4></header>
    <div>${steps.map(([no, title, note], index) => `<article><b>${no}</b><strong>${title}</strong><small>${note}</small></article>${index < steps.length - 1 ? '<i>→</i>' : ''}`).join('')}</div>
  </section>`
}

function deadlineMarkup() {
  return `<section class="tax-acquisition-deadlines" aria-label="취득세 신고기한 비교">
    <header><span>숫자축</span><h4>일반 60일 · 무상 3개월 · 상속 6개월</h4></header>
    <div>
      <article><small>일반 취득</small><strong>취득일부터</strong><b>60일</b></article>
      <article><small>상속 외 무상취득</small><strong>취득일이 속한 달 말일부터</strong><b>3개월</b></article>
      <article><small>상속취득</small><strong>상속개시일이 속한 달 말일부터</strong><b>6개월</b><em>외국주소 상속인: 9개월 규정 확인</em></article>
    </div>
  </section>`
}

function buildLayer() {
  const section = document.createElement('section')
  section.className = 'study-block tax-leaf-study tax-leaf-study--acquisition'
  section.dataset.taxLeafStudy = 'true'
  section.dataset.taxPoint = 'p2s1'
  section.innerHTML = `<header class="tax-leaf-study__head">
    <div><small>LEAF STUDY · 중분류 → 소분류</small><h3>PART 2 · POINT 01 취득세 완전분해</h3><p>제37회 프로젝트 기준에 따라 <b>2026.5.31까지 공포·개정된 규정</b>을 시험 본문으로 사용하고, <b>2026.6.1 이후 개정분</b>은 비교 전용으로 둡니다. 취득 여부 → 시기 → 과표 → 세율 → 중과·비과세 → 신고기한 순서로 61개 소분류를 연결합니다.</p></div>
    <span>PART 2 · POINT 01 · ${taxLawPart2Point01LeafCount}/${taxLawPart2Point01LeafCount}</span>
  </header>
  <aside class="tax-leaf-exam-anchor" aria-label="취득세 출제축">
    <strong>EXAM AXIS</strong>
    <p><b>사실상 취득·간주취득</b>, <b>유상/무상/원시 과표</b>, <b>2.3·2.8·3.5·4%</b>, <b>주택 1~3% 기본구조</b>, <b>일반 60일 / 무상 3개월 / 상속 6개월</b>을 서로 바꾸어 내는 선지를 우선 점검합니다.</p>
  </aside>
  ${acquisitionFlowMarkup()}
  ${deadlineMarkup()}
  <div class="tax-leaf-study__groups">${taxLawPart2Point01Leaves.map((group, groupIndex) => {
    const start = taxLawPart2Point01Leaves.slice(0, groupIndex).reduce((sum, item) => sum + item.topics.length, 0)
    return renderGroup(group, groupIndex, start)
  }).join('')}</div>`
  return section
}

function sync() {
  const page = document.querySelector('.tax-law-page')
  if (!page) return
  const existing = page.querySelector('[data-tax-leaf-study="true"][data-tax-point="p2s1"]')
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
  if (!chip || chip.closest('[data-tax-leaf-study]')?.dataset.taxPoint !== 'p2s1') return
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
