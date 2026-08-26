import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { subjectLawSources } from './data/lawSources'

const lawIdCache = new Map()
const lawArticleCache = new Map()
const LAW_API_BASE = 'https://www.law.go.kr/DRF'

function normalizeLawName(value = '') {
  return String(value).replace(/\s+/g, '').replace(/[·ㆍ]/g, '')
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

function findLawId(payload, lawName) {
  const wanted = normalizeLawName(lawName)
  let exact = null
  let fallback = null

  walk(payload, (item) => {
    const name = item['법령명한글'] ?? item['법령명_한글'] ?? item['법령명']
    const id = item['법령ID'] ?? item['법령Id'] ?? item['법령id']
    if (!name || id === undefined || id === null) return

    const candidate = String(id).padStart(6, '0')
    const normalized = normalizeLawName(name)
    if (!fallback && (normalized.includes(wanted) || wanted.includes(normalized))) fallback = candidate
    if (!exact && normalized === wanted) exact = candidate
  })

  return exact || fallback
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
  if (!lines.length) {
    articleLines.forEach((line) => {
      if (!lines.includes(line)) lines.push(line)
    })
  }

  return { title, lines, article }
}

async function fetchJson(url, signal) {
  const response = await fetch(url, { signal, mode: 'cors', cache: 'no-store' })
  if (!response.ok) throw new Error(`법령정보 응답 오류 (${response.status})`)
  const text = (await response.text()).replace(/^\uFEFF/, '').trim()
  return JSON.parse(text)
}

async function fetchLawArticle(lawName, article, signal) {
  const cacheKey = `${lawName}::${article}`
  if (lawArticleCache.has(cacheKey)) return lawArticleCache.get(cacheKey)

  let lawId = lawIdCache.get(lawName)
  if (!lawId) {
    const searchUrl = `${LAW_API_BASE}/lawSearch.do?OC=test&target=law&type=JSON&display=20&query=${encodeURIComponent(lawName)}`
    const searchPayload = await fetchJson(searchUrl, signal)
    lawId = findLawId(searchPayload, lawName)
    if (!lawId) throw new Error('해당 법령의 식별정보를 찾지 못했습니다.')
    lawIdCache.set(lawName, lawId)
  }

  const joCode = articleToJoCode(article)
  if (!joCode) throw new Error('조문 번호 형식을 확인할 수 없습니다.')

  const articleUrl = `${LAW_API_BASE}/lawService.do?OC=test&target=law&type=JSON&ID=${encodeURIComponent(lawId)}&JO=${joCode}`
  const payload = await fetchJson(articleUrl, signal)
  const result = extractArticle(payload, article)
  if (!result.lines.length) throw new Error('조문 본문을 찾지 못했습니다.')

  lawArticleCache.set(cacheKey, result)
  return result
}

function getOfficialUrl(target) {
  const subject = subjectLawSources[target?.subjectId]
  const law = subject?.laws?.find((item) => item.name === target?.lawName)
  const base = law?.url || `https://www.law.go.kr/법령/${String(target?.lawName || '').replace(/\s+/g, '')}`
  return target?.article ? `${base}/${target.article}` : base
}

export default function LawTextViewer({ open, onClose, target }) {
  const [status, setStatus] = useState('idle')
  const [articleData, setArticleData] = useState(null)
  const officialUrl = useMemo(() => getOfficialUrl(target), [target])

  useEffect(() => {
    if (!open || !target?.lawName || !target?.article) return undefined

    const controller = new AbortController()
    setStatus('loading')
    setArticleData(null)

    fetchLawArticle(target.lawName, target.article, controller.signal)
      .then((result) => {
        setArticleData(result)
        setStatus('success')
      })
      .catch((error) => {
        if (error?.name === 'AbortError') return
        setStatus('fallback')
      })

    return () => controller.abort()
  }, [open, target?.lawName, target?.article])

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

  if (!open || !target?.lawName || !target?.article) return null

  const onBackdropClick = (event) => {
    if (event.target === event.currentTarget) onClose()
  }

  return createPortal(
    <div className="law-viewer-backdrop" onMouseDown={onBackdropClick} role="presentation">
      <section className="law-article-popup" role="dialog" aria-modal="true" aria-labelledby="law-article-title">
        <header className="law-article-popup__header">
          <div>
            <span className="law-article-popup__eyebrow">법령조문</span>
            <h2 id="law-article-title">{target.lawName} {target.article}</h2>
          </div>
          <button className="law-viewer__close" type="button" onClick={onClose} aria-label="법령 조문 닫기">×</button>
        </header>

        <div className="law-article-popup__body">
          {status === 'loading' && (
            <div className="law-article-popup__status" role="status">
              <span className="law-article-popup__spinner" aria-hidden="true" />
              <strong>조문을 불러오는 중입니다.</strong>
            </div>
          )}

          {status === 'success' && articleData && (
            <article className="law-article-text">
              {articleData.title && <h3>({articleData.title})</h3>}
              {articleData.lines.map((line, index) => <p key={`${index}-${line}`}>{line}</p>)}
            </article>
          )}

          {status === 'fallback' && (
            <div className="law-article-popup__frame-wrap">
              <iframe
                className="law-article-popup__frame"
                src={officialUrl}
                title={`${target.lawName} ${target.article} 법령 조문`}
                loading="eager"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          )}
        </div>

        <footer className="law-article-popup__footer">
          <span>법제처 국가법령정보센터 · 현행 법령</span>
          <a href={officialUrl} target="_blank" rel="noreferrer" aria-label={`${target.lawName} ${target.article} 국가법령정보센터 원문 열기`}>원문 ↗</a>
        </footer>
      </section>
    </div>,
    document.body,
  )
}
