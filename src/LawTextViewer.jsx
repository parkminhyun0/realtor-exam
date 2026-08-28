import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { subjectLawSources } from './data/lawSources'

const lawVersionCache = new Map()
const lawArticleCache = new Map()
const lawDocumentCache = new Map()
const LAW_API_BASE = 'https://www.law.go.kr/DRF'
const EXAM37_PROMULGATION_CUTOFF = 20260531

function normalizeLawName(value = '') {
  return String(value).replace(/\s+/g, '').replace(/[·ㆍ]/g, '')
}

function normalizeReference(value = '') {
  return String(value).replace(/\s+/g, '').replace(/[·ㆍ()[\]{}]/g, '')
}

function articleToJoCode(article = '') {
  const match = String(article).match(/제\s*(\d+)\s*조(?:의\s*(\d+))?/)
  if (!match) return null
  return `${String(Number(match[1])).padStart(4, '0')}${String(Number(match[2] || 0)).padStart(2, '0')}`
}

function walk(value, visitor) {
  if (Array.isArray(value)) {
    value.forEach((item) => walk(item, visitor))
    return
  }
  if (!value || typeof value !== 'object') return
  visitor(value)
  Object.values(value).forEach((item) => walk(item, visitor))
}

function cleanLawText(value) {
  if (typeof value !== 'string') return ''
  const documentNode = new DOMParser().parseFromString(`<body>${value}</body>`, 'text/html')
  return (documentNode.body.textContent || '')
    .replace(/\u00a0/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\s*\n\s*/g, '\n')
    .trim()
}

function uniquePush(list, value) {
  const text = cleanLawText(value)
  if (text && !list.includes(text)) list.push(text)
}

function extractArticle(payload, article) {
  let title = ''
  const articleLines = []
  const paragraphLines = []
  const itemLines = []
  const subitemLines = []

  walk(payload, (item) => {
    if (!title) title = cleanLawText(item['조문제목'] ?? item['조제목'] ?? '')
    uniquePush(articleLines, item['조문내용'])
    uniquePush(paragraphLines, item['항내용'])
    uniquePush(itemLines, item['호내용'])
    uniquePush(subitemLines, item['목내용'])
  })

  const detailLines = [...paragraphLines, ...itemLines, ...subitemLines]
  const introLines = articleLines
    .map((line) => line.replace(/^제\s*\d+\s*조(?:의\s*\d+)?(?:\s*\([^)]*\))?\s*/, '').trim())
    .filter((line) => line && !detailLines.some((detail) => detail === line || detail.includes(line)))

  const lines = [...introLines, ...detailLines].filter((line, index, all) => all.indexOf(line) === index)
  if (!lines.length) articleLines.forEach((line) => uniquePush(lines, line))
  return { title, lines, article }
}

function extractFullLaw(payload) {
  const lines = []
  walk(payload, (item) => {
    uniquePush(lines, item['조문내용'])
    uniquePush(lines, item['항내용'])
    uniquePush(lines, item['호내용'])
    uniquePush(lines, item['목내용'])
  })
  return lines
}

function collectReadableStrings(value) {
  const lines = []
  walk(value, (item) => {
    Object.entries(item).forEach(([key, raw]) => {
      if (typeof raw !== 'string') return
      if (/ID|Id|id|코드|일련|키|URL|url|링크|파일명|공포번호|시행일자/.test(key)) return
      const text = cleanLawText(raw)
      if (!text || /^\d+$/.test(text)) return
      uniquePush(lines, text)
    })
  })
  return lines
}

function extractNamedReference(payload, reference) {
  const wanted = normalizeReference(reference)
  let best = []

  walk(payload, (item) => {
    const markerText = Object.entries(item)
      .filter(([key, value]) => typeof value === 'string' && /별표|별지|서식|부록|제목|번호/.test(`${key}${value}`))
      .map(([, value]) => value)
      .join(' ')

    if (!markerText || !normalizeReference(markerText).includes(wanted)) return
    const lines = collectReadableStrings(item)
    if (lines.length > best.length) best = lines
  })

  return best
}

async function fetchJson(url, signal) {
  const response = await fetch(url, { signal, mode: 'cors', cache: 'no-store' })
  if (!response.ok) throw new Error(`법령정보 응답 오류 (${response.status})`)
  const text = (await response.text()).replace(/^\uFEFF/, '').trim()
  return JSON.parse(text)
}

function findExam37Version(payload, lawName) {
  const wanted = normalizeLawName(lawName)
  const exact = []
  const fallback = []

  walk(payload, (item) => {
    const name = item['법령명한글'] ?? item['법령명_한글'] ?? item['법령명']
    const mst = item['법령일련번호'] ?? item['법령일련번호_'] ?? item['MST']
    const promulgationDate = Number(item['공포일자'] ?? item['공포일'] ?? 0)
    const effectiveDate = Number(item['시행일자'] ?? item['시행일'] ?? 0)
    if (!name || !mst || !promulgationDate || promulgationDate > EXAM37_PROMULGATION_CUTOFF) return

    const candidate = {
      lawName: String(name),
      mst: String(mst),
      promulgationDate,
      effectiveDate: effectiveDate || promulgationDate,
      revisionType: String(item['제개정구분명'] ?? item['제개정구분'] ?? ''),
    }
    const normalized = normalizeLawName(name)
    if (normalized === wanted) exact.push(candidate)
    else if (normalized.includes(wanted) || wanted.includes(normalized)) fallback.push(candidate)
  })

  const candidates = exact.length ? exact : fallback
  candidates.sort((a, b) => (
    b.promulgationDate - a.promulgationDate
    || b.effectiveDate - a.effectiveDate
    || Number(b.mst) - Number(a.mst)
  ))
  return candidates[0] || null
}

async function getExam37LawVersion(lawName, signal) {
  if (lawVersionCache.has(lawName)) return lawVersionCache.get(lawName)

  const searchUrl = `${LAW_API_BASE}/lawSearch.do?OC=test&target=eflaw&type=JSON&display=100&nw=1,2,3&sort=ddes&query=${encodeURIComponent(lawName)}`
  const payload = await fetchJson(searchUrl, signal)
  const version = findExam37Version(payload, lawName)
  if (!version) throw new Error('제37회 시험 기준에 해당하는 법령 버전을 찾지 못했습니다.')

  lawVersionCache.set(lawName, version)
  return version
}

function getHistoricalOfficialUrl(version, fallbackUrl) {
  if (!version?.mst) return fallbackUrl
  return `https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=${encodeURIComponent(version.mst)}`
}

async function fetchLawArticle(lawName, article, signal) {
  const cacheKey = `${lawName}::${article}::exam37-cutoff-20260531`
  if (lawArticleCache.has(cacheKey)) return lawArticleCache.get(cacheKey)

  const version = await getExam37LawVersion(lawName, signal)
  const joCode = articleToJoCode(article)
  if (!joCode) throw new Error('조문 번호 형식을 확인할 수 없습니다.')

  const articleUrl = `${LAW_API_BASE}/lawService.do?OC=test&target=eflaw&type=JSON&MST=${encodeURIComponent(version.mst)}&efYd=${version.effectiveDate}&JO=${joCode}`
  const payload = await fetchJson(articleUrl, signal)
  const result = { ...extractArticle(payload, article), version }
  if (!result.lines.length) throw new Error('제37회 시험 기준 조문 본문을 찾지 못했습니다.')

  lawArticleCache.set(cacheKey, result)
  return result
}

async function fetchLawDocument(lawName, signal) {
  const cacheKey = `${lawName}::exam37-cutoff-20260531`
  if (lawDocumentCache.has(cacheKey)) return lawDocumentCache.get(cacheKey)

  const version = await getExam37LawVersion(lawName, signal)
  const url = `${LAW_API_BASE}/lawService.do?OC=test&target=eflaw&type=JSON&MST=${encodeURIComponent(version.mst)}&efYd=${version.effectiveDate}`
  const payload = await fetchJson(url, signal)
  const result = { payload, version }
  lawDocumentCache.set(cacheKey, result)
  return result
}

function normalizeReferences(target) {
  if (Array.isArray(target?.references) && target.references.length) {
    return target.references.map((reference) => ({
      ...reference,
      subjectId: reference.subjectId || target.subjectId,
      articles: reference.articles || (reference.article ? [reference.article] : []),
    }))
  }

  if (!target?.lawName) return []
  return [{
    subjectId: target.subjectId,
    lawName: target.lawName,
    articles: target.articles || (target.article ? [target.article] : []),
    reference: target.reference || null,
    officialUrl: target.officialUrl || null,
  }]
}

function getLawBaseUrl(reference) {
  const subject = subjectLawSources[reference?.subjectId]
  const law = subject?.laws?.find((item) => item.name === reference?.lawName)
  return reference?.officialUrl
    || law?.url
    || `https://www.law.go.kr/법령/${String(reference?.lawName || '').replace(/\s+/g, '')}`
}

function getOfficialUrl(reference, article = null) {
  if (reference?.officialUrl) return reference.officialUrl
  const base = getLawBaseUrl(reference)
  return article ? `${base}/${article}` : base
}

function formatDate(value) {
  const text = String(value || '')
  if (!/^\d{8}$/.test(text)) return text
  return `${text.slice(0, 4)}.${Number(text.slice(4, 6))}.${Number(text.slice(6, 8))}`
}

function versionLabel(version) {
  if (!version) return '제37회 시험 기준 · 2026.5.31 공포·개정 컷오프'
  return `공포 ${formatDate(version.promulgationDate)} · 시행 ${formatDate(version.effectiveDate)}${version.revisionType ? ` · ${version.revisionType}` : ''}`
}

async function loadReference(reference, signal) {
  if (reference.articles?.length) {
    const sections = []
    for (const article of reference.articles) {
      try {
        const data = await fetchLawArticle(reference.lawName, article, signal)
        sections.push({
          lawName: reference.lawName,
          citation: article,
          title: data.title,
          lines: data.lines,
          version: data.version,
          officialUrl: getHistoricalOfficialUrl(data.version, getOfficialUrl(reference, article)),
        })
      } catch (error) {
        if (error?.name === 'AbortError') throw error
        sections.push({
          lawName: reference.lawName,
          citation: article,
          lines: [],
          error: error?.message || '이 조문의 제37회 시험 기준 텍스트를 국가법령정보센터에서 불러오지 못했습니다.',
          officialUrl: getOfficialUrl(reference, article),
        })
      }
    }
    return sections
  }

  if (reference.reference) {
    try {
      const { payload, version } = await fetchLawDocument(reference.lawName, signal)
      const lines = extractNamedReference(payload, reference.reference)
      if (!lines.length) throw new Error('첨부표 텍스트 없음')
      return [{
        lawName: reference.lawName,
        citation: reference.reference,
        lines,
        version,
        officialUrl: getHistoricalOfficialUrl(version, getOfficialUrl(reference)),
      }]
    } catch (error) {
      if (error?.name === 'AbortError') throw error
      return [{
        lawName: reference.lawName,
        citation: reference.reference,
        lines: [],
        error: '이 별표의 제37회 시험 기준 텍스트를 법령정보 API에서 직접 추출하지 못했습니다.',
        officialUrl: getOfficialUrl(reference),
      }]
    }
  }

  try {
    const { payload, version } = await fetchLawDocument(reference.lawName, signal)
    const lines = extractFullLaw(payload)
    if (!lines.length) throw new Error('법령 본문 없음')
    return [{
      lawName: reference.lawName,
      citation: '전체 조문',
      lines,
      version,
      officialUrl: getHistoricalOfficialUrl(version, getOfficialUrl(reference)),
    }]
  } catch (error) {
    if (error?.name === 'AbortError') throw error
    return [{
      lawName: reference.lawName,
      citation: '전체 조문',
      lines: [],
      error: '이 법령의 제37회 시험 기준 텍스트를 국가법령정보센터에서 불러오지 못했습니다.',
      officialUrl: getOfficialUrl(reference),
    }]
  }
}

function getDialogTitle(references) {
  if (references.length !== 1) return `관련 법령 ${references.length}건`
  const reference = references[0]
  if (reference.articles?.length === 1) return `${reference.lawName} ${reference.articles[0]}`
  if (reference.articles?.length > 1) return `${reference.lawName} · 관련 조문 ${reference.articles.length}개`
  if (reference.reference) return `${reference.lawName} ${reference.reference}`
  return reference.lawName
}

export default function LawTextViewer({ open, onClose, target }) {
  const [status, setStatus] = useState('idle')
  const [sections, setSections] = useState([])
  const references = useMemo(() => normalizeReferences(target), [target])
  const dialogTitle = useMemo(() => getDialogTitle(references), [references])
  const firstOfficialUrl = sections[0]?.officialUrl || (references[0] ? getOfficialUrl(references[0]) : null)

  useEffect(() => {
    if (!open || !references.length) return undefined

    const controller = new AbortController()
    setStatus('loading')
    setSections([])

    Promise.all(references.map((reference) => loadReference(reference, controller.signal)))
      .then((groups) => {
        setSections(groups.flat())
        setStatus('success')
      })
      .catch((error) => {
        if (error?.name === 'AbortError') return
        setStatus('error')
      })

    return () => controller.abort()
  }, [open, target])

  useEffect(() => {
    if (!open) return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onClose])

  if (!open || !references.length) return null

  const onBackdropClick = (event) => {
    if (event.target === event.currentTarget) onClose()
  }

  return createPortal(
    <div className="law-viewer-backdrop" onMouseDown={onBackdropClick} role="presentation">
      <section className="law-article-popup" role="dialog" aria-modal="true" aria-labelledby="law-article-title">
        <header className="law-article-popup__header">
          <div>
            <span className="law-article-popup__eyebrow">법령조문 · 제37회 시험 기준</span>
            <h2 id="law-article-title">{dialogTitle}</h2>
          </div>
          <button className="law-viewer__close" type="button" onClick={onClose} aria-label="법령 조문 닫기">×</button>
        </header>

        <div className="law-article-popup__exam-baseline" data-exam37-law-popup="true">
          <b>시험 정답 기준</b>
          <span>2026년 5월 31일까지 공포·개정된 마지막 법령 버전을 표시합니다. 2026년 6월 1일 이후 개정분은 적용하지 않습니다.</span>
        </div>

        <div className="law-article-popup__body">
          {status === 'loading' && (
            <div className="law-article-popup__status" role="status">
              <span className="law-article-popup__spinner" aria-hidden="true" />
              <strong>제37회 시험 기준 법령 텍스트를 불러오는 중입니다.</strong>
            </div>
          )}

          {status === 'success' && (
            <article className="law-article-text">
              {sections.map((section, sectionIndex) => (
                <section className="law-article-text__section" key={`${section.lawName}-${section.citation}-${sectionIndex}`}>
                  <div className="law-article-text__heading">
                    <div>
                      <h3>
                        {section.lawName} {section.citation}
                        {section.title ? ` · (${section.title})` : ''}
                      </h3>
                      {section.version && <small className="law-article-text__version">{versionLabel(section.version)}</small>}
                    </div>
                    <a href={section.officialUrl} target="_blank" rel="noreferrer">해당 버전 원문 ↗</a>
                  </div>
                  {section.error
                    ? <p className="law-article-text__error">{section.error} 원문 링크에서 국가법령정보센터를 확인해 주세요.</p>
                    : section.lines.map((line, index) => <p key={`${index}-${line}`}>{line}</p>)}
                </section>
              ))}
            </article>
          )}

          {status === 'error' && (
            <div className="law-article-popup__status" role="status">
              <strong>제37회 시험 기준 법령 텍스트를 불러오지 못했습니다.</strong>
              <span>6월 이후 개정법으로 시험 정답을 대체하지 않습니다. 국가법령정보센터 연혁 원문을 확인해 주세요.</span>
            </div>
          )}
        </div>

        <footer className="law-article-popup__footer">
          <span>법제처 국가법령정보센터 · 제37회 시험용 2026.5.31 공포·개정 컷오프</span>
          {firstOfficialUrl && <a href={firstOfficialUrl} target="_blank" rel="noreferrer">법령 연혁 원문 ↗</a>}
        </footer>
      </section>
    </div>,
    document.body,
  )
}
