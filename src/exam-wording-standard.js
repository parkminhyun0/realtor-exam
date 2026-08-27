const STANDARD_EXAM_WORDING = '시험에서 자주 바꿔 출제하는 부분'

const EXACT_LABELS = new Map([
  ['선지에서 뒤집어 내는 부분', STANDARD_EXAM_WORDING],
  ['함정 선지', STANDARD_EXAM_WORDING],
  ['⚠️ 함정 선지', `⚠️ ${STANDARD_EXAM_WORDING}`],
])

function replaceExactText(root) {
  if (!root?.ownerDocument && root?.nodeType !== Node.DOCUMENT_NODE) return

  const doc = root.nodeType === Node.DOCUMENT_NODE ? root : root.ownerDocument
  const walker = doc.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  const nodes = []

  while (walker.nextNode()) nodes.push(walker.currentNode)

  nodes.forEach((node) => {
    const raw = node.nodeValue || ''
    const trimmed = raw.trim()
    const replacement = EXACT_LABELS.get(trimmed)
    if (!replacement) return

    const leading = raw.match(/^\s*/)?.[0] || ''
    const trailing = raw.match(/\s*$/)?.[0] || ''
    node.nodeValue = `${leading}${replacement}${trailing}`
  })
}

function observeDocument(doc) {
  if (!doc?.body || doc.__examWordingObserverInstalled) return
  doc.__examWordingObserverInstalled = true

  replaceExactText(doc.body)

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          const raw = node.nodeValue || ''
          const trimmed = raw.trim()
          const replacement = EXACT_LABELS.get(trimmed)
          if (!replacement) return
          const leading = raw.match(/^\s*/)?.[0] || ''
          const trailing = raw.match(/\s*$/)?.[0] || ''
          node.nodeValue = `${leading}${replacement}${trailing}`
          return
        }
        if (node.nodeType === Node.ELEMENT_NODE) replaceExactText(node)
      })
    })
  })

  observer.observe(doc.body, { childList: true, subtree: true })
  doc.__examWordingObserver = observer
}

function normalizeIframe(frame) {
  try {
    const doc = frame.contentDocument
    if (!doc) return
    observeDocument(doc)
  } catch {
    // Only same-origin subject iframes are eligible.
  }
}

function installIframeHooks() {
  document.querySelectorAll('iframe').forEach((frame) => {
    if (frame.dataset.examWordingHooked === 'true') return
    frame.dataset.examWordingHooked = 'true'
    frame.addEventListener('load', () => {
      normalizeIframe(frame)
      setTimeout(() => normalizeIframe(frame), 120)
      setTimeout(() => normalizeIframe(frame), 500)
    })
    normalizeIframe(frame)
  })
}

function installExamWordingStandard() {
  observeDocument(document)
  installIframeHooks()

  const observer = new MutationObserver(() => installIframeHooks())
  observer.observe(document.documentElement, { childList: true, subtree: true })
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', installExamWordingStandard, { once: true })
} else {
  installExamWordingStandard()
}
