import { taxLawPart3Point03Leaves, taxLawPart3Point03LeafCount } from './data/taxLawPart3Point03Leaves.js'

const esc = (value = '') => String(value).replace(/[&<>"']/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[char]))

function isTargetPoint(page) {
  const heading = page.querySelector('.study-section-heading h2')?.textContent?.trim()
  const breadcrumb = page.querySelector('.public-law-breadcrumb')?.textContent || ''
  return heading === '양도소득세' && breadcrumb.includes('PART 3')
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
    <header><span>${String(index + 1).padStart(2, '0')}</span><div><small>소분류 · LEAF</small><h4>${esc(item.topic)}</h4></div></header>
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
    <header class="tax-leaf-group__head"><span>${String(groupIndex + 1).padStart(2, '0')}</span><div><small>중분류</small><h3>${esc(group.group)}</h3></div><b>${group.topics.length}개 소분류</b></header>
    <div class="tax-leaf-grid">${group.topics.map((item, index) => renderLeaf(item, startIndex + index)).join('')}</div>
  </section>`
}

function chainMarkup() {
  const steps = [
    ['1', '양도 판정', '유상 사실이전인가'],
    ['2', '대상·시기', '제94조 자산 + 대금청산일'],
    ['3', '양도차익', '양도가액 − 취득가액·필요경비'],
    ['4', '양도소득금액', '양도차익 − 장기보유특별공제'],
    ['5', '과세표준', '양도소득금액 − 기본공제 250만원'],
    ['6', '세율·신고', '세율 비교 → 예정·확정신고'],
  ]
  return `<section class="tax-transfer-chain" aria-label="양도소득세 계산 6단계">
    <header><span>6단계</span><h4>양도 여부 → 과세대상·시기 → 차익 → 장특 → 250만원 → 세율·신고</h4></header>
    <div>${steps.map(([no, title, note], index) => `<article><b>${no}</b><strong>${title}</strong><small>${note}</small></article>${index < steps.length - 1 ? '<i>→</i>' : ''}`).join('')}</div>
  </section>`
}

function timeMarkup() {
  return `<section class="tax-transfer-time" aria-label="양도 취득시기와 신고기한">
    <header><span>시간축</span><h4>대금청산일 원칙 → 월말+2개월 예정신고 → 다음해 5월 확정신고</h4></header>
    <div>
      <article><small>양도·취득시기 원칙</small><b>대금청산일</b><strong>선등기면 등기접수일 등 예외 확인</strong></article>
      <i>→</i>
      <article><small>예정신고</small><b>양도월 말일부터 2개월</b><strong>부담부증여 채무부분은 3개월</strong></article>
      <i>→</i>
      <article><small>확정신고</small><b>다음 연도 5.1~5.31</b><strong>예정신고 후 생략 가능 여부는 예외 확인</strong></article>
    </div>
  </section>`
}

function rateMarkup() {
  const rates = [
    ['기본', '6~45%', '일반 토지·건물 등'],
    ['1~2년', '40%', '주택·입주권·분양권 60%'],
    ['1년 미만', '50%', '주택·입주권·분양권 70%'],
    ['분양권', '60%', '기본 규정상 별도율'],
    ['미등기', '70%', '공제 불이익 연결'],
    ['비사업용 토지', '기본+10%p', '16~55% 구조'],
  ]
  return `<section class="tax-transfer-rates" aria-label="양도소득세 세율 비교">
    <header><span>세율축</span><h4>기본 6~45% · 단기 40/50% · 주택 단기 60/70% · 미등기 70%</h4></header>
    <div>${rates.map(([title, rate, note]) => `<article><small>${title}</small><b>${rate}</b><strong>${note}</strong></article>`).join('')}</div>
  </section>`
}

function houseMarkup() {
  return `<section class="tax-transfer-house" aria-label="1세대 1주택 핵심 숫자">
    <header><span>1세대1주택</span><h4>보유 2년 · 필요 시 거주 2년 · 고가주택 12억원 · 일시적 2주택 1년/3년</h4></header>
    <div>
      <article><small>기본 보유</small><b>2년</b><strong>취득시기부터 계산</strong></article>
      <article><small>조정대상 취득 등</small><b>거주 2년</b><strong>법정 해당 경우에 추가 확인</strong></article>
      <article><small>고가주택</small><b>12억원 초과</b><strong>전액 비과세가 아니라 부분과세</strong></article>
      <article><small>일시적 2주택</small><b>1년 후 신규취득 · 3년 내 종전양도</b><strong>시행령 제155조</strong></article>
      <article><small>장특 특례</small><b>보유 40% + 거주 40%</b><strong>각 10년 최대 · 합계 최대 80%</strong></article>
    </div>
  </section>`
}

function cutoffMarkup() {
  return `<aside class="tax-transfer-cutoff">
    <strong>제37회 법령 적용선</strong>
    <p><b>2026.5.31까지 공포·개정된 규정</b>을 시험 본문에 적용합니다. 따라서 <b>2026.5.22 소득세법 시행령 개정</b>도 적용범위에 포함하고, <b>2026.6.1 이후 개정분</b>은 제38회 대비 비교자료로만 분리합니다.</p>
  </aside>`
}

function buildLayer() {
  const section = document.createElement('section')
  section.className = 'study-block tax-leaf-study tax-leaf-study--transfer'
  section.dataset.taxLeafStudy = 'true'
  section.dataset.taxPoint = 'p3s3'
  section.innerHTML = `<header class="tax-leaf-study__head">
    <div><small>LEAF STUDY · 중분류 → 소분류</small><h3>PART 3 · POINT 03 양도소득세 완전분해</h3><p>양도 여부부터 비과세·감면·신고까지 <b>${taxLawPart3Point03LeafCount}개 소분류</b>를 하나의 계산사슬로 연결합니다. 숫자는 시기·공제·세율·1세대1주택·신고기한을 중심으로 비교합니다.</p></div>
    <span>PART 3 · POINT 03 · ${taxLawPart3Point03LeafCount}/${taxLawPart3Point03LeafCount}</span>
  </header>
  <aside class="tax-leaf-exam-anchor" aria-label="양도소득세 출제축"><strong>EXAM AXIS</strong><p><b>대금청산일</b>, <b>연 250만원 기본공제</b>, <b>일반 장특 6~30% / 1주택 최대 80%</b>, <b>12억원 고가주택</b>, <b>단기 40·50 / 주택 60·70%</b>, <b>월말+2개월 / 다음해 5월</b>을 서로 바꾸는 선지를 먼저 잡습니다.</p></aside>
  ${chainMarkup()}
  ${timeMarkup()}
  ${rateMarkup()}
  ${houseMarkup()}
  ${cutoffMarkup()}
  <div class="tax-leaf-study__groups">${taxLawPart3Point03Leaves.map((group, groupIndex) => {
    const start = taxLawPart3Point03Leaves.slice(0, groupIndex).reduce((sum, item) => sum + item.topics.length, 0)
    return renderGroup(group, groupIndex, start)
  }).join('')}</div>`
  return section
}

function sync() {
  const page = document.querySelector('.tax-law-page')
  if (!page) return
  const existing = page.querySelector('[data-tax-leaf-study="true"][data-tax-point="p3s3"]')
  if (!isTargetPoint(page)) { existing?.remove(); return }
  if (existing) return
  const anchor = page.querySelector('.tax-exam-core')
  if (!anchor) return
  anchor.insertAdjacentElement('afterend', buildLayer())
}

let queued = false
function scheduleSync() {
  if (queued) return
  queued = true
  window.requestAnimationFrame(() => { queued = false; sync() })
}

document.addEventListener('click', (event) => {
  const chip = event.target instanceof Element ? event.target.closest('[data-tax-leaf-law="true"]') : null
  if (!chip || chip.closest('[data-tax-leaf-study]')?.dataset.taxPoint !== 'p3s3') return
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
