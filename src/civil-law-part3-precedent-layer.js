// 민법 판례 강화 레이어 · PART 3 계약법
// 법령 LAW-FIRST 카드 뒤에 시험상 결론을 좌우하는 대법원 판례를 배치합니다.
// 판례는 국가법령정보센터 판례 원문을 기준으로 시험상 판단기준만 요약합니다.

const PART3_PRECEDENTS = {
  '계약체결상의 과실책임': [
    {
      caseNo: '2015다10929',
      title: '의사의 불합치로 계약이 성립하지 않은 경우 제535조 유추적용 불가',
      holding: '계약이 당사자 의사의 불합치로 성립하지 않은 경우에는, 상대방이 계약이 성립하지 않을 수 있음을 알았거나 알 수 있었다는 사정만으로 민법 제535조를 유추적용하여 계약체결상 과실책임을 물을 수 없습니다.',
      exam: '제535조는 목적이 불능한 계약을 체결한 경우의 특별규정입니다. 단순한 계약 불성립까지 일반적으로 확대 적용하지 않습니다.',
      url: 'https://www.law.go.kr/LSW/precInfoP.do?precSeq=186225',
    },
  ],
  '동시이행의 항변권': [
    {
      caseNo: '2019다215791',
      title: '대가적 의미와 이행상 견련성이 있으면 동시이행항변권 인정 가능',
      holding: '쌍방의 채무가 전형적인 쌍무계약상 주된 채무가 아니더라도 구체적 계약관계에서 서로 대가적 의미가 있고 이행상 견련관계를 인정할 사정이 있으면 동시이행의 항변권이 인정될 수 있습니다. 선이행의무자에게 상대방 이행이 곤란할 현저한 사유가 생긴 경우의 불안의 항변권도 같은 관점에서 판단합니다.',
      exam: '기계적으로 “쌍무계약의 주된 채무끼리만” 인정된다고 외우지 않습니다. 채무 사이의 대가적 의미와 이행상 견련성을 확인합니다.',
      url: 'https://law.go.kr/LSW/precInfoP.do?evtNo=2019다215791',
    },
  ],
  '위험부담': [
    {
      caseNo: '2017다254228',
      title: '쌍방 무책임 이행불능과 제537조의 채무자위험부담주의',
      holding: '쌍무계약에서 당사자 쌍방의 책임 없는 사유로 채무가 이행불능이 되면 민법 제537조가 적용되어 채무자는 자기 채무를 면하지만 상대방의 반대급부를 청구하지 못합니다. 이미 급부가 이루어진 경우에는 부당이득 법리에 따라 반환 문제가 생깁니다.',
      exam: '채무자 귀책 → 채무불이행, 쌍방 무책임 → 제537조, 채권자 귀책 또는 수령지체 중 무책임 사유 → 제538조로 순서대로 나눕니다.',
      url: 'https://www.law.go.kr/LSW/precInfoP.do?precSeq=216711',
    },
  ],
  '해제의 효과': [
    {
      caseNo: '99다40937',
      title: '해제 전 목적물을 가압류한 채권자는 제548조의 제3자에 포함',
      holding: '계약해제 전에 그 계약으로 이전된 목적물을 가압류한 채권자는 해당 목적물의 환가대금으로 채권 만족을 얻을 수 있는 법적 지위를 취득하므로 민법 제548조 제1항 단서의 제3자에 해당합니다.',
      exam: '제548조의 제3자는 단순한 사실상 이해관계인이 아니라 해제된 계약의 법률효과를 기초로 새로운 권리를 취득한 자인지가 핵심입니다.',
      url: 'https://www.law.go.kr/LSW/precInfoP.do?evtNo=99다40937',
    },
    {
      caseNo: '96다17653',
      title: '대항요건을 갖춘 주택임차인과 계약해제의 제3자 보호',
      holding: '소유권을 취득한 임대인으로부터 주택을 임차하여 계약해제 전에 주택의 인도와 주민등록을 마친 임차인은 민법 제548조 제1항 단서의 제3자에 해당하여, 임대인의 기초 소유권취득계약이 해제되더라도 임차권을 새로운 소유자에게 대항할 수 있습니다.',
      exam: '해제 전 새로운 권리를 취득했는지뿐 아니라 그 권리에 필요한 등기·인도·대항요건까지 갖추었는지를 확인합니다.',
      url: 'https://www.law.go.kr/LSW/precInfoP.do?evtNo=96다17653',
    },
  ],
  '해약금에 의한 계약해제': [
    {
      caseNo: '2022다256624',
      title: '제565조의 이행착수는 단순 준비를 넘어 객관적으로 인식 가능한 이행행위',
      holding: '민법 제565조의 이행착수는 외부에서 객관적으로 인식할 수 있을 정도로 채무이행행위의 일부를 하거나 이행에 필요한 전제행위를 하는 경우를 말합니다. 단순한 이행 준비만으로는 부족하지만 반드시 완전한 이행제공에까지 이를 필요는 없습니다.',
      exam: '계약금 해제 가능 여부는 “누가 이행에 착수했는가”가 기준입니다. 원칙적으로 이행기 전에도 착수할 수 있으나, 이행기 전 착수를 배제하는 특별한 사정이 있는지는 별도로 봅니다.',
      url: 'https://www.law.go.kr/LSW/precInfoP.do?precSeq=239257',
    },
  ],
  '매도인의 담보책임': [
    {
      caseNo: '98다18506',
      title: '법률적 장애도 매매목적물의 하자가 될 수 있고 하자는 계약 성립시 기준',
      holding: '매매목적물이 거래통념상 기대되는 객관적 성질이나 당사자가 예정·보증한 성질을 갖추지 못한 경우 하자가 될 수 있고, 건축허가를 받을 수 없는 법률적 장애도 사안에 따라 하자에 포함될 수 있습니다. 하자 존부는 매매계약 성립시를 기준으로 판단합니다.',
      exam: '물리적 결함만 하자가 아닙니다. 법률적 제한도 목적과 약정에 따라 하자가 될 수 있으며 판단 기준시점은 계약 성립시입니다.',
      url: 'https://law.go.kr/LSW/precInfoP.do?precSeq=230187',
    },
    {
      caseNo: '2015다78703',
      title: '착오취소와 하자담보책임은 취지·요건·효과가 서로 다른 제도',
      holding: '매매계약 내용의 중요부분에 착오가 있는 경우에는 매도인의 하자담보책임 성립 여부와 별개로 민법 제109조에 따른 착오취소가 가능할 수 있습니다. 두 제도는 취지와 요건, 효과가 서로 다릅니다.',
      exam: '하자가 문제된다고 해서 착오취소가 배제되는 것은 아닙니다. 사안에서 제109조 요건과 제580조 요건을 각각 따로 검토합니다.',
      url: 'https://law.go.kr/LSW/precInfoP.do?mode=0&precSeq=203030',
    },
  ],
  '경매에 있어서의 담보책임': [
    {
      caseNo: '2014다80839',
      title: '제578조·제580조 제2항의 경매는 법률에 의한 강제적 매도절차',
      holding: '민법 제578조와 제580조 제2항의 경매는 국가나 그 대행기관이 법률에 따라 목적물 권리자의 의사와 무관하게 하는 강제집행·담보권 실행 경매·공매 등을 의미합니다. 일반적인 임의매매와 구별되는 특칙입니다.',
      exam: '“경매”라는 명칭만 볼 것이 아니라 법률에 근거한 강제적 매도인지 확인합니다. 일반 하자담보책임 규정을 경매에 그대로 적용하지 않습니다.',
      url: 'https://www.law.go.kr/LSW/precInfoP.do?precSeq=183246',
    },
  ],
  '임대인의 수선의무': [
    {
      caseNo: '2011다107405',
      title: '수선의무는 계약 목적에 따른 사용·수익 방해 정도를 기준으로 판단',
      holding: '임대인의 수선의무는 목적물의 파손·장해가 임차인이 계약에서 정한 용도대로 사용·수익하는 것을 방해할 정도인지에 따라 판단합니다. 목적물의 종류·용도, 장해의 규모와 부위, 사용·수익 영향, 수선 난이도와 비용, 계약 당시 상태와 차임 등을 종합합니다.',
      exam: '사소하여 임차인이 별 비용 없이 쉽게 고칠 수 있는 정도와, 사용·수익을 방해할 정도의 장해를 구별합니다.',
      url: 'https://www.law.go.kr/LSW/precInfoP.do?precSeq=161662',
    },
    {
      caseNo: '2009다96984',
      title: '임대인에게 귀책사유가 없어도 사용·수익에 필요한 수선의무가 문제될 수 있음',
      holding: '임대차 목적물의 하자가 임차인의 계약 목적에 따른 사용·수익을 방해할 정도라면 임대인은 원칙적으로 수선의무를 부담하고, 그 훼손에 임대인의 귀책사유가 없다는 이유만으로 당연히 수선의무가 배제되는 것은 아닙니다.',
      exam: '수선의무의 중심은 임대인의 과실 유무보다 임차목적물의 사용·수익에 필요한 상태 유지입니다.',
      url: 'https://www.law.go.kr/LSW/precInfoP.do?evtNo=2009다96984',
    },
  ],
  '무단전대의 법률관계': [
    {
      caseNo: '92다45308',
      title: '무단양도·전대라도 배신행위가 아닌 특별한 사정이 있으면 해지권 제한',
      holding: '임차인이 임대인의 동의 없이 제3자에게 임차물을 사용·수익하게 한 경우라도 그 행위가 임대인에 대한 배신적 행위라고 인정할 수 없는 특별한 사정이 있으면 민법 제629조에 따른 해지권이 발생하지 않습니다.',
      exam: '조문상 원칙은 동의 없는 양도·전대 금지와 위반 시 해지입니다. 그러나 시험에서는 “무단전대 = 언제나 해지 가능”으로 단정하지 말고 배신행위성이 없는 특별한 사정을 추가로 확인합니다.',
      url: 'https://law.go.kr/precInfoP.do?precSeq=122938',
    },
  ],
}

function escPart3Precedent(value = '') {
  return String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]))
}

function renderPart3Precedents(topic, items) {
  return `<section class="study-block civil-precedent-section civil-leaf-precedents" data-civil-law-part3-precedents="true" data-topic="${escPart3Precedent(topic)}"><div class="study-block__title"><span>⚖</span><h3>이 세부항목의 핵심 대법원 판례</h3></div><p class="study-note">현행 민법 조문을 먼저 확인한 뒤, 조문만으로 시험 결론이 완성되지 않는 부분을 대법원 판례로 보강합니다.</p><div class="civil-precedent-grid">${items.map((item) => `<article class="civil-precedent-card"><div class="civil-precedent-card__meta"><span>대법원</span><b>${escPart3Precedent(item.caseNo)}</b></div><strong>${escPart3Precedent(item.title)}</strong><p>${escPart3Precedent(item.holding)}</p><div class="civil-leaf-precedents__exam"><b>시험 포인트</b><p>${escPart3Precedent(item.exam)}</p></div><a href="${escPart3Precedent(item.url)}" target="_blank" rel="noreferrer">국가법령정보센터 판례 원문 ↗</a></article>`).join('')}</div></section>`
}

function syncPart3Precedents() {
  const page = document.querySelector('.civil-law-page')
  if (!page) return
  const breadcrumb = page.querySelector('.public-law-breadcrumb')?.textContent || ''
  const topic = page.querySelector('.study-section-heading h2')?.textContent?.trim() || ''
  const old = page.querySelector('[data-civil-law-part3-precedents="true"]')

  if (!breadcrumb.includes('PART 3')) {
    old?.remove()
    return
  }

  const items = PART3_PRECEDENTS[topic]
  if (!items) {
    old?.remove()
    return
  }
  if (old?.dataset.topic === topic) return
  old?.remove()

  const lawFirst = page.querySelector('[data-civil-law-part3-first="true"]')
  if (!lawFirst) return
  const wrap = document.createElement('div')
  wrap.innerHTML = renderPart3Precedents(topic, items)
  lawFirst.insertAdjacentElement('afterend', wrap.firstElementChild)
}

let part3PrecedentQueued = false
function schedulePart3Precedents() {
  if (part3PrecedentQueued) return
  part3PrecedentQueued = true
  requestAnimationFrame(() => {
    part3PrecedentQueued = false
    syncPart3Precedents()
  })
}

if (typeof document !== 'undefined') {
  const observer = new MutationObserver(schedulePart3Precedents)
  observer.observe(document.documentElement, { subtree: true, childList: true, characterData: true })
  document.addEventListener('click', (event) => {
    if (event.target.closest('.civil-nav-topic-button, .civil-nav-point summary')) schedulePart3Precedents()
  })
  schedulePart3Precedents()
}
