import fs from 'node:fs'
import { taxLawParts } from '../src/data/taxLaw.js'
import { taxLawContent } from '../src/data/taxLawContent.js'
import { taxLawPart2Point01Leaves, taxLawPart2Point01LeafCount } from '../src/data/taxLawPart2Point01Leaves.js'

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
const fail = (message) => { throw new Error(message) }

const part2 = taxLawParts.find((part) => String(part.number) === '2')
const point = part2?.points.find((item) => item.id === 'p2s1')
if (!point) fail('세법 PART 2 POINT 01(p2s1) 취득세를 찾을 수 없습니다.')

const tocGroups = point.groups
const tocTopics = tocGroups.flatMap((group) => group.topics.map((topic) => `${group.title}|${topic}`))
const leafTopics = taxLawPart2Point01Leaves.flatMap((group) => group.topics.map((item) => `${group.group}|${item.topic}`))

if (tocGroups.length !== 10) fail(`취득세 중분류 수 불일치: ${tocGroups.length}/10`)
if (tocTopics.length !== 61 || taxLawPart2Point01LeafCount !== 61) {
  fail(`취득세 소분류 수 불일치: TOC ${tocTopics.length} / leaf ${taxLawPart2Point01LeafCount} / expected 61`)
}
if (new Set(leafTopics).size !== leafTopics.length) fail('취득세 leaf key 중복이 있습니다.')

const missing = tocTopics.filter((key) => !leafTopics.includes(key))
const extra = leafTopics.filter((key) => !tocTopics.includes(key))
if (missing.length || extra.length) {
  fail(`취득세 TOC ↔ leaf 불일치\nmissing: ${missing.join(', ')}\nextra: ${extra.join(', ')}`)
}

for (const group of taxLawPart2Point01Leaves) {
  if (!group.group?.trim() || !Array.isArray(group.topics) || !group.topics.length) fail('취득세 leaf group 구조 불완전')
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

const content = taxLawContent.p2s1
for (const field of ['headline', 'summary', 'legalBases', 'examCore', 'understanding', 'flow', 'sections', 'traps', 'memory', 'ox', 'quiz']) {
  const value = content?.[field]
  if (Array.isArray(value) ? !value.length : !String(value || '').trim()) fail(`기존 취득세 본문 기반 누락: ${field}`)
}

const dataSource = read('src/data/taxLawPart2Point01Leaves.js')
for (const marker of [
  "group: '취득세 총설'",
  "group: '취득으로 보는 경우'",
  "group: '과세표준'",
  "group: '중과세'",
  "제10조의7",
  '2025.12.31 개정분까지 반영',
  '유상4·원시2.8·무상3.5',
  '주택=1~3% 기본구조',
  '일반=60일',
  '무상=달말+3개월',
  '상속=달말+6(외국 9)',
]) {
  if (!dataSource.includes(marker)) fail(`취득세 핵심 데이터 누락: ${marker}`)
}

const renderer = read('src/tax-law-point04-leaf-layer.js')
for (const marker of [
  'data-tax-leaf-study="true"',
  "section.dataset.taxPoint = 'p2s1'",
  'PART 2 · POINT 01 · ${taxLawPart2Point01LeafCount}/${taxLawPart2Point01LeafCount}',
  'data-tax-leaf-topic=',
  'EXAM AXIS',
  '취득세 6단계',
  '일반 60일 · 무상 3개월 · 상속 6개월',
  '2025년까지 개정된 규정',
]) {
  if (!renderer.includes(marker)) fail(`취득세 leaf renderer 누락: ${marker}`)
}
if (!renderer.includes("dataset.taxPoint !== 'p2s1'")) fail('취득세 법령 chip click handler POINT scope 누락')

const navLeaves = read('src/tax-law-nav-leaves.js')
for (const marker of [
  "const POINT04_ID = 'p2s1'",
  'taxLawPart2Point01Leaves',
  '{ pointId: POINT04_ID, groups: taxLawPart2Point01Leaves }',
  'button.dataset.taxPointTarget = pointId',
  'scrollToLeaf(pointId, topic)',
]) {
  if (!navLeaves.includes(marker)) fail(`취득세 소분류 nav 누락/비POINT-aware: ${marker}`)
}

const css = read('src/tax-law-point04-leaf-layer.css')
for (const marker of [
  '#tax-nav-groups-p2s1[data-tax-leaf-tree="true"].is-expanded',
  '.tax-acquisition-flow',
  '.tax-acquisition-deadlines',
  '@media (max-width: 700px)',
]) {
  if (!css.includes(marker)) fail(`취득세 시각화 CSS 누락: ${marker}`)
}

const main = read('src/main.jsx')
for (const requiredImport of [
  "import './tax-law-point04-leaf-layer.css'",
  "import './tax-law-point04-leaf-layer.js'",
  "import './tax-law-nav-leaves.js'",
]) {
  if (!main.includes(requiredImport)) fail(`main.jsx 취득세 import 누락: ${requiredImport}`)
}

console.log(`세법 PART 2 POINT 01 취득세 leaf support PASS: ${taxLawPart2Point01LeafCount}/61 소분류 · 10/10 중분류`)
console.log('취득 여부 → 취득시기 → 과세표준 → 세율 → 중과·비과세 → 신고기한 6단계 연결 PASS')
console.log('제37회 프로젝트 기준: 2025년까지 개정분 적용 · 2026 개정분은 비교 전용')
