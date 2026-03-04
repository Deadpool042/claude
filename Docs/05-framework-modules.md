# 05 — Catalogue canonique des modules framework

## Sommaire

- [Source canonique](#source-canonique)
- [Champs clés du module](#champs-clés-du-module)
- [Contraintes économiques](#contraintes-économiques)
- [Règle anti-dérive](#règle-anti-dérive)

## Source canonique

Le catalogue modules est défini dans [modules.json](./_spec/modules.json). Les invariants de cardinalité et de cohérence sont définis dans [decision-rules.json](./_spec/decision-rules.json).

## Champs clés du module

- Identité: `id` (immuable)
- Fonctionnel: `featureIds`, `compatibility`, `recommendedPluginsByCMS`
- Effort et exploitation: `estimatedEffort`, `ciImpact`
- Commercial: `pricingMode`, `priceSetupMin/Max`, `priceMonthlyMin/Max`, `targetCategory|minCategory`, `economicGuardrails`

## Contraintes économiques

Les règles de cohérence sont lues dans `economicRules.pricingCoherence` de [decision-rules.json](./_spec/decision-rules.json). Le positionnement tarifaire des catégories est lu dans `economicRules.basePricingByCategory`.

## Règle anti-dérive

Cette page ne maintient pas de copie manuelle de la liste des modules. Toute vérification de catalogue doit se faire dans [modules.json](./_spec/modules.json).

## Navigation

- Précédent: [04-cms-capability-matrix.md](./04-cms-capability-matrix.md)
- Suivant: [06-plugin-integrations.md](./06-plugin-integrations.md)
