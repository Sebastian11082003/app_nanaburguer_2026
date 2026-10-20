#!/usr/bin/env bash
# Snapshot Postgres + API uploads. Run from anywhere; uses this folder's compose.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
OUT="${BACKUP_DIR:-$ROOT/backups}/$STAMP"
COMPOSE=(docker compose -f "$ROOT/docker-compose.yml")

if [[ -f "$ROOT/docker-compose.https.yml" && -n "${HTTPS_OVERLAY:-}" ]]; then
  COMPOSE+=(-f "$ROOT/docker-compose.https.yml")
fi

mkdir -p "$OUT"

"${COMPOSE[@]}" exec -T db pg_dump -U nanaburguer --no-owner --no-acl nanaburguer_dev > "$OUT/db.sql"
"${COMPOSE[@]}" exec -T api tar -C /app -cf - uploads > "$OUT/uploads.tar"

echo "$OUT"
