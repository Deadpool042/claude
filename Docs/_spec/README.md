# _spec — Source canonique machine-readable

Ce dossier contient la source unique de vérité exécutable du référentiel.

## Règles canoniques

- `Docs/_spec` est canonique.
- Les IDs sont stables et immuables (`cms.*`, `feature.*`, `plugin.*`, `module.*`).
- Le moteur de décision reste représentable par le flux canonique: `feature -> CMS_NATIVE -> PLUGIN -> MODULE -> CUSTOM_APP` (+ `THEME_FEATURE`).
- La documentation métier doit référencer la spec au lieu de dupliquer sa logique.

## Fichiers

- `cms.json`: CMS, type, modèle éditorial, modèle d’extension.
- `features.json`: features atomiques et classification thème/UX.
- `plugins.json`: plugins/apps avec mapping feature↔CMS et informations de pricing.
- `modules.json`: modules framework internes avec effort, compatibilité et impact CI.
- `capability-matrix.json`: matrice canonique feature x CMS.
- `decision-rules.json`: règles de décision, ordre canonique, invariants, règles économiques.
- `commercial.json`: bandes tarifaires, frais one-time, coûts récurrents, coûts ownership/hosting.
- `custom-stacks.json`: profils de custom stack et conditions d’activation.
- `shared-socle.json`: placeholder du socle technique partagé.

## Invariants de build (documentation)

- Chaque `cmsId` référencé dans la capability matrix existe dans `cms.json`.
- Chaque `featureId` référencé existe dans `features.json`.
- Chaque `pluginId` référencé existe dans `plugins.json`.
- Chaque `moduleId` référencé existe dans `modules.json`.
- `feature.DARK_MODE` reste toujours classée `THEME_FEATURE`.
- Aucun module ne doit dupliquer une feature déjà couverte en `CMS_NATIVE` ou `PLUGIN_INTEGRATION`.

## Workflow

1. Modifier les JSON dans ce dossier.
2. Exécuter `pnpm spec:audit`.
3. Exécuter `pnpm spec:sync`.
4. Vérifier l'absence de dérive avec `pnpm spec:check`.
5. Exécuter `pnpm validate`.

## Audit CI strict

- `pnpm spec:audit` échoue s'il existe des erreurs bloquantes.
- `pnpm spec:audit:strict` échoue s'il existe des erreurs **ou** des warnings.
- `pnpm validate:spec` exécute l'audit strict + anti-dérive de la spec.
- `pnpm validate` utilise le mode strict avant typecheck/tests.
- Le workflow GitHub Actions `.github/workflows/spec-quality.yml` exécute `pnpm validate:spec` sur PR/push `main`.

## Miroir généré côté application

- Dossier miroir: `site-factory/src/lib/referential/spec/data`.
- Ce dossier est généré depuis `Docs/_spec` et ne doit jamais être édité manuellement.
- Voir `GENERATION.md`.
