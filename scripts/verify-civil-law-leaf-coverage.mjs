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
const precisionFile = 'src/civil-law-precision-layer.js'

function read(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8')
}

function tRegion(source) {
  const match = /const\s+T\s*=\s*\{/.exec(source)
  if (!match) throw new Error('const T object block not found')
  const start = match.index
  const markers = ['function escapeHtml', 'function esc', 'function renderLaw', 'function renderPanel']
    .map((marker) => source.indexOf(marker, start + match[0].length))
    .filter((index) => index > start)
  const end = markers.length ? Math.min(...markers) : source.length
  return source.slice(start, end)
}

function extractTopicKeys(source) {
  const region = tRegion(source)
  const keys = []
  const re = /^\s*['"]([^'"]+)['"]\s*:\s*\{/gm
  let match
  while ((match = re.exec(region)) !== null) keys.push(match[1])
  return keys
}

function counts(values) {
  const map = new Map()
  values.forEach((value) => map.set(value, (map.get(value) || 0) + 1))
  return map
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function entrySegment(source, topic) {
  const region = tRegion(source)
  const startRe = new RegExp(`^\\s*['\"]${escapeRegExp(topic)}['\"]\\s*:\\s*\\{`, 'm')
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

const precisionSource = read(precisionFile)

for (const part of civilLawParts) {
  const rel = partFiles[part.number]
  const source = read(rel)
  const actualKeys = extractTopicKeys(source)
  const actualCount = counts(actualKeys)
  const expectedEntries = part.points.flatMap((point) => point.topics.map((topic) => ({ point, topic })))
  const expectedCount = counts(expectedEntries.map(({ topic }) => topic))

  for (const [topic, count] of expectedCount.entries()) {
    if (!actualCount.has(topic)) errors.push(`PART ${part.number}: missing LAW-FIRST leaf '${topic}' in ${rel}`)
    if ((actualCount.get(topic) || 0) !== count) {
      errors.push(`PART ${part.number}: '${topic}' expected ${count} source entries, found ${actualCount.get(topic) || 0}`)
    }
  }

  for (const topic of actualCount.keys()) {
    if (!expectedCount.has(topic)) errors.push(`PART ${part.number}: extra LAW-FIRST key '${topic}' not present in TOC`)
  }

  const collisions = [...expectedCount.entries()].filter(([, count]) => count > 1)
  if (part.number !== '4' && collisions.length) {
    errors.push(`PART ${part.number}: duplicate leaf labels require point-aware rendering: ${collisions.map(([topic]) => topic).join(', ')}`)
  }
  if (part.number === '4') {
    for (const [topic] of collisions) {
      const owners = expectedEntries.filter((entry) => entry.topic === topic)
      for (const { point } of owners) {
        const key = `${point.id}|${topic}`
        if (!precisionSource.includes(`'${key}':`)) {
          errors.push(`PART 4 duplicate '${topic}' is not point-disambiguated for ${point.id}`)
        }
      }
    }
  }
}

// 직접 민법 조문 하나로 해결되지 않는 대표 판례·이론 쟁점이
// LAW-FIRST 카드에서 법령 원문처럼 오인되지 않도록 issue() 표시를 검수합니다.
const issueChecks = {
  '1': ['이중매매의 법률관계', '오표시무해의 원칙'],
  '2': ['등기의 추정력', '중간생략등기', '무효등기의 유용', '분묘기지권', '관습법상의 법정지상권', '담보지상권', '저당권 침해에 대한 구제방법'],
  '3': ['계약의 종류', '합의해제와 합의해지'],
  '4': ['등기명의신탁', '계약명의신탁', '경매에 있어서의 명의신탁'],
}

for (const [partNo, topics] of Object.entries(issueChecks)) {
  const source = read(partFiles[partNo])
  for (const topic of topics) {
    const segment = entrySegment(source, topic)
    if (!segment) {
      errors.push(`PART ${partNo}: cannot audit issue/source boundary for '${topic}'`)
    } else if (!segment.includes('issue(')) {
      errors.push(`PART ${partNo}: '${topic}' must explicitly separate precedent/theory with issue()`)
    }
  }
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
console.log('Duplicate labels in PART 4 are point-disambiguated; representative precedent/theory boundaries are explicit.')
