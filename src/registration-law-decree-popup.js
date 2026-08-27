import './registration-law-decree-popup.css'

const LAW_TITLE = '공간정보의 구축 및 관리 등에 관한 법률 시행령'
const LAW_VERSION = '[시행 2026. 7. 1.] [대통령령 제36424호, 2026. 6. 23., 타법개정]'
const lawUrl = (article) => `https://www.law.go.kr/법령/공간정보의구축및관리등에관한법률시행령/${article}`

const DECREE_REFERENCES = {
  '56-basic': {
    citation: '영 제56조 제1항·제2항·제3항 제1호',
    article: '제56조',
    title: '지번의 구성 및 기본 부여원칙',
    explanation: '지번은 아라비아숫자로 표시하고 본번과 부번으로 구성하며, 토지의 지번은 원칙적으로 북서에서 남동 방향으로 순차 부여한다는 기본 규칙입니다.',
    lines: [
      '제56조(지번의 구성 및 부여방법 등) ① 지번은 아라비아숫자로 표기하되, 임야대장 및 임야도에 등록하는 토지의 지번은 숫자 앞에 "산"자를 붙인다.',
      '② 지번은 본번과 부번으로 구성하되, 본번과 부번 사이에 "－" 표시로 연결한다. 이 경우 "－" 표시는 "의"라고 읽는다.',
      '③ 법 제66조에 따른 지번의 부여방법은 다음 각 호와 같다.',
      '1. 지번은 북서에서 남동으로 순차적으로 부여할 것',
    ],
    url: lawUrl('제56조'),
    matchers: ['(1) 지번부여의 기본원칙'],
  },
  '56-3-2': {
    citation: '영 제56조 제3항 제2호',
    article: '제56조',
    title: '신규등록 및 등록전환의 지번 부여',
    explanation: '신규등록·등록전환은 원칙적으로 인접토지의 본번에 부번을 붙입니다. 다만 법정 예외에 해당하면 최종 본번의 다음 순번부터 새 본번을 순차 부여할 수 있습니다.',
    lines: [
      '③ 법 제66조에 따른 지번의 부여방법은 다음 각 호와 같다.',
      '2. 신규등록 및 등록전환의 경우에는 그 지번부여지역에서 인접토지의 본번에 부번을 붙여서 지번을 부여할 것. 다만, 다음 각 목의 어느 하나에 해당하는 경우에는 그 지번부여지역의 최종 본번의 다음 순번부터 본번으로 하여 순차적으로 지번을 부여할 수 있다.',
      '가. 대상토지가 그 지번부여지역의 최종 지번의 토지에 인접하여 있는 경우',
      '나. 대상토지가 이미 등록된 토지와 멀리 떨어져 있어서 등록된 토지의 본번에 부번을 부여하는 것이 불합리한 경우',
      '다. 대상토지가 여러 필지로 되어 있는 경우',
    ],
    url: lawUrl('제56조'),
    matchers: ['a. 신규등록 및 등록전환', 'a. 신규등록 밑 등록전환'],
  },
  '56-3-3': {
    citation: '영 제56조 제3항 제3호',
    article: '제56조',
    title: '분할에 따른 지번 부여',
    explanation: '분할하면 한 필지는 종전 지번을 유지하고 나머지 필지는 최종 부번 다음 순번으로 부번을 붙입니다. 건축물이 있는 필지는 종전 지번을 우선 부여합니다.',
    lines: [
      '③ 법 제66조에 따른 지번의 부여방법은 다음 각 호와 같다.',
      '3. 분할의 경우에는 분할 후의 필지 중 1필지의 지번은 분할 전의 지번으로 하고, 나머지 필지의 지번은 본번의 최종 부번 다음 순번으로 부번을 부여할 것. 이 경우 주거ㆍ사무실 등의 건축물이 있는 필지에 대해서는 분할 전의 지번을 우선하여 부여하여야 한다.',
    ],
    url: lawUrl('제56조'),
    matchers: ['b.분할', 'b. 분할'],
  },
  '56-3-4': {
    citation: '영 제56조 제3항 제4호',
    article: '제56조',
    title: '합병에 따른 지번 부여',
    explanation: '합병은 원칙적으로 합병 대상 지번 중 선순위 지번을 사용합니다. 본번이 있으면 본번 중 선순위를 우선하며, 일정한 경우 건축물이 있는 지번을 신청하여 사용할 수 있습니다.',
    lines: [
      '③ 법 제66조에 따른 지번의 부여방법은 다음 각 호와 같다.',
      '4. 합병의 경우에는 합병 대상 지번 중 선순위의 지번을 그 지번으로 하되, 본번으로 된 지번이 있을 때에는 본번 중 선순위의 지번을 합병 후의 지번으로 할 것.',
      '이 경우 토지소유자가 합병 전의 필지에 주거ㆍ사무실 등의 건축물이 있어서 그 건축물이 위치한 지번을 합병 후의 지번으로 신청할 때에는 그 지번을 합병 후의 지번으로 부여하여야 한다.',
    ],
    url: lawUrl('제56조'),
    matchers: ['c. 합병', 'c.합병'],
  },
  '56-3-5': {
    citation: '영 제56조 제3항 제5호',
    article: '제56조',
    title: '지적확정측량 실시지역의 지번 부여',
    explanation: '지적확정측량을 실시한 지역은 원칙적으로 제외대상 지번을 빼고 본번으로 새 지번을 부여하며, 종전 지번 수가 부족한 경우 블록 단위 본번+부번 또는 최종 본번 다음 순번 방식을 사용할 수 있습니다.',
    lines: [
      '③ 법 제66조에 따른 지번의 부여방법은 다음 각 호와 같다.',
      '5. 지적확정측량을 실시한 지역의 각 필지에 지번을 새로 부여하는 경우에는 다음 각 목의 지번을 제외한 본번으로 부여할 것. 다만, 부여할 수 있는 종전 지번의 수가 새로 부여할 지번의 수보다 적을 때에는 블록 단위로 하나의 본번을 부여한 후 필지별로 부번을 부여하거나, 그 지번부여지역의 최종 본번 다음 순번부터 본번으로 하여 차례로 지번을 부여할 수 있다.',
      '가. 지적확정측량을 실시한 지역의 종전의 지번과 지적확정측량을 실시한 지역 밖에 있는 본번이 같은 지번이 있을 때에는 그 지번',
      '나. 지적확정측량을 실시한 지역의 경계에 걸쳐 있는 지번',
    ],
    url: lawUrl('제56조'),
    matchers: ['d. 지적확정측량 실시지역'],
  },
  '56-3-6': {
    citation: '영 제56조 제3항 제6호',
    article: '제56조',
    title: '지번변경 등의 경우 지번 부여',
    explanation: '지번변경, 행정구역 개편, 축척변경 시행지역의 지번 부여에는 지적확정측량 지역의 지번 부여방법을 준용합니다.',
    lines: [
      '③ 법 제66조에 따른 지번의 부여방법은 다음 각 호와 같다.',
      '6. 다음 각 목의 어느 하나에 해당할 때에는 제5호를 준용하여 지번을 부여할 것',
      '가. 법 제66조제2항에 따라 지번부여지역의 지번을 변경할 때',
      '나. 법 제85조제2항에 따른 행정구역 개편에 따라 새로 지번을 부여할 때',
      '다. 제72조제1항에 따라 축척변경 시행지역의 필지에 지번을 부여할 때',
    ],
    url: lawUrl('제56조'),
    matchers: ['(3) 지번변경', '(3) 지번번경'],
  },
  '58': {
    citation: '영 제58조',
    article: '제58조',
    title: '지목의 구분',
    explanation: '제58조는 법 제67조제1항에 따른 28개 법정 지목을 각각 어떤 토지에 설정하는지 구체적인 기준을 정한 조문입니다.',
    lines: [
      '제58조(지목의 구분) 법 제67조제1항에 따른 지목의 구분은 다음 각 호의 기준에 따른다.',
      '법정 지목 28종: 전, 답, 과수원, 목장용지, 임야, 광천지, 염전, 대, 공장용지, 학교용지, 주차장, 주유소용지, 창고용지, 도로, 철도용지, 제방, 하천, 구거, 유지, 양어장, 수도용지, 공원, 체육용지, 유원지, 종교용지, 사적지, 묘지, 잡종지.',
      '※ 각 지목별 세부 정의는 국가법령정보센터 제58조 원문에서 함께 확인할 수 있습니다.',
    ],
    url: lawUrl('제58조'),
    matchers: ['(2) 지목의 구분'],
  },
  '59': {
    citation: '영 제59조',
    article: '제59조',
    title: '지목의 설정방법 등',
    explanation: '지목은 필지마다 하나만 설정하고, 한 필지가 둘 이상의 용도로 사용되면 주된 용도에 따라 정합니다. 일시적·임시적 사용은 지목변경 사유가 아닙니다.',
    lines: [
      '제59조(지목의 설정방법 등) ① 법 제67조제1항에 따른 지목의 설정은 다음 각 호의 방법에 따른다.',
      '1. 필지마다 하나의 지목을 설정할 것',
      '2. 1필지가 둘 이상의 용도로 활용되는 경우에는 주된 용도에 따라 지목을 설정할 것',
      '② 토지가 일시적 또는 임시적인 용도로 사용될 때에는 지목을 변경하지 아니한다.',
    ],
    url: lawUrl('제59조'),
    matchers: ['(1) 지목의 설정원칙'],
  },
  '55-1-2': {
    citation: '영 제55조 제1항·제2항',
    article: '제55조',
    title: '지상 경계의 결정기준',
    explanation: '경계를 이루는 구조물과 토지의 높낮이·수면·제방 상태에 따라 경계선을 정하고, 구조물 소유자가 서로 다르면 구조물의 소유권에 따라 결정합니다.',
    lines: [
      '제55조(지상 경계의 결정기준 등) ① 법 제65조제1항에 따른 지상 경계의 결정기준은 다음 각 호의 구분에 따른다.',
      '1. 연접되는 토지 간에 높낮이 차이가 없는 경우: 그 구조물 등의 중앙',
      '2. 연접되는 토지 간에 높낮이 차이가 있는 경우: 그 구조물 등의 하단부',
      '3. 도로ㆍ구거 등의 토지에 절토된 부분이 있는 경우: 그 경사면의 상단부',
      '4. 토지가 해면 또는 수면에 접하는 경우: 최대만조위 또는 최대만수위가 되는 선',
      '5. 공유수면매립지의 토지 중 제방 등을 토지에 편입하여 등록하는 경우: 바깥쪽 어깨부분',
      '② 지상 경계의 구획을 형성하는 구조물 등의 소유자가 다른 경우에는 제1항제1호부터 제3호까지의 규정에도 불구하고 그 소유권에 따라 지상 경계를 결정한다.',
    ],
    url: lawUrl('제55조'),
    matchers: ['(2) 지상경계 결정기준'],
  },
  '55-3-4': {
    citation: '영 제55조 제3항·제4항',
    article: '제55조',
    title: '분할에 따른 지상경계',
    explanation: '일정한 법정 사유로 토지를 분할하는 경우 지상 경계점에 경계점표지를 설치하여 측량할 수 있고, 원칙적으로 분할 경계가 지상건축물을 걸리게 해서는 안 됩니다.',
    lines: [
      '③ 다음 각 호의 어느 하나에 해당하는 경우에는 지상 경계점에 법 제65조제1항에 따른 경계점표지를 설치하여 측량할 수 있다.',
      '④ 분할에 따른 지상 경계는 지상건축물을 걸리게 결정해서는 아니 된다. 다만, 법원의 확정판결이 있는 경우 등 각 호의 예외에 해당하면 그러하지 아니하다.',
    ],
    url: lawUrl('제55조'),
    matchers: ['(3) 분할에 따른 지상경계'],
  },
  '55-5': {
    citation: '영 제55조 제5항',
    article: '제55조',
    title: '지적확정측량의 경계결정',
    explanation: '지적확정측량의 경계는 공사가 완료된 실제 현황대로 결정하는 것이 원칙이며, 완공 현황과 사업계획도가 다르면 사업시행자에게 미리 알려야 합니다.',
    lines: [
      '⑤ 지적확정측량의 경계는 공사가 완료된 현황대로 결정하되, 공사가 완료된 현황이 사업계획도와 다를 때에는 미리 사업시행자에게 그 사실을 통지하여야 한다.',
    ],
    url: lawUrl('제55조'),
    matchers: ['(4) 도시개발사업 등의 경계결정'],
  },
  '60': {
    citation: '영 제60조',
    article: '제60조',
    title: '면적의 결정 및 측량계산의 끝수처리',
    explanation: '면적의 끝수처리와 측량계산의 반올림 방법을 정한 조문입니다. 특히 정확히 절반인 수치는 일반적인 사사오입이 아니라 구하려는 끝자리 숫자가 0 또는 짝수이면 버리고 홀수이면 올리는 방식이 핵심입니다.',
    lines: [
      '제60조(면적의 결정 및 측량계산의 끝수처리) ① 면적의 결정은 다음 각 호의 방법에 따른다.',
      '1. 토지의 면적에 1제곱미터 미만의 끝수가 있는 경우 0.5제곱미터 미만일 때에는 버리고 0.5제곱미터를 초과하는 때에는 올리며, 0.5제곱미터일 때에는 구하려는 끝자리의 숫자가 0 또는 짝수이면 버리고 홀수이면 올린다. 다만, 1필지의 면적이 1제곱미터 미만일 때에는 1제곱미터로 한다.',
      '2. 지적도의 축척이 600분의 1인 지역과 경계점좌표등록부에 등록하는 지역의 토지 면적은 제1호에도 불구하고 제곱미터 이하 한 자리 단위로 하되, 0.1제곱미터 미만의 끝수가 있는 경우 0.05제곱미터를 기준으로 같은 방식으로 처리한다. 다만, 1필지의 면적이 0.1제곱미터 미만일 때에는 0.1제곱미터로 한다.',
      '② 방위각의 각치, 종횡선의 수치 또는 거리를 계산하는 경우에도 구하려는 끝자리의 다음 숫자가 5 미만이면 버리고, 5를 초과하면 올리며, 5일 때에는 구하려는 끝자리의 숫자가 0 또는 짝수이면 버리고 홀수이면 올린다.',
    ],
    url: lawUrl('제60조'),
    matchers: ['(1) 면적측정', '(2) 끝수처리 연습', '(3) 근거 규정 : 면적의 결정 및 측량계산의 끝수처리'],
  },
}

const CITATION_PATTERN = /\(영\s*제\d+조(?:\s*제\d+항)?(?:\s*제\d+호)?(?:\s*제\d+항)?\)/g
let activePopup = null
let previousOverflow = ''

function makeElement(tag, className, text) {
  const element = document.createElement(tag)
  if (className) element.className = className
  if (text !== undefined) element.textContent = text
  return element
}

function closePopup() {
  if (!activePopup) return
  activePopup.remove()
  activePopup = null
  document.body.style.overflow = previousOverflow
}

function cleanTitle(text = '') {
  return String(text)
    .replace(CITATION_PATTERN, '')
    .replace('신규등록 밑 등록전환', '신규등록 및 등록전환')
    .replace('지번번경', '지번변경')
    .trim()
}

function findReference(text = '') {
  const normalized = String(text).replace(/\s+/g, ' ').trim()
  const entries = Object.entries(DECREE_REFERENCES)

  for (const [key, reference] of entries) {
    if (normalized.includes(reference.citation.replace('·', ' '))) return { key, reference }
    if (reference.matchers.some((matcher) => normalized.includes(matcher))) return { key, reference }
  }
  return null
}

function openPopup(key) {
  const reference = DECREE_REFERENCES[key]
  if (!reference) return
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
  const title = makeElement('h2', '', `${LAW_TITLE} ${reference.citation.replace(/^영\s*/, '')}`)
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
  const heading = makeElement('h3', '', `${reference.citation} · ${reference.title}`)
  const originalLink = makeElement('a', '', '원문 ↗')
  originalLink.href = reference.url
  originalLink.target = '_blank'
  originalLink.rel = 'noreferrer'
  sectionHeading.append(heading, originalLink)

  const version = makeElement('p', 'registration-decree-popup__version', LAW_VERSION)
  const explanation = makeElement('div', 'registration-decree-popup__meaning')
  explanation.append(makeElement('strong', '', '쉽게 이해하기'), makeElement('p', '', reference.explanation))

  const legalText = makeElement('div', 'registration-decree-popup__legal-text')
  legalText.append(makeElement('strong', '', '해당 항목 관련 조문'))
  reference.lines.forEach((line) => legalText.append(makeElement('p', '', line)))

  section.append(sectionHeading, version, explanation, legalText)
  article.append(section)
  body.append(article)

  const footer = makeElement('footer', 'law-article-popup__footer')
  footer.append(makeElement('span', '', '법제처 국가법령정보센터 · 현행 법령 기준'))
  const footerLink = makeElement('a', '', '원문 ↗')
  footerLink.href = reference.url
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

function ensureBodyReference(heading) {
  if (!(heading instanceof HTMLElement)) return
  const text = heading.textContent || ''
  const matched = findReference(text)
  const existingRow = heading.nextElementSibling?.classList?.contains('registration-law-body-citation')
    ? heading.nextElementSibling
    : null

  if (!matched) {
    if (existingRow) existingRow.remove()
    return
  }

  const { key, reference } = matched
  const titleText = cleanTitle(text)
  if (heading.textContent !== titleText) heading.textContent = titleText

  if (existingRow?.dataset.registrationDecreeCitationRow === key) return
  if (existingRow) existingRow.remove()

  const citationRow = makeElement('div', 'registration-law-body-citation')
  citationRow.dataset.registrationDecreeCitationRow = key
  citationRow.append(makeElement('span', 'registration-law-body-citation__label', '근거 법령'))

  const citationButton = makeElement('button', 'registration-law-body-ref', reference.citation)
  citationButton.type = 'button'
  citationButton.dataset.registrationDecreeRef = key
  citationButton.setAttribute('aria-label', `${LAW_TITLE} ${reference.citation.replace(/^영\s*/, '')} 보기`)
  citationButton.setAttribute('title', '클릭하면 현재 항목에 대응하는 시행령 조문을 확인합니다.')
  citationRow.append(citationButton)
  heading.insertAdjacentElement('afterend', citationRow)
}

function cleanSecondaryTitle(heading) {
  if (!(heading instanceof HTMLElement)) return
  const text = heading.textContent || ''
  if (!findReference(text)) return
  const cleaned = cleanTitle(text)
  if (heading.textContent !== cleaned) heading.textContent = cleaned
}

function correctNavigationTypos() {
  document.querySelectorAll('.registration-law-nav-v2 .registration-toc-node button span').forEach((label) => {
    if (!(label instanceof HTMLElement)) return
    let next = label.textContent || ''
    next = next.replace('신규등록 밑 등록전환', '신규등록 및 등록전환')
    next = next.replace('지번번경', '지번변경')
    if (label.textContent !== next) label.textContent = next
  })
}

function enhanceAll() {
  correctNavigationTypos()
  document
    .querySelectorAll('.registration-law-page .public-law-content .study-section-heading h2')
    .forEach(ensureBodyReference)
  document
    .querySelectorAll('.registration-law-page .public-law-content .registration-focus-panel .study-block__title h3')
    .forEach(cleanSecondaryTitle)
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  document.addEventListener('click', (event) => {
    if (!(event.target instanceof Element)) return
    const button = event.target.closest('.registration-law-body-ref[data-registration-decree-ref]')
    if (!button) return
    event.preventDefault()
    event.stopPropagation()
    openPopup(button.dataset.registrationDecreeRef)
  }, true)

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && activePopup) closePopup()
  }, true)

  const start = () => {
    enhanceAll()
    const root = document.getElementById('root')
    if (!root) return
    const observer = new MutationObserver(enhanceAll)
    observer.observe(root, { childList: true, characterData: true, subtree: true })
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true })
  else start()
}
