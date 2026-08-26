#!/usr/bin/env node
/* 리더 승계 — 앞 리더가 멈췄는지 판단하고, 다음 모델에게 넘긴다.
 *
 * ── 왜 있나 ────────────────────────────────────────────────────────
 * 2026-08-25, Claude 가 한도에 걸렸을 때 Codex 패널이 이어받지 못했다.
 * 장치가 고장 난 게 아니라 **넘겨받을 내용이 없었다**(HANDOFF.md 가
 * "No handoff recorded."). 게다가 이어받으라고 **말해 주는 것**도 없었다.
 * checkpoint.mjs 가 상태를 남기는 일을 맡고, 이 파일이 넘기는 일을 맡는다.
 *
 * 판단 기준 — "리더가 없다" 를 직접 알 수는 없으므로 **일이 멈췄는가** 로 본다.
 *   · STOP 표식이 있으면 승계하지 않는다(사람이 일부러 세운 것이다).
 *   · 큐에 일이 남았는데 STALL_MIN 분 동안 새 산출물이 하나도 안 나왔다.
 *   · 또는 데몬이 죽어 있는데 아무도 세우지 않는다.
 * 사람이 자리에 있으면 그 전에 손을 쓰므로, 이 조건은 사람이 없을 때만 참이 된다.
 *
 * 사용: node .pipeline/dispatch/handoff.mjs [--check] [--force]
 *   --check  승계가 필요한지만 알려 준다(0=필요없음, 10=필요함)
 *   기본     필요하면 LOCK 을 잡고 프롬프트를 만들어 경로를 출력한다
 */
'use strict';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const D = path.join(ROOT, '.pipeline/dispatch');
const RELAY = path.join(ROOT, '.pipeline/relay');
const STALL_MIN = Number(process.env.HANDOFF_STALL_MIN || 20);
const CHECK = process.argv.includes('--check');
const FORCE = process.argv.includes('--force');
const read = (p, d = '') => { try { return fs.readFileSync(p, 'utf8'); } catch { return d; } };
const sh = (c, a) => { try { return execFileSync(c, a, { cwd: ROOT, encoding: 'utf8' }).trim(); } catch { return ''; } };

if (fs.existsSync(path.join(D, 'STOP')) && !FORCE) {
  if (!CHECK) console.log('STOP 표식이 있다. 사람이 일부러 세운 것이므로 승계하지 않는다.');
  process.exit(0);
}

/* 큐에 남은 일과, 마지막으로 산출물이 나온 시각 */
const rows = read(path.join(D, 'jobs.tsv')).split('\n').map((l) => l.split('\t')).filter((f) => f.length === 4);
let pending = 0, newest = 0;
for (const f of rows) {
  const p = path.join(ROOT, f[3]);
  if (fs.existsSync(p)) { const m = fs.statSync(p).mtimeMs; if (m > newest) newest = m; }
  else pending++;
}
const stalledMin = newest ? (Date.now() - newest) / 60000 : Infinity;
const DAEMONS = ['dispatcher.sh', 'advance-loop', 'supply-loop', 'watchdog.sh'];
const down = DAEMONS.filter((p) => !sh('pgrep', ['-f', p]));

const reasons = [];
if (pending > 0 && stalledMin >= STALL_MIN) reasons.push(`큐에 ${pending}건이 남았는데 ${Math.round(stalledMin)}분 동안 새 산출물이 없다`);
if (down.length >= 2) reasons.push(`데몬 ${down.length}개가 죽어 있다: ${down.join(', ')}`);
const need = FORCE || reasons.length > 0;

if (CHECK) { console.log(need ? `승계 필요 · ${reasons.join(' / ')}` : '정상'); process.exit(need ? 10 : 0); }
if (!need) { console.log('승계 불필요 — 일이 돌고 있다.'); process.exit(0); }

/* 소유권 — 두 후계자가 동시에 손대지 않게 한다. 30분이면 만료된다. */
const LOCK = path.join(RELAY, 'LOCK.json');
const now = Date.now();
try {
  const l = JSON.parse(read(LOCK, '{}'));
  if (l.locked && l.expires_at && new Date(l.expires_at).getTime() > now && !FORCE) {
    console.log(`이미 ${l.provider} 가 잡고 있다 (만료 ${l.expires_at}). 승계하지 않는다.`);
    process.exit(0);
  }
} catch { /* 깨졌으면 새로 쓴다 */ }

/* 다음 차례. codex → gemini 순. 쿨다운 중인 것은 건너뛴다. */
const cooling = new Set(read(path.join(D, 'cooldown.tsv')).split('\n').filter(Boolean)
  .map((l) => l.split('\t')).filter(([, u]) => Number(u) * 1000 > now).map(([m]) => m));
const ORDER = [
  { provider: 'codex', cmd: 'codex exec --sandbox workspace-write --skip-git-repo-check' },
  { provider: 'gemini-3.1-pro-high', cmd: 'agy --dangerously-skip-permissions --model gemini-3.1-pro-high --print-timeout 60m -p' },
  { provider: 'gemini-3.7-flash-high', cmd: 'agy --dangerously-skip-permissions --model gemini-3.7-flash-high --print-timeout 60m -p' },
];
const pick = ORDER.find((o) => !cooling.has(o.provider));
if (!pick) { console.log('승계할 모델이 모두 쉬는 중이다. 기다린다.'); process.exit(0); }

/* 프롬프트를 만든다 — 상태와 다음 할 일을 그 안에 박아 넣는다.
   후계자가 파일을 찾아 읽게 하면 못 찾거나 옛것을 읽는다. 실제로 그랬다. */
sh('node', ['.pipeline/dispatch/checkpoint.mjs', '--quiet']);
const body = read(path.join(D, 'succession.txt'))
  .replace('{{STATE}}', read(path.join(RELAY, 'HANDOFF.md'), '(인수인계 없음)').split('\n').slice(4).join('\n').trim())
  .replace('{{NEXT_ACTION}}', read(path.join(RELAY, 'NEXT_ACTION.md'), '').split('\n').slice(3).join('\n').trim()
    || '상태를 읽고 스스로 판단하라.');
const outPath = path.join(D, 'succession-active.txt');
fs.writeFileSync(outPath, body);

fs.mkdirSync(RELAY, { recursive: true });
fs.writeFileSync(LOCK, `${JSON.stringify({
  locked: true, role: '0-lead', provider: pick.provider, session_id: null,
  task_id: 'korean-translit', files: [],
  acquired_at: new Date(now).toISOString(),
  expires_at: new Date(now + 30 * 60000).toISOString(),
  reason: reasons.join(' / '),
}, null, 2)}\n`);
fs.appendFileSync(path.join(RELAY, 'EVENTS.jsonl'),
  `${JSON.stringify({ type: 'LEAD_HANDOFF', at: new Date(now).toISOString(), to: pick.provider, reason: reasons.join(' / ') })}\n`);

console.log(`HANDOFF ${pick.provider}`);
console.log(`${pick.cmd} "$(cat .pipeline/dispatch/succession-active.txt)"`);
