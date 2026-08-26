export default function PublicLawPage({ onBack }) {
  const source = `${import.meta.env.BASE_URL}public-law.html`

  return (
    <main className="public-law-frame-page" id="main-content">
      <div className="public-law-frame-toolbar">
        <button className="back-button" type="button" onClick={onBack}>← 전체 과목</button>
        <div>
          <strong>부동산공법 핵심정리</strong>
          <span>국토계획법 · 도시개발법 · 도시정비법 · 건축법 · 주택법 · 농지법</span>
        </div>
      </div>
      <iframe
        className="public-law-frame"
        src={source}
        title="부동산공법 전체 핵심정리"
      />
    </main>
  )
}
