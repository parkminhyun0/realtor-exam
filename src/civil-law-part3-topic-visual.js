import { civilLawParts } from './data/civilLawToc3Level.js'
import { civilLawPart3VisualByKey } from './data/civilLawPart3Visuals.js'

const flatNodes = civilLawParts.flatMap((part) => (
  part.points.flatMap((point) => (
    point.topics.map((topic) => ({
      key: `${point.id}|${topic}`,
      partId: part.id,
      partNumber: String(part.number),
      partTitle: part.title,
      pointId: point.id,
      pointNumber: String(point.number),
      pointTitle: point.title,
      topic,
    }))
  ))
))

const TYPE_LABELS = {
  flow: '흐름형',
  decision: '판단분기형',
  timeline: '시간축형',
  relation: '관계형',
  compare: '비교형',
  taxonomy: '분류형',
}

const esc = (value = '') => String(value).replace(/[&<>"']/g, (ch) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[ch]))

function currentNode(page) {
  const buttons = [...page.querySelectorAll('.civil-nav-topic-button')]
  const active = buttons.find((button) => button.classList.contains('active'))
  if (!active) return null
  const index = buttons.indexOf(active)
  return flatNodes[index] || null
}

function renderNode(node, index, total) {
  return `<li class="civil-topic-visual__node">
    <span>${String(index + 1).padStart(2, '0')}</span>
    <strong>${esc(node)}</strong>
    ${index < total - 1 ? '<i aria-hidden="true">→</i>' : ''}
  </li>`
}

function renderGroup(group, index, type) {
  const nodes = group.nodes || []
  return `<section class="civil-topic-visual__group" data-group-index="${index + 1}">
    <header><span>${String(index + 1).padStart(2, '0')}</span><strong>${esc(group.label)}</strong></header>
    <ol class="civil-topic-visual__nodes" data-visual-flow="${esc(type)}">
      ${nodes.map((node, nodeIndex) => renderNode(node, nodeIndex, nodes.length)).join('')}
    </ol>
  </section>`
}

function renderKeywords(visual) {
  if (!visual.keywords?.length) return ''
  return `<div class="civil-topic-visual__keywords" aria-label="암기 핵심 키워드">
    <strong>KEYWORD · 반드시 기억</strong>
    <div>${visual.keywords.map((keyword) => `<span>${esc(keyword)}</span>`).join('')}</div>
  </div>`
}

function renderBridges(visual) {
  if (!visual.bridges?.length) return ''
  return `<section class="civil-topic-visual__bridges" aria-label="다른 PART 연결지점">
    <header><strong>CONNECT · 다른 PART와 연결</strong><span>교재 순서는 유지하고 필요한 연결만 확인합니다.</span></header>
    <div>${visual.bridges.map((bridge) => `<button type="button" data-civil-learning-target="${esc(bridge.key)}">
      <strong>${esc(bridge.label)}</strong>
      <span>${esc(bridge.reason)}</span>
    </button>`).join('')}</div>
  </section>`
}

function renderVisual(node, visual) {
  const label = TYPE_LABELS[visual.type] || visual.type
  return `<section class="civil-topic-visual civil-topic-visual--part3" data-civil-part3-visual="true" data-visual-key="${esc(node.key)}" data-visual-type="${esc(visual.type)}">
    <header class="civil-topic-visual__head">
      <div>
        <small>VISUAL · PART 3 계약법 전용 다이어그램</small>
        <h3>${esc(visual.topic)}</h3>
      </div>
      <span>${esc(label)}</span>
    </header>
    <p class="civil-topic-visual__question">${esc(visual.question)}</p>
    ${renderKeywords(visual)}
    <div class="civil-topic-visual__canvas" data-visual-type="${esc(visual.type)}">
      <div class="civil-topic-visual__focus">
        <small>현재 세부항목</small>
        <strong>${esc(visual.topic)}</strong>
        <span>PART ${esc(node.partNumber)} · POINT ${esc(node.pointNumber)} ${esc(node.pointTitle)}</span>
      </div>
      <div class="civil-topic-visual__groups">
        ${visual.groups.map((group, index) => renderGroup(group, index, visual.type)).join('')}
      </div>
    </div>
    ${renderBridges(visual)}
    <footer class="civil-topic-visual__takeaway"><span>한 문장 기억</span><strong>${esc(visual.takeaway)}</strong></footer>
  </section>`
}

function sync() {
  const page = document.querySelector('.civil-law-page')
  if (!page) return
  const node = currentNode(page)
  if (!node) return

  const existing = page.querySelector('[data-civil-part3-visual="true"]')
  const visual = civilLawPart3VisualByKey.get(node.key)

  if (!visual) {
    existing?.remove()
    return
  }

  if (existing?.dataset.visualKey === node.key) return
  existing?.remove()

  const wrapper = document.createElement('div')
  wrapper.innerHTML = renderVisual(node, visual)
  const section = wrapper.firstElementChild
  if (!section) return

  const learningLayer = page.querySelector('[data-civil-book-map-exam="true"]')
  if (learningLayer) {
    learningLayer.insertAdjacentElement('afterend', section)
    return
  }

  const heading = page.querySelector('.public-law-content .study-section-heading')
  heading?.insertAdjacentElement('afterend', section)
}

let scheduled = false
function scheduleSync() {
  if (scheduled) return
  scheduled = true
  window.requestAnimationFrame(() => {
    scheduled = false
    sync()
  })
}

const observer = new MutationObserver(scheduleSync)
observer.observe(document.documentElement, {
  childList: true,
  subtree: true,
  attributes: true,
  attributeFilter: ['class', 'open'],
})

window.addEventListener('hashchange', scheduleSync)
window.setTimeout(scheduleSync, 0)
