# 03 — Système de classification des fonctionnalités

## Sommaire

- [Enum canonique](#enum-canonique)
- [Source de décision](#source-de-décision)
- [Invariants critiques](#invariants-critiques)
- [Contrôles côté app](#contrôles-côté-app)

## Enum canonique

Les valeurs autorisées sont définies dans `classificationEnum` de [decision-rules.json](./_spec/decision-rules.json):

- `CMS_NATIVE`
- `PLUGIN_INTEGRATION`
- `FRAMEWORK_MODULE`
- `CUSTOM_APP`
- `THEME_FEATURE`

## Source de décision

Le classement effectif d’une feature n’est pas défini dans ce document: il est lu dans `matrix` de [decision-rules.json](./_spec/decision-rules.json), avec les features de [features.json](./_spec/features.json).

## Invariants critiques

- `feature.DARK_MODE` doit rester `THEME_FEATURE` sur tous les CMS.
- Les features UI/thème ne doivent pas basculer en module framework.
- Les IDs de features/CMS/modules/plugins restent immuables.

Ces invariants sont déclarés dans [decision-rules.json](./_spec/decision-rules.json) et validés au chargement.

## Contrôles côté app

Les contrôles sont appliqués dans le loader spec et échouent explicitement en cas de violation.

## Navigation

- Précédent: [02-supported-cms.md](./02-supported-cms.md)
- Suivant: [04-cms-capability-matrix.md](./04-cms-capability-matrix.md)
