import { exam37LawDifferences, exam37LawRule } from './data/examLawRegime'
import './exam-law-regime.css'

function DifferenceCard({ item }) {
  return (
    <article className="exam-law-diff-card">
      <header>
        <div>
          <span className="exam-law-diff-card__law">{item.law}</span>
          <strong>{item.amendment}</strong>
        </div>
        <a href={item.source} target="_blank" rel="noreferrer">국가법령정보센터 ↗</a>
      </header>
      <div className="exam-law-diff-grid">
        <section className="exam-law-diff-grid__before">
          <span>37회 시험 적용 · 개정 전</span>
          <p>{item.before}</p>
        </section>
        <section className="exam-law-diff-grid__after">
          <span>2026 개정법 · 비교 전용</span>
          <p>{item.after}</p>
        </section>
      </div>
      <div className="exam-law-diff-card__impact">
        <b>시험 처리</b>
        <p>{item.examImpact}</p>
      </div>
    </article>
  )
}

export default function ExamLawRegimeNotice({ subjectId = 'all' }) {
  const subject = exam37LawDifferences[subjectId] || exam37LawDifferences.all
  const isAll = subjectId === 'all'

  return (
    <section
      className={`exam-law-regime${isAll ? ' exam-law-regime--dashboard' : ''}`}
      data-exam-law-regime="37"
      data-subject-id={subjectId}
      aria-label="제37회 시험 적용법령 학습 기준 안내"
    >
      <div className="exam-law-regime__main">
        <div className="exam-law-regime__icon" aria-hidden="true">37</div>
        <div className="exam-law-regime__copy">
          <span className="exam-law-regime__kicker">SITE STUDY RULE · {subject.title}</span>
          <h2>{exam37LawRule.title}</h2>
          <p><strong>{exam37LawRule.examBasis}</strong> {exam37LawRule.amendmentBasis}</p>
          <small><b>웹페이지 학습 운영기준:</b> {exam37LawRule.scopeNote}</small>
        </div>
        <div className="exam-law-regime__badges" aria-label="법령 적용 구분">
          <span className="is-exam">시험 정답 · 개정 전</span>
          <span className="is-amended">2026 개정 · 비교만</span>
        </div>
      </div>

      {!isAll && (
        <details className="exam-law-regime__details">
          <summary>
            <span>2026 개정법 차이 보기</span>
            <small>{subject.changes.length}개 확인 항목 · {subject.summary}</small>
          </summary>
          <div className="exam-law-regime__differences">
            {subject.changes.map((item) => (
              <DifferenceCard item={item} key={`${item.law}-${item.amendment}`} />
            ))}
          </div>
        </details>
      )}
    </section>
  )
}
