import { taxLawPart2Point01Leaves } from './data/taxLawPart2Point01Leaves.js'
import { taxLawContent } from './data/taxLawContent.js'

const replacements = [
  ['2025.12.31 개정분까지 반영한', '2026.5.31까지 공포·개정된 기준을 반영한'],
  ['2025년까지 개정된 규정', '2026.5.31까지 공포·개정된 규정'],
]

for (const group of taxLawPart2Point01Leaves) {
  for (const item of group.topics) {
    for (const field of ['core', 'exam', 'trap', 'memory']) {
      let value = String(item[field] || '')
      for (const [before, after] of replacements) value = value.replaceAll(before, after)
      item[field] = value
    }
  }
}

const examLawVersion = '제37회 시험 기준 · 2026.5.31까지 공포·개정분 적용 · 2026.6.1 이후 개정분 비교 전용'
for (const content of Object.values(taxLawContent)) {
  content.lawVersion = examLawVersion
}
