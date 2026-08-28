import { taxLawPart3Point02Leaves, taxLawPart3Point02LeafCount } from './data/taxLawPart3Point02Leaves.js'

const esc = (value = '') => String(value).replace(/[&<>"']/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[char]))

function isTargetPoint(page) {
  const heading = page.querySelector('.study-section-heading h2')?.textContent?.trim()
  const breadcrumb = page.querySelector('.public-law-breadcrumb')?.textContent || ''
  return heading === '종합소득세' && breadcrumb.includes('PART 3')
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

function incomeFlowMarkup() {
  const steps = [
    ['1', '소득 종류', '이자·배당·사업·근로·연금·기타·퇴직·양도'],
    ['2', '과세방식', '종합 6종 / 퇴직·양도 분류 / 일부 분리'],
    ['3', '임대소득', '수입금액 − 필요경비 · 간주임대료'],
    ['4', '소득금액', '종합과세 대상 소득금액 합산'],
    ['5', '과세표준', '종합소득공제 후 누진세율 적용'],
    ['6', '신고·납부', '다음 연도 5월 1일~31일'],
  ]
  return `<section class="tax-income-flow" aria-label="종합소득세 문제풀이 6단계">
    <header><span>6단계</span><h4>소득구분 → 임대소득 계산 → 과세표준 → 5월 신고</h4></header>
    <div>${steps.map(([no, title, note], index) => `<article><b>${no}</b><strong>${title}</strong><small>${note}</small></article>${index < steps.length - 1 ? '<i>→</i>' : ''}`).join('')}</div>
  </section>`
}

function rentalMarkup() {
  return `<section class="tax-income-rental" aria-label="주택임대소득 핵심 숫자 비교">
    <header><span>임대 숫자축</span><h4>1주택 12억 · 과세 주택임대수입 2천만원 · 분리세율 14%</h4></header>
    <div>
      <article><small>1주택 비과세</small><b>기준시가 12억원 이하</b><strong>국외주택·12억원 초과 제외</strong></article>
      <article><small>분리과세 선택선</small><b>총수입금액 2천만원 이하</b><strong>종합과세와 비교</strong></article>
      <article><small>분리과세 세율</small><b>14%</b><strong>소득세법 제64조의2</strong></article>
      <article><small>일반 필요경비·공제</small><b>50% · 200만원</b><strong>다른 종합소득 2천만원 이하 조건</strong></article>
      <article><small>법정 임대주택</small><b>60% · 400만원</b><strong>별도 요건 충족 시</strong></article>
    </div>
  </section>`
}

function rateMarkup() {
  const rates = [
    ['1,400만원 이하', '6%'],
    ['5,000만원 이하', '15%'],
    ['8,800만원 이하', '24%'],
    ['1억5천만원 이하', '35%'],
    ['3억원 이하', '38%'],
    ['5억원 이하', '40%'],
    ['10억원 이하', '42%'],
    ['10억원 초과', '45%'],
  ]
  return `<section class="tax-income-rates" aria-label="종합소득세 누진세율">
    <header><span>세율축</span><h4>6 · 15 · 24 · 35 · 38 · 40 · 42 · 45%</h4></header>
    <div>${rates.map(([band, rate]) => `<article><small>${band}</small><b>${rate}</b></article>`).join('')}</div>
  </section>`
}

function calendarMarkup() {
  return `<section class="tax-income-calendar" aria-label="종합소득세 과세기간과 확정신고기간">
    <article><small>과세기간</small><b>1월 1일~12월 31일</b><strong>해당 연도 소득 집계</strong></article>
    <i>→</i>
    <article><small>확정신고·납부</small><b>다음 연도 5월 1일~31일</b><strong>과세표준 확정</strong></article>
  </section>`
}

function buildLayer() {
  const section = document.createElement('section')
  section.className = 'study-block tax-leaf-study tax-leaf-study--income'
  section.dataset.taxLeafStudy = 'true'
  section.dataset.taxPoint = 'p3s2'
  section.innerHTML = `<header class="tax-leaf-study__head">
    <div><small>LEAF STUDY · 중분류 → 소분류</small><h3>PART 3 · POINT 02 종합소득세 완전분해</h3><p>제37회 프로젝트 컷오프에 따라 <b>2026.5.31까지 공포·개정된 규정</b>을 시험 본문에 적용하고 <b>2026.6.1 이후 개정분</b>은 비교 전용으로 둡니다. 소득 8분류 → 종합·분류·분리과세 → 부동산임대 → 과표·세율 → 다음 해 5월 신고 순서로 29개 소분류를 연결합니다.</p></div>
    <span>PART 3 · POINT 02 · ${taxLawPart3Point02LeafCount}/${taxLawPart3Point02LeafCount}</span>
  </header>
  <aside class="tax-leaf-exam-anchor" aria-label="종합소득세 출제축">
    <strong>EXAM AXIS</strong>
    <p><b>종합 6종 vs 퇴직·양도 분류과세</b>, <b>주택임대 12억원·2천만원·14%</b>, <b>간주임대료</b>, <b>종합세율 6~45%</b>, <b>1.1~12.31 과세기간 vs 다음해 5.1~5.31 신고</b>를 서로 바꾸는 선지를 우선 점검합니다.</p>
  </aside>
  ${incomeFlowMarkup()}
  ${rentalMarkup()}
  ${rateMarkup()}
  ${calendarMarkup()}
  <div class="tax-leaf-study__groups">${taxLawPart3Point02Leaves.map((group, groupIndex) => {
    const start = taxLawPart3Point02Leaves.slice(0, groupIndex).reduce((sum, item) => sum + item.topics.length, 0)
    return renderGroup(group, groupIndex, start)
  }).join('')}</div>`
  return section
}

function sync() {
  const page = document.querySelector('.tax-law-page')
  if (!page) return
  const existing = page.querySelector('[data-tax-leaf-study="true"][data-tax-point="p3s2"]')
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
  if (!chip || chip.closest('[data-tax-leaf-study]')?.dataset.taxPoint !== 'p3s2') return
  const page = chip.closest('.tax-law-page')
  if (!page) return
  const sourceButton = findLawButton(page, chip.dataset.lawName, chip.dataset.lawArticle)
  if (sourceButton) sourceButton.click()
  else {
    const previous = chip.textContent
    chip.textContent = `${chip.dataset.lawName} ${chip.dataset.lawArticle} · POINT 법령 기준 참조`
    window.setTimeout(() => { chip.textContent = previous }, 1500)
  }
})

const observer = new MutationObserver(scheduleSync)
observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'open'] })
window.addEventListener('hashchange', scheduleSync)
window.setTimeout(scheduleSync, 0)
