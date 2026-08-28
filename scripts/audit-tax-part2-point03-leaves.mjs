import fs from 'node:fs'
import { taxLawParts } from '../src/data/taxLaw.js'
import { taxLawContent } from '../src/data/taxLawContent.js'
import { taxLawPart2Point03Leaves, taxLawPart2Point03LeafCount } from '../src/data/taxLawPart2Point03Leaves.js'

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
const fail = (message) => { throw new Error(message) }

const part2 = taxLawParts.find((part) => String(part.number) === '2')
const point = part2?.points.find((item) => item.id === 'p2s3')
if (!point) fail('세법 PART 2 POINT 03(p2s3) 재산세를 찾을 수 없습니다.')

const tocTopics = point.groups.flatMap((group) => group.topics.map((topic) => `${group.title}|${topic}`))
const leafTopics = taxLawPart2Point03Leaves.flatMap((group) => group.topics.map((item) => `${group.group}|${item.topic}`))
if (point.groups.length !== 8) fail(`재산세 중분류 수 불일치: ${point.groups.length}/8`)
if (tocTopics.length !== 34 || taxLawPart2Point03LeafCount !== 34) fail(`재산세 소분류 수 불일치: ${tocTopics.length}/${taxLawPart2Point03LeafCount}/34`)
if (new Set(leafTopics).size !== leafTopics.length) fail('재산세 leaf key 중복이 있습니다.')
if (tocTopics.some((key) => !leafTopics.includes(key)) || leafTopics.some((key) => !tocTopics.includes(key))) fail('재산세 TOC ↔ leaf 불일치')

for (const group of taxLawPart2Point03Leaves) {
  for (const item of group.topics) {
    for (const field of ['topic', 'core', 'exam', 'trap', 'memory']) if (!String(item[field] || '').trim()) fail(`${group.group}|${item.topic}: ${field} 누락`)
    if (!Array.isArray(item.basis) || !item.basis.length) fail(`${group.group}|${item.topic}: basis 누락`)
  }
}

const content = taxLawContent.p2s3
for (const field of ['headline', 'summary', 'legalBases', 'examCore', 'understanding', 'flow', 'sections', 'traps', 'memory', 'ox', 'quiz']) {
  const value = content?.[field]
  if (Array.isArray(value) ? !value.length : !String(value || '').trim()) fail(`기존 재산세 본문 기반 누락: ${field}`)
}

const renderer = read('src/tax-law-point06-leaf-layer.js')
for (const marker of [
  "section.dataset.taxPoint = 'p2s3'",
  'PART 2 · POINT 03 · ${taxLawPart2Point03LeafCount}/${taxLawPart2Point03LeafCount}',
  '재산세 6단계',
  '6월 1일 기준 · 건축물 7월 · 토지 9월 · 주택 7월+9월',
  '물납 1천만원 초과 · 분납 250만원 초과 · 소액 2천원 미만',
  '2026.5.31까지 공포·개정된 규정',
  '2026.6.1 이후 개정분',
]) if (!renderer.includes(marker)) fail(`재산세 renderer 누락: ${marker}`)

const nav = read('src/tax-law-nav-leaves.js')
for (const marker of ["const POINT06_ID = 'p2s3'", 'taxLawPart2Point03Leaves', 'scrollToLeaf(pointId, topic)']) if (!nav.includes(marker)) fail(`재산세 nav 누락: ${marker}`)

console.log(`세법 PART 2 POINT 03 재산세 leaf support PASS: ${taxLawPart2Point03LeafCount}/34 소분류 · 8/8 중분류`)
console.log('과세대상 → 토지 종·별·분 → 6월 1일 납세자 → 과표 → 세율 → 7·9월 납기 연결 PASS')
console.log('제37회 프로젝트 기준: 2026.5.31까지 공포·개정분 적용 · 2026.6.1 이후 비교 전용')
