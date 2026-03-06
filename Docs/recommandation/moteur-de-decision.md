# Moteur de décision

## Contexte de lecture (realignement)

### Role du document

Document de reference qui decrit le moteur de decision spec-first (entrees parsees, sorties derivees, flux canonique, composante economique).

### Place dans le parcours de lecture

Lire apres la qualification produit, puis utiliser les autres pages de `Docs/recommandation` et `Docs/technique` pour descendre dans le detail.

### Lien avec qualification et recommandation

Le moteur s'insere dans la chaine:

1. besoin et contraintes,
2. `famille de projet` cible,
3. `mode de production` recommande,
4. implementation et impact economique.

Ce document couvre surtout les etapes 3 et 4 cote execution. La logique metier canonique reste dans `Docs/_spec`.

### Repere de vocabulaire

- `famille de projet` (canonique metier) est distincte des objets runtime techniques (`type de projet`, `famille technique`, `offre runtime`).
- Les alias runtime legacy (`PLUGIN`, `MODULE`) doivent etre lus comme des derives de `PLUGIN_INTEGRATION` et `FRAMEWORK_MODULE`.
- `categorie` designe ici les niveaux `CAT0..CAT4`, pas une famille de projet.

## Sommaire

- [Contexte de lecture (realignement)](#contexte-de-lecture-realignement)
- [Role du document](#role-du-document)
- [Place dans le parcours de lecture](#place-dans-le-parcours-de-lecture)
- [Lien avec qualification et recommandation](#lien-avec-qualification-et-recommandation)
- [Repere de vocabulaire](#repere-de-vocabulaire)
- [Source canonique](#source-canonique)
- [Entrées et sorties](#entrées-et-sorties)
- [Flux de décision](#flux-de-décision)
- [Composante économique](#composante-économique)

## Source canonique

Le moteur consomme:

- [decision-rules.json](../_spec/decision-rules.json)
- [commercial.json](../_spec/commercial.json)
- [cms.json](../_spec/cms.json), [features.json](../_spec/features.json), [plugins.json](../_spec/plugins.json), [modules.json](../_spec/modules.json), [custom-stacks.json](../_spec/custom-stacks.json)

## Entrées et sorties

Entrées parseables:

- `cmsId`
- `featureId`
- `projectFlags`

Sorties parseables:

- `classification`
- `implementationType`
- `recommendedModuleId` (optionnel)
- `recommendedPluginIds` (optionnel)
- `recommendedContentWorkflow` (optionnel)
- `recommendedStackProfileId` (optionnel)

## Flux de décision

Le flux est défini dans `decisionFlow`, et l’ordre canonique dans `decisionOrderCanonical` de [decision-rules.json](../_spec/decision-rules.json).

## Composante économique

La partie économique provient de:

- `economicRules` de [decision-rules.json](../_spec/decision-rules.json)
- `basePackageBandsByCategory`, `maintenanceByCategory`, `annexCosts` de [commercial.json](../_spec/commercial.json)

Le pipeline final de sortie est `decisionOutputPipeline` dans [decision-rules.json](../_spec/decision-rules.json).

## Navigation

- Précédent: [../qualification/logique-de-qualification.md](../qualification/logique-de-qualification.md)
- Suivant: [cms-supportes.md](./cms-supportes.md)
- Index: [../README.md](../README.md)
