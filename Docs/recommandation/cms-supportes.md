# CMS supportés

## Contexte de lecture (realignement)

### Role du document

Document technique de reference sur le catalogue CMS (`cms.json`) et sur la facon de lire les capacites via la matrice canonique.

### Place dans le parcours de lecture

Cette page se lit apres [moteur-de-decision.md](./moteur-de-decision.md).

### Lien avec qualification et recommandation

Le choix de CMS intervient apres:

1. la determination de la `famille de projet` (niveau metier),
2. la recommandation du `mode de production` (niveau canonique),
3. puis l'arbitrage d'implementation.

Ce document couvre l'etape 3, pas la determination de la famille.

### Repere de vocabulaire

- `famille de projet` = axe metier canonique.
- `type de projet` = axe runtime derive/legacy.
- `cmsId` = identifiant technique d'implementation; il ne remplace pas la famille de projet.

## Sommaire

- [Contexte de lecture (realignement)](#contexte-de-lecture-realignement)
- [Role du document](#role-du-document)
- [Place dans le parcours de lecture](#place-dans-le-parcours-de-lecture)
- [Lien avec qualification et recommandation](#lien-avec-qualification-et-recommandation)
- [Repere de vocabulaire](#repere-de-vocabulaire)
- [Référentiel canonique](#référentiel-canonique)
- [Comment lire les capacités](#comment-lire-les-capacités)
- [Cas HEADLESS](#cas-headless)
- [Règle d’usage](#règle-dusage)

## Référentiel canonique

Les CMS supportés sont définis dans [cms.json](../_spec/cms.json). Les IDs sont immuables et utilisés partout (matrix, plugins, résolution).

## Comment lire les capacités

La capacité d’un CMS sur une feature est déterminée par `matrix` dans [capability-matrix.json](../_spec/capability-matrix.json) (source canonique), en croisant:

- les `cmsId` de [cms.json](../_spec/cms.json),
- les `featureId` de [features.json](../_spec/features.json).

`decision-rules.json` contient un miroir temporaire de la matrice pour compatibilité runtime.

## Cas HEADLESS

Le comportement headless s’appuie sur les propriétés de `cms.HEADLESS` dans [cms.json](../_spec/cms.json):

- `supportedFrontends`
- `supportedContentModes` (`GIT_MDX`, `HEADLESS_CMS`, `CUSTOM_ADMIN`)

## Règle d’usage

Pour les scripts, générateurs et contrôles: parser uniquement les JSON canoniques, jamais ce Markdown.

## Navigation

- Précédent: [moteur-de-decision.md](./moteur-de-decision.md)
- Suivant: [classification-des-capacites.md](./classification-des-capacites.md)
