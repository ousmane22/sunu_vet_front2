# SunuVet — préprod VPS (migration progressive)

**Stack 100 % SunuVet** — n'utilise pas et ne modifie pas iziportfolio.

| | Infomaniak | VPS SunuVet (préprod) |
|---|---|---|
| URL | `https://sunuvet.com` | `http://180.149.198.229:8090/pro/` |
| Dossier | — | `/var/www/projects/sunuvet-pro/static` |
| API | `api.sunuvet.com` | inchangée (Infomaniak) |

## Déployer le frontend

```bash
cd sunu_vet_front2
npm run deploy:vps-pro
```

## Première installation sur le VPS (une fois)

```bash
scp -r deploy/vps-pro/{docker-compose.yml,nginx.conf,setup-sunuvet-once.sh} \
  ousmane@180.149.198.229:/var/www/projects/sunuvet-pro/

ssh ousmane@180.149.198.229 "bash /var/www/projects/sunuvet-pro/setup-sunuvet-once.sh"
```

## Vérifier

```bash
curl -I http://180.149.198.229:8090/pro/
```

Ouvrir : **http://180.149.198.229:8090/pro/**

## Migration complète (nuit)

1. DNS `sunuvet.com` → VPS  
2. Front en HTTPS sur le domaine (Caddy SunuVet dédié)  
3. Migrer l'API  
4. Couper Infomaniak  
