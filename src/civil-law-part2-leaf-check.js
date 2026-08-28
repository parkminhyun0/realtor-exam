import { civilLawParts } from './data/civilLawToc3Level.js'
import { civilLawPart2Visuals } from './data/civilLawPart2Visuals.js'

const visualByKey = new Map(civilLawPart2Visuals.map((item) => [item.key, item]))
const flatLeaves = civilLawParts.flatMap((part) => (
  part.points.flatMap((point) => (
    point.topics.map((topic) => ({
      key: `${point.id}|${topic}`,
      partNumber: String(part.number),
    }))
  ))
))

const esc = (value = '') => String(value).replace(/[&<>"']/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[char]))

function currentKey(page) {
  const buttons = [...page.querySelectorAll('.civil-nav-topic-button')]
  const active = buttons.find((button) => button.classList.contains('active'))
  if (!active) return null
  const node = flatLeaves[buttons.indexOf(active)]
  return node?.partNumber === '2' ? node.key : null
}

function renderCheck(visual) {
  const groups = (visual.groups || []).map((group, index) => `
    <li>
      <span>${String(index + 1).padStart(2, '0')}</span>
      <div><b>${esc(group.label)}</b><p>${(group.nodes || []).map(esc).join(' → ')}</p></div>
    </li>`).join('')

  return `<section class="civil-leaf-recall-check" data-civil-leaf-practice="true" data-topic="${esc(visual.topic)}">
    <header>
      <div><small>RECALL CHECK · 세부항목 자가진단</small><h3>${esc(visual.topic)}</h3></div>
      <span>PART 2 · 65/65</span>
    </header>
    <p class="civil-leaf-recall-check__question">${esc(visual.question)}</p>
    <details>
      <summary>답을 떠올린 뒤 핵심 구조 확인</summary>
      <div class="civil-leaf-recall-check__answer">
        <ol>${groups}</ol>
        <p><b>한 문장 기억</b>${esc(visual.takeaway)}</p>
      </div>
    </details>
  </section>`
}

let scheduled = false
function sync() {
  const page = document.querySelector('.civil-law-page')
  if (!page) return

  const existing = [...page.querySelectorAll('[data-civil-leaf-practice="true"]')]
    .find((item) => item.dataset.civilPart === '2')
  const key = currentKey(page)
  const visual = key ? visualByKey.get(key) : null

  if (!visual) {
    existing?.remove()
    return
  }
  if (existing?.dataset.topic === visual.topic) return

  existing?.remove()
  const wrapper = document.createElement('div')
  wrapper.innerHTML = renderCheck(visual)
  const section = wrapper.firstElementChild
  if (section) section.dataset.civilPart = '2'

  const anchor = page.querySelector('.civil-learning-exam-card')
    || page.querySelector('.civil-topic-visual')
    || page.querySelector('.civil-topic-focus')
  if (anchor && section) anchor.insertAdjacentElement('afterend', section)
}

function schedule() {
  if (scheduled) return
  scheduled = true
  window.requestAnimationFrame(() => {
    scheduled = false
    sync()
  })
}

const observer = new MutationObserver(schedule)
observer.observe(document.documentElement, {
  childList: true,
  subtree: true,
  attributes: true,
  attributeFilter: ['class', 'open'],
})

window.addEventListener('hashchange', schedule)
window.setTimeout(schedule, 0)
