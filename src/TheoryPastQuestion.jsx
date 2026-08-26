import { realEstateTheoryPastQuestions } from './data/realEstateTheoryPastQuestions'
import './theory-past-question.css'

function findQuestions(cardTitle) {
  for (const chapter of Object.values(realEstateTheoryPastQuestions)) {
    if (chapter?.[cardTitle]?.length) return chapter[cardTitle]
  }
  return []
}

function HighlightQuestionNumbers({ children }) {
  if (typeof children !== 'string') return children
  const pattern = /(\d+(?:[.,]\d+)*(?:\s*(?:억|만원|원|%|㎡|km|명|년|회|배))?)/g
  return children.split(pattern).map((part, index) => (
    index % 2 === 1
      ? <span className="theory-exam-number" key={`${part}-${index}`}>{part}</span>
      : part
  ))
}

export default function TheoryPastQuestion({ cardTitle }) {
  const questions = findQuestions(cardTitle)
  if (!questions.length) return null

  return (
    <div className="theory-past-question-list" aria-label={`${cardTitle} 기출문제 적용`}>
      {questions.map((item) => (
        <article className="theory-past-question" key={`${item.year}-${item.number}-${item.title}`}>
          <header className="theory-past-question__head">
            <div>
              <span>기출문제</span>
              <strong>{item.year}년 제{item.round}회 · 부동산학개론 {item.number}번</strong>
            </div>
            <a href={item.officialUrl} target="_blank" rel="noreferrer">Q-Net 원문 ↗</a>
          </header>

          <div className="theory-past-question__body">
            <b>{item.title}</b>
            <p><HighlightQuestionNumbers>{item.prompt}</HighlightQuestionNumbers></p>

            {item.conditions?.length > 0 && (
              <ul className="theory-past-question__conditions">
                {item.conditions.map((condition) => (
                  <li key={condition}><HighlightQuestionNumbers>{condition}</HighlightQuestionNumbers></li>
                ))}
              </ul>
            )}

            {item.choices?.length > 0 && (
              <div className="theory-past-question__choices">
                {item.choices.map((choice) => <span key={choice}><HighlightQuestionNumbers>{choice}</HighlightQuestionNumbers></span>)}
              </div>
            )}
          </div>

          <details className="theory-past-answer">
            <summary>정답 · 공식 적용 풀이 보기</summary>
            <div className="theory-past-answer__content">
              <div className="theory-past-answer__result">
                <span>정답</span>
                <strong><HighlightQuestionNumbers>{item.answer}</HighlightQuestionNumbers></strong>
              </div>

              <div className="theory-past-answer__formula">
                <b>① 카드 공식 선택</b>
                <code><HighlightQuestionNumbers>{item.formula}</HighlightQuestionNumbers></code>
              </div>

              <div className="theory-past-answer__steps">
                <b>② 실제 값 대입</b>
                <ol>
                  {item.work.map((step) => <li key={step}><HighlightQuestionNumbers>{step}</HighlightQuestionNumbers></li>)}
                </ol>
              </div>

              <div className="theory-past-answer__calculator">
                <b>③ 계산기 입력</b>
                <code><HighlightQuestionNumbers>{item.calculator}</HighlightQuestionNumbers></code>
              </div>

              <div className="theory-past-answer__point">
                <b>④ 시험장에서 잡을 포인트</b>
                <p><HighlightQuestionNumbers>{item.point}</HighlightQuestionNumbers></p>
              </div>

              <small className="theory-past-question__source">{item.sourceNote}</small>
            </div>
          </details>
        </article>
      ))}
    </div>
  )
}
