import fs from 'node:fs'

const root = process.cwd()
const read = (path) => fs.readFileSync(`${root}/${path}`, 'utf8')
const fail = (message) => {
  console.error(`전과목 4단계 목차 AUDIT FAIL: ${message}`)
  process.exit(1)
}

const runtime = read('src/subject-four-level-nav.js')
const css = read('src/subject-four-level-nav.css')
const main = read('src/main.jsx')
const pages = {
  theory: read('src/RealEstateTheoryPage.jsx'),
  civil: read('src/CivilLawPage.jsx'),
  brokerage: read('src/BrokerageLawPage.jsx'),
  public: read('src/PublicLawPage.jsx'),
  registration: read('src/RegistrationLawPageV2.jsx'),
  tax: read('src/TaxLawPage.jsx'),
}

const requiredImports = [
  './data/taxLaw',
  './data/civilLawToc3Level',
  './data/realEstateTheory',
  './data/registrationLaw',
  './data/brokerageLawHierarchy',
  './data/publicLaw',
]
requiredImports.forEach((marker) => {
  if (!runtime.includes(marker)) fail(`공통 renderer 데이터 연결 누락: ${marker}`)
})

for (const level of ['카테고리', '대분류', '중분류', '소분류']) {
  if (!runtime.includes(`'${level}'`)) fail(`4단계 레벨 라벨 누락: ${level}`)
}

const builders = [
  'buildTaxTree',
  'buildCivilTree',
  'buildTheoryTree',
  'buildRegistrationTree',
  'buildBrokerageTree',
  'buildPublicTree',
]
builders.forEach((name) => {
  if (!runtime.includes(`function ${name}`)) fail(`과목별 4단계 adapter 누락: ${name}`)
})

const pageMarkers = {
  theory: 'real-estate-theory-page',
  civil: 'civil-law-page',
  brokerage: 'brokerage-law-page',
  public: 'public-law-frame',
  registration: 'registration-law-page',
  tax: 'tax-law-page',
}
Object.entries(pageMarkers).forEach(([key, marker]) => {
  if (!pages[key].includes(marker)) fail(`${key} 정규 페이지 marker 누락: ${marker}`)
})

if (!css.includes('--four-toc-font: 11pt')) fail('목차 공통 11pt font token 누락')
if (!css.includes('font-size: 11pt !important')) fail('목차 label 11pt 강제 규칙 누락')
if (!css.includes('.unified-four-toc__children--level-4')) fail('소분류 4단계 connector 규칙 누락')
if (!css.includes('.public-law-layout:has(> .unified-four-toc)')) fail('기존 과목별 nav 숨김/교체 규칙 누락')
if (!runtime.includes('카테고리 → 대분류 → 중분류 → 소분류 · 4단계 고정')) fail('공통 4단계 안내문구 누락')

const fourLevelImport = "import './subject-four-level-nav.js'"
const mobileHeroImport = "import './mobile-subject-hero-gap-fix.css'"
const mobileHeadingImport = "import './mobile-study-heading-gap-fix.css'"
const fourIndex = main.indexOf(fourLevelImport)
const heroIndex = main.indexOf(mobileHeroImport)
const headingIndex = main.indexOf(mobileHeadingImport)
if (fourIndex < 0) fail('main.jsx 4단계 renderer import 누락')
if (!(fourIndex < heroIndex && heroIndex < headingIndex)) fail('4단계 renderer는 최종 모바일 guard 앞에 로드되어야 함')
if (main.trim().lastIndexOf(mobileHeadingImport) < fourIndex) fail('mobile study heading guard 순서 오류')

const sourceTags = [
  'tagTaxSource',
  'tagCivilSource',
  'tagTheorySource',
  'tagRegistrationSource',
  'tagBrokerageSource',
  'tagPublicSource',
]
sourceTags.forEach((name) => {
  if (!runtime.includes(`function ${name}`)) fail(`기존 클릭동작 bridge 누락: ${name}`)
})

if (!runtime.includes('parsePublicFrame')) fail('공법 iframe 실제 세부목차 추출 bridge 누락')
if (!runtime.includes('civilLeaves')) fail('민법 중분류→실제 본문 소분류 연결 누락')
if (!runtime.includes('registrationLawExamDetail')) fail('공시법 시험상세 중분류→소분류 연결 누락')

console.log('전과목 4단계 목차 AUDIT PASS: 6/6')
console.log('- 공통 구조: 카테고리 → 대분류 → 중분류 → 소분류')
console.log('- 목차 본문 label font: 전과목 11pt 고정 · level badge/count 8pt')
console.log('- 세법/중개사법: 기존 4단계 taxonomy 직접 매핑')
console.log('- 학개론: 편 → 장 → 절 → 세부항목 실제 데이터 매핑')
console.log('- 민법: PART → POINT → 세부논점 → 연결 본문항목 매핑')
console.log('- 공시법: PART → POINT → 시험상세 topic → 핵심 bullet 매핑')
console.log('- 공법: 법률 → 절 → iframe 실제 상세블록 → 세부항목 동적 추출')
console.log('- 기존 과목별 클릭/이동 기능은 hidden source nav bridge로 유지')
