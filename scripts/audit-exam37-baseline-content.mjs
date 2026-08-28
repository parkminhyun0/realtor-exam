import fs from 'node:fs'
import path from 'node:path'
import { gunzipSync } from 'node:zlib'

const root = path.resolve(new URL('..', import.meta.url).pathname)
const fail = (message) => { throw new Error(message) }

const allowed = new Set([
  'src/data/examLawRegime.js',
  'src/ExamLawRegimeNotice.jsx',
  'src/exam-law-regime.css',
])

const textExt = new Set(['.js', '.jsx', '.mjs', '.html'])
const scanRoots = ['src']
const files = []

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const absolute = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(absolute)
    else if (textExt.has(path.extname(entry.name))) files.push(absolute)
  }
}

for (const rel of scanRoots) walk(path.join(root, rel))

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

const pageGuards = [
  ['src/RealEstateTheoryPage.jsx', '제37회 시험 기준'],
  ['src/CivilLawPage.jsx', '제37회 시험 기준'],
  ['src/PublicLawPage.jsx', '제37회 시험 기준'],
  ['src/RegistrationLawPageV2.jsx', '제37회 시험 기준'],
  ['src/TaxLawPage.jsx', '제37회 시험 기준'],
  ['src/App.jsx', '제37회 시험 기준'],
]

const missingGuards = pageGuards.filter(([file, marker]) => !fs.readFileSync(path.join(root, file), 'utf8').includes(marker))
if (missingGuards.length) {
  fail(`전과목 제37회 시험 기준 표지 누락: ${missingGuards.map(([file]) => file).join(', ')}`)
}

console.log('제37회 시험 본문 2026 개정법 누출 AUDIT PASS')
console.log('6개 과목 페이지에 제37회 시험 기준 표지 확인')
console.log('공법 압축 본문까지 디코드하여 2026 개정 전용 표현 격리 확인')
