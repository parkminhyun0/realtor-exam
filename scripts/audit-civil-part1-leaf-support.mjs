import fs from 'node:fs'
import { civilLawParts } from '../src/data/civilLawToc3Level.js'
import { civilLawPart1Visuals } from '../src/data/civilLawPart1Visuals.js'

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
const part1 = civilLawParts.find((part) => String(part.number) === '1')
const leaves = part1.points.flatMap((point) => point.topics.map((topic) => ({
  point: point.number,
  pointId: point.id,
  topic,
  key: `${point.id}|${topic}`,
})))

if (leaves.length !== 52) throw new Error(`PART 1 leaf 수 불일치: ${leaves.length}`)

const visualByKey = new Map(civilLawPart1Visuals.map((item) => [item.key, item]))
const missingRecall = leaves.filter(({ key }) => {
  const item = visualByKey.get(key)
  return !item?.question || !item?.takeaway || !Array.isArray(item.groups) || !item.groups.length
})
if (missingRecall.length) {
  throw new Error(`자가회상 문제를 만들 수 없는 PART 1 leaf: ${missingRecall.map((item) => item.topic).join(', ')}`)
}

const recallRenderer = read('src/civil-law-part1-leaf-check.js')
const main = read('src/main.jsx')
for (const required of [
  'data-civil-leaf-practice="true"',
  'RECALL CHECK · 세부항목 자가진단',
  '답을 떠올린 뒤 핵심 구조 확인',
]) {
  if (!recallRenderer.includes(required)) throw new Error(`PART 1 recall renderer 누락: ${required}`)
}
if (!main.includes("import './civil-law-part1-leaf-check.js'") || !main.includes("import './civil-law-part1-leaf-check.css'")) {
  throw new Error('PART 1 leaf recall JS/CSS가 main.jsx에 로드되지 않았습니다.')
}

const precedentSource = [
  'src/civil-law-precedent-layer.js',
  'src/civil-law-part3-precedent-layer.js',
  'src/civil-law-part4-precedent-layer.js',
].map(read).join('\n')
const drillSource = read('src/civil-law-intensive-drill-layer.js')

const precedentTopics = new Set()
for (const match of precedentSource.matchAll(/['"]PART 1\|([^'"]+)['"]\s*:/g)) precedentTopics.add(match[1])

const drillTopics = new Set()
for (const match of drillSource.matchAll(/['"]PART 1\|POINT\s+\d+\|([^'"]+)['"]\s*:/g)) drillTopics.add(match[1])

console.log(`PART 1 leaf support PASS: ${leaves.length}/52 leaf-specific recall checks`)
console.log(`직접 판례 연결: ${precedentTopics.size}/52 · A급 집중 O/X 추가 연결: ${drillTopics.size}/52`)
console.log('판례는 판례법리가 실제 결론을 좌우하는 항목만 직접 연결하고, 개념·조문 중심 항목에는 억지로 할당하지 않습니다.')
