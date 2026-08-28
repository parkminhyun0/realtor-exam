import fs from 'node:fs'
import { allSubjects } from '../src/data/subjects.js'
import {
  brokerageLawCategories,
  brokerageMajorCount,
  brokerageMiddleCount,
  brokerageLeafCount,
  brokerageReadyMiddleCount,
  brokerageReadyLeafCount,
} from '../src/data/brokerageLawHierarchy.js'
import { taxLawParts } from '../src/data/taxLaw.js'
import { civilLawParts } from '../src/data/civilLaw.js'

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
const fail = (message) => { throw new Error(message) }

const app = read('src/App.jsx')
const routes = new Map([
  ['real-estate-theory', 'RealEstateTheoryPage'],
  ['civil-law', 'CivilLawPage'],
  ['brokerage-law', 'BrokerageLawPage'],
  ['public-law', 'PublicLawPage'],
  ['registration-law', 'RegistrationLawPage'],
  ['tax-law', 'TaxLawPage'],
])

if (allSubjects.length !== 6) fail(`과목 수 불일치: ${allSubjects.length}/6`)
for (const subject of allSubjects) {
  const component = routes.get(subject.id)
  if (!component) fail(`${subject.id}: maturity route 정의 누락`)
  if (!app.includes(`route === '${subject.id}'`)) fail(`${subject.id}: App 정규 route 누락`)
  if (!app.includes(`<${component}`)) fail(`${subject.id}: ${component} 연결 누락`)
}

const civilPointCount = civilLawParts.reduce((sum, part) => sum + part.points.length, 0)
const taxPointCount = taxLawParts.reduce((sum, part) => sum + part.points.length, 0)
if (civilPointCount !== 23) fail(`민법 POINT 기준선 변경: ${civilPointCount}/23`)
if (taxPointCount !== 9) fail(`세법 POINT 기준선 변경: ${taxPointCount}/9`)
if (brokerageLawCategories.length !== 3) fail(`중개사법 카테고리 기준선 변경: ${brokerageLawCategories.length}/3`)
if (brokerageMajorCount !== 16) fail(`중개사법 대분류 기준선 변경: ${brokerageMajorCount}/16`)
if (brokerageMiddleCount !== 59) fail(`중개사법 중분류 기준선 변경: ${brokerageMiddleCount}/59`)
if (brokerageLeafCount !== 344) fail(`중개사법 소분류 기준선 변경: ${brokerageLeafCount}/344`)
if (brokerageReadyMiddleCount !== 36 || brokerageReadyLeafCount !== 231) fail(`중개사법 공인중개사법령 상세화 기준선 변경: ${brokerageReadyMiddleCount}/36 · ${brokerageReadyLeafCount}/231`)

const subjectDataMarkers = [
  ['real-estate-theory', 'src/data/realEstateTheoryContent.js'],
  ['civil-law', 'src/data/civilLawContent.js'],
  ['brokerage-law', 'src/data/brokerageLawHierarchy.js'],
  ['brokerage-law', 'src/data/brokerageLawExpandedContent.js'],
  ['public-law', 'src/data/publicLaw.js'],
  ['registration-law', 'src/data/registrationLawDeepDive.js'],
  ['tax-law', 'src/data/taxLawContent.js'],
]
for (const [subjectId, path] of subjectDataMarkers) {
  if (!fs.existsSync(new URL(`../${path}`, import.meta.url))) fail(`${subjectId}: 정규 학습 데이터 파일 누락 ${path}`)
}

console.log('전 과목 정규페이지 MATURITY AUDIT PASS: 6/6')
console.log('- 중개사법 4단계 구조: 3 카테고리 · 16 대분류 · 59 중분류 · 344 소분류')
console.log('- 공인중개사법령 카테고리 상세화: 36/36 중분류 · 231/231 소분류 구조 연결')
console.log(`- 비교 기준선: 민법 ${civilPointCount} POINT · 세법 ${taxPointCount} POINT · 중개사법 4단계 ${brokerageLeafCount} 소분류`)
console.log('- 다음 상세화 우선순위: 거래신고법령 52 소분류 → 중개실무 61 소분류')
