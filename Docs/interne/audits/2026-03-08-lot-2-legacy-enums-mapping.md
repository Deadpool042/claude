# Lot 2 — Legacy enums mapping

## Scope

- `site-factory/src/lib/referential/project.ts`
- `site-factory/src/lib/referential/maintenance-cat.ts`
- `site-factory/src/lib/referential/stack-profiles.ts`
- `site-factory/src/lib/referential/deploy.ts`
- `site-factory/src/lib/qualification-runtime.ts`

## Enum mapping

| Current enum/type | Current values                         | Nature                | Future equivalent                                                                                            | Action            | Notes                                                   |
| ----------------- | -------------------------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------ | ----------------- | ------------------------------------------------------- |
| `ProjectType`     | `BLOG`, `VITRINE`, `ECOM`, `APP`       | `LEGACY_TRANSITIONAL` | Signal transitoire remplacé progressivement par l’entrée canonique puis mappé vers `solutionFamily`          | `REMOVE_LATER`    | Aujourd’hui encore beaucoup trop structurant.           |
| `Category`        | `CAT0`, `CAT1`, `CAT2`, `CAT3`, `CAT4` | `LEGACY_TRANSITIONAL` | Couche de compatibilité temporaire sans équivalent cible direct                                              | `REMOVE_LATER`    | Sert encore à la maintenance, au pricing et aux floors. |
| `MaintenanceCat`  | Catégories de maintenance historiques  | `LEGACY_TRANSITIONAL` | Futur `operationsProfile` / `hostingProfile` / niveau de service                                             | `RENAME`          | À sortir du couplage avec `Category`.                   |
| `LegacyTechStack` | Valeurs legacy de stack technique      | `TECHNICAL`           | Préférence technique, contrainte secondaire, puis mapping vers `implementationStrategy` / `technicalProfile` | `MOVE_DOWNSTREAM` | Ne doit plus être un pivot de décision métier.          |
| `DeployTarget`    | Cibles de déploiement historiques      | `TECHNICAL`           | `hostingProfile` ou contrainte d’exploitation                                                                | `MOVE_DOWNSTREAM` | Aujourd’hui trop présent dans la qualification.         |
| `BillingMode`     | `SOLO`, `SOUS_TRAITANT`                | `LEGACY_TRANSITIONAL` | `deliveryModel` + `commercialProfile` + éventuelle logique commerciale dédiée                                | `REMOVE_LATER`    | À démanteler progressivement.                           |

## Notes de transition

- `ProjectType` et `Category` restent nécessaires à court terme pour la compatibilité du runtime existant.
- `LegacyTechStack`, `DeployTarget` et `wpHeadless` doivent descendre au rang de préférences, contraintes ou mappings techniques aval.
- `BillingMode` doit être progressivement remplacé par des sorties plus explicites du moteur, notamment `deliveryModel` et `commercialProfile`.
- Le but n’est pas de supprimer immédiatement ces enums, mais de documenter leur statut transitoire avant extraction/refactor.
