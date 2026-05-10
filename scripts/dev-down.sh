#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"

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

require_file "$BACKEND_DIR/compose.db.yml"
require_file "$BACKEND_DIR/compose.app.yml"

echo "[dev-down] Stopping backend app container..."
(
  cd "$BACKEND_DIR"
  docker compose -f compose.app.yml down
)

echo "[dev-down] Stopping backend database container..."
(
  cd "$BACKEND_DIR"
  docker compose -f compose.db.yml down
)

echo "[dev-down] Backend containers stopped."
