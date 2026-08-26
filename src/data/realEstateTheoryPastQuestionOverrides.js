const q = (value) => ({
  ...value,
  sourceNote: `한국산업인력공단 Q-Net 공개 기출 · 제${value.round}회 부동산학개론 ${value.number}번 · 문장은 학습용으로 요약·재구성`,
})

export const realEstateTheoryPastQuestionOverrides = {
  '변이계수': [
    q({
      id:'cv34_21', year:2023, round:34, number:21,
      title:'변이계수와 투자위험 판별',
      prompt:'부동산투자 위험에 관한 지문 중 옳은 조합을 찾는 문제. 위험회피형 투자자가 변이계수가 작은 투자안을 선호하는지 판별한다.',
      answer:'ㄴ, ㄹ',
      formula:'변이계수 = 표준편차 ÷ 기대수익률',
      work:['표준편차가 작을수록 절대위험은 작다.','변이계수는 기대수익률 1단위당 위험이다.','위험회피형은 변이계수가 작은 투자안을 선호한다.'],
      calculator:'CV = σ ÷ E(R)',
      point:'기대수익률과 표준편차가 동시에 다를 때 상대위험은 변이계수로 비교한다.',
      officialUrl:'https://www.q-net.or.kr/cst003.do?artlSeq=5212459&boardId=Q004&gId=08&gSite=L&id=cst00302&menuType=cst00309',
      verifyUrl:'https://kimlovejoo.tistory.com/28',
    }),
  ],
  '거래사례비교법': [
    q({
      id:'sales33_39', year:2022, round:33, number:39,
      title:'거래사례비교법 비준가액 계산',
      prompt:'대상토지 150㎡. 거래사례는 200㎡·8억원이고 사정보정치 0.9, 주거지역 지가가 5% 상승, 지역요인은 동일, 대상토지는 사례보다 개별요인이 5% 열세이다. 상승식으로 비준가액을 구하라.',
      answer:'538,650,000원',
      formula:'비준가액 = 사례단가 × 사정보정 × 시점수정 × 지역요인 × 개별요인 × 대상면적',
      work:['사례단가=8억원÷200㎡=400만원/㎡','사정보정 0.9, 시점수정 1.05, 지역요인 1.00','대상이 사례보다 5% 열세 → 개별요인 0.95','400만원×0.9×1.05×1×0.95×150㎡=538,650,000원'],
      calculator:'800000000÷200×0.9×1.05×0.95×150 = 538650000',
      point:'비교법은 사례를 대상 기준으로 보정한 뒤 대상 면적을 곱한다. 열세는 0.95처럼 1보다 작은 비교치를 쓴다.',
      officialUrl:'https://www.q-net.or.kr/cst003.do?artlSeq=5211107&boardId=Q004&gId=08&gSite=L&id=cst00302&menuType=cst00309',
      verifyUrl:'https://puldapass.com/gongin/exam/33/rea/39',
    }),
  ],
}
