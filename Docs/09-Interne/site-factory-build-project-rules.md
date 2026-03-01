# Site Factory — Build Project (règles)

Ce document décrit la logique attendue (déterministe) reliant :

$$\text{hébergement} \times \text{stack} \times \text{mode} \rightarrow \text{services} + \text{déploiement}$$

## Objectif

- Réduire l’ambiguïté côté UI : l’utilisateur choisit peu, le système guide.
- Centraliser les règles (et les raisons) pour pouvoir étendre (nouvel hébergeur, nouveaux services).

## Modèle (couches)

- **Environnement**
  - `hosting.type`: `mutualise | dedie`
  - `hosting.provider`: ex: `o2switch | ovh-vps`
  - `runtime.profile`: `dev | prodlike | prod`
  - `security.ssl.mode`: `local-ca | selfsigned | letsencrypt | provider | none`
- **Stack**
  - `stack.kind`: `wp | wp_headless | next`
- **Services**
  - Activables uniquement via un catalogue (ex: `lib/site-factory/schemas/services.catalog.json`).

## Règles “base” (version 1)

### 1) Mutualisé

- `runtime=prod`
  - Docker **interdit** côté serveur.
  - Déploiement : **packaging** (build + upload + post-deploy).
  - SSL : `provider`.
  - DB : externe (hébergeur).
  - Email : externe (SMTP/provider).
- `runtime=dev`
  - Docker autorisé localement.
  - Services dev autorisés (ex: Mailpit).

### 2) Dédié / VPS

- Docker autorisé en `dev | prodlike | prod`.
- Déploiement : **compose**.
- SSL :
  - `prod` → `letsencrypt`
  - `dev | prodlike` → `local-ca` (ou `selfsigned` si besoin)

### 3) Services (exemples attendus)

- **DB**
  - `stack=wp|wp_headless` → DB requise
    - `dev|prodlike` → `mariadb` (docker)
    - `prod` → `mysql` (docker/VPS) ou externe (mutualisé)
  - `stack=next` → pas de DB par défaut
- **Email**
  - `dev` → `mailpit` (docker)
  - `prodlike` → `mailpit` **ou** `provider` (selon règle/contrainte)
  - `prod` → `provider` uniquement
- **Proxy / HTTPS**
  - `dev` → proxy docker (cert local)
  - `prod` →
    - mutualisé → pas de proxy docker (SSL provider)
    - VPS → proxy docker + Let’s Encrypt

## Pseudo-code (règles)

```txt
input: hostingType, provider, runtimeProfile, stackKind

sslMode :=
  if runtimeProfile == prod:
    if hostingType == mutualise: provider
    else: letsencrypt
  else:
    local-ca

services := []

# email
if runtimeProfile == prod: services += mail:provider
else: services += mail:mailpit

# db
if stackKind in [wp, wp_headless]:
  if runtimeProfile == prod: services += db:mysql
  else: services += db:mariadb

# proxy
if NOT (hostingType == mutualise AND runtimeProfile == prod):
  services += proxy:traefik

deploy :=
  if hostingType == mutualise AND runtimeProfile == prod:
    packaging
  else:
    compose

output: plan(version, environment, stack, services.enabled, deploy, warnings, requiredActions)
```

## Référence implémentation actuelle

- CLI : `site-factory plan build` construit un plan v1.
- Structure du plan :
  - `environment.*`, `stack.*`, `services.enabled[]`, `deploy.*`, `warnings[]`, `requiredActions[]`.

