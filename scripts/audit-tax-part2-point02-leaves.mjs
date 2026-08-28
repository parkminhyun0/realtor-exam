import fs from 'node:fs'
import { taxLawParts } from '../src/data/taxLaw.js'
import { taxLawContent } from '../src/data/taxLawContent.js'
import { taxLawPart2Point02Leaves, taxLawPart2Point02LeafCount } from '../src/data/taxLawPart2Point02Leaves.js'

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
const fail = (message) => { throw new Error(message) }

const part2 = taxLawParts.find((part) => String(part.number) === '2')
const point = part2?.points.find((item) => item.id === 'p2s2')
if (!point) fail('세법 PART 2 POINT 02(p2s2) 등록면허세를 찾을 수 없습니다.')

const tocGroups = point.groups
const tocTopics = tocGroups.flatMap((group) => group.topics.map((topic) => `${group.title}|${topic}`))
const leafTopics = taxLawPart2Point02Leaves.flatMap((group) => group.topics.map((item) => `${group.group}|${item.topic}`))

if (tocGroups.length !== 6) fail(`등록면허세 중분류 수 불일치: ${tocGroups.length}/6`)
if (tocTopics.length !== 24 || taxLawPart2Point02LeafCount !== 24) {
  fail(`등록면허세 소분류 수 불일치: TOC ${tocTopics.length} / leaf ${taxLawPart2Point02LeafCount} / expected 24`)
}
if (new Set(leafTopics).size !== leafTopics.length) fail('등록면허세 leaf key 중복이 있습니다.')

const missing = tocTopics.filter((key) => !leafTopics.includes(key))
const extra = leafTopics.filter((key) => !tocTopics.includes(key))
if (missing.length || extra.length) {
  fail(`등록면허세 TOC ↔ leaf 불일치\nmissing: ${missing.join(', ')}\nextra: ${extra.join(', ')}`)
}

for (const group of taxLawPart2Point02Leaves) {
  if (!group.group?.trim() || !Array.isArray(group.topics) || !group.topics.length) fail('등록면허세 leaf group 구조 불완전')
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

const content = taxLawContent.p2s2
for (const field of ['headline', 'summary', 'legalBases', 'examCore', 'understanding', 'flow', 'sections', 'traps', 'memory', 'ox', 'quiz']) {
  const value = content?.[field]
  if (Array.isArray(value) ? !value.length : !String(value || '').trim()) fail(`기존 등록면허세 본문 기반 누락: ${field}`)
}

const dataSource = read('src/data/taxLawPart2Point02Leaves.js')
for (const marker of [
  "group: '등록면허세 총설'",
  "group: '등록분 납세의무'",
  "group: '부동산등기의 과세표준'",
  "group: '등록분 세율'",
  "group: '중과세'",
  "group: '신고와 납부'",
  '보존 0.8',
  '유상 2.0',
  '무상 1.5',
  '상속 0.8',
  '제한물권 0.2',
  '등록 전',
]) {
  if (!dataSource.includes(marker)) fail(`등록면허세 핵심 데이터 누락: ${marker}`)
}

const renderer = read('src/tax-law-point05-leaf-layer.js')
for (const marker of [
  'data-tax-leaf-study="true"',
  "section.dataset.taxPoint = 'p2s2'",
  'PART 2 · POINT 02 · ${taxLawPart2Point02LeafCount}/${taxLawPart2Point02LeafCount}',
  'data-tax-leaf-topic=',
  'EXAM AXIS',
  '등록분 6단계',
  '보존 0.8 · 유상 2.0 · 무상 1.5 · 상속 0.8 · 제한물권 0.2',
  '2025년까지 개정된 규정',
]) {
  if (!renderer.includes(marker)) fail(`등록면허세 leaf renderer 누락: ${marker}`)
}
if (!renderer.includes("dataset.taxPoint !== 'p2s2'")) fail('등록면허세 법령 chip click handler POINT scope 누락')

const navLeaves = read('src/tax-law-nav-leaves.js')
for (const marker of [
  "const POINT05_ID = 'p2s2'",
  'taxLawPart2Point02Leaves',
  '{ pointId: POINT05_ID, groups: taxLawPart2Point02Leaves }',
  'button.dataset.taxPointTarget = pointId',
  'scrollToLeaf(pointId, topic)',
]) {
  if (!navLeaves.includes(marker)) fail(`등록면허세 소분류 nav 누락/비POINT-aware: ${marker}`)
}

const css = read('src/tax-law-point05-leaf-layer.css')
for (const marker of [
  '#tax-nav-groups-p2s2[data-tax-leaf-tree="true"].is-expanded',
  '.tax-registration-flow',
  '.tax-registration-rates',
  '@media (max-width: 700px)',
]) {
  if (!css.includes(marker)) fail(`등록면허세 시각화 CSS 누락: ${marker}`)
}

const main = read('src/main.jsx')
for (const requiredImport of [
  "import './tax-law-point05-leaf-layer.css'",
  "import './tax-law-point05-leaf-layer.js'",
  "import './tax-law-nav-leaves.js'",
]) {
  if (!main.includes(requiredImport)) fail(`main.jsx 등록면허세 import 누락: ${requiredImport}`)
}

console.log(`세법 PART 2 POINT 02 등록면허세 leaf support PASS: ${taxLawPart2Point02LeafCount}/24 소분류 · 6/6 중분류`)
console.log('등록분 판정 → 납세의무·납세지 → 과세표준 → 세율 → 중과·비과세 → 등록 전 신고납부 6단계 연결 PASS')
console.log('제37회 프로젝트 기준: 2025년까지 개정분 적용 · 2026 개정분은 비교 전용')
