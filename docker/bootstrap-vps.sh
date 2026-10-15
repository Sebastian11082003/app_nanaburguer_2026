#!/usr/bin/env bash
# First VPS bring-up (HTTP by public IP, no domain yet).
# Run on Ubuntu 24.04 as root, from the repo:
#   PUBLIC_IP=x.x.x.x bash docker/bootstrap-vps.sh
set -euo pipefail

if [[ "${EUID}" -ne 0 ]]; then
  echo "Run as root (sudo -i)."
  exit 1
fi

PUBLIC_IP="${PUBLIC_IP:-}"
if [[ -z "${PUBLIC_IP}" ]]; then
  echo "Set PUBLIC_IP to the VPS address, e.g. PUBLIC_IP=203.0.113.10"
  exit 1
fi

ADMIN_EMAIL="${PLATFORM_ADMIN_EMAIL:-admin@nanaburger.com}"
REPO_DIR="${REPO_DIR:-/opt/nanaburguer}"

export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y ca-certificates curl git openssl

if ! command -v docker >/dev/null 2>&1; then
  curl -fsSL https://get.docker.com | sh
fi
systemctl enable --now docker

if [[ ! -d "${REPO_DIR}/docker" ]]; then
  echo "Copy the repo to ${REPO_DIR} first (git clone or scp), then re-run."
  exit 1
fi

cd "${REPO_DIR}/docker"

if [[ ! -f .env ]]; then
  umask 077
  cat > .env <<EOF
POSTGRES_PASSWORD=$(openssl rand -hex 16)
JWT_SECRET=$(openssl rand -hex 32)
NEXT_PUBLIC_API_URL=http://${PUBLIC_IP}:3000
CORS_ORIGINS=http://${PUBLIC_IP},http://${PUBLIC_IP}:80
ALLOW_INSECURE_DEFAULTS=false
SEED_ON_BOOT=true
PLATFORM_ADMIN_EMAIL=${ADMIN_EMAIL}
PLATFORM_ADMIN_PASSWORD=$(openssl rand -base64 18 | tr -d '/+=' | head -c 20)
EOF
  echo "Wrote docker/.env (keep a copy of PLATFORM_ADMIN_PASSWORD)."
  grep '^PLATFORM_ADMIN_' .env || true
fi

docker compose -f docker-compose.yml --env-file .env up --build -d

echo
echo "Health: curl -sS http://${PUBLIC_IP}:3000/health"
echo "App:    http://${PUBLIC_IP}/platform/login"
echo "API:    http://${PUBLIC_IP}:3000"
echo "Open firewall ports 22, 80 and 3000 on the provider panel."
