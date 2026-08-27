import { useMemo, useState } from 'react'
import { EXAM36_QNET_URL, getExam36Questions } from './data/exam36TransformedQuestions'
import './exam36-question-section.css'

const SUBJECT_LABELS = {
  'real-estate-theory': '부동산학개론',
  'civil-law': '민법 및 민사특별법',
  'brokerage-law': '공인중개사법령 및 중개실무',
  'public-law': '부동산공법',
  'registration-law': '부동산공시법',
  'tax-law': '부동산세법',
}

function QuestionCard({ item, index }) {
  return (
    <article className="exam36-card">
      <header className="exam36-card__meta">
        <span className="exam36-card__number">변형 {String(index + 1).padStart(2, '0')}</span>
        <span className="exam36-card__source">원출제 제36회 {item.sourceNo}번 · PDF p.{item.sourcePage}</span>
        <span className="exam36-card__format">{item.format}</span>
      </header>
      <div className="exam36-card__topic">{item.topic}</div>
      <p className="exam36-card__prompt">{item.prompt}</p>
      <details className="exam36-card__answer">
        <summary>정답 · 해설 보기</summary>
        <div className="exam36-card__answer-body">
          <p><strong>정답</strong><span>{item.answer}</span></p>
          <p><strong>해설</strong><span>{item.explanation}</span></p>
        </div>
      </details>
      <footer className="exam36-card__footer">
        <span>{item.label}</span>
        <a href={EXAM36_QNET_URL} target="_blank" rel="noreferrer">Q-Net 원문 확인 ↗</a>
      </footer>
    </article>
  )
}

export default function Exam36QuestionSection({ subjectId }) {
  const questions = useMemo(() => getExam36Questions(subjectId), [subjectId])
  const [query, setQuery] = useState('')
  const [format, setFormat] = useState('전체')

  const formats = useMemo(
    () => ['전체', ...Array.from(new Set(questions.map((item) => item.format)))],
    [questions],
  )

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase()
    return questions.filter((item) => {
      const matchesFormat = format === '전체' || item.format === format
      const haystack = `${item.sourceNo} ${item.topic} ${item.prompt} ${item.explanation}`.toLowerCase()
      return matchesFormat && (!keyword || haystack.includes(keyword))
    })
  }, [questions, query, format])

  if (!questions.length) return null

  return (
    <section className="exam36-shell" id="exam36-question-bank" aria-labelledby="exam36-title">
      <div className="exam36-head">
        <div>
          <span className="exam36-eyebrow">2025 · 제36회 Q-Net 기출 기반</span>
          <h2 id="exam36-title">{SUBJECT_LABELS[subjectId] || '과목'} · 기출 변형문제</h2>
          <p>
            원문을 그대로 복제하지 않고 출제 논점은 유지한 채 문장·수치·사례·질문 방식을 학습용으로 재구성했습니다.
            법률 과목 해설은 현재 사이트의 현행 법령 학습 기준과 함께 확인하세요.
          </p>
        </div>
        <div className="exam36-count" aria-label="문항 수">
          <strong>{questions.length}</strong><span>문항</span>
        </div>
      </div>

      <div className="exam36-toolbar">
        <label>
          <span>검색</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="논점·키워드·원문 번호 검색"
          />
        </label>
        <div className="exam36-format-filter" aria-label="문제 유형 필터">
          {formats.map((item) => (
            <button
              key={item}
              type="button"
              className={format === item ? 'active' : ''}
              onClick={() => setFormat(item)}
            >
              {item}
            </button>
          ))}
        </div>
        <a className="exam36-qnet-link" href={EXAM36_QNET_URL} target="_blank" rel="noreferrer">제36회 Q-Net 원문 ↗</a>
      </div>

      <div className="exam36-result-line">
        <span>현재 표시 <strong>{filtered.length}</strong> / {questions.length}</span>
        <span>출처: {questions[0]?.sourceFile}</span>
      </div>

      <div className="exam36-grid">
        {filtered.map((item, index) => (
          <QuestionCard key={`${subjectId}-${item.sourceNo}`} item={item} index={index} />
        ))}
      </div>

      {!filtered.length && (
        <div className="exam36-empty">검색 조건과 일치하는 변형문제가 없습니다.</div>
      )}
    </section>
  )
}
