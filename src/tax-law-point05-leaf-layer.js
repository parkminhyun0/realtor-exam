import { taxLawPart2Point02Leaves, taxLawPart2Point02LeafCount } from './data/taxLawPart2Point02Leaves.js'

const esc = (value = '') => String(value).replace(/[&<>"']/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[char]))

function isTargetPoint(page) {
  const heading = page.querySelector('.study-section-heading h2')?.textContent?.trim()
  const breadcrumb = page.querySelector('.public-law-breadcrumb')?.textContent || ''
  return heading === '등록면허세' && breadcrumb.includes('PART 2')
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

function registrationFlowMarkup() {
  const steps = [
    ['1', '등록분인가?', '취득세 과세취득 원인인지 먼저 분리'],
    ['2', '납세의무·납세지', '등록하는 자 · 부동산 소재지'],
    ['3', '과세표준', '소유권·저당권 등 권리별 기준'],
    ['4', '세율', '보존·유상·무상·상속·제한물권'],
    ['5', '중과·비과세', '대도시 중과와 법정 제외 확인'],
    ['6', '신고납부', '원칙적으로 등기·등록 전 납부'],
  ]
  return `<section class="tax-registration-flow" aria-label="등록면허세 문제풀이 6단계">
    <header><span>등록분 6단계</span><h4>취득세와 분리한 뒤 과표·세율·등록 전 납부까지</h4></header>
    <div>${steps.map(([no, title, note], index) => `<article><b>${no}</b><strong>${title}</strong><small>${note}</small></article>${index < steps.length - 1 ? '<i>→</i>' : ''}`).join('')}</div>
  </section>`
}

function rateMarkup() {
  const rates = [
    ['소유권 보존', '0.8%', '부동산가액'],
    ['유상 소유권이전', '2.0%', '부동산가액'],
    ['무상 소유권이전', '1.5%', '부동산가액'],
    ['상속 소유권이전', '0.8%', '부동산가액'],
    ['제한물권 설정', '0.2%', '채권·전세금 등 법정 과표'],
  ]
  return `<section class="tax-registration-rates" aria-label="등록면허세 대표 세율 비교">
    <header><span>숫자축</span><h4>보존 0.8 · 유상 2.0 · 무상 1.5 · 상속 0.8 · 제한물권 0.2</h4></header>
    <div>${rates.map(([title, rate, basis]) => `<article><small>${title}</small><b>${rate}</b><strong>${basis}</strong></article>`).join('')}</div>
  </section>`
}

function buildLayer() {
  const section = document.createElement('section')
  section.className = 'study-block tax-leaf-study tax-leaf-study--registration'
  section.dataset.taxLeafStudy = 'true'
  section.dataset.taxPoint = 'p2s2'
  section.innerHTML = `<header class="tax-leaf-study__head">
    <div><small>LEAF STUDY · 중분류 → 소분류</small><h3>PART 2 · POINT 02 등록면허세 완전분해</h3><p>제37회 프로젝트 기준에 따라 <b>2026.5.31까지 공포·개정된 규정</b>을 시험 본문으로 사용하고, <b>2026.6.1 이후 개정분</b>은 비교 전용으로 둡니다. 등록분 여부 → 납세의무·납세지 → 과표 → 세율 → 중과·비과세 → 등록 전 신고납부 순서로 24개 소분류를 연결합니다.</p></div>
    <span>PART 2 · POINT 02 · ${taxLawPart2Point02LeafCount}/${taxLawPart2Point02LeafCount}</span>
  </header>
  <aside class="tax-leaf-exam-anchor" aria-label="등록면허세 출제축">
    <strong>EXAM AXIS</strong>
    <p><b>취득세와 등록분 구별</b>, <b>부동산 소재지</b>, <b>보존 0.8 / 유상 2.0 / 무상 1.5 / 상속 0.8 / 제한물권 0.2</b>, <b>등기·등록 전 신고납부</b>를 서로 바꾸어 내는 선지를 우선 점검합니다.</p>
  </aside>
  ${registrationFlowMarkup()}
  ${rateMarkup()}
  <div class="tax-leaf-study__groups">${taxLawPart2Point02Leaves.map((group, groupIndex) => {
    const start = taxLawPart2Point02Leaves.slice(0, groupIndex).reduce((sum, item) => sum + item.topics.length, 0)
    return renderGroup(group, groupIndex, start)
  }).join('')}</div>`
  return section
}

function sync() {
  const page = document.querySelector('.tax-law-page')
  if (!page) return
  const existing = page.querySelector('[data-tax-leaf-study="true"][data-tax-point="p2s2"]')
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
  if (!chip || chip.closest('[data-tax-leaf-study]')?.dataset.taxPoint !== 'p2s2') return
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
