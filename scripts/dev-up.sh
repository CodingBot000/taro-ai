#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend/tarot-project"

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Required command not found: $1" >&2
    exit 1
  fi
}

require_file() {
  if [[ ! -f "$1" ]]; then
    echo "Required file not found: $1" >&2
    exit 1
  fi
}

require_command docker
require_command npm

require_file "$BACKEND_DIR/.env"
require_file "$BACKEND_DIR/compose.db.yml"
require_file "$BACKEND_DIR/compose.app.yml"
require_file "$FRONTEND_DIR/package.json"

echo "[dev-up] Starting backend database container..."
(
  cd "$BACKEND_DIR"
  docker compose -f compose.db.yml up -d
)

echo "[dev-up] Starting backend app container..."
(
  cd "$BACKEND_DIR"
  docker compose -f compose.app.yml up -d --build
)

echo "[dev-up] Starting frontend dev server..."
echo "[dev-up] Backend: http://localhost:8080"
echo "[dev-up] Frontend: http://localhost:3100"
echo "[dev-up] Use scripts/dev-down.sh to stop backend containers."

cd "$FRONTEND_DIR"
exec npm run dev
