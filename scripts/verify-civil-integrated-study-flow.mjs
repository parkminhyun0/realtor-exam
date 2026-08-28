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
  '[data-civil-law-leaf-precedents="true"]',
  '.civil-intensive-drill',
]) {
  if (!source.includes(selector)) throw new Error(`통합 학습 대상 selector 누락: ${selector}`)
}

if (!source.includes('판례와 문제는 해당 세부항목에 직접 연결된 자료가 있을 때 활성화됩니다.')) {
  throw new Error('선택적 판례/문제 자료에 대한 오인 방지 안내가 없습니다.')
}

if (!css.includes('@media (max-width: 700px)') || !css.includes('grid-template-columns: repeat(2')) {
  throw new Error('모바일 2열 통합 학습 레이아웃 검증 실패')
}

const jsImport = "import './civil-law-integrated-study-flow.js'"
const cssImport = "import './civil-law-integrated-study-flow.css'"
if (!main.includes(jsImport) || !main.includes(cssImport)) {
  throw new Error('main.jsx에 민법 통합 학습 레이어 import가 없습니다.')
}

console.log(`민법 통합 학습 흐름 검증 통과: ${leaves.length} leaves / ${visualKeys.size} visuals / 6 study steps`)
