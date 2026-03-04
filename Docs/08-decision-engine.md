# 08 — Moteur de décision

## Sommaire

- [Source canonique](#source-canonique)
- [Entrées et sorties](#entrées-et-sorties)
- [Flux de décision](#flux-de-décision)
- [Composante économique](#composante-économique)

## Source canonique

Le moteur consomme:

- [decision-rules.json](./_spec/decision-rules.json)
- [commercial.json](./_spec/commercial.json)
- [cms.json](./_spec/cms.json), [features.json](./_spec/features.json), [plugins.json](./_spec/plugins.json), [modules.json](./_spec/modules.json), [custom-stacks.json](./_spec/custom-stacks.json)

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

Le flux est défini dans `decisionFlow`, et l’ordre canonique dans `decisionOrderCanonical` de [decision-rules.json](./_spec/decision-rules.json).

## Composante économique

La partie économique provient de:

- `economicRules` de [decision-rules.json](./_spec/decision-rules.json)
- `basePackageBandsByCategory`, `maintenanceByCategory`, `annexCosts` de [commercial.json](./_spec/commercial.json)

Le pipeline final de sortie est `decisionOutputPipeline` dans [decision-rules.json](./_spec/decision-rules.json).

## Navigation

- Précédent: [07-custom-apps.md](./07-custom-apps.md)
- Index: [README.md](./README.md)
