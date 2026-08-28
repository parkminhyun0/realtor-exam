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
const main = read('src/main.jsx')

for (const required of [
  "document.querySelectorAll('.public-law-layout > .public-law-nav')",
  'data-subject-toc-collapse-toggle',
  '목차 숨기기',
  '목차 보기',
  "setAttribute('aria-expanded'",
  'realtor-exam:toc-collapsed',
]) {
  if (!js.includes(required)) throw new Error(`전과목 목차 토글 JS 누락: ${required}`)
}

for (const required of [
  '.public-law-layout.is-subject-toc-collapsed',
  'grid-template-columns: 52px minmax(0, 1fr)',
  '.subject-toc-collapse-toggle',
  '@media (max-width: 980px)',
  'max-height: 54px',
  '@media (prefers-reduced-motion: reduce)',
]) {
  if (!css.includes(required)) throw new Error(`전과목 목차 토글 CSS 누락: ${required}`)
}

for (const requiredImport of [
  "import './subject-sidebar-toggle.css'",
  "import './subject-sidebar-toggle.js'",
]) {
  if (!main.includes(requiredImport)) throw new Error(`전과목 목차 토글 import 누락: ${requiredImport}`)
}

console.log(`전과목 목차 슬라이드 토글 검증 PASS: ${pageFiles.length} 공통/전용 페이지 구조 + desktop rail + mobile compact collapse`)
