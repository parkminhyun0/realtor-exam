import { taxLawPart1Point01Leaves } from './data/taxLawPart1Point01Leaves.js'

const POINT_ID = 'p1s1'
let queued = false

function scrollToLeaf(topic) {
  const page = document.querySelector('.tax-law-page')
  if (!page) return false
  const card = [...page.querySelectorAll('[data-tax-leaf-topic]')]
    .find((item) => item.dataset.taxLeafTopic === topic)
  if (!card) return false
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  card.focus({ preventScroll: true })
  card.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
  card.classList.add('is-tax-leaf-target')
  window.setTimeout(() => card.classList.remove('is-tax-leaf-target'), 1200)
  return true
}

function createLeafList(group, groupIndex) {
  const list = document.createElement('ul')
  list.className = 'tax-nav-leaf-list'
  list.dataset.taxNavLeafList = 'true'
  list.dataset.taxGroupIndex = String(groupIndex)

  group.topics.forEach((item) => {
    const li = document.createElement('li')
    const button = document.createElement('button')
    button.type = 'button'
    button.dataset.taxLeafTarget = item.topic
    button.setAttribute('aria-label', `${item.topic} 소분류로 이동`)
    button.innerHTML = `<span>·</span><strong>${item.topic}</strong>`
    li.append(button)
    list.append(li)
  })
  return list
}

function ensurePointActive(page) {
  const tree = page.querySelector(`#tax-nav-groups-${POINT_ID}`)
  const pointItem = tree?.closest('.tax-nav-point')
  const mainButton = pointItem?.querySelector(':scope > .tax-nav-point__button')
  if (!mainButton) return false
  if (!mainButton.classList.contains('active')) mainButton.click()
  if (mainButton.getAttribute('aria-expanded') !== 'true') mainButton.click()
  return true
}

function buildLeaves() {
  queued = false
  const page = document.querySelector('.tax-law-page')
  if (!page) return
  const tree = page.querySelector(`#tax-nav-groups-${POINT_ID}`)
  if (!tree) return
  tree.dataset.taxLeafTree = 'true'

  const groupItems = [...tree.querySelectorAll(':scope > li')]
  taxLawPart1Point01Leaves.forEach((group, groupIndex) => {
    const li = groupItems[groupIndex]
    if (!li || li.querySelector(':scope > [data-tax-nav-leaf-list="true"]')) return
    li.append(createLeafList(group, groupIndex))
  })
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
  const page = document.querySelector('.tax-law-page')
  if (!page) return

  ensurePointActive(page)
  const tryScroll = (attempt = 0) => {
    if (scrollToLeaf(topic) || attempt >= 5) return
    window.setTimeout(() => tryScroll(attempt + 1), 90)
  }
  window.setTimeout(() => tryScroll(), 40)
})

const observer = new MutationObserver(scheduleBuild)
observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'aria-expanded'] })
window.addEventListener('hashchange', scheduleBuild)
window.setTimeout(scheduleBuild, 0)
