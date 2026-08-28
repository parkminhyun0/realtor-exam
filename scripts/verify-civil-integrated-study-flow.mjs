import fs from 'node:fs'
import path from 'node:path'
import { civilLawParts } from '../src/data/civilLawToc3Level.js'
import { civilLawPart1Visuals } from '../src/data/civilLawPart1Visuals.js'
import { civilLawPart2Visuals } from '../src/data/civilLawPart2Visuals.js'
import { civilLawPart3Visuals } from '../src/data/civilLawPart3Visuals.js'
import { civilLawPart4Visuals } from '../src/data/civilLawPart4Visuals.js'

const leaves = civilLawParts.flatMap((part) => part.points.flatMap((point) => (
  point.topics.map((topic) => `${point.id}|${topic}`)
)))

if (leaves.length !== 182) {
  throw new Error(`민법 세부항목 수가 182개가 아닙니다: ${leaves.length}`)
}

const visuals = [
  ...civilLawPart1Visuals,
  ...civilLawPart2Visuals,
  ...civilLawPart3Visuals,
  ...civilLawPart4Visuals,
]

const visualKeys = new Set(visuals.map((item) => item.key))
if (visualKeys.size !== 182) {
  throw new Error(`민법 전용 visual key 수가 182개가 아닙니다: ${visualKeys.size}`)
}

const missingVisuals = leaves.filter((key) => !visualKeys.has(key))
if (missingVisuals.length) {
  throw new Error(`전용 다이어그램이 없는 민법 세부항목: ${missingVisuals.join(', ')}`)
}

const source = fs.readFileSync(path.resolve('src/civil-law-integrated-study-flow.js'), 'utf8')
const css = fs.readFileSync(path.resolve('src/civil-law-integrated-study-flow.css'), 'utf8')
const main = fs.readFileSync(path.resolve('src/main.jsx'), 'utf8')

for (const label of ['조문 · 기준', '다이어그램', '마인드맵', '출제포인트', '판례', '문제 · 훈련']) {
  if (!source.includes(label)) throw new Error(`통합 학습 단계 누락: ${label}`)
}

for (const selector of [
  '[data-civil-law-first="true"]',
  '.civil-topic-visual',
  '.civil-learning-map',
  '.civil-learning-exam-card',
  '.civil-leaf-precedents[data-topic]',
  '[data-civil-leaf-practice="true"]',
  '[data-civil-intensive="true"]',
]) {
  if (!source.includes(selector)) throw new Error(`통합 학습 대상 selector 누락: ${selector}`)
}

for (const forbidden of ['.civil-precedent-panel', '.civil-deep-study', '.civil-exam-checks']) {
  if (source.includes(forbidden)) {
    throw new Error(`POINT 공통자료가 leaf 직접자료처럼 오인될 수 있는 selector가 남아 있습니다: ${forbidden}`)
  }
}

if (!source.includes("step.id === 'precedent'") || !source.includes('item.dataset.topic === node.topic')) {
  throw new Error('판례 단계가 현재 세부항목 data-topic을 직접 확인하지 않습니다.')
}

if (!source.includes('개념·조문 중심 항목은 억지로 판례를 붙이지 않습니다.')) {
  throw new Error('직접판례가 필요하지 않은 개념항목 안내가 없습니다.')
}

if (!css.includes('@media (max-width: 700px)') || !css.includes('grid-template-columns: repeat(2')) {
  throw new Error('모바일 2열 통합 학습 레이아웃 검증 실패')
}

const jsImport = "import './civil-law-integrated-study-flow.js'"
const cssImport = "import './civil-law-integrated-study-flow.css'"
if (!main.includes(jsImport) || !main.includes(cssImport)) {
  throw new Error('main.jsx에 민법 통합 학습 레이어 import가 없습니다.')
}

console.log(`민법 통합 학습 흐름 검증 통과: ${leaves.length} leaves / ${visualKeys.size} visuals / direct precedent class + leaf-specific optional steps`)
