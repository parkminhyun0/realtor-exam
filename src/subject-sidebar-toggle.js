const TOC_COLLAPSE_STORAGE_KEY = 'realtor-exam:toc-collapsed'
let scheduled = false

function getDirectDetails(parent) {
  return [...parent.children].filter((child) => child.tagName === 'DETAILS')
}

function readCollapsedPreference() {
  try {
    return window.localStorage.getItem(TOC_COLLAPSE_STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

function saveCollapsedPreference(collapsed) {
  try {
    window.localStorage.setItem(TOC_COLLAPSE_STORAGE_KEY, String(collapsed))
  } catch {
    // 저장소 접근이 제한된 환경에서는 현재 화면 상태만 유지합니다.
  }
}

function updateCollapseButton(button, collapsed) {
  const label = collapsed ? '목차 보기' : '목차 숨기기'
  const icon = collapsed ? '›' : '‹'
  button.setAttribute('aria-expanded', String(!collapsed))
  button.setAttribute('aria-label', label)
  button.title = label
  button.querySelector('[data-subject-toc-toggle-icon]')?.replaceChildren(icon)
  button.querySelector('[data-subject-toc-toggle-label]')?.replaceChildren(label)
}

function setCollapsed(layout, button, collapsed, persist = true) {
  layout.classList.toggle('is-subject-toc-collapsed', collapsed)
  layout.dataset.subjectTocCollapsed = String(collapsed)
  updateCollapseButton(button, collapsed)
  if (persist) saveCollapsedPreference(collapsed)
}

function installCollapseControl(nav) {
  const layout = nav.closest('.public-law-layout')
  if (!layout || layout.dataset.subjectTocCollapseInstalled === 'true') return
  layout.dataset.subjectTocCollapseInstalled = 'true'

  const button = document.createElement('button')
  button.type = 'button'
  button.className = 'subject-toc-collapse-toggle'
  button.dataset.subjectTocCollapseToggle = 'true'
  button.innerHTML = `
    <span class="subject-toc-collapse-toggle__icon" data-subject-toc-toggle-icon aria-hidden="true">‹</span>
    <span class="subject-toc-collapse-toggle__label" data-subject-toc-toggle-label>목차 숨기기</span>
  `
  nav.prepend(button)

  setCollapsed(layout, button, readCollapsedPreference(), false)

  button.addEventListener('click', () => {
    const collapsed = !layout.classList.contains('is-subject-toc-collapsed')
    setCollapsed(layout, button, collapsed)
  })
}

function installAccordion(nav) {
  if (nav.dataset.subjectSidebarToggleInstalled === 'true') return
  nav.dataset.subjectSidebarToggleInstalled = 'true'

  nav.addEventListener('toggle', (event) => {
    const detail = event.target
    if (!(detail instanceof HTMLDetailsElement) || !detail.open) return
    if (!nav.contains(detail)) return

    const parent = detail.parentElement
    if (!parent) return

    getDirectDetails(parent).forEach((sibling) => {
      if (sibling !== detail) sibling.open = false
    })
  }, true)

  nav.addEventListener('click', (event) => {
    const button = event.target.closest('button')
    if (!button || !nav.contains(button) || button.dataset.subjectTocCollapseToggle === 'true') return

    let ancestor = button.parentElement
    while (ancestor && ancestor !== nav) {
      if (ancestor instanceof HTMLDetailsElement) ancestor.open = true
      ancestor = ancestor.parentElement
    }
  })
}

function installSubjectNav(nav) {
  installCollapseControl(nav)
  installAccordion(nav)
}

function applySubjectSidebars() {
  scheduled = false
  document.querySelectorAll('.public-law-layout > .public-law-nav').forEach(installSubjectNav)
}

function scheduleApply() {
  if (scheduled) return
  scheduled = true
  window.requestAnimationFrame(applySubjectSidebars)
}

const observer = new MutationObserver(scheduleApply)
observer.observe(document.documentElement, { childList: true, subtree: true })

document.addEventListener('DOMContentLoaded', scheduleApply)
window.addEventListener('hashchange', scheduleApply)
scheduleApply()
