# 다른 AI와 안전하게 작업하는 방법

이 저장소는 AI마다 서로 다른 프롬프트를 복사해 관리하지 않습니다. 루트의
`AGENTS.md`를 공통 기준으로 사용하고, 각 AI의 자동 인식 파일은 그 문서를
가리키기만 합니다.

## 지원 진입점

| 도구 | 처음 읽는 파일 |
|---|---|
| Codex · Jules · Zed 등 AGENTS.md 호환 에이전트 | `AGENTS.md` |
| Claude Code | `CLAUDE.md` → `AGENTS.md` |
| Gemini CLI | `GEMINI.md` → `AGENTS.md` |
| Qwen Code | `QWEN.md` → `AGENTS.md` |
| GitHub Copilot | `.github/copilot-instructions.md` → `AGENTS.md` |
| Cursor | `.cursor/rules/agents.mdc` → `AGENTS.md` |
| Windsurf | `.windsurf/rules/agents.md` → `AGENTS.md` |
| Cline | `.clinerules/01-agents.md` → `AGENTS.md` |
| Roo Code | `.roo/rules/01-agents.md` → `AGENTS.md` |
| Continue | `.continue/rules/agents.md` → `AGENTS.md` |
| Amazon Q Developer | `.amazonq/rules/agents.md` → `AGENTS.md` |
| JetBrains Junie | `.junie/guidelines.md` → `AGENTS.md` |
| Aider | `CONVENTIONS.md` → `AGENTS.md` |
| 기타 AI | 프롬프트에서 `AGENTS.md`를 먼저 읽도록 지정 |

진입점 파일에는 규칙을 적지 않습니다. `AGENTS.md`를 가리키기만 합니다. 규칙을
베껴 넣으면 반드시 한쪽만 고쳐집니다.

## 새 AI 도구를 추가하려면

1. 그 도구가 자동으로 읽는 파일 위치를 확인합니다.
2. 기존 진입점 파일 하나를 그대로 복사해 그 위치에 둡니다.
3. `AGENTS.md`의 `AI entry points` 표와 위 표에 한 줄씩 추가합니다.

## 전역 설정과 충돌할 때

저장소 지침이 각 AI의 전역·사용자 설정보다 우선합니다. 우선순위는
`AGENTS.md`의 `Instruction precedence`에 있고, 이미 정해 둔 것이 둘입니다.

- 전역 설정이 병합·배포를 상시 허용하더라도 이 저장소에서는 안 됩니다.
  `main` 병합은 곧바로 실제 페이지 배포로 이어지므로 매번 별도 승인이
  필요합니다.
- 전역 설정이 `cmux-work-os` 실행을 요구하더라도 이 저장소에서는 부르지
  않습니다. `.pipeline/ROLES.md`가 금지하고 있습니다.

## 여러 AI가 동시에 붙을 때

이 저장소에는 AI 간 잠금 파일이 없습니다. Git과 GitHub 상태로만 조율합니다.
브랜치를 만들기 전에 최신 `main`, 열린 PR, 원격 브랜치를 먼저 확인하고, 이미
같은 작업이 있으면 두 번째 브랜치를 만들지 말고 보고하게 하세요. 자기가 만들지
않은 브랜치는 건드리지 않는 것이 원칙입니다. 자세한 규칙은 `AGENTS.md`의
`Concurrent agents`에 있습니다.

## 다른 AI에게 주면 되는 정보

1. 저장소: `https://github.com/parkminhyun0/realtor-exam`
2. 실제 페이지: `https://parkminhyun0.github.io/realtor-exam/#/`
3. 바꾸려는 화면과 원하는 결과
4. 변경해도 되는 범위와 건드리면 안 되는 범위
5. 결과는 브랜치와 Draft PR로 제출하고 병합·배포하지 말라는 지시

아래 문장을 그대로 붙여 시작할 수 있습니다.

```text
이 작업을 시작하기 전에 저장소 루트의 AGENTS.md를 끝까지 읽고 따르세요.
콘텐츠를 수정한다면 .pipeline/SPEC.md와 docs/exam37-law-baseline.md도 읽으세요.
최신 main과 열린 PR을 먼저 확인하고, 중복되지 않는 작업 브랜치에서 최소 범위로
수정하세요. 관련 검증과 npm run build를 실행한 뒤 Draft PR을 만드세요.
main 병합과 배포는 하지 말고, 변경 파일·검증 결과·남은 위험을 보고하세요.

이번 요청: [여기에 바꾸려는 내용을 적으세요]
수정 허용 범위: [예: 대시보드 UI와 공통 CSS]
수정 금지 범위: [예: 법령 본문, 문제 데이터, 배포 워크플로]
```

## 권한이 없는 AI를 사용할 때

GitHub 쓰기 권한이 없으면 AI가 `main`을 직접 바꾸게 하지 말고 다음 중 하나를
받습니다.

- unified diff 패치
- 변경된 파일 전체
- 커밋 가능한 로컬 브랜치

그 결과를 권한이 있는 실행자가 다시 검증하고 Draft PR로 올립니다. 개인 토큰,
API 키, 쿠키는 프롬프트나 저장소 파일에 넣지 않습니다.

## 작업 유형별 추가 기준

- UI/UX: `AGENTS.md`의 Product invariants와 관련 UI audit를 확인합니다.
- 법령·세율·기한: `.pipeline/SPEC.md`와 `docs/exam37-law-baseline.md`를 따릅니다.
- 목차·데이터 구조: 기존 ID, 검색 인덱스, 4단계 내비게이션 연결을 보존합니다.
- CI·배포·AI 지침: 시스템/수동 변경으로 취급하고 자동 병합하지 않습니다.

## 완료 보고에서 확인할 것

- 어떤 브랜치와 Draft PR을 만들었는가
- 어느 파일과 화면이 달라졌는가
- 어떤 검증을 실행했고 모두 통과했는가
- 법적·시험 콘텐츠의 근거가 무엇인가
- 사람이 확인해야 할 화면이나 위험이 남았는가
- `main`과 실제 페이지가 아직 바뀌지 않았는가

