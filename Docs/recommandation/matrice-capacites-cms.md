# Matrice de capacité CMS

## Contexte de lecture (realignement)

### Role du document

Document technique sur la structure de la matrice canonique des capacites par CMS et sur ses invariants de coherence.

### Place dans le parcours de lecture

Lire apres [classification-des-capacites.md](./classification-des-capacites.md).

### Lien avec qualification et recommandation

La matrice est utilisee pendant la recommandation technique pour traduire un besoin fonctionnel en mode d'implementation par CMS.

Elle ne determine pas seule la `famille de projet`: cette determination se fait en amont dans la qualification produit.

### Repere de vocabulaire

- `classification` de la matrice = mode de production par feature/CMS.
- `recommendedModuleId` et `recommendedPluginIds` sont des sorties d'implementation, pas des familles de projet.
- Toute valeur legacy runtime doit etre explicitee comme derivee/transitoire.

## Sommaire

- [Contexte de lecture (realignement)](#contexte-de-lecture-realignement)
- [Role du document](#role-du-document)
- [Place dans le parcours de lecture](#place-dans-le-parcours-de-lecture)
- [Lien avec qualification et recommandation](#lien-avec-qualification-et-recommandation)
- [Repere de vocabulaire](#repere-de-vocabulaire)
- [Source canonique](#source-canonique)
- [Structure de la matrice](#structure-de-la-matrice)
- [Valeurs de classification](#valeurs-de-classification)
- [Règle anti-dérive](#règle-anti-dérive)

## Source canonique

La matrice canonique est `matrix` dans [capability-matrix.json](../_spec/capability-matrix.json).

`decision-rules.json` conserve un miroir de la matrice pour compatibilité runtime.

## Structure de la matrice

Chaque entrée correspond à:

- un `featureId`,
- un ensemble de lignes `rows`,
- une ligne par `cmsId` avec `classification`, et éventuellement `recommendedModuleId` / `recommendedPluginIds`.

`recommendedPluginIds` est optionnel: il ne doit contenir que des plugins qui déclarent explicitement le `featureId` dans `plugins.json`. S'il n'y a pas de plugin déclaré pour cette feature, le champ est omis.
Il doit aussi respecter la compatibilité CMS déclarée par le plugin (`plugins.json.cmsIds`).

La liste des features est dans [features.json](../_spec/features.json), la liste des CMS dans [cms.json](../_spec/cms.json).

## Valeurs de classification

- `CMS_NATIVE`
- `PLUGIN_INTEGRATION`
- `FRAMEWORK_MODULE`
- `CUSTOM_APP`
- `THEME_FEATURE`

## Règle anti-dérive

Cette page ne réplique plus la matrice complète pour éviter les incohérences. Toute lecture exhaustive doit se faire directement dans [capability-matrix.json](../_spec/capability-matrix.json).

## Navigation

- Précédent: [classification-des-capacites.md](./classification-des-capacites.md)
- Suivant: [../technique/architecture-spec-first.md](../technique/architecture-spec-first.md)
