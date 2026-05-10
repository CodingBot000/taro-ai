# Spring Service

Spring Boot backend for the tarot frontend. The frontend only calls this API; Hugging Face / Gradio secrets stay here.

## Required environment variables

- `HF_SPACE_URL`
- `HF_TOKEN`
- `DB_PASSWORD` when running with the `postgres` profile or Docker Compose
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `JWT_SECRET`

## Optional environment variables

- `PORT`
- `APP_VERSION`
- `CORS_ALLOWED_ORIGINS`
- `CORS_ALLOWED_ORIGIN_PATTERNS`
- `RATE_LIMIT_REQUESTS_PER_MINUTE`
- `RATE_LIMIT_MAX_TRACKED_CLIENTS`
- `RATE_LIMIT_CLIENT_TTL`
- `RATE_LIMIT_CLEANUP_INTERVAL`
- `REQUEST_SOURCE_VALIDATION_ENABLED`
- `TRUSTED_PROXY_ADDRESSES`
- `SPRING_PROFILES_ACTIVE`
- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_USER`
- `DB_MAX_POOL_SIZE`
- `DB_MIN_IDLE`
- `DB_CONNECTION_TIMEOUT_MS`
- `SPRING_JPA_HIBERNATE_DDL_AUTO`
- `SPRING_JPA_SHOW_SQL`
- `GOOGLE_REDIRECT_URI`
- `FRONTEND_BASE_URL`
- `JWT_ACCESS_TOKEN_EXPIRATION_SECONDS`
- `JWT_REFRESH_TOKEN_EXPIRATION_SECONDS`
- `AUTH_REFRESH_COOKIE_NAME`
- `AUTH_REFRESH_COOKIE_PATH`
- `AUTH_REFRESH_COOKIE_DOMAIN`
- `AUTH_REFRESH_COOKIE_SECURE`
- `AUTH_REFRESH_COOKIE_SAME_SITE`
- `HF_API_PREFIX`
- `HF_CONNECT_TIMEOUT`
- `HF_READ_TIMEOUT`
- `HF_GENERATE_READING_API_NAME`
- `HF_BACKEND_VERSION_API_NAME`
- `JAVA_OPTS`

## Local development

1. Copy the example env file.

```bash
cp .env.example .env
```

2. Fill in the real `HF_TOKEN` and, if needed, change `HF_SPACE_URL`.

3. Run Spring Boot with the env file loaded into the shell.

```bash
set -a
source .env
set +a
./gradlew bootRun
```

If you want to boot against PostgreSQL outside Docker Compose, also set `SPRING_PROFILES_ACTIVE=postgres`
and point `DB_HOST` at a reachable PostgreSQL instance. The `postgres` profile enables Flyway and applies
`src/main/resources/db/migration/postgresql/V1__create_auth_tables.sql` automatically.

## Docker Compose

```bash
cp .env.example .env
docker compose -f compose.db.yml up -d
docker compose -f compose.app.yml up -d --build
```

Use the split compose files for day-to-day work:

- `compose.db.yml`: PostgreSQL only
- `compose.app.yml`: Spring service only

This keeps the DB container and volume out of normal app rebuild/restart flows. The DB stays reachable at
`localhost:5432` for tools like DataGrip, while the Spring container still connects to `postgres:5432`
through the shared Docker network `taro-backend-network`.

Recommended commands:

```bash
# one-time migration if the legacy stack is still running
docker compose -f docker-compose.yml down

# first-time DB start
docker compose -f compose.db.yml up -d

# app rebuild / restart
docker compose -f compose.app.yml up -d --build

# app logs
docker compose -f compose.app.yml logs -f spring-service

# db logs
docker compose -f compose.db.yml logs -f postgres
```

`docker-compose.yml` is kept as a deprecated all-in-one fallback. Avoid using it for routine development,
because `down -v` on that file can remove the database volume together with the app stack.

## Database migration

The application keeps `SPRING_JPA_HIBERNATE_DDL_AUTO=none` and uses Flyway for PostgreSQL schema changes.
For a fresh compose environment, starting the app with `SPRING_PROFILES_ACTIVE=postgres` applies the auth tables
and indexes automatically.

If you already created the same tables manually before Flyway was added, set `SPRING_FLYWAY_BASELINE_ON_MIGRATE=true`
once, confirm the `flyway_schema_history` table was created, and then set it back to `false`.

## Production

Provide the same variables through your deployment environment or a production env file that is not committed.
For compose-based deployment from this repository structure:

```bash
cp .env.example .env.production
docker compose --env-file .env.production up -d --build
```

Health check:

```bash
curl http://localhost:8080/health
```

Version check:

```bash
curl http://localhost:8080/api/version
```

`POST /api/tarot` additionally checks the request `Origin` or `Referer` against `CORS_ALLOWED_ORIGINS` and
`CORS_ALLOWED_ORIGIN_PATTERNS` when `REQUEST_SOURCE_VALIDATION_ENABLED=true`. This reduces casual abuse from
direct clients, but it is not a substitute for real authentication because those headers can still be spoofed
outside the browser.

`CF-Connecting-IP` and `X-Forwarded-For` are used for rate limiting only when the direct remote address is loopback,
private, or listed in `TRUSTED_PROXY_ADDRESSES`. This prevents direct clients from changing their quota key by
spoofing forwarded headers.

Current policy note: `POST /api/tarot` remains public for now. Google OAuth is available for account features, but
making tarot generation login-required is intentionally deferred.

For Vercel deployments, add the deployed frontend domain to `CORS_ALLOWED_ORIGINS` or configure a specific
pattern such as `https://your-project-*.vercel.app` in `CORS_ALLOWED_ORIGIN_PATTERNS`.

## Auth flow

1. Start Google login by opening `GET /api/auth/login/google` in the browser.
2. After Google callback succeeds, the backend:
   - creates or finds `users` and `users_oauth_accounts`
   - updates `users.last_login_at`
   - issues an access token
   - stores a hashed refresh token in `refresh_tokens`
   - sets the raw refresh token as an HttpOnly cookie
   - redirects to `${FRONTEND_BASE_URL}/auth/callback#accessToken=...`
3. Use the access token as `Authorization: Bearer <token>` for `/api/**`.

Refresh access token:

```bash
curl -X POST \
  -H "Origin: http://localhost:3000" \
  -b "refresh_token=<cookie-value>" \
  http://localhost:8080/api/auth/refresh
```

Current user:

```bash
curl -H "Authorization: Bearer <access-token>" \
  http://localhost:8080/api/auth/me
```

Logout:

```bash
curl -X POST \
  -H "Origin: http://localhost:3000" \
  -b "refresh_token=<cookie-value>" \
  http://localhost:8080/api/auth/logout
```
