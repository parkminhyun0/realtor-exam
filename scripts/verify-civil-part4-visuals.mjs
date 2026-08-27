import { civilLawParts } from '../src/data/civilLawToc3Level.js'
import {
  civilLawPart4Visuals,
  civilLawPart4VisualTypes,
} from '../src/data/civilLawPart4Visuals.js'

const part4 = civilLawParts.find((part) => part.id === 'part4')
if (!part4) throw new Error('PART 4 민사특별법을 찾을 수 없습니다.')

const allKeys = new Set(civilLawParts.flatMap((part) => (
  part.points.flatMap((point) => point.topics.map((topic) => `${point.id}|${topic}`))
)))
const expected = part4.points.flatMap((point) => point.topics.map((topic) => `${point.id}|${topic}`))
const expectedSet = new Set(expected)
const actualKeys = civilLawPart4Visuals.map((item) => item.key)
const actualSet = new Set(actualKeys)

if (expected.length !== 31) {
  throw new Error(`PART 4 교재 목차가 31개 세부항목이어야 합니다. 현재 ${expected.length}개`)
}
if (civilLawPart4Visuals.length !== expected.length) {
  throw new Error(`PART 4 다이어그램 수 불일치: expected ${expected.length}, actual ${civilLawPart4Visuals.length}`)
}
if (actualSet.size !== actualKeys.length) {
  const duplicates = actualKeys.filter((key, index) => actualKeys.indexOf(key) !== index)
  throw new Error(`PART 4 다이어그램 key 중복: ${[...new Set(duplicates)].join(', ')}`)
}

const missing = expected.filter((key) => !actualSet.has(key))
const extra = actualKeys.filter((key) => !expectedSet.has(key))
if (missing.length || extra.length) {
  throw new Error(`PART 4 visual coverage mismatch\nmissing: ${missing.join(', ')}\nextra: ${extra.join(', ')}`)
}

const allowedTypes = new Set(civilLawPart4VisualTypes)
const usedTypes = new Set()
const signatures = new Set()
let bridgeCount = 0
let crossPartBridgeCount = 0

civilLawPart4Visuals.forEach((visual) => {
  if (!allowedTypes.has(visual.type)) throw new Error(`${visual.key}: 허용되지 않은 visual type ${visual.type}`)
  usedTypes.add(visual.type)
  if (!visual.question?.trim()) throw new Error(`${visual.key}: question 누락`)
  if (!visual.takeaway?.trim()) throw new Error(`${visual.key}: takeaway 누락`)
  if (!visual.keywords?.length) throw new Error(`${visual.key}: keyword 누락`)
  if (!visual.special?.general?.trim() || !visual.special?.special?.trim() || !visual.special?.basis?.trim()) {
    throw new Error(`${visual.key}: SPECIAL RULE 일반민법/특별법/법령근거 누락`)
  }
  if (!Array.isArray(visual.groups) || !visual.groups.length) throw new Error(`${visual.key}: groups 누락`)

  const nodes = visual.groups.flatMap((group) => {
    if (!group.label?.trim()) throw new Error(`${visual.key}: group label 누락`)
    if (!Array.isArray(group.nodes) || !group.nodes.length) throw new Error(`${visual.key}: ${group.label} nodes 누락`)
    return group.nodes
  })
  if (nodes.length < 2) throw new Error(`${visual.key}: 학습 다이어그램 node가 2개 미만입니다.`)

  const signature = JSON.stringify([visual.type, visual.groups])
  if (signatures.has(signature)) throw new Error(`${visual.key}: 다른 세부항목과 동일한 다이어그램 구조가 반복됩니다.`)
  signatures.add(signature)

  for (const bridge of visual.bridges || []) {
    bridgeCount += 1
    if (!allKeys.has(bridge.key)) throw new Error(`${visual.key}: 존재하지 않는 연결 대상 ${bridge.key}`)
    if (!bridge.label?.trim() || !bridge.reason?.trim()) throw new Error(`${visual.key}: 연결 label/reason 누락`)
    if (!bridge.key.startsWith('p4')) crossPartBridgeCount += 1
  }
})

if (usedTypes.size < 6) {
  throw new Error(`PART 4 다이어그램 유형 다양성 부족: ${[...usedTypes].join(', ')}`)
}
if (bridgeCount < 25) throw new Error(`PART 4 연결 수 부족: ${bridgeCount}개`)
if (crossPartBridgeCount < 18) throw new Error(`PART 4 cross-PART 연결 수 부족: ${crossPartBridgeCount}개`)

const mustHave = new Map([
  ['p4s1|대항력', 'timeline'],
  ['p4s1|우선변제권과 최우선변제권', 'compare'],
  ['p4s2|권리금보호', 'relation'],
  ['p4s3|대지사용권', 'relation'],
  ['p4s3|관리단과 관리인', 'relation'],
  ['p4s4|가등기담보권의 실행', 'timeline'],
  ['p4s5|2자간 명의신탁', 'relation'],
  ['p4s5|등기명의신탁', 'relation'],
  ['p4s5|계약명의신탁', 'relation'],
])

mustHave.forEach((type, key) => {
  const visual = civilLawPart4Visuals.find((item) => item.key === key)
  if (!visual || visual.type !== type) throw new Error(`${key}: 핵심 다이어그램 유형 ${type}이 필요합니다.`)
})

const requiredKeywords = [
  ['p4s1|대항력', ['인도', '주민등록', '다음 날']],
  ['p4s2|대항력', ['인도', '사업자등록', '다음 날']],
  ['p4s4|가등기담보권의 실행', ['청산기간 2개월', '청산금']],
  ['p4s5|계약명의신탁', ['매도인 선의', '물권변동']],
]

requiredKeywords.forEach(([key, words]) => {
  const visual = civilLawPart4Visuals.find((item) => item.key === key)
  words.forEach((word) => {
    if (!visual?.keywords?.includes(word)) throw new Error(`${key}: 핵심 keyword 누락 ${word}`)
  })
})

console.log(`Civil PART 4 visuals verified: ${civilLawPart4Visuals.length}/31 topics · ${usedTypes.size} visual types · ${bridgeCount} bridges (${crossPartBridgeCount} cross-PART) · SPECIAL RULE 31/31.`)
