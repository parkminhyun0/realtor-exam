#!/bin/bash
# 0-lead 대행 루프.
#
# 0-lead(Claude)가 사용량 한도로 멈춰도 파이프라인이 서지 않게 한다.
# 작업 패널·디스패처·감독관은 이미 0-lead 세션과 무관하게 돌지만,
# **배치 파일 생성 · 검증 · Draft PR** 만은 0-lead 몫으로 남아 있었다.
# 그 마지막 한 칸을 이 루프가 맡는다.
#
# 모델은 Codex 를 먼저 쓰고, 두 번 실패하면 Gemini 로 넘긴다.
# 한 계열이 한도에 걸려도 다른 계열이 이어받게 하기 위해서다.
set -u
cd "$(dirname "$0")/../.." || exit 1

VIEW="/Users/parkminhyeon/.claude/jobs/46e38b12/tmp/stream-view.mjs"
POLL="${RELAY_POLL:-120}"
FAILS=0

ready_batch() {
  # final·감사4·재감사가 다 있고 아직 src 파일이 없는 배치가 있는가
  node -e '
    const { execSync } = require("child_process");
    let s; try { s = JSON.parse(execSync("node .pipeline/dispatch/state.mjs", { encoding: "utf8" })); }
    catch { process.exit(1); }
    const ready = (s.batches || []).filter(b => b.final && b.audits >= 4 && b.recheck && !b.srcFile);
    if (!ready.length) process.exit(1);
    ready.sort((a, b) => Number(a.batch) - Number(b.batch));
    console.log(`${ready[0].batch} ${ready[0].task}`);
  ' 2>/dev/null
}

while [ ! -f .pipeline/dispatch/STOP ]; do
  if [ -f .pipeline/dispatch/RELAY_PAUSE ]; then
    echo "$(date '+%H:%M:%S') 대기 중 — 앞 PR 이 처리되면 rm .pipeline/dispatch/RELAY_PAUSE"
    sleep "$POLL"; continue
  fi
  target="$(ready_batch)"
  if [ -z "$target" ]; then
    echo "$(date '+%H:%M:%S') PR 대상 없음 · 대기"
  else
    echo "--- $(date '+%H:%M:%S') PR 대상: batch $target · 0-lead 대행 호출 ---"
    if [ "$FAILS" -lt 2 ]; then
      codex exec --sandbox workspace-write --skip-git-repo-check \
        "$(cat .pipeline/dispatch/lead-relay.txt)" 2>&1 | node "$VIEW" '0-lead대행/Codex'
    else
      echo "Codex 가 ${FAILS}회 실패해 Gemini 로 넘긴다"
      agy --dangerously-skip-permissions --model gemini-3.1-pro-high --print-timeout 60m \
        --output-format stream-json -p "$(cat .pipeline/dispatch/lead-relay.txt)" 2>&1 \
        | node "$VIEW" '0-lead대행/Gemini'
    fi

    # PR 을 올렸으면 멈춰 선다 (2026-08-23 박 목사님 지시).
    # 한 과정이 끝나면 다음으로 자동으로 넘어가지 않는다. 사람이 병합하고
    # 다음을 열어 줄 때까지 기다린다.
    if [ -n "$(find .pipeline/dispatch/lead-relay-report.md -newermt '5 minutes ago' 2>/dev/null)" ]; then
      echo "PR 을 올렸다. 지시가 있을 때까지 대기한다 (RELAY_PAUSE)"
      touch .pipeline/dispatch/RELAY_PAUSE
    fi

    # 보고서가 갱신됐으면 성공으로 본다.
    if [ -n "$(find .pipeline/dispatch/lead-relay-report.md -newermt '5 minutes ago' 2>/dev/null)" ]; then
      FAILS=0
    else
      FAILS=$((FAILS + 1))
      echo "산출 보고서 없음 · 누적 실패 ${FAILS}회"
      [ "$FAILS" -ge 4 ] && { echo "4회 실패 · 박 목사님 확인 필요"; FAILS=2; }
    fi
  fi
  sleep "$POLL"
done
echo "0-lead 대행 루프 종료"
