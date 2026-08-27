import {
  civilLawDeepPointGuides,
  civilLawDeepStudyMeta,
  civilLawPastQuestionLibrary,
} from './data/civilLawDeepStudy'
import {
  civilLawPastQuestionFixups,
  civilLawPastQuestionKeyOverrides,
} from './data/civilLawDeepStudyFixups'

const QUESTION_LIBRARY = {
  ...civilLawPastQuestionLibrary,
  ...civilLawPastQuestionFixups,
}

function esc(value = '') {
  return String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;',
  }[char]))
}

function pointIdFromBreadcrumb(text = '') {
  const match = String(text).match(/PART\s*(\d+).*?POINT\s*0?(\d+)/i)
  if (!match) return ''
  return `p${Number(match[1])}s${Number(match[2])}`
}

function getQuestionKeys(pointId, guide) {
  const source = civilLawPastQuestionKeyOverrides[pointId] || guide?.questionKeys || []
  const unique = []
  source.forEach((key) => {
    if (QUESTION_LIBRARY[key] && !unique.includes(key)) unique.push(key)
  })
  return unique.slice(0, 4)
}

function renderFramework(items = []) {
  return items.map((item, index) => `
    <div class="civil-deep-framework-card">
      <span>${String(index + 1).padStart(2, '0')}</span>
      <p>${esc(item)}</p>
    </div>
  `).join('')
}

function renderCases(items = []) {
  return items.map(([label, body]) => `
    <article class="civil-deep-case-card">
      <header>
        <span>판례·사례</span>
        <strong>${esc(label)}</strong>
      </header>
      <p>${esc(body)}</p>
    </article>
  `).join('')
}

function renderPastQuestion(key, item, index) {
  if (!item) return ''
  return `
    <article class="civil-deep-past-card" data-question-key="${esc(key)}">
      <header class="civil-deep-past-card__head">
        <div>
          <span>기출문제 ${index + 1}</span>
          <strong>${item.year}년 제${item.round}회 · 민법 및 민사특별법 ${item.number}번</strong>
        </div>
        <a href="${esc(item.officialUrl)}" target="_blank" rel="noreferrer">Q-Net 원문 ↗</a>
      </header>
      <div class="civil-deep-past-card__body">
        <b>${esc(item.title)}</b>
        <p>${esc(item.focus)}</p>
      </div>
      <details>
        <summary>이 문제의 풀이 기준 보기</summary>
        <div class="civil-deep-past-card__answer">
          <strong>판단 순서</strong>
          <p>① 적용 조문을 먼저 찾고 → ② 요건을 사실관계에 대입하고 → ③ 예외·제3자·판례가 있는지 확인한 뒤 → ④ 각 선지의 결론을 판단합니다.</p>
          <small>${esc(item.sourceNote || civilLawDeepStudyMeta.sourceNotice)}</small>
        </div>
      </details>
    </article>
  `
}

function renderDeepStudy(pointId, guide) {
  const questionKeys = getQuestionKeys(pointId, guide)
  const questionCards = questionKeys
    .map((key, index) => renderPastQuestion(key, QUESTION_LIBRARY[key], index))
    .join('')

  return `
    <section class="civil-deep-study" data-civil-deep-study="true" data-point-id="${esc(pointId)}">
      <header class="civil-deep-study__hero">
        <span>DEEP STUDY · 상세 해설</span>
        <h3>${esc(guide.headline)}</h3>
        <p>법령 원문을 1차 기준으로 읽은 뒤, 아래 해설에서 요건·효과·예외와 판례 적용사례를 연결합니다. 기존 LAW-FIRST 조문카드와 판례 원문 링크는 그대로 유지됩니다.</p>
      </header>

      <div class="civil-deep-overview">
        ${guide.overview.map((paragraph, index) => `
          <article>
            <span>상세 ${index + 1}</span>
            <p>${esc(paragraph)}</p>
          </article>
        `).join('')}
      </div>

      <section class="civil-deep-subsection">
        <div class="study-block__title"><span>핵심</span><h3>판단 순서 · 핵심 구조</h3></div>
        <div class="civil-deep-framework-grid">${renderFramework(guide.framework)}</div>
      </section>

      <section class="civil-deep-subsection">
        <div class="study-block__title"><span>판례</span><h3>판례·사례로 이해하기</h3></div>
        <p class="civil-deep-note">판례번호가 표시된 카드는 해당 대법원 판결의 시험상 결론을 요약한 것입니다. 구체적 사건에서는 사실관계와 판결 원문을 함께 확인합니다.</p>
        <div class="civil-deep-case-grid">${renderCases(guide.cases)}</div>
      </section>

      <section class="civil-deep-subsection civil-deep-past">
        <div class="civil-deep-past__title">
          <div class="study-block__title"><span>기출</span><h3>이 POINT의 기출문제 4선</h3></div>
          <strong>${questionCards ? questionKeys.length : 0}문제</strong>
        </div>
        <p class="civil-deep-note">한국산업인력공단 Q-Net 공개 기출을 기준으로 연도·회차·문항번호를 연결했습니다. 화면에서는 논점을 정확히 복습할 수 있도록 문제 문장을 요약·재구성하고, 원문은 각 카드의 Q-Net 링크에서 확인합니다.</p>
        <div class="civil-deep-past-grid">${questionCards}</div>
        <p class="civil-deep-source-notice">${esc(civilLawDeepStudyMeta.sourceNotice)}</p>
      </section>
    </section>
  `
}

function syncCivilDeepStudy() {
  const page = document.querySelector('.civil-law-page')
  if (!page) return

  const breadcrumb = page.querySelector('.public-law-breadcrumb')?.textContent || ''
  const pointId = pointIdFromBreadcrumb(breadcrumb)
  const guide = civilLawDeepPointGuides[pointId]
  const current = page.querySelector('[data-civil-deep-study="true"]')

  if (!guide) {
    current?.remove()
    return
  }

  if (current?.dataset.pointId === pointId) return
  current?.remove()

  const topicFocus = page.querySelector('.civil-topic-focus')
  const lawFirst = page.querySelector('[data-civil-law-part1-first="true"], [data-civil-law-part2-first="true"], [data-civil-law-part3-first="true"], [data-civil-law-part4-first="true"]')
  const statute = page.querySelector('.civil-statute-section')
  const anchor = topicFocus || statute || lawFirst
  if (!anchor) return

  const wrapper = document.createElement('div')
  wrapper.innerHTML = renderDeepStudy(pointId, guide).trim()
  const section = wrapper.firstElementChild
  anchor.insertAdjacentElement('afterend', section)
}

let queued = false
function scheduleCivilDeepStudy() {
  if (queued) return
  queued = true
  requestAnimationFrame(() => {
    queued = false
    syncCivilDeepStudy()
  })
}

if (typeof document !== 'undefined') {
  const observer = new MutationObserver(scheduleCivilDeepStudy)
  observer.observe(document.documentElement, { subtree: true, childList: true, characterData: true })
  document.addEventListener('click', (event) => {
    if (event.target.closest('.civil-nav-topic-button, .civil-nav-point > summary')) scheduleCivilDeepStudy()
  })
  scheduleCivilDeepStudy()
}
