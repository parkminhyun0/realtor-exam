#!/bin/bash
# 공급 감독관 상주 루프. 일감이 마르기 전에 다음 배치를 연다.
set -u
cd "$(dirname "$0")/../.." || exit 1
VIEW="/Users/parkminhyeon/.claude/jobs/46e38b12/tmp/stream-view.mjs"
# 큐를 얼마나 깊게 유지할지. 고정 20 을 쓰던 앞 판본은 큐가 마르는 순간 열
# 패널이 동시에 놀았다 — 20건은 열 패널이 몇 분이면 비우는데, 다음 배치를
# 여는 데 걸리는 시간을 계산에 넣지 않았기 때문이다.
# plan.mjs 가 실측 속도(작업당 몇 분)와 패널 수로 목표 깊이를 낸다.
plan_low() {
  local v
  v="$(node -e 'try{console.log(require("./.pipeline/dispatch/plan.json").queue.target)}catch{console.log("")}' 2>/dev/null)"
  case "$v" in ''|*[!0-9]*) echo "${SUPPLY_LOW:-20}" ;; *) echo "$v" ;; esac
}
LOW="$(plan_low)"
while [ ! -f .pipeline/dispatch/STOP ]; do
  n="$(awk -F'\t' 'NF{print $4}' .pipeline/dispatch/jobs.tsv 2>/dev/null |
       while IFS= read -r o; do [ -f "$o" ] || echo x; done | wc -l | tr -d ' ')"
  # 미완 배치 상한. "앞 배치를 끝내는 것이 새 배치를 여는 것보다 먼저" 라는
  # 규칙을 프롬프트로만 두었더니 지켜지지 않아, b09 가 감사 중인데 b11·b12 가
  # 열려 미완 배치가 넷 쌓였다. 규칙을 코드에 둔다.
  wip="$(ls -d .pipeline/task*/ 2>/dev/null | while IFS= read -r d; do
           [ -n "$(ls "$d"input/shard-*.json 2>/dev/null)" ] || continue
           [ -f "$d"final.json ] || echo x
         done | wc -l | tr -d ' ')"
  # 새 배치 개설은 사람이 열어 줄 때만 한다 (2026-08-23 박 목사님 지시).
  # 한 과정이 끝나면 다음으로 넘어가지 말고 멈춰 서서 대기한다.
  # 열려면: touch .pipeline/dispatch/OPEN_NEXT
  if [ ! -f .pipeline/dispatch/OPEN_NEXT ]; then
    echo "$(date '+%H:%M:%S') 대기 — 새 배치는 OPEN_NEXT 표식이 있을 때만 연다"
  elif [ "$wip" -ge "${SUPPLY_WIP_CAP:-5}" ]; then
    echo "$(date '+%H:%M:%S') 미완 배치 ${wip}개 · 상한(${SUPPLY_WIP_CAP:-5}) 도달 — 앞 배치를 먼저 끝낸다"
  elif [ "$n" -lt "$(plan_low)" ]; then
    echo "--- $(date '+%H:%M:%S') 남은 ${n}건 (목표 $(plan_low)) · 공급 감독관 호출 ---"
    codex exec --sandbox workspace-write --skip-git-repo-check \
      "$(cat .pipeline/dispatch/supervisor-supply.txt)" 2>&1 | node "$VIEW" '공급감독'
  else
    echo "$(date '+%H:%M:%S') 남은 ${n}건 / 목표 $(plan_low)건 · 공급 충분"
  fi
  sleep 20
done
