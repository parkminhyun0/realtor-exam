#!/bin/bash
# 패널이 셸로 돌아오면 다음 일을 즉시 물린다. 유휴 패널을 만들지 않는다.
#
# jobs.tsv 는 **지워지지 않는 작업 목록**이다. 큐에서 꺼내 버리던 앞 판본은
# 절전으로 죽은 작업 8건을 아무도 모르게 잃었다. 이제 산출 파일이 실제로
# 생겨야 완료로 본다. 배정하고 RETRY_AFTER 초가 지나도 파일이 없으면 다시
# 배정한다. 한도 소진처럼 조용히 끝나는 실패도 이 방식이면 되살아난다.
#
# jobs.tsv 형식 (탭 구분): model \t title \t promptfile \t outfile
#   model 이 "codex" 또는 legacy "claude" 면 Codex GPT 실행, 그 밖은 agy --model.
set -u
cd "$(dirname "$0")/../.." || exit 1

# 패널 배치는 panels.env 한 곳에서 읽는다. 스크립트마다 박아 두면 워크스페이스를
# 새로 짤 때 한쪽만 고쳐진다(2026-08-24 재편성에서 실제로 걸림).
[ -f .pipeline/dispatch/panels.env ] && . .pipeline/dispatch/panels.env
WS="${CMUX_WS:-workspace:8}"
JOBS=".pipeline/dispatch/jobs.tsv"
STATE=".pipeline/dispatch/inflight.tsv"   # outfile \t 배정시각 \t surface
LOG=".pipeline/dispatch/dispatch.log"
# 뷰어는 저장소 안에 둔다. 앞 판본은 0-lead 세션의 임시 폴더를 가리켜서
# 그 세션이 지워지면 스트림 출력이 통째로 사라졌다.
VIEW=".pipeline/dispatch/stream-view.mjs"
# 디스패처 자신이 앉은 패널은 일꾼으로 쓰지 않는다.
SURFACES="${WORKER_SURFACES:-19 20 21 22 24 25 26 27 28}"
SELF="${DISPATCHER_SURFACE:-18}"
# 모델이 100개 항목을 음역하는 데 보통 2~5분, 감사는 더 걸린다. 이 값이 짧으면
# 아직 돌고 있는 작업을 다른 패널에 중복 배정해 두 패널이 같은 일을 한다.
# 실제로 60초로 낮춰져 있어 b08 U 가 두 패널에서 동시에 돌았다.
# 패널이 셸로 돌아오면 어차피 즉시 재배정하므로(아래 is_idle 검사) 이 값은
# "패널이 멈춘 것처럼 보이지만 실은 돌고 있는" 경우의 안전망일 뿐이다. 길게 둔다.
RETRY_AFTER="${RETRY_AFTER:-1500}"
# 한 작업을 몇 번까지 시도할지. 계속 실패하는 작업이 유휴 패널을 전부 물고
# 늘어지는 것을 막는다. 상한에 닿으면 .dead 표시를 남기고 큐에서 뺀다.
MAX_TRIES="${MAX_TRIES:-6}"
ROOT="$PWD"

export CMUX_QUIET=1
touch "$JOBS" "$STATE"

# 모델 승계 — 실패하면 **다른 계열**로 넘긴다.
#
# 같은 계열끼리는 같은 오류를 공유하므로, 한 계열이 못 하는 일은 그 계열의
# 다른 모델도 대개 못 한다. 한도에 걸렸다면 더욱 그렇다.
# 실제로 GPT-OSS 가 실패했을 때 같은 GPT 계열인 Codex 로 넘어간 적이 있다.
ROSTER_FILE=".pipeline/dispatch/roster.tsv"

family_of() {
  awk -F'\t' -v m="$1" '$1==m {print $4; exit}' "$ROSTER_FILE" 2>/dev/null
}

# 한도로 쉬는 모델 대신 이 일을 할 수 있는 모델. 없으면 빈 문자열.
takeover_model() {
  local cur="$1" out="$2" fam done_fams="" pick=""
  fam="$(family_of "$cur")"
  # 제안 단계인가 — 산출 경로가 .../proposals/<셰이드>-<슬러그>.json 이다.
  case "$out" in
    */proposals/*)
      local dir base shard
      dir="${out%/*}"; base="${out##*/}"; shard="${base%%-*}"
      # 이 셰이드에 이미 제안을 낸 계열을 모은다.
      if [ -d "$dir" ]; then
        for f in "$dir/$shard"-*.json; do
          [ -e "$f" ] || continue
          local sl fm
          sl="${f##*/}"; sl="${sl#$shard-}"; sl="${sl%.json}"
          fm="$(awk -F'\t' -v s="$sl" '$2==s {print $4}' "$ROSTER_FILE")"
          [ -n "$fm" ] && done_fams="$done_fams $fm"
        done
      fi
      ;;
  esac
  while IFS=$'\t' read -r m sl nm f2; do
    [ -z "$m" ] && continue
    [ "$m" = "$cur" ] && continue
    cooling "$m" && continue
    [ -n "$fam" ] && [ "$f2" = "$fam" ] && continue
    case " $done_fams " in *" $f2 "*) continue ;; esac
    pick="$m"; break
  done <"$ROSTER_FILE"
  printf '%s' "$pick"
}

next_model() {
  local cur="$1" fam pick=""
  fam="$(family_of "$cur")"
  # 로스터에서 계열이 다른 모델을 순서대로 고른다.
  while IFS=$'\t' read -r model slug name family; do
    [ -z "$model" ] && continue
    [ "$model" = "$cur" ] && continue
    [ -n "$fam" ] && [ "$family" = "$fam" ] && continue
    pick="$model"
    break
  done <"$ROSTER_FILE"
  # 로스터에 없는 모델이면 첫 줄로 보낸다.
  [ -z "$pick" ] && pick="$(awk -F'\t' 'NF{print $1; exit}' "$ROSTER_FILE")"
  [ -z "$pick" ] && pick="$cur"
  printf '%s' "$pick"
}

log() { printf '%s %s\n' "$(date '+%H:%M:%S')" "$*" >>"$LOG"; }
now() { date +%s; }

# 패널을 가리키는 말. 숫자면 자리 번호(surface:6), 대시가 있으면 UUID 다.
#
# 자리 번호는 cmux 가 재시작하면 다시 매겨진다. 2026-08-27 에 panels.env 의
# 번호가 통째로 어긋나 있었는데, 그 상태로는 **없는 패널에 명령을 쏘면서도
# 오류가 나지 않는다.** 그래서 sync-panels.mjs 가 UUID 를 적는다.
# 옛 번호도 그대로 받아 준다 — 손으로 띄울 때 쓰기 편하다.
sref() {
  case "$1" in
    surface:*) printf '%s' "$1" ;;
    *-*-*-*-*) printf '%s' "$1" ;;
    *)         printf 'surface:%s' "$1" ;;
  esac
}

is_idle() {
  local last
  last="$(cmux read-screen --workspace "$WS" --surface "$(sref "$1")" --lines 1 2>/dev/null | tail -1)"
  case "$last" in
    *'% '|*'%') return 0 ;;
    *) return 1 ;;
  esac
}

# 패널 배경색 → 지금 돌고 있는 모델. 열 패널이 나란히 있으면 제목만으로는
# 어느 것이 무슨 모델인지 한눈에 안 들어온다. 색이 계열을 알려 준다.
# 패널은 모델에 고정돼 있지 않다 — 디스패처가 유휴 패널 아무 데나 물리므로,
# 색도 배정할 때마다 바꾼다. OSC 11 은 터미널 배경색을 바꾸는 표준 시퀀스다.
# 글자가 읽히도록 아주 어두운 색만 쓴다.
color_of() {
  case "$1" in
    codex)  echo "#0e1c2e" ;;   # 짙은 파랑 — GPT 계열
    claude) echo "#2b1a10" ;;   # 짙은 주황 — Claude 계열
    *)      echo "#12241c" ;;   # 짙은 초록 — Gemini(agy) 계열
  esac
}

# 모델 → 공급원. 쿼터를 공유하는 것끼리 한 이름으로 묶는다.
source_of() {
  case "$1" in
    codex)  echo codex ;;
    claude) echo claude ;;
    *)      echo agy ;;        # gemini 계열은 전부 한 쿼터를 나눠 쓴다
  esac
}
cap_of() {
  case "$1" in
    codex)  echo "${CAP_CODEX:-3}" ;;
    claude) echo "${CAP_CLAUDE:-3}" ;;
    *)      echo "${CAP_AGY:-4}" ;;
  esac
}
# 지금 그 공급원으로 실제로 돌고 있는 작업 수. 산출물이 생겼거나 패널이
# 셸로 돌아온 것은 세지 않는다 — 그것은 이미 끝난 일이다.
inflight_count() {
  local want="$1" n=0 o t surf m
  # **산출물마다 마지막 행만** 센다. inflight.tsv 는 배정할 때마다 줄을 덧붙이는
  # 기록부라 같은 산출물이 여러 번 나온다(재배정·승계). 전부 세면 실제보다
  # 많게 나와 공급원 한도에 걸리고, 큐에 일이 있는데도 패널이 논다.
  # 2026-08-25 에 agy 가 실제 3인데 7로 세어져 열 패널 중 셋이 놀았다.
  while IFS=$'\t' read -r o t surf; do
    [ -n "$o" ] || continue
    [ -f "$o" ] && continue
    [ $(( $(now) - t )) -gt "$RETRY_AFTER" ] && continue
    is_idle "${surf#surface:}" && continue
    m="$(awk -F'\t' -v o="$o" '$4==o {print $1}' "$JOBS" | tail -1)"
    [ "$(source_of "$m")" = "$want" ] && n=$((n+1))
  done < <(awk -F'\t' 'NF>=3{a[$1]=$0} END{for(k in a) print a[k]}' "$STATE")
  echo "$n"
}

# 산출물이 아직 없고, 배정된 적 없거나 배정이 오래된 첫 작업을 고른다.
pick_job() {
  local line model title prompt out started
  while IFS= read -r line; do
    [ -n "$line" ] || continue
    model="$(printf '%s' "$line" | cut -f1)"
    title="$(printf '%s' "$line" | cut -f2)"
    prompt="$(printf '%s' "$line" | cut -f3)"
    out="$(printf '%s' "$line" | cut -f4)"
    [ -f "$out" ] && continue                       # 이미 끝난 일
    [ -f "$prompt" ] || { continue; }
    # 쿼터로 쉬는 모델의 일은 건너뛴다. 대체 실행은 하지 않는다 —
    # 한 모델이 여러 이름으로 다수결에 참여하면 교차검증이 형식만 남는다.
    # 기다리는 것이 옳다.
    if cooling "$model"; then
      # 한도·인증으로 쉬는 모델의 일을 다른 계열이 이어받는다.
      #
      # 왜 조건을 다는가: 이 작업의 정확도는 서로 다른 계열 넷이 **독립으로**
      # 보는 데서 나온다. 제안(음역안)은 그 넷을 모으는 단계라, 한 계열이 두
      # 몫을 하면 다수결이 형식만 남는다. 그래서 제안은 **그 셰이드를 아직
      # 맡지 않은 계열**에게만 넘긴다. 넘길 계열이 없으면 기다린다.
      #
      # 감사·재감사·분류처럼 독립 표본이 아닌 일은 아무 계열이나 이어받는다.
      # 밤새 사람 없이 도는 동안 한 계열이 한도에 걸렸다고 큐 전체가 서는 일을
      # 막는다(박 목사님 지시, 2026-08-25).
      alt="$(takeover_model "$model" "$out")"
      [ -z "$alt" ] && continue
      log "한도 승계: $title · $model → $alt"
      model="$alt"
      title="$title [$alt 한도승계]"
    fi
    # 공급원 한도 — 같은 쿼터를 쓰는 모델이 패널을 전부 물지 않게 한다.
    #
    # agy 는 gemini 계열 전부가 **한 쿼터**를 나눠 쓴다. codex 와 claude 는
    # 각자 따로다. 그래서 큐에 agy 작업이 연달아 있으면 열 패널이 모두 agy 를
    # 잡고, 하나의 분당 한도를 열이 나눠 쓰며 다 같이 굶는다. 그동안 codex·
    # claude 패널은 놀았다. 공급원마다 동시 실행 수를 묶고, 한도에 닿은
    # 공급원의 작업은 건너뛰어 뒤쪽의 다른 공급원 작업을 먼저 집는다.
    src="$(source_of "$model")"
    cap="$(cap_of "$src")"
    [ "$(inflight_count "$src")" -ge "$cap" ] && continue
    started="$(awk -F'\t' -v o="$out" '$1==o {print $2}' "$STATE" | tail -1)"
    assigned="$(awk -F'\t' -v o="$out" '$1==o {print $3}' "$STATE" | tail -1)"
    if [ -n "$started" ]; then
      elapsed=$(( $(now) - started ))
      # 배정한 패널이 셸로 돌아왔다면 그 실행은 끝났거나 실패한 것이다.
      # 산출물이 없으면 25분 기다릴 것 없이 바로 다시 돌린다.
      # (막 배정한 직후를 오판하지 않게 30초 유예를 둔다.)
      if [ "$elapsed" -lt 30 ]; then continue; fi
      if [ "$elapsed" -lt "$RETRY_AFTER" ]; then
        if [ -n "$assigned" ] && [ "$assigned" != "$(sref "$SELF")" ] && ! is_idle "${assigned#surface:}"; then continue; fi
      fi
    fi
    # 같은 일을 몇 번 배정했는지 센다. 두 번 넘게 실패하면 그 모델이
    # 한도에 걸렸거나 그 일을 못 하는 것이다. 다른 계열로 넘긴다.
    #
    # 프롬프트를 고친 시각 이후의 시도만 센다. 이력 전체를 세면, 프롬프트가
    # 잘못돼 실패한 이력이 영구히 남아 고친 뒤에도 즉시 .dead 가 다시 붙는다.
    # 실제로 b09 판정이 그렇게 되살아나지 못했다. 실패의 원인이 제거됐으면
    # 그 이전 실패는 이 일의 능력에 대한 증거가 아니다.
    pmtime="$(stat -f %m "$prompt" 2>/dev/null || echo 0)"
    tries="$(awk -F'\t' -v o="$out" -v m="$pmtime" '$1==o && $2+0>m' "$STATE" | wc -l | tr -d ' ')"
    if [ "$tries" -ge "$MAX_TRIES" ]; then
      if [ ! -f "$out.dead" ]; then
        printf '%s\t%s회 시도 후 포기\n' "$(date '+%F %T')" "$tries" >"$out.dead"
        log "포기: $title (${tries}회 실패) — $out.dead 남김. 0-lead 확인 필요"
      fi
      continue
    fi
    if [ "$tries" -ge 2 ]; then
      alt="$(next_model "$model")"
      if [ "$alt" != "$model" ] && ! cooling "$alt"; then
        log "모델 승계: $title · $model → $alt (${tries}회 실패)"
        model="$alt"
        title="$title [$alt 승계]"
      fi
    fi
    MODEL="$model"; TITLE="$title"; PROMPT="$prompt"; OUT="$out"
    [ -n "$started" ] && log "재배정(${RETRY_AFTER}s 안에 산출물 없음): $title"
    return 0
  done <"$JOBS"
  return 1
}


COOLDOWN=".pipeline/dispatch/cooldown.tsv"
[ -f "$COOLDOWN" ] || : >"$COOLDOWN"

# 모델이 쿼터로 쉬는 중인가. agy 로 도는 모델들은 **하나의 쿼터를 공유**하므로
# 하나가 걸리면 셋 다 걸린다. 그걸 모르고 배정하면 작업이 헛되이 소모되고,
# 실패 횟수가 쌓여 멀쩡한 작업이 .dead 로 죽는다. 실제로 그렇게 죽었다.
cooling() {
  local m="$1" until
  until="$(awk -F'\t' -v m="$m" '$1==m {print $2}' "$COOLDOWN" | tail -1)"
  [ -n "$until" ] || return 1
  [ "$(now)" -lt "$until" ]
}

# 패널 화면에서 쿼터 소진을 읽어 휴지기를 건다.
# 쿼터는 그 모델의 능력 문제가 아니므로 **이 시도는 실패로 세지 않는다** —
# 해당 배정 이력을 지워 작업이 처음 상태로 돌아가게 한다.
note_quota() {
  local surf="$1" screen out m secs h mi
  screen="$(cmux read-screen --workspace "$WS" --surface "$(sref "$surf")" --lines 12 2>/dev/null)"
  # 쿼터 소진과 네트워크 끊김은 원인이 다르지만 대응은 같다 — 그 모델의
  # 능력 문제가 아니므로 실패로 세지 않고 잠시 쉬게 한다. chatgpt.com 이
  # 끊겼을 때 codex 작업이 6회 실패로 .dead 가 될 뻔했다.
  #
  # 인증 만료(2026-08-25): 개발자 모드로 바꾸며 로그인 방식이 추가되자 codex 가
  # 강제 로그아웃됐다. 그냥 두면 실패로 세다가 .dead 로 죽고, 그 배치의 교차
  # 검증이 한 계열 얇아진 채 조용히 지나간다. 사람이 로그인해야 풀리는 일이므로
  # 길게 쉬게 하고 무엇을 해야 하는지 로그에 남긴다.
  case "$screen" in
    *"quota reached"*|*"stream disconnected before completion"*|*"failed to lookup address"*) ;;
    *"refresh token was revoked"*|*"401 Unauthorized"*|*"Please log out and sign in again"*)
      AUTH_EXPIRED=1 ;;
    *) return 1;;
  esac
  out="$(awk -F'\t' -v s="$(sref "$surf")" '$3==s {print $1}' "$STATE" | tail -1)"
  [ -n "$out" ] || return 1
  m="$(awk -F'\t' -v o="$out" '$4==o {print $1}' "$JOBS" | head -1)"
  [ -n "$m" ] || return 1
  h="$(printf '%s' "$screen" | sed -n 's/.*Resets in \([0-9]*\)h.*/\1/p' | tail -1)"
  mi="$(printf '%s' "$screen" | sed -n 's/.*Resets in [0-9]*h\([0-9]*\)m.*/\1/p' | tail -1)"
  secs=$(( ${h:-0} * 3600 + ${mi:-30} * 60 + 120 ))
  if [ "${AUTH_EXPIRED:-0}" = 1 ]; then
    secs=21600
    log "인증 만료: $m — 사람이 로그인해야 한다. 'codex login' 같은 로그인 후 .pipeline/dispatch/cooldown.tsv 에서 그 줄을 지워라."
    AUTH_EXPIRED=0
  fi
  # agy 로 도는 모델은 쿼터를 공유한다. 함께 쉬게 한다.
  case "$m" in
    codex|claude) printf '%s\t%s\n' "$m" "$(( $(now) + secs ))" >>"$COOLDOWN" ;;
    *) awk -F'\t' '$1!="codex" && $1!="claude" {print $1}' ".pipeline/dispatch/roster.tsv" \
         | while IFS= read -r am; do printf '%s\t%s\n' "$am" "$(( $(now) + secs ))" >>"$COOLDOWN"; done ;;
  esac
  # 이 시도는 없었던 것으로 한다.
  grep -v -F "$out	" "$STATE" >"$STATE.tmp" 2>/dev/null && mv "$STATE.tmp" "$STATE"
  rm -f "$out.dead"
  log "쿼터 휴지기 ${secs}초: $m (공유 쿼터 포함) — 이 시도는 실패로 세지 않는다"
  return 0
}

dispatch() {
  local surf="$1" label cmd
  label="$(printf '%s' "$TITLE" | tr ' ' '_')"

  # 모델은 지정된 그대로 돌린다. **대체 실행을 넣지 마라.**
  #
  # 한때 claude 를 codex exec 로 돌리고, agy 계열이 실패하면 Codex 가 대신
  # 하도록 고쳐진 적이 있다. 큐를 멈추지 않으려는 의도였지만 결과가 나빴다 —
  # 한 모델이 여러 이름으로 다수결에 참여해 교차검증이 형식만 남았다.
  # 이 작업의 품질은 서로 다른 계열이 독립으로 보는 데서 나온다.
  #
  # 모델이 실패하면 산출물이 안 생기고, 그러면 (a) 패널이 셸로 돌아와 즉시
  # 재배정되고 (b) 두 번 실패하면 next_model 이 **다른 계열로** 넘긴다.
  # 그 경로로 처리하라. 산출물의 출처는 언제나 표시된 모델이어야 한다.
  if [ "$MODEL" = "codex" ]; then
    cmd="cd $ROOT && codex exec --sandbox workspace-write --skip-git-repo-check \"\$(cat $PROMPT)\" 2>&1 | node $VIEW '$label'"
  elif [ "$MODEL" = "claude" ]; then
    cmd="cd $ROOT && claude --dangerously-skip-permissions --verbose --output-format stream-json -p \"\$(cat $PROMPT)\" 2>&1 | node $VIEW '$label'"
  else
    cmd="cd $ROOT && agy --dangerously-skip-permissions --model $MODEL --print-timeout 60m --output-format stream-json -p \"\$(cat $PROMPT)\" 2>&1 | node $VIEW '$label'"
  fi

  cmux rename-tab --workspace "$WS" --surface "$(sref "$surf")" "$TITLE" >/dev/null 2>&1
  # 배경색을 먼저 보낸다. 명령과 같은 줄에 붙이면 셸이 그 줄을 다시 그릴 때
  # 색이 섞여 보인다.
  cmux send --workspace "$WS" --surface "$(sref "$surf")" "printf '\\033]11;$(color_of "$MODEL")\\007'" >/dev/null 2>&1
  cmux send-key --workspace "$WS" --surface "$(sref "$surf")" Enter >/dev/null 2>&1
  cmux send --workspace "$WS" --surface "$(sref "$surf")" "$cmd" >/dev/null 2>&1
  cmux send-key --workspace "$WS" --surface "$(sref "$surf")" Enter >/dev/null 2>&1
  printf '%s\t%s\t%s\n' "$OUT" "$(now)" "$(sref "$surf")" >>"$STATE"
  log "dispatch $(sref "$surf") ← $TITLE"
}


remaining() {
  awk -F'\t' 'NF{print $4}' "$JOBS" | while IFS= read -r o; do [ -f "$o" ] || echo x; done | wc -l | tr -d ' '
}

log "=== dispatcher 시작 · 남은 작업 $(remaining)건 ==="
# 못 쓸 산출물은 지워 다시 돌게 한다. 파일만 있고 내용이 깨진 채 완료로
# 잡히던 자리를 막는다.
node .pipeline/dispatch/validate.mjs --fix >>"$LOG" 2>&1 || true

while [ ! -f .pipeline/dispatch/STOP ]; do
  for s in $SURFACES; do
    is_idle "$s" || continue
    note_quota "$s" && continue
    pick_job || break
    dispatch "$s"
    sleep 2
  done
  sleep 4
  tick=$(( ${tick:-0} + 1 ))
  if [ $(( tick % 15 )) -eq 0 ]; then
    node .pipeline/dispatch/validate.mjs --fix >>"$LOG" 2>&1 || true
  fi
done
log "=== STOP 감지 · dispatcher 종료 (남은 작업 $(remaining)건) ==="
