import { taxLawParts } from './data/taxLaw'
import { civilLawParts } from './data/civilLawToc3Level'
import { civilLawContent } from './data/civilLawContent'
import { civilLawPart2Content } from './data/civilLawPart2Content'
import { civilLawPart3Content } from './data/civilLawPart3Content'
import { civilLawPart4Content } from './data/civilLawPart4Content'
import { realEstateTheoryParts } from './data/realEstateTheory'
import { realEstateTheoryExtraChapters } from './data/realEstateTheoryExtra'
import { registrationLawParts, registrationLawContent } from './data/registrationLaw'
import { registrationLawExamDetail } from './data/registrationLawExamDetail'
import { brokerageLawCategories } from './data/brokerageLawHierarchy'
import { publicLawChapters } from './data/publicLaw'
import './subject-four-level-nav.css'

const LEVEL_LABELS = ['카테고리', '대분류', '중분류', '소분류']
const COLLAPSE_KEY = 'realtor-exam:toc-collapsed'
const civilStudyContent = {
  ...civilLawContent,
  ...civilLawPart2Content,
  ...civilLawPart3Content,
  ...civilLawPart4Content,
}
const theoryParts = realEstateTheoryParts.map((part) => (
  part.id === 'part8'
    ? { ...part, chapters: [...part.chapters, ...realEstateTheoryExtraChapters] }
    : part
))

let scheduled = false
let publicOutlineRevision = 0
const publicOutlineMap = new Map()

function compactText(value = '', max = 48) {
  const text = String(value).replace(/\s+/g, ' ').trim()
  if (text.length <= max) return text
  return `${text.slice(0, max - 1).trim()}…`
}

function normalize(value = '') {
  return String(value)
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[^0-9a-z가-힣]/g, '')
}

function plainTitle(value = '') {
  return String(value)
    .replace(/^PART\s*\d+\s*/i, '')
    .replace(/^POINT\s*\d+\s*[·.-]?\s*/i, '')
    .replace(/^제\s*\d+\s*(?:편|장|절)\s*/i, '')
    .replace(/^카테고리\s*\d+\s*[·.-]?\s*/i, '')
    .replace(/^대분류\s*\d+\s*[·.-]?\s*/i, '')
    .replace(/^중분류\s*\d+\s*[·.-]?\s*/i, '')
    .trim()
}

function makeNode({ id, label, matchText, title, sourceId, fallbackSourceId, scrollText, iframe = false, color, children = [], count, activeSource = true, matchHeading = false }) {
  return {
    id,
    label,
    matchText: matchText || plainTitle(label),
    title: title || label,
    sourceId,
    fallbackSourceId,
    scrollText,
    iframe,
    color,
    children,
    count: count ?? children.length,
    activeSource,
    matchHeading,
  }
}

function scoreCivilEntry(topic, candidate) {
  const topicText = normalize(topic)
  const candidateText = normalize(candidate)
  if (!topicText || !candidateText) return 0
  let score = candidateText.includes(topicText) || topicText.includes(candidateText) ? 12 : 0
  String(topic).split(/[\s·,()/]+/).filter((token) => token.length >= 2).forEach((token) => {
    const normalized = normalize(token)
    if (normalized && candidateText.includes(normalized)) score += normalized.length >= 4 ? 4 : 2
  })
  return score
}

function civilLeaves(point, topic, topicIndex) {
  const content = civilStudyContent[point.id]
  const entries = (content?.sections || []).flatMap((section) => (
    (section.items || []).map((entry) => {
      if (Array.isArray(entry)) return { label: entry[0], text: `${entry[0]} ${entry[1] || ''}` }
      return { label: entry?.term || entry?.title || '', text: JSON.stringify(entry || {}) }
    })
  )).filter((entry) => entry.label)

  const ranked = entries
    .map((entry) => ({ ...entry, score: scoreCivilEntry(topic, entry.text) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)

  let picks = ranked.slice(0, 4)
  if (!picks.length && entries.length) {
    const start = Math.min(topicIndex, Math.max(entries.length - 1, 0))
    picks = entries.slice(start, Math.min(start + 3, entries.length))
  }
  if (!picks.length) picks = [{ label: topic }]

  return [...new Map(picks.map((item) => [item.label, item])).values()].map((entry, index) => makeNode({
    id: `civil:leaf:${point.id}:${topicIndex}:${index}`,
    label: compactText(entry.label, 42),
    title: entry.label,
    sourceId: `civil:topic:${point.id}:${topicIndex}`,
    fallbackSourceId: `civil:point:${point.id}`,
    scrollText: entry.label,
    activeSource: false,
  }))
}

function buildTaxTree() {
  return taxLawParts.map((part) => makeNode({
    id: `tax:category:${part.id}`,
    label: `PART ${part.number} · ${part.title}`,
    matchText: part.title,
    sourceId: `tax:part:${part.id}`,
    color: part.color,
    children: part.points.map((point) => makeNode({
      id: `tax:major:${point.id}`,
      label: `POINT ${point.number} · ${point.title}`,
      matchText: point.title,
      sourceId: `tax:point:${point.id}`,
      children: point.groups.map((group, groupIndex) => makeNode({
        id: `tax:middle:${point.id}:${groupIndex}`,
        label: group.title,
        sourceId: `tax:group:${point.id}:${groupIndex}`,
        fallbackSourceId: `tax:point:${point.id}`,
        children: group.topics.map((topic) => makeNode({
          id: `tax:leaf:${point.id}:${groupIndex}:${topic}`,
          label: topic,
          sourceId: `tax:leaf:${point.id}:${topic}`,
          fallbackSourceId: `tax:point:${point.id}`,
          scrollText: topic,
        })),
      })),
    })),
  }))
}

function buildCivilTree() {
  return civilLawParts.map((part) => makeNode({
    id: `civil:category:${part.id}`,
    label: `PART ${part.number} · ${part.title}`,
    matchText: part.title,
    sourceId: `civil:part:${part.id}`,
    color: part.color,
    children: part.points.map((point) => makeNode({
      id: `civil:major:${point.id}`,
      label: `POINT ${point.number} · ${point.title}`,
      matchText: point.title,
      sourceId: `civil:point:${point.id}`,
      children: point.topics.map((topic, topicIndex) => makeNode({
        id: `civil:middle:${point.id}:${topicIndex}`,
        label: topic,
        matchText: topic,
        sourceId: `civil:topic:${point.id}:${topicIndex}`,
        fallbackSourceId: `civil:point:${point.id}`,
        matchHeading: true,
        children: civilLeaves(point, topic, topicIndex),
      })),
    })),
  }))
}

function buildTheoryTree() {
  return theoryParts.map((part) => makeNode({
    id: `theory:category:${part.id}`,
    label: `제${Number(part.number)}편 · ${part.title}`,
    matchText: part.title,
    sourceId: `theory:part:${part.id}`,
    color: part.color,
    children: part.chapters.map((chapter) => makeNode({
      id: `theory:major:${chapter.id}`,
      label: `제${Number(chapter.number)}장 · ${chapter.title}`,
      matchText: chapter.title,
      sourceId: `theory:chapter:${chapter.id}`,
      children: (chapter.sections || []).map((section, sectionIndex) => makeNode({
        id: `theory:middle:${chapter.id}:${sectionIndex}`,
        label: section.title,
        sourceId: `theory:chapter:${chapter.id}`,
        fallbackSourceId: `theory:chapter:${chapter.id}`,
        scrollText: section.title,
        activeSource: false,
        children: (section.items?.length ? section.items : [section.title]).map((item, itemIndex) => makeNode({
          id: `theory:leaf:${chapter.id}:${sectionIndex}:${itemIndex}`,
          label: compactText(item, 46),
          title: item,
          sourceId: `theory:chapter:${chapter.id}`,
          fallbackSourceId: `theory:chapter:${chapter.id}`,
          scrollText: item,
          activeSource: false,
        })),
      })),
    })),
  }))
}

function buildRegistrationMiddle(point) {
  const detail = registrationLawExamDetail[point.id]
  if (detail?.topics?.length) {
    return detail.topics.map((topic, topicIndex) => makeNode({
      id: `registration:middle:${point.id}:${topicIndex}`,
      label: topic.title,
      sourceId: `registration:point:${point.id}`,
      fallbackSourceId: `registration:point:${point.id}`,
      scrollText: topic.title,
      activeSource: false,
      children: (topic.points?.length ? topic.points : [topic.title]).map((text, leafIndex) => makeNode({
        id: `registration:leaf:${point.id}:${topicIndex}:${leafIndex}`,
        label: compactText(text, 44),
        title: text,
        sourceId: `registration:point:${point.id}`,
        fallbackSourceId: `registration:point:${point.id}`,
        scrollText: text,
        activeSource: false,
      })),
    }))
  }

  const content = registrationLawContent[point.id]
  if (content?.understanding?.length) {
    return content.understanding.map(([title, body], index) => makeNode({
      id: `registration:middle:${point.id}:${index}`,
      label: title,
      sourceId: `registration:point:${point.id}`,
      fallbackSourceId: `registration:point:${point.id}`,
      scrollText: title,
      activeSource: false,
      children: [makeNode({
        id: `registration:leaf:${point.id}:${index}:0`,
        label: compactText(body, 44),
        title: body,
        sourceId: `registration:point:${point.id}`,
        fallbackSourceId: `registration:point:${point.id}`,
        scrollText: body,
        activeSource: false,
      })],
    }))
  }

  return [makeNode({
    id: `registration:middle:${point.id}:0`,
    label: point.title,
    sourceId: `registration:point:${point.id}`,
    children: [makeNode({
      id: `registration:leaf:${point.id}:0:0`,
      label: '핵심정리',
      sourceId: `registration:point:${point.id}`,
      activeSource: false,
    })],
  })]
}

function buildRegistrationTree() {
  return registrationLawParts.map((part) => makeNode({
    id: `registration:category:${part.id}`,
    label: `PART ${part.number} · ${part.shortTitle}`,
    matchText: part.shortTitle,
    sourceId: `registration:part:${part.id}`,
    color: part.color,
    children: part.points.map((point) => makeNode({
      id: `registration:major:${point.id}`,
      label: `POINT ${point.number} · ${point.title}`,
      matchText: point.title,
      sourceId: `registration:point:${point.id}`,
      children: buildRegistrationMiddle(point),
    })),
  }))
}

function buildBrokerageTree() {
  return brokerageLawCategories.map((category) => makeNode({
    id: `brokerage:category:${category.id}`,
    label: `카테고리 ${category.number} · ${category.title}`,
    matchText: category.title,
    sourceId: `brokerage:category:${category.id}`,
    color: category.color,
    children: category.majors.map((major) => makeNode({
      id: `brokerage:major:${major.id}`,
      label: `대분류 ${major.number} · ${major.title}`,
      matchText: major.title,
      sourceId: `brokerage:major:${major.id}`,
      children: major.middles.map((middle) => makeNode({
        id: `brokerage:middle:${middle.id}`,
        label: `중분류 ${middle.number} · ${middle.title}`,
        matchText: middle.title,
        sourceId: `brokerage:middle:${middle.id}`,
        children: middle.leaves.map((leaf) => makeNode({
          id: `brokerage:leaf:${leaf.id}`,
          label: leaf.title,
          sourceId: `brokerage:leaf:${leaf.id}`,
          fallbackSourceId: `brokerage:middle:${middle.id}`,
          scrollText: leaf.title,
        })),
      })),
    })),
  }))
}

function fallbackPublicMiddle(section) {
  return [makeNode({
    id: `public:middle:${section.id}:fallback`,
    label: plainTitle(section.title) || '핵심정리',
    sourceId: `public:section:${section.id}`,
    fallbackSourceId: `public:section:${section.id}`,
    activeSource: false,
    children: [makeNode({
      id: `public:leaf:${section.id}:fallback`,
      label: '본문 핵심정리',
      sourceId: `public:section:${section.id}`,
      fallbackSourceId: `public:section:${section.id}`,
      activeSource: false,
    })],
  })]
}

function buildPublicTree() {
  return publicLawChapters.map((chapter) => makeNode({
    id: `public:category:${chapter.id}`,
    label: `제${chapter.number}장 · ${chapter.shortTitle}`,
    matchText: chapter.shortTitle,
    sourceId: `public:chapter:${chapter.id}`,
    color: chapter.color,
    children: chapter.sections.map((section) => makeNode({
      id: `public:major:${section.id}`,
      label: section.title,
      matchText: plainTitle(section.title),
      sourceId: `public:section:${section.id}`,
      children: publicOutlineMap.get(section.id) || fallbackPublicMiddle(section),
    })),
  }))
}

function detectSubject(page) {
  if (page.classList.contains('tax-law-page')) return 'tax'
  if (page.classList.contains('brokerage-law-page')) return 'brokerage'
  if (page.classList.contains('registration-law-page')) return 'registration'
  if (page.classList.contains('real-estate-theory-page')) return 'theory'
  if (page.classList.contains('civil-law-page')) return 'civil'
  if (page.querySelector('.public-law-frame')) return 'public'
  return null
}

function subjectTitle(subject) {
  return {
    tax: '부동산세법',
    civil: '민법 및 민사특별법',
    theory: '부동산학개론',
    registration: '부동산공시법',
    brokerage: '공인중개사법령 및 중개실무',
    public: '부동산공법',
  }[subject] || '과목 목차'
}

function buildSubjectTree(subject) {
  if (subject === 'tax') return buildTaxTree()
  if (subject === 'civil') return buildCivilTree()
  if (subject === 'theory') return buildTheoryTree()
  if (subject === 'registration') return buildRegistrationTree()
  if (subject === 'brokerage') return buildBrokerageTree()
  if (subject === 'public') return buildPublicTree()
  return []
}

function tag(element, id) {
  if (element) element.dataset.unifiedSourceId = id
}

function tagTaxSource(sourceNav) {
  const partDetails = [...sourceNav.querySelectorAll(':scope > details')]
  taxLawParts.forEach((part, partIndex) => {
    const detail = partDetails[partIndex]
    tag(detail?.querySelector(':scope > summary'), `tax:part:${part.id}`)
    const pointButtons = [...(detail?.querySelectorAll(':scope > ul > li > button') || [])]
    part.points.forEach((point, pointIndex) => {
      tag(pointButtons[pointIndex], `tax:point:${point.id}`)
      const groupButtons = [...sourceNav.querySelectorAll(`#tax-nav-groups-${point.id} > li > button`)]
      groupButtons.forEach((button, groupIndex) => tag(button, `tax:group:${point.id}:${groupIndex}`))
    })
  })
  sourceNav.querySelectorAll('[data-tax-leaf-target][data-tax-point-target]').forEach((button) => {
    tag(button, `tax:leaf:${button.dataset.taxPointTarget}:${button.dataset.taxLeafTarget}`)
  })
}

function tagCivilSource(sourceNav) {
  const partDetails = [...sourceNav.querySelectorAll(':scope > details')]
  civilLawParts.forEach((part, partIndex) => {
    const detail = partDetails[partIndex]
    tag(detail?.querySelector(':scope > summary'), `civil:part:${part.id}`)
    const pointDetails = [...(detail?.querySelectorAll('.civil-nav-point') || [])]
    part.points.forEach((point, pointIndex) => {
      const pointDetail = pointDetails[pointIndex]
      tag(pointDetail?.querySelector(':scope > summary'), `civil:point:${point.id}`)
      const topicButtons = [...(pointDetail?.querySelectorAll('.civil-nav-topic-button') || [])]
      topicButtons.forEach((button, topicIndex) => tag(button, `civil:topic:${point.id}:${topicIndex}`))
    })
  })
}

function tagTheorySource(sourceNav) {
  const partDetails = [...sourceNav.querySelectorAll(':scope > details')]
  theoryParts.forEach((part, partIndex) => {
    const detail = partDetails[partIndex]
    tag(detail?.querySelector(':scope > summary'), `theory:part:${part.id}`)
    const chapterButtons = [...(detail?.querySelectorAll(':scope > ul > li > button') || [])]
    part.chapters.forEach((chapter, chapterIndex) => tag(chapterButtons[chapterIndex], `theory:chapter:${chapter.id}`))
  })
}

function tagRegistrationSource(sourceNav) {
  const partDetails = [...sourceNav.querySelectorAll(':scope > details')]
  registrationLawParts.forEach((part, partIndex) => {
    const detail = partDetails[partIndex]
    tag(detail?.querySelector(':scope > summary'), `registration:part:${part.id}`)
    const pointDetails = [...(detail?.querySelectorAll('.registration-point') || [])]
    part.points.forEach((point, pointIndex) => {
      const pointDetail = pointDetails[pointIndex]
      tag(pointDetail?.querySelector(':scope > summary') || pointDetail?.querySelector('.registration-point-open'), `registration:point:${point.id}`)
    })
  })
}

function tagBrokerageSource(sourceNav) {
  const categoryDetails = [...sourceNav.querySelectorAll(':scope > .brokerage-category')]
  brokerageLawCategories.forEach((category, categoryIndex) => {
    const categoryDetail = categoryDetails[categoryIndex]
    tag(categoryDetail?.querySelector(':scope > summary'), `brokerage:category:${category.id}`)
    const majorDetails = [...(categoryDetail?.querySelectorAll(':scope > .brokerage-category__body > .brokerage-major') || [])]
    category.majors.forEach((major, majorIndex) => {
      const majorDetail = majorDetails[majorIndex]
      tag(majorDetail?.querySelector(':scope > summary'), `brokerage:major:${major.id}`)
      const middleItems = [...(majorDetail?.querySelectorAll(':scope > .brokerage-middle-nav > li') || [])]
      major.middles.forEach((middle, middleIndex) => {
        const middleItem = middleItems[middleIndex]
        tag(middleItem?.querySelector(':scope > button'), `brokerage:middle:${middle.id}`)
        const leafButtons = [...(middleItem?.querySelectorAll(':scope > .brokerage-leaf-nav button') || [])]
        middle.leaves.forEach((leaf, leafIndex) => tag(leafButtons[leafIndex], `brokerage:leaf:${leaf.id}`))
      })
    })
  })
}

function tagPublicSource(sourceNav) {
  const chapterDetails = [...sourceNav.querySelectorAll(':scope > details')]
  publicLawChapters.forEach((chapter, chapterIndex) => {
    const detail = chapterDetails[chapterIndex]
    tag(detail?.querySelector(':scope > summary'), `public:chapter:${chapter.id}`)
    const sectionButtons = [...(detail?.querySelectorAll(':scope > ul > li > button') || [])]
    chapter.sections.forEach((section, sectionIndex) => tag(sectionButtons[sectionIndex], `public:section:${section.id}`))
  })
}

function tagSourceControls(subject, sourceNav) {
  if (subject === 'tax') tagTaxSource(sourceNav)
  if (subject === 'civil') tagCivilSource(sourceNav)
  if (subject === 'theory') tagTheorySource(sourceNav)
  if (subject === 'registration') tagRegistrationSource(sourceNav)
  if (subject === 'brokerage') tagBrokerageSource(sourceNav)
  if (subject === 'public') tagPublicSource(sourceNav)
}

function findSource(page, sourceId) {
  if (!sourceId) return null
  return [...page.querySelectorAll('[data-unified-source-id]')]
    .find((element) => element.dataset.unifiedSourceId === sourceId) || null
}

function sourceIsActive(page, sourceId) {
  const source = findSource(page, sourceId)
  if (!source) return false
  if (source.classList.contains('active')) return true
  if (source.getAttribute('aria-current') === 'true') return true
  return false
}

function headingMatches(page, value) {
  if (!value) return false
  const target = normalize(value)
  if (!target) return false
  const heading = page.querySelector('.public-law-content .study-section-heading h2')?.textContent || ''
  return normalize(heading) === target
}

function breadcrumbMatches(page, value) {
  if (!value || String(value).length < 2) return false
  const breadcrumb = page.querySelector('.public-law-breadcrumb')?.textContent || ''
  return normalize(breadcrumb).includes(normalize(value))
}

function markTreeState(nodes, page) {
  const visit = (node, level) => {
    node.active = Boolean(
      (node.activeSource !== false && sourceIsActive(page, node.sourceId))
      || (node.matchHeading && headingMatches(page, node.matchText))
      || (level <= 2 && breadcrumbMatches(page, node.matchText)),
    )
    node.children.forEach((child) => visit(child, level + 1))
    node.hasActive = node.active || node.children.some((child) => child.hasActive)
  }
  nodes.forEach((node) => visit(node, 1))
  return nodes
}

function scrollToText(page, text) {
  if (!text) return false
  const targetText = normalize(text)
  if (!targetText) return false
  const content = page.querySelector('.public-law-content')
  if (!content) return false
  const candidates = [...content.querySelectorAll('h2,h3,h4,h5,strong,b,dt,summary,th')]
    .filter((element) => !element.closest('.public-law-nav'))
    .map((element) => ({ element, text: normalize(element.textContent || '') }))
    .filter((entry) => entry.text && (entry.text === targetText || entry.text.includes(targetText) || targetText.includes(entry.text)))
    .sort((a, b) => Math.abs(a.text.length - targetText.length) - Math.abs(b.text.length - targetText.length))
  if (!candidates.length) return false
  candidates[0].element.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' })
  return true
}

function scrollToIframeText(page, text, attempt = 0) {
  const frame = page.querySelector('.public-law-frame')
  const doc = frame?.contentDocument
  if (!frame || !doc?.body) {
    if (attempt < 10) window.setTimeout(() => scrollToIframeText(page, text, attempt + 1), 100)
    return false
  }
  const targetText = normalize(text)
  const candidates = [...doc.querySelectorAll('h3,h4,h5,h6,.deep-title,.t,strong,b,dt,th')]
    .map((element) => ({ element, text: normalize(element.textContent || '') }))
    .filter((entry) => entry.text && (entry.text === targetText || entry.text.includes(targetText) || targetText.includes(entry.text)))
    .sort((a, b) => Math.abs(a.text.length - targetText.length) - Math.abs(b.text.length - targetText.length))
  if (!candidates.length) return false
  const iframeRect = frame.getBoundingClientRect()
  const targetRect = candidates[0].element.getBoundingClientRect()
  const top = window.scrollY + iframeRect.top + targetRect.top - 140
  window.scrollTo({ top: Math.max(0, top), behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
  return true
}

function activateNode(page, node) {
  const direct = findSource(page, node.sourceId)
  const fallback = findSource(page, node.fallbackSourceId)
  const target = direct || fallback
  if (target) target.click()

  window.setTimeout(() => {
    if (!direct && node.sourceId) findSource(page, node.sourceId)?.click()
    if (node.scrollText) {
      if (node.iframe) scrollToIframeText(page, node.scrollText)
      else scrollToText(page, node.scrollText)
    }
    scheduleApply()
  }, 140)
}

function createRow(node, level, page, clickable = false) {
  const row = document.createElement(clickable ? 'button' : 'span')
  if (clickable) row.type = 'button'
  row.className = `unified-four-toc__row unified-four-toc__row--level-${level}${node.active ? ' is-active' : ''}`
  row.title = node.title || node.label
  row.innerHTML = `
    <span class="unified-four-toc__level">${LEVEL_LABELS[level - 1]}</span>
    ${level === 1 ? `<i class="unified-four-toc__dot" style="--toc-dot:${node.color || '#6f9fca'}"></i>` : ''}
    <span class="unified-four-toc__label">${node.label}</span>
    ${level < 4 ? `<small class="unified-four-toc__count">${node.count}</small>` : ''}
  `
  if (clickable) row.addEventListener('click', () => activateNode(page, node))
  return row
}

function renderNode(node, level, page) {
  if (level >= 4) {
    const li = document.createElement('li')
    li.className = 'unified-four-toc__leaf'
    li.append(createRow(node, 4, page, true))
    return li
  }

  const details = document.createElement('details')
  details.className = `unified-four-toc__branch unified-four-toc__branch--level-${level}`
  details.open = Boolean(node.hasActive)
  const summary = document.createElement('summary')
  summary.className = `unified-four-toc__summary${node.active ? ' is-active' : ''}`
  summary.append(createRow(node, level, page, false))
  if (level > 1 && (node.sourceId || node.fallbackSourceId)) {
    summary.addEventListener('click', () => window.queueMicrotask(() => activateNode(page, node)))
  }
  details.append(summary)

  const list = document.createElement(level === 3 ? 'ul' : 'div')
  list.className = `unified-four-toc__children unified-four-toc__children--level-${level + 1}`
  node.children.forEach((child) => list.append(renderNode(child, level + 1, page)))
  details.append(list)
  return details
}

function ensureCollapseControl(nav, layout) {
  if (nav.querySelector(':scope > [data-subject-toc-toggle]')) return
  const button = document.createElement('button')
  button.type = 'button'
  button.className = 'subject-toc-collapse-toggle'
  button.dataset.subjectTocToggle = 'true'
  button.innerHTML = '<span class="subject-toc-collapse-toggle__icon" data-subject-toc-toggle-icon aria-hidden="true">‹</span><span class="subject-toc-collapse-toggle__label" data-subject-toc-toggle-label>목차 숨기기</span>'

  const update = () => {
    const collapsed = layout.classList.contains('is-subject-toc-collapsed')
    const label = collapsed ? '목차 보기' : '목차 숨기기'
    button.setAttribute('aria-expanded', String(!collapsed))
    button.setAttribute('aria-label', label)
    button.title = label
    button.querySelector('[data-subject-toc-toggle-icon]').textContent = collapsed ? '›' : '‹'
    button.querySelector('[data-subject-toc-toggle-label]').textContent = label
  }

  button.addEventListener('click', () => {
    const collapsed = !layout.classList.contains('is-subject-toc-collapsed')
    layout.classList.toggle('is-subject-toc-collapsed', collapsed)
    layout.dataset.subjectTocCollapsed = String(collapsed)
    try { window.localStorage.setItem(COLLAPSE_KEY, String(collapsed)) } catch { /* noop */ }
    update()
  })

  nav.prepend(button)
  update()
}

function ensureVisibleNav(page, layout, sourceNav, subject) {
  let nav = layout.querySelector(':scope > .unified-four-toc')
  if (!nav) {
    nav = document.createElement('aside')
    nav.className = 'public-law-nav unified-four-toc'
    nav.dataset.mobileToc = 'true'
    nav.setAttribute('aria-label', `${subjectTitle(subject)} 4단계 목차`)
    nav.innerHTML = `
      <div class="public-law-nav__title unified-four-toc__title">
        <strong>${subjectTitle(subject)}</strong>
        <span>카테고리 → 대분류 → 중분류 → 소분류 · 4단계 고정</span>
      </div>
      <div class="unified-four-toc__tree" data-unified-four-toc-tree></div>
    `
    layout.insertBefore(nav, sourceNav)
  }
  sourceNav.classList.add('unified-four-toc__source-nav')
  sourceNav.setAttribute('aria-hidden', 'true')
  ensureCollapseControl(nav, layout)
  return nav
}

function activeSignature(page, subject) {
  const activeIds = [...page.querySelectorAll('[data-unified-source-id].active,[data-unified-source-id][aria-current="true"]')]
    .map((element) => element.dataset.unifiedSourceId)
    .sort()
    .join('|')
  const heading = page.querySelector('.study-section-heading h2')?.textContent || ''
  return `${subject}|${activeIds}|${heading}|${subject === 'public' ? publicOutlineRevision : 0}`
}

function parsePublicFrame(page) {
  const frame = page.querySelector('.public-law-frame')
  const doc = frame?.contentDocument
  if (!frame || !doc?.body) return

  const containerSelector = '.card,.section-deep,.inline-proc,.proc-table,.quiz,.box,.callout'
  const headingSelector = 'h4,h5,h6,.deep-title,.t,strong,b,dt,th'
  let changed = false

  publicLawChapters.forEach((chapter) => {
    chapter.sections.forEach((section) => {
      const root = doc.getElementById(section.id)
      if (!root) return
      const containers = [...root.querySelectorAll(containerSelector)]
        .filter((element) => {
          const parentContainer = element.parentElement?.closest(containerSelector)
          return !parentContainer || !root.contains(parentContainer)
        })
        .slice(0, 10)

      const middle = []
      containers.forEach((container, containerIndex) => {
        const header = container.querySelector(':scope > h4,:scope > h5,:scope > .deep-title,:scope > .t,:scope > strong,:scope > b')
          || container.querySelector(headingSelector)
        const rawLabel = compactText(header?.textContent || `핵심 ${containerIndex + 1}`, 46)
        if (!rawLabel || middle.some((node) => normalize(node.label) === normalize(rawLabel))) return

        const leafLabels = [...container.querySelectorAll('h5,h6,dt,li > strong,li > b,th,.t')]
          .map((element) => compactText(element.textContent || '', 42))
          .filter((label) => label && normalize(label) !== normalize(rawLabel))
        const uniqueLeaves = [...new Set(leafLabels)].slice(0, 7)
        const leaves = (uniqueLeaves.length ? uniqueLeaves : [rawLabel]).map((label, leafIndex) => makeNode({
          id: `public:leaf:${section.id}:${containerIndex}:${leafIndex}`,
          label,
          sourceId: `public:section:${section.id}`,
          fallbackSourceId: `public:section:${section.id}`,
          scrollText: label,
          iframe: true,
          activeSource: false,
        }))
        middle.push(makeNode({
          id: `public:middle:${section.id}:${containerIndex}`,
          label: rawLabel,
          sourceId: `public:section:${section.id}`,
          fallbackSourceId: `public:section:${section.id}`,
          scrollText: rawLabel,
          iframe: true,
          activeSource: false,
          children: leaves,
        }))
      })

      if (!middle.length) {
        const headings = [...root.querySelectorAll('h4,h5,.deep-title,.t')]
          .map((element) => compactText(element.textContent || '', 46))
          .filter(Boolean)
        headings.slice(0, 6).forEach((label, index) => middle.push(makeNode({
          id: `public:middle:${section.id}:h${index}`,
          label,
          sourceId: `public:section:${section.id}`,
          fallbackSourceId: `public:section:${section.id}`,
          scrollText: label,
          iframe: true,
          activeSource: false,
          children: [makeNode({
            id: `public:leaf:${section.id}:h${index}:0`,
            label,
            sourceId: `public:section:${section.id}`,
            fallbackSourceId: `public:section:${section.id}`,
            scrollText: label,
            iframe: true,
            activeSource: false,
          })],
        })))
      }

      if (middle.length) {
        const previous = JSON.stringify((publicOutlineMap.get(section.id) || []).map((node) => [node.label, node.children.map((child) => child.label)]))
        const next = JSON.stringify(middle.map((node) => [node.label, node.children.map((child) => child.label)]))
        if (previous !== next) {
          publicOutlineMap.set(section.id, middle)
          changed = true
        }
      }
    })
  })

  if (changed) {
    publicOutlineRevision += 1
    scheduleApply()
  }
}

function bindPublicFrame(page) {
  const frame = page.querySelector('.public-law-frame')
  if (!frame || frame.dataset.unifiedFourLevelBound === 'true') return
  frame.dataset.unifiedFourLevelBound = 'true'
  frame.addEventListener('load', () => window.setTimeout(() => parsePublicFrame(page), 50))
  if (frame.contentDocument?.readyState === 'complete') window.setTimeout(() => parsePublicFrame(page), 0)
}

function renderSubject(page) {
  const subject = detectSubject(page)
  if (!subject) return
  const layout = page.querySelector('.public-law-layout')
  if (!layout) return
  const sourceNav = [...layout.children].find((element) => element.matches?.('.public-law-nav') && !element.classList.contains('unified-four-toc'))
  if (!sourceNav) return

  tagSourceControls(subject, sourceNav)
  if (subject === 'public') bindPublicFrame(page)

  const nav = ensureVisibleNav(page, layout, sourceNav, subject)
  const signature = activeSignature(page, subject)
  if (nav.dataset.unifiedFourTocSignature === signature) return
  nav.dataset.unifiedFourTocSignature = signature

  const tree = markTreeState(buildSubjectTree(subject), page)
  const mount = nav.querySelector('[data-unified-four-toc-tree]')
  mount.replaceChildren(...tree.map((node) => renderNode(node, 1, page)))

  const active = mount.querySelector('.is-active')
  if (active) {
    window.requestAnimationFrame(() => {
      const navRect = nav.getBoundingClientRect()
      const activeRect = active.getBoundingClientRect()
      if (activeRect.top < navRect.top + 70 || activeRect.bottom > navRect.bottom - 20) {
        nav.scrollTop += activeRect.top - navRect.top - 90
      }
    })
  }
}

function applyAll() {
  scheduled = false
  document.querySelectorAll('main.public-law-page').forEach(renderSubject)
}

function scheduleApply() {
  if (scheduled) return
  scheduled = true
  window.requestAnimationFrame(applyAll)
}

const observer = new MutationObserver(() => scheduleApply())
observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'aria-current'] })

document.addEventListener('DOMContentLoaded', scheduleApply)
window.addEventListener('hashchange', scheduleApply)
window.setTimeout(scheduleApply, 0)
