#!/usr/bin/env bash
# Préprod SunuVet sur VPS — stack isolé, prod Infomaniak inchangée.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

DEPLOY_HOST="${DEPLOY_HOST:-180.149.198.229}"
DEPLOY_USER="${DEPLOY_USER:-ousmane}"
DEPLOY_BASE="${DEPLOY_BASE:-/var/www/projects/sunuvet-pro}"
DEPLOY_STATIC="${DEPLOY_STATIC:-${DEPLOY_BASE}/static}"
BASE_HREF="${BASE_HREF:-/pro/}"
BUILD_CONFIG="${BUILD_CONFIG:-vps-pro}"
SSH_KEY="${SSH_KEY:-$HOME/.ssh/id_ed25519}"
PRO_PORT="${PRO_PORT:-8090}"

DIST_DIR="$ROOT_DIR/dist/frontend2/browser"
REMOTE="${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_STATIC}/"

echo "→ Build ${BUILD_CONFIG} (base-href=${BASE_HREF})"
npm run build -- --configuration "${BUILD_CONFIG}" --base-href "${BASE_HREF}"

echo "→ Sync vers ${REMOTE}"
ssh -i "${SSH_KEY}" -o StrictHostKeyChecking=accept-new -o BatchMode=yes \
  "${DEPLOY_USER}@${DEPLOY_HOST}" "mkdir -p '${DEPLOY_STATIC}'"

rsync -avz --delete \
  -e "ssh -i ${SSH_KEY} -o StrictHostKeyChecking=accept-new" \
  "${DIST_DIR}/" \
  "${REMOTE}"

echo "→ Fichiers stack SunuVet (docker-compose, nginx)"
scp -i "${SSH_KEY}" -o StrictHostKeyChecking=accept-new \
  "${ROOT_DIR}/deploy/vps-pro/docker-compose.yml" \
  "${ROOT_DIR}/deploy/vps-pro/nginx.conf" \
  "${ROOT_DIR}/deploy/vps-pro/setup-sunuvet-once.sh" \
  "${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_BASE}/"

ssh -i "${SSH_KEY}" -o StrictHostKeyChecking=accept-new -o BatchMode=yes \
  "${DEPLOY_USER}@${DEPLOY_HOST}" \
  "chmod +x '${DEPLOY_BASE}/setup-sunuvet-once.sh' && cd '${DEPLOY_BASE}' && docker compose up -d"

echo ""
echo "✓ SunuVet déployé (stack isolé)"
echo "  URL préprod : http://${DEPLOY_HOST}:${PRO_PORT}${BASE_HREF}"
echo "  Prod Infomaniak : https://sunuvet.com (inchangée)"
