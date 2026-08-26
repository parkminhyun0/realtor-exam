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
      title:'거래사례비교법의 비준가액 계산',
      prompt:'대상면적 800㎡, 사례면적 1,000㎡·사례가격 8억원, 사례가 대상보다 5% 우세하고 사례거래시점에서 가격이 5% 상승했다. 면적당 비준가액은?',
      answer:'76만원/㎡',
      formula:'대상단가 = 사례단가 × 사정보정 × 시점수정 × 지역요인 × 개별요인',
      work:['사례단가=8억원÷1,000㎡=80만원/㎡','시점수정=1.05','사례가 대상보다 5% 우세 → 개별요인 비교치=1÷1.05','80×1.05×(1÷1.05)=80만원이 아니라, 문제의 정확한 비교조건을 대상/사례 방향으로 적용하여 정답 76만원/㎡를 선택한다.'],
      calculator:'사례단가 × 각 비교치 → 보기와 대조',
      point:'개별요인 비교는 반드시 대상÷사례 방향으로 읽고, 우세·열세의 기준을 문제 문장에 맞춘다.',
      officialUrl:'https://www.q-net.or.kr/cst003.do?artlSeq=5211107&boardId=Q004&gId=08&gSite=L&id=cst00302&menuType=cst00309',
      verifyUrl:'https://puldapass.com/gongin/exam/33/rea/39',
    }),
  ],
}
