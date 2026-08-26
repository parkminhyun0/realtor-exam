#!/bin/bash
# 패널을 직무·상태에 따라 칠한다. 감시견이 주기마다 부른다.
#
# ── 왜 있나 ────────────────────────────────────────────────────────
# 열여섯 칸이 나란히 있으면 제목만으로는 무엇이 무엇인지 안 들어온다.
# 색이 세 가지를 말한다.
#   데몬   직무마다 고유색 (여섯)
#   일꾼   일하는 중이면 계열(색상)+차수(밝기), 노는 중이면 중립 회색
#
# 노는 칸이 회색으로 보이는 것이 중요하다. 앞 파이프라인에서 열 중 아홉이
# 네 시간 오십 분 동안 놀았는데 화면만으로는 알 수 없었다.
set -u
cd "$(dirname "$0")/../.." || exit 1
[ -f .pipeline/dispatch/panels.env ] || exit 0
. .pipeline/dispatch/panels.env
WS="${CMUX_WS:-}"
[ -n "$WS" ] || exit 0

paint() {
  cmux send --workspace "$WS" --surface "$1" "printf '\033]11;$2\007'" >/dev/null 2>&1
  cmux send-key --workspace "$WS" --surface "$1" Enter >/dev/null 2>&1
}

# 데몬 — 직무색. 죽었다 되살아나도 같은 색으로 돌아온다.
[ -n "${DISPATCHER_SURFACE_UUID:-}" ] && paint "$DISPATCHER_SURFACE_UUID" "#1a1030"
[ -n "${ADVANCE_SURFACE_UUID:-}" ]    && paint "$ADVANCE_SURFACE_UUID"    "#06231f"
[ -n "${SUPPLY_SURFACE_UUID:-}" ]     && paint "$SUPPLY_SURFACE_UUID"     "#241f08"
[ -n "${RELAY_SURFACE_UUID:-}" ]      && paint "$RELAY_SURFACE_UUID"      "#2a0f18"
[ -n "${SUPERVISOR_SURFACE_UUID:-}" ] && paint "$SUPERVISOR_SURFACE_UUID" "#10202c"
[ -n "${WATCHDOG_SURFACE_UUID:-}" ]   && paint "$WATCHDOG_SURFACE_UUID"   "#200a2a"

# 일꾼 — 노는 칸만 중립 회색으로. 일하는 칸은 디스패처가 배정할 때 칠했다.
idle=0
for s in ${WORKER_SURFACES:-}; do
  last="$(cmux read-screen --workspace "$WS" --surface "$s" --lines 1 2>/dev/null | tail -1)"
  case "$last" in
    *'% '|*'%')
      paint "$s" "#141414"
      cmux rename-tab --workspace "$WS" --surface "$s" "· 대기" >/dev/null 2>&1
      idle=$((idle+1)) ;;
  esac
done
echo "칠함 · 노는 일꾼 ${idle}칸"
