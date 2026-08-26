#!/usr/bin/env node
/* 인수인계 문서를 현재 상태에서 만들어 낸다.
 *
 * ── 왜 있나 ────────────────────────────────────────────────────────
 * 2026-08-25, 0-lead(Claude)가 사용량 제한에 걸렸을 때 Codex 패널이 이어받지
 * 못했다. 장치가 고장 난 게 아니었다. 넘겨받을 내용이 **없었다**.
 *   HANDOFF.md    "No handoff recorded."
 *   NEXT_ACTION.md 이틀 묵은 BibleAtlas 지도 검증 지시
 *   LOCK.json     locked=false · provider=null
 * 규칙은 제한에 걸리기 전 checkpoint 를 남기라고 돼 있는데, 그것을 사람(0-lead)
 * 이 손으로 부르는 구조였다. 갑자기 끊기면 부를 사람이 없다.
 *
 * 그래서 감시견이 주기적으로 이 스크립트를 부른다. 0-lead 가 어느 순간
 * 끊겨도 마지막 주기 시점의 상태가 남는다.
 *
 * 사용: node .pipeline/dispatch/checkpoint.mjs [--quiet]
 */
'use strict';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const QUIET = process.argv.includes('--quiet');
const D = path.join(ROOT, '.pipeline/dispatch');
const RELAY = path.join(ROOT, '.pipeline/relay');
const sh = (cmd, args) => {
  try { return execFileSync(cmd, args, { cwd: ROOT, encoding: 'utf8' }).trim(); }
  catch { return ''; }
};
const read = (p, d = '') => { try { return fs.readFileSync(p, 'utf8'); } catch { return d; } };

/* ── 지금 어디까지 왔나 ─────────────────────────────────────────── */
const branch = sh('git', ['rev-parse', '--abbrev-ref', 'HEAD']);
const dirty = sh('git', ['status', '--short', '--', 'src', 'package.json'])
  .split('\n').filter(Boolean);

let batches = [];
try {
  batches = JSON.parse(sh('node', ['.pipeline/dispatch/state.mjs'])).batches || [];
} catch { /* state.mjs 가 없거나 깨졌다 — 아래에서 그대로 보고된다 */ }

const pending = [];      // 아직 산출물이 없는 작업
for (const line of read(path.join(D, 'jobs.tsv')).split('\n')) {
  const f = line.split('\t');
  if (f.length < 4) continue;
  if (!fs.existsSync(path.join(ROOT, f[3]))) pending.push({ model: f[0], title: f[1] });
}

/* 이미 올라간 PR. 배치가 main 에 없다고 무조건 "PR 하라" 고 적으면, 이미
   PR 이 있는데 이어받는 쪽이 같은 배치로 PR 을 또 만든다. */
const openPrs = (() => {
  const out = sh('gh', ['pr', 'list', '--state', 'open', '--limit', '20',
                        '--json', 'number,title,isDraft']);
  try { return JSON.parse(out || '[]'); } catch { return []; }
})();
const prForBatch = (b) => openPrs.find((p) => new RegExp(`batch ${b}\\b`, 'i').test(p.title));

const DAEMONS = [['디스패처', 'dispatcher.sh'], ['단계 전환', 'advance-loop'],
  ['공급 감독관', 'supply-loop'], ['0-lead 대행', 'lead-relay-loop'],
  ['진행 감독관', 'supervisor-loop'], ['감시견', 'watchdog.sh']];
const down = DAEMONS.filter(([, p]) => !sh('pgrep', ['-f', p]));

const now = Math.floor(Date.now() / 1000);
const cooling = read(path.join(D, 'cooldown.tsv')).split('\n').filter(Boolean)
  .map((l) => l.split('\t')).filter(([, until]) => Number(until) > now)
  .map(([m, until]) => `${m} (${Math.round((until - now) / 60)}분 남음)`);

/* ── 다음에 할 일 하나 ──────────────────────────────────────────
   여러 개를 적으면 이어받는 쪽이 무엇부터 할지 모른다. 하나만 적는다.
   순서는 파이프라인 끝(배포·PR)에 가까운 것부터다 — 끝이 막히면 앞이 아무리
   돌아도 결과가 안 나온다. */
function nextAction() {
  /* 작업 트리가 배치 브랜치에 남아 있으면 알린다. 0-lead 대행이 PR 을 만든 뒤
     main 으로 돌려놓지 않아서, 다음 사람이 그 브랜치 위에 커밋할 수 있다.
     데몬과 사람이 작업 트리 하나를 나눠 쓰는 구조라 이것이 실제로 위험하다. */
  if (/^pipeline\/task-/.test(branch) && !dirty.length) {
    return `작업 트리가 배치 브랜치 \`${branch}\` 에 남아 있다. 그 배치의 PR 은 이미 올라갔다. git checkout main && git pull 로 되돌린 뒤 다음 일을 하라.`;
  }
  if (down.length) return `죽은 데몬을 다시 띄운다: ${down.map((d) => d[0]).join(', ')} — bash .pipeline/dispatch/watchdog.sh 가 자동으로 한다. 감시견 자체가 죽었으면 손으로 띄워라.`;
  const readyForPr = batches.find((b) => b.final && (b.audits || 0) >= 4 && b.recheck && !b.srcFile
                                        && !prForBatch(b.batch));
  const waiting = batches.filter((b) => b.final && !b.srcFile && prForBatch(b.batch));
  if (!readyForPr && waiting.length) {
    const p = prForBatch(waiting[0].batch);
    return `batch ${waiting[0].batch} 은 PR #${p.number} 로 이미 올라가 있다(draft=${p.isDraft}). 새로 만들지 마라. 박 목사님 검토·병합을 기다린다. 그동안 다음 배치를 진행하라.`;
  }
  if (readyForPr) return `batch ${readyForPr.batch}(${readyForPr.task}) 을 배포·PR 한다. .pipeline/dispatch/lead-relay.txt 의 절차를 그대로 따른다. 0-lead 대행이 두 주기 안에 못 하면 손으로 해라.`;
  if (dirty.length) return `작업트리에 미커밋 변경이 있다(${dirty.map((l) => l.slice(3)).join(', ')}). 배치 파일·등록부·빈도표라면 네 것이니 커밋하거나 되돌리고 계속하라. 그 밖이면 남의 것일 수 있으니 손대지 말고 보고하라.`;
  const stalled = batches.find((b) => b.final && (b.audits || 0) < 4);
  if (stalled) return `batch ${stalled.batch} 감사가 ${stalled.audits || 0}/4 다. 단계 전환이 등록하지 않으면 .pipeline/dispatch/advance.mjs 를 직접 돌려라.`;
  if (!pending.length) return '큐가 비었다. 공급 감독관이 다음 배치를 연다(OPEN_NEXT 표식 필요). 안 열리면 node .pipeline/dispatch/next-batch.mjs 300 --from .pipeline/gap-survey/ranges 를 직접 돌려라.';
  return `큐에 ${pending.length}건이 남아 있다. 디스패처가 유휴 패널에 물린다. 그대로 두고 지켜보라.`;
}

/* ── 문서로 쓴다 ───────────────────────────────────────────────── */
const stamp = sh('date', ['+%Y-%m-%d %H:%M:%S']);
const inProgress = batches.filter((b) => b.inputReady && !b.srcFile);
const handoff = `# CURRENT HANDOFF

_이 파일은 감시견(.pipeline/dispatch/watchdog.sh)이 주기적으로 다시 쓴다.
사람이 손으로 고치지 마라 — 다음 주기에 덮어써진다._

- 갱신 ${stamp}
- 프로젝트 **bible-mindmap** · 과제 **원어 사전 한글 음역**
- 브랜치 \`${branch}\`

## 지금 하는 일

빈도가 아니라 **중요도**로 고른 후보를 배치 300개씩 음역한다.
분류 근거는 \`.pipeline/gap-survey/classified-all.json\`(모델 넷이 6,890개 분류).
범위 순서는 \`.pipeline/gap-survey/ranges/\` 의 파일 이름이 정한다.
표기 규칙은 \`src/data/koreanGlossTopBatch02.js\` 머리말에서 확정한 것을 따른다.
**규칙은 표결이 아니라 이미 배포된 데이터의 선례로 정한다.**

## 미완 배치

${inProgress.length ? inProgress.map((b) => `- b${b.batch}(${b.task}) 제안 ${b.proposals} · 판정 ${b.rulings} · 최종 ${b.final ? '✓' : '·'} · 감사 ${b.audits} · 재감사 ${b.recheck ? '✓' : '·'}`).join('\n') : '- 없음'}

## 큐

- 미완 작업 ${pending.length}건${pending.length ? `\n${pending.slice(0, 8).map((j) => `  - ${j.model} · ${j.title}`).join('\n')}` : ''}
- 쉬는 모델: ${cooling.length ? cooling.join(' · ') : '없음'}
- 죽은 데몬: ${down.length ? down.map((d) => d[0]).join(', ') : '없음'}

## 이어받는 사람에게

1. \`node .pipeline/dispatch/health.mjs\` 로 먼저 본다.
2. 데몬이 죽어 있으면 \`bash .pipeline/dispatch/watchdog.sh\` 를 띄운다. 나머지는 그것이 세운다.
3. 아래 NEXT ACTION 하나만 한다. 여러 개를 동시에 벌이지 마라.
4. PR 은 **반드시 Draft** 로 만든다. 이 저장소는 일반 lane PR 을 사람 승인 없이 자동 병합한다.
5. \`review: true\` 는 건드리지 마라. 박 목사님 확인 전까지 자동승인 대상이 아니다.
`;

const nextDoc = `# NEXT ACTION

_감시견이 다시 쓴다. 갱신 ${stamp}_

${nextAction()}
`;

fs.mkdirSync(RELAY, { recursive: true });
fs.writeFileSync(path.join(RELAY, 'HANDOFF.md'), handoff);
fs.writeFileSync(path.join(RELAY, 'NEXT_ACTION.md'), nextDoc);

/* 상위 폴더의 relay 도 있으면 같이 갱신한다. 없거나 권한이 막히면 넘어간다 —
   그 파일은 샌드박스 밖이라 전에 EPERM 으로 배치 하나가 통째로 막힌 적이 있다.
   여기서 실패해도 파이프라인은 계속 돌아야 한다. */
const PARENT = path.resolve(ROOT, '../.pipeline/relay');
for (const [name, body] of [['HANDOFF.md', handoff], ['NEXT_ACTION.md', nextDoc]]) {
  try { if (fs.existsSync(PARENT)) fs.writeFileSync(path.join(PARENT, name), body); }
  catch { /* 권한 없음 — 저장소 안의 사본으로 충분하다 */ }
}

/* 쉬는 모델을 FAILOVER 에 남긴다. 이어받는 쪽이 어느 공급원이 죽었는지 안다. */
try {
  const fp = path.join(PARENT, 'FAILOVER.json');
  if (fs.existsSync(fp)) {
    const j = JSON.parse(read(fp, '{}'));
    j.unavailable = Object.fromEntries(cooling.map((c) => [c.split(' ')[0], c]));
    j.updated_at = new Date().toISOString();
    fs.writeFileSync(fp, `${JSON.stringify(j, null, 2)}\n`);
  }
} catch { /* 위와 같은 이유 */ }

if (!QUIET) {
  console.log(`  인수인계 갱신 ${stamp}`);
  console.log(`  미완 배치 ${inProgress.length} · 큐 ${pending.length} · 죽은 데몬 ${down.length}`);
  console.log(`  다음 할 일: ${nextAction().slice(0, 90)}…`);
}
