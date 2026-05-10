# Taro AI Reading Service

질문 카테고리, 심화 질문, 카드 선택 흐름을 기반으로 AI 타로 리딩 결과를 제공하는 웹 서비스입니다.

이 저장소는 기존에 분리되어 있던 프론트엔드와 Spring Boot 백엔드를 하나의 GitHub 저장소에서 관리하기 위한 루트 저장소입니다.

## Architecture

```text
[Browser]
  -> [Next.js Frontend]
  -> [Spring Boot REST API]
  -> [Hugging Face Space / Gradio API]
```

프론트엔드는 Next.js App Router 기반입니다. 현재 Next.js API Routes는 사용하지 않으며, 브라우저는 `NEXT_PUBLIC_API_BASE_URL`로 설정된 Spring Boot API를 직접 호출합니다.

Hugging Face Space 코드는 이 GitHub 저장소에 포함하지 않습니다. Space는 Hugging Face 쪽에서 별도 저장소/배포 단위로 관리하고, 이 저장소의 백엔드는 환경변수로 설정된 Space API를 호출합니다.

## Features

- 질문 카테고리와 하위 카테고리 기반 입력 흐름
- 선택형 심화 질문을 통한 상담 맥락 수집
- 1장/3장 카드 선택 UI
- AI 리딩 생성 요청과 응답 품질 보정
- Google OAuth 로그인 흐름
- JWT access token 및 HttpOnly refresh token 처리
- CORS, 요청 출처 검증, IP 기반 rate limit
- PostgreSQL 인증 테이블과 Flyway migration
- 한국어/영어 UI locale 전환

## Tech Stack

| Area | Stack |
|---|---|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS, Vitest |
| Backend | Java 21, Spring Boot 3, Spring Security, JPA, Flyway |
| Database | PostgreSQL, H2 for tests |
| AI Inference | Hugging Face Space, Gradio API |
| Local Infra | Docker Compose |

## Repository Structure

```text
.
├── frontend/tarot-project   # Next.js frontend
├── backend                  # Spring Boot REST API
├── scripts                  # local development helper scripts
├── README.md
└── LICENSES.md
```

Excluded from this GitHub repository:

- `huggingface_space/`: managed separately by Hugging Face Space
- `docs/` directories: local notes and reports
- `.env*`: local secrets and runtime configuration
- generated model/training artifacts and local output directories

## Local Development

### Prerequisites

- Node.js 20+
- Java 21
- Docker and Docker Compose
- npm

### Backend

```bash
cd backend
cp .env.example .env
```

Fill `.env` with local values. Do not commit real secrets.

Required values for a full local run:

```bash
HF_SPACE_URL=
HF_TOKEN=
DB_PASSWORD=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
JWT_SECRET=
```

Start the database and backend with Docker Compose:

```bash
docker compose -f compose.db.yml up -d
docker compose -f compose.app.yml up -d --build
```

Health checks:

```bash
curl http://localhost:8080/health
curl http://localhost:8080/api/version
```

### Frontend

```bash
cd frontend/tarot-project
cp .env.local.example .env.local
npm install
npm run dev
```

The frontend runs on `http://localhost:3100`.

Local frontend environment:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

### One-command Local Start

After `backend/.env` and `frontend/tarot-project/.env.local` are ready:

```bash
./scripts/dev-up.sh
```

Stop backend containers:

```bash
./scripts/dev-down.sh
```

## Remote Test Preparation

Frontend deployment needs:

```bash
NEXT_PUBLIC_API_BASE_URL=
```

Backend deployment needs:

```bash
HF_SPACE_URL=
HF_TOKEN=
CORS_ALLOWED_ORIGINS=
CORS_ALLOWED_ORIGIN_PATTERNS=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=
FRONTEND_BASE_URL=
AUTH_ALLOWED_FRONTEND_ORIGINS=
JWT_SECRET=
DB_HOST=
DB_PORT=
DB_NAME=
DB_USER=
DB_PASSWORD=
```

The Hugging Face Space API contract must stay aligned with the backend Gradio integration. The backend calls the configured Gradio endpoint name, currently `generate_reading`.

## Verification

```bash
# Backend
cd backend
./gradlew test
./gradlew bootJar
```

```bash
# Frontend
cd frontend/tarot-project
npm run lint
npm test
npm run build
```

## Security Notes

- Real `.env`, `.env.local`, production env files, API keys, OAuth secrets, JWT secrets, and DB passwords must not be committed.
- The browser never receives Hugging Face tokens or external LLM API keys.
- Public examples should use placeholder values only.
- Local reports, generated training data, model artifacts, and Hugging Face Space source are intentionally excluded from this GitHub repository.
