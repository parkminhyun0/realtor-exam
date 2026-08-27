import { civilLawParts, civilLawPointCount, civilLawTopicCount } from '../src/data/civilLawToc3Level.js'
import {
  civilLawConceptHubs,
  civilLawExplicitLinks,
  civilLawLearningGraphMeta,
} from '../src/data/civilLawLearningGraph.js'

const nodes = civilLawParts.flatMap((part) => (
  part.points.flatMap((point) => point.topics.map((topic) => `${point.id}|${topic}`))
))
const nodeSet = new Set(nodes)

if (civilLawParts.length !== 4) throw new Error(`Expected 4 civil-law PARTs, got ${civilLawParts.length}`)
if (civilLawPointCount !== 23) throw new Error(`Expected 23 civil-law POINTs, got ${civilLawPointCount}`)
if (civilLawTopicCount !== 182) throw new Error(`Expected 182 civil-law topics, got ${civilLawTopicCount}`)
if (nodeSet.size !== 182) throw new Error(`Expected 182 unique civil-law topic keys, got ${nodeSet.size}`)
if (!civilLawLearningGraphMeta.bookOrderImmutable) throw new Error('BOOK order must remain immutable in the learning graph')

for (const hub of civilLawConceptHubs) {
  if (!hub.id || !hub.label || !hub.memory || !hub.keywords?.length || !hub.targets?.length) {
    throw new Error(`Incomplete concept hub: ${hub.id || hub.label || 'unknown'}`)
  }
  for (const target of hub.targets) {
    if (!nodeSet.has(target)) throw new Error(`Unknown concept-hub target: ${hub.id} -> ${target}`)
  }
}

for (const link of civilLawExplicitLinks) {
  if (!nodeSet.has(link.from)) throw new Error(`Unknown explicit-link source: ${link.from}`)
  if (!nodeSet.has(link.to)) throw new Error(`Unknown explicit-link target: ${link.to}`)
  if (!civilLawLearningGraphMeta.relationTypes.includes(link.type)) {
    throw new Error(`Unsupported relation type: ${link.type}`)
  }
  if (!link.label || !link.reason) throw new Error(`Explicit link requires label/reason: ${link.from} -> ${link.to}`)
}

const contractHub = civilLawConceptHubs.find((hub) => hub.id === 'contract-classification')
for (const keyword of ['쌍무계약', '편무계약', '낙성계약', '요물계약']) {
  if (!contractHub?.keywords.includes(keyword)) throw new Error(`Contract classification hub missing ${keyword}`)
}

console.log(`Civil BOOK-MAP-EXAM graph verified: ${civilLawParts.length} PARTs / ${civilLawPointCount} POINTs / ${civilLawTopicCount} topics / ${civilLawConceptHubs.length} concept hubs / ${civilLawExplicitLinks.length} explicit cross-links.`)
