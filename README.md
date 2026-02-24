# 별빛 타로 — AI 타로 리딩 웹 서비스

AI가 읽어주는 타로 카드 리딩 서비스.  
QLoRA 파인튜닝된 Qwen2.5-7B 모델을 백엔드로 사용합니다.

## 아키텍처

```
[사용자 브라우저]
    ↓
[Vercel: Next.js 14]
    ├── 프론트엔드 (React, Tailwind CSS)
    └── API Route (/api/tarot)
            ↓ HF 토큰 (서버사이드, 안전)
        [HuggingFace Gradio Space]
            └── Qwen2.5-7B (ZeroGPU)
```

## 기술 스택

- **프레임워크:** Next.js 14 (App Router)
- **스타일링:** Tailwind CSS
- **API 통신:** @gradio/client
- **배포:** Vercel
- **백엔드:** HuggingFace Spaces (Gradio + ZeroGPU)
- **다국어:** 자체 i18n 시스템 (한국어/영어)

## 로컬 개발

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경변수 설정

```bash
cp .env.local.example .env.local
```

`.env.local` 파일을 열고 HuggingFace 토큰을 입력합니다:

```
HF_TOKEN=hf_your_actual_token_here
HF_SPACE_URL=AutoBot000/tarot-reading
```

> HF 토큰은 https://huggingface.co/settings/tokens 에서 생성할 수 있습니다.  
> Private Space 접근을 위해 `read` 권한이 필요합니다.

### 3. 개발 서버 실행

```bash
npm run dev
```

http://localhost:3000 에서 확인합니다.

## Vercel 배포

### 방법 1: Vercel CLI

```bash
npm i -g vercel
vercel
```

### 방법 2: GitHub 연동 (권장)

1. 이 프로젝트를 GitHub 레포에 push
2. [vercel.com](https://vercel.com) 에서 GitHub 레포 import
3. **Environment Variables** 에 다음 추가:
   - `HF_TOKEN` = `hf_your_token`
   - `HF_SPACE_URL` = `AutoBot000/tarot-reading`
4. Deploy 클릭

### 배포 후 확인사항

- `https://your-project.vercel.app` 에서 서비스 확인
- 첫 요청 시 ZeroGPU cold start로 30~60초 소요될 수 있음
- Vercel Hobby 플랜(무료)의 Serverless Function 타임아웃은 60초

> **참고:** Vercel Hobby에서 타임아웃이 발생하면 Vercel Pro($20/월) 또는
> API Route의 `maxDuration`을 조정하세요.

## 프로젝트 구조

```
src/
├── app/
│   ├── layout.tsx          # 루트 레이아웃, 메타데이터
│   ├── page.tsx            # 메인 페이지 (상태 관리)
│   ├── globals.css         # 전역 스타일, 애니메이션
│   └── api/
│       └── tarot/
│           └── route.ts    # API 프록시 (HF 토큰 보안)
├── components/
│   ├── Starfield.tsx       # 별빛 배경 애니메이션
│   ├── Header.tsx          # 로고 + 타이틀
│   ├── ReadingForm.tsx     # 리딩타입 선택 + 질문 입력
│   ├── LoadingOverlay.tsx  # 로딩 화면 (순환 메시지)
│   ├── TarotCard.tsx       # 카드 3D 뒤집기 애니메이션
│   ├── ReadingResult.tsx   # 결과 표시 (카드 + 해석)
│   └── ErrorDisplay.tsx    # 에러 화면
├── lib/
│   └── i18n.ts             # 다국어 번역 시스템
└── types/
    └── index.ts            # TypeScript 타입 정의
```

## 다국어 지원

`src/lib/i18n.ts`에서 번역을 관리합니다.

```typescript
import { getTranslations } from '@/lib/i18n';

// 한국어 (기본값)
const t = getTranslations('ko');

// 영어
const t = getTranslations('en');
```

새 언어 추가 시:
1. `i18n.ts`의 `Locale` 타입에 언어 코드 추가
2. `translations` 객체에 해당 언어 번역 추가
3. 라우팅에 locale 파라미터 연결 (Next.js i18n 또는 path prefix)

## 커스텀 도메인 연결

Vercel 대시보드에서 간단히 설정 가능:
1. Settings → Domains → 도메인 입력
2. DNS 레코드를 Vercel이 안내하는 대로 설정
3. HTTPS 자동 적용

## 향후 개선 사항

- [ ] 실제 타로 카드 이미지 적용
- [ ] 영어 UI 라우팅 (`/en`)
- [ ] 리딩 히스토리 (localStorage)
- [ ] SNS 공유 기능
- [ ] 카드 뒤집기 사운드 이펙트
- [ ] PWA 지원
- [ ] SEO 최적화 (JSON-LD, sitemap)
