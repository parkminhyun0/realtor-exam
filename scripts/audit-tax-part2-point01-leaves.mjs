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
if (tocTopics.length !== 61 || taxLawPart2Point01LeafCount !== 61) fail(`취득세 소분류 수 불일치: TOC ${tocTopics.length} / leaf ${taxLawPart2Point01LeafCount} / expected 61`)
if (new Set(leafTopics).size !== leafTopics.length) fail('취득세 leaf key 중복이 있습니다.')

const missing = tocTopics.filter((key) => !leafTopics.includes(key))
const extra = leafTopics.filter((key) => !tocTopics.includes(key))
if (missing.length || extra.length) fail(`취득세 TOC ↔ leaf 불일치\nmissing: ${missing.join(', ')}\nextra: ${extra.join(', ')}`)

for (const group of taxLawPart2Point01Leaves) {
  for (const item of group.topics) {
    for (const field of ['topic', 'core', 'exam', 'trap', 'memory']) {
      if (!String(item[field] || '').trim()) fail(`${group.group}|${item.topic}: ${field} 누락`)
    }
    if (!Array.isArray(item.basis) || !item.basis.length) fail(`${group.group}|${item.topic}: 근거 basis 누락`)
  }
}

const content = taxLawContent.p2s1
for (const field of ['headline', 'summary', 'legalBases', 'examCore', 'understanding', 'flow', 'sections', 'traps', 'memory', 'ox', 'quiz']) {
  const value = content?.[field]
  if (Array.isArray(value) ? !value.length : !String(value || '').trim()) fail(`기존 취득세 본문 기반 누락: ${field}`)
}

const renderer = read('src/tax-law-point04-leaf-layer.js')
for (const marker of [
  "section.dataset.taxPoint = 'p2s1'",
  'PART 2 · POINT 01 · ${taxLawPart2Point01LeafCount}/${taxLawPart2Point01LeafCount}',
  'EXAM AXIS',
  '취득세 6단계',
  '일반 60일 · 무상 3개월 · 상속 6개월',
  '2026.5.31까지 공포·개정된 규정',
  '2026.6.1 이후 개정분',
]) {
  if (!renderer.includes(marker)) fail(`취득세 leaf renderer 누락: ${marker}`)
}

const normalizer = read('src/tax-law-exam37-cutoff-normalizer.js')
for (const marker of ['2025.12.31 개정분까지 반영한', '2026.5.31까지 공포·개정된 기준을 반영한']) {
  if (!normalizer.includes(marker)) fail(`취득세 구 기준 문구 runtime 정규화 누락: ${marker}`)
}

const navLeaves = read('src/tax-law-nav-leaves.js')
for (const marker of ["const POINT04_ID = 'p2s1'", 'taxLawPart2Point01Leaves', 'button.dataset.taxPointTarget = pointId', 'scrollToLeaf(pointId, topic)']) {
  if (!navLeaves.includes(marker)) fail(`취득세 소분류 nav 누락/비POINT-aware: ${marker}`)
}

const main = read('src/main.jsx')
for (const requiredImport of ["import './tax-law-exam37-cutoff-normalizer.js'", "import './tax-law-point04-leaf-layer.js'", "import './tax-law-nav-leaves.js'"]) {
  if (!main.includes(requiredImport)) fail(`main.jsx 취득세 import 누락: ${requiredImport}`)
}

console.log(`세법 PART 2 POINT 01 취득세 leaf support PASS: ${taxLawPart2Point01LeafCount}/61 소분류 · 10/10 중분류`)
console.log('취득 여부 → 취득시기 → 과세표준 → 세율 → 중과·비과세 → 신고기한 6단계 연결 PASS')
console.log('제37회 프로젝트 기준: 2026.5.31까지 공포·개정분 적용 · 2026.6.1 이후 비교 전용')
