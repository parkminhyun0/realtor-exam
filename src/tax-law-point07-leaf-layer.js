import { taxLawPart3Point01Leaves, taxLawPart3Point01LeafCount } from './data/taxLawPart3Point01Leaves.js'

const esc = (value = '') => String(value).replace(/[&<>"']/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[char]))

function isTargetPoint(page) {
  const heading = page.querySelector('.study-section-heading h2')?.textContent?.trim()
  const breadcrumb = page.querySelector('.public-law-breadcrumb')?.textContent || ''
  return heading === '종합부동산세' && breadcrumb.includes('PART 3')
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

function formulaMarkup() {
  const formulas = [
    ['주택 · 1세대 1주택', '(공시가격 합계 − 12억원) × 60%', '12억 공제'],
    ['주택 · 일반 개인', '(공시가격 합계 − 9억원) × 60%', '9억 공제'],
    ['주택 · 일반 법인 등', '(공시가격 합계 − 0원) × 60%', '기본공제 0'],
    ['종합합산토지', '(공시가격 합계 − 5억원) × 100%', '5억 공제'],
    ['별도합산토지', '(공시가격 합계 − 80억원) × 100%', '80억 공제'],
  ]
  return `<section class="tax-comprehensive-formulas" aria-label="종합부동산세 과세표준 공식">
    <header><span>과표 공식</span><h4>12 · 9 · 0 / 5 · 80 그리고 60% · 100%</h4></header>
    <div>${formulas.map(([title, formula, badge]) => `<article><small>${title}</small><strong>${formula}</strong><b>${badge}</b></article>`).join('')}</div>
  </section>`
}

function rateMarkup() {
  const rows = [
    ['주택 2주택 이하', '3·6·12·25·50·94억원', '0.5 · 0.7 · 1.0 · 1.3 · 1.5 · 2.0 · 2.7%'],
    ['주택 3주택 이상', '3·6·12·25·50·94억원', '0.5 · 0.7 · 1.0 · 2.0 · 3.0 · 4.0 · 5.0%'],
    ['종합합산토지', '15억원 · 45억원', '1 · 2 · 3%'],
    ['별도합산토지', '200억원 · 400억원', '0.5 · 0.6 · 0.7%'],
  ]
  return `<section class="tax-comprehensive-rates" aria-label="종합부동산세 세율 비교">
    <header><span>세율축</span><h4>주택 수 + 과표구간 / 토지구분 + 과표구간</h4></header>
    <div>${rows.map(([title, brackets, rates]) => `<article><small>${title}</small><strong>${brackets}</strong><b>${rates}</b></article>`).join('')}</div>
  </section>`
}

function creditMarkup() {
  return `<section class="tax-comprehensive-credits" aria-label="1세대 1주택 세액공제">
    <header><span>1주택 공제</span><h4>고령자 + 장기보유, 합계 80% 한도</h4></header>
    <div>
      <article><small>고령자</small><strong>60세↑ 20% · 65세↑ 30% · 70세↑ 40%</strong><b>연령은 과세기준일</b></article>
      <article><small>장기보유</small><strong>5년↑ 20% · 10년↑ 40% · 15년↑ 50%</strong><b>보유기간은 과세기준일</b></article>
      <article><small>중복한도</small><strong>고령 + 장기보유 합계</strong><b>최대 80%</b></article>
    </div>
  </section>`
}

function calendarMarkup() {
  return `<section class="tax-comprehensive-calendar" aria-label="종합부동산세 날짜와 분납">
    <header><span>날짜·숫자</span><h4>6월 1일 → 12월 1~15일 → 분납 250만원 초과·6개월</h4></header>
    <div>
      <article><small>과세기준일</small><b>6월 1일</b><strong>재산세 기준일 준용</strong></article>
      <article><small>납부·선택 신고기간</small><b>12.1~12.15</b><strong>원칙 부과징수, 신고납부 선택</strong></article>
      <article><small>분납</small><b>250만원 초과</b><strong>납부기한 후 6개월 이내</strong></article>
    </div>
  </section>`
}

function amendmentMarkup() {
  return `<section class="tax-comprehensive-amendment" aria-label="제37회 적용 2026 종부세 개정">
    <header><span>2026 적용 개정</span><h4>2026.2.27 시행령 · 2026.3.20 시행규칙은 5월 31일 컷오프 안</h4></header>
    <p><b>제37회 본문에 적용:</b> 2026.2.27 종합부동산세법 시행령 개정과 2026.3.20 시행규칙 정비는 시험 기준에 포함합니다. 특히 일정한 <b>인구감소지역·인구감소관심지역 주택</b> 등의 주택 수 산정 제외 규정이 반영됩니다.</p>
    <p><b>시험 함정:</b> 주택 수 산정 제외는 세율·1세대 1주택 판단을 위한 특례이고, 법 제8조의 <b>과세표준 합산배제</b>와 같은 개념으로 처리하지 않습니다.</p>
  </section>`
}

function buildLayer() {
  const section = document.createElement('section')
  section.className = 'study-block tax-leaf-study tax-leaf-study--comprehensive'
  section.dataset.taxLeafStudy = 'true'
  section.dataset.taxPoint = 'p3s1'
  section.innerHTML = `<header class="tax-leaf-study__head">
    <div><small>LEAF STUDY · 중분류 → 소분류</small><h3>PART 3 · POINT 01 종합부동산세 완전분해</h3><p>제37회 프로젝트의 전 과목 공통 컷오프에 따라 <b>2026.5.31까지 공포·개정된 규정</b>을 시험 본문에 적용하고, <b>2026.6.1 이후 개정분</b>은 비교 전용으로 둡니다. 6월 1일 → 주택/토지 분류 → 전국합산 → 공제·과표 → 세율·세액공제 → 12월 부과·납부 순서로 ${taxLawPart3Point01LeafCount}개 소분류를 연결합니다.</p></div>
    <span>PART 3 · POINT 01 · ${taxLawPart3Point01LeafCount}/${taxLawPart3Point01LeafCount}</span>
  </header>
  <aside class="tax-leaf-exam-anchor" aria-label="종합부동산세 출제축">
    <strong>EXAM AXIS</strong>
    <p><b>6월 1일</b>, <b>주택 12억·9억·0원</b>, <b>토지 5억·80억</b>, <b>주택 60% / 토지 100%</b>, <b>1주택 세액공제 80% 한도</b>, <b>12월 1~15일</b>, <b>분납 250만원 초과·6개월</b>을 서로 바꾸어 내는 선지를 우선 점검합니다.</p>
  </aside>
  ${formulaMarkup()}
  ${rateMarkup()}
  ${creditMarkup()}
  ${calendarMarkup()}
  ${amendmentMarkup()}
  <div class="tax-leaf-study__groups">${taxLawPart3Point01Leaves.map((group, groupIndex) => {
    const start = taxLawPart3Point01Leaves.slice(0, groupIndex).reduce((sum, item) => sum + item.topics.length, 0)
    return renderGroup(group, groupIndex, start)
  }).join('')}</div>`
  return section
}

function sync() {
  const page = document.querySelector('.tax-law-page')
  if (!page) return
  const existing = page.querySelector('[data-tax-leaf-study="true"][data-tax-point="p3s1"]')
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
  if (!chip || chip.closest('[data-tax-leaf-study]')?.dataset.taxPoint !== 'p3s1') return
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
