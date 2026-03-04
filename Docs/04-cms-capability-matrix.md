# 04 — Matrice de capacité CMS

## Sommaire

- [Source canonique](#source-canonique)
- [Structure de la matrice](#structure-de-la-matrice)
- [Valeurs de classification](#valeurs-de-classification)
- [Règle anti-dérive](#règle-anti-dérive)

## Source canonique

La matrice exécutable est `matrix` dans [decision-rules.json](./_spec/decision-rules.json).

## Structure de la matrice

Chaque entrée correspond à:

- un `featureId`,
- un ensemble de lignes `rows`,
- une ligne par `cmsId` avec `classification`, et éventuellement `recommendedModuleId` / `recommendedPluginIds`.

La liste des features est dans [features.json](./_spec/features.json), la liste des CMS dans [cms.json](./_spec/cms.json).

## Valeurs de classification

- `CMS_NATIVE`
- `PLUGIN_INTEGRATION`
- `FRAMEWORK_MODULE`
- `CUSTOM_APP`
- `THEME_FEATURE`

## Règle anti-dérive

Cette page ne réplique plus la matrice complète pour éviter les incohérences. Toute lecture exhaustive doit se faire directement dans [decision-rules.json](./_spec/decision-rules.json).

## Navigation

- Précédent: [03-feature-classification.md](./03-feature-classification.md)
- Suivant: [05-framework-modules.md](./05-framework-modules.md)
