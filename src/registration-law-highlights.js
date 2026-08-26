import './registration-law-highlights.css'

const CRITICAL_TERMS = [
  '경계점좌표등록부',
  '지적측량수행자',
  '부동산종합공부',
  '등록사항 정정',
  '공동신청 원칙',
  '등기할 수 있는 권리',
  '물적 편성주의',
  '처분금지가처분',
  '소유권보존',
  '소유권이전',
  '경계복원측량',
  '지적현황측량',
  '등기필정보',
  '등기권리자',
  '등기의무자',
  '관할등기소',
  '공동신청',
  '단독신청',
  '신청주의',
  '각하사유',
  '말소회복',
  '신탁등기',
  '신탁원부',
  '가등기',
  '본등기',
  '가처분',
  '직권말소',
  '근저당권',
  '공동저당',
  '순위번호',
  '접수번호',
  '토지이동',
  '지적소관청',
  '지번부여지역',
  '지적공부',
  '토지대장',
  '임야대장',
  '지적도',
  '임야도',
  '신규등록',
  '등록전환',
  '축척변경',
  '분할',
  '합병',
  '표제부',
  '갑구',
  '을구',
  '소유권',
  '지상권',
  '지역권',
  '전세권',
  '저당권',
  '권리질권',
  '채권담보권',
  '임차권',
]

const FREQUENT_TERMS = [
  '공유지연명부',
  '대지권등록부',
  '지적측량성과',
  '측량성과 검사',
  '등록사항정정',
  '관공서의 촉탁',
  '관공서 촉탁',
  '이해관계인의 승낙',
  '이해관계인',
  '직권등기',
  '부기등기',
  '주등기',
  '용익권',
  '적부심사',
  '영구 보존',
  '주된 용도',
  '제곱미터',
  '대지권',
  '공유자',
  '청산금',
  '직권정정',
  '등기 순위',
  '접수시점',
  '등기 효력',
  '수용',
  '이의절차',
  '상속',
  '판결',
  '지번',
  '지목',
  '면적',
]

const SKIP_SELECTOR = [
  'button',
  'a',
  'script',
  'style',
  'textarea',
  'input',
  'select',
  '.exam-number',
  '.registration-law-articles',
].join(',')

function findTermRanges(scope, terms, occupiedByNode) {
  const ranges = []
  const sortedTerms = [...terms].sort((a, b) => b.length - a.length)
  const walker = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const text = node.nodeValue || ''
      const parent = node.parentElement
      if (!text.trim() || !parent || parent.closest(SKIP_SELECTOR)) return NodeFilter.FILTER_REJECT
      return sortedTerms.some((term) => text.includes(term))
        ? NodeFilter.FILTER_ACCEPT
        : NodeFilter.FILTER_REJECT
    },
  })

  while (walker.nextNode()) {
    const node = walker.currentNode
    const text = node.nodeValue || ''
    const occupied = occupiedByNode.get(node) || []

    sortedTerms.forEach((term) => {
      let fromIndex = 0
      while (fromIndex < text.length) {
        const index = text.indexOf(term, fromIndex)
        if (index === -1) break
        const end = index + term.length
        const overlaps = occupied.some(([start, finish]) => index < finish && end > start)
        if (!overlaps) {
          const range = new Range()
          range.setStart(node, index)
          range.setEnd(node, end)
          ranges.push(range)
          occupied.push([index, end])
        }
        fromIndex = end
      }
    })

    occupiedByNode.set(node, occupied)
  }

  return ranges
}

function clearRegistrationHighlights() {
  if (typeof CSS === 'undefined' || !CSS.highlights) return
  CSS.highlights.delete('registration-exam-critical')
  CSS.highlights.delete('registration-exam-frequent')
}

function applyRegistrationHighlights() {
  if (typeof CSS === 'undefined' || !CSS.highlights || typeof Highlight === 'undefined') return

  const scope = document.querySelector('.registration-law-page .public-law-content')
  if (!scope) {
    clearRegistrationHighlights()
    return
  }

  const occupiedByNode = new WeakMap()
  const criticalRanges = findTermRanges(scope, CRITICAL_TERMS, occupiedByNode)
  const frequentRanges = findTermRanges(scope, FREQUENT_TERMS, occupiedByNode)

  CSS.highlights.set('registration-exam-critical', new Highlight(...criticalRanges))
  CSS.highlights.set('registration-exam-frequent', new Highlight(...frequentRanges))
}

let rafId = 0
function scheduleRegistrationHighlights() {
  cancelAnimationFrame(rafId)
  rafId = requestAnimationFrame(applyRegistrationHighlights)
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  window.addEventListener('DOMContentLoaded', scheduleRegistrationHighlights, { once: true })
  window.addEventListener('hashchange', scheduleRegistrationHighlights)

  const observer = new MutationObserver(scheduleRegistrationHighlights)
  const startObserver = () => {
    const root = document.getElementById('root')
    if (!root) return
    observer.observe(root, { childList: true, characterData: true, subtree: true })
    scheduleRegistrationHighlights()
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startObserver, { once: true })
  } else {
    startObserver()
  }
}
