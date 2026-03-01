# Traefik - Reverse Proxy Global

## Architecture

Traefik est configuré comme reverse-proxy unique pour toute la Site-Factory.

- **Static config** : via CLI args dans `docker-compose.yml` (racine)
- **Dynamic config** : `/infra/traefik/dynamic.yml` (watch activé)
- **Docker provider** : labels sur les containers

## Entrypoints

| Nom         | Port | Usage              |
|-------------|------|--------------------|
| web         | 80   | HTTP               |
| websecure   | 443  | HTTPS (futur TLS)  |

## Dashboard

Accessible sur `http://traefik.localhost` (port 80).
Protégé par basic auth (TODO: configurer de vrais credentials).

## Ajouter un projet proxifié

### Option 1 : Via Docker labels (recommandé)

Dans le `docker-compose.yml` du projet (ou un override) :

```yaml
services:
  mon-projet:
    image: mon-image
    networks:
      - proxy
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.mon-projet.rule=Host(`mon-projet.localhost`)"
      - "traefik.http.routers.mon-projet.entrypoints=web"
      - "traefik.http.services.mon-projet.loadbalancer.server.port=3000"

networks:
  proxy:
    external: true
```

### Option 2 : Via fichier dynamique

Ajouter dans `/infra/traefik/dynamic.yml` :

```yaml
http:
  routers:
    mon-projet:
      rule: "Host(`mon-projet.localhost`)"
      entrypoints:
        - web
      service: mon-projet

  services:
    mon-projet:
      loadBalancer:
        servers:
          - url: "http://host.docker.internal:PORT"
```
