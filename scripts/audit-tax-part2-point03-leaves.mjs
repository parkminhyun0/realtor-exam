import fs from 'node:fs'
import { taxLawParts } from '../src/data/taxLaw.js'
import { taxLawContent } from '../src/data/taxLawContent.js'
import { taxLawPart2Point03Leaves, taxLawPart2Point03LeafCount } from '../src/data/taxLawPart2Point03Leaves.js'

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
const fail = (message) => { throw new Error(message) }

const part2 = taxLawParts.find((part) => String(part.number) === '2')
const point = part2?.points.find((item) => item.id === 'p2s3')
if (!point) fail('세법 PART 2 POINT 03(p2s3) 재산세를 찾을 수 없습니다.')

const tocGroups = point.groups
const tocTopics = tocGroups.flatMap((group) => group.topics.map((topic) => `${group.title}|${topic}`))
const leafTopics = taxLawPart2Point03Leaves.flatMap((group) => group.topics.map((item) => `${group.group}|${item.topic}`))

if (tocGroups.length !== 8) fail(`재산세 중분류 수 불일치: ${tocGroups.length}/8`)
if (tocTopics.length !== 34 || taxLawPart2Point03LeafCount !== 34) {
  fail(`재산세 소분류 수 불일치: TOC ${tocTopics.length} / leaf ${taxLawPart2Point03LeafCount} / expected 34`)
}
if (new Set(leafTopics).size !== leafTopics.length) fail('재산세 leaf key 중복이 있습니다.')

const missing = tocTopics.filter((key) => !leafTopics.includes(key))
const extra = leafTopics.filter((key) => !tocTopics.includes(key))
if (missing.length || extra.length) {
  fail(`재산세 TOC ↔ leaf 불일치\nmissing: ${missing.join(', ')}\nextra: ${extra.join(', ')}`)
}

for (const group of taxLawPart2Point03Leaves) {
  if (!group.group?.trim() || !Array.isArray(group.topics) || !group.topics.length) fail('재산세 leaf group 구조 불완전')
  for (const item of group.topics) {
    for (const field of ['topic', 'core', 'exam', 'trap', 'memory']) {
      if (!String(item[field] || '').trim()) fail(`${group.group}|${item.topic}: ${field} 누락`)
    }
    if (!Array.isArray(item.basis) || !item.basis.length) fail(`${group.group}|${item.topic}: 근거 basis 누락`)
    for (const basis of item.basis) {
      if (!basis.lawName?.trim() || !basis.article?.trim() || !basis.label?.trim()) fail(`${group.group}|${item.topic}: basis 구조 불완전`)
    }
  }
}

const content = taxLawContent.p2s3
for (const field of ['headline', 'summary', 'legalBases', 'examCore', 'understanding', 'flow', 'sections', 'traps', 'memory', 'ox', 'quiz']) {
  const value = content?.[field]
  if (Array.isArray(value) ? !value.length : !String(value || '').trim()) fail(`기존 재산세 본문 기반 누락: ${field}`)
}

const dataSource = read('src/data/taxLawPart2Point03Leaves.js')
for (const marker of [
  "group: '재산세 총설'",
  "group: '토지 과세대상의 구분'",
  "group: '과세기준일'",
  "group: '부과·징수'",
  '재산세=6월 1일',
  '종·별·분',
  '시가표준액×공정시장가액비율',
  '토지=9.16~9.30',
  '건축물=7.16~7.31',
  '물납=1천만원 초과 + 관할 부동산',
  '분납=250만원 초과·3개월',
  '소액면제=고지서 1장당 2천원 미만',
]) {
  if (!dataSource.includes(marker)) fail(`재산세 핵심 데이터 누락: ${marker}`)
}

const renderer = read('src/tax-law-point06-leaf-layer.js')
for (const marker of [
  'data-tax-leaf-study="true"',
  "section.dataset.taxPoint = 'p2s3'",
  'PART 2 · POINT 03 · ${taxLawPart2Point03LeafCount}/${taxLawPart2Point03LeafCount}',
  'EXAM AXIS',
  '재산세 6단계',
  '6월 1일 기준 · 건축물 7월 · 토지 9월 · 주택 7월+9월',
  '물납 1천만원 초과 · 분납 250만원 초과 · 소액 2천원 미만',
  '2025년까지 개정된 규정',
]) {
  if (!renderer.includes(marker)) fail(`재산세 leaf renderer 누락: ${marker}`)
}
if (!renderer.includes("dataset.taxPoint !== 'p2s3'")) fail('재산세 법령 chip click handler POINT scope 누락')

const navLeaves = read('src/tax-law-nav-leaves.js')
for (const marker of [
  "const POINT06_ID = 'p2s3'",
  'taxLawPart2Point03Leaves',
  '{ pointId: POINT06_ID, groups: taxLawPart2Point03Leaves }',
  'button.dataset.taxPointTarget = pointId',
  'scrollToLeaf(pointId, topic)',
]) {
  if (!navLeaves.includes(marker)) fail(`재산세 소분류 nav 누락/비POINT-aware: ${marker}`)
}

const css = read('src/tax-law-point06-leaf-layer.css')
for (const marker of [
  '#tax-nav-groups-p2s3[data-tax-leaf-tree="true"].is-expanded',
  '.tax-property-flow',
  '.tax-property-calendar',
  '.tax-property-collection',
  '@media (max-width: 820px)',
]) {
  if (!css.includes(marker)) fail(`재산세 시각화 CSS 누락: ${marker}`)
}

const main = read('src/main.jsx')
for (const requiredImport of [
  "import './tax-law-point06-leaf-layer.css'",
  "import './tax-law-point06-leaf-layer.js'",
  "import './tax-law-nav-leaves.js'",
]) {
  if (!main.includes(requiredImport)) fail(`main.jsx 재산세 import 누락: ${requiredImport}`)
}

console.log(`세법 PART 2 POINT 03 재산세 leaf support PASS: ${taxLawPart2Point03LeafCount}/34 소분류 · 8/8 중분류`)
console.log('과세대상 → 토지 종·별·분 → 6월 1일 납세자 → 과표 → 세율 → 7·9월 납기 연결 PASS')
console.log('제37회 프로젝트 기준: 2025년까지 개정분 적용 · 2026 개정분은 비교 전용')
