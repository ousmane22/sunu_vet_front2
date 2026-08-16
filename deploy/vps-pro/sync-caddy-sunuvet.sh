#!/usr/bin/env bash
# Ajoute la route HTTP /pro/ → SunuVet dans le Caddy IziPortfolio (ports 80/443 déjà ouverts).
set -euo pipefail

CADDYFILE="${CADDYFILE:-/var/www/projects/iziportfolio-back/docker/caddy/Caddyfile}"
IZIPORTFOLIO_DIR="${IZIPORTFOLIO_DIR:-/var/www/projects/iziportfolio-back}"
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.preprod.yml}"
MARKER="# --- SunuVet préprod (HTTP /pro/) ---"

if [ ! -f "${CADDYFILE}" ]; then
  echo "Caddyfile introuvable : ${CADDYFILE}"
  exit 1
fi

if grep -qF "${MARKER}" "${CADDYFILE}"; then
  echo "→ Route Caddy SunuVet déjà présente"
else
  echo "→ Ajout route Caddy SunuVet"
  cat >> "${CADDYFILE}" <<'EOF'

# --- SunuVet préprod (HTTP /pro/) ---
# Accès : http://180.149.198.229/pro/ (sans TLS, préprod migration)
http://180.149.198.229 {
	@sunuvet path /pro /pro/*
	handle @sunuvet {
		reverse_proxy sunuvet_front_pro:80
	}
}
# --- end SunuVet préprod ---
EOF
fi

cd "${IZIPORTFOLIO_DIR}"
if docker compose -f "${COMPOSE_FILE}" --env-file .env.preprod exec -T caddy caddy validate --config /etc/caddy/Caddyfile 2>/dev/null; then
  docker compose -f "${COMPOSE_FILE}" --env-file .env.preprod exec -T caddy caddy reload --config /etc/caddy/Caddyfile
else
  docker exec iziportfolio_caddy_preprod caddy validate --config /etc/caddy/Caddyfile
  docker exec iziportfolio_caddy_preprod caddy reload --config /etc/caddy/Caddyfile
fi

echo "✓ Caddy rechargé — http://180.149.198.229/pro/"
