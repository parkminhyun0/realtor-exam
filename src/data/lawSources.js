const lawUrl = (slug) => `https://www.law.go.kr/법령/${slug}`

export const subjectLawSources = {
  'real-estate-theory': {
    title: '부동산학개론',
    shortTitle: '학개론',
    laws: [
      { name: '감정평가 및 감정평가사에 관한 법률', url: lawUrl('감정평가및감정평가사에관한법률') },
      { name: '부동산 가격공시에 관한 법률', url: lawUrl('부동산가격공시에관한법률') },
      { name: '부동산투자회사법', url: lawUrl('부동산투자회사법') },
    ],
  },
  'civil-law': {
    title: '민법 및 민사특별법',
    shortTitle: '민법',
    laws: [
      { name: '민법', url: lawUrl('민법') },
      { name: '주택임대차보호법', url: lawUrl('주택임대차보호법') },
      { name: '상가건물 임대차보호법', url: lawUrl('상가건물임대차보호법') },
      { name: '집합건물의 소유 및 관리에 관한 법률', url: lawUrl('집합건물의소유및관리에관한법률') },
      { name: '가등기담보 등에 관한 법률', url: lawUrl('가등기담보등에관한법률') },
    ],
  },
  'brokerage-law': {
    title: '공인중개사법령 및 중개실무',
    shortTitle: '중개사법',
    laws: [
      { name: '공인중개사법', url: lawUrl('공인중개사법') },
      { name: '공인중개사법 시행령', url: lawUrl('공인중개사법시행령') },
      { name: '공인중개사법 시행규칙', url: lawUrl('공인중개사법시행규칙') },
      { name: '부동산 거래신고 등에 관한 법률', url: lawUrl('부동산거래신고등에관한법률') },
    ],
  },
  'public-law': {
    title: '부동산공법',
    shortTitle: '공법',
    laws: [
      { name: '국토의 계획 및 이용에 관한 법률', url: lawUrl('국토의계획및이용에관한법률') },
      { name: '도시개발법', url: lawUrl('도시개발법') },
      { name: '도시 및 주거환경정비법', url: lawUrl('도시및주거환경정비법') },
      { name: '건축법', url: lawUrl('건축법') },
      { name: '주택법', url: lawUrl('주택법') },
      { name: '농지법', url: lawUrl('농지법') },
    ],
  },
  'registration-law': {
    title: '부동산공시법',
    shortTitle: '공시법',
    laws: [
      { name: '공간정보의 구축 및 관리 등에 관한 법률', url: lawUrl('공간정보의구축및관리등에관한법률') },
      { name: '부동산등기법', url: lawUrl('부동산등기법') },
    ],
  },
  'tax-law': {
    title: '부동산세법',
    shortTitle: '세법',
    laws: [
      { name: '지방세법', url: lawUrl('지방세법') },
      { name: '종합부동산세법', url: lawUrl('종합부동산세법') },
      { name: '소득세법', url: lawUrl('소득세법') },
      { name: '국세기본법', url: lawUrl('국세기본법') },
    ],
  },
}

export const subjectLawOrder = [
  'real-estate-theory',
  'civil-law',
  'brokerage-law',
  'public-law',
  'registration-law',
  'tax-law',
]
