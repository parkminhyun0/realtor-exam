#!/usr/bin/env node
/* 남은 일을 세고, 처리 속도를 재고, 거꾸로 계산한다.
 *
 * ── 왜 있나 ────────────────────────────────────────────────────────
 * 지금까지는 "큐가 20건 아래면 다음 배치를 연다" 같은 **고정 숫자**로 돌렸다.
 * 그래서 두 가지가 반복됐다.
 *   · 큐가 마르는 순간 열 패널이 동시에 놀았다. 20건은 열 패널이 몇 분이면
 *     비운다. 다음 배치를 여는 데 걸리는 시간을 계산에 넣지 않았다.
 *   · 전체가 얼마나 남았는지 아무도 몰랐다. 배치 하나가 끝나면 그때 가서
 *     다음을 생각했다.
 *
 * 이 스크립트는 남은 후보 수 → 필요한 배치 수 → 필요한 작업 수 → 실측 속도로
 * 나눈 남은 시간을 낸다. 그리고 **큐를 얼마나 깊게 유지해야 패널이 안 노는지**
 * 를 계산해 공급 감독관이 쓸 수 있게 남긴다.
 *
 * 사용: node .pipeline/dispatch/plan.mjs [--quiet]
 * 산출: .pipeline/dispatch/plan.json · .pipeline/relay/ROADMAP.md
 */
'use strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const D = path.join(ROOT, '.pipeline/dispatch');
const QUIET = process.argv.includes('--quiet');
const read = (p, d = '') => { try { return fs.readFileSync(p, 'utf8'); } catch { return d; } };

/* ── 1. 범위: 얼마나 남았나 ─────────────────────────────────────── */
const allocated = new Set(read(path.join(D, 'allocated.tsv')).split('\n')
  .map((l) => l.split('\t')[0].trim()).filter(Boolean));
const rangesDir = path.join(ROOT, '.pipeline/gap-survey/ranges');
const ranges = [];
if (fs.existsSync(rangesDir)) {
  for (const f of fs.readdirSync(rangesDir).filter((x) => x.endsWith('.json')).sort()) {
    const j = JSON.parse(read(path.join(rangesDir, f), '{"items":[]}'));
    const items = j.items || [];
    const left = items.filter((i) => !allocated.has(i.strong)).length;
    ranges.push({ file: f, name: j.name || f, why: j.why || '', total: items.length, left });
  }
}
const leftItems = ranges.reduce((a, r) => a + r.left, 0);

/* ── 2. 배치 한 개가 무엇을 필요로 하는가 ────────────────────────
   실제로 등록된 작업을 세어 얻는다. 손으로 적어 두면 단계가 바뀔 때 틀어진다.
   제안 12(4모델×3셰이드) + 판정 4 + 감사 4 + 재감사 1 = 21 이 지금 값이다. */
const BATCH_SIZE = 300;
const jobsByBatch = {};
for (const line of read(path.join(D, 'jobs.tsv')).split('\n')) {
  const f = line.split('\t');
  if (f.length !== 4) continue;
  const m = /^b(\d+)/.exec(f[1] || '');
  if (m) (jobsByBatch[m[1]] ||= []).push(f);
}
const counts = Object.values(jobsByBatch).map((v) => v.length).filter((n) => n >= 12);
const jobsPerBatch = counts.length
  ? Math.round(counts.reduce((a, b) => a + b, 0) / counts.length)
  : 21;

/* ── 3. 실측 속도 ───────────────────────────────────────────────
   dispatch.log 의 '완료' 대신 **산출 파일의 mtime** 을 쓴다. 로그는 재시작마다
   잘리지만 파일은 남는다. 최근 것부터 본다 — 오래된 속도는 지금과 다르다. */
const outs = [];
for (const line of read(path.join(D, 'jobs.tsv')).split('\n')) {
  const f = line.split('\t');
  if (f.length !== 4) continue;
  const p = path.join(ROOT, f[3]);
  try { outs.push(fs.statSync(p).mtimeMs); } catch { /* 아직 안 나옴 */ }
}
outs.sort((a, b) => a - b);
const WINDOW_H = 6;
const since = Date.now() - WINDOW_H * 3600e3;
const recent = outs.filter((t) => t >= since);
/* 창 안에서 실제로 일한 시간으로 나눈다. 밤새 멈춰 있던 구간을 속도에 넣으면
   실제보다 느리게 나와 남은 시간이 부풀려진다. */
const span = recent.length >= 2 ? (recent.at(-1) - recent[0]) / 3600e3 : 0;
const jobsPerHour = span > 0.05 ? recent.length / span : 0;

/* ── 4. 역산 ────────────────────────────────────────────────────── */
const batchesLeft = Math.ceil(leftItems / BATCH_SIZE);
const jobsLeft = batchesLeft * jobsPerBatch;
const hoursLeft = jobsPerHour > 0 ? jobsLeft / jobsPerHour : null;

/* 큐를 얼마나 깊게 둘 것인가.
   패널 수만큼만 두면 마지막 하나가 끝나는 순간 전부 논다. 다음 배치를 여는 데
   걸리는 시간(모델 호출 한 번 + 셰이드 나누기, 대략 2분) 동안 패널이 소비할
   양을 더한다. 한 작업이 평균 몇 분 걸리는지는 실측에서 온다. */
const panels = (read(path.join(D, 'panels.env')).match(/WORKER_SURFACES="([^"]*)"/) || [, ''])[1]
  .split(/\s+/).filter(Boolean).length || 10;
const minutesPerJob = jobsPerHour > 0 ? 60 / (jobsPerHour / panels) : 0;
const OPEN_LEAD_MIN = 3;             // 다음 배치를 여는 데 걸리는 시간
const queueTarget = minutesPerJob > 0
  ? Math.max(panels * 2, Math.ceil(panels * (1 + OPEN_LEAD_MIN / minutesPerJob)))
  : panels * 2;

const plan = {
  updatedAt: new Date().toISOString(),
  scope: { leftItems, batchSize: BATCH_SIZE, batchesLeft, jobsPerBatch, jobsLeft },
  ranges,
  throughput: { windowHours: WINDOW_H, doneInWindow: recent.length,
                activeHours: Number(span.toFixed(2)), jobsPerHour: Number(jobsPerHour.toFixed(1)),
                minutesPerJob: Number(minutesPerJob.toFixed(1)), panels },
  eta: { hoursLeft: hoursLeft == null ? null : Number(hoursLeft.toFixed(1)),
         finishBy: hoursLeft == null ? null : new Date(Date.now() + hoursLeft * 3600e3).toISOString() },
  queue: { target: queueTarget,
           why: `패널 ${panels}개 × (지금 도는 것 + 다음 배치 여는 ${OPEN_LEAD_MIN}분 동안 소비할 양)` },
};
fs.writeFileSync(path.join(D, 'plan.json'), `${JSON.stringify(plan, null, 2)}\n`);

/* ── 5. 사람이 읽는 표 ──────────────────────────────────────────── */
const hh = (h) => (h == null ? '측정 중' : h < 24 ? `${h.toFixed(1)}시간` : `${(h / 24).toFixed(1)}일`);
const md = `# 남은 일 · 역산

_감시견이 다시 쓴다. 갱신 ${plan.updatedAt.slice(0, 19).replace('T', ' ')}_

## 전체

| | |
|---|---|
| 남은 후보 | **${leftItems.toLocaleString()}개** |
| 남은 배치 | **${batchesLeft}개** (배치당 ${BATCH_SIZE}개) |
| 남은 작업 | **${jobsLeft.toLocaleString()}건** (배치당 ${jobsPerBatch}건 — 제안·판정·감사·재감사) |
| 실측 속도 | 시간당 ${plan.throughput.jobsPerHour}건 (최근 ${WINDOW_H}시간 중 실제 가동 ${plan.throughput.activeHours}시간, ${recent.length}건) |
| 남은 시간 | **${hh(hoursLeft)}** ${plan.eta.finishBy ? `· 예상 완료 ${plan.eta.finishBy.slice(0, 16).replace('T', ' ')}` : ''} |

## 범위별

| 범위 | 총량 | 남음 | 배치 | 설명 |
|---|---|---|---|---|
${ranges.map((r) => `| ${r.name} | ${r.total.toLocaleString()} | **${r.left.toLocaleString()}** | ${Math.ceil(r.left / BATCH_SIZE)} | ${r.why.slice(0, 40)} |`).join('\n')}

범위는 파일 이름 순서로 소진된다. 앞 범위가 마르면 다음으로 저절로 넘어간다.

## 큐를 얼마나 깊게 둘 것인가

- 목표 **${queueTarget}건**
- 근거: ${plan.queue.why}
- 작업 하나에 평균 ${plan.throughput.minutesPerJob}분 · 패널 ${panels}개

패널 수만큼만 두면 마지막 하나가 끝나는 순간 전부 논다. 다음 배치를 여는
동안 소비할 양을 더해 둔다. 공급 감독관은 이 값을 기준으로 삼는다.
`;
fs.mkdirSync(path.join(ROOT, '.pipeline/relay'), { recursive: true });
fs.writeFileSync(path.join(ROOT, '.pipeline/relay/ROADMAP.md'), md);

if (!QUIET) {
  console.log(`  남은 후보 ${leftItems} · 배치 ${batchesLeft} · 작업 ${jobsLeft}`);
  console.log(`  속도 시간당 ${plan.throughput.jobsPerHour}건 · 남은 시간 ${hh(hoursLeft)}`);
  console.log(`  큐 목표 ${queueTarget}건 (패널 ${panels})`);
}
