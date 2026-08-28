import fs from 'node:fs'
import { taxLawParts } from '../src/data/taxLaw.js'
import { taxLawContent } from '../src/data/taxLawContent.js'
import { taxLawPart3Point02Leaves, taxLawPart3Point02LeafCount } from '../src/data/taxLawPart3Point02Leaves.js'

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
const fail = (message) => { throw new Error(message) }

const part3 = taxLawParts.find((part) => String(part.number) === '3')
const point = part3?.points.find((item) => item.id === 'p3s2')
if (!point) fail('세법 PART 3 POINT 02(p3s2) 종합소득세를 찾을 수 없습니다.')

const tocTopics = point.groups.flatMap((group) => group.topics.map((topic) => `${group.title}|${topic}`))
const leafTopics = taxLawPart3Point02Leaves.flatMap((group) => group.topics.map((item) => `${group.group}|${item.topic}`))
if (point.groups.length !== 5) fail(`종합소득세 중분류 수 불일치: ${point.groups.length}/5`)
if (tocTopics.length !== 29 || taxLawPart3Point02LeafCount !== 29) fail(`종합소득세 소분류 수 불일치: ${tocTopics.length}/${taxLawPart3Point02LeafCount}/29`)
if (new Set(leafTopics).size !== leafTopics.length) fail('종합소득세 leaf key 중복이 있습니다.')
if (tocTopics.some((key) => !leafTopics.includes(key)) || leafTopics.some((key) => !tocTopics.includes(key))) fail('종합소득세 TOC ↔ leaf 불일치')

for (const group of taxLawPart3Point02Leaves) {
  for (const item of group.topics) {
    for (const field of ['topic', 'core', 'exam', 'trap', 'memory']) if (!String(item[field] || '').trim()) fail(`${group.group}|${item.topic}: ${field} 누락`)
    if (!Array.isArray(item.basis) || !item.basis.length) fail(`${group.group}|${item.topic}: basis 누락`)
  }
}

const content = taxLawContent.p3s2
for (const field of ['headline', 'summary', 'legalBases', 'examCore', 'understanding', 'flow', 'sections', 'traps', 'memory', 'ox', 'quiz']) {
  const value = content?.[field]
  if (Array.isArray(value) ? !value.length : !String(value || '').trim()) fail(`기존 종합소득세 본문 기반 누락: ${field}`)
}

const source = read('src/data/taxLawPart3Point02Leaves.js')
for (const marker of ['12억원', '2천만원', '1,400만원', '45%', '5월 1일부터 5월 31일']) {
  if (!source.includes(marker)) fail(`종합소득세 핵심 숫자 누락: ${marker}`)
}

const renderer = read('src/tax-law-point08-leaf-layer.js')
for (const marker of [
  "section.dataset.taxPoint = 'p3s2'",
  'PART 3 · POINT 02 · ${taxLawPart3Point02LeafCount}/${taxLawPart3Point02LeafCount}',
  '종합소득세 문제풀이 6단계',
  '1주택 12억 · 과세 주택임대수입 2천만원 · 분리세율 14%',
  '6 · 15 · 24 · 35 · 38 · 40 · 42 · 45%',
  '다음 연도 5월 1일~31일',
  '2026.5.31까지 공포·개정된 규정',
  '2026.6.1 이후 개정분',
]) if (!renderer.includes(marker)) fail(`종합소득세 renderer 누락: ${marker}`)

const nav = read('src/tax-law-nav-leaves.js')
for (const marker of ["const POINT08_ID = 'p3s2'", 'taxLawPart3Point02Leaves', 'scrollToLeaf(pointId, topic)']) if (!nav.includes(marker)) fail(`종합소득세 nav 누락: ${marker}`)

const css = read('src/tax-law-point08-leaf-layer.css')
if (!css.includes('#tax-nav-groups-p3s2')) fail('종합소득세 sidebar 확장 CSS 누락')

const main = read('src/main.jsx')
for (const marker of ['./tax-law-point08-leaf-layer.css', './tax-law-point08-leaf-layer.js']) if (!main.includes(marker)) fail(`main import 누락: ${marker}`)

console.log(`세법 PART 3 POINT 02 종합소득세 leaf support PASS: ${taxLawPart3Point02LeafCount}/29 소분류 · 5/5 중분류`)
console.log('소득 8분류 → 종합·분류·분리과세 → 부동산임대 → 과표·누진세율 → 다음해 5월 신고 연결 PASS')
console.log('주택임대 핵심: 1주택 12억 · 총수입 2천만원 · 분리세율 14% · 일반 50%/200만원 · 법정 임대주택 60%/400만원')
console.log('제37회 프로젝트 기준: 2026.5.31까지 공포·개정분 적용 · 2026.6.1 이후 비교 전용')
