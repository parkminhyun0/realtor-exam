import { civilLawParts } from '../src/data/civilLawToc3Level.js'
import {
  civilLawPart1Visuals,
  civilLawPart1VisualTypes,
} from '../src/data/civilLawPart1Visuals.js'

const part1 = civilLawParts.find((part) => part.id === 'part1')
if (!part1) throw new Error('PART 1 민법총칙을 찾을 수 없습니다.')

const expected = part1.points.flatMap((point) => point.topics.map((topic) => `${point.id}|${topic}`))
const expectedSet = new Set(expected)
const actualKeys = civilLawPart1Visuals.map((item) => item.key)
const actualSet = new Set(actualKeys)

if (expected.length !== 52) {
  throw new Error(`PART 1 교재 목차가 52개 세부항목이어야 합니다. 현재 ${expected.length}개`)
}

if (civilLawPart1Visuals.length !== expected.length) {
  throw new Error(`PART 1 다이어그램 수 불일치: expected ${expected.length}, actual ${civilLawPart1Visuals.length}`)
}

if (actualSet.size !== actualKeys.length) {
  const duplicates = actualKeys.filter((key, index) => actualKeys.indexOf(key) !== index)
  throw new Error(`PART 1 다이어그램 key 중복: ${[...new Set(duplicates)].join(', ')}`)
}

const missing = expected.filter((key) => !actualSet.has(key))
const extra = actualKeys.filter((key) => !expectedSet.has(key))
if (missing.length || extra.length) {
  throw new Error(`PART 1 visual coverage mismatch\nmissing: ${missing.join(', ')}\nextra: ${extra.join(', ')}`)
}

const allowedTypes = new Set(civilLawPart1VisualTypes)
const usedTypes = new Set()
const signatures = new Set()

civilLawPart1Visuals.forEach((visual) => {
  if (!allowedTypes.has(visual.type)) throw new Error(`${visual.key}: 허용되지 않은 visual type ${visual.type}`)
  usedTypes.add(visual.type)

  if (!visual.question?.trim()) throw new Error(`${visual.key}: question 누락`)
  if (!visual.takeaway?.trim()) throw new Error(`${visual.key}: takeaway 누락`)
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
})

if (usedTypes.size < 6) {
  throw new Error(`PART 1 다이어그램 유형 다양성 부족: ${[...usedTypes].join(', ')}`)
}

const mustHave = new Map([
  ['p1s2|이중매매의 법률관계', 'relation'],
  ['p1s3|비진의표시', 'decision'],
  ['p1s4|대리의 3면관계', 'relation'],
  ['p1s4|계약의 무권대리', 'timeline'],
  ['p1s4|표현대리', 'compare'],
  ['p1s4|제126조의 표현대리', 'decision'],
  ['p1s5|무효와 취소의 차이점', 'compare'],
  ['p1s5|토지거래허가구역 내의 토지거래 계약', 'timeline'],
  ['p1s6|조건의 의의', 'compare'],
])

mustHave.forEach((type, key) => {
  const visual = civilLawPart1Visuals.find((item) => item.key === key)
  if (!visual || visual.type !== type) throw new Error(`${key}: 핵심 다이어그램 유형 ${type}이 필요합니다.`)
})

console.log(`Civil PART 1 visuals verified: ${civilLawPart1Visuals.length}/52 topics · ${usedTypes.size} visual types · no repeated diagram signatures.`)
