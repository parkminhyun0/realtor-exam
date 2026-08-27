const RATE_TOKEN_PATTERN = /(\d+(?:[.,]\d+)*(?:\s*(?:%|%p|억원|만원|원|개월|년|월|일))?|제\s*\d+\s*조(?:의\s*\d+)?)/g

function RateText({ children }) {
  if (typeof children !== 'string') return children
  return children.split(RATE_TOKEN_PATTERN).map((piece, index) => {
    if (!piece) return null
    return index % 2 === 1
      ? <strong className="tax-rate-token" key={`${piece}-${index}`}>{piece}</strong>
      : piece
  })
}

function RateLawButtons({ references = [], onOpenLaw }) {
  const items = references.flatMap((reference) => (
    (reference.articles || []).map((article) => ({ lawName: reference.lawName, article }))
  ))
  if (!items.length) return null

  return (
    <div className="tax-rate-guide__laws" aria-label="세율 근거 조문">
      <span>근거 조문</span>
      {items.map(({ lawName, article }) => (
        <button
          type="button"
          key={`${lawName}-${article}`}
          onClick={() => onOpenLaw(lawName, article)}
          title={`${lawName} ${article} 조문 보기`}
        >
          {lawName} {article}
        </button>
      ))}
    </div>
  )
}

export default function TaxRateGuide({ guide, onOpenLaw }) {
  if (!guide) return null

  return (
    <section className="study-block tax-rate-guide" aria-label={`${guide.title} 세율 요율 정리`}>
      <header className="tax-rate-guide__header">
        <span>{guide.badge}</span>
        <div>
          <h3>{guide.title}</h3>
          <p><RateText>{guide.intro}</RateText></p>
        </div>
      </header>

      <div className="tax-rate-guide__alert">
        <b>시험 계산 순서</b>
        <span>과세대상 판정 → 과세표준 확정 → 기본세율 → 중과·특례 → 부가세 → 최종세액</span>
      </div>

      <div className="tax-rate-guide__sections">
        {guide.sections.map((section) => (
          <article className="tax-rate-guide__section" key={section.title}>
            <h4>{section.title}</h4>
            <div className="table-wrap">
              <table className="study-table tax-rate-table">
                <thead>
                  <tr><th>구분</th><th>과세표준·요건 / 계산식</th><th>세율·요율</th><th>시험 포인트</th></tr>
                </thead>
                <tbody>
                  {section.rows.map(([label, basis, rate, exam]) => (
                    <tr key={`${section.title}-${label}`}>
                      <th><RateText>{label}</RateText></th>
                      <td><RateText>{basis}</RateText></td>
                      <td className="tax-rate-table__rate"><RateText>{rate}</RateText></td>
                      <td><RateText>{exam}</RateText></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        ))}
      </div>

      {guide.examples?.length > 0 && (
        <div className="tax-rate-guide__examples">
          <div className="tax-rate-guide__subhead"><span>CALC</span><strong>바로 계산해 보는 예시</strong></div>
          {guide.examples.map(([title, calculation, note]) => (
            <article key={title}>
              <b><RateText>{title}</RateText></b>
              <code><RateText>{calculation}</RateText></code>
              <p><RateText>{note}</RateText></p>
            </article>
          ))}
        </div>
      )}

      {guide.examTips?.length > 0 && (
        <div className="tax-rate-guide__tips">
          <strong>⚠️ 세율 함정 체크</strong>
          <ul>
            {guide.examTips.map((tip) => <li key={tip}><RateText>{tip}</RateText></li>)}
          </ul>
        </div>
      )}

      <footer className="tax-rate-guide__footer">
        <div>
          <b>현행성 기준</b>
          <span>{guide.sourceDate}</span>
        </div>
        <RateLawButtons references={guide.references} onOpenLaw={onOpenLaw} />
      </footer>
    </section>
  )
}
