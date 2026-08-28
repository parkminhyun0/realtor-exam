import fs from 'node:fs'
import { exam37LawDifferences, exam37LawRule, exam37SubjectIds } from '../src/data/examLawRegime.js'
import { subjectLawOrder } from '../src/data/lawSources.js'

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
const fail = (message) => { throw new Error(message) }

const expectedIds = [
  'real-estate-theory',
  'civil-law',
  'brokerage-law',
  'public-law',
  'registration-law',
  'tax-law',
]

if (exam37SubjectIds.length !== 6 || new Set(exam37SubjectIds).size !== 6) fail(`제37회 법령 기준 과목 수 불일치: ${exam37SubjectIds.length}/6`)

const validStatuses = new Set(['applied', 'comparison', 'unchanged'])
for (const subjectId of expectedIds) {
  if (!exam37SubjectIds.includes(subjectId)) fail(`제37회 법령 기준 과목 누락: ${subjectId}`)
  if (!subjectLawOrder.includes(subjectId)) fail(`lawSources 과목 순서와 불일치: ${subjectId}`)
  const entry = exam37LawDifferences[subjectId]
  if (!entry?.title?.trim() || !entry?.summary?.trim()) fail(`${subjectId}: 과목 법령 비교 설명 누락`)
  if (!Array.isArray(entry.changes) || entry.changes.length < 1) fail(`${subjectId}: 개정법 비교 카드 없음`)
  for (const change of entry.changes) {
    for (const field of ['law', 'amendment', 'status', 'before', 'after', 'examImpact', 'source']) {
      if (!String(change[field] || '').trim()) fail(`${subjectId}: ${change.law || 'unknown'} ${field} 누락`)
    }
    if (!validStatuses.has(change.status)) fail(`${subjectId}: ${change.law} 알 수 없는 status ${change.status}`)
    if (!change.source.startsWith('https://www.law.go.kr/')) fail(`${subjectId}: 국가법령정보센터가 아닌 source URL 발견: ${change.source}`)
  }
}

if (exam37LawRule.cutoff !== '2026.5.31') fail(`제37회 컷오프 불일치: ${exam37LawRule.cutoff}`)
if (!exam37LawRule.examBasis.includes('2026년 5월 31일까지')) fail('시험 기준에 2026.5.31 포함 원칙이 없습니다.')
if (!exam37LawRule.amendmentBasis.includes('2026년 6월 1일 이후')) fail('6월 이후 개정분 비교 전용 원칙이 없습니다.')
if (!exam37LawRule.scopeNote.includes('시행일이 아니라 공포·개정일')) fail('공포·개정일 판정축 설명이 없습니다.')

const totalChanges = expectedIds.reduce((sum, id) => sum + exam37LawDifferences[id].changes.length, 0)
if (totalChanges !== 12) fail(`개정법 비교 카드 수 불일치: ${totalChanges}/12`)

const statuses = {
  theory: exam37LawDifferences['real-estate-theory'].changes[0]?.status,
  civil: exam37LawDifferences['civil-law'].changes[0]?.status,
  brokerageLawFeb: exam37LawDifferences['brokerage-law'].changes[0]?.status,
  brokerageDecreeAug: exam37LawDifferences['brokerage-law'].changes[1]?.status,
  brokerageEducation: exam37LawDifferences['brokerage-law'].changes[2]?.status,
  housing: exam37LawDifferences['public-law'].changes[0]?.status,
  farmland: exam37LawDifferences['public-law'].changes[1]?.status,
  registration: exam37LawDifferences['registration-law'].changes[1]?.status,
  taxProperty: exam37LawDifferences['tax-law'].changes[0]?.status,
  taxComprehensive: exam37LawDifferences['tax-law'].changes[1]?.status,
  taxIncome: exam37LawDifferences['tax-law'].changes[2]?.status,
}

for (const [key, value] of Object.entries({
  theory: 'applied',
  civil: 'applied',
  brokerageLawFeb: 'applied',
  brokerageDecreeAug: 'comparison',
  brokerageEducation: 'applied',
  housing: 'applied',
  farmland: 'comparison',
  registration: 'applied',
  taxProperty: 'applied',
  taxComprehensive: 'applied',
  taxIncome: 'applied',
})) if (statuses[key] !== value) fail(`컷오프 상태 불일치 ${key}: ${statuses[key]}/${value}`)

const brokerageChanges = exam37LawDifferences['brokerage-law'].changes
if (!brokerageChanges[0].amendment.includes('2026.2.27') || !brokerageChanges[0].after.includes('한국공인중개사협회')) fail('중개사법 2026.2.27 법률 개정 적용카드 누락')
if (!brokerageChanges[0].examImpact.includes('제37회 본문에 적용')) fail('중개사법 법률 개정의 제37회 적용 판정 누락')
if (!brokerageChanges[1].amendment.includes('2026.8.18') || brokerageChanges[1].status !== 'comparison') fail('중개사법 8월 시행령 후속정비 비교카드 누락')
if (!brokerageChanges[2].after.includes('45시간')) fail('실무교육 45시간 적용카드 누락')

const dataSource = read('src/data/examLawRegime.js')
for (const marker of [
  "cutoff: '2026.5.31'",
  '공인중개사협회',
  '한국공인중개사협회',
  '법정단체화',
  '45시간',
  '상속권 상실',
  '교육환경평가',
  '재해영향평가',
  '한국농어촌공사',
  '통합특별시',
  '43%', '44%', '45%', '2026.5.9',
]) if (!dataSource.includes(marker)) fail(`개정 전·후 핵심 차이 누락: ${marker}`)

const component = read('src/ExamLawRegimeNotice.jsx')
for (const marker of [
  'data-exam-law-regime="37"',
  'data-exam-law-cutoff={exam37LawRule.cutoff}',
  '37회 시험 적용 · 개정 전',
  '37회 시험 적용 · 개정 후',
  '6월 이후 개정 · 비교 전용',
  '개정법 적용·차이 보기',
  '시험 적용 · ~ 2026.5.31',
  '2026.6.1~ · 비교만',
  '국가법령정보센터 ↗',
]) if (!component.includes(marker)) fail(`제37회 법령 안내 UI 누락: ${marker}`)

const app = read('src/App.jsx')
if (!app.includes("import ExamLawRegimeNotice from './ExamLawRegimeNotice'")) fail('App.jsx에 ExamLawRegimeNotice import가 없습니다.')
if (!app.includes("<ExamLawRegimeNotice subjectId={route || 'all'} />")) fail('대시보드/전 과목 공통 법령 안내 렌더링이 없습니다.')
if (!app.includes('2026.5.31까지 공포·개정된 법령을 적용')) fail('footer에 2026.5.31 컷오프가 없습니다.')
if (!app.includes('2026.6.1 이후 개정법')) fail('footer에 6월 이후 비교 전용 원칙이 없습니다.')

const css = read('src/exam-law-regime.css')
for (const marker of ['.exam-law-regime', '.exam-law-diff-grid', '@media (max-width: 980px)', '@media (max-width: 620px)']) if (!css.includes(marker)) fail(`제37회 법령 안내 반응형 CSS 누락: ${marker}`)

console.log('제37회 전과목 법령 컷오프 AUDIT PASS: 6/6 과목')
console.log(`개정법 적용·비교 카드: ${totalChanges}개`)
console.log('시험 적용 = 2026.5.31까지 공포·개정분')
console.log('중개사법 = 2026.2.27 법률 개정(한국공인중개사협회 법정단체화) 적용 / 2026.8.18 시행령 후속정비 비교 전용')
console.log('비교 전용 = 2026.6.1 이후 공포·개정분')
console.log('판정축 = 시행일이 아니라 공포·개정일')
