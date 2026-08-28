import fs from 'node:fs'
import { taxLawParts } from '../src/data/taxLaw.js'
import { taxLawContent } from '../src/data/taxLawContent.js'
import { taxLawPart3Point01Leaves, taxLawPart3Point01LeafCount } from '../src/data/taxLawPart3Point01Leaves.js'

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
const fail = (message) => { throw new Error(message) }

const part3 = taxLawParts.find((part) => String(part.number) === '3')
const point = part3?.points.find((item) => item.id === 'p3s1')
if (!point) fail('세법 PART 3 POINT 01(p3s1) 종합부동산세를 찾을 수 없습니다.')

const tocTopics = point.groups.flatMap((group) => group.topics.map((topic) => `${group.title}|${topic}`))
const leafTopics = taxLawPart3Point01Leaves.flatMap((group) => group.topics.map((item) => `${group.group}|${item.topic}`))
if (point.groups.length !== 5) fail(`종합부동산세 중분류 수 불일치: ${point.groups.length}/5`)
if (tocTopics.length !== 25 || taxLawPart3Point01LeafCount !== 25) fail(`종합부동산세 소분류 수 불일치: ${tocTopics.length}/${taxLawPart3Point01LeafCount}/25`)
if (new Set(leafTopics).size !== leafTopics.length) fail('종합부동산세 leaf key 중복이 있습니다.')
if (tocTopics.some((key) => !leafTopics.includes(key)) || leafTopics.some((key) => !tocTopics.includes(key))) fail('종합부동산세 TOC ↔ leaf 불일치')

for (const group of taxLawPart3Point01Leaves) {
  for (const item of group.topics) {
    for (const field of ['topic', 'core', 'exam', 'trap', 'memory']) if (!String(item[field] || '').trim()) fail(`${group.group}|${item.topic}: ${field} 누락`)
    if (!Array.isArray(item.basis) || !item.basis.length) fail(`${group.group}|${item.topic}: basis 누락`)
  }
}

const content = taxLawContent.p3s1
for (const field of ['headline', 'summary', 'legalBases', 'examCore', 'understanding', 'flow', 'sections', 'traps', 'memory', 'ox', 'quiz']) {
  const value = content?.[field]
  if (Array.isArray(value) ? !value.length : !String(value || '').trim()) fail(`기존 종합부동산세 본문 기반 누락: ${field}`)
}

const data = read('src/data/taxLawPart3Point01Leaves.js')
for (const marker of [
  '1주택 12 / 일반 9 / 법인 0',
  '(공시가 합계-공제)×60%',
  '종합합산=5억원',
  '별도합산=80억원',
  '종합 1·2·3%와 별도 0.5·0.6·0.7%',
  '고령 20·30·40 / 보유 20·40·50 / 합계 80',
  '선택 신고납부 12·1~12·15',
  '250 초과 → 500 기준 → 6개월',
]) if (!data.includes(marker)) fail(`종합부동산세 leaf 핵심 숫자 누락: ${marker}`)

const renderer = read('src/tax-law-point07-leaf-layer.js')
for (const marker of [
  "section.dataset.taxPoint = 'p3s1'",
  'PART 3 · POINT 01 · ${taxLawPart3Point01LeafCount}/${taxLawPart3Point01LeafCount}',
  '12 · 9 · 0 / 5 · 80 그리고 60% · 100%',
  '고령자 + 장기보유, 합계 80% 한도',
  '6월 1일 → 12월 1~15일 → 분납 250만원 초과·6개월',
  '2026.2.27 시행령 · 2026.3.20 시행규칙은 5월 31일 컷오프 안',
  '인구감소지역·인구감소관심지역 주택',
  '합산배제',
  '2026.5.31까지 공포·개정된 규정',
  '2026.6.1 이후 개정분',
]) if (!renderer.includes(marker)) fail(`종합부동산세 renderer 누락: ${marker}`)

const nav = read('src/tax-law-nav-leaves.js')
for (const marker of ["const POINT07_ID = 'p3s1'", 'taxLawPart3Point01Leaves', 'scrollToLeaf(pointId, topic)']) if (!nav.includes(marker)) fail(`종합부동산세 nav 누락: ${marker}`)

const main = read('src/main.jsx')
for (const marker of ["import './tax-law-point07-leaf-layer.css'", "import './tax-law-point07-leaf-layer.js'"]) if (!main.includes(marker)) fail(`종합부동산세 main import 누락: ${marker}`)

const css = read('src/tax-law-point07-leaf-layer.css')
for (const marker of ['#tax-nav-groups-p3s1', '.tax-comprehensive-formulas', '.tax-comprehensive-rates', '.tax-comprehensive-credits', '.tax-comprehensive-calendar', '@media (max-width: 820px)']) if (!css.includes(marker)) fail(`종합부동산세 CSS 누락: ${marker}`)

console.log(`세법 PART 3 POINT 01 종합부동산세 leaf support PASS: ${taxLawPart3Point01LeafCount}/25 소분류 · 5/5 중분류`)
console.log('6월 1일 → 주택/토지 분류 → 전국합산 → 공제·과표 → 세율·세액공제 → 12월 부과·납부 연결 PASS')
console.log('제37회 프로젝트 기준: 2026.5.31까지 공포·개정분 적용 · 2026.6.1 이후 비교 전용')
console.log('2026.2.27 시행령·2026.3.20 시행규칙을 컷오프 내 적용규정으로 반영')
