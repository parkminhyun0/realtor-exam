import { taxLawParts } from './data/taxLaw'
import './tax-law-nav-tree.css'

let scheduled = false

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

      const existingTree = item.querySelector(':scope > .tax-nav-groups')
      const isActive = mainButton.classList.contains('active')

      if (!isActive) {
        existingTree?.remove()
        return
      }

      if (existingTree) return

      const tree = document.createElement('ol')
      tree.className = 'tax-nav-groups'
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

          // 모바일 공통 목차가 먼저 본문 상단으로 이동한 뒤 해당 중분류로 정확히 이동한다.
          window.setTimeout(() => scrollToGroup(page, tree, groupIndex), 140)
        })

        li.append(button)
        tree.append(li)
      })

      item.append(tree)
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
