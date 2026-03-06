# Mode CUSTOM_APP

## Contexte de lecture (realignement)

### Role du document

Document technique sur le mode de production canonique `CUSTOM_APP` et ses effets d'implementation (workflow de contenu, profils de stack custom).

### Place dans le parcours de lecture

Lire cette page apres [integrations-plugins-et-apps.md](./integrations-plugins-et-apps.md).

### Lien avec qualification et recommandation

Le mode `CUSTOM_APP` est selectionne dans la qualification comme mode principal de production quand les regles canoniques l'imposent.

Cette page detaille la suite technique de cette decision, mais ne determine pas la famille de projet.

### Repere de vocabulaire

- `CUSTOM_APP` = mode de production canonique.
- `APP_CUSTOM` = offre runtime legacy (derivee), a ne pas confondre avec le mode.
- `APP_PLATFORM` = famille technique runtime, distincte des familles de projet cibles (`MVP_SAAS`, `APP_METIER`).

## Sommaire

- [Contexte de lecture (realignement)](#contexte-de-lecture-realignement)
- [Role du document](#role-du-document)
- [Place dans le parcours de lecture](#place-dans-le-parcours-de-lecture)
- [Lien avec qualification et recommandation](#lien-avec-qualification-et-recommandation)
- [Repere de vocabulaire](#repere-de-vocabulaire)
- [Sources canoniques](#sources-canoniques)
- [Conditions de bascule](#conditions-de-bascule)
- [Workflow de contenu](#workflow-de-contenu)
- [Profils custom stack](#profils-custom-stack)

## Sources canoniques

- Règles de bascule: `economicRules.customAppWhen` dans [decision-rules.json](../_spec/decision-rules.json)
- Modes de contenu supportés: `cms.HEADLESS.supportedContentModes` dans [cms.json](../_spec/cms.json)
- Profils: [custom-stacks.json](../_spec/custom-stacks.json)

## Conditions de bascule

Le moteur choisit `CUSTOM_APP` lorsque les règles de `customAppWhen` sont satisfaites (ex: refus CMS, SaaS/custom platform, backend requis).

## Workflow de contenu

Le workflow recommandé (`GIT_MDX`, `HEADLESS_CMS`, `CUSTOM_ADMIN`) est déterminé par la spec et les drapeaux projet, puis renvoyé dans la sortie de résolution.

## Profils custom stack

Les profils disponibles sont définis dans [custom-stacks.json](../_spec/custom-stacks.json) et peuvent être restreints par `customStackProfiles` dans [decision-rules.json](../_spec/decision-rules.json).

## Navigation

- Précédent: [integrations-plugins-et-apps.md](./integrations-plugins-et-apps.md)
- Suivant: [socle/README.md](./socle/README.md)
