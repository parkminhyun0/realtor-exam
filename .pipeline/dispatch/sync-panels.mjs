#!/usr/bin/env node
/* 살아 있는 cmux 배치에서 panels.env 를 다시 만든다.
 *
 * ── 왜 있나 ────────────────────────────────────────────────────────
 * panels.env 는 손으로 적혀 있었다. 2026-08-27 에 열어 보니 현실과 전부
 * 어긋나 있었다 — 파일은 workspace:11 / 일꾼 106~115 / 감시견 130 이라고
 * 했는데 실제는 workspace:4 / 10,11,13~18,20,21 / 19 였다. cmux 가
 * 재시작하면서 번호를 다시 매겼기 때문이다.
 *
 * 조용히 어긋나는 것이 나쁘다. 그 상태로 `rm STOP` 하고 감시견을 띄우면
 * 디스패처가 **없는 패널에 명령을 쏜다.** 아무 데서도 오류가 나지 않고
 * 그냥 아무 일도 일어나지 않는다. 열 패널이 노는데 원인이 안 보인다.
 *
 * 두 가지로 막는다.
 *   1. 짧은 참조(surface:6) 대신 **UUID** 를 적는다. UUID 는 자리 번호가
 *      아니라 신원이라 번호를 다시 매겨도 그대로다.
 *   2. 그래도 사라진 패널이 생기면 **제목으로 다시 찾는다.** 데몬 패널은
 *      제목에 고유한 표식(🚦 ⏭ 📦 🎖 👁 🐕)을 달고 있다.
 *
 * 감시견이 주기마다 부른다. 배치가 바뀌면 다음 주기에 저절로 맞춰진다.
 *
 * 사용: node .pipeline/dispatch/sync-panels.mjs [--ws <제목|ref>] [--out <경로>]
 *                                              [--quiet] [--dry-run]
 */
'use strict';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const argv = process.argv.slice(2);
const flag = (name, dflt = null) => {
  const i = argv.indexOf(name);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : dflt;
};
const QUIET = argv.includes('--quiet');
const DRY = argv.includes('--dry-run');
const OUT = path.resolve(ROOT, flag('--out', '.pipeline/dispatch/panels.env'));

/* 데몬 패널을 제목으로 알아본다. 순서가 곧 우선순위다 — 한 패널이 두
   표식을 가질 일은 없지만, 먼저 잡힌 것이 이긴다. */
const ROLES = [
  ['DISPATCHER_SURFACE', /🚦|디스패처/, '디스패처'],
  ['ADVANCE_SURFACE', /⏭|단계\s*전환/, '단계 전환'],
  ['SUPPLY_SURFACE', /📦|공급\s*감독관/, '공급 감독관'],
  ['RELAY_SURFACE', /🎖|0-lead\s*대행/, '0-lead 대행'],
  ['SUPERVISOR_SURFACE', /👁|진행\s*감독관/, '진행 감독관'],
  ['WATCHDOG_SURFACE', /🐕|감시견/, '감시견'],
  // 세법 전용 레인. dispatcher 를 거치지 않고 자기 루프로 도는 패널이라
  // **일꾼 풀에 들어가면 안 된다.** 들어가면 디스패처가 집필 중인 패널에
  // 다른 작업을 덮어씌운다.
  ['TAX_SURFACE', /🧾|세법\s*(레인|작업)/, '세법 레인'],
];

/* ── 지금 배치를 읽는다 ────────────────────────────────────────── */
let tree;
try {
  tree = execFileSync('cmux', ['tree', '--all', '--id-format', 'both'],
    { encoding: 'utf8', timeout: 15000 });
} catch (e) {
  console.error(`cmux 를 부르지 못했다: ${e.message}`);
  console.error('cmux 가 안 떠 있으면 panels.env 를 건드리지 않고 그대로 둔다.');
  process.exit(3);
}

/* 워크스페이스 줄과 표면 줄만 뽑는다. 트리 그림 문자는 무시한다. */
const UUID = '[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}';
const workspaces = [];
let cur = null;
for (const line of tree.split('\n')) {
  const w = line.match(new RegExp(`workspace (workspace:\\d+) (${UUID}) "([^"]*)"`));
  if (w) { cur = { ref: w[1], uuid: w[2], title: w[3], surfaces: [] }; workspaces.push(cur); continue; }
  const s = line.match(new RegExp(`surface (surface:\\d+) (${UUID}) \\[(\\w+)\\] "([^"]*)"`));
  if (s && cur) cur.surfaces.push({ ref: s[1], uuid: s[2], type: s[3], title: s[4] });
}

/* ── 어느 워크스페이스인가 ─────────────────────────────────────── */
const prev = (() => {
  try { return fs.readFileSync(OUT, 'utf8'); } catch { return ''; }
})();
const prevVal = (k) => (prev.match(new RegExp(`^${k}="([^"]*)"`, 'm')) || [, ''])[1];

/* 고르는 순서: 명령줄 → 기존 파일이 기억하는 워크스페이스 UUID → 제목 */
const want = flag('--ws', prevVal('CMUX_WS_UUID') || prevVal('CMUX_WS_TITLE') || prevVal('CMUX_WS'));
const ws = workspaces.find((w) => w.uuid === want)
  || workspaces.find((w) => w.title === want)
  || workspaces.find((w) => w.ref === want)
  || workspaces.find((w) => want && w.title.includes(want));
if (!ws) {
  console.error(`워크스페이스를 찾지 못했다: ${want || '(지정 없음)'}`);
  console.error(`지금 있는 것: ${workspaces.map((w) => `${w.ref} "${w.title}"`).join(' · ') || '없음'}`);
  console.error('panels.env 를 건드리지 않는다 — 빈 배치로 덮어쓰면 파이프라인이 통째로 먹통이 된다.');
  process.exit(4);
}

/* ── 역할을 나눈다 ─────────────────────────────────────────────── */
const terminals = ws.surfaces.filter((s) => s.type === 'terminal');
const assigned = new Map();      // 역할 → surface
const taken = new Set();

for (const [key, re] of ROLES) {
  const hit = terminals.find((s) => !taken.has(s.uuid) && re.test(s.title));
  if (hit) { assigned.set(key, hit); taken.add(hit.uuid); }
}

/* 제목으로 못 찾은 역할은 **기존 파일이 기억하는 UUID** 로 되살린다.
   데몬이 죽으면 제목이 셸 기본값으로 되돌아가서 표식이 사라진다.
   그 패널을 일꾼 풀에 넣어 버리면 감시견이 데몬을 되살릴 자리를 잃는다. */
for (const [key, , label] of ROLES) {
  if (assigned.has(key)) continue;
  const remembered = prevVal(`${key}_UUID`);
  const hit = terminals.find((s) => s.uuid === remembered && !taken.has(s.uuid));
  if (hit) {
    assigned.set(key, hit); taken.add(hit.uuid);
    if (!QUIET) console.log(`  ${label}: 제목이 없어 기존 UUID 로 되살림 (${hit.ref})`);
  }
}

const workers = terminals.filter((s) => !taken.has(s.uuid));
const missing = ROLES.filter(([k]) => !assigned.has(k));

/* 빈 배치로 덮어쓰지 않는다. 이 파일이 망가지면 파이프라인 전체가 선다. */
if (!workers.length) {
  console.error(`일꾼 패널이 하나도 없다 (워크스페이스 "${ws.title}", 터미널 ${terminals.length}개).`);
  console.error('panels.env 를 건드리지 않는다.');
  process.exit(5);
}

/* ── 한도는 기존 값을 지킨다 ────────────────────────────────────
   공급원 한도는 배치가 아니라 **계정**에서 오는 값이다. 패널을 다시
   세었다고 마음대로 바꾸면 안 된다. 파이프라인이 둘이면 나눠 가진 값이다. */
const caps = {
  CAP_AGY: prevVal('CAP_AGY') || '4',
  CAP_CODEX: prevVal('CAP_CODEX') || '3',
  CAP_CLAUDE: prevVal('CAP_CLAUDE') || '3',
};
const capSum = Object.values(caps).reduce((a, b) => a + Number(b), 0);

/* ── 쓴다 ──────────────────────────────────────────────────────── */
const stamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
const roleLines = ROLES.map(([key, , label]) => {
  const s = assigned.get(key);
  return s
    ? `${key}="${s.ref.replace('surface:', '')}"\n${key}_UUID="${s.uuid}"   # ${label}`
    : `# ${key} 없음 — ${label} 패널을 찾지 못했다`;
}).join('\n');

const body = `# 패널 배치 — **자동 생성물이다. 손으로 고치지 마라.**
#
# .pipeline/dispatch/sync-panels.mjs 가 살아 있는 cmux 배치에서 다시 쓴다.
# 감시견이 주기마다 부르므로 패널을 옮기거나 새로 열면 저절로 맞춰진다.
#
# 손으로 적던 앞 판본은 2026-08-27 에 현실과 전부 어긋나 있었다(workspace:11
# 이라고 적혀 있었지만 실제는 workspace:4). 그 상태로 디스패처를 띄우면 없는
# 패널에 명령을 쏘고, 오류 없이 아무 일도 일어나지 않는다.
#
# 짧은 참조(surface:6)는 **자리 번호**라 cmux 재시작마다 바뀐다. UUID 가
# 진짜 신원이다. 스크립트는 UUID 를 먼저 쓰고, 번호는 사람이 읽으라고 남긴다.
#
# 갱신 ${stamp}

CMUX_WS="${ws.uuid}"
CMUX_WS_REF="${ws.ref}"                    # 사람이 읽는 용도. 바뀔 수 있다.
CMUX_WS_UUID="${ws.uuid}"
CMUX_WS_TITLE="${ws.title}"

# 데몬 패널 — 일꾼으로 쓰지 않는다.
${roleLines}

# 일꾼 패널 ${workers.length}개.
# ${workers.map((s) => `${s.ref.replace('surface:', '')}=${s.title.slice(0, 24)}`).join(' · ')}
WORKER_SURFACES="${workers.map((s) => s.uuid).join(' ')}"
WORKER_SURFACE_REFS="${workers.map((s) => s.ref.replace('surface:', '')).join(' ')}"

# 공급원별 동시 실행 한도. **계정 단위**라 패널 수와 별개다.
#   agy    gemini 계열 전부가 한 쿼터를 나눠 쓴다 — 많이 물려도 빨라지지 않는다
#   codex  따로
#   claude 따로
# 파이프라인이 둘 이상이면 이 값을 나눠 가진다. 합치면 계정 한도를 넘는다.
CAP_AGY="${caps.CAP_AGY}"
CAP_CODEX="${caps.CAP_CODEX}"
CAP_CLAUDE="${caps.CAP_CLAUDE}"
`;

if (DRY) { console.log(body); process.exit(0); }
fs.writeFileSync(OUT, body);

if (!QUIET) {
  console.log(`  워크스페이스 "${ws.title}" (${ws.ref})`);
  console.log(`  일꾼 ${workers.length} · 데몬 ${assigned.size}/${ROLES.length}`);
  if (missing.length) console.log(`  못 찾은 데몬: ${missing.map((r) => r[2]).join(', ')}`);
  if (capSum > workers.length) {
    console.log(`  한도 합 ${capSum} > 일꾼 ${workers.length} — 남는 한도는 그냥 안 쓰인다`);
  }
  console.log(`  → ${path.relative(ROOT, OUT)}`);
}
