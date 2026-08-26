#!/usr/bin/env node
/* 큐를 스스로 고친다. 감시견이 매 주기 부른다.
 *
 * ── 왜 있나 ──────────────────────────────────────────────────────
 * 감독관 모델이 jobs.tsv 에 줄을 넣을 때 **문자열 '\t' 를 진짜 탭 대신** 쓴 적이
 * 여러 번 있다. 그러면 그 줄은 네 칸이 아니라 한 칸이 되어 디스패처가 통째로
 * 버린다. 큐에는 남아 있으니 겉보기엔 일이 있는데 아무도 집지 않고, 패널 열이
 * 그대로 논다. 2026-08-25 에 감사 8건이 그렇게 죽어 있었다.
 * 지시문으로 "진짜 탭을 써라" 라고 적어 두었지만 지켜지지 않는다. 코드가 고친다.
 *
 * 고치는 것:
 *   1. 문자열 \t → 진짜 탭
 *   2. 같은 산출물을 가리키는 중복 줄 (뒤엣것을 버린다)
 *   3. 로스터에 없는 모델 → 로스터 첫 모델로
 *   4. 프롬프트 파일이 없는 줄 → 표시만 하고 남긴다(지우면 왜 없는지 모른다)
 */
'use strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const D = path.join(ROOT, '.pipeline/dispatch');
const JOBS = path.join(D, 'jobs.tsv');
if (!fs.existsSync(JOBS)) process.exit(0);

const roster = fs.readFileSync(path.join(D, 'roster.tsv'), 'utf8')
  .split('\n').filter(Boolean).map((l) => l.split('\t')[0]);
const raw = fs.readFileSync(JOBS, 'utf8').split('\n').filter((l) => l.trim());

const fixes = [];
const seen = new Set();
const out = [];
for (const line of raw) {
  let l = line;
  if (!l.includes('\t') && l.includes('\\t')) { l = l.replace(/\\t/g, '\t'); fixes.push('탭'); }
  const f = l.split('\t');
  if (f.length !== 4) { fixes.push(`칸수(${f.length})`); out.push(l); continue; }
  if (seen.has(f[3])) { fixes.push('중복'); continue; }
  seen.add(f[3]);
  if (!roster.includes(f[0])) { fixes.push(`로스터밖(${f[0]})`); f[0] = roster[0]; }
  out.push(f.join('\t'));
}
const changed = out.join('\n') !== raw.join('\n');
if (changed) fs.writeFileSync(JOBS, `${out.join('\n')}\n`);

/* 프롬프트가 없는 작업을 **고친다**. 앞 판본은 찾아서 로그에 적기만 했다.
   그래서 같은 경고가 4시간 50분 동안 376번 반복되는 동안 열 패널 중 아홉이
   놀았다. 찾아내는 것과 고치는 것은 다른 일이다.

   두 갈래로 나눈다.
     · 이미 끝난 단계의 남은 줄 → 지운다. 예: 제안이 12/12 인 셰이드에 다섯
       번째 모델 제안이 등록돼 있었다(로스터가 4인데 5로 등록된 흔적).
       그 프롬프트는 애초에 만들어진 적이 없다.
     · 아직 필요한 단계 → 앞 배치의 틀에서 프롬프트를 만들어 준다. */
const rosterSize = roster.length;
const dropped = [];
const generated = [];
const kept2 = [];
for (const l of out) {
  const f = l.split('\t');
  if (f.length !== 4 || fs.existsSync(path.join(ROOT, f[2]))) { kept2.push(l); continue; }
  const outPath = f[3];
  const mProp = /\.pipeline\/(task\d+)\/proposals\/([A-Z]+)-/.exec(outPath);
  if (mProp) {
    const dir = path.join(ROOT, '.pipeline', mProp[1], 'proposals');
    const have = fs.existsSync(dir)
      ? fs.readdirSync(dir).filter((x) => x.startsWith(`${mProp[2]}-`)).length : 0;
    if (have >= rosterSize) { dropped.push(f[1]); continue; }
  }
  // 재감사·감사는 앞 배치의 같은 이름 프롬프트를 틀로 쓴다.
  const mT = /\.pipeline\/(task(\d+))\/prompts\/([\w.-]+)\.txt$/.exec(f[2]);
  if (mT) {
    const [, task, noStr, name] = mT;
    let tpl = null;
    for (let i = Number(noStr) - 1; i >= 6 && !tpl; i--) {
      const cand = path.join(ROOT, '.pipeline', `task${i}`, 'prompts', `${name}.txt`);
      if (fs.existsSync(cand) && fs.statSync(cand).size > 50) tpl = { p: cand, task: `task${i}` };
    }
    if (tpl) {
      const body = fs.readFileSync(tpl.p, 'utf8').split(tpl.task).join(task);
      fs.mkdirSync(path.dirname(path.join(ROOT, f[2])), { recursive: true });
      fs.writeFileSync(path.join(ROOT, f[2]), body);
      generated.push(f[1]);
    }
  }
  kept2.push(l);
}
if (dropped.length || generated.length) {
  fs.writeFileSync(JOBS, `${kept2.join('\n')}\n`);
  if (dropped.length) console.log(`끝난 단계의 남은 줄 ${dropped.length}건 제거: ${dropped.slice(0, 3).join(', ')}`);
  if (generated.length) console.log(`프롬프트 생성 ${generated.length}건: ${generated.slice(0, 3).join(', ')}`);
}
out.length = 0; out.push(...kept2);

const missing = out.map((l) => l.split('\t'))
  .filter((f) => f.length === 4 && !fs.existsSync(path.join(ROOT, f[2])))
  .map((f) => f[1]);

/* inflight.tsv 압축 — 산출물마다 마지막 행만 남기고, 이미 끝난 것은 버린다.
   덧붙이기만 하는 기록부라 두면 계속 커지고, 공급원 한도 계산을 왜곡한다. */
const IN = path.join(D, 'inflight.tsv');
if (fs.existsSync(IN)) {
  const rows = fs.readFileSync(IN, 'utf8').split('\n').filter((l) => l.trim());
  const last = new Map();
  for (const l of rows) { const f = l.split('\t'); if (f.length >= 3) last.set(f[0], l); }
  const kept = [...last.values()].filter((l) => !fs.existsSync(path.join(ROOT, l.split('\t')[0])));
  if (kept.length !== rows.length) {
    fs.writeFileSync(IN, kept.length ? `${kept.join('\n')}\n` : '');
    console.log(`인플라이트 압축 ${rows.length} → ${kept.length}줄`);
  }
}

if (fixes.length || missing.length) {
  const c = {};
  for (const f of fixes) c[f] = (c[f] || 0) + 1;
  console.log(`큐 수리 ${JSON.stringify(c)}${missing.length ? ` · 프롬프트 없음 ${missing.length}건: ${missing.slice(0, 3).join(', ')}` : ''}`);
}
