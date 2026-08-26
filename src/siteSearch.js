import { allSubjects } from './data/subjects'
import * as civilLawData from './data/civilLaw'
import * as civilLawContentData from './data/civilLawContent'
import * as publicLawData from './data/publicLaw'
import * as realEstateTheoryData from './data/realEstateTheory'
import * as realEstateTheoryContentData from './data/realEstateTheoryContent'
import * as realEstateTheoryHandoutData from './data/realEstateTheoryHandoutContent'
import * as realEstateTheorySupplementData from './data/realEstateTheoryHandoutSupplement'
import * as realEstateTheoryCalculationData from './data/realEstateTheoryCalculations'
import * as realEstateTheoryRelationsData from './data/realEstateTheoryRelations'
import * as realEstateTheoryExtraData from './data/realEstateTheoryExtra'
import * as registrationLawData from './data/registrationLaw'
import * as registrationLawDeepDive from './data/registrationLawDeepDive'
import * as registrationLawExamCore from './data/registrationLawExamCore'

const subjectData = {
  'real-estate-theory': [
    realEstateTheoryData,
    realEstateTheoryContentData,
    realEstateTheoryHandoutData,
    realEstateTheorySupplementData,
    realEstateTheoryCalculationData,
    realEstateTheoryRelationsData,
    realEstateTheoryExtraData,
  ],
  'civil-law': [civilLawData, civilLawContentData],
  'public-law': [publicLawData],
  'registration-law': [registrationLawData, registrationLawDeepDive, registrationLawExamCore],
}

const labelKeys = ['title', 'name', 'label', 'term', 'heading', 'chapterTitle', 'sectionTitle', 'pointTitle', 'shortTitle']
const ignoredKeys = new Set(['id', 'color', 'icon', 'status', 'featured', 'url'])
const TARGET_ID_PATTERN = /^(?:c\d+s\d+|p\d+s\d+|p\d+c\d+)$/i
const TARGET_ID_IN_PATH_PATTERN = /(?:^|\.)(c\d+s\d+|p\d+s\d+|p\d+c\d+)(?=\.|\[|$)/i
const PUBLIC_LAW_TARGET_HINTS = [
  ['기반시설부담구역', 'c1s10'],
  ['개발밀도관리구역', 'c1s10'],
  ['도시 군계획시설', 'c1s7'],
  ['도시 군관리계획', 'c1s4'],
  ['도시 군기본계획', 'c1s3'],
  ['광역도시계획', 'c1s2'],
  ['지구단위계획', 'c1s8'],
  ['개발행위허가', 'c1s9'],
  ['용도지역', 'c1s6'],
  ['용도지구', 'c1s6'],
  ['용도구역', 'c1s6'],
  ['용적률', 'c1s10'],
  ['건폐율', 'c1s10'],
  ['기반시설', 'c1s7'],
  ['국가계획', 'c1s1'],
]

function normalize(value) {
  return String(value ?? '')
    .toLocaleLowerCase('ko-KR')
    .replace(/[\u00b7·•|/_,()[\]{}:;!?"'`~<>+=*\\-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function readableKey(key) {
  return key
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .trim()
}

function getLocalLabel(value, fallback) {
  if (!value || Array.isArray(value) || typeof value !== 'object') return fallback
  for (const key of labelKeys) {
    if (typeof value[key] === 'string' && value[key].trim()) return value[key].trim()
  }
  return fallback
}

function resolveTargetId(value, path, inheritedTargetId = '') {
  if (value && !Array.isArray(value) && typeof value === 'object') {
    const ownId = typeof value.id === 'string' ? value.id.trim() : ''
    if (TARGET_ID_PATTERN.test(ownId)) return ownId
  }

  const pathMatch = String(path || '').match(TARGET_ID_IN_PATH_PATTERN)
  if (pathMatch) return pathMatch[1]
  return inheritedTargetId
}

function inferTargetId(subjectId, context, text, targetId) {
  if (targetId || subjectId !== 'public-law') return targetId
  const haystack = normalize(`${context} ${text}`)
  const hint = PUBLIC_LAW_TARGET_HINTS.find(([keyword]) => haystack.includes(normalize(keyword)))
  return hint?.[1] || ''
}

function collectLeafEntries(value, subject, out, context = subject.title, path = '', inheritedTargetId = '') {
  if (value == null) return

  const resolvedTargetId = resolveTargetId(value, path, inheritedTargetId)

  if (typeof value === 'string' || typeof value === 'number') {
    const text = String(value).trim()
    if (text.length < 2) return
    out.push({
      subjectId: subject.id,
      subjectTitle: subject.title,
      shortTitle: subject.shortTitle,
      context: context || subject.title,
      path,
      targetId: inferTargetId(subject.id, context, text, resolvedTargetId),
      text,
      haystack: normalize(`${subject.title} ${subject.shortTitle} ${context} ${text}`),
    })
    return
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => collectLeafEntries(
      item,
      subject,
      out,
      context,
      `${path}[${index}]`,
      resolvedTargetId,
    ))
    return
  }

  if (typeof value === 'object') {
    const localLabel = getLocalLabel(value, context)
    Object.entries(value).forEach(([key, child]) => {
      if (ignoredKeys.has(key)) return
      const nextContext = labelKeys.includes(key) ? localLabel : (localLabel || readableKey(key) || context)
      const nextPath = path ? `${path}.${key}` : key
      collectLeafEntries(child, subject, out, nextContext, nextPath, resolvedTargetId)
    })
  }
}

const searchEntries = []

allSubjects.forEach((subject) => {
  const metadataText = [subject.title, subject.shortTitle, subject.description].filter(Boolean).join(' · ')
  searchEntries.push({
    subjectId: subject.id,
    subjectTitle: subject.title,
    shortTitle: subject.shortTitle,
    context: '과목 안내',
    path: 'subject',
    targetId: '',
    text: metadataText,
    haystack: normalize(metadataText),
  })

  for (const dataset of subjectData[subject.id] || []) {
    collectLeafEntries(dataset, subject, searchEntries)
  }
})

function makeSnippet(text, normalizedQuery) {
  const source = String(text).replace(/\s+/g, ' ').trim()
  if (source.length <= 180) return source

  const sourceLower = source.toLocaleLowerCase('ko-KR')
  const firstToken = normalizedQuery.split(' ')[0]
  const index = sourceLower.indexOf(firstToken)
  const start = Math.max(0, index > -1 ? index - 55 : 0)
  const end = Math.min(source.length, start + 180)
  return `${start > 0 ? '…' : ''}${source.slice(start, end)}${end < source.length ? '…' : ''}`
}

export function searchSite(query, limit = 18) {
  const normalizedQuery = normalize(query)
  if (!normalizedQuery) return []

  const tokens = normalizedQuery.split(' ').filter(Boolean)
  const dedupe = new Set()

  return searchEntries
    .map((entry) => {
      if (!tokens.every((token) => entry.haystack.includes(token))) return null

      const title = normalize(entry.subjectTitle)
      const context = normalize(entry.context)
      const text = normalize(entry.text)
      let score = 0

      if (title.includes(normalizedQuery)) score += 120
      if (context.includes(normalizedQuery)) score += 70
      if (text.includes(normalizedQuery)) score += 50
      if (entry.targetId) score += 6
      score += tokens.reduce((sum, token) => {
        if (title.includes(token)) return sum + 18
        if (context.includes(token)) return sum + 12
        if (text.includes(token)) return sum + 8
        return sum
      }, 0)
      score += Math.max(0, 12 - Math.floor(entry.text.length / 120))

      return {
        ...entry,
        score,
        snippet: makeSnippet(entry.text, normalizedQuery),
      }
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score)
    .filter((entry) => {
      const key = `${entry.subjectId}|${entry.targetId}|${entry.context}|${entry.snippet}`
      if (dedupe.has(key)) return false
      dedupe.add(key)
      return true
    })
    .slice(0, limit)
}
