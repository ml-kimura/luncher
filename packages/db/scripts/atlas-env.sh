#!/usr/bin/env bash
# Default env for atlas.hcl (getenv), especially ATLAS_DEV_URL for migrate diff.
# Sources .devcontainer/.env when present.
set -euo pipefail

PKG_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DC_ENV="${PKG_ROOT}/../../.devcontainer/.env"
if [[ -f "$DC_ENV" ]]; then
  set -a
  # shellcheck source=/dev/null
  source "$DC_ENV"
  set +a
fi

export POSTGRES_VERSION="${POSTGRES_VERSION:-18}"
export POSTGRES_USER="${POSTGRES_USER:-postgres}"
export POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-postgres}"
export POSTGRES_DB="${POSTGRES_DB:-myapp}"
export DB_SCHEMA="${DB_SCHEMA:-public}"
export ATLAS_DEV_DB="${ATLAS_DEV_DB:-atlas_dev}"

# dev DB URL: 既定は DevContainer / Compose 内で確実に届く db 上の専用 DB（初回は CREATE DATABASE が要る）
if [[ -n "${ATLAS_DEV_URL:-}" ]]; then
  export ATLAS_DEV_URL
elif [[ "${ATLAS_USE_DOCKER_DEV:-0}" == "1" ]]; then
  # ホストで docker がそのマシンの localhost と同じ名前空間になるとき向け。DevContainer 内では多く失敗する。
  export ATLAS_DEV_URL="docker://postgres/${POSTGRES_VERSION}/dev?search_path=${DB_SCHEMA}"
else
  export ATLAS_DEV_URL="postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db:5432/${ATLAS_DEV_DB}?search_path=${DB_SCHEMA}&sslmode=disable"
fi

exec atlas "$@"
