import { civilLawParts } from '../src/data/civilLawToc3Level.js'
import {
  civilLawPart2Visuals,
  civilLawPart2VisualTypes,
} from '../src/data/civilLawPart2Visuals.js'

const part2 = civilLawParts.find((part) => part.id === 'part2')
if (!part2) throw new Error('PART 2 물권법을 찾을 수 없습니다.')

const expected = part2.points.flatMap((point) => point.topics.map((topic) => `${point.id}|${topic}`))
const expectedSet = new Set(expected)
const actualKeys = civilLawPart2Visuals.map((item) => item.key)
const actualSet = new Set(actualKeys)

if (expected.length !== 65) {
  throw new Error(`PART 2 교재 목차가 65개 세부항목이어야 합니다. 현재 ${expected.length}개`)
}

if (civilLawPart2Visuals.length !== expected.length) {
  throw new Error(`PART 2 다이어그램 수 불일치: expected ${expected.length}, actual ${civilLawPart2Visuals.length}`)
}

if (actualSet.size !== actualKeys.length) {
  const duplicates = actualKeys.filter((key, index) => actualKeys.indexOf(key) !== index)
  throw new Error(`PART 2 다이어그램 key 중복: ${[...new Set(duplicates)].join(', ')}`)
}

const missing = expected.filter((key) => !actualSet.has(key))
const extra = actualKeys.filter((key) => !expectedSet.has(key))
if (missing.length || extra.length) {
  throw new Error(`PART 2 visual coverage mismatch\nmissing: ${missing.join(', ')}\nextra: ${extra.join(', ')}`)
}

const allowedTypes = new Set(civilLawPart2VisualTypes)
const usedTypes = new Set()
const signatures = new Set()

civilLawPart2Visuals.forEach((visual) => {
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
  throw new Error(`PART 2 다이어그램 유형 다양성 부족: ${[...usedTypes].join(', ')}`)
}

const mustHave = new Map([
  ['p2s2|등기의 추정력', 'compare'],
  ['p2s2|중간생략등기', 'relation'],
  ['p2s3|점유보호청구권', 'flow'],
  ['p2s4|점유취득시효', 'timeline'],
  ['p2s4|취득시효완성 후의 법률관계', 'timeline'],
  ['p2s4|공동소유 일반', 'compare'],
  ['p2s5|관습법상의 법정지상권', 'decision'],
  ['p2s6|유치권의 의의와 성립요건', 'decision'],
  ['p2s6|제366조의 법정지상권', 'decision'],
  ['p2s6|공동저당', 'relation'],
  ['p2s6|근저당', 'compare'],
])

mustHave.forEach((type, key) => {
  const visual = civilLawPart2Visuals.find((item) => item.key === key)
  if (!visual || visual.type !== type) throw new Error(`${key}: 핵심 다이어그램 유형 ${type}이 필요합니다.`)
})

const timelineTopics = civilLawPart2Visuals.filter((item) => item.type === 'timeline').length
const relationTopics = civilLawPart2Visuals.filter((item) => item.type === 'relation').length
if (timelineTopics < 8 || relationTopics < 10) {
  throw new Error(`PART 2는 시간·권리관계 시각화 비중이 부족합니다. timeline=${timelineTopics}, relation=${relationTopics}`)
}

console.log(`Civil PART 2 visuals verified: ${civilLawPart2Visuals.length}/65 topics · ${usedTypes.size} visual types · timeline ${timelineTopics} · relation ${relationTopics} · no repeated diagram signatures.`)
