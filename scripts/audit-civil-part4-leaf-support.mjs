import fs from 'node:fs'
import { civilLawParts } from '../src/data/civilLawToc3Level.js'
import { civilLawPart4Visuals } from '../src/data/civilLawPart4Visuals.js'

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
const part4 = civilLawParts.find((part) => String(part.number) === '4')
const leaves = part4.points.flatMap((point) => point.topics.map((topic) => ({
  point: point.number,
  pointId: point.id,
  topic,
  key: `${point.id}|${topic}`,
  precedentKey: `POINT ${point.number}|${topic}`,
})))

if (leaves.length !== 31) throw new Error(`PART 4 leaf 수 불일치: ${leaves.length}`)

const visualByKey = new Map(civilLawPart4Visuals.map((item) => [item.key, item]))
const missingRecall = leaves.filter(({ key }) => {
  const item = visualByKey.get(key)
  return !item?.question
    || !item?.takeaway
    || !Array.isArray(item.groups)
    || !item.groups.length
    || !item?.special?.general
    || !item?.special?.special
    || !item?.special?.basis
})
if (missingRecall.length) {
  throw new Error(`특별법 자가회상 문제를 만들 수 없는 PART 4 leaf: ${missingRecall.map((item) => item.topic).join(', ')}`)
}

const recallRenderer = read('src/civil-law-part4-leaf-check.js')
const main = read('src/main.jsx')
for (const required of [
  'data-civil-leaf-practice="true"',
  'data-civil-part="4"',
  'RECALL CHECK · 세부항목 자가진단',
  '특별법 전환 포인트',
  '답을 떠올린 뒤 핵심 구조 확인',
  'PART 4 · 31/31',
]) {
  if (!recallRenderer.includes(required)) throw new Error(`PART 4 recall renderer 누락: ${required}`)
}
for (const requiredImport of [
  "import './civil-law-part4-leaf-check.js'",
  "import './civil-law-part4-precedent-extra.js'",
]) {
  if (!main.includes(requiredImport)) throw new Error(`main.jsx PART 4 support import 누락: ${requiredImport}`)
}

const basePrecedentSource = read('src/civil-law-part4-precedent-layer.js')
const extraPrecedentSource = read('src/civil-law-part4-precedent-extra.js')
const precedentKeys = new Set()
for (const source of [basePrecedentSource, extraPrecedentSource]) {
  for (const match of source.matchAll(/^\s*['"](POINT\s+\d+\|[^'"]+)['"]\s*:\s*\[/gm)) {
    precedentKeys.add(match[1])
  }
}

const highDependencyTargets = [
  'POINT 01|대항력',
  'POINT 01|우선변제권과 최우선변제권',
  'POINT 01|임차권등기명령',
  'POINT 01|존속기간',
  'POINT 02|대항력',
  'POINT 02|우선변제권과 최우선변제권',
  'POINT 02|권리금보호',
  'POINT 02|차임연체와 해지',
  'POINT 03|공용부분',
  'POINT 03|대지사용권',
  'POINT 03|관리단과 관리인',
  'POINT 03|재건축',
  'POINT 04|가등기담보등에 관한 법률의 적용범위',
  'POINT 04|가등기담보권의 실행',
  'POINT 05|유효한 명의신탁',
  'POINT 05|2자간 명의신탁',
  'POINT 05|등기명의신탁',
  'POINT 05|계약명의신탁',
  'POINT 05|경매에 있어서의 명의신탁',
]

const leafPrecedentKeys = new Set(leaves.map((item) => item.precedentKey))
const invalidTargets = highDependencyTargets.filter((key) => !leafPrecedentKeys.has(key))
if (invalidTargets.length) {
  throw new Error(`목차에 존재하지 않는 PART 4 판례 타깃: ${invalidTargets.join(', ')}`)
}

const missingPrecedentTargets = highDependencyTargets.filter((key) => !precedentKeys.has(key))
if (missingPrecedentTargets.length) {
  throw new Error(`판례 의존도가 높은 PART 4 직접판례 누락: ${missingPrecedentTargets.join(', ')}`)
}

const extraUrls = [...extraPrecedentSource.matchAll(/url:\s*['"]([^'"]+)['"]/g)].map((match) => match[1])
if (extraUrls.length !== 8) throw new Error(`PART 4 추가 판례 원문 링크 수 불일치: ${extraUrls.length}`)
const badUrls = extraUrls.filter((url) => !/^https:\/\/(www\.)?law\.go\.kr\//.test(url))
if (badUrls.length) throw new Error(`국가법령정보센터가 아닌 PART 4 판례 링크 존재: ${badUrls.join(', ')}`)

const flowSource = read('src/civil-law-integrated-study-flow.js')
for (const required of [
  '.civil-leaf-precedents[data-topic]',
  'item.dataset.topic === node.topic',
]) {
  if (!flowSource.includes(required)) throw new Error(`PART 4 직접판례 학습흐름 연결 누락: ${required}`)
}

console.log(`PART 4 leaf support PASS: ${leaves.length}/31 leaf-specific recall checks + special-law transitions`)
console.log(`직접 판례 연결: ${precedentKeys.size}/31 · 선별 고의존 논점 ${highDependencyTargets.length}/${highDependencyTargets.length}`)
console.log('민사특별법은 특별법 조문을 1차 기준으로 두고, 판례가 요건·효과·제3자 관계를 구체화하는 논점만 직접 연결합니다.')
