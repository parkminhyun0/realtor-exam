import { exam37LawDifferences, exam37LawRule } from './data/examLawRegime'
import './exam-law-regime.css'

function getStatusCopy(item) {
  if (item.status === 'comparison') {
    return {
      before: '37회 시험 적용 · 개정 전',
      after: '6월 이후 개정 · 비교 전용',
      badge: '제38회 대비',
    }
  }
  if (item.status === 'unchanged') {
    return {
      before: '37회 기준',
      after: '변경 없음',
      badge: '동일 규정',
    }
  }
  return {
    before: '개정 전',
    after: '37회 시험 적용 · 개정 후',
    badge: '5월 31일까지 적용',
  }
}

function DifferenceCard({ item }) {
  const status = getStatusCopy(item)
  return (
    <article className={`exam-law-diff-card is-${item.status || 'applied'}`}>
      <header>
        <div>
          <span className="exam-law-diff-card__law">{item.law}</span>
          <strong>{item.amendment}</strong>
          <small>{status.badge}</small>
        </div>
        <a href={item.source} target="_blank" rel="noreferrer">국가법령정보센터 ↗</a>
      </header>
      <div className="exam-law-diff-grid">
        <section className="exam-law-diff-grid__before">
          <span>{status.before}</span>
          <p>{item.before}</p>
        </section>
        <section className="exam-law-diff-grid__after">
          <span>{status.after}</span>
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
      data-exam-law-cutoff={exam37LawRule.cutoff}
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
          <span className="is-exam">시험 적용 · ~ 2026.5.31</span>
          <span className="is-amended">2026.6.1~ · 비교만</span>
        </div>
      </div>

      {!isAll && (
        <details className="exam-law-regime__details">
          <summary>
            <span>개정법 적용·차이 보기</span>
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
