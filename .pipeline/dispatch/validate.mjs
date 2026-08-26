#!/usr/bin/env node
/* 못 쓸 산출물을 걸러낸다.
 *
 * ── 왜 있나 ────────────────────────────────────────────────────────
 * 완료는 "파일이 있는가" 로 판정한다. 그러면 **파일만 있고 내용이 빈**
 * 산출물이 완료로 잡힌다. 실제로 겪은 것들:
 *
 *   · 모델이 죽으면서 0바이트 파일만 남김
 *   · 리뷰라면서 PASS/FAIL 을 안 적음 → 다음 차수가 무엇을 할지 모름
 *   · "다 했습니다" 한 줄만 적힌 요약 → 무엇을 했는지 알 수 없음
 *   · 프롬프트를 그대로 되뱉음 (치환이 실패했을 때 자주 나온다)
 *
 * 이런 파일은 지운다. 지우면 dispatcher 가 산출물이 없다고 보고 그 작업을
 * 다시 배정한다. **검증기를 통과시키려고 검증기를 고치지 마라** — 기준이
 * 틀렸다고 생각되면 0-lead 에게 말하고 기준을 고쳐라.
 *
 * 사용:
 *   node validate.mjs         무엇이 못 쓸 것인지 보기만 한다
 *   node validate.mjs --fix   실제로 지운다 (dispatcher 가 주기마다 부른다)
 */
'use strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const PIPE = path.join(ROOT, '.pipeline');
const FIX = process.argv.includes('--fix');

/* 최소 길이. 이보다 짧으면 무엇을 했는지 알 수 없다.
   넉넉히 잡는다 — 멀쩡한 산출물을 지우는 것이 빈 것을 남기는 것보다 나쁘다. */
const MIN = { '02-impl.md': 300, '03-review.md': 300, '03b-review.md': 300 };

/* 리뷰 문서는 판정을 적어야 한다. 안 적었으면 다음 차수가 갈 곳을 모른다.
   실제로 판정 없는 리뷰 때문에 45건이 판정 없이 남고 루프가 멈췄다. */
const NEEDS_VERDICT = new Set(['03-review.md', '03b-review.md']);

/* 아무것도 안 하고 끝냈다는 말들. 이것만 있으면 산출물이 아니다. */
const EMPTY_TALK = [
  /^\s*(다\s*했|완료|끝났|작업\s*완료|구현\s*완료|모두\s*처리)/,
  /^\s*(done|completed|finished|ok)\b/i,
];

/* 프롬프트를 그대로 되뱉은 경우. 치환 실패의 전형적인 증상이다. */
const ECHOED_PROMPT = [
  /작업\s*폴더는\s*현재\s*폴더다/,
  /ROLES\.md\s*와\s*01-plan\.md\s*를\s*읽고/,
  /\{\{[A-Z_]+\}\}/,          // 치환되지 않은 자리표시자가 남아 있다
];

const problems = [];

function check(dir, file) {
  const p = path.join(dir, file);
  let text;
  try { text = fs.readFileSync(p, 'utf8'); } catch { return; }

  const rel = path.relative(ROOT, p);
  const body = text.trim();

  if (!body) return problems.push([p, rel, '빈 파일']);
  if (body.length < (MIN[file] || 0))
    return problems.push([p, rel, `너무 짧다 (${body.length}자 < ${MIN[file]})`]);

  for (const re of ECHOED_PROMPT)
    if (re.test(body)) return problems.push([p, rel, '프롬프트를 되뱉었다 — 치환 실패 의심']);

  const firstLine = body.split('\n').find((l) => l.trim()) || '';
  if (body.split('\n').filter((l) => l.trim()).length <= 2)
    for (const re of EMPTY_TALK)
      if (re.test(firstLine)) return problems.push([p, rel, '"다 했다" 만 적혀 있다']);

  if (NEEDS_VERDICT.has(file) && !/\b(PASS|FAIL)\b/.test(body))
    return problems.push([p, rel, '판정(PASS/FAIL)이 없다']);
}

let dirs = [];
try {
  dirs = fs.readdirSync(PIPE).filter((n) => /^task\d+$/.test(n));
} catch {
  console.log('.pipeline/ 이 없다. 할 일 없음.');
  process.exit(0);
}

for (const d of dirs) {
  const dir = path.join(PIPE, d);
  for (const f of ['02-impl.md', '03-review.md', '03b-review.md']) check(dir, f);
}

if (!problems.length) {
  if (!FIX) console.log('못 쓸 산출물 없음.');
  process.exit(0);
}

for (const [abs, rel, why] of problems) {
  if (FIX) {
    fs.rmSync(abs, { force: true });
    console.log(`지움: ${rel} — ${why}`);
  } else {
    console.log(`못 씀: ${rel} — ${why}`);
  }
}
if (!FIX) console.log(`\n${problems.length}건. --fix 를 주면 지운다 (지우면 다시 배정된다).`);
