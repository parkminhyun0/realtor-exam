#!/usr/bin/env node
/* 끝난 과제를 **과목 통합브랜치**에 병합한다.
 *
 * ── 어디까지 자동인가 (박 목사님 위임, 2026-08-27) ─────────────────
 *   단원 브랜치  ──자동──▶  integration/<과목>  ──수동──▶  main ──▶ 배포
 *
 * 단원 126개를 손으로 병합하시는 것은 현실적이지 않다. 그래서 통합브랜치까지는
 * 자동으로 모은다. **main 병합은 여전히 박 목사님 몫이다** — main 에 들어가는
 * 순간 배포되어 학습자가 보는 화면이 바뀌기 때문이다. 과목이 끝나면 통합
 * 브랜치에서 PR 하나를 올린다. 병합 126번이 검토 5~6번이 된다.
 *
 * ── 병합 조건 (박 목사님이 고르신 것) ──────────────────────────────
 *   2차 검증 PASS  그리고  3차 리뷰 PASS
 *
 * 하나라도 FAIL 이면 병합하지 않는다. 되돌리기는 advance.mjs 가 이미 한다.
 * 2차 검증이 `npm run build` 를 직접 돌려 PASS 를 준 것이므로 빌드는 이미
 * 그 안에 들어 있다. 다만 **합쳐 놓고 깨지는 경우**는 따로 있다 — 두 단원이
 * 같은 파일을 고쳤을 때다. 그래서 병합 뒤 한 번 더 빌드한다. 깨지면 그
 * 병합을 되돌리고 과제를 1차로 돌려보낸다.
 *
 * ── 왜 전용 작업 트리에서 하나 ─────────────────────────────────────
 * 본체(.)는 0-lead 가 쓰는 폴더이고 지금 다른 브랜치에 있다. 거기서 병합하면
 * 0-lead 의 작업이 통째로 뒤바뀐다. .worktrees/_merge 를 따로 둔다.
 *
 * 사용:
 *   node merge-lane.mjs            조건을 만족한 과제를 병합한다
 *   node merge-lane.mjs --dry-run  무엇을 병합할지 보기만
 *   node merge-lane.mjs --status   과목별 통합 현황
 */
'use strict';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { allTasks } from './state.mjs';
import { SUBJ } from './titles.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../..');
const WTROOT = path.join(ROOT, '.worktrees');
const MERGE_WT = path.join(WTROOT, '_merge');
const DRY = process.argv.includes('--dry-run');
const STATUS = process.argv.includes('--status');

const stamp = () => new Date().toISOString().slice(11, 19);
const say = (s) => console.log(`${stamp()} ${s}`);

function git(args, opts = {}) {
  return execFileSync('git', args, { encoding: 'utf8', ...opts }).trim();
}
function gitQuiet(args, opts = {}) {
  try { execFileSync('git', args, { stdio: 'ignore', ...opts }); return true; }
  catch { return false; }
}

const integrationOf = (subject) => `integration/${subject}`;

/* ── 현황 ──────────────────────────────────────────────────────── */
if (STATUS) {
  const bySubj = {};
  for (const t of allTasks()) {
    let m = {}; try { m = JSON.parse(fs.readFileSync(path.join(t.dir, 'unit.json'), 'utf8')); } catch { continue; }
    (bySubj[m.subject] ||= []).push({ t, m });
  }
  for (const [subj, rows] of Object.entries(bySubj)) {
    const br = integrationOf(subj);
    const exists = gitQuiet(['-C', ROOT, 'rev-parse', '--verify', br]);
    const merged = rows.filter((r) => fs.existsSync(path.join(r.t.dir, '.merged'))).length;
    console.log(`  ${(SUBJ[subj] || subj).padEnd(6)} 과제 ${String(rows.length).padStart(3)} · 통합됨 ${String(merged).padStart(3)} · ${exists ? br : '(통합브랜치 아직 없음)'}`);
  }
  process.exit(0);
}

/* ── 병합할 것을 고른다 ────────────────────────────────────────── */
const ready = [];
for (const t of allTasks()) {
  if (fs.existsSync(path.join(t.dir, '.merged'))) continue;      // 이미 했다
  if (t.verdicts.verify !== 'PASS') continue;
  if (t.verdicts.review !== 'PASS') continue;
  let m = {};
  try { m = JSON.parse(fs.readFileSync(path.join(t.dir, 'unit.json'), 'utf8')); } catch { continue; }
  if (!m.branch || !m.subject) continue;
  if (!gitQuiet(['-C', ROOT, 'rev-parse', '--verify', m.branch])) {
    say(`⚠ ${t.id} 브랜치가 없다: ${m.branch}`);
    continue;
  }
  ready.push({ t, m });
}

if (!ready.length) {
  const waiting = allTasks().filter((t) => !fs.existsSync(path.join(t.dir, '.merged')) && t.stage !== 'complete').length;
  say(`병합할 것 없음 · 진행 중 ${waiting}과제`);
  process.exit(0);
}

if (DRY) {
  for (const { t, m } of ready)
    console.log(`  ${t.id}  ${m.branch}  →  ${integrationOf(m.subject)}   (${m.parent} › ${m.title})`);
  process.exit(0);
}

/* ── 병합 전용 작업 트리를 준비한다 ────────────────────────────── */
if (!fs.existsSync(MERGE_WT)) {
  fs.mkdirSync(WTROOT, { recursive: true });
  if (!gitQuiet(['-C', ROOT, 'worktree', 'add', '--detach', MERGE_WT, 'origin/main'])) {
    say('병합용 작업 트리를 만들지 못했다. 이번 회차는 건너뛴다.');
    process.exit(1);
  }
}
const nm = path.join(MERGE_WT, 'node_modules');
if (!fs.existsSync(nm)) {
  try { fs.symlinkSync(path.join(ROOT, 'node_modules'), nm, 'dir'); } catch {}
}

let ok = 0, failed = 0;

for (const { t, m } of ready) {
  const br = integrationOf(m.subject);
  const label = `${t.id} ${SUBJ[m.subject] || m.subject}·${m.title}`;

  // 통합브랜치가 없으면 origin/main 에서 시작한다.
  if (!gitQuiet(['-C', ROOT, 'rev-parse', '--verify', br])) {
    gitQuiet(['-C', ROOT, 'branch', br, 'origin/main']);
    say(`통합브랜치 새로 팜: ${br}`);
  }

  if (!gitQuiet(['-C', MERGE_WT, 'checkout', '--force', br])) {
    say(`⚠ ${label} — ${br} 체크아웃 실패. 건너뛴다.`); failed++; continue;
  }

  const before = git(['-C', MERGE_WT, 'rev-parse', 'HEAD']);

  // 병합. 충돌하면 되돌리고 사람이 볼 표시를 남긴다 — 억지로 풀지 않는다.
  const msg = `merge(${m.subject}): ${m.parent} › ${m.title} [${t.id}]\n\n`
    + `2차 검증 PASS · 3차 리뷰 PASS 를 확인하고 통합브랜치에 모은다.\n`
    + `main 병합은 박 목사님이 하신다 (main = 즉시 배포).\n`;
  if (!gitQuiet(['-C', MERGE_WT, 'merge', '--no-ff', '-m', msg, m.branch])) {
    gitQuiet(['-C', MERGE_WT, 'merge', '--abort']);
    fs.writeFileSync(path.join(t.dir, '.conflict'),
      `${new Date().toISOString()}\n${m.branch} 를 ${br} 에 병합하다 충돌.\n`
      + `같은 파일을 다른 단원이 먼저 고쳤을 가능성이 높다. 0-lead 가 봐야 한다.\n`);
    say(`⚠ ${label} — 병합 충돌. .conflict 남김. 0-lead 확인 필요`);
    failed++; continue;
  }

  // 합쳐 놓고 깨지는 경우를 잡는다. 두 단원이 같은 파일을 고쳤을 때 생긴다.
  let buildOk = true, buildOut = '';
  try {
    buildOut = execFileSync('npm', ['run', 'build'], { cwd: MERGE_WT, encoding: 'utf8', timeout: 300000 });
  } catch (e) {
    buildOk = false;
    buildOut = String(e.stdout || '') + String(e.stderr || e.message);
  }

  if (!buildOk) {
    // 이 병합만 되돌린다. 전용 트리라 다른 작업에 영향이 없다.
    gitQuiet(['-C', MERGE_WT, 'reset', '--hard', before]);
    fs.writeFileSync(path.join(t.dir, '.buildfail'),
      `${new Date().toISOString()}\n${br} 에 합친 뒤 빌드가 깨졌다.\n\n${buildOut.slice(-4000)}\n`);
    // 1차로 돌려보낸다. 산출물을 지우면 dispatcher 가 다시 배정한다.
    for (const f of ['02-impl.md', '03-review.md', '03b-review.md'])
      fs.rmSync(path.join(t.dir, f), { force: true });
    let r = 0;
    try { r = Number(fs.readFileSync(path.join(t.dir, '.retry'), 'utf8').trim()) || 0; } catch {}
    fs.writeFileSync(path.join(t.dir, '.retry'), String(r + 1));
    say(`✗ ${label} — 합친 뒤 빌드가 깨졌다. 병합 되돌리고 1차로 돌려보냈다 (${r + 1}회)`);
    failed++; continue;
  }

  const after = git(['-C', MERGE_WT, 'rev-parse', '--short', 'HEAD']);
  fs.writeFileSync(path.join(t.dir, '.merged'),
    `${new Date().toISOString()}\t${br}\t${after}\n`);

  /* 04-decision.md 를 남긴다. 무엇을 근거로 닫았는지가 파일로 남아야 한다.
     로그는 재시작하면 사라진다. */
  fs.writeFileSync(path.join(t.dir, '04-decision.md'),
    `# 판정 · ${m.parent} › ${m.title}\n\n`
    + `_${new Date().toISOString().slice(0, 16).replace('T', ' ')} · ${t.id}_\n\n`
    + `## 판정\n\n**PASS — 통합브랜치에 병합함.**\n\n`
    + `| 항목 | 결과 |\n|---|---|\n`
    + `| 2차 검증 (빌드·조문 대조) | PASS |\n`
    + `| 3차 리뷰 (규격의 뜻·통일성) | PASS |\n`
    + `| 병합 뒤 \`npm run build\` | 통과 |\n`
    + `| 되돌린 횟수 | ${t.retries}회 |\n\n`
    + `## 어디로 갔나\n\n`
    + `\`${m.branch}\` → \`${br}\` (${after})\n\n`
    + `**main 병합은 하지 않았다.** main 에 들어가면 즉시 배포되어 학습자가 보는\n`
    + `화면이 바뀐다. 과목이 끝나면 \`${br}\` 에서 PR 하나를 올려 박 목사님께\n`
    + `검토를 요청한다. (위임 범위: 통합브랜치까지 자동 · 2026-08-27)\n\n`
    + `## 근거 문서\n\n`
    + `- \`02-impl.md\` 구현 요약\n- \`03-review.md\` 2차 검증\n- \`03b-review.md\` 3차 리뷰\n`);

  // 끝난 과제의 작업 트리를 치운다. 126개까지 불어나면 디스크가 남지 않는다.
  const wt = path.join(WTROOT, t.id);
  if (fs.existsSync(wt)) {
    try { fs.rmSync(path.join(wt, 'node_modules'), { force: true }); } catch {}
    gitQuiet(['-C', ROOT, 'worktree', 'remove', '--force', wt]);
  }

  say(`✔ ${label} → ${br} (${after})`);
  ok++;
}

say(`♦ 병합 ${ok}건 · 실패 ${failed}건`);
