import fs from 'node:fs'
import { civilLawParts } from '../src/data/civilLawToc3Level.js'
import { civilLawPart2Visuals } from '../src/data/civilLawPart2Visuals.js'

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
const part2 = civilLawParts.find((part) => String(part.number) === '2')
const leaves = part2.points.flatMap((point) => point.topics.map((topic) => ({
  point: point.number,
  pointId: point.id,
  topic,
  key: `${point.id}|${topic}`,
})))

if (leaves.length !== 65) throw new Error(`PART 2 leaf 수 불일치: ${leaves.length}`)

const visualByKey = new Map(civilLawPart2Visuals.map((item) => [item.key, item]))
const missingRecall = leaves.filter(({ key }) => {
  const item = visualByKey.get(key)
  return !item?.question || !item?.takeaway || !Array.isArray(item.groups) || !item.groups.length
})
if (missingRecall.length) {
  throw new Error(`자가회상 문제를 만들 수 없는 PART 2 leaf: ${missingRecall.map((item) => item.topic).join(', ')}`)
}

const recallRenderer = read('src/civil-law-part2-leaf-check.js')
const main = read('src/main.jsx')
for (const required of [
  'data-civil-leaf-practice="true"',
  'data-civil-part="2"',
  'RECALL CHECK · 세부항목 자가진단',
  '답을 떠올린 뒤 핵심 구조 확인',
  'PART 2 · 65/65',
]) {
  if (!recallRenderer.includes(required)) throw new Error(`PART 2 recall renderer 누락: ${required}`)
}
if (!main.includes("import './civil-law-part2-leaf-check.js'")) {
  throw new Error('PART 2 leaf recall JS가 main.jsx에 로드되지 않았습니다.')
}

const basePrecedentSource = read('src/civil-law-precedent-layer.js')
const extraPrecedentSource = read('src/civil-law-part2-precedent-extra.js')
const precedentTopics = new Set()
for (const match of basePrecedentSource.matchAll(/['"]PART 2\|([^'"]+)['"]\s*:/g)) precedentTopics.add(match[1])
for (const match of extraPrecedentSource.matchAll(/^\s*['"]([^'"]+)['"]\s*:\s*\[/gm)) precedentTopics.add(match[1])

const highDependencyTargets = [
  '등기의 추정력',
  '중간생략등기',
  '무효등기의 유용',
  '주위토지통행권',
  '취득시효완성 후의 법률관계',
  '등기부취득시효',
  '공유물의 분할',
  '분묘기지권',
  '제366조의 법정지상권',
  '관습법상의 법정지상권',
  '유치권의 의의와 성립요건',
  '유치권의 효력과 소멸',
  '저당권의 효력범위',
  '공동저당',
  '근저당',
]

const missingPrecedentTargets = highDependencyTargets.filter((topic) => !precedentTopics.has(topic))
if (missingPrecedentTargets.length) {
  throw new Error(`판례 의존도가 높은 PART 2 직접판례 누락: ${missingPrecedentTargets.join(', ')}`)
}

const urls = [...extraPrecedentSource.matchAll(/url:\s*['"]([^'"]+)['"]/g)].map((match) => match[1])
if (urls.length !== 8) throw new Error(`PART 2 추가 판례 원문 링크 수 불일치: ${urls.length}`)
const badUrls = urls.filter((url) => !/^https:\/\/(www\.)?law\.go\.kr\//.test(url))
if (badUrls.length) throw new Error(`국가법령정보센터가 아닌 판례 링크 존재: ${badUrls.join(', ')}`)

const flowSource = read('src/civil-law-integrated-study-flow.js')
for (const required of [
  '[data-civil-law-leaf-precedents="true"]',
  '[data-civil-law-part2-extra-precedents="true"]',
  'item.dataset.topic === node.topic',
]) {
  if (!flowSource.includes(required)) throw new Error(`PART 2 직접판례 학습흐름 연결 누락: ${required}`)
}

console.log(`PART 2 leaf support PASS: ${leaves.length}/65 leaf-specific recall checks`)
console.log(`직접 판례 연결: ${precedentTopics.size}/65 · 선별 고의존 논점 ${highDependencyTargets.length}/${highDependencyTargets.length}`)
console.log('판례는 조문만으로 결론이 완성되지 않는 논점만 직접 연결하고, 개념·조문 중심 leaf에는 억지로 배정하지 않습니다.')
