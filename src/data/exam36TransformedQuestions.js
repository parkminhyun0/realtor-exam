import { exam36TheoryQuestions, exam36CivilQuestions } from './exam36FirstSession'
import { exam36BrokerageQuestions, exam36PublicLawQuestions } from './exam36SecondFirstSession'
import { exam36RegistrationQuestions, exam36TaxQuestions } from './exam36SecondSecondSession'

export const EXAM36_QNET_URL = 'https://www.q-net.or.kr/cst003.do?artlSeq=5247125&boardId=Q004&gId=08&gSite=L&id=cst00302&menuType=cst00309'

const pageMaps = {
  'real-estate-theory': [[1, 8, 1], [9, 15, 2], [16, 22, 3], [23, 29, 4], [30, 35, 5], [36, 40, 6]],
  'civil-law': [[41, 46, 7], [47, 53, 8], [54, 60, 9], [61, 67, 10], [68, 74, 11], [75, 80, 12]],
  'brokerage-law': [[1, 6, 1], [7, 13, 2], [14, 21, 3], [22, 28, 4], [29, 34, 5], [35, 40, 6]],
  'public-law': [[41, 47, 7], [48, 54, 8], [55, 60, 9], [61, 66, 10], [67, 73, 11], [74, 80, 12]],
  'registration-law': [[1, 8, 1], [9, 15, 2], [16, 24, 3]],
  'tax-law': [[25, 30, 4], [31, 35, 5], [36, 40, 6]],
}

const paperMeta = {
  'real-estate-theory': { label: '1차 1교시 · 부동산학개론', sourceFile: '2025년 제36회 공인중개사 1차 1교시 문제지' },
  'civil-law': { label: '1차 1교시 · 민법 및 민사특별법', sourceFile: '2025년 제36회 공인중개사 1차 1교시 문제지' },
  'brokerage-law': { label: '2차 1교시 · 공인중개사법령 및 중개실무', sourceFile: '2025년 제36회 공인중개사 2차 1교시 문제지' },
  'public-law': { label: '2차 1교시 · 부동산공법', sourceFile: '2025년 제36회 공인중개사 2차 1교시 문제지' },
  'registration-law': { label: '2차 2교시 · 부동산공시법', sourceFile: '2025년 제36회 공인중개사 2차 2교시 문제지' },
  'tax-law': { label: '2차 2교시 · 부동산세법', sourceFile: '2025년 제36회 공인중개사 2차 2교시 문제지' },
}

function sourcePage(subjectId, sourceNo) {
  const row = pageMaps[subjectId]?.find(([start, end]) => sourceNo >= start && sourceNo <= end)
  return row?.[2] ?? null
}

function enrich(subjectId, items) {
  return items.map((item) => ({
    ...item,
    subjectId,
    sourcePage: sourcePage(subjectId, item.sourceNo),
    ...paperMeta[subjectId],
  }))
}

export const exam36QuestionBank = {
  'real-estate-theory': enrich('real-estate-theory', exam36TheoryQuestions),
  'civil-law': enrich('civil-law', exam36CivilQuestions),
  'brokerage-law': enrich('brokerage-law', exam36BrokerageQuestions),
  'public-law': enrich('public-law', exam36PublicLawQuestions),
  'registration-law': enrich('registration-law', exam36RegistrationQuestions),
  'tax-law': enrich('tax-law', exam36TaxQuestions),
}

export const exam36SubjectCounts = Object.fromEntries(
  Object.entries(exam36QuestionBank).map(([subjectId, items]) => [subjectId, items.length]),
)

export const exam36TotalCount = Object.values(exam36QuestionBank).reduce((sum, items) => sum + items.length, 0)

export function getExam36Questions(subjectId) {
  return exam36QuestionBank[subjectId] || []
}
