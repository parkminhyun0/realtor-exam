import fs from 'node:fs'
import { taxLawParts } from '../src/data/taxLaw.js'
import { taxLawContent } from '../src/data/taxLawContent.js'
import { taxLawPart2Point02Leaves, taxLawPart2Point02LeafCount } from '../src/data/taxLawPart2Point02Leaves.js'

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
const fail = (message) => { throw new Error(message) }

const part2 = taxLawParts.find((part) => String(part.number) === '2')
const point = part2?.points.find((item) => item.id === 'p2s2')
if (!point) fail('세법 PART 2 POINT 02(p2s2) 등록면허세를 찾을 수 없습니다.')

const tocTopics = point.groups.flatMap((group) => group.topics.map((topic) => `${group.title}|${topic}`))
const leafTopics = taxLawPart2Point02Leaves.flatMap((group) => group.topics.map((item) => `${group.group}|${item.topic}`))
if (point.groups.length !== 6) fail(`등록면허세 중분류 수 불일치: ${point.groups.length}/6`)
if (tocTopics.length !== 24 || taxLawPart2Point02LeafCount !== 24) fail(`등록면허세 소분류 수 불일치: ${tocTopics.length}/${taxLawPart2Point02LeafCount}/24`)
if (new Set(leafTopics).size !== leafTopics.length) fail('등록면허세 leaf key 중복이 있습니다.')
if (tocTopics.some((key) => !leafTopics.includes(key)) || leafTopics.some((key) => !tocTopics.includes(key))) fail('등록면허세 TOC ↔ leaf 불일치')

for (const group of taxLawPart2Point02Leaves) {
  for (const item of group.topics) {
    for (const field of ['topic', 'core', 'exam', 'trap', 'memory']) if (!String(item[field] || '').trim()) fail(`${group.group}|${item.topic}: ${field} 누락`)
    if (!Array.isArray(item.basis) || !item.basis.length) fail(`${group.group}|${item.topic}: basis 누락`)
  }
}

const content = taxLawContent.p2s2
for (const field of ['headline', 'summary', 'legalBases', 'examCore', 'understanding', 'flow', 'sections', 'traps', 'memory', 'ox', 'quiz']) {
  const value = content?.[field]
  if (Array.isArray(value) ? !value.length : !String(value || '').trim()) fail(`기존 등록면허세 본문 기반 누락: ${field}`)
}

const renderer = read('src/tax-law-point05-leaf-layer.js')
for (const marker of [
  "section.dataset.taxPoint = 'p2s2'",
  'PART 2 · POINT 02 · ${taxLawPart2Point02LeafCount}/${taxLawPart2Point02LeafCount}',
  '등록분 6단계',
  '보존 0.8 · 유상 2.0 · 무상 1.5 · 상속 0.8 · 제한물권 0.2',
  '2026.5.31까지 공포·개정된 규정',
  '2026.6.1 이후 개정분',
]) if (!renderer.includes(marker)) fail(`등록면허세 renderer 누락: ${marker}`)

const nav = read('src/tax-law-nav-leaves.js')
for (const marker of ["const POINT05_ID = 'p2s2'", 'taxLawPart2Point02Leaves', 'scrollToLeaf(pointId, topic)']) if (!nav.includes(marker)) fail(`등록면허세 nav 누락: ${marker}`)

console.log(`세법 PART 2 POINT 02 등록면허세 leaf support PASS: ${taxLawPart2Point02LeafCount}/24 소분류 · 6/6 중분류`)
console.log('등록분 판정 → 납세의무·납세지 → 과세표준 → 세율 → 중과·비과세 → 등록 전 신고납부 6단계 연결 PASS')
console.log('제37회 프로젝트 기준: 2026.5.31까지 공포·개정분 적용 · 2026.6.1 이후 비교 전용')
