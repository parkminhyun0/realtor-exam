import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { civilLawParts, civilLawTopicCount } from '../src/data/civilLawToc3Level.js'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const partFiles = {
  '1': 'src/civil-law-part1-law-first.js',
  '2': 'src/civil-law-part2-law-first.js',
  '3': 'src/civil-law-part3-law-first.js',
  '4': 'src/civil-law-part4-law-first.js',
}

function read(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8')
}

function objectRegion(source, objectName) {
  const re = new RegExp(`const\\s+${objectName}\\s*=\\s*\\{`)
  const match = re.exec(source)
  if (!match) throw new Error(`const ${objectName} object block not found`)
  const start = match.index
  let depth = 0
  let quote = ''
  let escaped = false
  for (let i = source.indexOf('{', start); i < source.length; i += 1) {
    const char = source[i]
    if (quote) {
      if (escaped) escaped = false
      else if (char === '\\') escaped = true
      else if (char === quote) quote = ''
      continue
    }
    if (char === '\'' || char === '"' || char === '`') {
      quote = char
      continue
    }
    if (char === '{') depth += 1
    if (char === '}') {
      depth -= 1
      if (depth === 0) return source.slice(start, i + 1)
    }
  }
  throw new Error(`unterminated ${objectName} object block`)
}

function extractTopicKeys(source) {
  const region = objectRegion(source, 'T')
  const keys = []
  const re = /^\s*['"]([^'"]+)['"]\s*:\s*\{/gm
  let match
  while ((match = re.exec(region)) !== null) keys.push(match[1])
  return keys
}

function extractAliasMap(source) {
  const aliases = new Map()
  if (!/const\s+ALIAS\s*=\s*\{/.test(source)) return aliases
  const region = objectRegion(source, 'ALIAS')
  const re = /['"]([^'"]+)['"]\s*:\s*['"]([^'"]+)['"]/g
  let match
  while ((match = re.exec(region)) !== null) aliases.set(match[1], match[2])
  return aliases
}

function entrySegment(source, topic) {
  const region = objectRegion(source, 'T')
  const escapedTopic = String(topic).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const startRe = new RegExp(`^\\s*['\"]${escapedTopic}['\"]\\s*:\\s*\\{`, 'm')
  const match = startRe.exec(region)
  if (!match) return ''
  const start = match.index
  const rest = region.slice(start + match[0].length)
  const next = /^\s*['"][^'"]+['"]\s*:\s*\{/m.exec(rest)
  return next ? region.slice(start, start + match[0].length + next.index) : region.slice(start)
}

const expectedTotal = civilLawParts.reduce(
  (sum, part) => sum + part.points.reduce((pointSum, point) => pointSum + point.topics.length, 0),
  0,
)
const errors = []

if (civilLawTopicCount !== expectedTotal) {
  errors.push(`civilLawTopicCount(${civilLawTopicCount}) != calculated(${expectedTotal})`)
}
if (expectedTotal !== 182) {
  errors.push(`current 3-level TOC should contain 182 leaves, found ${expectedTotal}`)
}

for (const part of civilLawParts) {
  const rel = partFiles[part.number]
  const source = read(rel)
  const actualKeys = extractTopicKeys(source)
  const actualSet = new Set(actualKeys)
  const expectedEntries = part.points.flatMap((point) => point.topics.map((topic) => ({ point, topic })))

  if (part.number !== '4') {
    const expectedSet = new Set(expectedEntries.map(({ topic }) => topic))
    for (const topic of expectedSet) {
      if (!actualSet.has(topic)) errors.push(`PART ${part.number}: missing LAW-FIRST leaf '${topic}'`)
    }
    for (const topic of actualSet) {
      if (!expectedSet.has(topic)) errors.push(`PART ${part.number}: extra LAW-FIRST key '${topic}' not present in TOC`)
    }
    if (expectedSet.size !== expectedEntries.length) {
      errors.push(`PART ${part.number}: duplicate visible leaf labels require point-aware alias handling`)
    }
    continue
  }

  // PART 4는 주택·상가에서 동일한 leaf 명칭을 사용하므로 ALIAS로 POINT까지 구별합니다.
  const aliases = extractAliasMap(source)
  const resolvedExpected = new Set()
  const visibleCounts = new Map()
  expectedEntries.forEach(({ topic }) => visibleCounts.set(topic, (visibleCounts.get(topic) || 0) + 1))

  for (const { point, topic } of expectedEntries) {
    const aliasKey = `PART 4|POINT ${point.number}|${topic}`
    const resolved = aliases.get(aliasKey) || topic
    resolvedExpected.add(resolved)
    if (!actualSet.has(resolved)) {
      errors.push(`PART 4 ${point.id}: '${topic}' resolves to missing key '${resolved}'`)
    }
    if ((visibleCounts.get(topic) || 0) > 1 && !aliases.has(aliasKey)) {
      errors.push(`PART 4 ${point.id}: duplicate visible leaf '${topic}' must have explicit POINT alias`)
    }
  }

  for (const topic of actualSet) {
    if (!resolvedExpected.has(topic)) errors.push(`PART 4: extra internal LAW-FIRST key '${topic}' is unused by TOC/ALIAS`)
  }
}

// 판례·이론과 직접 조문을 분리하는 대표 고위험 쟁점만 실패 조건으로 검수합니다.
const issueChecks = {
  '2': ['등기의 추정력', '중간생략등기', '무효등기의 유용', '분묘기지권', '관습법상의 법정지상권', '담보지상권', '저당권 침해에 대한 구제방법'],
  '3': ['계약의 종류', '합의해제와 합의해지'],
  '4': ['등기명의신탁', '경매에 있어서의 명의신탁'],
}

for (const [partNo, topics] of Object.entries(issueChecks)) {
  const source = read(partFiles[partNo])
  for (const topic of topics) {
    const segment = entrySegment(source, topic)
    if (!segment) errors.push(`PART ${partNo}: cannot audit source boundary for '${topic}'`)
    else if (!segment.includes('issue(')) errors.push(`PART ${partNo}: '${topic}' must explicitly separate precedent/theory with issue()`)
  }
}

// PART 1의 이중매매·오표시무해는 별도 판례·해석 source layer로 직접 근거를 표시합니다.
const part1IssueSource = read('src/civil-law-part1-source-issue-layer.js')
const part1IssueRequirements = [
  '이중매매의 법률관계',
  '2001다8097, 8103',
  '오표시무해의 원칙',
  '93다2629, 2636(병합)',
  '93다3103',
  'data-civil-part1-source-issue="true"',
  'https://www.law.go.kr/LSW/precInfoP.do?precSeq=81471',
]
for (const required of part1IssueRequirements) {
  if (!part1IssueSource.includes(required)) errors.push(`PART 1 precedent/theory source layer missing: ${required}`)
}

if (errors.length) {
  console.error('\nCivil-law leaf audit FAILED')
  errors.forEach((error) => console.error(`- ${error}`))
  process.exit(1)
}

const perPart = civilLawParts.map((part) => ({
  part: part.number,
  leaves: part.points.reduce((sum, point) => sum + point.topics.length, 0),
}))
console.log(`Civil-law leaf audit PASS: ${expectedTotal} leaves covered.`)
console.log(perPart.map(({ part, leaves }) => `PART ${part}: ${leaves}`).join(' / '))
console.log('PART 4 duplicate labels are resolved through explicit POINT aliases.')
console.log('PART 1 precedent/theory source cards verified: 이중매매 + 오표시무해 2/2.')
