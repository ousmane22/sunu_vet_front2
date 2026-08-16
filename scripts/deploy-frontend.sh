#!/usr/bin/env bash
# Déploie le build Angular statique sur le serveur (dossier sunuvet).
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

DEPLOY_HOST="${DEPLOY_HOST:-h2web397.ftp.infomaniak.com}"
DEPLOY_USER="${DEPLOY_USER:-uid279578}"
DEPLOY_PATH="${DEPLOY_PATH:-sunuvet}"
BASE_HREF="${BASE_HREF:-/sunuvet/}"
SSH_KEY="${SSH_KEY:-$HOME/.ssh/id_ed25519}"

DIST_DIR="$ROOT_DIR/dist/frontend2/browser"
REMOTE="${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PATH}/"

echo "→ Build production (base-href=${BASE_HREF})"
npm run build -- --configuration production --base-href "${BASE_HREF}"

echo "→ .htaccess adapté au sous-dossier"
cat > "${DIST_DIR}/.htaccess" <<EOF
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase ${BASE_HREF}
  RewriteRule ^index\\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . ${BASE_HREF}index.html [L]
</IfModule>

<IfModule mod_mime.c>
  AddType application/manifest+json .webmanifest
</IfModule>

<IfModule mod_headers.c>
  <FilesMatch "index\\.html$">
    Header set Cache-Control "no-cache, no-store, must-revalidate"
  </FilesMatch>

  <FilesMatch "manifest\\.webmanifest$">
    Header set Cache-Control "public, max-age=86400"
    Header set Content-Type "application/manifest+json"
  </FilesMatch>

  <FilesMatch "\\.(js|css)$">
    Header set Cache-Control "public, max-age=31536000, immutable"
  </FilesMatch>

  <Files "ngsw-worker.js">
    Header set Cache-Control "no-cache, no-store, must-revalidate"
  </Files>

  <Files "ngsw.json">
    Header set Cache-Control "no-cache, no-store, must-revalidate"
  </Files>
</IfModule>
EOF

echo "→ Sync vers ${REMOTE}"
rsync -avz --delete \
  -e "ssh -i ${SSH_KEY} -o StrictHostKeyChecking=accept-new" \
  "${DIST_DIR}/" \
  "${REMOTE}"

echo "✓ Déploiement terminé"
echo "  URL probable : https://${DEPLOY_HOST%/}/${BASE_HREF#/}"
