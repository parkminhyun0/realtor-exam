import fs from 'node:fs'
import { taxLawParts } from '../src/data/taxLaw.js'
import { taxLawContent } from '../src/data/taxLawContent.js'
import { taxLawPart1Point02Leaves, taxLawPart1Point02LeafCount } from '../src/data/taxLawPart1Point02Leaves.js'

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
const fail = (message) => { throw new Error(message) }

const part1 = taxLawParts.find((part) => String(part.number) === '1')
const point = part1?.points.find((item) => item.id === 'p1s2')
if (!point) fail('세법 PART 1 POINT 02(p1s2)를 찾을 수 없습니다.')

const tocGroups = point.groups
const tocTopics = tocGroups.flatMap((group) => group.topics.map((topic) => `${group.title}|${topic}`))
const leafTopics = taxLawPart1Point02Leaves.flatMap((group) => group.topics.map((item) => `${group.group}|${item.topic}`))

if (tocGroups.length !== 5) fail(`POINT 02 중분류 수 불일치: ${tocGroups.length}/5`)
if (tocTopics.length !== 25 || taxLawPart1Point02LeafCount !== 25) {
  fail(`POINT 02 소분류 수 불일치: TOC ${tocTopics.length} / leaf ${taxLawPart1Point02LeafCount} / expected 25`)
}
if (new Set(leafTopics).size !== leafTopics.length) fail('POINT 02 leaf key 중복이 있습니다.')

const missing = tocTopics.filter((key) => !leafTopics.includes(key))
const extra = leafTopics.filter((key) => !tocTopics.includes(key))
if (missing.length || extra.length) {
  fail(`POINT 02 TOC ↔ leaf 불일치\nmissing: ${missing.join(', ')}\nextra: ${extra.join(', ')}`)
}

for (const group of taxLawPart1Point02Leaves) {
  if (!group.group?.trim() || !Array.isArray(group.topics) || !group.topics.length) fail('POINT 02 leaf group 구조 불완전')
  for (const item of group.topics) {
    for (const field of ['topic', 'core', 'exam', 'trap', 'memory']) {
      if (!String(item[field] || '').trim()) fail(`${group.group}|${item.topic}: ${field} 누락`)
    }
    if (!Array.isArray(item.basis) || !item.basis.length) fail(`${group.group}|${item.topic}: 근거 basis 누락`)
    for (const basis of item.basis) {
      if (!basis.lawName?.trim() || !basis.article?.trim() || !basis.label?.trim()) {
        fail(`${group.group}|${item.topic}: basis 구조 불완전`)
      }
    }
  }
}

const content = taxLawContent.p1s2
for (const field of ['headline', 'summary', 'legalBases', 'examCore', 'understanding', 'flow', 'sections', 'traps', 'memory', 'ox', 'quiz']) {
  const value = content?.[field]
  if (Array.isArray(value) ? !value.length : !String(value || '').trim()) fail(`기존 POINT 02 본문 기반 누락: ${field}`)
}

const dataSource = read('src/data/taxLawPart1Point02Leaves.js')
for (const marker of [
  "topic: '취득세 — 취득 시'",
  "topic: '재산세 — 매년 6월 1일'",
  "topic: '양도소득세 — 과세기간과 예정신고의 구별'",
  "article: '제26조의2'",
  "article: '제27조'",
  "article: '제39조'",
  "lawName: '지방세기본법', article: '제75조'",
  '5억원 이상 국세는 10년',
  '양도일이 속하는 달의 말일',
]) {
  if (!dataSource.includes(marker)) fail(`POINT 02 핵심 법령·시간기준 데이터 누락: ${marker}`)
}

const renderer = read('src/tax-law-point02-leaf-layer.js')
for (const marker of [
  'data-tax-leaf-study="true"',
  "section.dataset.taxPoint = 'p1s2'",
  'PART 1 · POINT 02 · ${taxLawPart1Point02LeafCount}/${taxLawPart1Point02LeafCount}',
  'data-tax-leaf-topic=',
  'EXAM AXIS',
  '성립시기',
  '신고기한·납기·과세기간',
]) {
  if (!renderer.includes(marker)) fail(`POINT 02 leaf renderer 누락: ${marker}`)
}

const point01Renderer = read('src/tax-law-point01-leaf-layer.js')
for (const [source, pointId] of [[point01Renderer, 'p1s1'], [renderer, 'p1s2']]) {
  if (!source.includes(`[data-tax-leaf-study="true"][data-tax-point="${pointId}"]`)) {
    fail(`${pointId}: leaf renderer가 자기 POINT만 제거·생성하도록 scope되지 않았습니다.`)
  }
  if (!source.includes(`dataset.taxPoint !== '${pointId}'`)) {
    fail(`${pointId}: 법령 chip click handler가 자기 POINT로 scope되지 않았습니다.`)
  }
}

const navLeaves = read('src/tax-law-nav-leaves.js')
for (const marker of [
  "const POINT_ID = 'p1s1'",
  "const POINT02_ID = 'p1s2'",
  'taxLawPart1Point02Leaves',
  'button.dataset.taxPointTarget = pointId',
  "page.querySelectorAll('[data-tax-leaf-study=\"true\"]')",
  'item.dataset.taxPoint === pointId',
  'scrollToLeaf(pointId, topic)',
  'scrollIntoView',
]) {
  if (!navLeaves.includes(marker)) fail(`POINT 01~02 소분류 nav 누락/비POINT-aware: ${marker}`)
}

const css = read('src/tax-law-point01-leaf-layer.css')
for (const marker of [
  '#tax-nav-groups-p1s1[data-tax-leaf-tree="true"].is-expanded',
  '#tax-nav-groups-p1s2[data-tax-leaf-tree="true"].is-expanded',
  '.tax-leaf-exam-anchor',
  '.tax-nav-leaf-list',
  '@media (max-width: 980px)',
  'grid-template-columns: 1fr',
]) {
  if (!css.includes(marker)) fail(`POINT 02 leaf CSS 누락: ${marker}`)
}

const main = read('src/main.jsx')
for (const requiredImport of [
  "import './tax-law-point01-leaf-layer.js'",
  "import './tax-law-point02-leaf-layer.js'",
  "import './tax-law-nav-leaves.js'",
]) {
  if (!main.includes(requiredImport)) fail(`main.jsx 세법 leaf import 누락: ${requiredImport}`)
}

const contentSource = read('src/data/taxLawContent.js')
for (const currentMarker of [
  '2026-08-27 현행법령 대조',
  '국세기본법 2026.8.11 시행',
  '지방세기본법 2026.2.5 시행',
  '지방세법 2026.7.1 시행',
]) {
  if (!contentSource.includes(currentMarker)) fail(`세법 현행성 표지 누락: ${currentMarker}`)
}

console.log(`세법 PART 1 POINT 02 leaf support PASS: ${taxLawPart1Point02LeafCount}/25 소분류 · 5/5 중분류`)
console.log('성립 → 확정 → 소멸 → 확장 + 부동산 세목별 시간기준 연결 PASS')
console.log('POINT 01~02 nav는 POINT-aware leaf 이동으로 격리되어 중복 topic 오이동을 차단합니다.')
