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

const forbidden = [
  { subject: '학개론', token: '표준재무제표증명', note: '2026 감정평가법 시행규칙 비교 전용' },
  { subject: '민법', token: '상속권 상실', note: '2026 민법 상속편 비교 전용' },
  { subject: '민법', token: '특별수익에서 제외', note: '2026 민법 상속편 비교 전용' },
  { subject: '중개사법', token: '한국공인중개사협회', note: '2026 개정 기관명 비교 전용' },
  { subject: '공법', token: '교육환경평가', note: '2026 주택법 통합심의 추가대상 비교 전용' },
  { subject: '공법', token: '성능위주설계평가', note: '2026 주택법 통합심의 추가대상 비교 전용' },
  { subject: '공법', token: '재해영향평가', note: '2026 주택법 통합심의 추가대상 비교 전용' },
  { subject: '공시법', token: '통합특별시', note: '2026 공간정보법 타법개정 비교 전용' },
  { subject: '세법', token: '인구감소관심지역', note: '2026 종부세 시행령 비교 전용' },
  { subject: '세법', token: '2026.5.9', note: '2026 양도세 중과 유예 종료 비교 전용' },
  { subject: '세법', token: '2026년도 납세의무 성립분', note: '2026 재산세 특례 연도 갱신 비교 전용' },
]

const leaks = []
for (const rule of forbidden) {
  for (const source of sources) {
    if (!source.text.includes(rule.token)) continue
    leaks.push(`${rule.subject} | ${rule.token} | ${source.file} | ${rule.note}`)
  }
}

if (leaks.length) {
  console.error('제37회 시험 본문에 2026 개정법 전용 표현이 남아 있습니다:')
  for (const leak of leaks) console.error(`- ${leak}`)
  fail(`2026 개정법 baseline leakage ${leaks.length}건`)
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
  '제37회 시험 기준 · 개정 전 법령으로 학습',
  '2026 개정법 차이 보기',
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
  'const EXAM37_PROMULGATION_CUTOFF = 20251231',
  'target=eflaw',
  'nw=1,2,3',
  "item['공포일자']",
  'promulgationDate > EXAM37_PROMULGATION_CUTOFF',
  '&MST=${encodeURIComponent(version.mst)}&efYd=${version.effectiveDate}&JO=${joCode}',
  'data-exam37-law-popup="true"',
  '2025년 12월 31일까지 공포된 마지막 법령 버전',
  '해당 버전 원문 ↗',
]) {
  if (!viewer.includes(marker)) fail(`제37회 법령 팝업 historical baseline 누락: ${marker}`)
}

if (viewer.includes('target=law&type=JSON&ID=')) {
  fail('법령 팝업에 현행법 ID 직접조회 경로가 남아 있습니다.')
}

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

console.log('제37회 시험 본문 2026 개정법 누출 AUDIT PASS')
console.log('6개 과목에 본문 내부 EXAM BASELINE 표지 + 2026 혼동 라벨 정규화 확인')
console.log('법령 팝업은 2025-12-31까지 공포된 마지막 연혁(MST)으로 조회')
console.log('공법 압축 본문까지 디코드하여 2026 개정 전용 표현 격리 확인')
