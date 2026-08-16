# SunuVet — préprod VPS (migration progressive)

**Stack SunuVet** — nginx isolé, exposé publiquement via Caddy (port 80 déjà ouvert).

| | Infomaniak | VPS SunuVet (préprod) |
|---|---|---|
| URL | `https://sunuvet.com` | **`http://180.149.198.229/pro/`** |
| Dossier | — | `/var/www/projects/sunuvet-pro/static` |
| API | `api.sunuvet.com` | inchangée (Infomaniak) |

> ⚠️ N'utilisez **pas** le port `:8090` depuis l'extérieur (bloqué par le pare-feu cloud).  
> Le port 8090 reste en local VPS (`127.0.0.1`) pour debug SSH.

## Déployer le frontend

```bash
cd sunu_vet_front2
npm run deploy:vps-pro
```

## Première installation sur le VPS (une fois)

```bash
scp -r deploy/vps-pro/{docker-compose.yml,nginx.conf,setup-sunuvet-once.sh,sync-caddy-sunuvet.sh} \
  ousmane@180.149.198.229:/var/www/projects/sunuvet-pro/

ssh ousmane@180.149.198.229 "bash /var/www/projects/sunuvet-pro/setup-sunuvet-once.sh"
```

## Vérifier

```bash
curl -I http://180.149.198.229/pro/
```

Ouvrir : **http://180.149.198.229/pro/** (sans `:8090`)

## Migration complète (nuit)

1. DNS `sunuvet.com` → VPS  
2. Front en HTTPS sur le domaine (Caddy SunuVet dédié)  
3. Migrer l'API  
4. Couper Infomaniak  
