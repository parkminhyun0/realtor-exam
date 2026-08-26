// 짧은 제목을 만든다. "t7 1차 학개론·부동산시장의 기초"
export const SUBJ = {
  'civil-law': '민법', 'real-estate-theory': '학개론',
  'registration-law': '공시법', 'public-law': '공법', 'tax-law': '세법',
};
export const STAGE_LABEL = { impl: '1차', verify: '2차', review: '3차' };
export function shortTitle(taskId, stageKey, subject, unitTitle, retry) {
  const t = 't' + String(taskId).replace(/\D/g, '');
  const st = STAGE_LABEL[stageKey] || '?';
  const unit = String(unitTitle).replace(/^POINT\s*\d+\s*·\s*/, '').replace(/^제\d+절\s*/, '');
  const s = SUBJ[subject] || subject;
  return `${t} ${st}${retry ? `↩${retry}` : ''} ${s}·${unit}`;
}
