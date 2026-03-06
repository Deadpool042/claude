# Intégrations plugin/app

## Contexte de lecture (realignement)

### Role du document

Document technique sur le catalogue plugins et l'arbitrage economique `plugin` vs `module`.

### Place dans le parcours de lecture

Lire apres [catalogue-modules-framework.md](./catalogue-modules-framework.md), une fois le cadrage produit et la recommandation acquis.

### Lien avec qualification et recommandation

Cette page concerne l'etape d'implementation d'une recommandation deja qualifiee. Elle ne remplace pas:

- la determination de la `famille de projet`,
- ni le choix du `mode de production` principal.

### Repere de vocabulaire

- `plugin` = composant tiers integre a un CMS.
- `module` = brique canonique de realisation (peut recommander un ou plusieurs plugins).
- `app` dans le titre est un libelle historique (legacy): il faut expliciter `mode CUSTOM_APP` ou `offre runtime APP_CUSTOM` selon le contexte.

## Sommaire

- [Contexte de lecture (realignement)](#contexte-de-lecture-realignement)
- [Role du document](#role-du-document)
- [Place dans le parcours de lecture](#place-dans-le-parcours-de-lecture)
- [Lien avec qualification et recommandation](#lien-avec-qualification-et-recommandation)
- [Repere de vocabulaire](#repere-de-vocabulaire)
- [Sources canoniques](#sources-canoniques)
- [Décision plugin vs module](#décision-plugin-vs-module)
- [Champs pricing plugin](#champs-pricing-plugin)
- [Règle anti-dérive](#règle-anti-dérive)

## Sources canoniques

- Catalogue: [plugins.json](../_spec/plugins.json)
- Arbitrage économique: [decision-rules.json](../_spec/decision-rules.json)
- Impact devis: [commercial.json](../_spec/commercial.json)

## Décision plugin vs module

Les conditions sont définies dans:

- `economicRules.preferPluginWhen`
- `economicRules.pluginVsModuleDecision`

de [decision-rules.json](../_spec/decision-rules.json).

## Champs pricing plugin

Le catalogue plugin peut contenir:

- `pricingMode`
- `priceMonthlyMin` / `priceMonthlyMax`
- `billingNotes`
- `pricing.mode`, `pricing.monthlyRange`, `pricing.sourceUrl`

Ces champs servent à estimer les coûts tiers récurrents côté application.

## Règle anti-dérive

Cette page n’embarque pas de liste statique d’IDs plugin. La liste exhaustive est toujours [plugins.json](../_spec/plugins.json).

## Navigation

- Précédent: [catalogue-modules-framework.md](./catalogue-modules-framework.md)
- Suivant: [mode-custom-app.md](./mode-custom-app.md)
