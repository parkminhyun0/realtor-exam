import { realEstateTheoryCalculations } from '../src/data/realEstateTheoryCalculations.js'
import { getPastQuestionsForCard } from '../src/data/realEstateTheoryPastQuestions.js'

const failures = []
let cardCount = 0
let questionCount = 0

for (const [chapterId, chapter] of Object.entries(realEstateTheoryCalculations)) {
  for (const card of chapter.cards || []) {
    cardCount += 1
    const questions = getPastQuestionsForCard(card.title)
    questionCount += questions.length

    if (questions.length !== 2) {
      failures.push(`${chapterId} · ${card.title}: 기출 ${questions.length}개`)
      continue
    }

    const ids = questions.map((question) => question?.id).filter(Boolean)
    if (ids.length !== 2 || new Set(ids).size !== 2) {
      failures.push(`${chapterId} · ${card.title}: 서로 다른 기출 2문제가 아님`)
    }
  }
}

if (failures.length) {
  console.error('부동산학개론 계산카드 기출 커버리지 검증 실패')
  failures.forEach((failure) => console.error(`- ${failure}`))
  process.exit(1)
}

console.log(`부동산학개론 계산카드 검증 PASS: ${cardCount}개 카드 · ${questionCount}개 기출 연결 (카드당 2문제)`)
