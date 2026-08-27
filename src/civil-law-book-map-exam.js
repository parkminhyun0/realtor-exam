import { civilLawParts } from './data/civilLawToc3Level.js'
import {
  civilLawConceptHubs,
  civilLawExplicitLinks,
  civilLawLegacyGenericDiagrams,
} from './data/civilLawLearningGraph.js'

const flatNodes = civilLawParts.flatMap((part, partIndex) => (
  part.points.flatMap((point, pointIndex) => (
    point.topics.map((topic, topicIndex) => ({
      key: `${point.id}|${topic}`,
      partId: part.id,
      partNumber: String(part.number),
      partTitle: part.title,
      partIndex,
      pointId: point.id,
      pointNumber: String(point.number),
      pointTitle: point.title,
      pointIndex,
      topic,
      topicIndex,
    }))
  ))
))

flatNodes.forEach((node, globalIndex) => { node.globalIndex = globalIndex })

const nodeByKey = new Map(flatNodes.map((node) => [node.key, node]))
const hubsByTarget = new Map()

civilLawConceptHubs.forEach((hub) => {
  hub.targets.forEach((key) => {
    if (!hubsByTarget.has(key)) hubsByTarget.set(key, [])
    hubsByTarget.get(key).push(hub)
  })
})

const esc = (value = '') => String(value).replace(/[&<>"']/g, (ch) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[ch]))

function clean(value = '') {
  return String(value).replace(/\s+/g, ' ').trim()
}

function reverseType(type) {
  if (type === '후속') return '선행'
  if (type === '선행') return '후속'
  return type
}

function currentNode(page) {
  const buttons = [...page.querySelectorAll('.civil-nav-topic-button')]
  const active = buttons.find((button) => button.classList.contains('active'))
  if (!active) return null
  const index = buttons.indexOf(active)
  return flatNodes[index] || null
}

function findLegacyTarget(partLabel, pointLabel, topic) {
  const partNumber = String(partLabel || '').match(/\d+/)?.[0]
  const pointNumber = String(pointLabel || '').match(/\d+/)?.[0]
  if (!partNumber || !pointNumber || !topic) return null

  const part = civilLawParts.find((item) => String(Number(item.number)) === String(Number(partNumber)))
  const point = part?.points.find((item) => String(Number(item.number)) === String(Number(pointNumber)))
  if (!point) return null
  const topicIndex = point.topics.findIndex((item) => item === topic)
  if (topicIndex < 0) return null
  return nodeByKey.get(`${point.id}|${topic}`) || null
}

function collectLegacyRelated(page) {
  return [...page.querySelectorAll('.civil-related-topic-button')].map((button) => {
    const target = findLegacyTarget(
      button.dataset.targetPart,
      button.dataset.targetPoint,
      button.dataset.targetTopic,
    )
    if (!target) return null
    return {
      target,
      type: '사례연결',
      label: clean(button.querySelector('strong')?.textContent) || '연관 쟁점',
      reason: clean(button.querySelector('p')?.textContent),
      source: 'legacy-related',
    }
  }).filter(Boolean)
}

function relationStatus(current, target) {
  if (target.globalIndex < current.globalIndex) return '선행 복습'
  if (target.globalIndex > current.globalIndex) return '후속 학습'
  return '현재 항목'
}

function addConnection(list, seen, connection) {
  if (!connection?.target || connection.target.key === connection.currentKey || seen.has(connection.target.key)) return
  seen.add(connection.target.key)
  list.push(connection)
}

function buildConnections(page, current) {
  const list = []
  const seen = new Set()

  const previous = flatNodes[current.globalIndex - 1]
  const next = flatNodes[current.globalIndex + 1]

  if (previous) addConnection(list, seen, {
    currentKey: current.key,
    target: previous,
    type: '선행',
    label: '책 순서 · 바로 앞',
    reason: '교재의 기존 학습 순서를 유지한 채 바로 앞 세부항목을 복습합니다.',
    source: 'book',
  })

  if (next) addConnection(list, seen, {
    currentKey: current.key,
    target: next,
    type: '후속',
    label: '책 순서 · 바로 다음',
    reason: '교재의 기존 학습 순서를 그대로 이어서 다음 세부항목으로 이동합니다.',
    source: 'book',
  })

  civilLawExplicitLinks.forEach((link) => {
    if (link.from === current.key) {
      addConnection(list, seen, {
        currentKey: current.key,
        target: nodeByKey.get(link.to),
        type: link.type,
        label: link.label,
        reason: link.reason,
        source: 'explicit',
      })
    } else if (link.to === current.key) {
      addConnection(list, seen, {
        currentKey: current.key,
        target: nodeByKey.get(link.from),
        type: reverseType(link.type),
        label: link.label,
        reason: link.reason,
        source: 'explicit',
      })
    }
  })

  collectLegacyRelated(page).forEach((connection) => addConnection(list, seen, {
    ...connection,
    currentKey: current.key,
  }))

  const hubs = hubsByTarget.get(current.key) || []
  hubs.forEach((hub) => {
    const candidates = hub.targets
      .map((key) => nodeByKey.get(key))
      .filter(Boolean)
      .filter((target) => target.key !== current.key)
      .sort((a, b) => {
        const aCross = a.partId === current.partId ? 1 : 0
        const bCross = b.partId === current.partId ? 1 : 0
        return aCross - bCross || Math.abs(a.globalIndex - current.globalIndex) - Math.abs(b.globalIndex - current.globalIndex)
      })
      .slice(0, 3)

    candidates.forEach((target) => addConnection(list, seen, {
      currentKey: current.key,
      target,
      type: hub.role === '비교개념' ? '비교' : hub.role === '특별법연결' ? '특별법' : '사례연결',
      label: hub.label,
      reason: hub.memory,
      source: `hub:${hub.id}`,
    }))
  })

  return list.slice(0, 9)
}

function extractExamPoint(page, current) {
  const panels = [...page.querySelectorAll('[data-civil-law-first="true"]')]
  const panel = panels.find((item) => clean(item.querySelector('h3')?.textContent) === current.topic) || panels[0]
  const core = clean(panel?.querySelector('.civil-law-first__head p')?.textContent)
  const checks = [...(panel?.querySelectorAll('.civil-law-first__checks li') || [])]
    .map((item) => clean(item.textContent))
    .filter(Boolean)
    .slice(0, 3)
  const grade = page.querySelector('[data-civil-exam-priority="true"]')?.dataset.grade || 'B'
  const hubs = hubsByTarget.get(current.key) || []
  const keywords = [current.topic, ...hubs.flatMap((hub) => hub.keywords)]
    .filter((value, index, array) => value && array.indexOf(value) === index)
    .slice(0, 9)

  return {
    core: core || `${current.topic}의 정의·요건·효과를 LAW-FIRST 본문과 연결해 정리합니다.`,
    checks,
    grade,
    keywords,
    hubs,
  }
}

function connectionCard(current, item) {
  const target = item.target
  return `<button type="button" class="civil-learning-node" data-civil-learning-target="${esc(target.key)}" data-relation="${esc(item.type)}">
    <span class="civil-learning-node__status">${esc(relationStatus(current, target))}</span>
    <strong>${esc(target.topic)}</strong>
    <small>PART ${esc(target.partNumber)} · POINT ${esc(target.pointNumber)} ${esc(target.pointTitle)}</small>
    <em>${esc(item.type)} · ${esc(item.label)}</em>
    <p>${esc(item.reason)}</p>
  </button>`
}

function renderLocalMap(current, connections) {
  const before = connections.filter((item) => item.target.globalIndex < current.globalIndex).slice(0, 3)
  const after = connections.filter((item) => item.target.globalIndex > current.globalIndex).slice(0, 3)
  const cross = connections.filter((item) => item.target.globalIndex === current.globalIndex || (item.target.globalIndex < current.globalIndex ? !before.includes(item) : !after.includes(item))).slice(0, 3)

  const renderGroup = (label, items, className) => `<div class="civil-learning-map__wing ${className}"><span>${label}</span>${items.length ? items.map((item) => connectionCard(current, item)).join('') : '<i>연결 항목 없음</i>'}</div>`

  return `<section class="civil-learning-map" aria-label="현재 세부항목 중심 민법 마인드맵">
    <header><div><small>MAP · LOCAL MIND MAP</small><h3>현재 항목 중심 연결지도</h3></div><p>책의 순서는 유지하고, 앞에서 배운 개념·뒤에서 다시 만날 개념·다른 PART의 연결지점을 동시에 확인합니다.</p></header>
    <div class="civil-learning-map__canvas">
      ${renderGroup('선행 · 복습', before, 'is-before')}
      <div class="civil-learning-map__center"><small>현재 공부 위치</small><strong>${esc(current.topic)}</strong><span>PART ${esc(current.partNumber)} · POINT ${esc(current.pointNumber)} ${esc(current.pointTitle)}</span></div>
      ${renderGroup('후속 · 확장', after, 'is-after')}
    </div>
    ${cross.length ? `<div class="civil-learning-map__cross"><span>횡단 연결</span><div>${cross.map((item) => connectionCard(current, item)).join('')}</div></div>` : ''}
  </section>`
}

function renderExamPoint(current, exam) {
  const gradeText = exam.grade === 'A' ? '최우선' : exam.grade === 'C' ? '기초 연결' : '중요'
  return `<section class="civil-learning-exam-card" aria-label="${esc(current.topic)} 출제포인트 카드">
    <header><div><small>EXAM · 출제포인트 카드</small><h3>${esc(current.topic)}</h3></div><span>${esc(exam.grade)} · ${gradeText}</span></header>
    <p class="civil-learning-exam-card__core">${esc(exam.core)}</p>
    <div class="civil-learning-keywords" aria-label="암기 키워드">${exam.keywords.map((keyword) => `<span>${esc(keyword)}</span>`).join('')}</div>
    ${exam.checks.length ? `<div class="civil-learning-exam-card__checks"><strong>반드시 체크</strong><ul>${exam.checks.map((item) => `<li>${esc(item)}</li>`).join('')}</ul></div>` : ''}
    ${exam.hubs.length ? `<div class="civil-learning-exam-card__hubs"><strong>Concept Hub</strong>${exam.hubs.map((hub) => `<span>${esc(hub.label)}</span>`).join('')}</div>` : ''}
    <p class="civil-learning-exam-card__note">A/B/C는 공식 출제빈도 통계가 아니라 현재 사이트의 편집 학습 우선순위입니다. 핵심 문언은 위 LAW-FIRST 조문과 판례에서 다시 확인합니다.</p>
  </section>`
}

function renderMasterMap(current) {
  return `<details class="civil-learning-master">
    <summary><span>전체 연결지도</span><strong>민법 BOOK × MIND MAP 펼치기</strong><small>책 목차는 그대로 · 연결망만 추가</small></summary>
    <div class="civil-learning-master__body">
      <div class="civil-learning-master__parts">
        ${civilLawParts.map((part) => `<section class="${part.id === current.partId ? 'is-current' : ''}"><small>PART ${esc(part.number)}</small><strong>${esc(part.title)}</strong><span>${part.points.map((point) => esc(point.title)).join(' → ')}</span></section>`).join('')}
      </div>
      <div class="civil-learning-master__hubs">
        ${civilLawConceptHubs.map((hub) => `<details><summary><strong>${esc(hub.label)}</strong><span>${esc(hub.role)}</span></summary><p>${esc(hub.memory)}</p><div class="civil-learning-keywords">${hub.keywords.map((keyword) => `<span>${esc(keyword)}</span>`).join('')}</div><div class="civil-learning-master__targets">${hub.targets.map((key) => nodeByKey.get(key)).filter(Boolean).map((node) => `<button type="button" data-civil-learning-target="${esc(node.key)}"><small>PART ${esc(node.partNumber)}</small>${esc(node.topic)}</button>`).join('')}</div></details>`).join('')}
      </div>
    </div>
  </details>`
}

function renderLayer(page, current) {
  const connections = buildConnections(page, current)
  const exam = extractExamPoint(page, current)
  const legacyCount = page.querySelectorAll('.civil-related-topic-button').length
  const fingerprint = `${current.key}|${legacyCount}|${exam.grade}|${exam.checks.length}`
  const existing = page.querySelector('[data-civil-book-map-exam="true"]')
  if (existing?.dataset.fingerprint === fingerprint) return

  existing?.remove()
  const layer = document.createElement('section')
  layer.className = 'civil-learning-layer'
  layer.dataset.civilBookMapExam = 'true'
  layer.dataset.key = current.key
  layer.dataset.fingerprint = fingerprint
  layer.innerHTML = `<div class="civil-learning-book-path">
      <span>BOOK · 교재 순서 고정</span>
      <strong>PART ${esc(current.partNumber)} ${esc(current.partTitle)}</strong><i>›</i><strong>POINT ${esc(current.pointNumber)} ${esc(current.pointTitle)}</strong><i>›</i><b>${esc(current.topic)}</b>
    </div>
    ${renderMasterMap(current)}
    ${renderLocalMap(current, connections)}
    ${renderExamPoint(current, exam)}`

  const heading = page.querySelector('.public-law-content .study-section-heading')
  if (heading) heading.insertAdjacentElement('afterend', layer)

  page.querySelectorAll('.civil-related-topics, .civil-exam-priority-banner').forEach((element) => {
    element.dataset.learningSuperseded = 'true'
  })
}

function suppressGenericLegacyDiagrams(page) {
  page.querySelectorAll('.civil-law-first__diagram img').forEach((image) => {
    const src = image.getAttribute('src') || ''
    if (!civilLawLegacyGenericDiagrams.some((name) => src.includes(name))) return
    const figure = image.closest('.civil-law-first__diagram')
    if (figure && !figure.dataset.learningSuperseded) figure.dataset.learningSuperseded = 'generic-diagram'
  })
}

function navigateToKey(page, key) {
  const target = nodeByKey.get(key)
  if (!target) return
  const buttons = [...page.querySelectorAll('.civil-nav-topic-button')]
  const button = buttons[target.globalIndex]
  if (!button) return
  button.click()
  window.setTimeout(() => {
    const content = document.querySelector('.civil-law-page .public-law-content')
    if (!content) return
    const headerHeight = document.querySelector('.site-header')?.getBoundingClientRect().height || 0
    const top = window.scrollY + content.getBoundingClientRect().top - headerHeight - 10
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: Math.max(0, top), behavior: reduce ? 'auto' : 'smooth' })
  }, 0)
}

let scheduled = false
function sync() {
  scheduled = false
  const page = document.querySelector('.civil-law-page')
  if (!page) return
  const current = currentNode(page)
  if (!current) return
  suppressGenericLegacyDiagrams(page)
  renderLayer(page, current)
}

function scheduleSync() {
  if (scheduled) return
  scheduled = true
  window.requestAnimationFrame(sync)
}

document.addEventListener('click', (event) => {
  const button = event.target instanceof Element ? event.target.closest('[data-civil-learning-target]') : null
  if (!button) return
  const page = document.querySelector('.civil-law-page')
  if (!page) return
  event.preventDefault()
  navigateToKey(page, button.dataset.civilLearningTarget)
})

const observer = new MutationObserver(scheduleSync)
observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'open'] })
window.addEventListener('hashchange', scheduleSync)
window.setTimeout(scheduleSync, 0)
