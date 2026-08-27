import { civilLawParts } from '../src/data/civilLawToc3Level.js'
import {
  civilLawPart3Visuals,
  civilLawPart3VisualTypes,
} from '../src/data/civilLawPart3Visuals.js'

const part3 = civilLawParts.find((part) => part.id === 'part3')
if (!part3) throw new Error('PART 3 계약법을 찾을 수 없습니다.')

const allKeys = new Set(civilLawParts.flatMap((part) => part.points.flatMap((point) => point.topics.map((topic) => `${point.id}|${topic}`))))
const expected = part3.points.flatMap((point) => point.topics.map((topic) => `${point.id}|${topic}`))
const expectedSet = new Set(expected)
const actualKeys = civilLawPart3Visuals.map((item) => item.key)
const actualSet = new Set(actualKeys)

if (expected.length !== 34) {
  throw new Error(`PART 3 교재 목차가 34개 세부항목이어야 합니다. 현재 ${expected.length}개`)
}

if (civilLawPart3Visuals.length !== expected.length) {
  throw new Error(`PART 3 다이어그램 수 불일치: expected ${expected.length}, actual ${civilLawPart3Visuals.length}`)
}

if (actualSet.size !== actualKeys.length) {
  const duplicates = actualKeys.filter((key, index) => actualKeys.indexOf(key) !== index)
  throw new Error(`PART 3 다이어그램 key 중복: ${[...new Set(duplicates)].join(', ')}`)
}

const missing = expected.filter((key) => !actualSet.has(key))
const extra = actualKeys.filter((key) => !expectedSet.has(key))
if (missing.length || extra.length) {
  throw new Error(`PART 3 visual coverage mismatch\nmissing: ${missing.join(', ')}\nextra: ${extra.join(', ')}`)
}

const allowedTypes = new Set(civilLawPart3VisualTypes)
const usedTypes = new Set()
const signatures = new Set()
let bridgeCount = 0
let crossPartBridgeCount = 0

civilLawPart3Visuals.forEach((visual) => {
  if (!allowedTypes.has(visual.type)) throw new Error(`${visual.key}: 허용되지 않은 visual type ${visual.type}`)
  usedTypes.add(visual.type)

  if (!visual.question?.trim()) throw new Error(`${visual.key}: question 누락`)
  if (!visual.takeaway?.trim()) throw new Error(`${visual.key}: takeaway 누락`)
  if (!Array.isArray(visual.groups) || !visual.groups.length) throw new Error(`${visual.key}: groups 누락`)
  if (!Array.isArray(visual.keywords) || !visual.keywords.length) throw new Error(`${visual.key}: 암기 keyword 누락`)

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
    if (!bridge.label?.trim() || !bridge.reason?.trim()) throw new Error(`${visual.key}: 연결 설명 누락 ${bridge.key}`)
    const targetPointId = bridge.key.split('|')[0]
    if (!targetPointId.startsWith('p3')) crossPartBridgeCount += 1
  }
})

if (usedTypes.size < 6) {
  throw new Error(`PART 3 다이어그램 유형 다양성 부족: ${[...usedTypes].join(', ')}`)
}

if (bridgeCount < 18 || crossPartBridgeCount < 12) {
  throw new Error(`PART 3 연결망 부족: bridges ${bridgeCount}, cross-part ${crossPartBridgeCount}`)
}

const mustHave = new Map([
  ['p3s1|계약의 종류', 'taxonomy'],
  ['p3s1|청약과 승낙의 의사표시', 'timeline'],
  ['p3s2|쌍무계약의 특질', 'relation'],
  ['p3s2|동시이행의 항변권', 'decision'],
  ['p3s2|제3자를 위한 계약', 'relation'],
  ['p3s3|해제와 해지의 비교', 'compare'],
  ['p3s3|해제의 효과', 'relation'],
  ['p3s4|매매 일반', 'relation'],
  ['p3s6|임차권의 대항력', 'flow'],
  ['p3s6|동의 있는 전대의 법률관계', 'relation'],
])

mustHave.forEach((type, key) => {
  const visual = civilLawPart3Visuals.find((item) => item.key === key)
  if (!visual || visual.type !== type) throw new Error(`${key}: 핵심 다이어그램 유형 ${type}이 필요합니다.`)
})

const contractKinds = civilLawPart3Visuals.find((item) => item.key === 'p3s1|계약의 종류')
for (const keyword of ['쌍무', '편무', '유상', '무상', '낙성', '요물', '요식', '불요식']) {
  if (!contractKinds?.keywords.includes(keyword)) throw new Error(`계약의 종류: 필수 암기 키워드 ${keyword} 누락`)
}

console.log(`Civil PART 3 visuals verified: ${civilLawPart3Visuals.length}/34 topics · ${usedTypes.size} visual types · ${bridgeCount} bridges (${crossPartBridgeCount} cross-part) · no repeated diagram signatures.`)
