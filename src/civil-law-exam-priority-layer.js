// 민법 정밀검수 2차 · 시험 대비 우선순위 + O/X + 연관쟁점 연결
// 중요: A/B/C는 공인된 출제빈도 통계가 아니라, 현행 법령·판례의 시험상 쟁점성/복합성에 따른 편집 우선순위입니다.

const PRIORITY_A = new Set([
  '법률행위의 목적의 사회적 타당성','이중매매의 법률관계','불공정한 법률행위','비진의표시','통정허위표시','착오로 인한 의사표시','사기·강박에 의한 의사표시',
  '무권대리','계약의 무권대리','표현대리','제125조의 표현대리','제126조의 표현대리','제129조의 표현대리','무효와 취소의 차이점','무효행위의 추인','토지거래허가구역 내의 토지거래 계약','취소권','법정추인','조건의 종류',
  '등기청구권','청구권보전의 가등기','등기의 추정력','중간생략등기','무효등기의 유용','점유보호청구권','주위토지통행권','점유취득시효','취득시효완성 후의 법률관계','등기부취득시효','공유의 법률관계','공유물의 분할','법정지상권','관습법상의 법정지상권','전세권의 효력','유치권의 의의와 성립요건','유치권의 효력과 소멸','저당권의 효력범위','저당권과 용익권의 관계','제366조의 법정지상권','제365조의 일괄경매청구권','제3취득자의 지위','공동저당','근저당',
  '계약의 성립','청약과 승낙의 의사표시','계약체결상의 과실책임','동시이행의 항변권','위험부담','제3자를 위한 계약','법정해제','해제의 효과','해약금에 의한 계약해제','매도인의 담보책임','경매에 있어서의 담보책임','환매','임대차의 효력','임대인의 수선의무','임차인의 비용상환청구권','토지임차인의 갱신청구권과 지상물매수청구권','임차권의 양도와 전대','동의 있는 전대의 법률관계','무단전대의 법률관계',
  '대항력','우선변제권과 최우선변제권','임차권등기명령','존속기간','차임증감청구권','임차권의 승계','임차권등기명령제도','권리금보호','차임연체와 해지','대지사용권','관리단과 관리인','규약','재건축','가등기담보권의 실행','유효한 명의신탁','2자간 명의신탁','등기명의신탁','계약명의신탁','경매에 있어서의 명의신탁',
])

const PRIORITY_C = new Set([
  '민법','권리변동의 모습','법률행위의 종류','대리의 의의','대리효과','기한의 의의','물권의 특질','물권의 종류','점유권의 의의','소유권의 의의','지상권 일반','지역권','전세권 일반','담보물권의 통유성','계약의 종류','교환 일반','임대차 일반',
])

const RELATED = {
  'PART 1|POINT 02|이중매매의 법률관계': [
    ['PART 1','POINT 02','법률행위의 목적의 사회적 타당성','반사회질서 법률행위','제103조와 적극가담 판단을 함께 봅니다.'],
    ['PART 2','POINT 02','등기의 추정력','등기와 제3자','제2매수인 명의 등기의 효력 문제와 연결됩니다.'],
  ],
  'PART 1|POINT 03|통정허위표시': [
    ['PART 1','POINT 03','비진의표시','의사와 표시 불일치','상대방과의 통모 여부를 기준으로 구별합니다.'],
    ['PART 4','POINT 05','2자간 명의신탁','외관과 실질 권리관계','명의와 실질이 다른 부동산 관계를 비교합니다.'],
  ],
  'PART 1|POINT 03|착오로 인한 의사표시': [
    ['PART 3','POINT 04','매도인의 담보책임','착오취소 ↔ 담보책임','요건·효과가 별개이므로 병렬 검토가 필요합니다.'],
    ['PART 1','POINT 03','사기·강박에 의한 의사표시','취소원인 비교','제109조와 제110조의 제3자 보호 구조를 비교합니다.'],
  ],
  'PART 1|POINT 04|제126조의 표현대리': [
    ['PART 1','POINT 04','제125조의 표현대리','대리권수여의 표시','기본대리권·외관 형성 주체를 비교합니다.'],
    ['PART 1','POINT 04','제129조의 표현대리','대리권 소멸 후','현재 기본대리권과 과거 대리권의 차이를 봅니다.'],
    ['PART 1','POINT 04','계약의 무권대리','무권대리 원칙','표현대리가 부정될 때 추인·철회·책임으로 넘어갑니다.'],
  ],
  'PART 1|POINT 05|토지거래허가구역 내의 토지거래 계약': [
    ['PART 1','POINT 05','무효의 의의','유동적 무효','확정적 무효와 유동적 무효를 구별합니다.'],
    ['PART 1','POINT 05','무효행위의 추인','무효 후 효력','허가 후 소급효와 일반 무효행위 추인의 차이를 봅니다.'],
  ],
  'PART 2|POINT 02|등기의 추정력': [
    ['PART 2','POINT 02','등기의 의의','등기의 기능','추정력과 공신력의 차이를 정리합니다.'],
    ['PART 2','POINT 04','취득시효완성 후의 법률관계','등기 전 제3자','등기명의와 시효완성자의 대항관계를 연결합니다.'],
  ],
  'PART 2|POINT 04|점유취득시효': [
    ['PART 2','POINT 04','등기부취득시효','20년 ↔ 10년','점유취득시효와 등기부취득시효 요건을 비교합니다.'],
    ['PART 2','POINT 04','취득시효완성 후의 법률관계','완성 후 제3자','시효완성 뒤 등기 전 처분 문제를 이어서 봅니다.'],
  ],
  'PART 2|POINT 05|법정지상권': [
    ['PART 2','POINT 06','제366조의 법정지상권','저당권 실행형','민법 제366조 법정지상권의 성립요건과 연결합니다.'],
    ['PART 2','POINT 05','관습법상의 법정지상권','관습법형','소유자 분리 원인과 철거특약 여부를 비교합니다.'],
  ],
  'PART 2|POINT 06|유치권의 의의와 성립요건': [
    ['PART 2','POINT 06','유치권의 효력과 소멸','성립 후 존속','점유상실과 불가분성을 이어서 확인합니다.'],
    ['PART 2','POINT 06','저당권의 의의와 성립','유치권 ↔ 저당권','점유형 담보와 등기형 담보를 비교합니다.'],
  ],
  'PART 2|POINT 06|공동저당': [
    ['PART 2','POINT 06','저당권의 효력범위','저당권 기본효과','공동담보 배당 전 저당권의 효력범위를 확인합니다.'],
    ['PART 2','POINT 06','제3취득자의 지위','제3자 관계','대위·변제·소유권취득자의 지위와 연결합니다.'],
  ],
  'PART 3|POINT 02|동시이행의 항변권': [
    ['PART 3','POINT 02','위험부담','쌍무계약 견련성','이행거절 문제와 반대급부 존부 문제를 구별합니다.'],
    ['PART 3','POINT 03','해제의 효과','원상회복 동시이행','제549조에 의한 제536조 준용을 연결합니다.'],
  ],
  'PART 3|POINT 03|해제의 효과': [
    ['PART 3','POINT 03','해제와 해지의 비교','소급효 ↔ 장래효','원상회복과 계속적 계약의 장래효를 비교합니다.'],
    ['PART 3','POINT 02','동시이행의 항변권','원상회복 동시이행','해제로 생기는 반환의무 사이의 관계를 확인합니다.'],
  ],
  'PART 3|POINT 04|해약금에 의한 계약해제': [
    ['PART 3','POINT 03','법정해제','해약금 해제 ↔ 채무불이행 해제','해제원인과 손해배상 관계가 다릅니다.'],
    ['PART 3','POINT 04','매매 일반','계약금의 위치','매매계약 전체 구조 속에서 제565조를 봅니다.'],
  ],
  'PART 3|POINT 04|매도인의 담보책임': [
    ['PART 1','POINT 03','착오로 인한 의사표시','착오취소 병존','착오와 하자담보는 취지·요건·효과가 다릅니다.'],
    ['PART 3','POINT 04','경매에 있어서의 담보책임','일반매매 ↔ 경매','제578조의 특칙과 제580조 적용배제를 비교합니다.'],
  ],
  'PART 3|POINT 06|무단전대의 법률관계': [
    ['PART 3','POINT 06','임차권의 양도와 전대','제629조 원칙','임대인 동의 원칙을 먼저 확인합니다.'],
    ['PART 3','POINT 06','동의 있는 전대의 법률관계','동의 유무 비교','전차인의 직접의무와 임대차 종료효를 비교합니다.'],
  ],
  'PART 4|POINT 01|대항력': [
    ['PART 3','POINT 06','임차권의 대항력','민법상 대항력','일반 임대차와 주택 특별법의 공시요건을 비교합니다.'],
    ['PART 4','POINT 02','대항력','주택 ↔ 상가','주민등록과 사업자등록 신청의 차이를 봅니다.'],
  ],
  'PART 4|POINT 01|우선변제권과 최우선변제권': [
    ['PART 4','POINT 02','우선변제권과 최우선변제권','주택 ↔ 상가 배당','확정일자·소액임차인 구조를 교차확인합니다.'],
    ['PART 4','POINT 01','임차권등기명령','이사 후 권리보전','대항력·우선변제권 유지와 연결합니다.'],
  ],
  'PART 4|POINT 02|권리금보호': [
    ['PART 4','POINT 02','차임연체와 해지','권리금 보호 예외','3기 차임연체가 갱신·권리금에 미치는 영향을 연결합니다.'],
    ['PART 4','POINT 02','존속기간','갱신요구 10년','임대차 존속과 권리금 회수시기를 함께 봅니다.'],
  ],
  'PART 4|POINT 03|대지사용권': [
    ['PART 4','POINT 03','전유부분과 구분소유권','전유부분과의 일체성','분리처분 금지를 중심으로 연결합니다.'],
    ['PART 4','POINT 03','공용부분','공용부분과 대지 구별','건물 내부 공유와 대지사용권을 구별합니다.'],
  ],
  'PART 4|POINT 04|가등기담보권의 실행': [
    ['PART 2','POINT 02','청구권보전의 가등기','일반 가등기와 구별','순위보전 가등기와 담보가등기의 법적 기능을 구별합니다.'],
    ['PART 4','POINT 04','가등기담보등에 관한 법률의 적용범위','법 적용 전제','청산절차 전에 적용대상인지 먼저 확인합니다.'],
  ],
  'PART 4|POINT 05|계약명의신탁': [
    ['PART 4','POINT 05','등기명의신탁','명의신탁 유형구별','매도인이 누구와 계약했는지를 기준으로 구별합니다.'],
    ['PART 4','POINT 05','2자간 명의신탁','2자간 ↔ 3자간','계약당사자·등기명의·물권변동 효력을 비교합니다.'],
  ],
}

const DRILLS = {
  'PART 1|POINT 03|통정허위표시': [
    [true,'통정허위표시의 무효는 선의의 제3자에게 대항하지 못한다.','민법 제108조 제2항은 제3자에게 선의만 요구하며 별도의 무과실 요건을 두고 있지 않습니다.'],
  ],
  'PART 1|POINT 03|착오로 인한 의사표시': [
    [false,'표의자에게 중대한 과실이 있으면 상대방이 그 착오를 알고 있었더라도 언제나 취소할 수 없다.','상대방이 착오를 알았거나 중대한 과실로 알지 못한 경우에는 표의자의 중대한 과실이 있어도 취소 제한의 예외가 문제됩니다.'],
  ],
  'PART 1|POINT 04|제126조의 표현대리': [
    [true,'제126조 표현대리는 기본대리권이 존재하고 그 권한을 넘은 행위에 관하여 상대방에게 정당한 이유가 있어야 한다.','기본대리권 → 권한초과 → 정당한 이유 순서로 판단합니다.'],
  ],
  'PART 1|POINT 05|무효행위의 추인': [
    [false,'무효인 법률행위는 추인하면 원칙적으로 처음부터 유효한 행위가 된다.','민법 제139조는 무효임을 알고 추인한 경우 원칙적으로 새로운 법률행위를 한 것으로 봅니다.'],
  ],
  'PART 1|POINT 05|토지거래허가구역 내의 토지거래 계약': [
    [false,'허가를 전제로 체결한 토지거래계약은 허가 전부터 확정적으로 무효이다.','허가를 전제로 한 계약은 판례상 허가 전 유동적 무효 상태로 보고, 허가를 받으면 소급하여 유효하게 되는 구조를 취합니다.'],
  ],
  'PART 2|POINT 02|등기의 추정력': [
    [false,'우리 민법상 부동산등기에는 추정력뿐 아니라 공신력도 인정된다.','등기명의자의 권리를 일응 진실로 보는 추정력과 무권리자 등기를 믿은 제3자를 보호하는 공신력은 구별하며, 일반적으로 등기의 공신력은 인정되지 않습니다.'],
  ],
  'PART 2|POINT 04|점유취득시효': [
    [false,'20년간 소유의 의사로 평온·공연하게 점유하면 등기 없이도 곧바로 소유권을 취득한다.','민법 제245조 제1항의 부동산 점유취득시효는 20년 점유 후 등기함으로써 소유권을 취득합니다.'],
  ],
  'PART 2|POINT 04|등기부취득시효': [
    [true,'소유자로 등기한 자가 10년간 소유의 의사로 평온·공연하게 선의이며 과실 없이 점유하면 등기부취득시효가 문제된다.','민법 제245조 제2항의 핵심 요건입니다.'],
  ],
  'PART 2|POINT 06|제366조의 법정지상권': [
    [false,'토지 저당권 설정 당시 건물이 없어도 저당권 설정 후 건물을 신축하면 원칙적으로 제366조 법정지상권이 성립한다.','판례는 원칙적으로 저당권 설정 당시 토지 위에 건물이 존재할 것을 요구합니다.'],
  ],
  'PART 2|POINT 06|유치권의 의의와 성립요건': [
    [false,'부동산 유치권은 저당권과 마찬가지로 등기해야 성립한다.','유치권은 법정담보물권이며 핵심 성립·존속요건은 목적물의 점유입니다.'],
  ],
  'PART 2|POINT 06|공동저당': [
    [true,'공동저당 목적부동산이 동시에 배당되면 각 부동산의 경매대가에 비례하여 채권의 부담을 안분하는 것이 제368조 제1항의 기본구조이다.','동시배당은 비례안분, 이시배당은 차순위저당권자의 대위가 핵심입니다.'],
  ],
  'PART 3|POINT 02|동시이행의 항변권': [
    [true,'쌍무계약의 당사자 일방은 상대방이 그 채무의 이행을 제공할 때까지 원칙적으로 자기 채무의 이행을 거절할 수 있다.','민법 제536조 제1항의 기본원칙입니다.'],
  ],
  'PART 3|POINT 02|위험부담': [
    [true,'쌍방의 책임 없는 사유로 일방의 채무가 이행불능이 되면 그 채무자는 원칙적으로 상대방의 반대급부를 청구하지 못한다.','민법 제537조의 채무자위험부담주의입니다.'],
  ],
  'PART 3|POINT 03|해제의 효과': [
    [true,'계약의 해제는 손해배상청구에 영향을 미치지 않는다.','민법 제551조는 해지 또는 해제가 손해배상청구에 영향을 미치지 않는다고 규정합니다.'],
  ],
  'PART 3|POINT 04|해약금에 의한 계약해제': [
    [false,'계약금이 해약금으로 추정되는 경우 상대방이 이미 이행에 착수한 뒤에도 수령자는 배액을 상환하여 해제할 수 있다.','민법 제565조상 해약금 해제는 당사자 일방이 이행에 착수할 때까지 가능합니다.'],
  ],
  'PART 3|POINT 04|경매에 있어서의 담보책임': [
    [false,'경매 목적물의 하자에도 민법 제580조의 일반 하자담보책임이 그대로 적용된다.','민법 제580조는 경매의 경우 적용하지 않는다고 규정하고, 경매에는 제578조의 특칙이 문제됩니다.'],
  ],
  'PART 4|POINT 01|대항력': [
    [false,'주택임차인이 제3자에게 대항하려면 주택의 인도·주민등록 외에 확정일자도 반드시 갖추어야 한다.','확정일자는 우선변제권의 요건이고, 대항력은 주택의 인도와 주민등록을 마친 다음 날부터 발생합니다.'],
  ],
  'PART 4|POINT 01|존속기간': [
    [true,'주택임대차를 2년 미만으로 정하면 원칙적으로 그 기간을 2년으로 보지만 임차인은 짧게 정한 기간이 유효함을 주장할 수 있다.','주택임대차보호법 제4조의 구조입니다.'],
  ],
  'PART 4|POINT 02|존속기간': [
    [true,'상가임차인의 계약갱신요구권은 최초 임대차기간을 포함한 전체 임대차기간이 10년을 넘지 않는 범위에서 행사할 수 있다.','상가건물 임대차보호법 제10조의 핵심 숫자입니다.'],
  ],
  'PART 4|POINT 02|권리금보호': [
    [true,'상가임대인은 원칙적으로 임대차기간이 끝나기 6개월 전부터 종료 시까지 임차인의 권리금 회수기회를 방해해서는 안 된다.','상가건물 임대차보호법 제10조의4의 보호기간입니다.'],
  ],
  'PART 4|POINT 04|가등기담보권의 실행': [
    [false,'가등기담보권자는 변제기가 지나기만 하면 청산절차 없이 즉시 본등기를 하여 소유권을 확정적으로 취득할 수 있다.','귀속청산은 청산금 평가액 등의 통지와 그 통지 도달 후 2개월의 청산기간을 거쳐야 합니다.'],
  ],
  'PART 4|POINT 05|계약명의신탁': [
    [true,'계약명의신탁에서 명의수탁자가 매매계약의 당사자이고 매도인이 명의신탁 사실을 알지 못한 경우에는 수탁자 명의 물권변동이 유효할 수 있다.','부동산실명법 제4조 제2항 단서의 핵심 예외입니다.'],
  ],
  'PART 4|POINT 05|유효한 명의신탁': [
    [false,'배우자 사이의 명의신탁이면 조세포탈이나 강제집행면탈 목적이 있어도 언제나 부동산실명법의 특례가 적용된다.','제8조 특례는 조세포탈·강제집행면탈·법령상 제한회피 목적이 없는 경우라는 전제가 중요합니다.'],
  ],
}

function esc(v='') { return String(v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])) }

function currentContext(page) {
  const bc = page.querySelector('.public-law-breadcrumb')?.textContent || ''
  const topic = page.querySelector('.study-section-heading h2')?.textContent?.trim() || ''
  const part = (bc.match(/PART\s+\d+/) || [''])[0]
  const point = (bc.match(/POINT\s+\d+/) || [''])[0]
  return { bc, topic, part, point, key: part && point && topic ? `${part}|${point}|${topic}` : '' }
}

function gradeFor(topic) {
  if (PRIORITY_A.has(topic)) return 'A'
  if (PRIORITY_C.has(topic)) return 'C'
  return 'B'
}

function priorityText(grade) {
  if (grade === 'A') return ['최우선','조문·판례·함정이 중첩되는 핵심쟁점. 먼저 회독하고 반복 확인합니다.']
  if (grade === 'B') return ['중요','기본조문과 대표 쟁점을 정확히 정리해야 하는 표준 학습범위입니다.']
  return ['기초·연결','정의와 체계를 잡는 항목. A/B 쟁점을 이해하기 위한 연결축으로 봅니다.']
}

function syncNavPriority(page) {
  page.querySelectorAll('.public-law-nav > details').forEach(partEl => {
    const part = (partEl.querySelector(':scope > summary')?.textContent.match(/PART\s+\d+/) || [''])[0]
    partEl.querySelectorAll('.civil-nav-point').forEach(pointEl => {
      const point = (pointEl.querySelector(':scope > summary')?.textContent.match(/POINT\s+\d+/) || [''])[0]
      pointEl.querySelectorAll('.civil-nav-topic-button').forEach(btn => {
        const topic = btn.querySelector('span:last-child')?.textContent?.trim() || ''
        const grade = gradeFor(topic)
        let badge = btn.querySelector('.civil-priority-mini')
        if (!badge) {
          badge = document.createElement('b')
          badge.className = 'civil-priority-mini'
          btn.appendChild(badge)
        }
        badge.dataset.grade = grade
        badge.textContent = grade
        badge.title = `${part} ${point} · 시험 대비 편집 우선순위 ${grade}`
      })
    })
  })
}

function renderPriorityBanner(key, topic) {
  const grade = gradeFor(topic)
  const [label, desc] = priorityText(grade)
  return `<section class="civil-exam-priority-banner" data-civil-exam-priority="true" data-key="${esc(key)}" data-grade="${grade}"><div class="civil-exam-priority-banner__grade">${grade}</div><div><small>EXAM STUDY PRIORITY · 편집등급</small><strong>${esc(label)}</strong><p>${esc(desc)}</p><em>※ 공식 출제빈도 통계가 아니라 현행 조문·판례·쟁점 복합성을 기준으로 한 학습 우선순위입니다.</em></div></section>`
}

function renderDrills(key, items) {
  if (!items?.length) return ''
  return `<section class="study-block civil-exam-drills" data-civil-exam-drills="true" data-key="${esc(key)}"><div class="study-block__title"><span>OX</span><h3>고빈출 함정 O/X</h3></div><p class="study-note">먼저 답을 판단한 뒤 해설을 확인하세요. 법령 원문과 판례카드의 결론을 압축한 점검문항입니다.</p><div class="civil-exam-drills__grid">${items.map(([answer,q,why],i)=>`<details class="civil-exam-drill-card"><summary><b>${i+1}</b><span>${esc(q)}</span><i>정답 보기</i></summary><div><strong class="${answer?'is-o':'is-x'}">${answer?'O':'X'}</strong><p>${esc(why)}</p></div></details>`).join('')}</div></section>`
}

function renderRelated(key, items) {
  if (!items?.length) return ''
  return `<section class="study-block civil-related-topics" data-civil-related-topics="true" data-key="${esc(key)}"><div class="study-block__title"><span>↗</span><h3>함께 연결해서 볼 쟁점</h3></div><p class="study-note">민법은 같은 법리가 다른 PART에서 다시 출제됩니다. 아래 항목으로 바로 이동해 비교할 수 있습니다.</p><div class="civil-related-topics__grid">${items.map(([part,point,topic,label,why])=>`<button type="button" class="civil-related-topic-button" data-target-part="${esc(part)}" data-target-point="${esc(point)}" data-target-topic="${esc(topic)}"><small>${esc(part)} · ${esc(point)}</small><strong>${esc(label)}</strong><span>${esc(topic)}</span><p>${esc(why)}</p></button>`).join('')}</div></section>`
}

function navigateToTarget(page, button) {
  const targetPart = button.dataset.targetPart
  const targetPoint = button.dataset.targetPoint
  const targetTopic = button.dataset.targetTopic
  const partEl = [...page.querySelectorAll('.public-law-nav > details')].find(el => el.querySelector(':scope > summary')?.textContent.includes(targetPart))
  if (!partEl) return
  partEl.open = true
  const pointEl = [...partEl.querySelectorAll('.civil-nav-point')].find(el => el.querySelector(':scope > summary')?.textContent.includes(targetPoint))
  if (!pointEl) return
  pointEl.open = true
  const topicBtn = [...pointEl.querySelectorAll('.civil-nav-topic-button')].find(el => el.querySelector('span:last-child')?.textContent?.trim() === targetTopic)
  if (!topicBtn) return
  topicBtn.click()
  requestAnimationFrame(() => page.querySelector('.study-section-heading')?.scrollIntoView({behavior:'smooth',block:'start'}))
}

function lastLearningAnchor(page) {
  const selectors = [
    '[data-civil-law-part1-precedents="true"]',
    '[data-civil-law-part2-precedents="true"]',
    '[data-civil-law-part3-precedents="true"]',
    '[data-civil-law-part4-precedents="true"]',
    '[data-civil-law-leaf-precedents="true"]',
    '[data-civil-law-special-lease-comparison="true"]',
    '[data-civil-law-part1-first="true"]',
    '[data-civil-law-part2-first="true"]',
    '[data-civil-law-part3-first="true"]',
    '[data-civil-law-part4-first="true"]',
  ]
  const nodes = selectors.flatMap(sel => [...page.querySelectorAll(sel)])
  if (!nodes.length) return page.querySelector('.study-section-heading')
  return nodes.sort((a,b) => {
    if (a === b) return 0
    return a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1
  }).at(-1)
}

function syncContent(page) {
  const { key, topic } = currentContext(page)
  if (!key) return

  const oldPriority = page.querySelector('[data-civil-exam-priority="true"]')
  if (oldPriority?.dataset.key !== key) oldPriority?.remove()
  if (!page.querySelector('[data-civil-exam-priority="true"]')) {
    const head = page.querySelector('.study-section-heading')
    if (head) {
      const wrap = document.createElement('div')
      wrap.innerHTML = renderPriorityBanner(key, topic)
      head.insertAdjacentElement('afterend', wrap.firstElementChild)
    }
  }

  const oldDrills = page.querySelector('[data-civil-exam-drills="true"]')
  if (oldDrills?.dataset.key !== key) oldDrills?.remove()
  const oldRelated = page.querySelector('[data-civil-related-topics="true"]')
  if (oldRelated?.dataset.key !== key) oldRelated?.remove()

  const drills = DRILLS[key]
  const related = RELATED[key]
  if (!drills && !related) return

  let anchor = lastLearningAnchor(page)
  if (drills && !page.querySelector('[data-civil-exam-drills="true"]')) {
    const wrap = document.createElement('div')
    wrap.innerHTML = renderDrills(key, drills)
    const node = wrap.firstElementChild
    anchor?.insertAdjacentElement('afterend', node)
    anchor = node
  }
  if (related && !page.querySelector('[data-civil-related-topics="true"]')) {
    const wrap = document.createElement('div')
    wrap.innerHTML = renderRelated(key, related)
    const node = wrap.firstElementChild
    anchor?.insertAdjacentElement('afterend', node)
  }
}

function syncExamLayer() {
  const page = document.querySelector('.civil-law-page')
  if (!page) return
  syncNavPriority(page)
  syncContent(page)
}

let queued = false
function scheduleExamLayer() {
  if (queued) return
  queued = true
  requestAnimationFrame(() => {
    queued = false
    syncExamLayer()
  })
}

if (typeof document !== 'undefined') {
  const observer = new MutationObserver(scheduleExamLayer)
  observer.observe(document.documentElement, {subtree:true,childList:true,characterData:true})
  document.addEventListener('click', event => {
    const related = event.target.closest('.civil-related-topic-button')
    const page = document.querySelector('.civil-law-page')
    if (related && page) {
      navigateToTarget(page, related)
      return
    }
    if (event.target.closest('.civil-nav-topic-button, .civil-nav-point summary')) scheduleExamLayer()
  })
  scheduleExamLayer()
}
