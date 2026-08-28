import fs from 'node:fs'
import { civilLawParts, civilLawPointCount, civilLawTopicCount } from '../src/data/civilLawToc3Level.js'
import { civilLawContent } from '../src/data/civilLawContent.js'
import { civilLawPart2Content } from '../src/data/civilLawPart2Content.js'
import { civilLawPart3Content } from '../src/data/civilLawPart3Content.js'
import { civilLawPart4Content } from '../src/data/civilLawPart4Content.js'
import { civilLawPart1Visuals } from '../src/data/civilLawPart1Visuals.js'
import { civilLawPart2Visuals } from '../src/data/civilLawPart2Visuals.js'
import { civilLawPart3Visuals } from '../src/data/civilLawPart3Visuals.js'
import { civilLawPart4Visuals } from '../src/data/civilLawPart4Visuals.js'

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
const fail = (message) => { throw new Error(message) }

const points = civilLawParts.flatMap((part) => part.points.map((point) => ({
  partNumber: String(part.number),
  partTitle: part.title,
  pointNumber: String(point.number),
  pointId: point.id,
  pointTitle: point.title,
  topics: point.topics,
})))

const leaves = points.flatMap((point) => point.topics.map((topic) => ({
  ...point,
  topic,
  key: `${point.pointId}|${topic}`,
})))
const leafByKey = new Map(leaves.map((leaf) => [leaf.key, leaf]))

if (civilLawPointCount !== 23 || points.length !== 23) fail(`민법 POINT 수 불일치: ${civilLawPointCount}/${points.length}`)
if (civilLawTopicCount !== 182 || leaves.length !== 182) fail(`민법 leaf 수 불일치: ${civilLawTopicCount}/${leaves.length}`)
if (leafByKey.size !== leaves.length) fail('민법 182 leaf canonical key 중복이 있습니다.')

const allContent = {
  ...civilLawContent,
  ...civilLawPart2Content,
  ...civilLawPart3Content,
  ...civilLawPart4Content,
}

const contentKeys = Object.keys(allContent)
const pointIds = new Set(points.map((point) => point.pointId))
const missingPointContent = points.filter((point) => !allContent[point.pointId])
const orphanPointContent = contentKeys.filter((key) => !pointIds.has(key))
if (missingPointContent.length) fail(`POINT 본문 누락: ${missingPointContent.map((item) => item.pointId).join(', ')}`)
if (orphanPointContent.length) fail(`목차에 없는 POINT 본문 존재: ${orphanPointContent.join(', ')}`)

points.forEach((point) => {
  const content = allContent[point.pointId]
  const requiredText = ['statusLabel', 'headline', 'summary']
  requiredText.forEach((field) => {
    if (!String(content?.[field] || '').trim()) fail(`${point.pointId}: ${field} 누락`)
  })
  if (!Array.isArray(content.statutes) || !content.statutes.length) fail(`${point.pointId}: 관련 조문 카드 누락`)
  if (!Array.isArray(content.sections) || !content.sections.length) fail(`${point.pointId}: 해설 section 누락`)
  if (!Array.isArray(content.traps) || !content.traps.length) fail(`${point.pointId}: 시험 함정 누락`)

  content.statutes.forEach((statute, index) => {
    if (!statute?.lawName || !statute?.article || !statute?.title || !Array.isArray(statute?.lines) || !statute.lines.length) {
      fail(`${point.pointId}: 조문 카드 ${index + 1} 구조 불완전`)
    }
  })
})

const visualSets = [
  ['1', civilLawPart1Visuals],
  ['2', civilLawPart2Visuals],
  ['3', civilLawPart3Visuals],
  ['4', civilLawPart4Visuals],
]
const visualKeys = new Set()
for (const [partNumber, visuals] of visualSets) {
  const expected = leaves.filter((leaf) => leaf.partNumber === partNumber)
  if (visuals.length !== expected.length) fail(`PART ${partNumber}: visual 수 ${visuals.length}/${expected.length}`)
  for (const visual of visuals) {
    if (!leafByKey.has(visual.key)) fail(`목차에 없는 visual key: ${visual.key}`)
    if (visualKeys.has(visual.key)) fail(`visual key 중복: ${visual.key}`)
    visualKeys.add(visual.key)
    if (!visual.question?.trim() || !visual.takeaway?.trim() || !Array.isArray(visual.groups) || !visual.groups.length) {
      fail(`${visual.key}: 자가회상/시각화 데이터 불완전`)
    }
  }
}
if (visualKeys.size !== 182) fail(`전체 visual coverage 불일치: ${visualKeys.size}/182`)

const main = read('src/main.jsx')
const civilPage = read('src/CivilLawPage.jsx')
const flow = read('src/civil-law-integrated-study-flow.js')
const bookMapExam = read('src/civil-law-book-map-exam.js')

for (const required of [
  'civilLawContent',
  'civilLawPart2Content',
  'civilLawPart3Content',
  'civilLawPart4Content',
  'point.topics.map',
  'civil-nav-topic-button',
]) {
  if (!civilPage.includes(required)) fail(`CivilLawPage 본문/leaf 연결 누락: ${required}`)
}

for (const partNumber of ['1', '2', '3', '4']) {
  const renderer = read(`src/civil-law-part${partNumber}-leaf-check.js`)
  const count = leaves.filter((leaf) => leaf.partNumber === partNumber).length
  for (const required of [
    'data-civil-leaf-practice="true"',
    `data-civil-part="${partNumber}"`,
    `PART ${partNumber} · ${count}/${count}`,
  ]) {
    if (!renderer.includes(required)) fail(`PART ${partNumber} recall renderer 누락: ${required}`)
  }
  if (!main.includes(`import './civil-law-part${partNumber}-leaf-check.js'`)) {
    fail(`main.jsx PART ${partNumber} recall import 누락`)
  }
}

for (const required of [
  "id: 'law'",
  "id: 'visual'",
  "id: 'map'",
  "id: 'exam'",
  "id: 'precedent'",
  "id: 'practice'",
  '.civil-leaf-precedents[data-topic]',
  '[data-civil-leaf-practice="true"]',
  'item.dataset.topic === node.topic',
]) {
  if (!flow.includes(required)) fail(`통합 학습 흐름 연결 누락: ${required}`)
}
for (const required of [
  'const flatNodes = civilLawParts.flatMap',
  'civil-learning-map',
  'civil-learning-exam-card',
  'data-civil-learning-target',
]) {
  if (!bookMapExam.includes(required)) fail(`BOOK×MAP×EXAM 연결 누락: ${required}`)
}

function uniqueLeafByTopic(partNumber, topic) {
  const matches = leaves.filter((leaf) => leaf.partNumber === partNumber && leaf.topic === topic)
  if (matches.length !== 1) fail(`PART ${partNumber} 판례 topic 식별 실패 '${topic}': ${matches.length}개`)
  return matches[0]
}

function uniqueLeafByPointTopic(partNumber, pointNumber, topic) {
  const matches = leaves.filter((leaf) => (
    leaf.partNumber === partNumber
    && String(Number(leaf.pointNumber)) === String(Number(pointNumber))
    && leaf.topic === topic
  ))
  if (matches.length !== 1) fail(`PART ${partNumber} POINT ${pointNumber} 판례 식별 실패 '${topic}': ${matches.length}개`)
  return matches[0]
}

const precedentCoverage = new Map()
const precedentSources = [
  {
    file: 'src/civil-law-precedent-layer.js',
    parse(source) {
      return [...source.matchAll(/^\s*['"](PART\s+([12])\|([^'"]+))['"]\s*:\s*\[/gm)]
        .map((match) => uniqueLeafByTopic(match[2], match[3]))
    },
  },
  {
    file: 'src/civil-law-part2-precedent-extra.js',
    parse(source) {
      return [...source.matchAll(/^\s*['"]([^'"]+)['"]\s*:\s*\[/gm)]
        .map((match) => uniqueLeafByTopic('2', match[1]))
    },
  },
  {
    file: 'src/civil-law-part3-precedent-layer.js',
    parse(source) {
      return [...source.matchAll(/^\s*['"]([^'"]+)['"]\s*:\s*\[/gm)]
        .map((match) => uniqueLeafByTopic('3', match[1]))
    },
  },
  {
    file: 'src/civil-law-part3-precedent-extra.js',
    parse(source) {
      return [...source.matchAll(/^\s*['"]([^'"]+)['"]\s*:\s*\[/gm)]
        .map((match) => uniqueLeafByTopic('3', match[1]))
    },
  },
  {
    file: 'src/civil-law-part4-precedent-layer.js',
    parse(source) {
      return [...source.matchAll(/^\s*['"]POINT\s+(\d+)\|([^'"]+)['"]\s*:\s*\[/gm)]
        .map((match) => uniqueLeafByPointTopic('4', match[1], match[2]))
    },
  },
  {
    file: 'src/civil-law-part4-precedent-extra.js',
    parse(source) {
      return [...source.matchAll(/^\s*['"]POINT\s+(\d+)\|([^'"]+)['"]\s*:\s*\[/gm)]
        .map((match) => uniqueLeafByPointTopic('4', match[1], match[2]))
    },
  },
]

for (const { file, parse } of precedentSources) {
  const source = read(file)
  const caseCount = [...source.matchAll(/\bcaseNo:\s*['"]/g)].length
  const urls = [...source.matchAll(/\burl:\s*['"]([^'"]+)['"]/g)].map((match) => match[1])
  if (caseCount !== urls.length) fail(`${file}: 판례 caseNo/url 수 불일치 ${caseCount}/${urls.length}`)
  const badUrls = urls.filter((url) => !/^https:\/\/(www\.)?law\.go\.kr\//.test(url))
  if (badUrls.length) fail(`${file}: 국가법령정보센터 외 판례 URL: ${badUrls.join(', ')}`)

  for (const leaf of parse(source)) {
    if (precedentCoverage.has(leaf.key)) {
      fail(`직접 판례 leaf 중복 연결: ${leaf.key} (${precedentCoverage.get(leaf.key)} / ${file})`)
    }
    precedentCoverage.set(leaf.key, file)
  }
}

const expectedPrecedentCounts = { '1': 4, '2': 15, '3': 14, '4': 19 }
for (const [partNumber, expected] of Object.entries(expectedPrecedentCounts)) {
  const actual = [...precedentCoverage.keys()]
    .map((key) => leafByKey.get(key))
    .filter((leaf) => leaf?.partNumber === partNumber).length
  if (actual !== expected) fail(`PART ${partNumber} 직접 판례 coverage 불일치: ${actual}/${expected}`)
}

const sourceIssueLayer = read('src/civil-law-part1-source-issue-layer.js')
for (const required of [
  "'이중매매의 법률관계'",
  "'오표시무해의 원칙'",
  '2001다8097, 8103',
  '93다2629, 2636(병합)',
  '93다3103',
  'data-civil-source-issue="true"',
]) {
  if (!sourceIssueLayer.includes(required)) fail(`PART 1 판례·해석론 source 보강 누락: ${required}`)
}
const sourceIssueUrls = [...sourceIssueLayer.matchAll(/url:\s*['"]([^'"]+)['"]/g)].map((match) => match[1])
if (!sourceIssueUrls.length || sourceIssueUrls.some((url) => !/^https:\/\/(www\.)?law\.go\.kr\//.test(url))) {
  fail('PART 1 판례·해석론 source 카드에 비공식 URL이 있습니다.')
}
if (!main.includes("import './civil-law-part1-source-issue-layer.js'")) fail('PART 1 source issue layer import 누락')

const finalRequiredImports = [
  './civil-law-part1-law-first.js',
  './civil-law-part2-law-first.js',
  './civil-law-part3-law-first.js',
  './civil-law-part4-law-first.js',
  './civil-law-book-map-exam.js',
  './civil-law-integrated-study-flow.js',
]
for (const path of finalRequiredImports) {
  if (!main.includes(`import '${path}'`)) fail(`최종 민법 학습 레이어 import 누락: ${path}`)
}

console.log('민법 최종 정합성 AUDIT PASS')
console.log(`- 목차/본문: ${points.length}/23 POINT · ${leaves.length}/182 leaves`)
console.log(`- LAW-FIRST/시각화/자가진단 연결: 182/182`)
console.log(`- 직접 판례 leaf: ${precedentCoverage.size}/182 (P1 4 · P2 15 · P3 14 · P4 19)`)
console.log('- 판례 URL: 국가법령정보센터만 허용 · 중복/고아 판례 leaf 없음')
console.log('- BOOK × MAP × EXAM + 통합 학습 흐름 인터페이스 연결 확인')
