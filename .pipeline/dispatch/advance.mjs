#!/usr/bin/env node
/* 차수를 넘긴다 — 1차가 끝나면 2차를, 2차가 끝나면 3차를 큐에 올린다.
 * FAIL 이면 1차로 되돌리고 횟수를 센다.
 *
 * ── 왜 이 파일이 따로 있나 ─────────────────────────────────────────
 * dispatcher.sh 는 "큐에 있는 일을 유휴 패널에 물리는" 것만 한다. 큐에
 * **무엇을 넣을지**는 모른다. 3차 구조는 순차라서, 1차 산출물이 생긴 뒤에야
 * 2차 작업이 만들어질 수 있다. 그 잇는 일을 여기서 한다.
 * 단계전환 데몬(advance-loop.sh)이 주기마다 부른다.
 *
 * ── 탐지는 수리가 아니다 ───────────────────────────────────────────
 * 앞 파이프라인 감시견의 가장 큰 결함은 문제를 **찾기만 하고 고치지 않은
 * 것**이었다. 같은 경고를 4시간 50분 동안 376번 찍는 사이 열 패널 중 아홉이
 * 놀았다. 그래서 여기서는 무언가를 감지하면 **그 자리에서 큐에 넣는다.**
 * 못 하는 것은 못 한다고 말한다.
 *
 * ── 침묵은 죽음과 구별되지 않는다 ──────────────────────────────────
 * 고칠 것이 없을 때도 한 줄은 찍는다. 몇 과제가 몇 차에 있고 큐가 얼마인지.
 * 빈 화면은 살아 있는지 죽었는지 알려주지 않는다.
 *
 * 사용:
 *   node advance.mjs             차수를 넘긴다
 *   node advance.mjs --dry-run   무엇을 할지 보기만
 */
'use strict';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { allTasks, MAX_RETRY, STAGES } from './state.mjs';
import { shortTitle } from './titles.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../..');
const JOBS = path.join(HERE, 'jobs.tsv');
const TPL = path.join(HERE, 'templates');
const WTROOT = path.join(ROOT, '.worktrees');
const DRY = process.argv.includes('--dry-run');

const stamp = () => new Date().toISOString().slice(11, 19);
const rel = (p) => path.relative(ROOT, p);

/* 차수별로 어떤 틀을 쓰고 무엇을 남기는가. 한 곳에만 적는다. */
const STEP = {
  impl:   { tpl: 'impl.txt',   out: '02-impl.md',    prompt: 'prompt-impl.txt',   label: '1차 실행', slot: 0 },
  verify: { tpl: 'verify.txt', out: '03-review.md',  prompt: 'prompt-verify.txt', label: '2차 검증', slot: 1 },
  review: { tpl: 'review.txt', out: '03b-review.md', prompt: 'prompt-review.txt', label: '3차 리뷰', slot: 2 },
};

/* ── 계열을 과제마다 돌려 배정한다 ──────────────────────────────────
 * 처음에는 codex 가 1차를 전담했다. 그런데 3차 구조는 순차라서 **파이프라인이
 * 막 섰을 때 큐의 모든 일이 1차**다. CAP_CODEX 는 계정 한도라 3을 못 넘고,
 * 그래서 열 패널 중 셋만 돌고 일곱이 놀았다(2026-08-27 실측).
 *
 * 계열을 과제 번호로 돌리면 같은 순간에도 1차가 세 계열에 흩어진다.
 * **한 과제 안에서는 세 차가 여전히 서로 다른 계열이므로** 교차검증의 뜻은
 * 그대로다 — 구현한 계열이 자기 것을 검증하는 일은 생기지 않는다.
 *
 *   과제 1 → 1차 GPT    2차 Gemini  3차 Claude
 *   과제 2 → 1차 Gemini  2차 Claude  3차 GPT
 *   과제 3 → 1차 Claude  2차 GPT     3차 Gemini
 */
const FAMILIES = ['codex', 'gemini', 'claude'];

function familyModel(fam) {
  if (fam === 'codex') return 'codex';
  if (fam === 'claude') return 'claude';
  // Gemini 계열은 roster 의 첫 줄을 쓴다. 쿼터에 걸리면 dispatcher 가 넘긴다.
  try {
    for (const line of fs.readFileSync(path.join(HERE, 'roster.tsv'), 'utf8').split('\n')) {
      const [model, , , family] = line.split('\t');
      if (family === 'Gemini') return model;
    }
  } catch {}
  return 'gemini-3.1-pro-high';
}

/* 과제 번호로 회전 폭을 정한다. 같은 과제는 언제 다시 계산해도 같은 배정이
   나온다 — 되돌리기로 1차를 다시 돌려도 계열이 바뀌지 않는다. */
export function modelFor(taskId, stageKey) {
  const n = Number(String(taskId).replace(/\D/g, '')) || 0;
  const slot = STEP[stageKey]?.slot ?? 0;
  return familyModel(FAMILIES[(slot + n) % FAMILIES.length]);
}

/* 이미 큐에 있는 산출물은 다시 넣지 않는다. jobs.tsv 는 덧붙이기만 하는
   기록부라 중복이 쌓이면 같은 일을 두 패널이 한다. */
const queued = new Set();
try {
  for (const line of fs.readFileSync(JOBS, 'utf8').split('\n')) {
    const out = line.split('\t')[3];
    if (out) queued.add(out.trim());
  }
} catch { /* 아직 큐 파일이 없다 */ }

function render(tplName, vars) {
  let text = fs.readFileSync(path.join(TPL, tplName), 'utf8');
  for (const [k, v] of Object.entries(vars)) text = text.split(`{{${k}}}`).join(v);
  const left = text.match(/\{\{[A-Z_]+\}\}/g);
  if (left) throw new Error(`${tplName}: 치환되지 않은 자리표시자 ${[...new Set(left)].join(', ')}`);
  return text;
}

/* 본문은 직접 실행할 때만 돈다.
   next-batch.mjs 가 modelFor 를 쓰려고 이 파일을 import 하는데, 가드가 없으면
   그때마다 단계 전환이 덤으로 돌아 큐가 어긋난다. */
function main() {
  const added = [];
  const notes = [];

  /* 끝난 과제의 작업 트리를 치운다. 안 치우면 .worktrees/ 가 126개까지 불어나고
     git worktree 목록도 그만큼 길어진다. 브랜치는 남긴다 — PR 이 아직 열려 있고
     병합은 박 목사님이 하신다. */
  for (const t of allTasks()) {
    if (t.stage !== 'complete') continue;
    const wt = path.join(WTROOT, t.id);
    if (!fs.existsSync(wt)) continue;
    if (DRY) { notes.push(`🧹 ${t.id} 작업 트리 치울 예정`); continue; }
    try {
      fs.rmSync(path.join(wt, 'node_modules'), { force: true });   // 심볼릭 링크만 끊는다
      execFileSync('git', ['-C', ROOT, 'worktree', 'remove', '--force', wt], { stdio: 'ignore' });
      notes.push(`🧹 ${t.id} 작업 트리 치움`);
    } catch (e) {
      notes.push(`⚠ ${t.id} 작업 트리를 치우지 못했다 — ${e.message}`);
    }
  }

  for (const t of allTasks()) {
    let meta = {};
    try { meta = JSON.parse(fs.readFileSync(path.join(t.dir, 'unit.json'), 'utf8')); } catch {}

    const vars = {
      ROOT, TASK: t.id,
      SUBJECT: meta.subject || '?', PARENT: meta.parent || '?',
      TITLE: meta.title || '?', UNIT_ID: meta.unitId || '?',
      BRANCH: meta.branch || `pipeline/${t.id}`,
      WORKTREE: path.join(WTROOT, t.id), TASKDIR: t.dir,
    };

    /* ── 되돌리기가 먼저다 ────────────────────────────────────────
       FAIL 이 있으면 다음 차수를 올리기 전에 1차로 되돌린다. */
    if (t.failed) {
      if (t.retries >= MAX_RETRY) {
        // 여기서는 못 고친다. 못 고친다고 말한다 — 조용히 넘기지 않는다.
        notes.push(`⛔ ${t.id} 되돌리기 ${t.retries}회 소진. 0-lead 가 04-decision.md 를 써야 한다.`);
        continue;
      }
      const who = t.verdicts.verify === 'FAIL' ? '2차' : '3차';
      if (DRY) {
        notes.push(`↩ ${t.id} ${who} FAIL → 1차로 되돌림 (${t.retries + 1}/${MAX_RETRY})`);
        continue;
      }
      /* **FAIL 사유를 먼저 챙긴다.** 산출물을 그냥 지우면 재실행하는 1차는
         왜 틀렸는지 모른 채 같은 일을 되풀이한다. 되돌리기 3회가 그렇게
         허비되면 그 단원은 영영 안 끝난다. 지우기 전에 옮겨 둔다. */
      const round = t.retries + 1;
      const feedback = ['03-review.md', '03b-review.md']
        .map((f) => {
          try {
            const body = fs.readFileSync(path.join(t.dir, f), 'utf8');
            if (!/\bFAIL\b/.test(body)) return '';
            const who = f === '03-review.md' ? '2차 검증(빌드·숫자 대조)' : '3차 리뷰(규격의 뜻·통일성)';
            return `\n## ${who} 이 FAIL 한 이유\n\n${body.trim()}\n`;
          } catch { return ''; }
        })
        .filter(Boolean).join('\n---\n');

      const fbPath = path.join(t.dir, `feedback-${round}.md`);
      fs.writeFileSync(fbPath,
        `# ${round}회차 되돌림 사유\n\n` +
        `아래는 앞 회차가 왜 FAIL 했는지다. **먼저 읽고, 지적된 것을 전부 고쳐라.**\n` +
        `같은 지적으로 또 FAIL 하면 이 단원은 ${MAX_RETRY}회에서 멈추고 박 목사님께 올라간다.\n` +
        feedback);

      // 산출물을 지우면 dispatcher 가 없다고 보고 1차를 다시 배정한다.
      for (const f of ['02-impl.md', '03-review.md', '03b-review.md'])
        fs.rmSync(path.join(t.dir, f), { force: true });
      fs.writeFileSync(path.join(t.dir, '.retry'), String(round));

      /* 프롬프트를 되돌림용으로 다시 찍는다. 앞선 프롬프트를 그대로 두면
         재실행이 사유 파일의 존재를 모른다. */
      const p = path.join(t.dir, 'prompt-impl.txt');
      fs.writeFileSync(p, render('impl.txt', vars) +
        `\n\n## ⚠ 이번은 ${round}회차 재실행이다\n\n` +
        `앞 회차가 FAIL 했다. **무엇보다 먼저 ${fbPath} 를 읽어라.**\n` +
        `거기 적힌 지적을 하나도 빠짐없이 고쳐라. 고치지 않은 것이 있으면\n` +
        `02-impl.md 에 왜 안 고쳤는지 적어라. 조용히 넘기지 마라.\n`);
      const out = rel(path.join(t.dir, '02-impl.md'));
      if (!queued.has(out)) {
        added.push([modelFor(t.id, 'impl'), shortTitle(t.id, 'impl', vars.SUBJECT, vars.TITLE, round), rel(p), out].join('\t'));
        queued.add(out);
      }
      notes.push(`↩ ${t.id} ${who} FAIL → 1차로 되돌림 (${t.retries + 1}/${MAX_RETRY})`);
      continue;
    }

    /* ── 다음 차수를 올린다 ──────────────────────────────────────── */
    const step = STEP[t.stage];
    if (!step) continue;                        // plan 대기 또는 판정 대기 또는 완료

    if (t.stage === 'decision') {
      notes.push(`✔ ${t.id} 3차까지 PASS. 0-lead 가 04-decision.md 를 쓰면 끝난다.`);
      continue;
    }
    if (t.stage === 'plan') {
      notes.push(`… ${t.id} 01-plan.md 가 없다. next-batch.mjs 가 만들지 못했다.`);
      continue;
    }

    const outRel = rel(path.join(t.dir, step.out));
    if (queued.has(outRel)) continue;           // 이미 큐에 있다

    const model = modelFor(t.id, t.stage);
    const promptPath = path.join(t.dir, step.prompt);

    if (DRY) {
      notes.push(`→ ${t.id} ${step.label} 등록 예정 (${model})`);
      continue;
    }

    fs.writeFileSync(promptPath, render(step.tpl, vars));
    added.push([model, shortTitle(t.id, t.stage, vars.SUBJECT, vars.TITLE), rel(promptPath), outRel].join('\t'));
    queued.add(outRel);
    notes.push(`→ ${t.id} ${step.label} 등록 (${model})`);
  }

  if (added.length && !DRY) fs.appendFileSync(JOBS, added.join('\n') + '\n');

  /* ── 심장 박동 ────────────────────────────────────────────────────
     고칠 것이 없어도 한 줄은 찍는다. 빈 화면은 살아 있는지 알려주지 않는다. */
  const tasks = allTasks();
  const count = {};
  for (const s of STAGES) count[s.key] = 0;
  count.complete = 0;
  for (const t of tasks) count[t.stage] = (count[t.stage] || 0) + 1;

  const remaining = (() => {
    try {
      return fs.readFileSync(JOBS, 'utf8').split('\n')
        .filter((l) => l.trim())
        .filter((l) => { const o = l.split('\t')[3]; return o && !fs.existsSync(path.join(ROOT, o.trim())); })
        .length;
    } catch { return 0; }
  })();

  for (const n of notes) console.log(`${stamp()} ${n}`);
  console.log(
    `${stamp()} ♥ ${tasks.length}과제 · 1차 ${count.impl} 2차 ${count.verify} 3차 ${count.review}` +
    ` 판정대기 ${count.decision} 완료 ${count.complete} 막힘 ${tasks.filter((t) => t.blocked).length}` +
    ` · 큐 ${remaining}건` + (added.length ? ` · 방금 ${added.length}건 올림` : '')
  );

}

if (import.meta.url === `file://${process.argv[1]}`) main();
