import fs from 'node:fs'
import { brokerageLawContent, brokerageLawParts, brokerageLawPointCount, brokerageLawSource } from '../src/data/brokerageLaw.js'
import { exam36BrokerageQuestions } from '../src/data/exam36SecondFirstSession.js'
import { subjectLawSources } from '../src/data/lawSources.js'
import { allSubjects } from '../src/data/subjects.js'

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
const fail = (message) => { throw new Error(message) }

if (brokerageLawParts.length !== 6) fail(`PART 수 불일치: ${brokerageLawParts.length}/6`)
if (brokerageLawPointCount !== 20) fail(`POINT 수 불일치: ${brokerageLawPointCount}/20`)

const points = brokerageLawParts.flatMap((part) => part.points)
if (new Set(points.map((point) => point.id)).size !== 20) fail('POINT id 중복')
for (const point of points) {
  if (!point.title || !Array.isArray(point.topics) || !point.topics.length) fail(`${point.id}: 세부 목차 누락`)
}

const readyIds = Object.keys(brokerageLawContent)
const expectedReady = ['b1s1', 'b1s2', 'b1s3', 'b2s1', 'b2s2', 'b2s3', 'b2s4']
if (readyIds.length !== expectedReady.length || expectedReady.some((id) => !readyIds.includes(id))) {
  fail(`1차 상세본문 범위 불일치: ${readyIds.join(', ')}`)
}

for (const id of expectedReady) {
  const content = brokerageLawContent[id]
  for (const field of ['headline', 'summary', 'legalBases', 'examCore', 'rows', 'traps', 'memory', 'ox']) {
    const value = content[field]
    if (Array.isArray(value) ? !value.length : !String(value || '').trim()) fail(`${id}: ${field} 누락`)
  }
  for (const reference of content.legalBases) {
    if (reference.lawName !== '공인중개사법') fail(`${id}: 1차 상세본문의 주근거법령 오류 ${reference.lawName}`)
    if (!Array.isArray(reference.articles) || !reference.articles.length) fail(`${id}: 법조문 누락`)
    for (const article of reference.articles) {
      if (!/^제\d+조(?:의\d+)?$/.test(article)) fail(`${id}: 조문 형식 오류 ${article}`)
    }
  }
}

const joined = JSON.stringify(brokerageLawContent)
for (const marker of ['5년', '3년', '300만원', '5배', '10일', '3개월', '6개월']) {
  if (!joined.includes(marker)) fail(`시험 핵심 숫자 누락: ${marker}`)
}
for (const forbidden of ['한국공인중개사협회', '2026.8.18', '2026.8.28']) {
  if (joined.includes(forbidden)) fail(`6월 이후 개정내용이 중개사법 시험본문에 누출됨: ${forbidden}`)
}

if (!brokerageLawSource.version.includes('법률 제21024호') || !brokerageLawSource.version.includes('2026.2.15 시행')) {
  fail('업로드 공인중개사법 기준 버전 표기 누락')
}
if (!brokerageLawSource.examRule.includes('2026.5.31')) fail('제37회 컷오프 표기 누락')

if (exam36BrokerageQuestions.length !== 40) fail(`제36회 중개사법 기출변형 연결 불일치: ${exam36BrokerageQuestions.length}/40`)

const lawSource = subjectLawSources['brokerage-law']
if (!lawSource) fail('lawSources에 brokerage-law 누락')
for (const law of ['공인중개사법', '공인중개사법 시행령', '공인중개사법 시행규칙', '부동산 거래신고 등에 관한 법률']) {
  if (!lawSource.laws.some((item) => item.name === law)) fail(`법령 팝업 source 누락: ${law}`)
}

const subject = allSubjects.find((item) => item.id === 'brokerage-law')
if (!subject || !subject.status.includes('공개')) fail('대시보드 중개사법 공개 상태 누락')
if (subject.description.includes('정규 본문 구축 중')) fail('기존 placeholder 설명이 남아 있음')

const app = read('src/App.jsx')
for (const marker of [
  "import BrokerageLawPage from './BrokerageLawPage'",
  "route === 'brokerage-law'",
  '<BrokerageLawPage',
]) if (!app.includes(marker)) fail(`App 정규 라우트 누락: ${marker}`)

const page = read('src/BrokerageLawPage.jsx')
for (const marker of [
  'LawTextViewer',
  "subjectId: 'brokerage-law'",
  'data-mobile-toc',
  'data-mobile-toc-content',
  '제37회 시험 기준 법령 바로보기',
  '상세 본문 {readyCount}개 공개',
]) if (!page.includes(marker)) fail(`중개사법 페이지 연결 누락: ${marker}`)

console.log('공인중개사법령 정규페이지 BASELINE AUDIT PASS')
console.log('- 6 PART · 20 POINT 목차 구축')
console.log('- PART 1~2 상세본문 7/7 POINT 공개 · 조문/EXAM CORE/표/함정/암기/OX 연결')
console.log('- 핵심 숫자: 부정행위 5년 · 취소/형/벌금 3년 · 300만원 · 보조원 5배 · 이전 10일 · 휴업 3/6개월')
console.log('- 업로드 공인중개사법 법률 제21024호(2026.2.15 시행) + 제37회 2026.5.31 컷오프 표기 확인')
console.log('- 제36회 기출변형 40문항 · 법령 팝업 · 모바일 목차 연결 확인')
