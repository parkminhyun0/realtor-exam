import fs from 'node:fs'
import { taxLawParts } from '../src/data/taxLaw.js'
import { taxLawContent } from '../src/data/taxLawContent.js'
import { taxLawPart1Point01Leaves, taxLawPart1Point01LeafCount } from '../src/data/taxLawPart1Point01Leaves.js'

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
const fail = (message) => { throw new Error(message) }

const part1 = taxLawParts.find((part) => String(part.number) === '1')
const point = part1?.points.find((item) => item.id === 'p1s1')
if (!point) fail('세법 PART 1 POINT 01(p1s1)을 찾을 수 없습니다.')

const tocGroups = point.groups
const tocTopics = tocGroups.flatMap((group) => group.topics.map((topic) => `${group.title}|${topic}`))
const leafTopics = taxLawPart1Point01Leaves.flatMap((group) => group.topics.map((item) => `${group.group}|${item.topic}`))

if (tocGroups.length !== 6) fail(`POINT 01 중분류 수 불일치: ${tocGroups.length}/6`)
if (tocTopics.length !== 22 || taxLawPart1Point01LeafCount !== 22) {
  fail(`POINT 01 소분류 수 불일치: TOC ${tocTopics.length} / leaf ${taxLawPart1Point01LeafCount} / expected 22`)
}
if (new Set(leafTopics).size !== leafTopics.length) fail('POINT 01 leaf key 중복이 있습니다.')

const missing = tocTopics.filter((key) => !leafTopics.includes(key))
const extra = leafTopics.filter((key) => !tocTopics.includes(key))
if (missing.length || extra.length) {
  fail(`POINT 01 TOC ↔ leaf 불일치\nmissing: ${missing.join(', ')}\nextra: ${extra.join(', ')}`)
}

for (const group of taxLawPart1Point01Leaves) {
  if (!group.group?.trim() || !Array.isArray(group.topics) || !group.topics.length) fail('POINT 01 leaf group 구조 불완전')
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

const content = taxLawContent.p1s1
for (const field of ['headline', 'summary', 'legalBases', 'examCore', 'understanding', 'flow', 'sections', 'traps', 'memory', 'ox', 'quiz']) {
  const value = content?.[field]
  if (Array.isArray(value) ? !value.length : !String(value || '').trim()) fail(`기존 POINT 01 본문 기반 누락: ${field}`)
}

const renderer = read('src/tax-law-point01-leaf-layer.js')
for (const marker of [
  'data-tax-leaf-study="true"',
  "section.dataset.taxPoint = 'p1s1'",
  'PART 1 · POINT 01 · ${taxLawPart1Point01LeafCount}/${taxLawPart1Point01LeafCount}',
  'data-tax-leaf-topic=',
  '핵심',
  '시험 포인트',
  '함정',
  '암기',
]) {
  if (!renderer.includes(marker)) fail(`POINT 01 leaf renderer 누락: ${marker}`)
}

const navLeaves = read('src/tax-law-nav-leaves.js')
for (const marker of [
  "const POINT_ID = 'p1s1'",
  'data-tax-nav-leaf-list',
  'data-tax-leaf-target',
  '[data-tax-leaf-topic]',
  'scrollIntoView',
]) {
  if (!navLeaves.includes(marker)) fail(`POINT 01 소분류 nav 누락: ${marker}`)
}

const css = read('src/tax-law-point01-leaf-layer.css')
for (const marker of [
  '.tax-leaf-grid',
  'grid-template-columns: repeat(2, minmax(0, 1fr))',
  '#tax-nav-groups-p1s1[data-tax-leaf-tree="true"].is-expanded',
  '.tax-nav-leaf-list',
  '@media (max-width: 980px)',
  'grid-template-columns: 1fr',
]) {
  if (!css.includes(marker)) fail(`POINT 01 leaf CSS 누락: ${marker}`)
}

const main = read('src/main.jsx')
for (const requiredImport of [
  "import './tax-law-point01-leaf-layer.css'",
  "import './tax-law-point01-leaf-layer.js'",
  "import './tax-law-nav-leaves.js'",
]) {
  if (!main.includes(requiredImport)) fail(`main.jsx 세법 POINT 01 import 누락: ${requiredImport}`)
}

const contentSource = read('src/data/taxLawContent.js')
for (const currentMarker of [
  '2026-08-27 현행법령 대조',
  '국세기본법 2026.8.11 시행',
  '지방세법 2026.7.1 시행',
]) {
  if (!contentSource.includes(currentMarker)) fail(`세법 현행성 표지 누락: ${currentMarker}`)
}

console.log(`세법 PART 1 POINT 01 leaf support PASS: ${taxLawPart1Point01LeafCount}/22 소분류 · 6/6 중분류`)
console.log('TOC → 중분류 → 소분류 → leaf 학습카드 연결 PASS')
console.log('기존 LAW-FIRST/EXAM CORE/현행법령 기반을 유지한 채 leaf 복습층을 추가했습니다.')
