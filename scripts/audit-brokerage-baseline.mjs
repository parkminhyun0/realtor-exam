import fs from 'node:fs'
import {
  brokerageLawCategories,
  brokerageMajorCount,
  brokerageMiddleItems,
  brokerageMiddleCount,
  brokerageLeafCount,
  brokerageReadyMiddleCount,
  brokerageReadyLeafCount,
} from '../src/data/brokerageLawHierarchy.js'
import { brokerageExamSource, brokerageExpandedContent, brokerageExpandedCount } from '../src/data/brokerageLawExpandedContent.js'
import { exam36BrokerageQuestions } from '../src/data/exam36SecondFirstSession.js'
import { subjectLawSources } from '../src/data/lawSources.js'
import { allSubjects } from '../src/data/subjects.js'

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
const fail = (message) => { throw new Error(message) }

if (brokerageLawCategories.length !== 3) fail(`카테고리 수 불일치: ${brokerageLawCategories.length}/3`)
if (brokerageMajorCount !== 16) fail(`대분류 수 불일치: ${brokerageMajorCount}/16`)
if (brokerageMiddleCount !== 59) fail(`중분류 수 불일치: ${brokerageMiddleCount}/59`)
if (brokerageLeafCount !== 344) fail(`소분류 수 불일치: ${brokerageLeafCount}/344`)
if (brokerageReadyMiddleCount !== 36) fail(`상세 중분류 수 불일치: ${brokerageReadyMiddleCount}/36`)
if (brokerageReadyLeafCount !== 231) fail(`상세 소분류 수 불일치: ${brokerageReadyLeafCount}/231`)
if (brokerageExpandedCount !== 36) fail(`상세본문 수 불일치: ${brokerageExpandedCount}/36`)

const allIds = []
for (const category of brokerageLawCategories) {
  if (!category.title || !category.majors.length) fail(`${category.id}: 카테고리 내용 누락`)
  allIds.push(category.id)
  for (const major of category.majors) {
    if (!major.title || !major.middles.length) fail(`${major.id}: 대분류 내용 누락`)
    allIds.push(major.id)
    for (const middle of major.middles) {
      if (!middle.title || !middle.leaves.length) fail(`${middle.id}: 중분류/소분류 누락`)
      allIds.push(middle.id)
      for (const leaf of middle.leaves) {
        if (!leaf.title) fail(`${leaf.id}: 소분류 제목 누락`)
        allIds.push(leaf.id)
      }
    }
  }
}
if (new Set(allIds).size !== allIds.length) fail('4단계 taxonomy id 중복')

const readyMiddles = brokerageMiddleItems.filter((item) => item.status === 'ready')
for (const middle of readyMiddles) {
  const content = brokerageExpandedContent[middle.id]
  if (!content) fail(`${middle.id}: 상세본문 누락`)
  for (const field of ['headline', 'summary', 'examCore', 'traps', 'memory', 'ox']) {
    const value = content[field]
    if (Array.isArray(value) ? !value.length : !String(value || '').trim()) fail(`${middle.id}: ${field} 누락`)
  }
  if (middle.category.id !== 'brokerage-act') fail(`${middle.id}: ready 범위가 공인중개사법령 밖으로 확장됨`)
  if (middle.lawName !== '공인중개사법') fail(`${middle.id}: 주근거법령 오류 ${middle.lawName}`)
  for (const article of middle.articles) {
    if (!/^제\d+조(?:의\d+)?$/.test(article)) fail(`${middle.id}: 조문 형식 오류 ${article}`)
  }
}

const joined = JSON.stringify({ taxonomy: brokerageLawCategories, content: brokerageExpandedContent, source: brokerageExamSource })
for (const marker of ['5년', '3년', '2년', '300만원', '5배', '10일', '6개월', '45시간', '7일', '2주일', '4억원', '2억원', '한국공인중개사협회']) {
  if (!joined.includes(marker)) fail(`시험 핵심 표지 누락: ${marker}`)
}
for (const taxOnly of ['조세총론', '취득세', '등록면허세', '재산세', '종합부동산세', '종합소득세', '양도소득세']) {
  if (joined.includes(taxOnly)) fail(`세법 전용 콘텐츠 혼입: ${taxOnly}`)
}
if (!brokerageExamSource.attached.includes('법률 제21024호') || !brokerageExamSource.attached.includes('2026.2.15')) fail('첨부 공인중개사법 기준 누락')
if (!brokerageExamSource.supplement.includes('법률 제21409호') || !brokerageExamSource.supplement.includes('2026.2.27')) fail('컷오프 내 협회 개정법 보완기준 누락')
if (!brokerageExamSource.subordinate.includes('45시간')) fail('시행령 실무교육 45시간 기준 누락')
if (!brokerageExamSource.cutoff.includes('2026.5.31')) fail('제37회 컷오프 표기 누락')

if (exam36BrokerageQuestions.length !== 40) fail(`제36회 중개사법 기출변형 연결 불일치: ${exam36BrokerageQuestions.length}/40`)

const lawSource = subjectLawSources['brokerage-law']
if (!lawSource) fail('lawSources에 brokerage-law 누락')
for (const law of ['공인중개사법', '공인중개사법 시행령', '공인중개사법 시행규칙', '부동산 거래신고 등에 관한 법률']) {
  if (!lawSource.laws.some((item) => item.name === law)) fail(`법령 팝업 source 누락: ${law}`)
}

const subject = allSubjects.find((item) => item.id === 'brokerage-law')
if (!subject || !subject.status.includes('공개')) fail('대시보드 중개사법 공개 상태 누락')

const page = read('src/BrokerageLawPage.jsx')
for (const marker of [
  'data-subject-page="brokerage-law"',
  'data-brokerage-hierarchy="4-level"',
  '카테고리 → 대분류 → 중분류 → 소분류',
  'brokerage-leaf-nav',
  'brokerage-leaf-card',
  'LawTextViewer',
  "subjectId: 'brokerage-law'",
  "import './brokerage-law.css'",
]) if (!page.includes(marker)) fail(`중개사법 4단계 UI 연결 누락: ${marker}`)

for (const crossSubjectMarker of ['tax-law-page', 'civil-law-page', 'tax-law-hero', 'tax-nav-', 'tax-leaf-', 'tax-detail-section', 'tax-exam-core', 'tax-law-articles']) {
  if (page.includes(crossSubjectMarker)) fail(`중개사법 페이지가 타 과목 runtime selector를 공유함: ${crossSubjectMarker}`)
}

const css = read('src/brokerage-law.css')
for (const marker of ['.brokerage-category', '.brokerage-major', '.brokerage-middle-nav', '.brokerage-leaf-nav', '.brokerage-leaf-card']) {
  if (!css.includes(marker)) fail(`4단계 전용 CSS 누락: ${marker}`)
}
if (css.includes('.tax-law-page') || css.includes('.civil-law-page')) fail('중개사법 CSS에 타 과목 runtime root가 혼입됨')

console.log('공인중개사법령 4단계 시험준비 AUDIT PASS')
console.log(`- 카테고리 ${brokerageLawCategories.length} · 대분류 ${brokerageMajorCount} · 중분류 ${brokerageMiddleCount} · 소분류 ${brokerageLeafCount}`)
console.log(`- 공인중개사법령 상세화 ${brokerageReadyMiddleCount}/${brokerageReadyMiddleCount} 중분류 · ${brokerageReadyLeafCount}/${brokerageReadyLeafCount} 소분류 구조 연결`)
console.log('- 첨부 법률 제21024호 + 2026.2.27 법률 제21409호 보완 + 시행령 실무교육 45시간 기준 확인')
console.log('- 핵심 숫자: 부정 5년 · 결격 3/2년 · 300만원 · 보조원 5배 · 이전 10일 · 전속 3개월/3년/7일/2주 · 확인설명 3년/계약서 5년 · 보증 4억/2억')
console.log('- 세법/민법 runtime 완전 분리 · 제36회 기출변형 40문항 연결 유지')
console.log('- 다음 상세화: 거래신고법령 52 소분류 + 중개실무 61 소분류')
