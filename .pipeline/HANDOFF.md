# 인수인계 — 이어받는 사람에게

_2026-08-27 새벽. Claude(0-lead)가 남긴다. 박 목사님이 "GPT로 승계" 지시._

## 한 줄

`realtor-exam` 여섯 과목 학습 페이지를 **하나의 규격으로 통일**하는 파이프라인이
`workspace:8 「📐 규격 통일 병렬」` 에서 **지금 돌고 있다.** 대상 126단원.

## 지금 무엇이 도나

| 패널 | 프로세스 | 하는 일 |
|---|---|---|
| 🚦 디스패처 | `dispatcher.sh` | 유휴 패널에 큐의 다음 일을 물린다 |
| ⏭ 단계 전환 | `advance-loop.sh` | 45초마다 `advance.mjs` — 1차→2차→3차, FAIL 이면 되돌리기 |
| 🐕 감시견 | `watchdog.sh` | 45초마다 데몬 부활 · 패널 색칠 · **병합** · **단원 공급** |
| 🧾 세법 작업 | `tax-lane.sh` | 세법 9단원을 law.go.kr 조문 근거로 집필 (독립 루프) |
| 일꾼 10 | — | 디스패처가 물리는 칸 |

**멈추려면** `touch .pipeline/dispatch/STOP` (세법만: `TAX_STOP`).
**재개는** 표식을 지우고 감시견을 띄우면 나머지 데몬이 스스로 선다.

## 규격은 한 곳에만 있다

`.pipeline/SPEC.md` **이것이 유일한 기준이다.** 프롬프트에 베껴 넣지 마라.

- §1 내용·형식 — 공법에서 온 **여덟 조각**
- §2 카테고리 — 세법에서 온 **4단계** (카테고리→대분류→중분류→소분류)
- §3 계산문제 — 학개론에서 온 **열한 필드 카드** (`calculator` 필수)
- §4 **지어내지 않는다** — 근거 없는 숫자는 뺀다. 가장 무거운 규칙
- §5 **시험 대비 수준** — 이것만 보고 시험장에 들어갈 수 있어야 한다

역할·폴백·절대규칙은 `.pipeline/ROLES.md`.

## 3차 구조

```
01-plan(0-lead) → 02-impl(1차) → 03-review(2차) → 03b-review(3차) → 04-decision(0-lead)
```

**완료는 산출 파일의 존재로만 판정한다.** 로그로 판정하지 마라.
FAIL 이면 1차로 되돌리고 **최대 3회**. 사유는 `feedback-N.md` 로 보존된다.

계열은 과제 번호로 **회전**한다(`advance.mjs` 의 `modelFor`). 한 과제 안에서는
세 차가 항상 다른 계열이다 — 구현한 계열이 자기 것을 검증하지 않게.

## 병합 위임 범위 (박 목사님, 2026-08-27)

```
단원 브랜치 ──자동──▶ integration/<과목> ──**사람**──▶ main ──▶ 배포
```

조건: **2차 PASS 그리고 3차 PASS.** `merge-lane.mjs` 가 한다.
**main 에는 절대 자동으로 넣지 마라.** main = 즉시 배포다.
과목이 끝나면 통합브랜치에서 PR 하나를 올려 박 목사님께 검토를 요청한다.

## 지금 상태에서 알아야 할 것

- **Gemini(agy) 쿼터 소진** — 2026-08-28 낮까지. `CAP_AGY` 는 4지만 실제 0.
- **claude 를 아껴야 한다** — 0-lead 세션이 같은 계정을 쓴다. `CAP_CLAUDE=1`
  로 낮췄고 세법 레인도 codex 로 승계했다. **codex 쿼터는 따로다.**
- 열린 PR: **#33**(배포 경로 정리) · **#34**(파이프라인). 둘 다 Draft.
  #34 는 #33 위에 쌓여 있으니 #33 먼저 병합.
- `.worktrees/<taskN>` 은 과제마다 하나. 끝나면 자동으로 치운다.
  `.worktrees/_merge` 는 병합 전용.

## 자주 보는 명령

```bash
node .pipeline/dispatch/state.mjs              # 과제별 차수
node .pipeline/dispatch/merge-lane.mjs --status # 과목별 통합 현황
node .pipeline/dispatch/tax-lane.mjs --status   # 세법 9단원 진척
node .pipeline/dispatch/validate.mjs            # 못 쓸 산출물
tail -f .pipeline/dispatch/watchdog.log
```

## 손대면 안 되는 것

- `main` 에서 직접 작업 · `git add -A` · `git reset --hard`(파이프라인 폴더 살아 있을 때)
- 검증기를 통과시키려고 검증기 고치기
- `cmux-work-os` 호출 (샌드박스 밖, EPERM)
- `~/bible-mindmap-local` 의 음역 파이프라인 (멈춰 있음, 별개 과제)

## 막힌 것이 있으면

`node .pipeline/dispatch/state.mjs` 에 ⛔ 가 뜨거나 `.conflict`·`.buildfail`
파일이 있으면 사람(0-lead)이 봐야 한다. 억지로 풀지 마라.
