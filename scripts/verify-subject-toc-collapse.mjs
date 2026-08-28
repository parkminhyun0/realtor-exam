import fs from 'node:fs'
import path from 'node:path'

const read = (file) => fs.readFileSync(path.resolve(file), 'utf8')

const pageFiles = [
  'src/App.jsx',
  'src/CivilLawPage.jsx',
  'src/PublicLawPage.jsx',
  'src/RealEstateTheoryPage.jsx',
  'src/RegistrationLawPageV2.jsx',
  'src/TaxLawPage.jsx',
]

for (const file of pageFiles) {
  const source = read(file)
  if (!source.includes('public-law-layout') || !source.includes('public-law-nav')) {
    throw new Error(`공통 목차 슬라이드 대상 구조 누락: ${file}`)
  }
}

const js = read('src/subject-sidebar-toggle.js')
const css = read('src/subject-sidebar-toggle.css')
const fullWidthCss = read('src/subject-sidebar-fullwidth-collapse.css')
const main = read('src/main.jsx')

for (const required of [
  "document.querySelectorAll('.public-law-layout > .public-law-nav')",
  'subjectTocCollapseToggle',
  '목차 숨기기',
  '목차 보기',
  "setAttribute('aria-expanded'",
  'realtor-exam:toc-collapsed',
]) {
  if (!js.includes(required)) throw new Error(`전과목 목차 토글 JS 누락: ${required}`)
}

for (const required of [
  '.public-law-layout.is-subject-toc-collapsed',
  '.subject-toc-collapse-toggle',
  '@media (max-width: 980px)',
  '@media (prefers-reduced-motion: reduce)',
]) {
  if (!css.includes(required)) throw new Error(`전과목 목차 토글 기본 CSS 누락: ${required}`)
}

for (const required of [
  'grid-template-columns: minmax(0, 1fr) !important',
  '.public-law-layout.is-subject-toc-collapsed > .public-law-content',
  'width: 100%',
  'max-width: none',
  'position: fixed',
  'transform: translateY(-50%) !important',
  'bottom: max(72px, calc(env(safe-area-inset-bottom) + 58px))',
  '.subject-toc-collapse-toggle__label',
  'display: none !important',
]) {
  if (!fullWidthCss.includes(required)) throw new Error(`목차 숨김 전체폭 확장 CSS 누락: ${required}`)
}

for (const requiredImport of [
  "import './subject-sidebar-toggle.css'",
  "import './subject-sidebar-fullwidth-collapse.css'",
  "import './subject-sidebar-toggle.js'",
]) {
  if (!main.includes(requiredImport)) throw new Error(`전과목 목차 토글 import 누락: ${requiredImport}`)
}

console.log(`전과목 목차 슬라이드 토글 검증 PASS: ${pageFiles.length} 페이지 · 숨김 시 본문 100% 확장 + floating reopen control`)
