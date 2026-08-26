#!/bin/bash
# 세법 전용 레인 — 자기 패널에서 자기 루프로 돈다.
#
# dispatcher 를 거치지 않는다. 박 목사님이 "세법은 패널 하나에 배정하자"
# 하셔서 독립 탭으로 뺐다. 세법은 다른 과목과 성격이 다르다 — 있는 본문을
# 옮기는 것이 아니라 국가법령정보센터에서 현행 조문을 읽어 **없는 본문을
# 채우는** 일이라, 한 단원에 오래 걸리고 웹을 많이 본다. 큐에 섞으면 다른
# 과목의 짧은 작업들이 뒤에서 밀린다.
#
# 집필만 여기서 하고 **검증은 본 파이프라인이 한다.** 02-impl.md 가 생기면
# advance.mjs 가 평소처럼 2차·3차를 큐에 올린다. 지어내기가 가장 위험한
# 과제라 검증을 건너뛰지 않는다.
set -u
cd "$(dirname "$0")/../.." || exit 1

ROOT="$PWD"
VIEW=".pipeline/dispatch/stream-view.mjs"
LOG=".pipeline/dispatch/tax-lane.log"
# 기본을 codex(GPT)로 둔다. **쿼터가 계열마다 따로**이고, claude 쿼터는
# 0-lead 세션이 같은 계정으로 쓰고 있어 밤새 돌리면 둘 다 막힌다.
# 법령 조사는 law.go.kr 공개 API 를 curl 로 부르는 방식이라 계열을 안 탄다
# (2026-08-27 claude 가 이 경로를 찾아냈고, 같은 curl 을 codex 도 쓴다).
MODEL="${TAX_MODEL:-codex}"
POLL="${TAX_POLL:-30}"

log() { printf '%s %s\n' "$(date '+%H:%M:%S')" "$*" | tee -a "$LOG"; }

log "=== 세법 레인 시작 · 모델 $MODEL ==="
node .pipeline/dispatch/tax-lane.mjs --status 2>&1 | tee -a "$LOG"

while [ ! -f .pipeline/dispatch/STOP ] && [ ! -f .pipeline/dispatch/TAX_STOP ]; do
  task="$(node .pipeline/dispatch/tax-lane.mjs --next 2>>"$LOG")"
  if [ -z "$task" ]; then
    log "준비할 단원이 없다 — 세법 9단원을 모두 착수했거나 오류다. ${POLL}초 뒤 다시 본다."
    sleep "$POLL"; continue
  fi

  out=".pipeline/$task/02-impl.md"
  prompt=".pipeline/$task/prompt-impl.txt"

  if [ -f "$out" ]; then
    log "$task 는 이미 산출물이 있다. 다음으로 넘어간다."
    sleep 3; continue
  fi
  if [ ! -f "$prompt" ]; then
    log "$task 프롬프트가 없다 — tax-lane.mjs 가 만들지 못했다. ${POLL}초 대기."
    sleep "$POLL"; continue
  fi

  unit="$(node -e 'const m=require("'"$ROOT/.pipeline/$task/unit.json"'");console.log(m.parent+" › "+m.title)' 2>/dev/null)"
  log "▶ $task 집필 시작 · $unit"

  # 제목과 색을 여기서 직접 단다. 이 패널은 dispatcher 가 안 건드린다.
  cmux rename-tab --workspace "${CMUX_WS:-}" --surface "${TAX_SURFACE_UUID:-}" \
       "🧾 세법 작업 · $unit" >/dev/null 2>&1
  printf '\033]11;#2a1f05\007'      # 짙은 황토 — 세법 레인 고유색

  if [ "$MODEL" = "codex" ]; then
    codex exec --sandbox workspace-write --skip-git-repo-check \
         "$(cat "$prompt")" 2>&1 | node "$VIEW" "세법_${task}_집필"
  elif [ "$MODEL" = "claude" ]; then
    claude --dangerously-skip-permissions --verbose --output-format stream-json \
         -p "$(cat "$prompt")" 2>&1 | node "$VIEW" "세법_${task}_집필"
  else
    agy --dangerously-skip-permissions --model "$MODEL" --print-timeout 60m \
         --output-format stream-json -p "$(cat "$prompt")" 2>&1 | node "$VIEW" "세법_${task}_집필"
  fi

  if [ -f "$out" ]; then
    log "✔ $task 집필 끝 — 02-impl.md 생김. 검증은 본 파이프라인이 물린다."
  else
    log "✗ $task 산출물이 없다. ${POLL}초 뒤 같은 단원을 다시 돌린다."
    sleep "$POLL"
  fi
done
log "=== 세법 레인 종료 (STOP 표식) ==="
