import fs from 'node:fs'

const root = new URL('../', import.meta.url)
const read = (path) => fs.readFileSync(new URL(path, root), 'utf8')
const fail = (message) => { throw new Error(message) }

const main = read('src/main.jsx')
const categoryImport = "import './subject-category-tax-standard.css'"
const bodyImport = "import './subject-body-civil-standard.css'"
if (!main.includes(categoryImport) || !main.includes(bodyImport)) fail('전과목 기준 CSS import 누락')
if (main.indexOf(categoryImport) < main.indexOf("import './unified-study-ui-v2.css'")) fail('세법 카테고리 기준 CSS가 구 공통 UI보다 먼저 로드됨')
if (main.indexOf(bodyImport) < main.indexOf(categoryImport)) fail('민법 본문 기준 CSS는 세법 카테고리 기준 뒤에 로드해야 함')

const category = read('src/subject-category-tax-standard.css')
for (const marker of [
  'UI/UX reference = 부동산세법',
  'grid-template-columns: 300px minmax(0,1fr)',
  '.tax-nav-groups',
  '.tax-nav-leaf-list',
  '.civil-nav-point',
  '.civil-nav-topic-button',
  '.registration-point',
  '.registration-toc-node',
  '.brokerage-major',
  '.brokerage-middle-nav',
  '.brokerage-leaf-nav',
  '.theory-nav__badges',
  '@media (max-width: 980px)',
]) if (!category.includes(marker)) fail(`세법 카테고리 기준 selector 누락: ${marker}`)

const body = read('src/subject-body-civil-standard.css')
for (const marker of [
  '본문 reference = 민법 및 민사특별법',
  'background: var(--civil-ref-navy)',
  'border-bottom: 3px solid var(--chapter-color)',
  '.civil-exam-number',
  '.tax-exam-number',
  '.brokerage-exam-number',
  '.theory-exam-number',
  '.exam-number',
  '.tax-exam-core',
  '.brokerage-exam-core',
  '.registration-study-block',
  '.theory-basis-panel',
  '.trap-card',
  '.memory-card',
  '.study-table',
  '@media (max-width:980px)',
]) if (!body.includes(marker)) fail(`민법 본문 기준 selector 누락: ${marker}`)

const pages = [
  ['학개론', 'src/RealEstateTheoryPage.jsx', 'real-estate-theory-page'],
  ['민법', 'src/CivilLawPage.jsx', 'civil-law-page'],
  ['중개사법', 'src/BrokerageLawPage.jsx', 'brokerage-law-page'],
  ['공법', 'src/PublicLawPage.jsx', 'public-law-page'],
  ['공시법', 'src/RegistrationLawPageV2.jsx', 'registration-law-page'],
  ['세법', 'src/TaxLawPage.jsx', 'tax-law-page'],
]
for (const [name, path, marker] of pages) {
  const source = read(path)
  if (!source.includes('public-law-page')) fail(`${name}: 공통 과목 shell 누락`)
  if (!source.includes('public-law-nav')) fail(`${name}: 공통 카테고리 nav 누락`)
  if (!source.includes('public-law-content')) fail(`${name}: 공통 본문 content 누락`)
  if (marker !== 'public-law-page' && !source.includes(marker)) fail(`${name}: 과목 root marker 누락 ${marker}`)
}

const embeddedPublicLaw = read('public/public-law.html')
for (const marker of [
  '.tldr{',
  'background:#16263e!important',
  '.card,.section-deep,.inline-proc,.proc-table,.quiz,.box,.callout',
  'border-radius:16px!important',
  'thead th{background:#eef2f7!important',
  '.embedded-law-reference',
]) if (!embeddedPublicLaw.includes(marker)) fail(`공법 iframe 민법형 본문 표면 누락: ${marker}`)

// 중개사법의 과목 격리는 유지되어야 한다.
const brokeragePage = read('src/BrokerageLawPage.jsx')
if (brokeragePage.includes('tax-law-page') || brokeragePage.includes('civil-law-page')) {
  fail('중개사법 runtime root에 세법/민법 class를 직접 공유하면 안 됨')
}

console.log('전과목 UI REFERENCE STANDARD AUDIT PASS: 6/6')
console.log('- 카테고리 UI/UX reference = 부동산세법')
console.log('- 본문 card/table/tldr/trap/memory reference = 민법 및 민사특별법')
console.log('- 학개론 · 민법 · 중개사법 · 공법 · 공시법 · 세법 동일 shell/nav/content 규격 확인')
console.log('- 세법/민법 runtime 기능은 과목별 root에 격리한 채 CSS 시각 규격만 공유')
