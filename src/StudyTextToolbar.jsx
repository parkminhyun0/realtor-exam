import { useEffect, useRef, useState } from 'react'

const FORMAT_ROOT_SELECTOR = '.public-law-content, .exam36-shell, .placeholder-card'
const BLOCKED_SELECTOR = 'button, input, select, textarea, summary, a, .study-text-toolbar'

function selectionInsideStudyContent(selection) {
  if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return false
  const node = selection.anchorNode?.nodeType === Node.TEXT_NODE ? selection.anchorNode.parentElement : selection.anchorNode
  const focus = selection.focusNode?.nodeType === Node.TEXT_NODE ? selection.focusNode.parentElement : selection.focusNode
  if (!(node instanceof Element) || !(focus instanceof Element)) return false
  const root = node.closest(FORMAT_ROOT_SELECTOR)
  return Boolean(root && root.contains(focus) && !node.closest(BLOCKED_SELECTOR) && !focus.closest(BLOCKED_SELECTOR))
}

function getTextSegments(range) {
  const common = range.commonAncestorContainer.nodeType === Node.TEXT_NODE
    ? range.commonAncestorContainer.parentElement
    : range.commonAncestorContainer
  if (!(common instanceof Element)) return []

  const walker = document.createTreeWalker(common, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (!node.nodeValue?.trim()) return NodeFilter.FILTER_REJECT
      const parent = node.parentElement
      if (!parent || parent.closest(BLOCKED_SELECTOR)) return NodeFilter.FILTER_REJECT
      try {
        return range.intersectsNode(node) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT
      } catch {
        return NodeFilter.FILTER_REJECT
      }
    },
  })

  const nodes = []
  while (walker.nextNode()) nodes.push(walker.currentNode)

  return nodes.map((node) => {
    const start = node === range.startContainer ? range.startOffset : 0
    const end = node === range.endContainer ? range.endOffset : node.nodeValue.length
    return { node, start, end }
  }).filter(({ start, end }) => end > start)
}

function wrapSegment(node, start, end, styleMap) {
  let selectedNode = node
  if (start > 0) selectedNode = selectedNode.splitText(start)
  const selectedLength = end - start
  if (selectedLength < selectedNode.nodeValue.length) selectedNode.splitText(selectedLength)

  let wrapper = selectedNode.parentElement
  if (!wrapper?.classList.contains('study-user-format')) {
    wrapper = document.createElement('span')
    wrapper.className = 'study-user-format'
    selectedNode.parentNode?.insertBefore(wrapper, selectedNode)
    wrapper.appendChild(selectedNode)
  }

  Object.entries(styleMap).forEach(([property, value]) => {
    wrapper.style.setProperty(property, value, 'important')
  })
  return wrapper
}

function applyStyleToRange(range, styleMap) {
  const segments = getTextSegments(range)
  if (!segments.length) return null

  const wrappers = []
  for (let index = segments.length - 1; index >= 0; index -= 1) {
    const { node, start, end } = segments[index]
    wrappers.unshift(wrapSegment(node, start, end, styleMap))
  }

  const firstText = wrappers[0]?.firstChild
  const lastText = wrappers.at(-1)?.lastChild
  if (!(firstText instanceof Text) || !(lastText instanceof Text)) return null

  const nextRange = document.createRange()
  nextRange.setStart(firstText, 0)
  nextRange.setEnd(lastText, lastText.nodeValue.length)
  const selection = window.getSelection()
  selection?.removeAllRanges()
  selection?.addRange(nextRange)
  return nextRange
}

export default function StudyTextToolbar({ active }) {
  const toolbarRef = useRef(null)
  const savedRangeRef = useRef(null)
  const [hasSelection, setHasSelection] = useState(false)
  const [selectedLength, setSelectedLength] = useState(0)
  const [textColor, setTextColor] = useState('#1f2937')
  const [backgroundColor, setBackgroundColor] = useState('#dbeafe')

  useEffect(() => {
    if (!active) return undefined

    const onSelectionChange = () => {
      const selection = window.getSelection()
      const activeElement = document.activeElement
      if (toolbarRef.current?.contains(activeElement)) return

      if (!selectionInsideStudyContent(selection)) {
        setHasSelection(false)
        setSelectedLength(0)
        return
      }

      savedRangeRef.current = selection.getRangeAt(0).cloneRange()
      setHasSelection(true)
      setSelectedLength(selection.toString().trim().length)
    }

    document.addEventListener('selectionchange', onSelectionChange)
    return () => document.removeEventListener('selectionchange', onSelectionChange)
  }, [active])

  if (!active) return null

  const apply = (styleMap) => {
    const range = savedRangeRef.current
    if (!range) return
    const nextRange = applyStyleToRange(range, styleMap)
    if (nextRange) savedRangeRef.current = nextRange.cloneRange()
  }

  const clear = () => apply({
    'font-weight': '400',
    'text-decoration': 'none',
    color: 'inherit',
    'background-color': 'transparent',
  })

  return (
    <div className="study-text-toolbar" ref={toolbarRef} aria-label="선택 텍스트 편집 도구">
      <div className="study-text-toolbar__inner">
        <div className="study-text-toolbar__status" aria-live="polite">
          <strong>텍스트 편집</strong>
          <span>{hasSelection ? `${selectedLength}자 선택됨` : '본문 텍스트를 드래그해 선택하세요'}</span>
        </div>

        <div className="study-text-toolbar__controls" aria-disabled={!hasSelection}>
          <label className="study-text-tool study-text-tool--color" title="텍스트 컬러">
            <span>A</span>
            <input type="color" value={textColor} disabled={!hasSelection} onChange={(event) => { setTextColor(event.target.value); apply({ color: event.target.value }) }} aria-label="텍스트 컬러" />
          </label>
          <button type="button" className="study-text-tool study-text-tool--bold" disabled={!hasSelection} onMouseDown={(event) => event.preventDefault()} onClick={() => apply({ 'font-weight': '700' })} title="볼드" aria-label="볼드">B</button>
          <button type="button" className="study-text-tool study-text-tool--underline" disabled={!hasSelection} onMouseDown={(event) => event.preventDefault()} onClick={() => apply({ 'text-decoration': 'underline' })} title="언더라인" aria-label="언더라인">U</button>
          <button type="button" className="study-text-tool study-text-tool--highlight" disabled={!hasSelection} onMouseDown={(event) => event.preventDefault()} onClick={() => apply({ 'background-color': '#fff2a8' })} title="하이라이트" aria-label="하이라이트">형광</button>
          <label className="study-text-tool study-text-tool--background" title="백그라운드 컬러">
            <span>BG</span>
            <input type="color" value={backgroundColor} disabled={!hasSelection} onChange={(event) => { setBackgroundColor(event.target.value); apply({ 'background-color': event.target.value }) }} aria-label="백그라운드 컬러" />
          </label>
          <button type="button" className="study-text-tool study-text-tool--clear" disabled={!hasSelection} onMouseDown={(event) => event.preventDefault()} onClick={clear} title="선택 텍스트 서식 지우기">서식 지우기</button>
        </div>
      </div>
    </div>
  )
}
