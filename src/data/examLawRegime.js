export const exam37LawRule = {
  title: '제37회 시험 적용법령 기준',
  examBasis: '2026년에 공포·개정된 법령은 정답 기준에서 제외하고 개정 전 규정을 적용합니다.',
  amendmentBasis: '2026년 개정법은 본문 정답값을 바꾸지 않고, 별도 비교 카드에서 개정 전·후 차이만 표시합니다.',
  scopeNote: '이 사이트에서 “올해 개정법”은 2026년에 공포·개정된 규정을 뜻합니다. 2025년에 공포되어 2026년에 시행된 규정은 자동으로 제외하지 않습니다.',
}

const official = (path) => `https://www.law.go.kr/${path}`

export const exam37LawDifferences = {
  all: {
    title: '전 과목 공통',
    summary: '본문은 제37회 시험용 개정 전 법령을 우선하고, 2026 개정법은 “개정법 비교”에서만 확인합니다.',
    changes: [],
  },
  'real-estate-theory': {
    title: '부동산학개론',
    summary: '경제·투자·금융·감정평가의 이론 자체는 법 개정 영향이 제한적이지만, 법령을 인용하는 감정평가·부동산투자 영역은 동일한 구분 원칙을 적용합니다.',
    changes: [
      {
        law: '감정평가 및 감정평가사에 관한 법률 시행규칙',
        amendment: '2026.2.27 일부개정',
        before: '시험 본문은 2026년 개정 전 손해배상능력 관련 기준을 유지합니다.',
        after: '감정평가법인등의 손해배상능력 기준에 보험 가입과 적정 감사보고서 또는 표준재무제표증명 등 요건을 구체화했습니다.',
        examImpact: '감정평가 3방식·가격제원칙 등 학개론 핵심 이론의 정답값은 바꾸지 않고, 제도 변경만 개정법 참고로 분리합니다.',
        source: official('LSW/lsSideInfoP.do?docCls=jo&joBrNo=03&joNo=0019&lsiSeq=284523&urlMode=lsScJoRltInfoR'),
      },
    ],
  },
  'civil-law': {
    title: '민법 및 민사특별법',
    summary: '민법의 공인중개사 시험범위인 권리변동·물권·계약과 민사특별법은 개정 전 규정을 정답 기준으로 유지합니다.',
    changes: [
      {
        law: '민법',
        amendment: '2026.3.17 일부개정',
        before: '종전 상속제도에는 2026년 개정의 상속권 상실 제도와 특별수익 예외가 반영되어 있지 않습니다.',
        after: '부양의무를 중대하게 위반한 상속인 등에 대한 상속권 상실 제도를 두고, 특별한 부양·재산 기여에 대한 보상 성격의 증여·유증을 특별수익에서 제외하는 규정을 보완했습니다.',
        examImpact: '이번 개정은 상속편 중심이므로 공인중개사 민법 핵심 시험범위에는 직접 영향이 없지만, 현행 민법과의 차이는 개정법 비교에만 남깁니다.',
        source: official('LSW/lsRvsRsnListP.do?lsId=001706'),
      },
    ],
  },
  'brokerage-law': {
    title: '공인중개사법령 및 중개실무',
    summary: '중개사법은 숫자·기관명 개정이 정답을 바로 바꿀 수 있으므로 2026년에 개정된 표현은 반드시 개정 전/후를 나눠 표시합니다.',
    changes: [
      {
        law: '공인중개사법 시행령',
        amendment: '2026.8.18 개정 · 2026.8.28 시행',
        before: '공인중개사협회',
        after: '한국공인중개사협회',
        examImpact: '제37회 본문·문제 정답은 개정 전 명칭인 “공인중개사협회”를 사용하고, “한국공인중개사협회”는 개정법 배지로만 표시합니다.',
        source: official('LSW/lsRvsDocListP.do?chrClsCd=010102&lsId=003673'),
      },
      {
        law: '공인중개사법 시행령 제28조',
        amendment: '2025.10.21 개정 · 2026.1.1 시행',
        before: '실무교육 28시간 이상 32시간 이하',
        after: '실무교육 45시간',
        examImpact: '이 변경은 2025년에 공포된 개정이므로 “2026년 공포·개정분 제외” 규칙의 대상이 아닙니다. 따라서 37회 본문에서는 45시간을 유지합니다.',
        source: official('lsInfoP.do?lsiSeq=279243&viewCls=lsRvsDocInfoR'),
      },
    ],
  },
  'public-law': {
    title: '부동산공법',
    summary: '2026년 주택법·농지법 개정처럼 절차·요건이 달라진 부분은 시험용 구법을 본문에 두고 신법은 비교 카드로 분리합니다.',
    changes: [
      {
        law: '주택법',
        amendment: '2026.2.3 일부개정 · 2026.8.4 시행',
        before: '사업계획승인 관련 통합심의는 종전의 도시계획·건축·교통 등을 중심으로 운영됩니다.',
        after: '통합 검토·심의 대상에 교육환경평가, 성능위주설계평가, 재해영향평가를 추가하고, 일정 현장점검 및 분양가상한제 예외도 보완했습니다.',
        examImpact: '제37회 본문에서는 2026 개정으로 추가된 통합심의 대상을 정답에 포함하지 않고, 개정 전 절차를 우선합니다.',
        source: official('LSW/lsRvsDocListP.do?chrClsCd=010102&lsId=001809'),
      },
      {
        law: '농지법',
        amendment: '2026.6.16 일부개정 · 2026.8.28 시행',
        before: '상속·이농 농지의 소유·임대와 처분명령은 종전 규정 체계를 따릅니다.',
        after: '직접 농업경영을 하지 않는 상속·이농 농지를 한국농어촌공사 등에 위탁·임대하도록 제도를 보완하고, 처분명령·일시사용허가·농업진흥구역 관련 규정도 정비했습니다.',
        examImpact: '제37회 농지법 문제는 개정 전 소유·임대·처분 체계를 사용하고, 2026.8.28 시행 내용은 비교로만 제공합니다.',
        source: official('LSW/lsRvsRsnListP.do?chrClsCd=010202&lsId=000479&lsRvsGubun=all'),
      },
    ],
  },
  'registration-law': {
    title: '부동산공시법',
    summary: '등기법·공간정보법은 올해 개정 여부와 실제 지적·등기 시험범위에 미친 영향을 구분합니다.',
    changes: [
      {
        law: '부동산등기법',
        amendment: '2026년 법률 개정 없음(확인 기준)',
        before: '법률 제20435호 · 2025.1.31 시행 규정',
        after: '동일',
        examImpact: '2026년 별도 법률 개정이 확인되지 않아 등기법 본문은 시험기준과 현행법 사이의 차이를 만들지 않습니다.',
        source: official('LSW/lsInfoP.do?lsId=001697'),
      },
      {
        law: '공간정보의 구축 및 관리 등에 관한 법률',
        amendment: '2026.3.5 타법개정 · 2026.7.1 시행',
        before: '종전 지방자치단체 체계에 따른 관련 표현을 사용합니다.',
        after: '통합특별시 신설 등 지방자치법 개정에 맞춘 기관·명칭 체계의 타법 정비가 반영됐습니다.',
        examImpact: '지적공부·토지이동·측량의 핵심 실체 규정과 직접 연결되지 않는 타법정비는 37회 정답값을 바꾸지 않고 개정법 참고로만 표시합니다.',
        source: official('LSW/lsRvsRsnListP.do?chrClsCd=010202&lsId=011113&lsRvsGubun=all'),
      },
    ],
  },
  'tax-law': {
    title: '부동산세법',
    summary: '세법은 연도별 특례가 많으므로 2026년에 개정된 세율·주택수·중과 규정은 시험용 개정 전 값과 반드시 병기합니다.',
    changes: [
      {
        law: '지방세법 시행령 제109조',
        amendment: '2026.5.29 일부개정 · 2026.6.1 시행',
        before: '2025년도 1세대 1주택 재산세 공정시장가액비율: 시가표준액 3억원 이하 43%, 3억원 초과 6억원 이하 44%, 6억원 초과 45%.',
        after: '같은 43%·44%·45% 특례를 2026년도 납세의무 성립분에 적용하도록 연도 규정을 갱신했습니다.',
        examImpact: '숫자는 동일하지만 적용연도가 바뀐 개정이므로 제37회 정답 기준은 개정 전 연도 규정으로 표시하고, 2026 적용 문구는 개정법 참고로 분리합니다.',
        source: official('LSW/lsSideInfoP.do?docCls=jo&joBrNo=00&joNo=0109&lsiSeq=286395&urlMode=lsScJoRltInfoR'),
      },
      {
        law: '종합부동산세법 시행령',
        amendment: '2026.2.27 일부개정',
        before: '종전 합산배제·주택 수 산정 규정을 적용합니다.',
        after: '인구감소지역 또는 인구감소관심지역의 일정 가액 이하 주택을 주택 수에서 제외하는 등 지방 주택 관련 특례와 합산배제 추징 규정을 보완했습니다.',
        examImpact: '2026년에 새로 확대된 주택 수 제외·합산배제 범위는 37회 본문 정답값에 넣지 않고 개정법 비교로만 표시합니다.',
        source: official('LSW/lsRvsRsnListP.do?chrClsCd=010102&lsId=009968'),
      },
      {
        law: '소득세법 시행령·시행규칙',
        amendment: '2026년 개정',
        before: '다주택자 양도소득세 중과 유예의 종전 적용 규정을 따릅니다.',
        after: '중과세율 적용 유예를 2026.5.9 종료하되, 2026.5.9까지 계약하고 일정 기간(4개월 또는 6개월) 안에 양도하는 경우의 경과규정을 두었습니다.',
        examImpact: '제37회 본문에서는 2026년에 변경된 중과 유예 종료·경과규정을 정답에 반영하지 않고 개정 전 규정을 우선합니다.',
        source: official('LSW/lsRvsRsnListP.do?chrClsCd=010202&lsId=007507&lsRvsGubun=all'),
      },
    ],
  },
}

export const exam37SubjectIds = [
  'real-estate-theory',
  'civil-law',
  'brokerage-law',
  'public-law',
  'registration-law',
  'tax-law',
]
