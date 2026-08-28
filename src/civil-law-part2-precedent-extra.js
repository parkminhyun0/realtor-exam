// 민법 PART 2 물권법 · 판례 의존도가 높은 세부항목 추가 직접 판례 레이어
// 기존 civil-law-precedent-layer.js와 겹치지 않는 세부항목만 보강합니다.
// 판례 원문은 국가법령정보센터 URL로 직접 연결합니다.

const EXTRA_PRECEDENTS = {
  '무효등기의 유용': [
    {
      caseNo: '2009다4787',
      title: '무효 가등기의 유용합의와 제3자',
      holding: '효력을 잃은 소유권이전등기청구권 가등기라도 부동산 소유자와 새로운 권리자가 그 가등기를 유용하기로 합의하고 부기등기를 마친 경우에는 소유자에 대하여 유용합의를 주장할 수 있습니다. 다만 유용합의 전에 등기부상 이해관계를 취득한 제3자에게는 그 유용합의로 대항할 수 없습니다.',
      exam: '무효등기의 유용은 당사자 합의만 보면 끝나는 문제가 아닙니다. 「유용합의 시점보다 먼저 등기상 이해관계를 취득한 제3자가 있는가」를 반드시 확인합니다.',
      url: 'https://www.law.go.kr/LSW/precInfoP.do?evtNo=2009%EB%8B%A44787',
    },
  ],
  '주위토지통행권': [
    {
      caseNo: '2008다75300, 75317, 75324',
      title: '통행로의 폭·위치는 가장 손해가 적은 방법으로 정한다',
      holding: '주위토지통행권은 맹지 등의 이용을 위하여 예외적으로 인정되므로 통행로의 폭과 위치는 피통행지 소유자에게 가장 손해가 적은 방법을 중심으로 정하고, 구체적 지형·위치·이용관계와 주변 사정을 종합하여 판단합니다.',
      exam: '기존에 쓰던 길이라는 이유만으로 그 길이 고정되는 것은 아닙니다. 필요성 + 피통행지의 최소손해가 핵심 판단축입니다.',
      url: 'https://www.law.go.kr/LSW/precInfoP.do?precSeq=136190',
    },
  ],
  '등기부취득시효': [
    {
      caseNo: '80다1341',
      title: '등기부취득시효의 선의·무과실 판단',
      holding: '민법 제245조 제2항에 따른 등기부취득시효에서 정당한 절차 없이 자기 명의의 소유권등기를 마치고 점유한 사정을 선의·무과실로 인정하려면 이를 뒷받침하는 특별한 사정이 필요합니다.',
      exam: '등기 + 10년 점유만으로 자동 완성되지 않습니다. 소유의 의사·평온·공연·선의·무과실 요건을 함께 확인합니다.',
      url: 'https://www.law.go.kr/LSW/precInfoP.do?precSeq=95788',
    },
  ],
  '공유물의 분할': [
    {
      caseNo: '2024다277854',
      title: '재판상 공유물분할은 현물분할이 원칙',
      holding: '재판상 공유물분할은 현물분할이 원칙이고, 현물로 분할할 수 없거나 현물분할로 현저한 가치감손의 염려가 있는 경우에 경매에 의한 대금분할을 선택할 수 있습니다. 토지의 경제적 가치가 지분비율에 맞도록 조정하는 현물분할도 가능합니다.',
      exam: '「협의 불성립 = 바로 경매분할」이 아닙니다. 현물분할 원칙 → 불가능·현저한 가치감손 여부 → 경매분할 순서로 판단합니다.',
      url: 'https://law.go.kr/LSW/precInfoP.do?precSeq=609373',
    },
  ],
  '분묘기지권': [
    {
      caseNo: '2013다17292 전원합의체',
      title: '20년 평온·공연 점유에 의한 분묘기지권 취득시효',
      holding: '대법원 전원합의체는 타인 소유 토지에 분묘를 설치한 뒤 20년간 평온·공연하게 분묘기지를 점유한 경우 관습법상 분묘기지권을 시효취득할 수 있다는 종래 법리를 확인하였습니다.',
      exam: '분묘기지권은 민법의 지상권 조문만으로 결론내리지 않습니다. 관습법상 성립유형과 취득시효 요건을 별도로 정리합니다.',
      url: 'https://www.law.go.kr/LSW/precInfoP.do?precSeq=215857',
    },
  ],
  '유치권의 효력과 소멸': [
    {
      caseNo: '2005다22688',
      title: '경매개시결정 후 취득한 유치권의 대항력 제한',
      holding: '부동산에 경매개시결정의 기입등기가 되어 압류의 효력이 발생한 뒤 채무자로부터 점유를 이전받아 유치권을 취득한 경우, 그 점유이전은 압류의 처분금지효에 저촉되어 경매절차의 매수인에게 유치권으로 대항할 수 없습니다.',
      exam: '유치권의 성립 여부와 경매 매수인에 대한 대항 가능 여부를 분리합니다. 특히 「경매개시결정 기입등기 전·후」를 시간축으로 확인합니다.',
      url: 'https://www.law.go.kr/LSW/precInfoP.do?precSeq=193845',
    },
  ],
  '저당권의 효력범위': [
    {
      caseNo: '94다12722',
      title: '저당권 효력은 저당부동산에 종된 권리에도 미칠 수 있다',
      holding: '민법 제358조가 저당부동산의 부합물과 종물에 효력이 미친다고 정한 취지는 저당부동산에 종된 권리에도 유추될 수 있고, 구분건물 전유부분의 저당권이 일정한 요건 아래 대지사용권에도 미칠 수 있습니다.',
      exam: '저당권의 효력범위는 건물 본체만 보지 않습니다. 부합물·종물과 전유부분에 종된 대지사용권까지 확장되는지 확인합니다.',
      url: 'https://www.law.go.kr/LSW/precInfoP.do?evtNo=94%EB%8B%A412722',
    },
  ],
  '근저당': [
    {
      caseNo: '2000다48265',
      title: '근저당권의 피담보채무 확정',
      holding: '근저당권은 채권최고액만 정하고 피담보채무의 확정을 장래에 유보하는 저당권이므로, 확정 전에는 채무의 증감·소멸이 근저당권에 곧바로 영향을 주지 않습니다. 존속기간·결산기 또는 해지 등 확정사유가 발생하면 그 시점의 채무가 피담보채무로 확정됩니다.',
      exam: '근저당 문제는 「채권최고액」과 「실제 피담보채무」를 구별하고, 먼저 피담보채무가 언제 확정되었는지부터 잡습니다.',
      url: 'https://www.law.go.kr/LSW/precInfoP.do?evtNo=2000%EB%8B%A448265',
    },
  ],
}

const esc = (value = '') => String(value).replace(/[&<>'"]/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;',
}[char]))

function renderPrecedentSection(topic, items) {
  return `<section class="study-block civil-precedent-section civil-leaf-precedents" data-civil-law-part2-extra-precedents="true" data-topic="${esc(topic)}">
    <div class="study-block__title"><span>⚖</span><h3>이 세부항목의 핵심 대법원 판례</h3></div>
    <p class="study-note">조문만으로 결론이 완성되지 않는 판례 의존도가 높은 논점만 선별해 직접 연결합니다.</p>
    <div class="civil-precedent-grid">${items.map((item) => `<article class="civil-precedent-card">
      <div class="civil-precedent-card__meta"><span>대법원</span><b>${esc(item.caseNo)}</b></div>
      <strong>${esc(item.title)}</strong>
      <p>${esc(item.holding)}</p>
      <div class="civil-leaf-precedents__exam"><b>시험 포인트</b><p>${esc(item.exam)}</p></div>
      <a href="${esc(item.url)}" target="_blank" rel="noreferrer">국가법령정보센터 판례 원문 ↗</a>
    </article>`).join('')}</div>
  </section>`
}

function currentTopic(page) {
  const breadcrumb = page.querySelector('.public-law-breadcrumb')?.textContent || ''
  if (!/PART\s+2/.test(breadcrumb)) return ''
  return page.querySelector('.study-section-heading h2')?.textContent?.trim() || ''
}

function syncExtraPrecedents() {
  const page = document.querySelector('.civil-law-page')
  if (!page) return

  const old = page.querySelector('[data-civil-law-part2-extra-precedents="true"]')
  const topic = currentTopic(page)
  const items = EXTRA_PRECEDENTS[topic]

  if (!items) {
    old?.remove()
    return
  }
  if (old?.dataset.topic === topic) return

  old?.remove()
  const lawFirst = page.querySelector('[data-civil-law-part2-first="true"], [data-civil-law-first="true"]')
  if (!lawFirst) return

  const wrap = document.createElement('div')
  wrap.innerHTML = renderPrecedentSection(topic, items)
  const node = wrap.firstElementChild
  lawFirst.insertAdjacentElement('afterend', node)
}

let queued = false
function scheduleExtraPrecedentSync() {
  if (queued) return
  queued = true
  requestAnimationFrame(() => {
    queued = false
    syncExtraPrecedents()
  })
}

if (typeof document !== 'undefined') {
  const observer = new MutationObserver(scheduleExtraPrecedentSync)
  observer.observe(document.documentElement, { subtree: true, childList: true, characterData: true })
  document.addEventListener('click', (event) => {
    if (event.target.closest('.civil-nav-topic-button, .civil-nav-point summary')) scheduleExtraPrecedentSync()
  })
  scheduleExtraPrecedentSync()
}
