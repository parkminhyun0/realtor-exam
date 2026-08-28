import fs from 'node:fs'
import { taxLawParts } from '../src/data/taxLaw.js'
import { taxLawContent } from '../src/data/taxLawContent.js'
import { taxLawExamSupplement } from '../src/data/taxLawExamSupplement.js'
import { taxLawRateGuide } from '../src/data/taxLawRateGuide.js'
import { taxLawPart1Point01Leaves } from '../src/data/taxLawPart1Point01Leaves.js'
import { taxLawPart1Point02Leaves } from '../src/data/taxLawPart1Point02Leaves.js'
import { taxLawPart1Point03Leaves } from '../src/data/taxLawPart1Point03Leaves.js'
import { taxLawPart2Point01Leaves } from '../src/data/taxLawPart2Point01Leaves.js'
import { taxLawPart2Point02Leaves } from '../src/data/taxLawPart2Point02Leaves.js'
import { taxLawPart2Point03Leaves } from '../src/data/taxLawPart2Point03Leaves.js'
import { taxLawPart3Point01Leaves } from '../src/data/taxLawPart3Point01Leaves.js'
import { taxLawPart3Point02Leaves } from '../src/data/taxLawPart3Point02Leaves.js'
import { taxLawPart3Point03Leaves } from '../src/data/taxLawPart3Point03Leaves.js'

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
const fail = (message) => { throw new Error(message) }

const leafSets = new Map([
  ['p1s1', taxLawPart1Point01Leaves],
  ['p1s2', taxLawPart1Point02Leaves],
  ['p1s3', taxLawPart1Point03Leaves],
  ['p2s1', taxLawPart2Point01Leaves],
  ['p2s2', taxLawPart2Point02Leaves],
  ['p2s3', taxLawPart2Point03Leaves],
  ['p3s1', taxLawPart3Point01Leaves],
  ['p3s2', taxLawPart3Point02Leaves],
  ['p3s3', taxLawPart3Point03Leaves],
])

const points = taxLawParts.flatMap((part) => part.points.map((point) => ({ part, point })))
if (points.length !== 9) fail(`POINT 수 불일치: ${points.length}/9`)

let groupCount = 0
let leafCount = 0
const allLeafKeys = []
const allLeafText = []

for (const { part, point } of points) {
  const leaves = leafSets.get(point.id)
  if (!leaves) fail(`${point.id}: leaf 데이터셋 누락`)
  if (!taxLawContent[point.id]) fail(`${point.id}: 기본 본문 누락`)
  if (!taxLawExamSupplement[point.id]) fail(`${point.id}: 시험 보강 데이터 누락`)

  const tocGroups = point.groups
  if (leaves.length !== tocGroups.length) fail(`${point.id}: 중분류 수 불일치 ${leaves.length}/${tocGroups.length}`)
  groupCount += leaves.length

  for (let groupIndex = 0; groupIndex < tocGroups.length; groupIndex += 1) {
    const tocGroup = tocGroups[groupIndex]
    const leafGroup = leaves[groupIndex]
    if (leafGroup.group !== tocGroup.title) fail(`${point.id}: 중분류 제목 불일치 ${leafGroup.group} != ${tocGroup.title}`)
    if (leafGroup.topics.length !== tocGroup.topics.length) fail(`${point.id}|${tocGroup.title}: 소분류 수 불일치`)

    for (let topicIndex = 0; topicIndex < tocGroup.topics.length; topicIndex += 1) {
      const tocTopic = tocGroup.topics[topicIndex]
      const item = leafGroup.topics[topicIndex]
      if (item.topic !== tocTopic) fail(`${point.id}|${tocGroup.title}: TOC 순서/제목 불일치 ${item.topic} != ${tocTopic}`)
      const key = `${point.id}|${tocGroup.title}|${item.topic}`
      allLeafKeys.push(key)
      leafCount += 1

      for (const field of ['core', 'exam', 'trap', 'memory']) {
        if (!String(item[field] || '').trim()) fail(`${key}: ${field} 누락`)
        allLeafText.push(String(item[field]))
      }
      if (!Array.isArray(item.basis) || !item.basis.length) fail(`${key}: 법령 근거 누락`)
      for (const basis of item.basis) {
        if (!String(basis.lawName || '').trim() || !String(basis.article || '').trim()) fail(`${key}: 법령칩 lawName/article 누락`)
        if (!/^제\d+조(?:의\d+)?$/.test(String(basis.article).replaceAll(' ', ''))) fail(`${key}: 조문 형식 오류 ${basis.article}`)
      }
    }
  }

  const content = taxLawContent[point.id]
  for (const field of ['headline', 'summary', 'legalBases', 'examCore', 'understanding', 'flow', 'sections', 'traps', 'memory', 'ox', 'quiz']) {
    const value = content[field]
    if (Array.isArray(value) ? !value.length : !String(value || '').trim()) fail(`${point.id}: 기본 본문 ${field} 누락`)
  }

  for (const reference of content.legalBases) {
    if (!String(reference.lawName || '').trim() || !Array.isArray(reference.articles) || !reference.articles.length) fail(`${point.id}: legalBases 구조 오류`)
  }

  const supplement = taxLawExamSupplement[point.id]
  for (const field of ['title', 'numbers', 'exceptions', 'calculation', 'sourceRefs']) {
    const value = supplement[field]
    if (Array.isArray(value) ? !value.length : !value || (typeof value === 'string' && !value.trim())) fail(`${point.id}: 시험 보강 ${field} 누락`)
  }
}

if (groupCount !== 62) fail(`전체 중분류 수 불일치: ${groupCount}/62`)
if (leafCount !== 316) fail(`전체 leaf 수 불일치: ${leafCount}/316`)
if (new Set(allLeafKeys).size !== 316) fail('POINT-중분류-소분류 경로 중복 발생')

const joined = allLeafText.join('\n')
const forbiddenPostCutoffDate = /2026\.(?:6\.(?:[2-9]|[12]\d|3[01])|(?:7|8|9|10|11|12)\.\d{1,2})/
if (forbiddenPostCutoffDate.test(joined)) fail(`6월 1일 이후 개정일이 시험 leaf 본문에 직접 노출됨: ${joined.match(forbiddenPostCutoffDate)?.[0]}`)
for (const forbidden of ['2026-08-27 현행법령 대조', '2026.7.1 시행', '2026.8.11 시행', '근거법령 · 현행 조문', '현행 조세 법령 바로보기']) {
  if (joined.includes(forbidden)) fail(`시험 leaf 본문에 현행법 메타데이터 누출: ${forbidden}`)
}

const canonicalChecks = [
  ['p2s1', ['60일', '3개월', '6개월']],
  ['p2s3', ['6월 1일', '7월', '9월']],
  ['p3s1', ['6월 1일', '12억원', '9억원']],
  ['p3s2', ['12억원', '2천만원', '14%', '5월 1일']],
  ['p3s3', ['250만원', '12억원', '40%', '50%', '70%', '2개월']],
]
for (const [pointId, markers] of canonicalChecks) {
  const text = JSON.stringify(leafSets.get(pointId))
  for (const marker of markers) if (!text.includes(marker)) fail(`${pointId}: 핵심 숫자/기간 누락 ${marker}`)
}

const normalizer = read('src/tax-law-exam37-cutoff-normalizer.js')
for (const marker of [
  'taxLawPart1Point01Leaves', 'taxLawPart1Point02Leaves', 'taxLawPart1Point03Leaves',
  'taxLawPart2Point01Leaves', 'taxLawPart2Point02Leaves', 'taxLawPart2Point03Leaves',
  'taxLawPart3Point01Leaves', 'taxLawPart3Point02Leaves', 'taxLawPart3Point03Leaves',
  'taxLawExamSupplement', 'taxLawRateGuide',
  '2026.5.31까지 공포·개정분 적용', '2026.6.1 이후 개정분 비교 전용',
  '제37회 시험 기준 · 2026.5.31 컷오프',
  'REAL ESTATE TAX LAW · 제37회 기준',
  '근거법령 · 제37회 기준 조문',
  '제37회 시험 기준 조세 법령 바로보기',
]) if (!normalizer.includes(marker)) fail(`전역 컷오프 normalizer 누락: ${marker}`)

const nav = read('src/tax-law-nav-leaves.js')
for (const pointId of leafSets.keys()) if (!nav.includes(pointId)) fail(`좌측 leaf 직접이동 누락: ${pointId}`)

const main = read('src/main.jsx')
for (let index = 1; index <= 9; index += 1) {
  const no = String(index).padStart(2, '0')
  for (const ext of ['css', 'js']) {
    const marker = `./tax-law-point${no}-leaf-layer.${ext}`
    if (!main.includes(marker)) fail(`main leaf layer import 누락: ${marker}`)
  }
}

const page = read('src/TaxLawPage.jsx')
for (const marker of ['LawTextViewer', 'TaxLawButtons', "subjectId: 'tax-law'", 'data-mobile-toc', 'taxLawExamSupplement']) {
  if (!page.includes(marker)) fail(`세법 페이지 법령/모바일/시험보강 연결 누락: ${marker}`)
}

const rateGuideKeys = Object.keys(taxLawRateGuide)
if (!rateGuideKeys.length) fail('세율 가이드가 비어 있습니다.')

console.log('부동산세법 최종 정합성 AUDIT PASS')
console.log(`- 목차/leaf: 9/9 POINT · ${groupCount}/62 중분류 · ${leafCount}/316 소분류`)
console.log('- leaf 필드/법령칩: 316/316 core·exam·trap·memory + 근거 조문 확인')
console.log('- 숫자 교차검증: 취득세 신고기한 · 재산세/종부세 6월 1일 · 임대소득 12억/2천/14% · 양도 250만원/12억/단기세율 확인')
console.log('- 제37회 컷오프: 2026.5.31까지 적용 · 2026.6.1 이후 비교 전용 · post-cutoff 날짜 누출 차단')
console.log('- UI 연결: 9개 POINT leaf layer · 좌측 직접이동 · 법령 팝업 · 모바일 목차 연결 확인')
