#!/bin/bash
# 두 가지 사고를 스스로 되돌린다. 감시견이 주기마다 부른다.
#
# ── ① 일꾼이 만든 STOP ─────────────────────────────────────────────
# 2026-08-27 08:54, 일꾼 모델 하나가 "Paused by user request" 라고 적힌
# STOP 파일을 만들었다. 데몬 넷이 다 종료됐고 37분간 아무것도 안 돌았다.
# 사람이 볼 때까지 아무도 몰랐다.
#
# 진짜 정지는 표식 안에 LEAD-STOP 이 있어야 한다. 없으면 일꾼이 만든 것으로
# 보고 걷어낸다. **탐지는 수리가 아니다** — 찾기만 하고 두면 같은 일이 반복된다.
#
# ── ② 엉뚱한 자리에 쓴 산출물 ──────────────────────────────────────
# 절대경로를 줬는데 cd 뒤 상대경로로 만들어 worktree 안쪽에 생긴 것들.
# 열두 과제가 그랬고, 다음 차수가 "파일이 없다" 며 FAIL 을 냈다.
# 프롬프트로 막았지만 또 생길 수 있으니 여기서도 건져 올린다.
set -u
cd "$(dirname "$0")/../.." || exit 1

# ① STOP 점검
for f in .pipeline/dispatch/STOP .pipeline/dispatch/TAX_STOP; do
  [ -f "$f" ] || continue
  if ! grep -q "LEAD-STOP" "$f" 2>/dev/null; then
    printf '%s 일꾼이 만든 정지 표식을 걷어낸다: %s — 내용: %s\n' \
      "$(date '+%m-%d %H:%M:%S')" "$f" "$(head -c 120 "$f" | tr '\n' ' ')"
    mv "$f" "$f.rejected-$(date +%H%M%S)"
  fi
done

# ② 잘못된 자리의 산출물 회수
n=0
for w in .worktrees/task*/; do
  [ -d "$w" ] || continue
  t="$(basename "$w")"
  src="$w.pipeline/$t"
  [ -d "$src" ] || continue
  for f in 02-impl.md 03-review.md 03b-review.md; do
    [ -f "$src/$f" ] || continue
    dst=".pipeline/$t/$f"
    [ -d ".pipeline/$t" ] || continue
    if [ ! -f "$dst" ] || [ "$src/$f" -nt "$dst" ]; then
      cp "$src/$f" "$dst" && n=$((n+1))
    fi
  done
done
[ "$n" -gt 0 ] && printf '%s 엉뚱한 자리의 산출물 %d건 회수\n' "$(date '+%m-%d %H:%M:%S')" "$n"
exit 0
