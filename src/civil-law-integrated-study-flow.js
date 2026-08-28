import { civilLawParts } from './data/civilLawToc3Level.js'

const flatNodes = civilLawParts.flatMap((part) => (
  part.points.flatMap((point) => (
    point.topics.map((topic) => ({
      key: `${point.id}|${topic}`,
      partNumber: String(part.number),
      partTitle: part.title,
      pointNumber: String(point.number),
      pointTitle: point.title,
      topic,
    }))
  ))
))

const STEP_DEFS = [
  {
    id: 'law',
    label: '조문 · 기준',
    hint: '현행 조문과 LAW-FIRST 해설',
    selectors: ['[data-civil-law-first="true"]', '.civil-statute-section'],
    required: true,
  },
  {
    id: 'visual',
    label: '다이어그램',
    hint: '현재 논점의 판단·관계 구조',
    selectors: ['.civil-topic-visual'],
    required: true,
  },
  {
    id: 'map',
    label: '마인드맵',
    hint: '앞·뒤·다른 PART 연결',
    selectors: ['.civil-learning-map'],
    required: true,
  },
  {
    id: 'exam',
    label: '출제포인트',
    hint: '암기 키워드와 시험 체크',
    selectors: ['.civil-learning-exam-card'],
    required: true,
  },
  {
    id: 'precedent',
    label: '판례',
    hint: '이 논점에 직접 연결된 판례',
    selectors: [
      '[data-civil-law-leaf-precedents="true"]',
      '[data-civil-law-part2-extra-precedents="true"]',
    ],
    required: false,
  },
  {
    id: 'practice',
    label: '문제 · 훈련',
    hint: '세부항목 자가회상·O/X 집중훈련',
    selectors: ['[data-civil-leaf-practice="true"]', '[data-civil-intensive="true"]'],
    required: false,
  },
]

const esc = (value = '') => String(value).replace(/[&<>"']/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[char]))

function currentNode(page) {
  const buttons = [...page.querySelectorAll('.civil-nav-topic-button')]
  const active = buttons.find((button) => button.classList.contains('active'))
  if (!active) return null
  return flatNodes[buttons.indexOf(active)] || null
}

function firstMatch(page, selectors) {
  for (const selector of selectors) {
    const local = page.querySelector(selector)
    if (local) return local
  }
  return null
}

function exactLeafMatch(page, step, node) {
  if (step.id === 'precedent') {
    return [...page.querySelectorAll([
      '[data-civil-law-leaf-precedents="true"]',
      '[data-civil-law-part2-extra-precedents="true"]',
    ].join(', '))].find((item) => item.dataset.topic === node.topic) || null
  }

  if (step.id === 'practice') {
    const recall = [...page.querySelectorAll('[data-civil-leaf-practice="true"]')]
      .find((item) => item.dataset.topic === node.topic)
    if (recall) return recall
    return page.querySelector('[data-civil-intensive="true"]')
  }

  return firstMatch(page, step.selectors)
}

function buildSteps(page, node) {
  return STEP_DEFS.map((step) => ({
    ...step,
    target: exactLeafMatch(page, step, node),
  }))
}

function pendingStatus(step) {
  if (step.required) return '연결 확인 중'
  if (step.id === 'precedent') return '조문·개념 중심'
  return '추가 훈련 예정'
}

function renderStep(step, index) {
  const available = Boolean(step.target)
  const status = available ? '바로 보기' : pendingStatus(step)
  return `<button type="button" class="civil-study-flow__step ${available ? 'is-ready' : 'is-pending'}"
    data-civil-study-flow-target="${esc(step.id)}" ${available ? '' : 'disabled'}>
    <span>${String(index + 1).padStart(2, '0')}</span>
    <strong>${esc(step.label)}</strong>
    <small>${esc(step.hint)}</small>
    <em>${esc(status)}</em>
  </button>`
}

function render(page, node) {
  const steps = buildSteps(page, node)
  const readyCount = steps.filter((step) => step.target).length
  const fingerprint = `${node.key}|${steps.map((step) => step.target ? '1' : '0').join('')}`
  const existing = page.querySelector('[data-civil-study-flow="true"]')
  if (existing?.dataset.fingerprint === fingerprint) return

  existing?.remove()

  const section = document.createElement('section')
  section.className = 'civil-study-flow'
  section.dataset.civilStudyFlow = 'true'
  section.dataset.fingerprint = fingerprint
  section.innerHTML = `<header class="civil-study-flow__head">
      <div>
        <small>STUDY FLOW · BOOK × MAP × EXAM</small>
        <h3>${esc(node.topic)} 통합 학습 체크업</h3>
      </div>
      <span>${readyCount}/6 연결</span>
    </header>
    <p class="civil-study-flow__intro">교재 목차 순서는 그대로 유지하면서 조문 → 시각화 → 연결 → 출제포인트 → 판례 → 문제 순으로 확인합니다. 판례는 해당 세부항목에 직접 연결된 판례가 있을 때만 활성화하고, 개념·조문 중심 항목은 억지로 판례를 붙이지 않습니다.</p>
    <div class="civil-study-flow__path">
      <span>PART ${esc(node.partNumber)} ${esc(node.partTitle)}</span><i>›</i>
      <span>POINT ${esc(node.pointNumber)} ${esc(node.pointTitle)}</span><i>›</i>
      <strong>${esc(node.topic)}</strong>
    </div>
    <div class="civil-study-flow__steps">${steps.map(renderStep).join('')}</div>`

  const heading = page.querySelector('.public-law-content .study-section-heading')
  if (heading) heading.insertAdjacentElement('afterend', section)
}

function scrollToStep(page, id) {
  const node = currentNode(page)
  const step = STEP_DEFS.find((item) => item.id === id)
  if (!step || !node) return
  const target = exactLeafMatch(page, step, node)
  if (!target) return
  target.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

let scheduled = false
function sync() {
  const page = document.querySelector('.civil-law-page')
  if (!page) return
  const node = currentNode(page)
  if (!node) return
  render(page, node)
}

function scheduleSync() {
  if (scheduled) return
  scheduled = true
  window.requestAnimationFrame(() => {
    scheduled = false
    sync()
  })
}

document.addEventListener('click', (event) => {
  const button = event.target.closest('[data-civil-study-flow-target]')
  if (!button) return
  const page = button.closest('.civil-law-page')
  if (!page) return
  scrollToStep(page, button.dataset.civilStudyFlowTarget)
})

const observer = new MutationObserver(scheduleSync)
observer.observe(document.documentElement, {
  childList: true,
  subtree: true,
  attributes: true,
  attributeFilter: ['class', 'open'],
})

window.addEventListener('hashchange', scheduleSync)
window.setTimeout(scheduleSync, 0)
