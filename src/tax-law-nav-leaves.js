import { taxLawPart1Point01Leaves } from './data/taxLawPart1Point01Leaves.js'
import { taxLawPart1Point02Leaves } from './data/taxLawPart1Point02Leaves.js'
import { taxLawPart1Point03Leaves } from './data/taxLawPart1Point03Leaves.js'
import { taxLawPart2Point01Leaves } from './data/taxLawPart2Point01Leaves.js'

// POINT_ID 문자열은 POINT 01 audit의 하위호환 표지로 유지합니다.
const POINT_ID = 'p1s1'
const POINT02_ID = 'p1s2'
const POINT03_ID = 'p1s3'
const POINT04_ID = 'p2s1'
const pointLeafSets = [
  { pointId: POINT_ID, groups: taxLawPart1Point01Leaves },
  { pointId: POINT02_ID, groups: taxLawPart1Point02Leaves },
  { pointId: POINT03_ID, groups: taxLawPart1Point03Leaves },
  { pointId: POINT04_ID, groups: taxLawPart2Point01Leaves },
]
let queued = false

function scrollToLeaf(pointId, topic) {
  const page = document.querySelector('.tax-law-page')
  if (!page) return false
  const section = [...page.querySelectorAll('[data-tax-leaf-study="true"]')]
    .find((item) => item.dataset.taxPoint === pointId)
  const card = [...(section?.querySelectorAll('[data-tax-leaf-topic]') || [])]
    .find((item) => item.dataset.taxLeafTopic === topic)
  if (!card) return false
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  card.focus({ preventScroll: true })
  card.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
  card.classList.add('is-tax-leaf-target')
  window.setTimeout(() => card.classList.remove('is-tax-leaf-target'), 1200)
  return true
}

function createLeafList(group, groupIndex, pointId) {
  const list = document.createElement('ul')
  list.className = 'tax-nav-leaf-list'
  list.dataset.taxNavLeafList = 'true'
  list.dataset.taxGroupIndex = String(groupIndex)
  list.dataset.taxPoint = pointId

  group.topics.forEach((item) => {
    const li = document.createElement('li')
    const button = document.createElement('button')
    button.type = 'button'
    button.dataset.taxLeafTarget = item.topic
    button.dataset.taxPointTarget = pointId
    button.setAttribute('aria-label', `${item.topic} 소분류로 이동`)
    button.innerHTML = `<span>·</span><strong>${item.topic}</strong>`
    li.append(button)
    list.append(li)
  })
  return list
}

function ensurePointActive(page, pointId) {
  const tree = page.querySelector(`#tax-nav-groups-${pointId}`)
  const pointItem = tree?.closest('.tax-nav-point')
  const mainButton = pointItem?.querySelector(':scope > .tax-nav-point__button')
  if (!mainButton) return false

  if (!mainButton.classList.contains('active')) {
    mainButton.click()
    return true
  }
  if (mainButton.getAttribute('aria-expanded') !== 'true') mainButton.click()
  return true
}

function buildPointLeaves(page, pointId, groups) {
  const tree = page.querySelector(`#tax-nav-groups-${pointId}`)
  if (!tree) return
  tree.dataset.taxLeafTree = 'true'
  tree.dataset.taxLeafPoint = pointId

  const groupItems = [...tree.querySelectorAll(':scope > li')]
  groups.forEach((group, groupIndex) => {
    const li = groupItems[groupIndex]
    if (!li) return
    const existing = [...li.children].find((child) => (
      child.matches?.('[data-tax-nav-leaf-list="true"]') && child.dataset.taxPoint === pointId
    ))
    if (!existing) li.append(createLeafList(group, groupIndex, pointId))
  })
}

function buildLeaves() {
  queued = false
  const page = document.querySelector('.tax-law-page')
  if (!page) return
  pointLeafSets.forEach(({ pointId, groups }) => buildPointLeaves(page, pointId, groups))
}

function scheduleBuild() {
  if (queued) return
  queued = true
  window.requestAnimationFrame(buildLeaves)
}

document.addEventListener('click', (event) => {
  const button = event.target instanceof Element ? event.target.closest('[data-tax-leaf-target]') : null
  if (!button) return
  event.preventDefault()
  event.stopPropagation()
  const topic = button.dataset.taxLeafTarget
  const pointId = button.dataset.taxPointTarget
  const page = document.querySelector('.tax-law-page')
  if (!page || !pointId) return

  ensurePointActive(page, pointId)
  const tryScroll = (attempt = 0) => {
    if (scrollToLeaf(pointId, topic) || attempt >= 7) return
    window.setTimeout(() => tryScroll(attempt + 1), 90)
  }
  window.setTimeout(() => tryScroll(), 60)
})

const observer = new MutationObserver(scheduleBuild)
observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'aria-expanded'] })
window.addEventListener('hashchange', scheduleBuild)
window.setTimeout(scheduleBuild, 0)
