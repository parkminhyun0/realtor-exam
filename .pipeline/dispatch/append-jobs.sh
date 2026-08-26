#!/bin/bash
# jobs.tsv 에 안전하게 덧붙인다. 감독관이 둘이라 동시에 쓰면 줄이 섞인다.
# mkdir 은 원자적이라 락으로 쓴다.
set -u
cd "$(dirname "$0")/../.." || exit 1
LOCK=".pipeline/dispatch/.jobs.lock"
for i in $(seq 1 50); do
  if mkdir "$LOCK" 2>/dev/null; then
    trap 'rmdir "$LOCK" 2>/dev/null' EXIT
    cat >> .pipeline/dispatch/jobs.tsv
    exit 0
  fi
  sleep 0.2
done
echo "락 획득 실패 — 다른 감독관이 쓰는 중" >&2
exit 1
