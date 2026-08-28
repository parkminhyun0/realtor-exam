// 민법 PART 3 계약법 · 판례 의존도가 높은 세부항목 추가 직접 판례 레이어
// 기존 civil-law-part3-precedent-layer.js와 겹치지 않는 세부항목만 보강합니다.
// 판례 원문은 국가법령정보센터 URL로 직접 연결합니다.

const EXTRA_PART3_PRECEDENTS = {
  '제3자를 위한 계약': [
    {
      caseNo: '2021다271183',
      title: '수익의 의사표시 후 제3자의 권리는 원칙적으로 임의 변경·소멸시킬 수 없다',
      holding: '제3자를 위한 계약에서 제3자가 민법 제539조 제2항에 따라 수익의 의사표시를 하여 권리가 확정적으로 귀속되면, 미리 변경·소멸 가능성을 유보했거나 제3자가 동의한 경우가 아니라면 요약자와 낙약자가 합의하여 그 권리를 임의로 변경·소멸시킬 수 없습니다.',
      exam: '제3자를 위한 계약인지 여부는 당사자의 합리적 의사해석으로 판단하고, 수익의 의사표시 후에는 제541조의 권리확정 효과를 별도로 확인합니다.',
      url: 'https://www.law.go.kr/LSW/precInfoP.do?precSeq=219733',
    },
  ],
  '임차인의 비용상환청구권': [
    {
      caseNo: '2001다40381',
      title: '유익비는 지출액과 현존 증가액을 모두 산정해 임대인의 선택으로 정한다',
      holding: '민법 제626조 제2항의 유익비상환에서는 임차인이 실제 지출한 비용과 임차물의 현존하는 가치증가액을 모두 산정하고, 임대인은 그 중 어느 금액을 상환할지 선택할 수 있습니다.',
      exam: '유익비는 임차물의 객관적 가치 증가가 전제입니다. 실제 지출액만 계산해서 끝내지 말고 현존 증가액과 임대인의 선택권까지 확인합니다.',
      url: 'https://www.law.go.kr/LSW/precInfoP.do?precSeq=194747',
    },
  ],
  '건물임차인의 부속물매수청구권': [
    {
      caseNo: '92다41627',
      title: '부속물은 건물의 사용에 객관적 편익을 주는 임차인 소유 물건이어야 한다',
      holding: '민법 제646조의 부속물은 건물에 부속되고 임차인 소유이며 건물의 구성부분이 되지 않으면서 건물 사용에 객관적 편익을 주는 물건을 뜻합니다. 임차인의 특수목적에만 사용되는 물건은 원칙적으로 매수청구 대상이 아닙니다.',
      exam: '임차인의 필요가 아니라 건물의 객관적 사용목적을 기준으로 판단합니다. 구조·계약상 용도·위치·주변환경을 함께 봅니다.',
      url: 'https://www.law.go.kr/LSW/precInfoP.do?precSeq=603793',
    },
  ],
  '토지임차인의 갱신청구권과 지상물매수청구권': [
    {
      caseNo: '2023다309020, 309037',
      title: '지상물매수청구권은 형성권이고 매수가격은 행사 당시의 시가가 기준',
      holding: '건물 소유를 목적으로 한 토지임대차가 기간만료로 종료되고 임차인이 민법 제643조의 지상물매수청구권을 행사하면 그 행사만으로 매매계약이 성립한 것과 같은 효과가 발생합니다. 매수가격은 행사 당시 건물이 현재하는 상태를 기준으로 평가한 시가입니다.',
      exam: '지상물매수청구권은 단순한 협상의무가 아니라 형성권입니다. 행사시점과 행사 당시 시가를 함께 기억합니다.',
      url: 'https://www.law.go.kr/LSW/precInfoP.do?mode=0&precSeq=240669',
    },
  ],
  '동의 있는 전대의 법률관계': [
    {
      caseNo: '2018다200518',
      title: '동의 있는 전대에서도 원임대차와 전대차는 별개로 존속한다',
      holding: '임차인이 임대인의 동의를 얻어 전대한 경우에도 임대인과 임차인의 원임대차는 계속 유지되고, 임차인과 전차인 사이에는 별도의 전대차가 성립합니다. 전차인은 민법 제630조에 따라 임대인에게 직접 의무를 부담하지만 그 범위는 원임대차와 전대차에서 부담하는 의무의 범위를 넘지 않습니다.',
      exam: '임대인 ↔ 임차인 원임대차, 임차인 ↔ 전차인 전대차를 분리한 뒤 제630조가 전차인에게 임대인에 대한 직접의무를 추가하는 구조로 정리합니다.',
      url: 'https://law.go.kr/LSW/precInfoP.do?precSeq=199734',
    },
  ],
}

const esc = (value = '') => String(value).replace(/[&<>'"]/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;',
}[char]))

function renderExtraPart3Precedents(topic, items) {
  return `<section class="study-block civil-precedent-section civil-leaf-precedents" data-civil-law-part3-extra-precedents="true" data-topic="${esc(topic)}">
    <div class="study-block__title"><span>⚖</span><h3>이 세부항목의 핵심 대법원 판례</h3></div>
    <p class="study-note">조문만으로 시험상 결론이 완성되지 않는 판례 의존도가 높은 논점만 직접 연결합니다.</p>
    <div class="civil-precedent-grid">${items.map((item) => `<article class="civil-precedent-card">
      <div class="civil-precedent-card__meta"><span>대법원</span><b>${esc(item.caseNo)}</b></div>
      <strong>${esc(item.title)}</strong>
      <p>${esc(item.holding)}</p>
      <div class="civil-leaf-precedents__exam"><b>시험 포인트</b><p>${esc(item.exam)}</p></div>
      <a href="${esc(item.url)}" target="_blank" rel="noreferrer">국가법령정보센터 판례 원문 ↗</a>
    </article>`).join('')}</div>
  </section>`
}

function currentPart3Topic(page) {
  const breadcrumb = page.querySelector('.public-law-breadcrumb')?.textContent || ''
  if (!/PART\s+3/.test(breadcrumb)) return ''
  return page.querySelector('.study-section-heading h2')?.textContent?.trim() || ''
}

function syncExtraPart3Precedents() {
  const page = document.querySelector('.civil-law-page')
  if (!page) return

  const old = page.querySelector('[data-civil-law-part3-extra-precedents="true"]')
  const topic = currentPart3Topic(page)
  const items = EXTRA_PART3_PRECEDENTS[topic]

  if (!items) {
    old?.remove()
    return
  }
  if (old?.dataset.topic === topic) return

  old?.remove()
  const lawFirst = page.querySelector('[data-civil-law-part3-first="true"], [data-civil-law-first="true"]')
  if (!lawFirst) return

  const wrap = document.createElement('div')
  wrap.innerHTML = renderExtraPart3Precedents(topic, items)
  lawFirst.insertAdjacentElement('afterend', wrap.firstElementChild)
}

let queued = false
function scheduleExtraPart3Precedents() {
  if (queued) return
  queued = true
  requestAnimationFrame(() => {
    queued = false
    syncExtraPart3Precedents()
  })
}

if (typeof document !== 'undefined') {
  const observer = new MutationObserver(scheduleExtraPart3Precedents)
  observer.observe(document.documentElement, { subtree: true, childList: true, characterData: true })
  document.addEventListener('click', (event) => {
    if (event.target.closest('.civil-nav-topic-button, .civil-nav-point summary')) scheduleExtraPart3Precedents()
  })
  scheduleExtraPart3Precedents()
}
