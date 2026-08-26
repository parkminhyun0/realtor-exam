#!/usr/bin/env node
/* 세법 전용 레인 — 다음에 채울 단원 하나를 준비한다.
 *
 * ── 왜 따로 도나 ───────────────────────────────────────────────────
 * 다른 과목은 **있는 본문을 규격으로 옮기는** 일이라 우선순위 1이다.
 * 세법은 `src/data/taxLaw.js` 에 **목차만 있고 본문이 없어서** 성격이 다르다 —
 * 국가법령정보센터에서 현행 조문을 읽어 **없는 본문을 채우는** 일이다.
 * 원장에서 우선순위 3이라 84단원이 끝나기 전에는 순서가 오지 않는다.
 * 박 목사님이 "패널 하나를 세법에 배정하자" 하셔서 전용 레인을 만들었다.
 *
 * ── 큐에 넣지 않는다 ───────────────────────────────────────────────
 * 이 레인은 dispatcher 를 거치지 않고 자기 패널에서 자기 루프로 돈다.
 * 다만 산출물(02-impl.md)이 생기면 advance.mjs 가 평소처럼 2차·3차를
 * 큐에 올린다. **집필은 전용 레인, 검증은 본 파이프라인**이다. 지어내기가
 * 가장 위험한 과제라 검증을 건너뛰지 않는다.
 *
 * 사용:
 *   node tax-lane.mjs --next    다음 단원을 준비하고 taskId 를 찍는다
 *   node tax-lane.mjs --status  세법 진행 상황
 */
'use strict';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { allTasks, nextTaskId } from './state.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../..');
const PIPE = path.join(ROOT, '.pipeline');
const WTROOT = path.join(ROOT, '.worktrees');
const TPL = path.join(HERE, 'templates');
const argv = process.argv.slice(2);

const units = fs.readFileSync(path.join(HERE, 'units.tsv'), 'utf8').split('\n')
  .filter((l) => l.trim() && !l.startsWith('#'))
  .map((l) => { const [prio, subject, unitId, parent, title] = l.split('\t');
                return { prio: Number(prio), subject, unitId, parent, title }; })
  .filter((u) => u.subject === 'tax-law');

/* 이미 과제가 된 단원. 산출 파일의 존재가 완료의 유일한 증거다. */
const done = new Map();
for (const t of allTasks()) {
  try {
    const m = JSON.parse(fs.readFileSync(path.join(t.dir, 'unit.json'), 'utf8'));
    if (m.subject === 'tax-law') done.set(m.unitId, t);
  } catch {}
}

if (argv.includes('--status')) {
  for (const u of units) {
    const t = done.get(u.unitId);
    console.log(`  ${u.unitId.padEnd(6)} ${t ? `${t.id} ${t.stageLabel}` : '아직'}  ${u.parent} › ${u.title}`);
  }
  console.log(`\n세법 ${units.length}단원 · 착수 ${done.size}`);
  process.exit(0);
}

/* 진행 중인 세법 과제가 있으면 새로 만들지 않는다. 한 번에 하나다 —
   같은 데이터 파일(taxLaw.js·taxLawContent.js)을 둘이 고치면 충돌한다. */
const open = [...done.values()].filter((t) => !t.done.impl && !t.blocked);
if (open.length) {
  console.log(open[0].id);
  process.exit(0);
}

const next = units.find((u) => !done.has(u.unitId));
if (!next) { console.error('세법 9단원을 모두 착수했다.'); process.exit(2); }

const taskId = nextTaskId();
const dir = path.join(PIPE, taskId);
const branch = `pipeline/tax-law-${next.unitId}`;
const worktree = path.join(WTROOT, taskId);

const vars = {
  ROOT, TASK: taskId, SUBJECT: 'tax-law', PARENT: next.parent,
  TITLE: next.title, UNIT_ID: next.unitId, BRANCH: branch,
  WORKTREE: worktree, TASKDIR: dir,
};

function render(name) {
  let text = fs.readFileSync(path.join(TPL, name), 'utf8');
  for (const [k, v] of Object.entries(vars)) text = text.split(`{{${k}}}`).join(v);
  const left = text.match(/\{\{[A-Z_]+\}\}/g);
  // 치환이 조용히 실패하면 모델이 자리표시자를 그대로 읽고 엉뚱한 일을 한다.
  if (left) throw new Error(`${name}: 치환되지 않은 자리표시자 ${[...new Set(left)].join(', ')}`);
  return text;
}

fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, 'unit.json'),
  JSON.stringify({ ...next, taskId, branch, lane: 'tax' }, null, 2) + '\n');
fs.writeFileSync(path.join(dir, '01-plan.md'), `# 부동산세법 · ${next.parent} › ${next.title}

_본문 집필 과제. 생성 ${new Date().toISOString().slice(0, 10)} · ${taskId} · 세법 전용 레인_

## 무엇을 하는 과제인가

\`src/data/taxLaw.js\` 에 **목차만 있고 본문이 없는** 이 단원을,
국가법령정보센터(law.go.kr) 현행 조문에 근거해 채운다.
다른 과목의 "옮기기" 과제와 달리 **없는 것을 만드는** 과제다.

| 항목 | 값 |
|---|---|
| 과목 | \`tax-law\` |
| 상위 | ${next.parent} |
| 단원 | ${next.title} |
| 단원 id | \`${next.unitId}\` |
| 브랜치 | \`${branch}\` |

## 받아들임 기준

1. **근거가 있다.** 세율·과세표준·공제·기한·금액마다 법령명과 조문 번호가
   02-impl.md 에 적혀 있다. 근거 없는 숫자는 하나도 없다.
2. **2026년 시험 기준 현행 조문**이다. 시행일이 지난 개정을 반영했다.
3. **4단계 분류**(SPEC §2)의 기존 뼈대를 바꾸지 않았다.
4. **여덟 조각**(SPEC §1)이 들어갔다. 특히 세목을 나란히 놓는 **비교표**.
5. 납세의무자 · 과세표준 · 세율 · 납기 · 부과징수방법 다섯을 다 짚었다.
6. 계산이 나오는 단원이면 **계산 카드**(SPEC §3, 열한 필드)를 만들었고
   \`calculator\` 를 빠뜨리지 않았다.
7. \`npm run build\` 가 통과한다.
8. 근거를 못 찾아 뺀 항목이 02-impl.md 에 목록으로 남아 있다.

## 차수

1차 집필은 **세법 전용 레인**에서 한다(dispatcher 를 거치지 않는다).
02-impl.md 가 생기면 advance.mjs 가 평소처럼 2차 검증·3차 리뷰를 큐에 올린다.
**지어내기가 가장 위험한 과제라 검증을 건너뛰지 않는다.**
`);
fs.writeFileSync(path.join(dir, 'prompt-impl.txt'), render('tax-content.txt'));

try {
  execFileSync('git', ['-C', ROOT, 'branch', '--force', branch, 'origin/main'], { stdio: 'ignore' });
  if (!fs.existsSync(worktree)) {
    fs.mkdirSync(WTROOT, { recursive: true });
    execFileSync('git', ['-C', ROOT, 'worktree', 'add', '--force', worktree, branch], { stdio: 'ignore' });
  }
  const nm = path.join(worktree, 'node_modules');
  if (!fs.existsSync(nm)) fs.symlinkSync(path.join(ROOT, 'node_modules'), nm, 'dir');
} catch (e) {
  console.error(`작업 트리를 만들지 못했다: ${e.message}`);
  process.exit(3);
}

console.error(`${taskId} 준비됨 · ${next.parent} › ${next.title}`);
console.log(taskId);
