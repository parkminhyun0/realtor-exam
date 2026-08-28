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

if (exam37SubjectIds.length !== 6 || new Set(exam37SubjectIds).size !== 6) {
  fail(`제37회 법령 기준 과목 수 불일치: ${exam37SubjectIds.length}/6`)
}

for (const subjectId of expectedIds) {
  if (!exam37SubjectIds.includes(subjectId)) fail(`제37회 법령 기준 과목 누락: ${subjectId}`)
  if (!subjectLawOrder.includes(subjectId)) fail(`lawSources 과목 순서와 불일치: ${subjectId}`)

  const entry = exam37LawDifferences[subjectId]
  if (!entry?.title?.trim() || !entry?.summary?.trim()) fail(`${subjectId}: 과목 법령 비교 설명 누락`)
  if (!Array.isArray(entry.changes) || entry.changes.length < 1) fail(`${subjectId}: 개정법 비교 카드 없음`)

  for (const change of entry.changes) {
    for (const field of ['law', 'amendment', 'before', 'after', 'examImpact', 'source']) {
      if (!String(change[field] || '').trim()) fail(`${subjectId}: ${change.law || 'unknown'} ${field} 누락`)
    }
    if (!change.source.startsWith('https://www.law.go.kr/')) {
      fail(`${subjectId}: 국가법령정보센터가 아닌 source URL 발견: ${change.source}`)
    }
  }
}

if (!exam37LawRule.examBasis.includes('2026년에 공포·개정된 법령')) {
  fail('시험 기준에 “2026년에 공포·개정된 법령” 제외 원칙이 없습니다.')
}
if (!exam37LawRule.examBasis.includes('개정 전 규정')) {
  fail('시험 기준에 “개정 전 규정” 적용 원칙이 없습니다.')
}
if (!exam37LawRule.amendmentBasis.includes('별도 비교')) {
  fail('2026 개정법 별도 비교 원칙이 없습니다.')
}
if (!exam37LawRule.scopeNote.includes('2025년에 공포되어 2026년에 시행')) {
  fail('2025 공포/2026 시행 규정과 2026 개정 규정을 구분하는 scope note가 없습니다.')
}

const dataSource = read('src/data/examLawRegime.js')
for (const marker of [
  '공인중개사협회',
  '한국공인중개사협회',
  '45시간',
  '상속권 상실',
  '교육환경평가',
  '재해영향평가',
  '한국농어촌공사',
  '부동산등기법',
  '2025.1.31',
  '43%',
  '44%',
  '45%',
  '2026.5.9',
]) {
  if (!dataSource.includes(marker)) fail(`개정 전·후 핵심 차이 누락: ${marker}`)
}

const component = read('src/ExamLawRegimeNotice.jsx')
for (const marker of [
  'data-exam-law-regime="37"',
  '37회 시험 적용 · 개정 전',
  '2026 개정법 · 비교 전용',
  '2026 개정법 차이 보기',
  '국가법령정보센터 ↗',
]) {
  if (!component.includes(marker)) fail(`제37회 법령 안내 UI 누락: ${marker}`)
}

const app = read('src/App.jsx')
if (!app.includes("import ExamLawRegimeNotice from './ExamLawRegimeNotice'")) {
  fail('App.jsx에 ExamLawRegimeNotice import가 없습니다.')
}
if (!app.includes("<ExamLawRegimeNotice subjectId={route || 'all'} />")) {
  fail('대시보드/전 과목 공통 법령 안내 렌더링이 없습니다.')
}
if (app.includes('과목별 현행 법령 기준일은 각 학습 페이지에 별도 표기합니다.')) {
  fail('기존 “현행 법령 기준” footer가 남아 제37회 시험 기준과 충돌합니다.')
}
if (!app.includes('제37회 시험 본문은 2026년 개정 전 법령을 우선')) {
  fail('footer에 제37회 개정 전 법령 우선 원칙이 없습니다.')
}

const css = read('src/exam-law-regime.css')
for (const marker of [
  '.exam-law-regime',
  '.exam-law-diff-grid',
  '@media (max-width: 980px)',
  '@media (max-width: 620px)',
]) {
  if (!css.includes(marker)) fail(`제37회 법령 안내 반응형 CSS 누락: ${marker}`)
}

const totalChanges = expectedIds.reduce((sum, id) => sum + exam37LawDifferences[id].changes.length, 0)
console.log('제37회 전과목 법령 기준 AUDIT PASS: 6/6 과목')
console.log(`개정법 before/after 비교 카드: ${totalChanges}개`)
console.log('시험 정답 = 2026 공포·개정분 제외 / 개정 전 규정')
console.log('2026 개정법 = 과목별 before/after 비교 전용')
console.log('2025 공포 후 2026 시행 규정은 자동 제외하지 않는 scope guard 확인')
