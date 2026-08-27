import {
  civilLawDeepPointGuides,
  civilLawPastQuestionLibrary,
} from '../src/data/civilLawDeepStudy.js'
import {
  civilLawPastQuestionFixups,
  civilLawPastQuestionKeyOverrides,
} from '../src/data/civilLawDeepStudyFixups.js'

const library = {
  ...civilLawPastQuestionLibrary,
  ...civilLawPastQuestionFixups,
}

const expectedPointIds = [
  ...Array.from({ length: 6 }, (_, i) => `p1s${i + 1}`),
  ...Array.from({ length: 6 }, (_, i) => `p2s${i + 1}`),
  ...Array.from({ length: 6 }, (_, i) => `p3s${i + 1}`),
  ...Array.from({ length: 5 }, (_, i) => `p4s${i + 1}`),
]

const errors = []

for (const pointId of expectedPointIds) {
  const guide = civilLawDeepPointGuides[pointId]
  if (!guide) {
    errors.push(`${pointId}: 상세 해설 누락`)
    continue
  }

  if (!guide.headline || String(guide.headline).length < 15) errors.push(`${pointId}: headline 부족`)
  if (!Array.isArray(guide.overview) || guide.overview.length < 2) errors.push(`${pointId}: 상세 설명은 최소 2문단 필요`)
  if (!Array.isArray(guide.framework) || guide.framework.length < 4) errors.push(`${pointId}: 핵심 구조는 최소 4개 필요`)
  if (!Array.isArray(guide.cases) || guide.cases.length < 2) errors.push(`${pointId}: 판례·사례는 최소 2개 필요`)

  const keys = civilLawPastQuestionKeyOverrides[pointId] || guide.questionKeys || []
  if (keys.length !== 4) errors.push(`${pointId}: 기출문제 키는 정확히 4개여야 함 (${keys.length})`)
  if (new Set(keys).size !== 4) errors.push(`${pointId}: 기출문제 4개는 서로 다른 문항이어야 함`)

  for (const key of keys) {
    const item = library[key]
    if (!item) {
      errors.push(`${pointId}: 존재하지 않는 기출 키 ${key}`)
      continue
    }
    if (!item.officialUrl?.includes('q-net.or.kr')) errors.push(`${pointId}/${key}: Q-Net 공식 출처 누락`)
    if (!item.year || !item.round || !item.number || !item.title || !item.focus) errors.push(`${pointId}/${key}: 기출 메타데이터 부족`)
  }
}

const actualPointIds = Object.keys(civilLawDeepPointGuides)
if (actualPointIds.length !== 23) errors.push(`상세 해설 POINT 수가 23개가 아님: ${actualPointIds.length}`)

if (errors.length) {
  console.error('Civil deep-study verification failed:')
  errors.forEach((error) => console.error(`- ${error}`))
  process.exit(1)
}

console.log(`Civil deep-study verified: ${actualPointIds.length} POINTs × 4 past questions, detailed explanations/cases present.`)
