import { taxLawParts } from './data/taxLaw'
import './tax-law-nav-tree.css'

let scheduled = false
const pointExpansion = new Map()

function getGroupTargets(page) {
  const detailed = [...page.querySelectorAll('.tax-detail-section')]
  if (detailed.length) return detailed
  return [...page.querySelectorAll('.tax-outline-group')]
}

function activateGroup(tree, index) {
  tree.querySelectorAll('button').forEach((button, buttonIndex) => {
    button.classList.toggle('active', buttonIndex === index)
    button.setAttribute('aria-current', buttonIndex === index ? 'true' : 'false')
  })
}

function scrollToGroup(page, tree, index) {
  const targets = getGroupTargets(page)
  const target = targets[index]
  if (!target) return

  targets.forEach((item) => item.classList.add('tax-group-anchor'))
  activateGroup(tree, index)

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  target.scrollIntoView({
    behavior: reduceMotion ? 'auto' : 'smooth',
    block: 'start',
  })
}

function setTreeExpanded(mainButton, tree, expanded) {
  mainButton.setAttribute('aria-expanded', expanded ? 'true' : 'false')
  mainButton.classList.toggle('tax-nav-point__button--expanded', expanded)
  tree.classList.toggle('is-expanded', expanded)
  tree.setAttribute('aria-hidden', expanded ? 'false' : 'true')
  tree.querySelectorAll('button').forEach((button) => {
    button.tabIndex = expanded ? 0 : -1
  })
}

function createGroupTree(page, item, mainButton, point) {
  const tree = document.createElement('ol')
  tree.className = 'tax-nav-groups'
  tree.id = `tax-nav-groups-${point.id}`
  tree.setAttribute('aria-label', `POINT ${point.number} ${point.title} 중분류`)

  point.groups.forEach((group, groupIndex) => {
    const li = document.createElement('li')
    const button = document.createElement('button')
    const index = document.createElement('span')
    const label = document.createElement('span')

    button.type = 'button'
    button.title = `${group.title}로 이동`
    index.className = 'tax-nav-group__index'
    index.textContent = String(groupIndex + 1).padStart(2, '0')
    label.className = 'tax-nav-group__label'
    label.textContent = group.title

    button.append(index, label)
    button.addEventListener('click', (event) => {
      event.preventDefault()
      event.stopPropagation()

      const pointIsActive = mainButton.classList.contains('active')
      if (!pointIsActive) {
        pointExpansion.set(point.id, true)
        mainButton.click()
      }

      // 모바일 공통 목차가 본문을 갱신한 뒤 해당 중분류로 정확히 이동한다.
      window.setTimeout(() => {
        const currentTree = document.getElementById(tree.id) || tree
        scrollToGroup(page, currentTree, groupIndex)
      }, pointIsActive ? 80 : 180)
    })

    li.append(button)
    tree.append(li)
  })

  item.append(tree)
  return tree
}

function bindPointToggle(mainButton, point) {
  if (mainButton.dataset.taxTreeToggleBound === 'true') return
  mainButton.dataset.taxTreeToggleBound = 'true'

  mainButton.addEventListener('click', () => {
    const wasActive = mainButton.classList.contains('active')
    const currentExpanded = pointExpansion.has(point.id)
      ? pointExpansion.get(point.id)
      : wasActive

    // 다른 POINT를 누르면 선택과 동시에 펼치고, 현재 POINT를 다시 누르면 접고/펼친다.
    pointExpansion.set(point.id, wasActive ? !currentExpanded : true)
    window.setTimeout(scheduleApply, 0)
  })
}

function buildMiddleTree(page) {
  const nav = page.querySelector('.public-law-nav')
  if (!nav) return

  const partDetails = [...nav.querySelectorAll(':scope > details')]
  partDetails.forEach((detail, partIndex) => {
    const part = taxLawParts[partIndex]
    if (!part) return

    const pointItems = [...detail.querySelectorAll(':scope > ul > li')]
    pointItems.forEach((item, pointIndex) => {
      const point = part.points[pointIndex]
      const mainButton = item.querySelector(':scope > button')
      if (!point || !mainButton) return

      item.classList.add('tax-nav-point')
      mainButton.classList.add('tax-nav-point__button')
      mainButton.setAttribute('aria-controls', `tax-nav-groups-${point.id}`)
      bindPointToggle(mainButton, point)

      const isActive = mainButton.classList.contains('active')
      if (isActive && !pointExpansion.has(point.id)) pointExpansion.set(point.id, true)

      const tree = item.querySelector(':scope > .tax-nav-groups')
        || createGroupTree(page, item, mainButton, point)
      const expanded = pointExpansion.get(point.id) === true
      setTreeExpanded(mainButton, tree, expanded)
    })
  })
}

function applyTaxMiddleTree() {
  scheduled = false
  const page = document.querySelector('.tax-law-page')
  if (!page) return
  buildMiddleTree(page)
}

function scheduleApply() {
  if (scheduled) return
  scheduled = true
  window.requestAnimationFrame(applyTaxMiddleTree)
}

const observer = new MutationObserver(scheduleApply)
observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] })

document.addEventListener('DOMContentLoaded', scheduleApply)
window.addEventListener('hashchange', scheduleApply)
scheduleApply()
