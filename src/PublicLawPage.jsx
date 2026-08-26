export default function PublicLawPage({ onBack }) {
  return (
    <main className="public-law-page public-law-page--embedded" id="main-content">
      <div className="public-law-topline">
        <button className="back-button" type="button" onClick={onBack}>← 전체 과목</button>
        <span>공인중개사 2차 · 부동산공법</span>
      </div>

      <section className="public-law-hero">
        <div>
          <span className="eyebrow">PUBLIC LAW · 2026</span>
          <h1>부동산공법 핵심정리</h1>
          <p>국토계획법 · 도시개발법 · 도시정비법 · 건축법 · 주택법 · 농지법을 메인 대시보드와 동일한 학습 UI에서 공부합니다.</p>
        </div>
        <div className="public-law-hero__badges" aria-label="부동산공법 학습 구성">
          <span>6개 법률</span>
          <span>선택한 절만 표시</span>
          <span>절차·비교·함정 중심</span>
        </div>
      </section>

      <section className="public-law-integrated-shell" aria-label="부동산공법 전체 학습 내용">
        <div className="public-law-integrated-shell__heading">
          <div>
            <span className="section-heading__number">01</span>
            <h2>부동산공법 전체 목차와 핵심정리</h2>
          </div>
          <p>메인과 동일한 네이비·골드·화이트 카드 디자인으로 통일했습니다.</p>
        </div>
        <iframe
          className="public-law-frame"
          src={`${import.meta.env.BASE_URL}public-law.html?embed=1`}
          title="부동산공법 전체 핵심정리"
          loading="eager"
        />
      </section>
    </main>
  )
}
