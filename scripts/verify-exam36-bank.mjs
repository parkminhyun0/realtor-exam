import { EXAM36_QNET_URL, exam36QuestionBank, exam36SubjectCounts, exam36TotalCount } from '../src/data/exam36TransformedQuestions.js'

const expected = {
  'real-estate-theory': { count: 40, start: 1, end: 40 },
  'civil-law': { count: 40, start: 41, end: 80 },
  'brokerage-law': { count: 40, start: 1, end: 40 },
  'public-law': { count: 40, start: 41, end: 80 },
  'registration-law': { count: 24, start: 1, end: 24 },
  'tax-law': { count: 16, start: 25, end: 40 },
}

const errors = []

if (!EXAM36_QNET_URL.includes('q-net.or.kr')) errors.push('Q-Net official source URL is missing.')
if (exam36TotalCount !== 200) errors.push(`Expected 200 transformed questions, got ${exam36TotalCount}.`)

for (const [subjectId, rule] of Object.entries(expected)) {
  const items = exam36QuestionBank[subjectId] || []
  if (items.length !== rule.count) errors.push(`${subjectId}: expected ${rule.count}, got ${items.length}.`)
  if (exam36SubjectCounts[subjectId] !== rule.count) errors.push(`${subjectId}: exported count mismatch.`)

  const sourceNos = items.map((item) => item.sourceNo)
  const unique = new Set(sourceNos)
  if (unique.size !== items.length) errors.push(`${subjectId}: duplicate source numbers.`)

  for (let no = rule.start; no <= rule.end; no += 1) {
    if (!unique.has(no)) errors.push(`${subjectId}: source question ${no} missing.`)
  }

  items.forEach((item, index) => {
    for (const key of ['topic', 'prompt', 'answer', 'explanation', 'format', 'sourceFile', 'label']) {
      if (!String(item[key] ?? '').trim()) errors.push(`${subjectId}[${index}] missing ${key}.`)
    }
    if (!Number.isInteger(item.sourcePage) || item.sourcePage < 1) errors.push(`${subjectId}[${index}] invalid sourcePage.`)
    if (item.prompt.length < 20) errors.push(`${subjectId}[${index}] prompt too short.`)
    if (item.explanation.length < 20) errors.push(`${subjectId}[${index}] explanation too short.`)
  })
}

if (errors.length) {
  console.error('Exam36 transformed bank verification failed:')
  errors.slice(0, 80).forEach((error) => console.error(`- ${error}`))
  if (errors.length > 80) console.error(`...and ${errors.length - 80} more`)
  process.exit(1)
}

console.log('Exam36 transformed bank verified: 200/200 questions across 6 subjects.')
