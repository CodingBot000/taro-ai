# 타로 - AI 타로 리딩 웹 서비스

허깅페이스 모델과 Spring Boot API를 사용하는 Next.js 프론트엔드입니다. 사용자는 질문 카테고리와 심화 질문을 선택하고, 카드를 뽑은 뒤 AI 리딩 결과를 확인합니다.

## 현재 아키텍처

```text
[사용자 브라우저]
    ↓
[Next.js Frontend]
    ↓
[Spring Boot API: api.heartsignal.cloud]
    ↓
[Hugging Face Gradio Space]
    └── Qwen2.5-7B (ZeroGPU)
```



## 기술 스택

- 프레임워크: Next.js 16 (App Router)
- 스타일링: Tailwind CSS
- API 통신: Spring Boot REST API
- 배포: 프론트엔드와 백엔드 분리 배포
- 백엔드: Spring Boot + Hugging Face Spaces (Gradio + ZeroGPU)
- 다국어: 자체 i18n 시스템 (한국어/영어 locale 전환)

## 로컬 실행

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

개발 서버는 `http://localhost:3100`에서 실행됩니다.

## 환경 변수

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

운영 배포에서는 `NEXT_PUBLIC_API_BASE_URL`을 실제 Spring Boot API 도메인으로 설정합니다.

## 검증 명령

```bash
npm run lint
npm test
npm run build
npm audit --audit-level=moderate
```

## 인증 정책

Google OAuth UI와 세션 복원 흐름은 포함되어 있지만, 현재 타로 생성 API는 비로그인 사용자도 사용할 수 있습니다. 생성 API를 로그인 필수로 바꾸는 작업은 별도 단계로 남겨둡니다.

## 공개 제출 전 확인

- `package-lock.json`을 함께 커밋해 의존성 버전을 고정합니다.
- 카드 이미지 출처와 사용 권한을 루트 `LICENSES.md`에 정리합니다.
- `.claude`, 로컬 env, 스크린샷 산출물은 공개 저장소에 포함하지 않습니다.
