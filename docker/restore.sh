#!/usr/bin/env bash
# Restore a directory written by backup.sh. Stops nothing: you must pass
# the snapshot path. This replaces the live database and uploads.
set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "usage: $0 /path/to/backups/STAMP" >&2
  exit 1
fi

SNAP="$(cd "$1" && pwd)"
ROOT="$(cd "$(dirname "$0")" && pwd)"
COMPOSE=(docker compose -f "$ROOT/docker-compose.yml")

if [[ ! -f "$SNAP/db.sql" || ! -f "$SNAP/uploads.tar" ]]; then
  echo "snapshot missing db.sql or uploads.tar: $SNAP" >&2
  exit 1
fi

if [[ -f "$ROOT/docker-compose.https.yml" && -n "${HTTPS_OVERLAY:-}" ]]; then
  COMPOSE+=(-f "$ROOT/docker-compose.https.yml")
fi

"${COMPOSE[@]}" exec -T db psql -U nanaburguer -d nanaburguer_dev -c \
  "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'nanaburguer_dev' AND pid <> pg_backend_pid();" \
  >/dev/null
"${COMPOSE[@]}" exec -T db psql -U nanaburguer -d postgres -c \
  "DROP DATABASE IF EXISTS nanaburguer_dev;"
"${COMPOSE[@]}" exec -T db psql -U nanaburguer -d postgres -c \
  "CREATE DATABASE nanaburguer_dev OWNER nanaburguer;"
"${COMPOSE[@]}" exec -T db psql -U nanaburguer -d nanaburguer_dev < "$SNAP/db.sql"
"${COMPOSE[@]}" exec -T api sh -c 'rm -rf /app/uploads/* && tar -C /app -xf -' < "$SNAP/uploads.tar"

echo "restored $SNAP"
