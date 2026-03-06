# Système de classification des fonctionnalités

## Contexte de lecture (realignement)

### Role du document

Document technique qui formalise la classification d'une `capacite` (`feature.*`) par CMS, via les modes de production canoniques.

### Place dans le parcours de lecture

Lire cette page apres [cms-supportes.md](./cms-supportes.md).

### Lien avec qualification et recommandation

La classification de feature sert l'etape "comment implementer" une recommandation, une fois la `famille de projet` et le mode principal de production deja qualifies.

### Repere de vocabulaire

- `feature` = `capacite` canonique.
- `module` = brique de realisation reutilisable (ce n'est pas un synonyme de `feature`).
- Les alias runtime courts (`PLUGIN`, `MODULE`) sont legacy/transitoires; en documentation metier, conserver `PLUGIN_INTEGRATION` et `FRAMEWORK_MODULE`.

## Sommaire

- [Contexte de lecture (realignement)](#contexte-de-lecture-realignement)
- [Role du document](#role-du-document)
- [Place dans le parcours de lecture](#place-dans-le-parcours-de-lecture)
- [Lien avec qualification et recommandation](#lien-avec-qualification-et-recommandation)
- [Repere de vocabulaire](#repere-de-vocabulaire)
- [Enum canonique](#enum-canonique)
- [Source de décision](#source-de-décision)
- [Invariants critiques](#invariants-critiques)
- [Contrôles côté app](#contrôles-côté-app)

## Enum canonique

Les valeurs autorisées sont définies dans `classificationEnum` de [decision-rules.json](../_spec/decision-rules.json):

- `CMS_NATIVE`
- `PLUGIN_INTEGRATION`
- `FRAMEWORK_MODULE`
- `CUSTOM_APP`
- `THEME_FEATURE`

## Source de décision

Le classement effectif d’une feature n’est pas défini dans ce document: il est lu dans `matrix` de [capability-matrix.json](../_spec/capability-matrix.json), avec les features de [features.json](../_spec/features.json).

`decision-rules.json` conserve un miroir de la matrice pour compatibilité runtime.

Note de transition: certains parcours runtime exposent encore des alias legacy (`PLUGIN`, `MODULE`) dans l'ordre de decision. Ils doivent etre lus comme des derives de `PLUGIN_INTEGRATION` et `FRAMEWORK_MODULE`.

## Invariants critiques

- `feature.DARK_MODE` doit rester `THEME_FEATURE` sur tous les CMS.
- Les features UI/thème ne doivent pas basculer en module framework.
- Les IDs de features/CMS/modules/plugins restent immuables.
- Les `feature.domain` sont limités aux enums canoniques.
- Chaque `featureId` doit exister dans la matrice canonique.

Ces invariants sont déclarés dans [decision-rules.json](../_spec/decision-rules.json) et validés au chargement.

## Contrôles côté app

Les contrôles sont appliqués dans le loader spec et échouent explicitement en cas de violation.

## Navigation

- Précédent: [cms-supportes.md](./cms-supportes.md)
- Suivant: [matrice-capacites-cms.md](./matrice-capacites-cms.md)
