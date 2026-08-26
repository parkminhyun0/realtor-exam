#!/usr/bin/env node
/* 각 과제가 지금 몇 차인가 — 산출 파일의 존재로만 판정한다.
 *
 * ── 왜 파일로만 보나 ───────────────────────────────────────────────
 * 로그나 패널 화면으로 판정하면 재시작하는 순간 전부 사라진다. 모델이
 * "다 했다" 고 말해 놓고 파일을 안 만든 적도 있다. 그래서 완료의 유일한
 * 증거는 `.pipeline/taskN/0X-*.md` 가 실제로 있고, 내용이 쓸 만한가이다.
 * (쓸 만한가는 validate.mjs 가 본다. 여기서는 존재만 본다.)
 *
 * ── 3차 구조 ──────────────────────────────────────────────────────
 *   01-plan.md    0-lead 가 직접 쓴다. 이게 있어야 과제가 시작된 것이다.
 *   02-impl.md    1차 실행 — codex 가 구현하고 요약을 남긴다
 *   03-review.md  2차 검증 — agy(Gemini) 가 직접 돌려 보고 PASS/FAIL
 *   03b-review.md 3차 리뷰 — claude 가 규격 준수·품질을 본다. PASS/FAIL
 *   04-decision.md 0-lead 가 직접 쓴다. 여기까지 오면 그 과제는 끝이다.
 *
 * 되돌아가기는 `.retry` 파일이 센다. 2차나 3차가 FAIL 이면 advance.mjs 가
 * 02·03·03b 를 지우고 .retry 를 올린다. 3이 되면 멈춘다 — 무한 반복은
 * 패널을 통째로 잡아먹는다.
 *
 * 사용:
 *   node state.mjs              모든 과제의 차수를 표로
 *   node state.mjs --json       기계용
 *   node state.mjs --task task7 하나만
 */
'use strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const PIPE = path.join(ROOT, '.pipeline');
export const MAX_RETRY = 3;

/* 차수의 이름과 그 차수를 끝냈다는 증거 파일. 순서가 곧 진행 순서다. */
export const STAGES = [
  { key: 'plan', file: '01-plan.md', label: '명세', owner: '0-lead' },
  { key: 'impl', file: '02-impl.md', label: '1차 실행', owner: 'codex' },
  { key: 'verify', file: '03-review.md', label: '2차 검증', owner: 'agy' },
  { key: 'review', file: '03b-review.md', label: '3차 리뷰', owner: 'claude' },
  { key: 'decision', file: '04-decision.md', label: '판정', owner: '0-lead' },
];

const has = (dir, f) => {
  try { return fs.statSync(path.join(dir, f)).size > 0; } catch { return false; }
};

/* 판정문에서 PASS/FAIL 을 읽는다.
   판정을 안 적은 리뷰는 판정이 없는 것으로 본다 — validate.mjs 가 지운다. */
export function verdictOf(dir, file) {
  let text;
  try { text = fs.readFileSync(path.join(dir, file), 'utf8'); } catch { return null; }
  // 마지막에 적힌 판정을 따른다. 앞에서 항목별로 언급했을 수 있다.
  const hits = [...text.matchAll(/\b(PASS|FAIL)\b/g)].map((m) => m[1]);
  return hits.length ? hits[hits.length - 1] : null;
}

export function readTask(id) {
  const dir = path.join(PIPE, id);
  if (!fs.existsSync(dir)) return null;

  let retries = 0;
  try { retries = Number(fs.readFileSync(path.join(dir, '.retry'), 'utf8').trim()) || 0; } catch {}

  const done = {};
  for (const s of STAGES) done[s.key] = has(dir, s.file);

  const verdicts = {
    verify: done.verify ? verdictOf(dir, '03-review.md') : null,
    review: done.review ? verdictOf(dir, '03b-review.md') : null,
  };

  /* 지금 무엇을 기다리고 있나 — 첫 번째로 안 끝난 차수. */
  const next = STAGES.find((s) => !done[s.key]) || null;

  /* 막혔는가: 되돌리기 상한에 닿았거나, 판정 없는 리뷰가 있다. */
  const failed = verdicts.verify === 'FAIL' || verdicts.review === 'FAIL';
  const blocked = retries >= MAX_RETRY && failed;

  return {
    id, dir, retries, done, verdicts, failed, blocked,
    stage: next ? next.key : 'complete',
    stageLabel: next ? next.label : '완료',
    owner: next ? next.owner : '—',
  };
}

export function allTasks() {
  let names = [];
  try {
    names = fs.readdirSync(PIPE).filter((n) => /^task\d+$/.test(n));
  } catch { return []; }
  names.sort((a, b) => Number(a.slice(4)) - Number(b.slice(4)));
  return names.map(readTask).filter(Boolean);
}

/* 다음 과제 번호. 기존 폴더는 절대 덮어쓰지 않는다. */
export function nextTaskId() {
  const nums = allTasks().map((t) => Number(t.id.slice(4)));
  return `task${(nums.length ? Math.max(...nums) : 0) + 1}`;
}

/* ── 직접 실행 ─────────────────────────────────────────────────── */
if (import.meta.url === `file://${process.argv[1]}`) {
  const argv = process.argv.slice(2);
  const one = argv.includes('--task') ? argv[argv.indexOf('--task') + 1] : null;
  const tasks = one ? [readTask(one)].filter(Boolean) : allTasks();

  if (argv.includes('--json')) {
    console.log(JSON.stringify(tasks, null, 2));
  } else if (!tasks.length) {
    console.log('과제가 하나도 없다. next-batch.mjs 가 아직 안 돌았거나 .pipeline/ 이 비었다.');
  } else {
    const w = Math.max(...tasks.map((t) => t.id.length));
    for (const t of tasks) {
      const marks = STAGES.map((s) => (t.done[s.key] ? '●' : '○')).join('');
      const v = [t.verdicts.verify, t.verdicts.review].filter(Boolean).join('/') || '';
      const flag = t.blocked ? '  ⛔ 막힘 — 0-lead 확인 필요'
        : t.failed ? `  ↩ 되돌림 ${t.retries}/${MAX_RETRY}` : '';
      console.log(`${t.id.padEnd(w)}  ${marks}  ${t.stageLabel.padEnd(6)} ${v}${flag}`);
    }
    const done = tasks.filter((t) => t.stage === 'complete').length;
    const blocked = tasks.filter((t) => t.blocked).length;
    console.log(`\n${tasks.length}과제 · 완료 ${done} · 막힘 ${blocked}`);
    console.log('표시: ○●  명세 1차 2차 3차 판정');
  }
}
