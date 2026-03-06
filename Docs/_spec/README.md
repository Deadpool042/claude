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
- `stack-profiles.json`: familles de stack et profils techniques.
- `infra-services.json`: briques infrastructure optionnelles (Docker, monitoring, cache, etc.).

## Invariants de build (documentation)

- Tous les IDs sont uniques par catalogue (`cms`, `features`, `modules`, `plugins`, `infra-services`, `stack-profiles`, `custom-stacks`, `shared-socle`).
- Chaque `cmsId` référencé dans la capability matrix existe dans `cms.json`.
- Chaque `featureId` référencé existe dans `features.json`.
- Chaque `pluginId` référencé existe dans `plugins.json`.
- Chaque `recommendedPluginId` pointe vers un plugin qui déclare le `featureId` correspondant dans `plugins.json` (sinon le champ est omis).
- Chaque `recommendedPluginId` ne peut apparaître que si le plugin cible supporte le `cmsId` de la ligne (`plugins.json.cmsIds`).
- Chaque `moduleId` référencé existe dans `modules.json`.
- Chaque `recommendedModuleId` pointe vers un module qui liste la feature correspondante dans `modules.json`.
- Chaque `featureId` doit avoir une entrée dans `capability-matrix.json` avec une ligne par `cmsId`.
- `decision-rules.matrix` est un miroir strict de `capability-matrix.json` (aucune divergence).
- Les `feature.domain` sont limités à: `CONTENT`, `ECOMMERCE`, `ANALYTICS`, `MARKETING`, `INTEGRATION`, `SECURITY`, `THEME`.
- Les `feature.dependencies` référencent des features existantes et ne contiennent pas de cycles.
- `stack-profiles.implementationMapping` pointe uniquement vers des `profiles[].id` existants.
- `stack-profiles.projectFamilyMapping` pointe uniquement vers des `families[].id` existants.
- `feature.DARK_MODE` reste toujours classée `THEME_FEATURE`.
- Aucun module ne doit dupliquer une feature déjà couverte en `CMS_NATIVE` ou `PLUGIN_INTEGRATION`.

## Note d'audit (mars 2026)

- La matrice capability-matrix.json a été auditée et corrigée pour garantir que chaque plugin recommandé est strictement pertinent pour le couple CMS/feature.
- Les plugins non justifiés (ex : Yotpo, Mailchimp, etc. pour Drupal) ont été supprimés.
- Les corrections ont été appliquées par lots, avec validation à chaque étape.


## Workflow

1. Modifier les JSON dans ce dossier.
2. Exécuter `pnpm spec:audit`.
3. Exécuter `pnpm spec:sync`.
4. Vérifier l'absence de dérive avec `pnpm spec:check`.
5. Exécuter `pnpm validate`.

## Artefacts générés (non canoniques)

- `audit-step2.raw.json` est généré par `pnpm spec:audit` et n'est **pas** une spec canonique.
- Il peut être supprimé puis régénéré sans impact sur la source de vérité.

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
