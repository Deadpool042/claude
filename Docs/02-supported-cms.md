# 02 — CMS supportés

## Sommaire

- [Référentiel canonique](#référentiel-canonique)
- [Comment lire les capacités](#comment-lire-les-capacités)
- [Cas HEADLESS](#cas-headless)
- [Règle d’usage](#règle-dusage)

## Référentiel canonique

Les CMS supportés sont définis dans [cms.json](./_spec/cms.json). Les IDs sont immuables et utilisés partout (matrix, plugins, résolution).

## Comment lire les capacités

La capacité d’un CMS sur une feature est déterminée par `matrix` dans [decision-rules.json](./_spec/decision-rules.json), en croisant:

- les `cmsId` de [cms.json](./_spec/cms.json),
- les `featureId` de [features.json](./_spec/features.json).

## Cas HEADLESS

Le comportement headless s’appuie sur les propriétés de `cms.HEADLESS` dans [cms.json](./_spec/cms.json):

- `supportedFrontends`
- `supportedContentModes` (`GIT_MDX`, `HEADLESS_CMS`, `CUSTOM_ADMIN`)

## Règle d’usage

Pour les scripts, générateurs et contrôles: parser uniquement les JSON canoniques, jamais ce Markdown.

## Navigation

- Précédent: [01-framework-overview.md](./01-framework-overview.md)
- Suivant: [03-feature-classification.md](./03-feature-classification.md)
