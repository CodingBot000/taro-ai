#  타로 — AI 타로 리딩 웹 서비스

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
