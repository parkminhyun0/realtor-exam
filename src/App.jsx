import { useEffect, useMemo, useState } from 'react'
import { allSubjects, subjectGroups } from './data/subjects'
import GlobalSearch from './GlobalSearch'
import CivilLawPage from './CivilLawPage'
import PublicLawPage from './PublicLawPage'
import RealEstateTheoryPage from './RealEstateTheoryPage'
import RegistrationLawPage from './RegistrationLawPageV2'
import TaxLawPage from './TaxLawPage'
import Exam36QuestionSection from './Exam36QuestionSection'
import StudyTextToolbar from './StudyTextToolbar'
import './public-law.css'
import './scroll-top.css'
import './global-search.css'

function getRoute() {
  return window.location.hash.replace(/^#\/?/, '') || ''
}

function navigate(path = '') {
  window.location.hash = path ? `/${path}` : '/'
}

function openSubject(subject) {
  navigate(subject.id)
}

function SubjectCard({ subject }) {
  const isPublished = subject.status.includes('공개')

  return (
    <button
      className={`subject-card${subject.featured ? ' subject-card--featured' : ''}`}
      type="button"
      onClick={() => openSubject(subject)}
      aria-label={`${subject.title} 열기`}
    >
      <span className="subject-card__topline">
        <span className="subject-card__icon" aria-hidden="true">{subject.icon}</span>
        <span className={`status-pill${isPublished ? ' status-pill--active' : ''}`}>{subject.status}</span>
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
        <strong>메인 대시보드 → 부동산공법 → 부동산공시법 → 부동산학개론 → 나머지 과목</strong>
        <span>모든 과목을 동일한 공통 헤더·카드·목차·본문 디자인 시스템으로 확장합니다.</span>
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
  const scrollToQuestions = () => {
    window.setTimeout(() => document.getElementById('exam36-question-bank')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0)
  }

  return (
    <main className="public-law-page subject-placeholder-page" id="main-content">
      <div className="public-law-topline">
        <button className="back-button" type="button" onClick={() => navigate('')}>← 전체 과목</button>
        <span>{subject.title}</span>
      </div>

      <section className="public-law-hero">
        <div>
          <span className="eyebrow">{subject.shortTitle} · 2026</span>
          <h1>{subject.title}</h1>
          <p>{subject.description}</p>
        </div>
        <div className="public-law-hero__badges">
          <span>공통 학습 UI</span><span>제36회 기출 변형 공개</span>
        </div>
      </section>

      <div className="public-law-layout">
        <aside className="public-law-nav" aria-label={`${subject.title} 목차`}>
          <div className="public-law-nav__title"><strong>{subject.shortTitle}</strong><span>카테고리 → 본문 → 기출</span></div>
          <details open>
            <summary><i /><span>학습 자료</span></summary>
            <ul>
              <li><button type="button" className="active"><span>과목 안내</span><small>본문</small></button></li>
              <li><button type="button" onClick={scrollToQuestions}><span>제36회 기출 변형</span><small>문제</small></button></li>
            </ul>
          </details>
        </aside>

        <article className="public-law-content">
          <div className="public-law-breadcrumb">{subject.title} <span>›</span> 과목 안내</div>
          <header className="study-section-heading">
            <div>
              <span className="study-section-heading__number">01</span>
              <div><span className="study-section-heading__chapter">{subject.shortTitle}</span><h2>과목별 학습 콘텐츠</h2></div>
            </div>
            <span className="law-reference">공통 UI 적용</span>
          </header>
          <section className="study-block placeholder-card">
            <div className="study-block__title"><span>01</span><h3>현재 제공 범위</h3></div>
            <p>정규 본문은 순차적으로 구축하고 있으며, 아래에서 제36회 Q-Net 기출 논점을 재구성한 학습용 변형문제를 먼저 확인할 수 있습니다.</p>
          </section>
        </article>
      </div>
    </main>
  )
}

export default function App() {
  const [route, setRoute] = useState(getRoute)
  const [showScrollTop, setShowScrollTop] = useState(false)

  useEffect(() => {
    const onHashChange = () => setRoute(getRoute())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 420)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const mobileViewport = window.matchMedia('(max-width: 980px)')

    const onMobileTocClick = (event) => {
      if (!mobileViewport.matches || !(event.target instanceof Element)) return

      const tocButton = event.target.closest('.public-law-nav li button, [data-mobile-toc] button')
      if (!tocButton) return

      const layout = tocButton.closest('.public-law-layout, [data-mobile-toc-layout]')
      if (!layout) return

      window.setTimeout(() => {
        const contentTarget = layout.querySelector('.public-law-content, [data-mobile-toc-content]')
        if (!contentTarget) return

        const header = document.querySelector('.site-header')
        const headerHeight = header?.getBoundingClientRect().height ?? 0
        const targetTop = window.scrollY + contentTarget.getBoundingClientRect().top - headerHeight - 12
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

        window.scrollTo({
          top: Math.max(0, targetTop),
          behavior: reduceMotion ? 'auto' : 'smooth',
        })
      }, 0)
    }

    document.addEventListener('click', onMobileTocClick)
    return () => document.removeEventListener('click', onMobileTocClick)
  }, [])

  const activeSubject = useMemo(
    () => allSubjects.find((subject) => subject.id === route),
    [route],
  )

  const scrollToTop = () => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' })
  }

  let content = <Dashboard />
  if (route === 'real-estate-theory') content = <RealEstateTheoryPage onBack={() => navigate('')} />
  else if (route === 'civil-law') content = <CivilLawPage onBack={() => navigate('')} />
  else if (route === 'public-law') content = <PublicLawPage onBack={() => navigate('')} />
  else if (route === 'registration-law') content = <RegistrationLawPage onBack={() => navigate('')} />
  else if (route === 'tax-law') content = <TaxLawPage onBack={() => navigate('')} />
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
          <GlobalSearch onNavigate={navigate} />
          <div className="topbar__meta">
            <span>2026 제37회</span>
            <span className="topbar__dot" aria-hidden="true" />
            <span>핵심정리</span>
          </div>
        </div>
        <nav className="subject-nav" aria-label="과목 바로가기">
          <button type="button" className={`subject-nav__item${route === '' ? ' active' : ''}`} onClick={() => navigate('')} aria-current={route === '' ? 'page' : undefined}>전체 과목</button>
          {allSubjects.map((subject) => (
            <button key={subject.id} type="button" className={`subject-nav__item${route === subject.id ? ' active' : ''}`} onClick={() => openSubject(subject)} aria-current={route === subject.id ? 'page' : undefined} title={subject.title}>
              <span className="subject-nav__icon" aria-hidden="true">{subject.icon}</span><span>{subject.shortTitle}</span>
            </button>
          ))}
        </nav>
        <StudyTextToolbar active={Boolean(route)} />
      </header>
      {content}
      <Exam36QuestionSection subjectId={route} />
      <button className={`scroll-top-button${showScrollTop ? ' visible' : ''}`} type="button" onClick={scrollToTop} aria-label="맨 위로 이동" title="맨 위로">
        <span className="scroll-top-button__icon" aria-hidden="true">↑</span>
      </button>
      <footer className="footer">
        <span>공인중개사 시험 핵심정리</span>
        <span>과목별 현행 법령 기준일은 각 학습 페이지에 별도 표기합니다.</span>
      </footer>
    </div>
  )
}
