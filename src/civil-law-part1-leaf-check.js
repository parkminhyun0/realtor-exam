import { civilLawPart1Visuals } from './data/civilLawPart1Visuals.js'

const visualByKey = new Map(civilLawPart1Visuals.map((item) => [item.key, item]))

const esc = (value = '') => String(value).replace(/[&<>"']/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[char]))

function currentKey(page) {
  const active = page.querySelector('.civil-nav-topic-button.active')
  if (!active) return null

  const point = active.closest('.civil-nav-point')
  const pointDetails = [...page.querySelectorAll('.civil-nav-point')]
  const pointIndex = pointDetails.indexOf(point)
  if (pointIndex < 0) return null

  const allPartPoints = [...page.querySelectorAll('.public-law-nav > details')]
    .flatMap((part) => [...part.querySelectorAll(':scope .civil-nav-point')])
  const pointIdIndex = allPartPoints.indexOf(point)
  if (pointIdIndex < 0) return null

  const pointOrder = [
    'p1s1', 'p1s2', 'p1s3', 'p1s4', 'p1s5', 'p1s6',
    'p2s1', 'p2s2', 'p2s3', 'p2s4', 'p2s5', 'p2s6',
    'p3s1', 'p3s2', 'p3s3', 'p3s4', 'p3s5', 'p3s6',
    'p4s1', 'p4s2', 'p4s3', 'p4s4', 'p4s5',
  ]
  const pointId = pointOrder[pointIdIndex]
  if (!pointId?.startsWith('p1')) return null

  const topic = active.querySelector('span:last-child')?.textContent?.trim()
  return topic ? `${pointId}|${topic}` : null
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
      <span>PART 1 · 52/52</span>
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

  const existing = page.querySelector('[data-civil-leaf-practice="true"]')
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
