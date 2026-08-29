# realtor-exam

2026 제37회 공인중개사 시험 핵심정리 웹 앱입니다.

## 목표

하나의 통합 대시보드 안에서 공인중개사 1·2차 과목을 동일한 학습 UI로 정리합니다.

### 1차
- 부동산학개론
- 민법 및 민사특별법

### 2차
- 공인중개사법령 및 중개실무
- 부동산공법
- 부동산공시법
- 부동산세법

## 콘텐츠 공통 규격

각 장·절은 아래 학습 흐름을 기준으로 확장합니다.

1. 핵심 한줄
2. 상세 이해
3. 핵심정리·비교표
4. 절차 인포그래픽
5. 함정 선지
6. 암기 포인트
7. 확인문제

## 개발

```bash
npm install
npm run dev
```

프로덕션 빌드:

```bash
npm run build
```

GitHub Pages 배포용 Vite base는 `/realtor-exam/`으로 설정되어 있습니다.

## AI 협업

AI로 저장소를 수정할 때는 먼저 루트의 [`AGENTS.md`](AGENTS.md)를 읽게 하세요.
Codex, Claude Code, Gemini CLI, Qwen Code, GitHub Copilot, Cursor, Windsurf,
Cline, Roo Code, Continue, Amazon Q, JetBrains Junie, Aider용 연결 파일이
포함되어 있어 어떤 도구로 들어와도 같은 작업·검증·배포 안전 기준을 사용합니다.
연결 파일은 `AGENTS.md`를 가리키기만 하고 규칙을 따로 담지 않습니다.

다른 AI에게 저장소를 넘기는 방법과 시작 프롬프트는
[`docs/AI_COLLABORATION.md`](docs/AI_COLLABORATION.md)에 정리되어 있습니다.
