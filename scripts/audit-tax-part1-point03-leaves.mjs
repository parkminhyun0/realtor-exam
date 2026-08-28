import fs from 'node:fs'
import { taxLawParts } from '../src/data/taxLaw.js'
import { taxLawContent } from '../src/data/taxLawContent.js'
import { taxLawPart1Point03Leaves, taxLawPart1Point03LeafCount } from '../src/data/taxLawPart1Point03Leaves.js'

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
const fail = (message) => { throw new Error(message) }

const part1 = taxLawParts.find((part) => String(part.number) === '1')
const point = part1?.points.find((item) => item.id === 'p1s3')
if (!point) fail('세법 PART 1 POINT 03(p1s3)를 찾을 수 없습니다.')

const tocGroups = point.groups
const tocTopics = tocGroups.flatMap((group) => group.topics.map((topic) => `${group.title}|${topic}`))
const leafTopics = taxLawPart1Point03Leaves.flatMap((group) => group.topics.map((item) => `${group.group}|${item.topic}`))

if (tocGroups.length !== 4) fail(`POINT 03 중분류 수 불일치: ${tocGroups.length}/4`)
if (tocTopics.length !== 19 || taxLawPart1Point03LeafCount !== 19) {
  fail(`POINT 03 소분류 수 불일치: TOC ${tocTopics.length} / leaf ${taxLawPart1Point03LeafCount} / expected 19`)
}
if (new Set(leafTopics).size !== leafTopics.length) fail('POINT 03 leaf key 중복이 있습니다.')

const missing = tocTopics.filter((key) => !leafTopics.includes(key))
const extra = leafTopics.filter((key) => !tocTopics.includes(key))
if (missing.length || extra.length) {
  fail(`POINT 03 TOC ↔ leaf 불일치\nmissing: ${missing.join(', ')}\nextra: ${extra.join(', ')}`)
}

for (const group of taxLawPart1Point03Leaves) {
  if (!group.group?.trim() || !Array.isArray(group.topics) || !group.topics.length) fail('POINT 03 leaf group 구조 불완전')
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

const content = taxLawContent.p1s3
for (const field of ['headline', 'summary', 'legalBases', 'examCore', 'understanding', 'flow', 'sections', 'traps', 'memory', 'ox', 'quiz']) {
  const value = content?.[field]
  if (Array.isArray(value) ? !value.length : !String(value || '').trim()) fail(`기존 POINT 03 본문 기반 누락: ${field}`)
}

const dataSource = read('src/data/taxLawPart1Point03Leaves.js')
for (const marker of [
  "topic: '법정기일'",
  "topic: '부동산 관련 당해세'",
  "topic: '시험용 배당순위 비교'",
  "topic: '과세전적부심사'",
  "topic: '행정소송'",
  "article: '제81조의15'",
  "lawName: '지방세기본법', article: '제88조'",
  "lawName: '지방세기본법', article: '제98조'",
  '상속세·증여세·종합부동산세',
  '재산세, 소방분 지역자원시설세, 재산세에 부가되는 지방교육세',
  '과세 전 = 30일',
  '지방세는 현행 심사청구 없음',
  '사전 30 / 사후 90',
]) {
  if (!dataSource.includes(marker)) fail(`POINT 03 핵심 우선권·불복 데이터 누락: ${marker}`)
}

const renderer = read('src/tax-law-point03-leaf-layer.js')
for (const marker of [
  'data-tax-leaf-study="true"',
  "section.dataset.taxPoint = 'p1s3'",
  'PART 1 · POINT 03 · ${taxLawPart1Point03LeafCount}/${taxLawPart1Point03LeafCount}',
  'data-tax-leaf-topic=',
  'EXAM AXIS',
  '고정 순위 암기보다 5단계 판정',
  '사전 30일 · 사후 90일',
  '집행비용',
  '법정기일 ↔ 담보권 설정·확정일자',
]) {
  if (!renderer.includes(marker)) fail(`POINT 03 leaf renderer 누락: ${marker}`)
}

for (const [path, pointId] of [
  ['src/tax-law-point01-leaf-layer.js', 'p1s1'],
  ['src/tax-law-point02-leaf-layer.js', 'p1s2'],
  ['src/tax-law-point03-leaf-layer.js', 'p1s3'],
]) {
  const source = read(path)
  if (!source.includes(`[data-tax-leaf-study="true"][data-tax-point="${pointId}"]`)) {
    fail(`${pointId}: leaf renderer가 자기 POINT만 제거·생성하도록 scope되지 않았습니다.`)
  }
  if (!source.includes(`dataset.taxPoint !== '${pointId}'`)) {
    fail(`${pointId}: 법령 chip click handler가 자기 POINT로 scope되지 않았습니다.`)
  }
}

const navLeaves = read('src/tax-law-nav-leaves.js')
for (const marker of [
  "const POINT03_ID = 'p1s3'",
  'taxLawPart1Point03Leaves',
  '{ pointId: POINT03_ID, groups: taxLawPart1Point03Leaves }',
  'button.dataset.taxPointTarget = pointId',
  'item.dataset.taxPoint === pointId',
  'scrollToLeaf(pointId, topic)',
]) {
  if (!navLeaves.includes(marker)) fail(`POINT 03 소분류 nav 누락/비POINT-aware: ${marker}`)
}

const css = read('src/tax-law-point03-leaf-layer.css')
for (const marker of [
  '#tax-nav-groups-p1s3[data-tax-leaf-tree="true"].is-expanded',
  '.tax-priority-flow',
  '.tax-appeal-flow',
  '@media (max-width: 700px)',
]) {
  if (!css.includes(marker)) fail(`POINT 03 시각화 CSS 누락: ${marker}`)
}

const main = read('src/main.jsx')
for (const requiredImport of [
  "import './tax-law-point03-leaf-layer.css'",
  "import './tax-law-point03-leaf-layer.js'",
  "import './tax-law-nav-leaves.js'",
]) {
  if (!main.includes(requiredImport)) fail(`main.jsx 세법 POINT 03 import 누락: ${requiredImport}`)
}

console.log(`세법 PART 1 POINT 03 leaf support PASS: ${taxLawPart1Point03LeafCount}/19 소분류 · 4/4 중분류`)
console.log('조세우선 → 당해재산세 → 배당판정 + 과세전 30일/사후 90일 불복 시간축 연결 PASS')
console.log('POINT 01~03 nav는 POINT-aware leaf 이동으로 격리되어 중복 topic 오이동을 차단합니다.')
