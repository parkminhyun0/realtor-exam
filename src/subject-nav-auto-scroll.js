function isSubjectContentSelection(target) {
  if (!(target instanceof Element)) return false
  if (target.closest('.public-law-nav button')) return true
  if (target.closest('.civil-nav-point > summary')) return true
  if (target.closest('.public-law-nav a[href]')) return true
  return false
}

function scrollSelectedSubjectToContent(target) {
  const page = target.closest('.public-law-page') || document.querySelector('.public-law-page')
  if (!page) return

  const content = page.querySelector('.public-law-content')
  if (!content) return

  const siteHeader = document.querySelector('.site-header')
  const headerHeight = siteHeader?.getBoundingClientRect().height || 0
  const top = content.getBoundingClientRect().top + window.scrollY - headerHeight - 10
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  window.scrollTo({
    top: Math.max(0, top),
    behavior: reduceMotion ? 'auto' : 'smooth',
  })
}

function scheduleSubjectContentScroll(target) {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => scrollSelectedSubjectToContent(target))
  })
}

if (typeof document !== 'undefined') {
  document.addEventListener('click', (event) => {
    const target = event.target
    if (!isSubjectContentSelection(target)) return
    scheduleSubjectContentScroll(target)
  }, true)
}
