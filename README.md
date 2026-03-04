# Site Factory - Monorepo

Architecture Site-Factory pour piloter Traefik, une base MariaDB et une app d'administration Next.js.

## Structure

```
/
├── docker-compose.yml       # Compose unique (Traefik + DB + whoami)
├── pnpm-workspace.yaml
├── package.json             # Scripts racine
├── site-factory/            # App Next.js 16 (admin CRUD)
├── projects/                # Futurs projets proxifies via Traefik
├── infra/
│   ├── traefik/             # Config dynamique Traefik
│   └── db/                  # (reserve pour scripts DB)
├── scripts/                 # Scripts utilitaires
└── configs/                 # Configs generees / templates
```

## Prerequis

- **Node.js** >= 22
- **PNPM** >= 10
- **Docker** + **Docker Compose** v2

## Demarrage rapide

```bash
# 1. Copier les variables d'environnement
cp .env.example .env
cp site-factory/.env.example site-factory/.env

# 2. Installer les dependances
pnpm install

# 3. Lancer Traefik + MariaDB
pnpm up

# 4. Lancer la migration Prisma
pnpm db:migrate

# 5. Lancer l'app en dev
pnpm dev
```

L'application sera disponible sur `http://localhost:3100`.

## Commandes

| Commande              | Description                          |
|-----------------------|--------------------------------------|
| `pnpm dev`            | Lance Traefik + DB + Next.js dev     |
| `pnpm up`             | Lance Traefik + DB uniquement        |
| `pnpm down`           | Arrete tous les containers           |
| `pnpm lint`           | ESLint strict (no-any)               |
| `pnpm typecheck`      | TypeScript strict                    |
| `pnpm validate`       | Check spec drift + typecheck + tests |
| `pnpm spec:sync`      | Sync `Docs/_spec` vers l'app         |
| `pnpm spec:check`     | Echec si `Docs/_spec` et app divergent |
| `pnpm db:migrate`     | Prisma migrate dev                   |
| `pnpm db:studio`      | Prisma Studio (UI)                   |
| `pnpm compose:validate` | Valide le docker-compose           |
| `pnpm sf:theme:watch --client <c> --project <p>` | Sync en direct du theme enfant SF |

## Theme enfant SF (sf-tt5)

La source canonique du theme est dans `assets/wp/theme-child/sf-tt5/`.

Synchroniser vers un projet existant (dev) :
```bash
pnpm sf:theme:watch --client puleri --project starter-wp
```

Options utiles :
- `--once` : copie complete puis exit
- `--dry-run` : log uniquement
- `--wpcli` : re-active le theme via WP-CLI + flush cache
- `--flush` : force un `wp cache flush` (necessite `--wpcli`)
- `--mode prod-like` : cible le compose prod-like pour WP-CLI

Si des patterns/parts ne se rechargent pas, relance le watch avec `--wpcli` ou re-sauvegarde la page dans l'editeur.

## Services Docker

| Service  | URL                         | Reseau   |
|----------|-----------------------------|----------|
| Traefik  | http://traefik.localhost     | proxy    |
| Whoami   | http://whoami.localhost      | proxy    |
| MariaDB  | localhost:3307               | internal |

## Ajouter un projet proxifie

Les futurs projets iront dans `/projects/`. Pour les router via Traefik :

1. Ajouter le service dans un `docker-compose.override.yml` ou dans `/projects/<nom>/docker-compose.yml`
2. Connecter au reseau `proxy` (externe)
3. Ajouter les labels Traefik :
   ```yaml
   labels:
     - "traefik.enable=true"
     - "traefik.http.routers.mon-projet.rule=Host(`mon-projet.localhost`)"
     - "traefik.http.routers.mon-projet.entrypoints=web"
   ```

Voir `/infra/traefik/README.md` pour plus de details.
