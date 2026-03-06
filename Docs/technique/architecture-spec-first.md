# Architecture spec-first

## Contexte de lecture (realignement)

### Role du document

Document technique d'entree pour comprendre le contrat spec-first et les objets JSON canoniques utilises par le moteur.

Le terme `framework` du titre est un libelle historique (legacy): il designe ici le socle technique Site Factory, pas une famille de projet.

### Place dans le parcours de lecture

Lire ce document apres:

1. [../produit/vision-produit.md](../produit/vision-produit.md)
2. [../produit/positionnement-offres.md](../produit/positionnement-offres.md)
3. [../produit/taxonomie-projets.md](../produit/taxonomie-projets.md)
4. [../qualification/logique-de-qualification.md](../qualification/logique-de-qualification.md)
5. [../produit/glossaire-et-mapping-taxonomique.md](../produit/glossaire-et-mapping-taxonomique.md)

### Lien avec qualification et recommandation

Ce document intervient apres la determination de la `famille de projet` et du `mode de production` (niveau produit). Il cadre ensuite la couche technique qui execute les recommandations.

### Repere de vocabulaire

- `famille de projet` = taxonomie strategique canonique (`SITE_VITRINE`, `SITE_BUSINESS`, `ECOMMERCE`, `MVP_SAAS`, `APP_METIER`).
- `type de projet` = terme runtime derive/legacy (`BLOG`, `VITRINE`, `ECOM`, `APP`).
- Les docs Markdown de cette couche sont des vues derivees; la source de verite reste `Docs/_spec/*`.

## Sommaire

- [Architecture spec-first](#architecture-spec-first)
  - [Contexte de lecture (realignement)](#contexte-de-lecture-realignement)
    - [Role du document](#role-du-document)
    - [Place dans le parcours de lecture](#place-dans-le-parcours-de-lecture)
    - [Lien avec qualification et recommandation](#lien-avec-qualification-et-recommandation)
    - [Repere de vocabulaire](#repere-de-vocabulaire)
  - [Sommaire](#sommaire)
- [Contrat spec-first](#contrat-spec-first)
- [Objets canoniques](#objets-canoniques)
- [Invariants canoniques](#invariants-canoniques)
- [Pipeline cible](#pipeline-cible)
- [Workflow équipe](#workflow-équipe)
- [Navigation](#navigation)

## Contrat spec-first

La logique exécutable vit uniquement dans `Docs/_spec/*.json`. Les fichiers Markdown sont des vues de lecture et ne doivent pas devenir une seconde source de vérité.


## Objets canoniques

- [cms.json](../_spec/cms.json)
- [features.json](../_spec/features.json)
- [plugins.json](../_spec/plugins.json)
- [modules.json](../_spec/modules.json)
- [capability-matrix.json](../_spec/capability-matrix.json)
- [decision-rules.json](../_spec/decision-rules.json)
- [commercial.json](../_spec/commercial.json)
- [custom-stacks.json](../_spec/custom-stacks.json)
- [shared-socle.json](../_spec/shared-socle.json)
- [stack-profiles.json](../_spec/stack-profiles.json)
- [infra-services.json](../_spec/infra-services.json)

## Invariants canoniques

- IDs uniques et immuables par catalogue.
- Références valides (features, modules, plugins, CMS, mapping stack).
- Domaines de features bornés aux enums définis.
- Matrice exhaustive (chaque feature a une ligne par CMS).

Voir la liste détaillée dans [../_spec/README.md](../_spec/README.md).

## Note d'audit (mars 2026)

La matrice `capability-matrix.json` a été auditée et corrigée :
- Les recommandations de plugins sont strictement limitées aux cas pertinents pour chaque CMS/feature.
- Les plugins non justifiés (ex : Yotpo, Mailchimp, etc. pour Drupal) ont été supprimés.
- La méthode de correction s'est faite par lots, avec validation à chaque étape.

## Pipeline cible

Le pipeline de sortie est défini par `decisionOutputPipeline` dans [decision-rules.json](../_spec/decision-rules.json) :

`project_requirements` → `recommended_CMS` → `recommended_plugins` → `activated_modules` → `recommended_content_workflow` → `recommended_stack_profile` → `technical_stack` → `estimated_cost`

## Workflow équipe

1. Modifier `Docs/_spec/*.json`.
2. Synchroniser avec `pnpm spec:sync`.
3. Vérifier `pnpm spec:check`.
4. Valider avec `pnpm validate`.

## Navigation

- Précédent: [../recommandation/matrice-capacites-cms.md](../recommandation/matrice-capacites-cms.md)
- Suivant: [catalogue-modules-framework.md](./catalogue-modules-framework.md)
