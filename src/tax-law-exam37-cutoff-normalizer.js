import { taxLawPart1Point01Leaves } from './data/taxLawPart1Point01Leaves.js'
import { taxLawPart1Point02Leaves } from './data/taxLawPart1Point02Leaves.js'
import { taxLawPart1Point03Leaves } from './data/taxLawPart1Point03Leaves.js'
import { taxLawPart2Point01Leaves } from './data/taxLawPart2Point01Leaves.js'
import { taxLawPart2Point02Leaves } from './data/taxLawPart2Point02Leaves.js'
import { taxLawPart2Point03Leaves } from './data/taxLawPart2Point03Leaves.js'
import { taxLawPart3Point01Leaves } from './data/taxLawPart3Point01Leaves.js'
import { taxLawPart3Point02Leaves } from './data/taxLawPart3Point02Leaves.js'
import { taxLawPart3Point03Leaves } from './data/taxLawPart3Point03Leaves.js'
import { taxLawContent } from './data/taxLawContent.js'

const pointLeafSets = [
  taxLawPart1Point01Leaves,
  taxLawPart1Point02Leaves,
  taxLawPart1Point03Leaves,
  taxLawPart2Point01Leaves,
  taxLawPart2Point02Leaves,
  taxLawPart2Point03Leaves,
  taxLawPart3Point01Leaves,
  taxLawPart3Point02Leaves,
  taxLawPart3Point03Leaves,
]

const replacements = [
  ['2025.12.31 개정분까지 반영한', '2026.5.31까지 공포·개정된 기준을 반영한'],
  ['2025년까지 개정된 규정', '2026.5.31까지 공포·개정된 규정'],
]

for (const groups of pointLeafSets) {
  for (const group of groups) {
    for (const item of group.topics) {
      for (const field of ['core', 'exam', 'trap', 'memory']) {
        let value = String(item[field] || '')
        for (const [before, after] of replacements) value = value.replaceAll(before, after)
        item[field] = value
      }
    }
  }
}

const examLawVersion = '제37회 시험 기준 · 2026.5.31까지 공포·개정분 적용 · 2026.6.1 이후 개정분 비교 전용'
const examSourceNote = '제37회 사이트 학습 기준: 2026.5.31까지 공포·개정된 법령을 시험 본문에 적용하고, 2026.6.1 이후 공포·개정분은 비교 전용으로 분리합니다. 법령 팝업도 동일한 2026.5.31 컷오프의 마지막 연혁법령을 조회합니다.'
for (const content of Object.values(taxLawContent)) {
  content.lawVersion = examLawVersion
  content.source = examSourceNote
}

const visibleLabels = new Map([
  ['REAL ESTATE TAX LAW · 2026', 'REAL ESTATE TAX LAW · 제37회 기준'],
  ['근거법령 · 현행 조문', '근거법령 · 제37회 기준 조문'],
  ['현행 조세 법령 바로보기', '제37회 시험 기준 조세 법령 바로보기'],
])

function normalizeVisibleTaxLabels(root = document) {
  const page = root.querySelector?.('.tax-law-page') || (root.matches?.('.tax-law-page') ? root : null)
  if (!page) return
  const walker = document.createTreeWalker(page, NodeFilter.SHOW_TEXT)
  const nodes = []
  while (walker.nextNode()) nodes.push(walker.currentNode)
  for (const node of nodes) {
    const raw = node.nodeValue || ''
    const trimmed = raw.trim()
    const replacement = visibleLabels.get(trimmed)
    if (!replacement) continue
    const leading = raw.match(/^\s*/)?.[0] || ''
    const trailing = raw.match(/\s*$/)?.[0] || ''
    node.nodeValue = `${leading}${replacement}${trailing}`
  }
}

let queued = false
function scheduleVisibleNormalization() {
  if (queued) return
  queued = true
  window.requestAnimationFrame(() => {
    queued = false
    normalizeVisibleTaxLabels(document)
  })
}

const observer = new MutationObserver(scheduleVisibleNormalization)
observer.observe(document.documentElement, { childList: true, subtree: true })
window.addEventListener('hashchange', scheduleVisibleNormalization)
window.setTimeout(scheduleVisibleNormalization, 0)
