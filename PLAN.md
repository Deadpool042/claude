# Plan : Pages Services Docker + WordPress Toolbox

## Architecture cible

```
/dashboard/projects/{id}          ← Page détail (existante, nettoyée)
/dashboard/projects/{id}/services ← Page services Docker (NOUVELLE)
/dashboard/projects/{id}/wordpress← Page WordPress Toolbox (NOUVELLE, si WP)
```

La page projet detail garde le lien "Ouvrir les services" + un lien "WordPress Toolbox" (si techStack=WP).

---

## Phase 1 — Fondations (Prisma + shadcn + SSE)

### 1.1 Schema Prisma — Ajouter champs WP avancés

Ajouter au modèle `ProjectConfig` :
```prisma
// WordPress avancé
wpPermalinkStructure  String?   @default("/%postname%/") @map("wp_permalink_structure")
wpDefaultPages        String?   @map("wp_default_pages") @db.Text   // JSON: [{title, slug, content}]
wpPlugins             String?   @map("wp_plugins") @db.Text          // JSON: ["woocommerce", "yoast-seo"]
wpTheme               String?   @map("wp_theme")                     // slug du thème à installer
```

Migration Prisma + re-générer client.

### 1.2 Installer shadcn/ui Tabs

```bash
npx shadcn@latest add tabs
```

### 1.3 API SSE — Logs en temps réel

**Nouveau fichier** : `src/app/api/docker/projects/[projectId]/logs/stream/route.ts`

```typescript
// GET — SSE stream
// Spawns `docker compose logs -f --tail=50 [service]`
// Pipe stdout/stderr → SSE (event: log, data: {line, service, timestamp})
// On client disconnect → kill child process
// Query params: ?service=slug (optionnel, sinon tous)
```

Utilise `spawn` (pas exec) pour streamer ligne par ligne.
Response: `new Response(ReadableStream, { headers: { "Content-Type": "text/event-stream" } })`

### 1.4 API SSE — Status en temps réel

**Nouveau fichier** : `src/app/api/docker/projects/[projectId]/status/stream/route.ts`

```typescript
// GET — SSE stream
// Boucle côté serveur: toutes les 3s → docker compose ps -a --format json
// Compare avec état précédent → envoie seulement les changements
// On client disconnect → clearInterval + close
```

### 1.5 API — WP-CLI actions

**Nouveau fichier** : `src/app/api/docker/projects/[projectId]/wp-cli/route.ts`

```typescript
// POST — Exécute une commande WP-CLI dans le conteneur running
// Body: { command: string, args?: string[] }
// Commandes autorisées (whitelist) :
//   - option update permalink_structure
//   - post create (page)
//   - plugin install / activate / deactivate
//   - theme install / activate
//   - cache flush
//   - rewrite flush
//   - db export / import
// Exécute: docker exec {slug} wp --allow-root {command}
// Retourne stdout/stderr
```

---

## Phase 2 — Page Services Docker

### 2.1 Layout

**Fichier** : `src/app/dashboard/projects/[projectId]/services/page.tsx` (Server Component)

- Fetch le projet + config depuis Prisma
- Passe les données au composant client
- Breadcrumb override: `{ [projectId]: project.name }`

### 2.2 Composants client

#### `_components/services-dashboard.tsx` (Client)
Composant principal. Layout:
- **Header** : nom du projet, badge status global, actions globales (Start All, Stop All, Rebuild)
- **Grille de cartes** : 1 carte par service, responsive (1→2→3 colonnes)

#### `_components/service-card.tsx` (Client)
Chaque service a sa propre carte :
```
┌─────────────────────────────────┐
│ 🟢 WordPress           Running │
│ Conteneur principal             │
│                                 │
│ [▶ Start] [⏹ Stop] [↻ Restart]│
│ [📋 Logs]                      │
│                                 │
│ ▸ Configuration ────────────── │ ← section dépliable
│   PHP 8.3 · Apache · Port 80   │
│   Changer la version PHP [▼]   │
└─────────────────────────────────┘
```

- Indicateur de statut en temps réel (dot vert/rouge/gris)
- Boutons d'action individuels avec loading state
- Section config dépliable (collapsible) propre à chaque service
- Pour la DB : version, credentials, actions (import SQL, export)
- Pour Redis : info mémoire
- Pour Mailpit : lien vers l'interface web

#### `_components/log-viewer.tsx` (Client)
Terminal-like viewer :
- Se connecte au SSE `/api/docker/projects/{id}/logs/stream?service=xxx`
- Auto-scroll en bas (désactivable)
- Filtrage par service (tabs ou select)
- Bouton clear / pause / download
- Coloration syntaxique basique (timestamps, ERROR en rouge, WARN en jaune)
- Panneau en bas de page ou en overlay (drawer)

#### `_components/use-service-status.ts` (Hook custom)
```typescript
export function useServiceStatus(projectId: string): {
  services: ServiceInfo[];
  connected: boolean;
}
// Connecte au SSE /status/stream
// Reconnexion auto avec backoff
// Retourne l'état mis à jour en temps réel
```

#### `_components/use-log-stream.ts` (Hook custom)
```typescript
export function useLogStream(projectId: string, service?: string): {
  lines: LogLine[];
  connected: boolean;
  clear: () => void;
}
// Connecte au SSE /logs/stream
// Buffer des 500 dernières lignes
// Parse chaque ligne {timestamp, service, message}
```

---

## Phase 3 — Page WordPress Toolbox

### 3.1 Page

**Fichier** : `src/app/dashboard/projects/[projectId]/wordpress/page.tsx` (Server Component)

- Vérifie que techStack === "WORDPRESS", sinon notFound()
- Fetch config actuelle
- Breadcrumb override

### 3.2 Composants

#### `_components/wp-toolbox.tsx` (Client)
Layout en Tabs (shadcn Tabs) :

**Tab 1 — Réglages généraux**
- Structure des permaliens : radio group (Plat, Jour et nom, Nom de l'article, Custom)
- Titre du site : input
- Bouton "Appliquer" → WP-CLI `option update`

**Tab 2 — Pages**
- Liste des pages existantes (fetch via WP-CLI `post list --post_type=page`)
- Formulaire "Créer une page" : titre, slug, contenu (textarea)
- Bouton "Créer" → WP-CLI `post create`
- Les pages pré-configurées (wpDefaultPages JSON) sont créées auto au setup

**Tab 3 — Plugins**
- Liste des plugins installés (WP-CLI `plugin list`)
- Activer / Désactiver / Supprimer par plugin
- Formulaire "Installer un plugin" : slug du plugin
- Plugins pré-configurés (wpPlugins JSON) installés auto au setup

**Tab 4 — Thème**
- Thème actif actuel (WP-CLI `theme list`)
- Installer un thème par slug
- Activer un thème

**Tab 5 — Pré-configuration (Setup initial)**
- Formulaire pour configurer ce qui sera auto-installé au premier `docker compose up` :
  - Permalinks par défaut
  - Pages à créer automatiquement (liste dynamique, ajouter/supprimer)
  - Plugins à pré-installer (tags input)
  - Thème à activer
- Sauvegarde dans ProjectConfig (wpPermalinkStructure, wpDefaultPages, wpPlugins, wpTheme)
- Régénère le wp-setup.sh

### 3.3 wp-setup.sh enrichi

Mettre à jour le template wp-setup.sh dans le compose generator pour :
- Configurer les permalinks
- Créer les pages par défaut
- Installer/activer les plugins
- Installer/activer le thème

---

## Phase 4 — Nettoyage page projet

### 4.1 Simplifier `projects/[projectId]/page.tsx`

- Retirer le `<ProjectConfigPanel>` inline (la config est maintenant dans /services)
- Garder uniquement les cartes d'info (client, type, statut, port, déploiement, accès, technique, dates)
- Card "Services Docker" → lien vers /services
- Card "WordPress Toolbox" → lien vers /wordpress (si WP)
- Plus clean, plus focused

---

## Ordre d'implémentation

1. **Schema Prisma** — migration + champs WP avancés
2. **shadcn tabs** — install
3. **SSE endpoints** — logs/stream + status/stream
4. **WP-CLI endpoint** — avec whitelist de commandes
5. **Hook useServiceStatus** — SSE client
6. **Hook useLogStream** — SSE client
7. **Page /services** — services-dashboard + service-card + log-viewer
8. **Page /wordpress** — wp-toolbox avec tabs
9. **wp-setup.sh enrichi** — template compose
10. **Nettoyage** page projet detail
11. **typecheck + lint**

---

## Fichiers créés/modifiés

### Nouveaux :
- `src/app/dashboard/projects/[projectId]/services/page.tsx`
- `src/app/dashboard/projects/[projectId]/services/_components/services-dashboard.tsx`
- `src/app/dashboard/projects/[projectId]/services/_components/service-card.tsx`
- `src/app/dashboard/projects/[projectId]/services/_components/log-viewer.tsx`
- `src/app/dashboard/projects/[projectId]/services/_components/use-service-status.ts`
- `src/app/dashboard/projects/[projectId]/services/_components/use-log-stream.ts`
- `src/app/dashboard/projects/[projectId]/wordpress/page.tsx`
- `src/app/dashboard/projects/[projectId]/wordpress/_components/wp-toolbox.tsx`
- `src/app/dashboard/projects/[projectId]/wordpress/_components/wp-pages-tab.tsx`
- `src/app/dashboard/projects/[projectId]/wordpress/_components/wp-plugins-tab.tsx`
- `src/app/dashboard/projects/[projectId]/wordpress/_components/wp-theme-tab.tsx`
- `src/app/dashboard/projects/[projectId]/wordpress/_components/wp-settings-tab.tsx`
- `src/app/dashboard/projects/[projectId]/wordpress/_components/wp-setup-tab.tsx`
- `src/app/api/docker/projects/[projectId]/logs/stream/route.ts`
- `src/app/api/docker/projects/[projectId]/status/stream/route.ts`
- `src/app/api/docker/projects/[projectId]/wp-cli/route.ts`
- `src/components/ui/tabs.tsx` (shadcn)

### Modifiés :
- `prisma/schema.prisma` — champs WP avancés
- `src/app/dashboard/projects/[projectId]/page.tsx` — nettoyage, liens vers sous-pages
- `src/lib/generators/compose.ts` — wp-setup.sh enrichi
- `src/app/dashboard/projects/_actions/update-config.ts` — nouveaux champs
