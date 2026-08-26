#!/usr/bin/env node
// 파이프라인이 흔들리거나 멈췄는지 한 번에 본다.
//
// 0-lead 가 세부 작업에서 손을 뗀 뒤 구조만 감시할 때 쓴다.
// 판단하지 않고 사실만 보고한다. 이상이면 exit 1.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const D = path.join(ROOT, '.pipeline/dispatch');
const alerts = [];
const ok = [];

// --- 상주 프로세스 ---------------------------------------------------------
const procs = [
  ['디스패처', 'dispatcher.sh'],
  ['진행 감독관', 'supervisor-loop'],
  ['공급 감독관', 'supply-loop'],
  ['0-lead 대행', 'lead-relay-loop'],
  ['단계 전환', 'advance-loop'],
];
for (const [name, pat] of procs) {
  let alive = false;
  try { alive = execSync(`pgrep -f "${pat}" | head -1`, { encoding: 'utf8' }).trim().length > 0; } catch { alive = false; }
  (alive ? ok : alerts).push(alive ? `${name} 가동` : `**${name} 죽음** — 패널이 곧 멈춘다`);
}

// --- 큐 --------------------------------------------------------------------
const jobsPath = path.join(D, 'jobs.tsv');
let pending = 0;
let total = 0;
if (fs.existsSync(jobsPath)) {
  const lines = fs.readFileSync(jobsPath, 'utf8').split('\n').filter(Boolean);
  total = lines.length;
  pending = lines.filter((l) => !fs.existsSync(path.join(ROOT, l.split('\t')[3] || ''))).length;
  if (pending === 0) alerts.push('**큐 고갈** — 공급 감독관이 새 배치를 열지 못하고 있다');
  else if (pending < 10) alerts.push(`큐 부족 ${pending}건 — 작업자 10개보다 적다`);
  else ok.push(`큐 ${pending}건 대기 (전체 ${total})`);
} else {
  alerts.push('**jobs.tsv 없음**');
}

// --- 중복 배정 -------------------------------------------------------------
const statePath = path.join(D, 'inflight.tsv');
if (fs.existsSync(statePath)) {
  const rows = fs.readFileSync(statePath, 'utf8').split('\n').filter(Boolean).map((l) => l.split('\t'));
  const recent = rows.filter((r) => Date.now() / 1000 - Number(r[1]) < 900);
  const bySurface = new Map();
  for (const [out, , surf] of recent) {
    if (!bySurface.has(out)) bySurface.set(out, new Set());
    bySurface.get(out).add(surf);
  }
  const dup = [...bySurface.entries()].filter(([out, s]) => s.size > 1 && !fs.existsSync(path.join(ROOT, out)));
  if (dup.length) alerts.push(`**중복 배정 ${dup.length}건** — 같은 일을 여러 패널이 한다. RETRY_AFTER 를 확인하라`);
  else ok.push('중복 배정 없음');
}


// --- 프롬프트↔산출물 짝 ------------------------------------------------------
// 감독관이 프롬프트 틀을 복사하면서 슬러그를 안 바꾼 적이 있다. 그러면 세 판정자가
// 한 파일에 덮어써 독립 판정 3인이 1인으로 무너지고, 각자의 기대 산출물은 영영
// 생기지 않아 무한 재배정된다. 조용히 지나가므로 여기서 잡는다.
if (fs.existsSync(jobsPath)) {
  const bad = [];
  for (const l of fs.readFileSync(jobsPath, 'utf8').split('\n').filter(Boolean)) {
    const [, label, prompt, out] = l.split('\t');
    const pf = path.join(ROOT, prompt || '');
    if (!out || !fs.existsSync(pf)) continue;
    const base = path.basename(out);
    const body = fs.readFileSync(pf, 'utf8');
    // 프롬프트가 제 산출물을 한 번도 안 가리키면 짝이 틀린 것이다.
    if (!body.includes(base)) bad.push(`${label} → ${base}`);
  }
  if (bad.length) alerts.push(`**프롬프트↔산출물 불일치 ${bad.length}건** — 판정자들이 한 파일에 덮어쓴다: ${bad.join(' / ')}`);
  else ok.push('프롬프트↔산출물 짝 정상');
}


// --- 반쪽 배치 --------------------------------------------------------------
// 입력 셰이드는 있는데 프롬프트가 하나도 없는 배치. 후보를 가져가 놓고 일은
// 하지 않으므로, 쌓이면 정작 쓸 배치가 열리지 않는다. 다섯 개가 그렇게 쌓여
// batch 11 이 "남은 후보 없음" 으로 막혔다. 조용히 지나가므로 여기서 잡는다.
{
  const pipe = path.join(ROOT, '.pipeline');
  const half = fs.readdirSync(pipe).filter((d) => /^task\d+$/.test(d)).filter((d) => {
    const inp = path.join(pipe, d, 'input');
    const pr = path.join(pipe, d, 'prompts');
    if (!fs.existsSync(inp)) return false;
    const shards = fs.readdirSync(inp).filter((f) => /^shard-[A-Z]+\.json$/.test(f));
    if (!shards.length) return false;
    return !fs.existsSync(pr) || fs.readdirSync(pr).length === 0;
  });
  if (half.length) alerts.push(`**반쪽 배치 ${half.length}개** — 입력만 있고 프롬프트가 없다. 후보를 묶어 둬 새 배치가 안 열린다: ${half.join(' ')}`);
  else ok.push('반쪽 배치 없음');
}


// --- 빈 감사 --------------------------------------------------------------
// 지적 0건은 "흠 없음" 일 수도, 실행이 끊긴 것일 수도 있어 기계적으로 가릴 수
// 없다. 그래서 지우지 않고 눈에 띄게만 한다. 같은 배치의 다른 감사가 지적을
// 냈는데 혼자 0건이면 다시 돌려볼 값어치가 있다.
{
  const pipe = path.join(ROOT, '.pipeline');
  const lonely = [];
  for (const t of fs.readdirSync(pipe).filter((d) => /^task\d+$/.test(d))) {
    // 이미 PR 로 나간 배치는 지금 고칠 수 없다. 아직 안 나간 것만 본다.
    const batchNo = String(Number(t.slice(4)) - 4).padStart(2, '0');
    if (fs.existsSync(path.join(ROOT, `src/data/koreanGlossTopBatch${batchNo}.js`))) continue;
    const ad = path.join(pipe, t, 'audits');
    if (!fs.existsSync(ad)) continue;
    const files = fs.readdirSync(ad).filter((f) => /^audit-\d+\.json$|^audit-[a-z0-9]+\.json$/.test(f));
    const counts = files.map((f) => {
      try {
        const j = JSON.parse(fs.readFileSync(path.join(ad, f), 'utf8'));
        return { f, n: (Array.isArray(j) ? j : j.findings || j.issues || []).length };
      } catch { return { f, n: -1 }; }
    });
    const found = counts.filter((c) => c.n > 0);
    if (found.length) for (const c of counts.filter((c) => c.n === 0)) lonely.push(`${t}/${c.f}`);
  }
  if (lonely.length) alerts.push(`빈 감사 ${lonely.length}건 — 다른 감사는 지적을 냈는데 이것만 0건이다. 끊긴 실행일 수 있다: ${lonely.join(' ')}`);
  else ok.push('빈 감사 없음');
}


// --- 보류한 작업 ------------------------------------------------------------
// 순서를 지키려고 큐에서 잠시 빼 둔 일(예: 감사가 덜 끝났는데 먼저 도는 재감사).
// 다시 넣는 것을 잊으면 그 배치가 **아무 경보 없이** 영영 멈춘다. 재감사가
// 없으면 0-lead 대행도 발동하지 않는다. 조용한 정지가 가장 나쁘다.
{
  const held = path.join(D, 'jobs.held.tsv');
  if (fs.existsSync(held)) {
    const rows = fs.readFileSync(held, 'utf8').split('\n').filter(Boolean);
    if (rows.length) {
      const titles = rows.map((l) => l.split('\t')[1]).join(' / ');
      const age = Math.round((Date.now() - fs.statSync(held).mtimeMs) / 60000);
      alerts.push(`**보류 작업 ${rows.length}건 (${age}분째)** — 조건이 갖춰지면 jobs.tsv 에 다시 넣어야 한다. 잊으면 그 배치가 조용히 멈춘다: ${titles}`);
    } else ok.push('보류 작업 없음');
  } else ok.push('보류 작업 없음');
}


// --- 작업트리 오염 -----------------------------------------------------------
// 0-lead 대행은 이 경로가 더러우면 PR 을 만들지 않고 멈춘다(그게 옳다 —
// 남의 변경 위에서 브랜치를 따면 그것이 PR 에 실린다). 다만 멈춘 이유가
// 보이지 않으면 "대행이 왜 아무것도 안 하지" 로 남는다. 여기서 드러낸다.
{
  let dirty = '';
  try {
    dirty = execSync('git status --short -- bible-mindmap/src bible-mindmap/package.json bible-mindmap/package-lock.json',
      { cwd: path.resolve(ROOT, '..'), encoding: 'utf8' }).trim();
    // glossFrequency.json 은 배치를 열 때마다 스크립트가 덮어쓰는 임시 재생성물이다.
    // 대행이 파일을 콕 집어 add 하므로 PR 에 실리지 않는다. 경보로 두면 늑대소년이 된다.
    dirty = dirty.split('\n').filter((l) => l && !l.includes('glossFrequency.json')).join('\n');
  } catch { /* git 이 없으면 건너뛴다 */ }
  if (dirty) {
    const files = dirty.split('\n').map((l) => l.slice(3).split('/').pop()).join(' ');
    alerts.push(`**작업트리 오염 ${dirty.split('\n').length}건** — 0-lead 대행이 PR 을 만들지 못한다. 정리해야 파이프라인 끝이 열린다: ${files}`);
  } else ok.push('작업트리 깨끗함 — 대행이 PR 을 만들 수 있다');
}


// --- 작업 줄 형식 -------------------------------------------------------------
// 감독관이 탭 대신 문자열 \t 를 쓰거나, 같은 산출물을 두 번 넣거나, 로스터에 없는
// 모델을 배정한 일이 있었다. 셋 다 그 작업을 조용히 죽인다. 지시문만으로는
// 세 번 다 틀렸으므로 여기서 기계로 잡는다.
if (fs.existsSync(jobsPath)) {
  const raw = fs.readFileSync(jobsPath, 'utf8').split('\n').filter((l) => l.trim());
  const malformed = raw.filter((l) => l.split('\t').length < 4);
  const outs = raw.map((l) => l.split('\t')[3]).filter(Boolean);
  const dupes = [...new Set(outs.filter((o, i) => outs.indexOf(o) !== i))];
  const roster = new Set(
    fs.existsSync(path.join(D, 'roster.tsv'))
      ? fs.readFileSync(path.join(D, 'roster.tsv'), 'utf8').split('\n').filter(Boolean).map((l) => l.split('\t')[0])
      : [],
  );
  const offRoster = [...new Set(raw.map((l) => l.split('\t')[0]).filter((m) => m && roster.size && !roster.has(m)))];
  if (malformed.length) alerts.push(`**형식 깨진 작업 줄 ${malformed.length}건** — 구분자가 진짜 탭이 아니다. 그 줄은 영영 안 돈다`);
  else ok.push('작업 줄 형식 정상');
  if (dupes.length) alerts.push(`**중복 등록 ${dupes.length}건** — 같은 산출물을 두 패널이 만든다: ${dupes.map((d) => path.basename(d)).join(' ')}`);
  else ok.push('중복 등록 없음');
  if (offRoster.length) alerts.push(`**로스터에 없는 모델 ${offRoster.length}종** — 그 작업은 계속 실패해 .dead 로 죽는다: ${offRoster.join(' ')}`);
  else ok.push('모델 배정 정상');
}

// --- 단계 정체 ----------------------------------------------------------------
// 앞 단계가 끝났는데 다음 단계가 등록되지 않아 큐가 마르고 패널이 노는 일이
// 2026-08-22 에 여섯 번 있었다. 어느 배치가 어디서 멈췄는지 이름을 대 준다.
{
  const pipe = path.join(ROOT, '.pipeline');
  const stuck = [];
  // 큐에 이미 넣은 일은 정체가 아니다. 산출물이 아직 없을 뿐이다.
  // 이 구분을 안 하면 넣자마자 경보가 울려 늑대소년이 된다.
  const queued = fs.existsSync(jobsPath) ? fs.readFileSync(jobsPath, 'utf8') : '';
  const inQueue = (t, frag) => queued.includes(`.pipeline/${t}/${frag}`);
  for (const t of fs.readdirSync(pipe).filter((d) => /^task\d+$/.test(d))) {
    const dir = path.join(pipe, t);
    const has = (f) => fs.existsSync(path.join(dir, f));
    const cnt = (sub, re) => (fs.existsSync(path.join(dir, sub)) ? fs.readdirSync(path.join(dir, sub)).filter((f) => re.test(f)).length : 0);
    if (!fs.existsSync(path.join(dir, 'input'))) continue;
    const b = String(Number(t.slice(4)) - 4).padStart(2, '0');
    if (fs.existsSync(path.join(ROOT, `src/data/koreanGlossTopBatch${b}.js`))) continue;  // 이미 배포
    const prop = cnt('proposals', /\.json$/);
    if (prop >= 12 && !has('consensus.json')) { stuck.push(`b${b} 대조 안 됨`); continue; }
    if (has('consensus.json') && !has('disputed.json') && !inQueue(t, 'rulings/')) { stuck.push(`b${b} 판정 미등록`); continue; }
    const rul = cnt('rulings', /^adj-.*\.json$/);
    if (rul >= 4 && !has('rulings.json')) { stuck.push(`b${b} 판정병합 안 됨`); continue; }
    if (has('rulings.json') && has('final.json')
        && fs.statSync(path.join(dir, 'final.json')).mtimeMs < fs.statSync(path.join(dir, 'rulings.json')).mtimeMs) {
      stuck.push(`b${b} 규칙적용이 판정보다 오래됨 — apply-rules 다시`); continue;
    }
    if (has('final.json') && cnt('audits', /^audit-.*\.json$/) === 0 && !inQueue(t, 'audits/audit-')) { stuck.push(`b${b} 감사 미등록`); continue; }
    if (cnt('audits', /^audit-.*\.json$/) >= 4 && !fs.existsSync(path.join(dir, 'audits/recheck.json')) && !inQueue(t, 'audits/recheck')) { stuck.push(`b${b} 재감사 미등록`); continue; }
  }
  if (stuck.length) alerts.push(`**단계 정체 ${stuck.length}건** — 앞 단계가 끝났는데 다음이 없다: ${stuck.join(' / ')}`);
  else ok.push('단계 정체 없음');
}

// --- 재시도 간격 -----------------------------------------------------------
const dispSrc = fs.readFileSync(path.join(D, 'dispatcher.sh'), 'utf8');
const retry = /RETRY_AFTER="\$\{RETRY_AFTER:-(\d+)\}"/.exec(dispSrc);
if (retry) {
  const v = Number(retry[1]);
  if (v < 600) alerts.push(`**RETRY_AFTER ${v}초** — 모델이 보통 2~5분 걸린다. 정상 실행 중인 작업을 중복 배정한다`);
  else ok.push(`RETRY_AFTER ${v}초`);
}

// --- 깨진 산출물 -----------------------------------------------------------
try {
  execSync(`node ${path.join(D, 'validate.mjs')}`, { cwd: ROOT, stdio: 'pipe' });
  ok.push('제안 산출물 정상');
} catch {
  alerts.push('**깨진 산출물 있음** — `node .pipeline/dispatch/validate.mjs --fix` 로 지워 재실행시켜라');
}

// --- 포기한 작업 ---
try {
  const dead = execSync(`find ${ROOT}/.pipeline -name '*.dead' -newermt '1 day ago'`, { encoding: 'utf8' })
    .split('\n').filter(Boolean);
  if (dead.length) alerts.push(`**포기한 작업 ${dead.length}건** — 반복 실패로 큐에서 뺐다: ${dead.map((d) => path.basename(d)).join(' ')}`);
  else ok.push('포기한 작업 없음');
} catch { ok.push('포기한 작업 없음'); }

// --- 규칙 게이트 -----------------------------------------------------------
for (const [label, script] of [
  ['표기 규칙', 'scripts/verify-translit-rules.mjs'],
  ['등록부 최신성', 'scripts/build-korean-gloss-registry.mjs --check'],
]) {
  try {
    execSync(`node ${script}`, { cwd: ROOT, stdio: 'pipe' });
    ok.push(`${label} 통과`);
  } catch {
    alerts.push(`**${label} 실패** — 데이터가 규칙을 벗어났다`);
  }
}

// --- 계열 균형 -------------------------------------------------------------
const rosterPath = path.join(D, 'roster.tsv');
if (fs.existsSync(rosterPath)) {
  const fams = {};
  for (const l of fs.readFileSync(rosterPath, 'utf8').split('\n').filter(Boolean)) {
    const f = l.split('\t')[3];
    fams[f] = (fams[f] || 0) + 1;
  }
  const counts = Object.values(fams);
  if (new Set(counts).size > 1) alerts.push(`계열 불균형 ${JSON.stringify(fams)} — 한 계열의 맹점이 다수결을 통과한다`);
  else ok.push(`계열 균형 ${JSON.stringify(fams)}`);
}

// --- 출력 ------------------------------------------------------------------
console.log(`파이프라인 점검 · ${new Date().toLocaleTimeString('ko-KR')}`);
for (const o of ok) console.log(`  ✓ ${o}`);
if (!alerts.length) {
  console.log('\n이상 없음.');
  process.exit(0);
}
console.log('');
for (const a of alerts) console.log(`  ✗ ${a}`);
process.exit(1);
