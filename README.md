# 타로 - AI 타로 리딩 웹 서비스

AI가 읽어주는 타로 카드 리딩 프론트엔드입니다.  
이 프로젝트는 Next.js UI를 제공하고, 타로 생성 요청은 별도 배포된 Spring Boot API로 직접 전송합니다.

## 현재 아키텍처

```text
[사용자 브라우저]
    ↓
[Next.js 14 Frontend]
    ↓
[Spring Boot API: api.heartsignal.cloud]
    ↓
[Hugging Face Gradio Space]
    └── Qwen2.5-7B (ZeroGPU)
```



## 기술 스택

- 프레임워크: Next.js 14 (App Router)
- 스타일링: Tailwind CSS
- API 통신: Spring Boot REST API
- 배포: 프론트엔드와 백엔드 분리 배포
- 백엔드: Spring Boot + Hugging Face Spaces (Gradio + ZeroGPU)
- 다국어: 자체 i18n 시스템 (한국어/영어)
