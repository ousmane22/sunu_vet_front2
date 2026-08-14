# Déploiement automatique (CI/CD) – Frontend

À chaque **push sur `main`**, GitHub Actions build l’app Angular et déploie le dossier `dist/frontend2/browser/` sur le serveur via SSH.

## Secrets GitHub

Dans le dépôt **sunu_vet_front2** : **Settings** → **Secrets and variables** → **Actions**.

| Secret | Description | Exemple |
|--------|-------------|---------|
| `SSH_PRIVATE_KEY` | Clé privée SSH (même que le backend) | Contenu entier du fichier `deploy_key` |
| `DEPLOY_HOST` | Serveur SSH Infomaniak | `h2web397.ftp.infomaniak.com` |
| `DEPLOY_USER` | Utilisateur SSH | `uid279578` |
| `FRONTEND_DEPLOY_PATH` | Racine web du site (sans `/` final) | `/home/uid279578/sites/sunuvet.com` |

## Vérifier un déploiement

1. Onglet **Actions** du dépôt → workflow **Deploy Frontend** vert après le push.
2. Ouvrir [https://sunuvet.com](https://sunuvet.com) et tester un dialog (ex. suppression client).

## Déploiement manuel

**Actions** → **Deploy Frontend** → **Run workflow**.

## SPA (routing Angular)

Le dossier `public/` est copié dans le build. Vérifiez que le serveur redirige les routes vers `index.html` (Apache `.htaccess` ou config Nginx — voir `public/nginx-spa-cache.example.conf`).
