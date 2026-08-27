import './registration-law-decree-popup.css'

const TARGET_CITATION = '(영 제56조 제3항 제2호)'
const OFFICIAL_URL = 'https://www.law.go.kr/법령/공간정보의구축및관리등에관한법률시행령/제56조'
const LAW_TITLE = '공간정보의 구축 및 관리 등에 관한 법률 시행령'
const LAW_VERSION = '[시행 2026. 7. 1.] [대통령령 제36424호, 2026. 6. 23., 타법개정]'

const CLAUSE_LINES = [
  '③ 법 제66조에 따른 지번의 부여방법은 다음 각 호와 같다.',
  '2. 신규등록 및 등록전환의 경우에는 그 지번부여지역에서 인접토지의 본번에 부번을 붙여서 지번을 부여할 것. 다만, 다음 각 목의 어느 하나에 해당하는 경우에는 그 지번부여지역의 최종 본번의 다음 순번부터 본번으로 하여 순차적으로 지번을 부여할 수 있다.',
  '가. 대상토지가 그 지번부여지역의 최종 지번의 토지에 인접하여 있는 경우',
  '나. 대상토지가 이미 등록된 토지와 멀리 떨어져 있어서 등록된 토지의 본번에 부번을 부여하는 것이 불합리한 경우',
  '다. 대상토지가 여러 필지로 되어 있는 경우',
]

const EXPLANATION = '신규등록·등록전환 때에는 원칙적으로 인접토지의 본번에 부번을 붙여 지번을 부여합니다. 다만 가·나·다의 예외 사유에 해당하면 그 지번부여지역의 최종 본번 다음 순번부터 새로운 본번을 차례로 부여할 수 있다는 뜻입니다.'

let activePopup = null
let previousOverflow = ''

function closePopup() {
  if (!activePopup) return
  activePopup.remove()
  activePopup = null
  document.body.style.overflow = previousOverflow
}

function makeElement(tag, className, text) {
  const element = document.createElement(tag)
  if (className) element.className = className
  if (text !== undefined) element.textContent = text
  return element
}

function openPopup() {
  closePopup()

  previousOverflow = document.body.style.overflow
  document.body.style.overflow = 'hidden'

  const backdrop = makeElement('div', 'law-viewer-backdrop registration-decree-backdrop')
  backdrop.setAttribute('role', 'presentation')

  const dialog = makeElement('section', 'law-article-popup registration-decree-popup')
  dialog.setAttribute('role', 'dialog')
  dialog.setAttribute('aria-modal', 'true')
  dialog.setAttribute('aria-labelledby', 'registration-decree-popup-title')

  const header = makeElement('header', 'law-article-popup__header')
  const headerCopy = makeElement('div')
  headerCopy.append(makeElement('span', 'law-article-popup__eyebrow', '법령조문'))
  const title = makeElement('h2', '', `${LAW_TITLE} 제56조 제3항 제2호`)
  title.id = 'registration-decree-popup-title'
  headerCopy.append(title)

  const closeButton = makeElement('button', 'law-viewer__close', '×')
  closeButton.type = 'button'
  closeButton.setAttribute('aria-label', '법령 조문 닫기')
  closeButton.addEventListener('click', closePopup)
  header.append(headerCopy, closeButton)

  const body = makeElement('div', 'law-article-popup__body')
  const article = makeElement('article', 'law-article-text')
  const section = makeElement('section', 'law-article-text__section')

  const sectionHeading = makeElement('div', 'law-article-text__heading')
  const heading = makeElement('h3', '', '영 제56조 제3항 제2호 · 신규등록 및 등록전환의 지번 부여방법')
  const originalLink = makeElement('a', '', '원문 ↗')
  originalLink.href = OFFICIAL_URL
  originalLink.target = '_blank'
  originalLink.rel = 'noreferrer'
  sectionHeading.append(heading, originalLink)

  const version = makeElement('p', 'registration-decree-popup__version', LAW_VERSION)

  const explanation = makeElement('div', 'registration-decree-popup__meaning')
  explanation.append(
    makeElement('strong', '', '쉽게 이해하기'),
    makeElement('p', '', EXPLANATION),
  )

  const legalText = makeElement('div', 'registration-decree-popup__legal-text')
  legalText.append(makeElement('strong', '', '법령 원문'))
  CLAUSE_LINES.forEach((line) => legalText.append(makeElement('p', '', line)))

  section.append(sectionHeading, version, explanation, legalText)
  article.append(section)
  body.append(article)

  const footer = makeElement('footer', 'law-article-popup__footer')
  footer.append(makeElement('span', '', '법제처 국가법령정보센터 · 현행 법령 기준'))
  const footerLink = makeElement('a', '', '원문 ↗')
  footerLink.href = OFFICIAL_URL
  footerLink.target = '_blank'
  footerLink.rel = 'noreferrer'
  footer.append(footerLink)

  dialog.append(header, body, footer)
  backdrop.append(dialog)

  backdrop.addEventListener('mousedown', (event) => {
    if (event.target === backdrop) closePopup()
  })

  document.body.append(backdrop)
  activePopup = backdrop
  closeButton.focus()
}

function normalizeTargetTitle(text = '') {
  return String(text)
    .replace(TARGET_CITATION, '')
    .replace('신규등록 밑 등록전환', '신규등록 및 등록전환')
    .trim()
}

function enhanceBodyHeading(heading) {
  if (!(heading instanceof HTMLElement)) return
  if (heading.dataset.decreeBodyEnhanced === 'true') return

  const text = heading.textContent || ''
  if (!text.includes(TARGET_CITATION)) return

  const titleText = normalizeTargetTitle(text)
  heading.dataset.decreeBodyEnhanced = 'true'
  heading.textContent = titleText

  const citationRow = makeElement('div', 'registration-law-body-citation')
  citationRow.dataset.registrationDecreeCitationRow = '56-3-2'
  citationRow.append(makeElement('span', 'registration-law-body-citation__label', '근거 법령'))

  const citationButton = makeElement('button', 'registration-law-body-ref', '영 제56조 제3항 제2호')
  citationButton.type = 'button'
  citationButton.dataset.registrationDecreeRef = '56-3-2'
  citationButton.setAttribute('aria-label', '공간정보의 구축 및 관리 등에 관한 법률 시행령 제56조 제3항 제2호 보기')
  citationButton.setAttribute('title', '클릭하면 해당 시행령 조문만 확인합니다.')
  citationRow.append(citationButton)

  heading.insertAdjacentElement('afterend', citationRow)
}

function cleanSecondaryBodyTitle(heading) {
  if (!(heading instanceof HTMLElement)) return
  const text = heading.textContent || ''
  if (!text.includes(TARGET_CITATION)) return
  heading.textContent = normalizeTargetTitle(text)
}

function correctNavigationTypo() {
  document
    .querySelectorAll('.registration-law-nav-v2 .registration-toc-node button span')
    .forEach((label) => {
      if (!(label instanceof HTMLElement)) return
      if (!label.textContent?.includes('신규등록 밑 등록전환')) return
      label.textContent = label.textContent.replace('신규등록 밑 등록전환', '신규등록 및 등록전환')
    })
}

function enhanceAll() {
  correctNavigationTypo()

  document
    .querySelectorAll('.registration-law-page .public-law-content .study-section-heading h2')
    .forEach(enhanceBodyHeading)

  document
    .querySelectorAll('.registration-law-page .public-law-content .registration-focus-panel .study-block__title h3')
    .forEach(cleanSecondaryBodyTitle)
}

function isCitationTarget(target) {
  return target instanceof Element
    ? target.closest('.registration-law-body-ref[data-registration-decree-ref="56-3-2"]')
    : null
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  const onClick = (event) => {
    const citation = isCitationTarget(event.target)
    if (!citation) return
    event.preventDefault()
    event.stopPropagation()
    openPopup()
  }

  const onKeyDown = (event) => {
    if (event.key === 'Escape' && activePopup) closePopup()
  }

  document.addEventListener('click', onClick, true)
  document.addEventListener('keydown', onKeyDown, true)

  const start = () => {
    enhanceAll()
    const root = document.getElementById('root')
    if (!root) return
    const observer = new MutationObserver(enhanceAll)
    observer.observe(root, { childList: true, characterData: true, subtree: true })
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true })
  } else {
    start()
  }
}
