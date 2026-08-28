const SUBJECT_PAGE_SELECTOR = [
  '.real-estate-theory-page',
  '.civil-law-page:not(.tax-law-page)',
  '.public-law-page:not(.real-estate-theory-page):not(.civil-law-page):not(.registration-law-page):not(.subject-placeholder-page)',
  '.registration-law-page',
  '.tax-law-page',
  '.subject-placeholder-page',
].join(', ')

const LABEL_REPLACEMENTS = new Map([
  ['REAL ESTATE TAX LAW · 2026', 'REAL ESTATE TAX LAW · 제37회 시험 기준'],
  ['PUBLIC LAW · 2026', 'PUBLIC LAW · 제37회 시험 기준'],
  ['검증 본문 반영 · 2026 기준', '검증 본문 반영 · 제37회 시험 기준'],
  ['근거법령 · 현행 조문', '근거법령 · 제37회 시험 기준 조문'],
  ['현행 조세 법령 바로보기', '제37회 시험 기준 조세 법령 바로보기'],
])

function replaceKnownLabels(page) {
  const candidates = page.querySelectorAll('.eyebrow, .law-reference, .study-block__title h3')
  candidates.forEach((node) => {
    const current = node.textContent?.trim()
    const next = LABEL_REPLACEMENTS.get(current)
    if (!next) return
    node.textContent = next
    node.dataset.exam37BaselineRelabeled = 'true'
  })
}

function createInlineStamp() {
  const stamp = document.createElement('section')
  stamp.className = 'exam37-inline-baseline'
  stamp.dataset.exam37InlineBaseline = 'true'
  stamp.setAttribute('aria-label', '제37회 시험 본문 법령 기준')
  stamp.innerHTML = `
    <div class="exam37-inline-baseline__badge">37</div>
    <div class="exam37-inline-baseline__copy">
      <strong>제37회 시험 기준 · 개정 전 법령으로 학습</strong>
      <p>본문 정답 기준에는 2026년에 공포·개정된 규정을 반영하지 않습니다. 2026 개정법은 상단의 <b>2026 개정법 차이 보기</b>에서 개정 전·후를 별도로 비교합니다.</p>
    </div>
    <span class="exam37-inline-baseline__state">EXAM BASELINE</span>
  `
  return stamp
}

function syncPage(page) {
  replaceKnownLabels(page)

  const content = page.querySelector('.public-law-content')
  if (!content || content.querySelector(':scope > [data-exam37-inline-baseline="true"]')) return

  const breadcrumb = content.querySelector(':scope > .public-law-breadcrumb')
  const stamp = createInlineStamp()
  if (breadcrumb) breadcrumb.insertAdjacentElement('afterend', stamp)
  else content.prepend(stamp)
}

let queued = false
function sync() {
  queued = false
  document.querySelectorAll(SUBJECT_PAGE_SELECTOR).forEach(syncPage)
}

function scheduleSync() {
  if (queued) return
  queued = true
  window.requestAnimationFrame(sync)
}

const observer = new MutationObserver(scheduleSync)
observer.observe(document.documentElement, { childList: true, subtree: true, characterData: true })
window.addEventListener('hashchange', scheduleSync)
window.setTimeout(scheduleSync, 0)
