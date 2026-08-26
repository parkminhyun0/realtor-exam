# 부동산공법 원본 보관

첨부받은 `public-law.html` 전체 원본은 GitHub 도구의 단일 요청 크기 제한을 피하기 위해 gzip + base64로 압축한 뒤 `public-law.html.gz.b64.*` 분할 파일로 보관합니다.

`npm run dev`와 `npm run build` 실행 전에 `scripts/build-public-law.mjs`가 분할본을 결합·검증하고 `public/public-law.html`로 복원합니다.

복원 검증 마커:
- 부동산공법 페이지 제목
- `c1s1` (제1장 제1절 총칙)
- `c6s3` (제6장 마지막 절)
- 12pt/14pt 통합 타이포그래피·반응형 규칙
