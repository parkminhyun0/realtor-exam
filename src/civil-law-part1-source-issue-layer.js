// 민법 PART 1 · 판례·해석론 직접 근거 카드
// 기존 LAW-FIRST 카드의 조문 구조를 유지하면서, 조문만으로 결론이 완성되지 않는 두 논점에만 판례·해석 근거를 붙입니다.
const PART1_SOURCE_ISSUES = {
  '이중매매의 법률관계': [
    {
      caseNo: '2001다8097, 8103',
      title: '제2매수인의 적극가담과 민법 제103조',
      text: '부동산의 제2매수인이 선행매매 사실을 단순히 알고 있었다는 사정만으로 제2매매가 무효가 되는 것은 아닙니다. 제2매수인이 매도인의 배임행위를 유인·교사하거나 이에 협력하는 등 적극 가담하여 반사회질서의 법률행위가 된 경우에 민법 제103조에 따라 무효가 될 수 있습니다.',
      url: 'https://www.law.go.kr/LSW/precInfoP.do?precSeq=81471',
    },
  ],
  '오표시무해의 원칙': [
    {
      caseNo: '93다2629, 2636(병합)',
      title: '잘못된 표시보다 당사자 쌍방의 합치된 진의가 우선',
      text: '당사자 쌍방이 실제로 같은 토지를 매매하려는 의사로 합치하였으나 계약서의 지번 등 표시만 잘못된 경우에는, 그 잘못된 표시 자체보다 쌍방이 합치한 진정한 의사에 따라 계약내용을 확정합니다. 따라서 별도의 착오취소 문제로만 처리하지 않습니다.',
      url: 'https://law.go.kr/LSW/precInfoP.do?evtNo=93다2629%2C+2636%28병합%29',
    },
    {
      caseNo: '93다3103',
      title: '계약문언이 불명확할 때의 합리적 해석기준',
      text: '계약 문언의 객관적 의미가 명확하지 않은 경우에는 계약의 동기와 경위, 목적, 당사자가 달성하려는 의도, 거래관행 등을 종합하여 당사자의 진정한 의사를 합리적으로 해석합니다. 오표시무해의 원칙은 독립 조문이 아니라 이러한 계약해석 법리와 함께 이해해야 합니다.',
      url: 'https://www.law.go.kr/LSW/precInfoP.do?evtNo=93다3103',
    },
  ],
}

const escPart1Issue = (value = '') => String(value).replace(/[&<>'"]/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;',
}[char]))

function renderPart1IssueCard(topic, item) {
  return `<article class="civil-law-first__law civil-law-first__law--issue" data-civil-source-issue="true" data-civil-part1-source-issue="true" data-topic="${escPart1Issue(topic)}">
    <header>
      <b>판례·쟁점</b>
      <a href="${escPart1Issue(item.url)}" target="_blank" rel="noreferrer">대법원 ${escPart1Issue(item.caseNo)}</a>
      <strong>${escPart1Issue(item.title)}</strong>
    </header>
    <blockquote>${escPart1Issue(item.text)}</blockquote>
  </article>`
}

function syncPart1SourceIssues() {
  const page = document.querySelector('.civil-law-page')
  if (!page) return

  const breadcrumb = page.querySelector('.public-law-breadcrumb')?.textContent || ''
  const topic = page.querySelector('.study-section-heading h2')?.textContent?.trim() || ''
  const items = breadcrumb.includes('PART 1') ? PART1_SOURCE_ISSUES[topic] : null
  const sourceGrid = page.querySelector('[data-civil-law-first="true"] .civil-law-first__law-grid')
  const existing = [...page.querySelectorAll('[data-civil-part1-source-issue="true"]')]

  if (!items || !sourceGrid) {
    existing.forEach((node) => node.remove())
    return
  }

  if (existing.length === items.length && existing.every((node) => node.dataset.topic === topic)) return
  existing.forEach((node) => node.remove())

  const wrap = document.createElement('div')
  wrap.innerHTML = items.map((item) => renderPart1IssueCard(topic, item)).join('')
  ;[...wrap.children].forEach((node) => sourceGrid.appendChild(node))
}

let part1IssueQueued = false
function schedulePart1SourceIssues() {
  if (part1IssueQueued) return
  part1IssueQueued = true
  requestAnimationFrame(() => {
    part1IssueQueued = false
    syncPart1SourceIssues()
  })
}

if (typeof document !== 'undefined') {
  const observer = new MutationObserver(schedulePart1SourceIssues)
  observer.observe(document.documentElement, { subtree: true, childList: true, characterData: true })
  document.addEventListener('click', (event) => {
    if (event.target.closest('.civil-nav-topic-button, .civil-nav-point summary')) schedulePart1SourceIssues()
  })
  schedulePart1SourceIssues()
}
