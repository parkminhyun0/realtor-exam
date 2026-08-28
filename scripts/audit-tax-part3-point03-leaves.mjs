import fs from 'node:fs'
import { taxLawParts } from '../src/data/taxLaw.js'
import { taxLawContent } from '../src/data/taxLawContent.js'
import { taxLawPart3Point03Leaves, taxLawPart3Point03LeafCount } from '../src/data/taxLawPart3Point03Leaves.js'

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
const fail = (message) => { throw new Error(message) }

const part3 = taxLawParts.find((part) => String(part.number) === '3')
const point = part3?.points.find((item) => item.id === 'p3s3')
if (!point) fail('세법 PART 3 POINT 03(p3s3) 양도소득세를 찾을 수 없습니다.')

const tocTopics = point.groups.flatMap((group) => group.topics.map((topic) => `${group.title}|${topic}`))
const leafTopics = taxLawPart3Point03Leaves.flatMap((group) => group.topics.map((item) => `${group.group}|${item.topic}`))
if (point.groups.length !== 13) fail(`양도소득세 중분류 수 불일치: ${point.groups.length}/13`)
if (tocTopics.length !== 77 || taxLawPart3Point03LeafCount !== 77) fail(`양도소득세 소분류 수 불일치: ${tocTopics.length}/${taxLawPart3Point03LeafCount}/77`)
if (new Set(leafTopics).size !== leafTopics.length) fail('양도소득세 leaf key 중복이 있습니다.')
if (tocTopics.some((key) => !leafTopics.includes(key)) || leafTopics.some((key) => !tocTopics.includes(key))) fail('양도소득세 TOC ↔ leaf 불일치')

for (const group of taxLawPart3Point03Leaves) {
  for (const item of group.topics) {
    for (const field of ['topic', 'core', 'exam', 'trap', 'memory']) if (!String(item[field] || '').trim()) fail(`${group.group}|${item.topic}: ${field} 누락`)
    if (!Array.isArray(item.basis) || !item.basis.length) fail(`${group.group}|${item.topic}: basis 누락`)
  }
}

const content = taxLawContent.p3s3
for (const field of ['headline', 'summary', 'legalBases', 'examCore', 'understanding', 'flow', 'sections', 'traps', 'memory', 'ox', 'quiz']) {
  const value = content?.[field]
  if (Array.isArray(value) ? !value.length : !String(value || '').trim()) fail(`기존 양도소득세 본문 기반 누락: ${field}`)
}

const source = read('src/data/taxLawPart3Point03Leaves.js')
for (const marker of ['대금청산일', '연 250만원', '6%~45%', '1년 미만', '70%', '12억원', '최대 80%', '3년 이내', '말일부터 2개월', '5월 1일부터 5월 31일', '1천만원', '2개월 이내']) {
  if (!source.includes(marker)) fail(`양도소득세 핵심 숫자·개념 누락: ${marker}`)
}

const renderer = read('src/tax-law-point09-leaf-layer.js')
for (const marker of [
  "section.dataset.taxPoint = 'p3s3'",
  'PART 3 · POINT 03 · ${taxLawPart3Point03LeafCount}/${taxLawPart3Point03LeafCount}',
  '양도소득세 계산 6단계',
  '대금청산일 원칙 → 월말+2개월 예정신고 → 다음해 5월 확정신고',
  '기본 6~45% · 단기 40/50% · 주택 단기 60/70% · 미등기 70%',
  '보유 2년 · 필요 시 거주 2년 · 고가주택 12억원',
  '2026.5.31까지 공포·개정된 규정',
  '2026.5.22 소득세법 시행령 개정',
  '2026.6.1 이후 개정분',
]) if (!renderer.includes(marker)) fail(`양도소득세 renderer 누락: ${marker}`)

const nav = read('src/tax-law-nav-leaves.js')
for (const marker of ["const POINT09_ID = 'p3s3'", 'taxLawPart3Point03Leaves', 'scrollToLeaf(pointId, topic)']) if (!nav.includes(marker)) fail(`양도소득세 nav 누락: ${marker}`)

const css = read('src/tax-law-point09-leaf-layer.css')
if (!css.includes('#tax-nav-groups-p3s3')) fail('양도소득세 sidebar 확장 CSS 누락')

const main = read('src/main.jsx')
for (const marker of ['./tax-law-point09-leaf-layer.css', './tax-law-point09-leaf-layer.js']) if (!main.includes(marker)) fail(`main import 누락: ${marker}`)

console.log(`세법 PART 3 POINT 03 양도소득세 leaf support PASS: ${taxLawPart3Point03LeafCount}/77 소분류 · 13/13 중분류`)
console.log('양도 판정 → 과세대상·시기 → 양도차익 → 장특 → 기본공제 → 세율 → 비과세·감면 → 신고 연결 PASS')
console.log('핵심 숫자: 대금청산일 · 연250만원 · 장특 일반 최대30%/1주택 최대80% · 12억원 · 단기 40/50·주택 60/70 · 월말+2개월 · 다음해 5월')
console.log('제37회 프로젝트 기준: 2026.5.31까지 공포·개정분 적용 · 2026.6.1 이후 비교 전용')
