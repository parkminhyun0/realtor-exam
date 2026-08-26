export const subjectGroups = [
  {
    id: 'first',
    label: '1차 시험',
    description: '기초 이론과 민법의 핵심 구조를 정리합니다.',
    subjects: [
      {
        id: 'real-estate-theory',
        title: '부동산학개론',
        shortTitle: '학개론',
        icon: '◫',
        description: '총론 · 경제론 · 시장론 · 정책론 · 투자론 · 금융론 · 개발·관리·마케팅론 · 감정평가론',
        status: '공개',
      },
      {
        id: 'civil-law',
        title: '민법 및 민사특별법',
        shortTitle: '민법',
        icon: '§',
        description: '민법총칙 · 물권법 · 계약법 · 민사특별법을 시험 중심으로 정리합니다.',
        status: '준비 중',
      },
    ],
  },
  {
    id: 'second',
    label: '2차 시험',
    description: '법령과 실무 중심의 2차 과목을 체계적으로 정리합니다.',
    subjects: [
      {
        id: 'brokerage-law',
        title: '공인중개사법령 및 중개실무',
        shortTitle: '중개사법',
        icon: '⌂',
        description: '중개사법령 · 중개실무 · 거래신고제도를 핵심 조문과 절차 중심으로 정리합니다.',
        status: '준비 중',
      },
      {
        id: 'public-law',
        title: '부동산공법',
        shortTitle: '공법',
        icon: '▦',
        description: '국토계획법 · 도시개발법 · 도시정비법 · 건축법 · 주택법 · 농지법',
        status: '공개 시작',
        featured: true,
      },
      {
        id: 'registration-law',
        title: '부동산공시법',
        shortTitle: '공시법',
        icon: '▤',
        description: '공간정보법과 부동산등기법을 비교표·절차·기출 포인트 중심으로 정리합니다.',
        status: '공개 시작',
      },
      {
        id: 'tax-law',
        title: '부동산세법',
        shortTitle: '세법',
        icon: '₩',
        description: '취득 · 보유 · 양도 단계의 부동산 관련 세법을 한 흐름으로 정리합니다.',
        status: '준비 중',
      },
    ],
  },
]

export const allSubjects = subjectGroups.flatMap((group) => group.subjects)
