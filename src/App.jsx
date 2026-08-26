import { useEffect, useMemo, useState } from 'react'
import { allSubjects, subjectGroups } from './data/subjects'
import PublicLawPage from './PublicLawPage'
import RegistrationLawPage from './RegistrationLawPage'
import './public-law.css'

function getRoute() {
  return window.location.hash.replace(/^#\/?/, '') || ''
}

function navigate(path = '') {
  window.location.hash = path ? `/${path}` : '/'
}

function SubjectCard({ subject }) {
  return (
    <button
      className={`subject-card${subject.featured ? ' subject-card--featured' : ''}`}
      type="button"
      onClick={() => navigate(subject.id)}
      aria-label={`${subject.title} 열기`}
    >
      <span className="subject-card__topline">
        <span className="subject-card__icon" aria-hidden="true">{subject.icon}</span>
        <span className={`status-pill${subject.featured ? ' status-pill--active' : ''}`}>{subject.status}</span>
      </span>
      <span className="subject-card__title">{subject.title}</span>
      <span className="subject-card__description">{subject.description}</span>
      <span className="subject-card__action">
        과목 열기 <span aria-hidden="true">→</span>
      </span>
    </button>
  )
}

function Dashboard() {
  return (
    <main className="dashboard" id="main-content">
      <section className="hero" aria-labelledby="dashboard-title">
        <div className="hero__copy">
          <span className="eyebrow">2026 · 제37회 공인중개사</span>
          <h1 id="dashboard-title">공인중개사 시험<br />핵심정리</h1>
          <p>
            과목별 핵심 개념, 비교표, 절차 인포그래픽, 함정 선지와 암기 포인트를
            하나의 학습 구조로 정리합니다.
          </p>
        </div>
        <div className="hero__summary" aria-label="학습 구성 요약">
          <div><strong>2</strong><span>시험 단계</span></div>
          <div><strong>6</strong><span>학습 영역</span></div>
          <div><strong>1</strong><span>통합 대시보드</span></div>
        </div>
      </section>

      <section className="study-guide" aria-label="학습 안내">
        <span className="study-guide__label">현재 구축 순서</span>
        <strong>메인 대시보드 → 부동산공법 → 부동산공시법 → 나머지 과목</strong>
        <span>부동산공법의 UI 규격을 유지하면서 공시법 목차와 첫 POINT부터 순차 공개합니다.</span>
      </section>

      {subjectGroups.map((group) => (
        <section className="subject-group" key={group.id} aria-labelledby={`${group.id}-title`}>
          <header className="section-heading">
            <div>
              <span className="section-heading__number">{group.id === 'first' ? '01' : '02'}</span>
              <h2 id={`${group.id}-title`}>{group.label}</h2>
            </div>
            <p>{group.description}</p>
          </header>
          <div className={`subject-grid subject-grid--${group.id}`}>
            {group.subjects.map((subject) => <SubjectCard key={subject.id} subject={subject} />)}
          </div>
        </section>
      ))}

      <section className="system-note">
        <div>
          <span className="system-note__kicker">학습 페이지 공통 규격</span>
          <h2>읽고, 비교하고, 절차로 기억하는 구조</h2>
        </div>
        <div className="system-note__items">
          <span>핵심 한줄</span><span>상세 이해</span><span>비교표</span><span>절차</span><span>함정</span><span>암기</span><span>확인문제</span>
        </div>
      </section>
    </main>
  )
}

function SubjectPlaceholder({ subject }) {
  return (
    <main className="subject-shell" id="main-content">
      <button className="back-button" type="button" onClick={() => navigate('')}>← 전체 과목</button>
      <section className="subject-hero">
        <span className="subject-hero__icon" aria-hidden="true">{subject.icon}</span>
        <div>
          <span className="eyebrow">{subject.shortTitle}</span>
          <h1>{subject.title}</h1>
          <p>{subject.description}</p>
        </div>
      </section>
      <section className="placeholder-card">
        <span>준비 중</span>
        <h2>과목별 학습 콘텐츠를 순차적으로 추가합니다.</h2>
        <p>
          최종 구조에서는 왼쪽에 과목 세부 목차가 표시되고, 선택한 장·절의 내용만 본문에 표시됩니다.
          핵심정리·비교표·절차 인포그래픽·함정 선지·암기·확인문제를 동일한 규격으로 제공합니다.
        </p>
      </section>
    </main>
  )
}

export default function App() {
  const [route, setRoute] = useState(getRoute)

  useEffect(() => {
    const onHashChange = () => setRoute(getRoute())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  const activeSubject = useMemo(
    () => allSubjects.find((subject) => subject.id === route),
    [route],
  )

  let content = <Dashboard />
  if (route === 'public-law') content = <PublicLawPage onBack={() => navigate('')} />
  else if (route === 'registration-law') content = <RegistrationLawPage onBack={() => navigate('')} />
  else if (activeSubject) content = <SubjectPlaceholder subject={activeSubject} />

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">본문으로 바로가기</a>
      <header className="site-header">
        <div className="topbar">
          <button className="brand" type="button" onClick={() => navigate('')} aria-label="공인중개사 핵심정리 홈">
            <span className="brand__mark">R</span>
            <span><strong>공인중개사</strong><small>EXAM NOTE</small></span>
          </button>
          <div className="topbar__meta">
            <span>2026 제37회</span>
            <span className="topbar__dot" aria-hidden="true" />
            <span>핵심정리</span>
          </div>
        </div>
        <nav className="subject-nav" aria-label="과목 바로가기">
          <button
            type="button"
            className={`subject-nav__item${route === '' ? ' active' : ''}`}
            onClick={() => navigate('')}
            aria-current={route === '' ? 'page' : undefined}
          >
            전체 과목
          </button>
          {allSubjects.map((subject) => (
            <button
              key={subject.id}
              type="button"
              className={`subject-nav__item${route === subject.id ? ' active' : ''}`}
              onClick={() => navigate(subject.id)}
              aria-current={route === subject.id ? 'page' : undefined}
              title={subject.title}
            >
              <span className="subject-nav__icon" aria-hidden="true">{subject.icon}</span>
              <span>{subject.shortTitle}</span>
            </button>
          ))}
        </nav>
      </header>
      {content}
      <footer className="footer">
        <span>공인중개사 시험 핵심정리</span>
        <span>과목별 현행 법령 기준일은 각 학습 페이지에 별도 표기합니다.</span>
      </footer>
    </div>
  )
}
