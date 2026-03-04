# Matrice Wizard + Qualification Live

Date: 2026-03-04
Portée: état actuel des règles dans `site-factory` (normalisation wizard + qualification runtime)

## 1) Combinaisons effectives Type projet × Hosting × Famille

> Règle appliquée: la famille finale autorisée = intersection entre:
> - familles autorisées par le type de projet,
> - familles autorisées par la cible d’hébergement.
>
> Si le choix courant devient invalide, la normalisation applique un fallback sur la première famille autorisée disponible.

### BLOG
- Hosting autorisés (effectifs): `SHARED_PHP`, `CLOUD_STATIC`, `CLOUD_SSR`, `VPS_DOCKER`, `TO_CONFIRM`
- Familles possibles par hosting:
  - `SHARED_PHP` → `STATIC_SSG`, `CMS_MONO`
  - `CLOUD_STATIC` → `STATIC_SSG`
  - `CLOUD_SSR` → `APP_PLATFORM`
  - `VPS_DOCKER` → `STATIC_SSG`, `CMS_MONO`, `CMS_HEADLESS`, `APP_PLATFORM`
  - `TO_CONFIRM` → `STATIC_SSG`, `CMS_MONO`, `CMS_HEADLESS`, `APP_PLATFORM`

### VITRINE
- Hosting autorisés (effectifs): `SHARED_PHP`, `CLOUD_STATIC`, `CLOUD_SSR`, `VPS_DOCKER`, `TO_CONFIRM`
- Familles possibles par hosting:
  - `SHARED_PHP` → `STATIC_SSG`, `CMS_MONO`
  - `CLOUD_STATIC` → `STATIC_SSG`
  - `CLOUD_SSR` → `APP_PLATFORM`
  - `VPS_DOCKER` → `STATIC_SSG`, `CMS_MONO`, `CMS_HEADLESS`, `APP_PLATFORM`
  - `TO_CONFIRM` → `STATIC_SSG`, `CMS_MONO`, `CMS_HEADLESS`, `APP_PLATFORM`

### ECOM
- Hosting autorisés (effectifs): `SHARED_PHP`, `VPS_DOCKER`, `TO_CONFIRM`
- Hosting exclus après filtrage de compatibilité: `CLOUD_SSR`
- Familles possibles par hosting:
  - `SHARED_PHP` → `COMMERCE_SELF_HOSTED`
  - `VPS_DOCKER` → `COMMERCE_SAAS`, `COMMERCE_SELF_HOSTED`, `COMMERCE_HEADLESS`
  - `TO_CONFIRM` → `COMMERCE_SAAS`, `COMMERCE_SELF_HOSTED`, `COMMERCE_HEADLESS`

### APP
- Hosting autorisés (effectifs): `CLOUD_SSR`, `VPS_DOCKER`, `TO_CONFIRM`
- Famille unique: `APP_PLATFORM`

---

## 2) Mode d’hébergement dérivé (wizard)

Le mode final est dérivé automatiquement à partir des contraintes métier:

- `NONE`
  - Cas: `ECOM` avec `commerceModel = SAAS` **et** architecture non headless.
  - Effet: pas de sélection front/back requise.

- `SINGLE`
  - Cas: architecture non headless, non split.
  - Effet: une seule cible d’hébergement (`hostingTarget`).

- `SPLIT`
  - Cas: architecture headless **ou** `APP` en backend séparé, backend non managé.
  - Effet: front + back obligatoires (`hostingTargetFront`, `hostingTargetBack`).

- `FRONT_ONLY`
  - Cas: architecture headless/app split avec backend managé.
  - Effet: seul le front est requis (`hostingTargetFront`), back nul.

---

## 3) Invariants de normalisation garantis

Après `normalizeTypeStackState`, les invariants suivants sont respectés:

1. `hostingTarget` appartient toujours aux hostings autorisés pour le type.
2. `projectFamily` est toujours valide pour le mode courant:
   - en `SINGLE`, elle est dans l’intersection type × hosting,
   - sinon, elle reste valide pour le type.
3. Plus de trou de normalisation avec `projectFamily = null` sur cas valides.
4. Si architecture non headless: implémentation frontend forcée à `null`.
5. Si architecture headless: implémentation frontend auto-initialisée si absente.
6. Champs `hostingTargetBack/Front` cohérents avec le mode (`SINGLE/NONE/FRONT_ONLY/SPLIT`).
7. Hors `APP`: backend remis en `FULLSTACK`, `backendFamily = null`, `backendOpsHeavy = false`.

---

## 4) Invariants qualification live

Sur un état wizard normalisé, l’appel `qualifyProject(...)` est stable:

- la qualification ne plante pas,
- les contraintes sont correctement projetées (ECOM/APP vs autres types),
- les floors de catégorie restent appliqués (ex: ECOM, APP, contraintes volumétriques/sensibilité/scalabilité, cas WP headless).

Rappels métier de départ:
- Catégorie initiale: `BLOG/VITRINE = CAT0`, `ECOM/APP = CAT2`.
- Rehaussements possibles: CI, contraintes, stack floor, modules structurants.

---

## 5) Couverture de vérification

La vérification automatisée inclut:

- tests unitaires wizard domain,
- test combinatoire wizard + qualification (échantillonnage massif des permutations),
- compilation TypeScript,
- suite Vitest complète (verte).

Le bug principal détecté puis corrigé pendant cet audit:
- fallback de famille invalide qui pouvait laisser `projectFamily = null` dans un sous-ensemble de combinaisons (`VITRINE` / `SINGLE` / `CLOUD_SSR`).

Cette classe d’état est désormais normalisée correctement.
