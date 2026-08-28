import fs from 'node:fs'
import { taxLawParts } from '../src/data/taxLaw.js'
import { taxLawContent } from '../src/data/taxLawContent.js'
import { taxLawPart1Point01LeafCount } from '../src/data/taxLawPart1Point01Leaves.js'
import { taxLawPart1Point02LeafCount } from '../src/data/taxLawPart1Point02Leaves.js'
import { taxLawPart1Point03LeafCount } from '../src/data/taxLawPart1Point03Leaves.js'
import { taxLawPart2Point01LeafCount } from '../src/data/taxLawPart2Point01Leaves.js'
import { taxLawPart2Point02LeafCount } from '../src/data/taxLawPart2Point02Leaves.js'

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
const fail = (message) => { throw new Error(message) }

const expected = {
  parts: 3,
  points: 9,
  groups: 62,
  topics: 316,
  partGroups: [15, 24, 23],
  partTopics: [66, 119, 131],
}

if (taxLawParts.length !== expected.parts) fail(`세법 PART 수 불일치: ${taxLawParts.length}/${expected.parts}`)

const points = taxLawParts.flatMap((part) => part.points.map((point) => ({ part, point })))
const groups = points.flatMap(({ part, point }) => point.groups.map((group) => ({ part, point, group })))
const topics = groups.flatMap(({ part, point, group }) => group.topics.map((topic) => ({ part, point, group, topic })))

if (points.length !== expected.points) fail(`세법 POINT 수 불일치: ${points.length}/${expected.points}`)
if (groups.length !== expected.groups) fail(`세법 중분류 수 불일치: ${groups.length}/${expected.groups}`)
if (topics.length !== expected.topics) fail(`세법 소분류 수 불일치: ${topics.length}/${expected.topics}`)

const pointIds = points.map(({ point }) => point.id)
if (new Set(pointIds).size !== pointIds.length) fail('세법 POINT id 중복이 있습니다.')

const topicKeys = topics.map(({ point, group, topic }) => `${point.id}|${group.title}|${topic}`)
if (new Set(topicKeys).size !== topicKeys.length) fail('세법 POINT-중분류-소분류 경로 중복이 있습니다.')

for (const [partIndex, part] of taxLawParts.entries()) {
  const partGroupCount = part.points.reduce((sum, point) => sum + point.groups.length, 0)
  const partTopicCount = part.points.reduce((sum, point) => sum + point.groups.reduce((subtotal, group) => subtotal + group.topics.length, 0), 0)
  if (partGroupCount !== expected.partGroups[partIndex]) {
    fail(`PART ${part.number} 중분류 수 불일치: ${partGroupCount}/${expected.partGroups[partIndex]}`)
  }
  if (partTopicCount !== expected.partTopics[partIndex]) {
    fail(`PART ${part.number} 소분류 수 불일치: ${partTopicCount}/${expected.partTopics[partIndex]}`)
  }

  for (const point of part.points) {
    if (!point.id?.trim() || !point.number?.trim() || !point.title?.trim()) fail(`PART ${part.number}: POINT 메타데이터 누락`)
    if (!Array.isArray(point.groups) || !point.groups.length) fail(`${point.id}: 중분류가 없습니다.`)
    if (!taxLawContent[point.id]) fail(`${point.id}: POINT 본문 taxLawContent가 없습니다.`)

    for (const group of point.groups) {
      if (!group.title?.trim() || !Array.isArray(group.topics) || !group.topics.length) fail(`${point.id}: 중분류 구조 불완전`)
      for (const topic of group.topics) {
        if (!String(topic || '').trim()) fail(`${point.id}|${group.title}: 빈 소분류가 있습니다.`)
      }
    }
  }
}

const part1LeafCount = taxLawPart1Point01LeafCount + taxLawPart1Point02LeafCount + taxLawPart1Point03LeafCount
if (part1LeafCount !== 66) fail(`PART 1 leaf 완료 수 불일치: ${part1LeafCount}/66`)
if (taxLawPart2Point01LeafCount !== 61) fail(`PART 2 POINT 01 취득세 leaf 완료 수 불일치: ${taxLawPart2Point01LeafCount}/61`)
if (taxLawPart2Point02LeafCount !== 24) fail(`PART 2 POINT 02 등록면허세 leaf 완료 수 불일치: ${taxLawPart2Point02LeafCount}/24`)
const part2LeafCount = taxLawPart2Point01LeafCount + taxLawPart2Point02LeafCount
const completedLeafCount = part1LeafCount + part2LeafCount

const page = read('src/TaxLawPage.jsx')
for (const marker of [
  '카테고리 → 대분류 → 중분류 → 소분류',
  'taxLawParts.map',
  'part.points.map',
  'taxLawContent[point.id]',
]) {
  if (!page.includes(marker)) fail(`세법 페이지 4단 카테고리 표지/렌더링 누락: ${marker}`)
}

const navTree = read('src/tax-law-nav-tree.js')
for (const marker of ['point.groups.forEach', 'tax-nav-groups-', 'scrollToGroup']) {
  if (!navTree.includes(marker)) fail(`세법 중분류 트리 렌더링 누락: ${marker}`)
}

const navLeaves = read('src/tax-law-nav-leaves.js')
for (const pointId of ['p1s1', 'p1s2', 'p1s3', 'p2s1', 'p2s2']) {
  if (!navLeaves.includes(pointId)) fail(`완료 leaf POINT nav 누락: ${pointId}`)
}

console.log(`세법 카테고리 AUDIT PASS: ${expected.parts} PART · ${expected.points} POINT · ${expected.groups} 중분류 · ${expected.topics} 소분류`)
console.log(`PART 1 조세총론: ${expected.partGroups[0]} 중분류 · ${expected.partTopics[0]} 소분류 · leaf ${part1LeafCount}/${expected.partTopics[0]} 완료`)
console.log(`PART 2 지방세: ${expected.partGroups[1]} 중분류 · ${expected.partTopics[1]} 소분류 · leaf ${part2LeafCount}/${expected.partTopics[1]} 완료 (취득세 61 + 등록면허세 24)`)
console.log(`PART 3 국세: ${expected.partGroups[2]} 중분류 · ${expected.partTopics[2]} 소분류`)
console.log(`전체 세부 학습카드: ${completedLeafCount}/${expected.topics}`)
console.log('POINT 본문: 9/9 존재 · 다음 leaf 확장 대상은 PART 2 POINT 03 재산세')
