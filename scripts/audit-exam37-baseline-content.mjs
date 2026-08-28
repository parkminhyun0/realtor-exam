import fs from 'node:fs'
import path from 'node:path'
import { gunzipSync } from 'node:zlib'

const root = path.resolve(new URL('..', import.meta.url).pathname)
const fail = (message) => { throw new Error(message) }
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8')

const allowed = new Set([
  'src/data/examLawRegime.js',
  'src/ExamLawRegimeNotice.jsx',
  'src/exam-law-regime.css',
])

const textExt = new Set(['.js', '.jsx', '.mjs', '.html'])
const files = []

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const absolute = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(absolute)
    else if (textExt.has(path.extname(entry.name))) files.push(absolute)
  }
}

walk(path.join(root, 'src'))

const sources = files
  .map((absolute) => ({
    file: path.relative(root, absolute).replaceAll('\\', '/'),
    text: fs.readFileSync(absolute, 'utf8'),
  }))
  .filter(({ file }) => !allowed.has(file))

const publicLawParts = Array.from({ length: 11 }, (_, index) => (
  fs.readFileSync(path.join(root, 'public', `public-law-p${String(index + 1).padStart(2, '0')}.dat`), 'utf8')
)).join('').replace(/\s+/g, '')

const publicLawHtml = gunzipSync(Buffer.from(publicLawParts, 'base64')).toString('utf8')
sources.push({ file: 'public/[decoded public-law baseline]', text: publicLawHtml })

// 2026.5.31까지의 개정분은 제37회 본문에 적용합니다.
// 아래 목록은 2026.6.1 이후 개정분 중 본문에 섞이면 안 되는 대표 표지입니다.
const forbidden = [
  { subject: '중개사법', token: '한국공인중개사협회', note: '2026.8.18 개정 기관명 · 비교 전용' },
  { subject: '공법', token: '한국농어촌공사 등에 위탁·임대', note: '2026.6.16 농지법 개정 · 비교 전용' },
]

const leaks = []
for (const rule of forbidden) {
  for (const source of sources) {
    if (!source.text.includes(rule.token)) continue
    leaks.push(`${rule.subject} | ${rule.token} | ${source.file} | ${rule.note}`)
  }
}

if (leaks.length) {
  console.error('제37회 시험 본문에 2026.6.1 이후 개정법 전용 표현이 남아 있습니다:')
  for (const leak of leaks) console.error(`- ${leak}`)
  fail(`post-cutoff baseline leakage ${leaks.length}건`)
}

const layer = read('src/exam37-baseline-content-layer.js')
for (const marker of [
  '.real-estate-theory-page',
  '.civil-law-page:not(.tax-law-page)',
  '.public-law-page:not(.real-estate-theory-page)',
  '.registration-law-page',
  '.tax-law-page',
  '.subject-placeholder-page',
  'data-exam37-inline-baseline',
  '제37회 시험 기준 · 2026.5.31까지 개정법 적용',
  '2026년 5월 31일까지 공포·개정된 규정',
  '2026년 6월 1일 이후 개정분',
  '개정법 적용·차이 보기',
  "['CIVIL LAW · 2026', 'CIVIL LAW · 제37회 시험 기준']",
  "['REGISTRATION & CADASTRE · 2026', 'REGISTRATION & CADASTRE · 제37회 시험 기준']",
  "['REAL ESTATE TAX LAW · 2026', 'REAL ESTATE TAX LAW · 제37회 시험 기준']",
  "['PUBLIC LAW · 2026', 'PUBLIC LAW · 제37회 시험 기준']",
  "['근거법령 · 현행 조문', '근거법령 · 제37회 시험 기준 조문']",
  "['현행 조세 법령 바로보기', '제37회 시험 기준 조세 법령 바로보기']",
]) {
  if (!layer.includes(marker)) fail(`제37회 본문 기준 레이어 누락: ${marker}`)
}

const viewer = read('src/LawTextViewer.jsx')
for (const marker of [
  'const EXAM37_PROMULGATION_CUTOFF = 20260531',
  'target=eflaw',
  'nw=1,2,3',
  "item['공포일자']",
  'promulgationDate > EXAM37_PROMULGATION_CUTOFF',
  '&MST=${encodeURIComponent(version.mst)}&efYd=${version.effectiveDate}&JO=${joCode}',
  'exam37-cutoff-20260531',
  'data-exam37-law-popup="true"',
  '2026년 5월 31일까지 공포·개정된 마지막 법령 버전',
  '2026년 6월 1일 이후 개정분은 적용하지 않습니다',
  '해당 버전 원문 ↗',
]) {
  if (!viewer.includes(marker)) fail(`제37회 법령 팝업 cutoff baseline 누락: ${marker}`)
}

if (viewer.includes('const EXAM37_PROMULGATION_CUTOFF = 20251231')) fail('법령 팝업에 구 2025-12-31 컷오프가 남아 있습니다.')
if (viewer.includes('target=law&type=JSON&ID=')) fail('법령 팝업에 현행법 ID 직접조회 경로가 남아 있습니다.')

const main = read('src/main.jsx')
for (const requiredImport of [
  "import './exam37-law-viewer-baseline.css'",
  "import './exam37-baseline-content-layer.css'",
  "import './exam37-baseline-content-layer.js'",
]) {
  if (!main.includes(requiredImport)) fail(`main.jsx 제37회 baseline import 누락: ${requiredImport}`)
}

const css = read('src/exam37-baseline-content-layer.css')
for (const marker of ['.exam37-inline-baseline', '@media (max-width: 700px)', 'grid-template-columns: 38px minmax(0, 1fr)']) {
  if (!css.includes(marker)) fail(`제37회 baseline 반응형 CSS 누락: ${marker}`)
}

const popupCss = read('src/exam37-law-viewer-baseline.css')
for (const marker of ['.law-article-popup__exam-baseline', '.law-article-text__version', '@media (max-width: 620px)']) {
  if (!popupCss.includes(marker)) fail(`제37회 법령팝업 CSS 누락: ${marker}`)
}

console.log('제37회 시험 본문 6월 이후 개정법 누출 AUDIT PASS')
console.log('6개 과목에 2026.5.31 컷오프 표지 + 6월 이후 비교 전용 라벨 확인')
console.log('법령 팝업은 2026-05-31까지 공포·개정된 마지막 연혁(MST)으로 조회')
console.log('공법 압축 본문까지 디코드하여 post-cutoff 표현 격리 확인')
