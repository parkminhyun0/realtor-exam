import fs from 'node:fs'
import { civilLawParts } from '../src/data/civilLawToc3Level.js'

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
const part1 = civilLawParts.find((part) => String(part.number) === '1')
const leaves = part1.points.flatMap((point) => point.topics.map((topic) => ({ point: point.number, topic })))

const precedentSource = [
  'src/civil-law-precedent-layer.js',
  'src/civil-law-part3-precedent-layer.js',
  'src/civil-law-part4-precedent-layer.js',
].map(read).join('\n')
const drillSource = read('src/civil-law-intensive-drill-layer.js')

const precedentTopics = new Set()
for (const match of precedentSource.matchAll(/['"]PART 1\|([^'"]+)['"]\s*:/g)) precedentTopics.add(match[1])

const drillTopics = new Set()
for (const match of drillSource.matchAll(/['"]PART 1\|POINT\s+\d+\|([^'"]+)['"]\s*:/g)) drillTopics.add(match[1])

const missingPrecedent = leaves.filter(({ topic }) => !precedentTopics.has(topic))
const missingDrill = leaves.filter(({ topic }) => !drillTopics.has(topic))
const bothMissing = leaves.filter(({ topic }) => !precedentTopics.has(topic) && !drillTopics.has(topic))

console.log(`PART1 leaves: ${leaves.length}`)
console.log(`leaf-specific precedent: ${leaves.length - missingPrecedent.length}/${leaves.length}`)
console.log(`leaf-specific intensive drill: ${leaves.length - missingDrill.length}/${leaves.length}`)
console.log(`both missing: ${bothMissing.length}`)
console.log('--- missing precedent ---')
missingPrecedent.forEach(({ point, topic }) => console.log(`POINT ${point} | ${topic}`))
console.log('--- missing drill ---')
missingDrill.forEach(({ point, topic }) => console.log(`POINT ${point} | ${topic}`))
