import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { subjectLawOrder, subjectLawSources } from './data/lawSources'

export default function LawTextViewer({ open, onClose, activeSubjectId }) {
  const initialSubject = subjectLawSources[activeSubjectId] ? activeSubjectId : 'real-estate-theory'
  const [subjectId, setSubjectId] = useState(initialSubject)
  const [lawIndex, setLawIndex] = useState(0)

  useEffect(() => {
    if (!open) return
    const nextSubject = subjectLawSources[activeSubjectId] ? activeSubjectId : 'real-estate-theory'
    setSubjectId(nextSubject)
    setLawIndex(0)
  }, [open, activeSubjectId])

  useEffect(() => {
    if (!open) return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onClose])

  const subject = subjectLawSources[subjectId]
  const activeLaw = useMemo(() => subject?.laws?.[lawIndex] ?? subject?.laws?.[0], [subject, lawIndex])

  if (!open || !subject || !activeLaw) return null

  const changeSubject = (nextSubjectId) => {
    setSubjectId(nextSubjectId)
    setLawIndex(0)
  }

  const onBackdropClick = (event) => {
    if (event.target === event.currentTarget) onClose()
  }

  return createPortal(
    <div className="law-viewer-backdrop" onMouseDown={onBackdropClick} role="presentation">
      <section className="law-viewer" role="dialog" aria-modal="true" aria-labelledby="law-viewer-title">
        <header className="law-viewer__header">
          <div>
            <span className="law-viewer__eyebrow">국가법령정보센터 · 현행 법령</span>
            <h2 id="law-viewer-title">관련 법령 본문</h2>
          </div>
          <button className="law-viewer__close" type="button" onClick={onClose} aria-label="법령 본문 닫기">×</button>
        </header>

        <div className="law-viewer__subjects" role="tablist" aria-label="과목 선택">
          {subjectLawOrder.map((id) => {
            const item = subjectLawSources[id]
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={subjectId === id}
                className={`law-viewer__subject${subjectId === id ? ' is-active' : ''}`}
                onClick={() => changeSubject(id)}
              >
                {item.shortTitle}
              </button>
            )
          })}
        </div>

        <div className="law-viewer__workspace">
          <aside className="law-viewer__law-list" aria-label={`${subject.title} 관련 법령`}>
            <div className="law-viewer__law-list-title">{subject.title}</div>
            {subject.laws.map((law, index) => (
              <button
                key={law.name}
                type="button"
                className={`law-viewer__law-item${lawIndex === index ? ' is-active' : ''}`}
                onClick={() => setLawIndex(index)}
                aria-current={lawIndex === index ? 'true' : undefined}
              >
                <span>{law.name}</span>
                <span aria-hidden="true">›</span>
              </button>
            ))}
          </aside>

          <div className="law-viewer__content">
            <div className="law-viewer__content-bar">
              <div>
                <strong>{activeLaw.name}</strong>
                <span>법제처 국가법령정보센터 원문</span>
              </div>
              <a href={activeLaw.url} target="_blank" rel="noreferrer">새 창에서 열기 ↗</a>
            </div>
            <iframe
              className="law-viewer__frame"
              src={activeLaw.url}
              title={`${activeLaw.name} 법령 본문`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <p className="law-viewer__fallback">
              기기 또는 브라우저 보안정책으로 원문이 표시되지 않으면 ‘새 창에서 열기’를 이용해 주세요.
            </p>
          </div>
        </div>
      </section>
    </div>,
    document.body,
  )
}
