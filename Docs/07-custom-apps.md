# 07 — CUSTOM_APP

## Sommaire

- [Sources canoniques](#sources-canoniques)
- [Conditions de bascule](#conditions-de-bascule)
- [Workflow de contenu](#workflow-de-contenu)
- [Profils custom stack](#profils-custom-stack)

## Sources canoniques

- Règles de bascule: `economicRules.customAppWhen` dans [decision-rules.json](./_spec/decision-rules.json)
- Modes de contenu supportés: `cms.HEADLESS.supportedContentModes` dans [cms.json](./_spec/cms.json)
- Profils: [custom-stacks.json](./_spec/custom-stacks.json)

## Conditions de bascule

Le moteur choisit `CUSTOM_APP` lorsque les règles de `customAppWhen` sont satisfaites (ex: refus CMS, SaaS/custom platform, backend requis).

## Workflow de contenu

Le workflow recommandé (`GIT_MDX`, `HEADLESS_CMS`, `CUSTOM_ADMIN`) est déterminé par la spec et les drapeaux projet, puis renvoyé dans la sortie de résolution.

## Profils custom stack

Les profils disponibles sont définis dans [custom-stacks.json](./_spec/custom-stacks.json) et peuvent être restreints par `customStackProfiles` dans [decision-rules.json](./_spec/decision-rules.json).

## Navigation

- Précédent: [06-plugin-integrations.md](./06-plugin-integrations.md)
- Suivant: [08-decision-engine.md](./08-decision-engine.md)
