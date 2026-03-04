# 06 — Intégrations plugin/app

## Sommaire

- [Sources canoniques](#sources-canoniques)
- [Décision plugin vs module](#décision-plugin-vs-module)
- [Champs pricing plugin](#champs-pricing-plugin)
- [Règle anti-dérive](#règle-anti-dérive)

## Sources canoniques

- Catalogue: [plugins.json](./_spec/plugins.json)
- Arbitrage économique: [decision-rules.json](./_spec/decision-rules.json)
- Impact devis: [commercial.json](./_spec/commercial.json)

## Décision plugin vs module

Les conditions sont définies dans:

- `economicRules.preferPluginWhen`
- `economicRules.pluginVsModuleDecision`

de [decision-rules.json](./_spec/decision-rules.json).

## Champs pricing plugin

Le catalogue plugin peut contenir:

- `pricingMode`
- `priceMonthlyMin` / `priceMonthlyMax`
- `billingNotes`
- `pricing.mode`, `pricing.monthlyRange`, `pricing.sourceUrl`

Ces champs servent à estimer les coûts tiers récurrents côté application.

## Règle anti-dérive

Cette page n’embarque pas de liste statique d’IDs plugin. La liste exhaustive est toujours [plugins.json](./_spec/plugins.json).

## Navigation

- Précédent: [05-framework-modules.md](./05-framework-modules.md)
- Suivant: [07-custom-apps.md](./07-custom-apps.md)
