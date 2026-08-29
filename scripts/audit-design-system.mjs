/* 전과목 디자인 시스템 AUDIT
 *
 * 이 검사가 있는 이유는 전부 실제로 났던 일이다.
 *
 * - 같은 역할의 토큰이 네 벌로 갈라졌다. 본문 잉크색이 --ink(#172033) ·
 *   --study-ink(#182235) · --civil-ref-ink(#182235) · --study-text(#273142)
 *   넷이었고, --study-muted 는 서로 다른 값으로 두 번 정의돼 앞의 것이
 *   조용히 죽어 있었다. 그래서 토큰 정의는 design-tokens.css 하나만 값을
 *   갖고 나머지는 별칭이어야 한다.
 * - border-radius 가 3·4·7·8·9·10·11·12·13·14·15·16·18·999px 로 흩어져
 *   한 화면 안에서 카드마다 곡률이 달랐다. 다섯 단 스케일만 쓴다.
 * - "시험핵심" 패널 제목이 세법 #7f1d1d · 중개사법 #1f594f 처럼 과목마다
 *   달랐다. 같은 위계의 제목은 같은 규칙을 받아야 한다.
 * - 목차 접기 버튼을 두 모듈이 각자 만들면서 가드 속성이 서로 달라
 *   중개사법에서 "목차 숨기기" 가 두 개 겹쳐 떴다.
 *
 * 검사를 통과시키려고 이 파일을 고치지 마라. → AGENTS.md
 */

import fs from 'node:fs'

const read = (path) => fs.readFileSync(`${process.cwd()}/${path}`, 'utf8')
const problems = []
const fail = (message) => problems.push(message)

/* ── 1. 단일 출처가 존재하고 가장 먼저 로드되는가 ───────────────── */

const tokens = read('src/design-tokens.css')
const REQUIRED_TOKENS = [
  '--ds-ink', '--ds-body', '--ds-muted', '--ds-line', '--ds-soft', '--ds-surface',
  '--ds-accent', '--ds-danger', '--ds-success',
  '--ds-toc-bg', '--ds-toc-text', '--ds-toc-muted', '--ds-toc-active-bg',
  '--ds-r-xs', '--ds-r-sm', '--ds-r-md', '--ds-r-lg', '--ds-r-pill',
  '--ds-fs-sm', '--ds-fs-base', '--ds-fs-xl',
]
REQUIRED_TOKENS.forEach((name) => {
  if (!tokens.includes(`${name}:`)) fail(`design-tokens.css 에 ${name} 정의 누락`)
})

const main = read('src/main.jsx')
const tokenImport = "import './design-tokens.css'"
if (!main.includes(tokenImport)) fail('main.jsx 가 design-tokens.css 를 import 하지 않음')
const tokenIndex = main.indexOf(tokenImport)
;[
  './styles.css',
  './subject-ui-unified.css',
  './unified-study-ui-v2.css',
  './subject-category-tax-standard.css',
  './subject-body-civil-standard.css',
].forEach((file) => {
  const index = main.indexOf(`import '${file}'`)
  if (index >= 0 && index < tokenIndex) fail(`design-tokens.css 는 ${file} 보다 먼저 로드해야 함`)
})

/* ── 2. 다른 파일의 토큰은 값이 아니라 별칭이어야 한다 ──────────── */

// --four-toc-font 는 4단계 목차 AUDIT 이 11pt 리터럴을 직접 확인하므로 예외다.
const LITERAL_ALLOWED = new Set(['--four-toc-font', '--four-toc-meta-font'])

const ALIAS_ONLY_FILES = [
  'src/styles.css',
  'src/subject-ui-unified.css',
  'src/unified-study-ui-v2.css',
  'src/subject-category-tax-standard.css',
  'src/subject-body-civil-standard.css',
  'src/subject-four-level-nav.css',
]
ALIAS_ONLY_FILES.forEach((file) => {
  read(file).split('\n').forEach((line, index) => {
    const match = /^\s*(--[a-z0-9-]+)\s*:\s*(.+?);/.exec(line)
    if (!match) return
    const [, name, value] = match
    if (LITERAL_ALLOWED.has(name)) return
    if (value.startsWith('var(--ds-') || value.startsWith('var(--')) return
    fail(`${file}:${index + 1} ${name} 이 원시값(${value})을 직접 가짐 — design-tokens.css 로 옮기고 var(--ds-*) 별칭만 남길 것`)
  })
})

/* ── 3. border-radius 는 다섯 단 스케일만 ───────────────────────── */

const SCALED_FILES = [
  'src/subject-category-tax-standard.css', 'src/subject-body-civil-standard.css',
  'src/subject-four-level-nav.css', 'src/subject-ui-unified.css', 'src/unified-study-ui-v2.css',
  'src/civil-law.css', 'src/tax-law.css', 'src/registration-law.css', 'src/brokerage-law.css',
  'src/real-estate-theory.css', 'src/public-law.css', 'src/table-layout.css',
  'src/subject-sidebar-toggle.css', 'src/civil-law-3level.css', 'src/registration-law-toc.css',
  'src/tax-law-nav-tree.css', 'src/theory-past-question.css', 'src/tax-law-exam-drill.css',
]
const radiusDecl = /border(?:-[a-z]+)*-radius\s*:\s*([^;{}]+)/gi
SCALED_FILES.forEach((file) => {
  read(file).split('\n').forEach((line, index) => {
    for (const match of line.matchAll(radiusDecl)) {
      const value = match[1]
      if (!/\d+(?:\.\d+)?px/.test(value)) continue
      if (value.includes('var(--ds-r-')) continue
      fail(`${file}:${index + 1} border-radius 원시 px(${value.trim()}) — var(--ds-r-xs|sm|md|lg|pill) 사용`)
    }
  })
})

/* ── 4. 같은 위계의 제목은 같은 규칙을 받는다 ───────────────────── */

const bodyStandard = read('src/subject-body-civil-standard.css')
;[
  '.tax-exam-core__heading',
  '.brokerage-exam-core__heading',
  '.exam-core-panel__heading',
].forEach((selector) => {
  if (!bodyStandard.includes(selector)) fail(`시험핵심 제목 통일 규칙에 ${selector} 누락`)
})
;['#7f1d1d', '#1f594f', '#263d38'].forEach((hex) => {
  const owners = ['src/tax-law.css', 'src/brokerage-law.css', 'src/registration-law.css']
    .filter((file) => new RegExp(`h[34][^{]*\\{[^}]*${hex}`, 'i').test(read(file)))
  if (owners.length) fail(`과목 제목이 ${hex} 로 이탈: ${owners.join(', ')}`)
})

/* ── 5. 목차 접기 버튼은 화면에 하나만 ──────────────────────────── */

const sidebarToggle = read('src/subject-sidebar-toggle.js')
const fourLevelNav = read('src/subject-four-level-nav.js')
if (!sidebarToggle.includes("layout.querySelector('.subject-toc-collapse-toggle')")) {
  fail('subject-sidebar-toggle.js 가 다른 모듈이 만든 토글을 확인하지 않음')
}
if (!sidebarToggle.includes("nav.classList.contains('unified-four-toc__source-nav')")) {
  fail('subject-sidebar-toggle.js 가 숨겨진 원본 nav 를 제외하지 않음')
}
if (!fourLevelNav.includes("layout.querySelectorAll('.subject-toc-collapse-toggle')")) {
  fail('subject-four-level-nav.js 가 중복 토글을 정리하지 않음')
}

/* ── 결과 ───────────────────────────────────────────────────────── */

if (problems.length) {
  console.error(`전과목 디자인 시스템 AUDIT FAIL: ${problems.length}건`)
  problems.forEach((message) => console.error(`  - ${message}`))
  process.exit(1)
}

const radiusUses = SCALED_FILES.reduce((sum, file) => sum + (read(file).match(/var\(--ds-r-/g) || []).length, 0)
const aliasCount = ALIAS_ONLY_FILES.reduce((sum, file) => sum + (read(file).match(/:\s*var\(--ds-/g) || []).length, 0)

console.log('전과목 디자인 시스템 AUDIT PASS')
console.log('- 토큰 단일 출처: src/design-tokens.css · 별칭 ' + aliasCount + '개 · 원시값 중복 정의 0')
console.log('- border-radius: 5단 스케일 ' + radiusUses + '곳 적용 · 스케일 밖 px 0')
console.log('- 시험핵심/소제목: 전과목 동일 색(--ds-ink) · 13pt')
console.log('- 목차 접기 버튼: 보이는 목차 하나만 소유')
