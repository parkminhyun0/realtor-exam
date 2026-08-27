let scheduled = false

function getDirectDetails(parent) {
  return [...parent.children].filter((child) => child.tagName === 'DETAILS')
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
    if (!button || !nav.contains(button)) return

    let ancestor = button.parentElement
    while (ancestor && ancestor !== nav) {
      if (ancestor instanceof HTMLDetailsElement) ancestor.open = true
      ancestor = ancestor.parentElement
    }
  })
}

function applySubjectSidebars() {
  scheduled = false
  document.querySelectorAll('.public-law-nav').forEach(installAccordion)
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
