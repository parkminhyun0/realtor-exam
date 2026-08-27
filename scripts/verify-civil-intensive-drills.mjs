import fs from 'node:fs'

const path = 'src/civil-law-intensive-drill-layer.js'
const source = fs.readFileSync(path, 'utf8')
const drillMatch = source.match(/const DRILLS = \{([\s\S]*?)\n\}\n\nconst EXTRA_RELATED/)
if (!drillMatch) throw new Error('DRILLS map not found')
const topicCount = (drillMatch[1].match(/'PART \d\|POINT \d+\|/g) || []).length
const itemCount = (drillMatch[1].match(/\['[OX]','/g) || []).length
if (topicCount < 20) throw new Error(`Expected at least 20 intensive drill topics, got ${topicCount}`)
if (itemCount < 60) throw new Error(`Expected at least 60 O/X items, got ${itemCount}`)
if (!source.includes('법령 LAW-FIRST/판례 레이어를 대체하지 않고')) throw new Error('LAW-FIRST safeguard note missing')
console.log(`civil intensive drills verified: ${topicCount} topics / ${itemCount} OX items`)
