#!/bin/bash
# 단계 전환 상주 루프.
#
# 감독관 모델에게 "이럴 땐 이걸 해라"를 지시문으로 적어 두었지만 지켜지지
# 않았다. 2026-08-22 하루에 여섯 번 멈췄고 그때마다 사람이 밀었다.
# 판단이 필요 없는 일이므로 코드가 한다.
#
# advance.mjs 는 배치 상태를 보고 다음 단계 하나를 실행하거나 큐에 넣는다.
# 한 번에 배치 하나씩만 넘긴다 — 한꺼번에 밀면 어디서 틀어졌는지 알기 어렵다.
set -u
cd "$(dirname "$0")/../.." || exit 1

POLL="${ADVANCE_POLL:-60}"
LOCK=".pipeline/dispatch/advance.lock"

# 한 번에 하나만 돈다.
if [ -f "$LOCK" ]; then
  old="$(cat "$LOCK" 2>/dev/null)"
  if [ -n "$old" ] && kill -0 "$old" 2>/dev/null; then
    echo "이미 단계 전환 루프가 돌고 있다 (PID $old). 종료한다."; exit 0
  fi
fi
echo $$ >"$LOCK"
trap 'rm -f "$LOCK"' EXIT INT TERM

echo "=== 단계 전환 루프 시작 · ${POLL}초 주기 ==="
while [ ! -f .pipeline/dispatch/STOP ]; do
  # 지시가 없으면 단계도 넘기지 않는다 (2026-08-23 박 목사님 지시).
  # 켜려면: touch .pipeline/dispatch/ADVANCE_ON
  if [ ! -f .pipeline/dispatch/ADVANCE_ON ]; then
    echo "$(date '+%H:%M:%S') 대기 — 단계 전환은 ADVANCE_ON 표식이 있을 때만"
    sleep "$POLL"; continue
  fi
  out="$(node .pipeline/dispatch/advance.mjs 2>&1)"
  case "$out" in
    *"넘길 단계 없음"*) echo "$(date '+%H:%M:%S') 넘길 단계 없음" ;;
    *) echo "--- $(date '+%H:%M:%S') ---"; echo "$out" ;;
  esac
  sleep "$POLL"
done
echo "단계 전환 루프 종료 (STOP)"
