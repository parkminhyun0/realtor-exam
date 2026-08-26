import { getPastQuestionsForCard } from './data/realEstateTheoryPastQuestions'
import { realEstateTheoryPastQuestionOverrides } from './data/realEstateTheoryPastQuestionOverrides'
import './theory-past-question.css'

function HighlightQuestionNumbers({ children }) {
  if (typeof children !== 'string') return children
  const pattern = /(\d+(?:[.,]\d+)*(?:\s*(?:억|만원|원|%|㎡|km|명|년|회|배|개월))?)/g
  return children.split(pattern).map((part, index) => (
    index % 2 === 1
      ? <span className="theory-exam-number" key={`${part}-${index}`}>{part}</span>
      : part
  ))
}

export default function TheoryPastQuestion({ cardTitle }) {
  const baseQuestions = getPastQuestionsForCard(cardTitle)
  const overrides = realEstateTheoryPastQuestionOverrides[cardTitle] || []
  const questions = overrides.length >= 2
    ? overrides.slice(0, 2)
    : overrides.length === 1
      ? [baseQuestions[0], overrides[0]].filter(Boolean)
      : baseQuestions

  if (!questions.length) return null

  return (
    <div className="theory-past-question-list" aria-label={`${cardTitle} 기출문제 적용`}>
      <div className="theory-past-question-list__title">
        <span>📚 기출 적용</span>
        <strong>{questions.length}문제</strong>
        <small>공식 선택 → 값 대입 → 계산기 입력</small>
      </div>

      {questions.map((item, questionIndex) => (
        <article className="theory-past-question" key={item.id || `${item.year}-${item.number}-${item.title}`}>
          <header className="theory-past-question__head">
            <div>
              <span>기출문제 {questionIndex + 1}</span>
              <strong>{item.year}년 제{item.round}회 · 부동산학개론 {item.number}번</strong>
            </div>
            <div className="theory-past-question__links">
              <a href={item.officialUrl} target="_blank" rel="noreferrer">공식/기출 확인 ↗</a>
              {item.verifyUrl && item.verifyUrl !== item.officialUrl && (
                <a href={item.verifyUrl} target="_blank" rel="noreferrer">해설 확인 ↗</a>
              )}
            </div>
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
