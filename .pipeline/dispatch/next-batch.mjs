#!/usr/bin/env node
/* 다음 단원을 과제로 만들어 큐에 올린다.
 *
 * ── 하는 일 ────────────────────────────────────────────────────────
 * units.tsv(126단원, 지워지지 않는 원장)에서 아직 과제가 안 만들어진 단원을
 * 우선순위 순으로 꺼내, `.pipeline/taskN/` 을 만들고 1차 작업을 jobs.tsv 에
 * 붙인다. 명세(01-plan.md)는 0-lead 가 직접 쓰지만, 규격 통일은 단원마다
 * 하는 일이 같으므로 **틀에서 찍어낸다** — 0-lead 가 126번 같은 글을 쓰는
 * 것은 사람이 하는 일이 아니다. 단원마다 다른 판단이 필요하면 0-lead 가
 * 그 과제의 01-plan.md 를 손으로 고치면 된다.
 *
 * ── 동시에 몇 개를 흘리나 ──────────────────────────────────────────
 * 3차 구조는 한 과제에 동시 작업이 **하나**뿐이고 순차다(1차가 끝나야 2차).
 * 그대로 두면 패널 하나가 일하고 아홉이 논다. 그래서 과제 여러 개를 동시에
 * 흘린다. 흘리는 수는 --inflight 로 정하고, 기본은 패널 수에 맞춘 8이다.
 *
 * 서로 다른 파일을 건드리는 단원끼리만 같이 흘린다 — 같은 상위 단원(PART·
 * 편·장)은 대개 같은 데이터 파일에 살아서 병합 때 충돌한다. 그래서 상위
 * 단원을 돌아가며 뽑는다.
 *
 * ── 작업 트리를 나눈다 ─────────────────────────────────────────────
 * 패널 여덟이 **같은 폴더**에서 브랜치를 갈아 끼우면 서로를 짓밟는다. 한
 * 패널이 checkout 하는 순간 다른 패널이 편집하던 파일이 통째로 바뀐다.
 * 오류는 안 나고 결과만 뒤섞인다 — 조용한 실패라 가장 나쁘다.
 *
 * 그래서 과제마다 git worktree 를 하나씩 준다(.worktrees/taskN). node_modules
 * 는 본체 것을 심볼릭 링크로 빌려 쓴다 — 여덟 번 npm install 하면 그것만으로
 * 몇 분이 날아간다. 과제가 끝나면 worktree 는 지운다(advance.mjs 가 한다).
 *
 * 사용:
 *   node next-batch.mjs                  부족한 만큼 채운다
 *   node next-batch.mjs --inflight 8     동시 과제 수를 정한다
 *   node next-batch.mjs --dry-run        무엇을 만들지 보기만
 */
'use strict';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { allTasks, nextTaskId } from './state.mjs';
import { modelFor } from './advance.mjs';
import { shortTitle } from './titles.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../..');
const PIPE = path.join(ROOT, '.pipeline');
const UNITS = path.join(HERE, 'units.tsv');
const JOBS = path.join(HERE, 'jobs.tsv');
const TPL = path.join(HERE, 'templates');
const WTROOT = path.join(ROOT, '.worktrees');

const argv = process.argv.slice(2);
const flag = (n, d) => (argv.indexOf(n) >= 0 ? argv[argv.indexOf(n) + 1] : d);
const DRY = argv.includes('--dry-run');
const INFLIGHT = Number(flag('--inflight', '8'));

/* ── 원장을 읽는다 ─────────────────────────────────────────────── */
const units = fs.readFileSync(UNITS, 'utf8').split('\n')
  .filter((l) => l.trim() && !l.startsWith('#'))
  .map((l) => {
    const [prio, subject, unitId, parent, title] = l.split('\t');
    return { prio: Number(prio), subject, unitId, parent, title };
  });

/* ── 이미 과제가 된 단원은 건너뛴다 ────────────────────────────── */
const tasks = allTasks();
const claimed = new Set();
for (const t of tasks) {
  try {
    const meta = JSON.parse(fs.readFileSync(path.join(t.dir, 'unit.json'), 'utf8'));
    claimed.add(`${meta.subject}/${meta.unitId}`);
  } catch { /* unit.json 이 없는 과제는 손으로 만든 것이다. 무시한다. */ }
}

const open = tasks.filter((t) => t.stage !== 'complete' && !t.blocked);
const need = INFLIGHT - open.length;

if (need <= 0) {
  console.log(`진행 중 ${open.length}과제 · 목표 ${INFLIGHT} — 더 만들 것 없다.`);
  process.exit(0);
}

/* ── 무엇을 뽑나 ───────────────────────────────────────────────
   우선순위(내용이 이미 있는 과목부터) → 과목 라운드로빈.
   같은 과목의 단원 둘을 동시에 흘리면 같은 데이터 파일에서 충돌한다. */
/* 같은 **상위 단원**(PART·편·장) 안의 단원 둘을 동시에 흘리지 않는다.
   같은 상위 단원은 대개 같은 데이터 파일에 살아서 병합 때 충돌한다.
   과목 단위로 막으면 동시 과제가 다섯을 못 넘어 패널 다섯이 논다. */
const busyGroups = new Set();
for (const t of open) {
  try {
    const meta = JSON.parse(fs.readFileSync(path.join(t.dir, 'unit.json'), 'utf8'));
    busyGroups.add(`${meta.subject}//${meta.parent}`);
  } catch {}
}

const pool = units
  .filter((u) => !claimed.has(`${u.subject}/${u.unitId}`))
  .sort((a, b) => a.prio - b.prio);

const picked = [];
for (const u of pool) {
  if (picked.length >= need) break;
  const g = `${u.subject}//${u.parent}`;
  if (busyGroups.has(g)) continue;
  picked.push(u);
  busyGroups.add(g);                // 이번 회차에도 그 상위 단원은 한 번만
}

if (!picked.length) {
  const left = pool.length;
  console.log(left
    ? `뽑을 것이 없다 — 남은 ${left}단원이 전부 지금 도는 상위 단원에 속한다. 진행 중인 것이 끝나면 풀린다.`
    : '남은 단원이 없다. 126단원 전부 과제가 만들어졌다.');
  process.exit(0);
}

/* ── 틀에서 명세를 찍어낸다 ────────────────────────────────────── */
const branchOf = (u) => `pipeline/${u.subject}-${u.unitId}`;

const planOf = (u, taskId) => `# ${u.subject} · ${u.parent} › ${u.title}

_규격 통일 과제. 생성 ${new Date().toISOString().slice(0, 10)} · ${taskId}_

## 무엇을 하는 과제인가

이 단원의 **이미 있는 내용을** \`.pipeline/SPEC.md\` 의 규격으로 옮긴다.
없던 내용을 새로 지어내는 과제가 아니다.

| 항목 | 값 |
|---|---|
| 과목 | \`${u.subject}\` |
| 상위 | ${u.parent} |
| 단원 | ${u.title} |
| 단원 id | \`${u.unitId}\` |
| 브랜치 | \`${branchOf(u)}\` |

## 받아들임 기준

1. **여덟 조각** (SPEC.md §1) 이 들어간다. 빼는 조각이 있으면 02-impl.md 에
   왜 뺐는지 적는다. 절차가 없는 단원에 절차 인포그래픽을 억지로 넣지 않는다.
2. **4단계 분류** (SPEC.md §2) — 이 단원이 카테고리 → 대분류 → 중분류 →
   소분류 어디에 앉는지가 데이터에 드러난다.
3. **계산이 있으면 계산 카드** (SPEC.md §3) 로 만든다. 열한 필드를 채우고
   특히 \`calculator\`(계산기 입력 예시)를 빠뜨리지 않는다.
4. **색·강조 규칙** (SPEC.md §1 ⑧) 을 뜻대로 쓴다. 예쁘라고 쓰지 않는다.
5. \`npm run build\` 가 통과한다.
6. **기존 내용이 사라지지 않는다.** 규격에 맞추느라 원문을 잃는 것이 이
   작업의 가장 큰 위험이다.
7. 조문·수치에 근거가 있다 (SPEC.md §4). 근거 없는 항목은 뺀다.

## 건드리지 않을 것

- 다른 과목의 파일
- \`.github/\`, 배포 설정
- 남의 미커밋 변경

## 차수

1차 \`codex\` → 2차 \`agy\`(빌드·숫자 대조) → 3차 \`claude\`(규격의 뜻·통일성)
FAIL 이면 1차로 되돌린다. 최대 3회.
`;

/* 프롬프트 치환. **남은 자리표시자가 있으면 그 작업을 만들지 않는다.**
   앞 파이프라인에서 치환이 조용히 실패해 감사 넷이 모두 같은 100개만 보고
   200개가 검사 없이 지나간 적이 있다. 조용한 실패가 가장 나쁘다. */
function render(tplName, vars) {
  let text = fs.readFileSync(path.join(TPL, tplName), 'utf8');
  for (const [k, v] of Object.entries(vars)) text = text.split(`{{${k}}}`).join(v);
  const left = text.match(/\{\{[A-Z_]+\}\}/g);
  if (left) throw new Error(`${tplName}: 치환되지 않은 자리표시자 ${[...new Set(left)].join(', ')}`);
  return text;
}

const lines = [];
for (const u of picked) {
  const taskId = DRY ? `task?(${u.unitId})` : nextTaskId();
  const dir = path.join(PIPE, taskId);
  const branch = branchOf(u);

  const worktree = path.join(WTROOT, taskId);
  const vars = {
    ROOT, TASK: taskId, SUBJECT: u.subject, PARENT: u.parent,
    TITLE: u.title, UNIT_ID: u.unitId, BRANCH: branch,
    WORKTREE: worktree, TASKDIR: dir,
  };
  const prompt = render('impl.txt', vars);   // 치환 실패면 여기서 던진다

  if (DRY) {
    console.log(`${taskId}  ${u.subject.padEnd(20)} ${u.parent} › ${u.title}`);
    continue;
  }

  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'unit.json'), JSON.stringify({ ...u, taskId, branch }, null, 2) + '\n');
  fs.writeFileSync(path.join(dir, '01-plan.md'), planOf(u, taskId));
  fs.writeFileSync(path.join(dir, 'prompt-impl.txt'), prompt);

  /* 브랜치와 작업 트리를 미리 판다. 1차가 main 에서, 그리고 남의 폴더에서
     작업하는 것을 둘 다 막는다. */
  try {
    execFileSync('git', ['-C', ROOT, 'branch', '--force', branch, 'origin/main'], { stdio: 'ignore' });
    if (!fs.existsSync(worktree)) {
      fs.mkdirSync(WTROOT, { recursive: true });
      execFileSync('git', ['-C', ROOT, 'worktree', 'add', '--force', worktree, branch], { stdio: 'ignore' });
    }
    // node_modules 는 본체 것을 빌려 쓴다. 여덟 번 설치할 이유가 없다.
    const nm = path.join(worktree, 'node_modules');
    if (!fs.existsSync(nm)) fs.symlinkSync(path.join(ROOT, 'node_modules'), nm, 'dir');
  } catch (e) {
    console.error(`  작업 트리를 만들지 못했다: ${taskId} — ${e.message}`);
    continue;   // 폴더 없이 일을 올리면 패널이 본체를 건드린다. 올리지 않는다.
  }

  lines.push([
    modelFor(taskId, 'impl'),
    shortTitle(taskId, 'impl', u.subject, u.title),
    path.relative(ROOT, path.join(dir, 'prompt-impl.txt')),
    path.relative(ROOT, path.join(dir, '02-impl.md')),
  ].join('\t'));

  console.log(`${taskId}  1차 등록  ${u.subject} · ${u.parent} › ${u.title}`);
}

if (!DRY && lines.length) {
  fs.appendFileSync(JOBS, lines.join('\n') + '\n');
  console.log(`\njobs.tsv 에 ${lines.length}건 추가. 진행 중 ${open.length + lines.length}/${INFLIGHT}`);
}
