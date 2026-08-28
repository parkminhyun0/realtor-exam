import fs from 'node:fs'
import { allSubjects } from '../src/data/subjects.js'
import { brokerageLawContent, brokerageLawPointCount } from '../src/data/brokerageLaw.js'
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
if (brokerageLawPointCount !== 20) fail(`중개사법 POINT 기준선 변경: ${brokerageLawPointCount}/20`)
if (Object.keys(brokerageLawContent).length !== 7) fail('중개사법 1차 상세화 범위 변경')

const subjectDataMarkers = [
  ['real-estate-theory', 'src/data/realEstateTheoryContent.js'],
  ['civil-law', 'src/data/civilLawContent.js'],
  ['brokerage-law', 'src/data/brokerageLaw.js'],
  ['public-law', 'src/data/publicLaw.js'],
  ['registration-law', 'src/data/registrationLawDeepDive.js'],
  ['tax-law', 'src/data/taxLawContent.js'],
]
for (const [subjectId, path] of subjectDataMarkers) {
  if (!fs.existsSync(new URL(`../${path}`, import.meta.url))) fail(`${subjectId}: 정규 학습 데이터 파일 누락 ${path}`)
}

console.log('전 과목 정규페이지 MATURITY AUDIT PASS: 6/6')
console.log('- 기존 최저 성숙도 과목: brokerage-law = placeholder + 기출만 제공')
console.log('- 현재: BrokerageLawPage + 6 PART/20 POINT 정규 목차 + PART 1~2 7 POINT 상세본문 확보')
console.log(`- 비교 기준선: 민법 ${civilPointCount} POINT · 세법 ${taxPointCount} POINT · 중개사법 ${brokerageLawPointCount} POINT(상세 ${Object.keys(brokerageLawContent).length})`)
console.log('- 다음 상세화 우선순위: 중개사법 PART 3 → PART 4 → 거래신고 → 중개실무')
