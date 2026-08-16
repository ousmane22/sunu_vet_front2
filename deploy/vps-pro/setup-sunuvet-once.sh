#!/usr/bin/env bash
# Stack SunuVet isolé sur le VPS — route publique via Caddy (port 80).
set -euo pipefail

BASE="/var/www/projects/sunuvet-pro"
mkdir -p "${BASE}/static"

if [ ! -f "${BASE}/docker-compose.yml" ]; then
  echo "Copiez d'abord deploy/vps-pro/* sur le serveur, ou lancez deploy depuis votre Mac."
  exit 1
fi

cd "${BASE}"
docker compose up -d

if [ -x "${BASE}/sync-caddy-sunuvet.sh" ]; then
  bash "${BASE}/sync-caddy-sunuvet.sh"
fi

echo "✓ SunuVet pro actif : http://180.149.198.229/pro/"
