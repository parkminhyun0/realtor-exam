const TABLE_WRAP_SELECTOR = '.public-law-page .table-wrap'

function getViewportMetrics() {
  const vv = window.visualViewport
  return {
    width: vv?.width || document.documentElement.clientWidth || window.innerWidth,
    offsetLeft: vv?.offsetLeft || 0,
  }
}

function syncTableWrap(wrap) {
  if (!(wrap instanceof HTMLElement) || !wrap.isConnected) return

  const { width: viewportWidth, offsetLeft } = getViewportMetrics()
  const rect = wrap.getBoundingClientRect()
  const parentRect = wrap.parentElement?.getBoundingClientRect()

  const visibleLeft = Math.max(offsetLeft, rect.left)
  const visibleRight = offsetLeft + viewportWidth
  const viewportAvailable = Math.max(220, visibleRight - visibleLeft - 10)
  const parentAvailable = Math.max(220, parentRect?.width || rect.width || viewportAvailable)
  const resolved = Math.max(220, Math.min(viewportAvailable, parentAvailable))

  wrap.style.setProperty('--table-visible-width', `${resolved}px`)
}

function syncAllTableWraps() {
  document.querySelectorAll(TABLE_WRAP_SELECTOR).forEach(syncTableWrap)
}

let rafId = 0
function scheduleSync() {
  if (rafId) cancelAnimationFrame(rafId)
  rafId = requestAnimationFrame(() => {
    rafId = 0
    syncAllTableWraps()
  })
}

function installTableViewportSync() {
  syncAllTableWraps()

  const observer = new MutationObserver(scheduleSync)
  observer.observe(document.body, { childList: true, subtree: true })

  window.addEventListener('resize', scheduleSync, { passive: true })
  window.addEventListener('orientationchange', scheduleSync, { passive: true })
  window.visualViewport?.addEventListener('resize', scheduleSync, { passive: true })
  window.visualViewport?.addEventListener('scroll', scheduleSync, { passive: true })

  if ('ResizeObserver' in window) {
    const resizeObserver = new ResizeObserver(scheduleSync)
    resizeObserver.observe(document.documentElement)
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', installTableViewportSync, { once: true })
} else {
  installTableViewportSync()
}
