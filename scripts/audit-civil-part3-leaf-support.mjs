import fs from 'node:fs'
import { civilLawParts } from '../src/data/civilLawToc3Level.js'
import { civilLawPart3Visuals } from '../src/data/civilLawPart3Visuals.js'

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
const part3 = civilLawParts.find((part) => String(part.number) === '3')
const leaves = part3.points.flatMap((point) => point.topics.map((topic) => ({
  point: point.number,
  pointId: point.id,
  topic,
  key: `${point.id}|${topic}`,
})))

if (leaves.length !== 34) throw new Error(`PART 3 leaf 수 불일치: ${leaves.length}`)

const visualByKey = new Map(civilLawPart3Visuals.map((item) => [item.key, item]))
const missingRecall = leaves.filter(({ key }) => {
  const item = visualByKey.get(key)
  return !item?.question || !item?.takeaway || !Array.isArray(item.groups) || !item.groups.length
})
if (missingRecall.length) {
  throw new Error(`자가회상 문제를 만들 수 없는 PART 3 leaf: ${missingRecall.map((item) => item.topic).join(', ')}`)
}

const recallRenderer = read('src/civil-law-part3-leaf-check.js')
const main = read('src/main.jsx')
for (const required of [
  'data-civil-leaf-practice="true"',
  'data-civil-part="3"',
  'RECALL CHECK · 세부항목 자가진단',
  '답을 떠올린 뒤 핵심 구조 확인',
  'PART 3 · 34/34',
]) {
  if (!recallRenderer.includes(required)) throw new Error(`PART 3 recall renderer 누락: ${required}`)
}
for (const requiredImport of [
  "import './civil-law-part3-leaf-check.js'",
  "import './civil-law-part3-precedent-extra.js'",
]) {
  if (!main.includes(requiredImport)) throw new Error(`main.jsx PART 3 support import 누락: ${requiredImport}`)
}

const basePrecedentSource = read('src/civil-law-part3-precedent-layer.js')
const extraPrecedentSource = read('src/civil-law-part3-precedent-extra.js')
const precedentTopics = new Set()
for (const match of basePrecedentSource.matchAll(/^\s*['"]([^'"]+)['"]\s*:\s*\[/gm)) precedentTopics.add(match[1])
for (const match of extraPrecedentSource.matchAll(/^\s*['"]([^'"]+)['"]\s*:\s*\[/gm)) precedentTopics.add(match[1])

const highDependencyTargets = [
  '계약체결상의 과실책임',
  '동시이행의 항변권',
  '위험부담',
  '제3자를 위한 계약',
  '해제의 효과',
  '해약금에 의한 계약해제',
  '매도인의 담보책임',
  '경매에 있어서의 담보책임',
  '임대인의 수선의무',
  '임차인의 비용상환청구권',
  '건물임차인의 부속물매수청구권',
  '토지임차인의 갱신청구권과 지상물매수청구권',
  '동의 있는 전대의 법률관계',
  '무단전대의 법률관계',
]

const missingPrecedentTargets = highDependencyTargets.filter((topic) => !precedentTopics.has(topic))
if (missingPrecedentTargets.length) {
  throw new Error(`판례 의존도가 높은 PART 3 직접판례 누락: ${missingPrecedentTargets.join(', ')}`)
}

const extraUrls = [...extraPrecedentSource.matchAll(/url:\s*['"]([^'"]+)['"]/g)].map((match) => match[1])
if (extraUrls.length !== 5) throw new Error(`PART 3 추가 판례 원문 링크 수 불일치: ${extraUrls.length}`)
const allUrls = [basePrecedentSource, extraPrecedentSource]
  .flatMap((source) => [...source.matchAll(/url:\s*['"]([^'"]+)['"]/g)].map((match) => match[1]))
const badUrls = allUrls.filter((url) => !/^https:\/\/(www\.)?law\.go\.kr\//.test(url))
if (badUrls.length) throw new Error(`국가법령정보센터가 아닌 PART 3 판례 링크 존재: ${badUrls.join(', ')}`)

const flowSource = read('src/civil-law-integrated-study-flow.js')
for (const required of [
  '.civil-leaf-precedents[data-topic]',
  'item.dataset.topic === node.topic',
]) {
  if (!flowSource.includes(required)) throw new Error(`PART 3 직접판례 학습흐름 연결 누락: ${required}`)
}

console.log(`PART 3 leaf support PASS: ${leaves.length}/34 leaf-specific recall checks`)
console.log(`직접 판례 연결: ${precedentTopics.size}/34 · 선별 고의존 논점 ${highDependencyTargets.length}/${highDependencyTargets.length}`)
console.log('계약법 판례는 조문만으로 결론이 완성되지 않는 논점만 직접 연결하고, 개념·조문 중심 leaf에는 억지로 배정하지 않습니다.')
