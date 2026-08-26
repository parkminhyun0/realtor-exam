#!/bin/bash
# 데몬 감시견 — 밤새 사람 없이 도는 동안 끊긴 것을 다시 세운다.
#
# 왜 필요한가: 데몬 다섯이 각자 패널에서 도는데, 죽으면 아무도 세우지 않았다.
# 2026-08-25 에 디스패처 파일이 지워졌는데도 프로세스만 살아 있어 겉으로는
# 정상이었고, 재시작하는 순간 파일이 없어 죽었다. 조용한 정지가 가장 나쁘다.
#
# 두 가지를 한다.
#   1. 데몬이 죽었으면 제 패널에서 다시 띄운다.
#   2. 인수인계 문서를 다시 쓴다(checkpoint.mjs).
#      2026-08-25, 0-lead 가 사용량 제한에 걸렸을 때 Codex 패널이 이어받지
#      못했다. 장치가 고장 난 게 아니라 넘겨받을 내용이 없었다 —
#      HANDOFF.md 는 "No handoff recorded.", NEXT_ACTION.md 는 이틀 묵은
#      다른 프로젝트 지시였다. 체크포인트를 0-lead 가 손으로 남기는 구조라,
#      갑자기 끊기면 남길 사람이 없었다. 그래서 감시견이 대신 남긴다.
#   3. .pipeline/dispatch/ 를 저장소 **밖에** 주기적으로 복사한다.
#      이 폴더는 gitignore 대상이라 git 이 지켜 주지 않는다. 그런데 여기에
#      기계(dispatcher·advance·health)와 원장(allocated.tsv)이 함께 있다.
#      원장을 잃으면 이미 끝낸 낱말을 다시 뽑는다(batch 18 이 그랬다).
set -u
cd "$(dirname "$0")/../.." || exit 1
. .pipeline/dispatch/panels.env

LOG=".pipeline/dispatch/watchdog.log"
BACKUP="$HOME/.pipeline-backup/bible-mindmap"
POLL="${WATCHDOG_POLL:-45}"   # 짧게 돈다. 노는 패널을 오래 두지 않는다.
SNAP_EVERY="${WATCHDOG_SNAP:-1800}"
last_snap=0
# 화면과 로그를 나눈다. 패널이 16개로 쪼개져 감시견 칸이 다섯 줄뿐이라,
# 일상적인 수리 기록까지 찍으면 심장 박동이 밀려 나가 화면이 뭉개진다.
# 사람이 볼 것은 '지금 살아 있고 이만큼 돌고 있다' 하나다. 나머지는 로그로.
log(){ printf '%s %s\n' "$(date '+%m-%d %H:%M:%S')" "$1" >>"$LOG"; }
say(){ printf '%s %s\n' "$(date '+%m-%d %H:%M:%S')" "$1" | tee -a "$LOG"; }

# 데몬 이름 → 실행 스크립트 · 패널
daemon_script(){ case "$1" in
  dispatcher) echo "dispatcher.sh" ;;  advance) echo "advance-loop.sh" ;;
  supply) echo "supply-loop.sh" ;;     relay) echo "lead-relay-loop.sh" ;;
  supervisor) echo "supervisor-loop.sh" ;; esac; }
# 패널을 가리키는 말 — 숫자면 자리 번호, 대시가 있으면 UUID.
# 자리 번호는 cmux 재시작마다 다시 매겨진다(2026-08-27 에 통째로 어긋났다).
sref() {
  case "$1" in
    surface:*) printf '%s' "$1" ;;
    *-*-*-*-*) printf '%s' "$1" ;;
    *)         printf 'surface:%s' "$1" ;;
  esac
}

daemon_surface(){ case "$1" in
  dispatcher) echo "$DISPATCHER_SURFACE" ;; advance) echo "$ADVANCE_SURFACE" ;;
  supply) echo "$SUPPLY_SURFACE" ;;         relay) echo "$RELAY_SURFACE" ;;
  supervisor) echo "$SUPERVISOR_SURFACE" ;; esac; }
daemon_title(){ case "$1" in
  dispatcher) echo "🚦 디스패처" ;; advance) echo "⏭ 단계 전환" ;;
  supply) echo "📦 공급 감독관" ;; relay) echo "🎖 0-lead 대행" ;;
  supervisor) echo "👁 진행 감독관" ;; esac; }

log "=== 감시견 시작 · ${POLL}초 주기 · 스냅샷 ${SNAP_EVERY}초 ==="
export CMUX_QUIET=1
while [ ! -f .pipeline/dispatch/STOP ]; do
  # 패널 배치를 살아 있는 cmux 에서 다시 읽는다. **데몬 되살리기보다 먼저** 한다 —
  # 배치가 어긋난 채로 되살리면 없는 패널에 명령을 쏘고, 오류 없이 아무 일도
  # 일어나지 않는다. 2026-08-27 에 panels.env 가 통째로 어긋나 있었다.
  # 실패하면(cmux 가 안 떠 있거나 워크스페이스를 못 찾음) 파일을 건드리지 않고
  # 지금 값 그대로 간다 — 빈 배치로 덮어쓰는 것이 어긋난 것보다 나쁘다.
  if [ -f .pipeline/dispatch/sync-panels.mjs ]; then
    if node .pipeline/dispatch/sync-panels.mjs --quiet >>"$LOG" 2>&1; then
      . .pipeline/dispatch/panels.env
    else
      log "패널 배치를 다시 읽지 못했다 — 지금 값으로 계속한다"
    fi
  fi

  # 패널을 직무·상태에 따라 칠한다. 노는 칸이 회색으로 보여야 한 눈에 든다.
  # (앞 파이프라인에서 열 중 아홉이 4시간 50분을 놀았는데 화면만으로는
  #  알 길이 없었다. 색이 그 자리를 메운다.)
  [ -f .pipeline/dispatch/paint.sh ] && bash .pipeline/dispatch/paint.sh >>"$LOG" 2>&1

  for d in dispatcher advance supply relay supervisor; do
    sc="$(daemon_script "$d")"; surf="$(daemon_surface "$d")"
    [ -n "$surf" ] || continue
    if ! pgrep -f "$sc" >/dev/null 2>&1; then
      if [ ! -f ".pipeline/dispatch/$sc" ]; then
        say "⚠ $d 스크립트가 없다: .pipeline/dispatch/$sc — 되살릴 수 없다. 사람이 봐야 한다."
        continue
      fi
      say "⚠ $d 죽어 있었다 → $(sref "$surf") 에서 다시 띄운다"
      cmux send --workspace "$CMUX_WS" --surface "$(sref "$surf")" \
        "printf '\033]2;$(daemon_title "$d")\007' && bash .pipeline/dispatch/$sc" >/dev/null 2>&1
      cmux send-key --workspace "$CMUX_WS" --surface "$(sref "$surf")" Enter >/dev/null 2>&1
      sleep 3
    fi
  done

  # 큐 수리 — 매 주기. 감독관 모델이 문자열 '\t' 로 줄을 넣으면 디스패처가
  # 그 줄을 통째로 버려 패널이 논다. 겉보기엔 큐에 일이 있어 보인다.
  if [ -f .pipeline/dispatch/repair.mjs ]; then
    r="$(node .pipeline/dispatch/repair.mjs 2>&1)"
    [ -n "$r" ] && log "$r"
  fi

  # 남은 일 역산 — 매 주기. 큐 목표 깊이를 여기서 낸다.
  [ -f .pipeline/dispatch/plan.mjs ] && node .pipeline/dispatch/plan.mjs --quiet 2>>"$LOG"

  # 인수인계 갱신 — 매 주기. 이것이 늦으면 이어받는 쪽이 옛 상태를 본다.
  if [ -f .pipeline/dispatch/checkpoint.mjs ]; then
    if ! node .pipeline/dispatch/checkpoint.mjs --quiet 2>>"$LOG"; then
      say "⚠ 인수인계 갱신 실패 — checkpoint.mjs 를 확인하라"
    fi
  fi

  nowts="$(date +%s)"
  if [ $(( nowts - last_snap )) -ge "$SNAP_EVERY" ]; then
    stamp="$(date '+%Y%m%d-%H%M%S')"
    mkdir -p "$BACKUP/$stamp"
    # 기계와 원장만 담는다. 로그·락·표식은 담지 않는다(용량과 잡음).
    for f in .pipeline/dispatch/*.sh .pipeline/dispatch/*.mjs .pipeline/dispatch/*.txt \
             .pipeline/dispatch/allocated.tsv .pipeline/dispatch/roster.tsv \
             .pipeline/dispatch/jobs.tsv .pipeline/dispatch/panels.env; do
      [ -e "$f" ] && cp -p "$f" "$BACKUP/$stamp/" 2>/dev/null
    done
    # 최근 12개만 남긴다
    ls -1dt "$BACKUP"/*/ 2>/dev/null | tail -n +13 | while IFS= read -r old; do rm -rf "$old"; done
    log "스냅샷 $BACKUP/$stamp ($(ls "$BACKUP/$stamp" | wc -l | tr -d ' ')개 파일)"
    last_snap="$nowts"
  fi
  # 리더 승계 — 일이 멈춰 있고 사람도 없으면 다음 모델에게 넘긴다.
  # 사람이 자리에 있으면 그 전에 손을 쓰므로 이 조건은 사람이 없을 때만 참이 된다.
  # STOP 표식이 있으면 발동하지 않는다(사람이 일부러 세운 것이다).
  if [ -f .pipeline/dispatch/handoff.mjs ] && [ ! -f .pipeline/dispatch/STOP ]; then
    if node .pipeline/dispatch/handoff.mjs --check >/dev/null 2>&1; then :; else
      hp="$(node .pipeline/dispatch/handoff.mjs 2>/dev/null)"
      case "$hp" in
        HANDOFF*)
          prov="$(printf '%s' "$hp" | head -1 | awk '{print $2}')"
          cmd="$(printf '%s' "$hp" | sed -n '2p')"
          say "🔁 리더 승계 → $prov · $(sref "${RELAY_SURFACE}") 에서 실행"
          cmux send --workspace "$CMUX_WS" --surface "$(sref "${RELAY_SURFACE}")" \
            "printf '\033]2;🔁 승계 리더 · $prov\007' && $cmd" >/dev/null 2>&1
          cmux send-key --workspace "$CMUX_WS" --surface "$(sref "${RELAY_SURFACE}")" Enter >/dev/null 2>&1
          sleep 10
          ;;
      esac
    fi
  fi

  # 심장 박동 — 매 주기 한 줄. 고칠 것이 없으면 아무 말도 안 하던 앞 판본은
  # 화면이 몇 분씩 비었고, 그러면 죽은 것과 구별되지 않는다. 이 저장소가 겪은
  # 실패의 대부분이 '조용한 정지' 였다. 아무 일 없어도 그 사실을 말한다.
  busy=0; idle=0
  for s_ in $WORKER_SURFACES; do
    last="$(cmux read-screen --workspace "$CMUX_WS" --surface "$(sref "$s_")" --lines 1 2>/dev/null | tail -1)"
    case "$last" in *"% "|*"$ ") idle=$((idle+1)) ;; *) busy=$((busy+1)) ;; esac
  done
  q="$(awk -F'\t' 'NF==4{print $4}' .pipeline/dispatch/jobs.tsv 2>/dev/null | while IFS= read -r o; do [ -f "$o" ] || echo x; done | wc -l | tr -d ' ')"
  eta="$(node -e 'try{const p=require("./.pipeline/dispatch/plan.json");console.log(p.eta.hoursLeft==null?"-":p.eta.hoursLeft+"h")}catch{console.log("-")}' 2>/dev/null)"
  printf '%s ♥ %s/%s 가동 · 큐%s · %s\n' "$(date '+%H:%M')" "$busy" "$((busy+idle))" "$q" "$eta"

  sleep "$POLL"
done
log "감시견 종료 (STOP)"
