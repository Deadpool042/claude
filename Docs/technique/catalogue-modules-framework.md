# Catalogue canonique des modules framework

## Contexte de lecture (realignement)

### Role du document

Document technique sur le catalogue canonique des `modules` (`modules.json`) et sur leurs implications d'implementation/economie.

### Place dans le parcours de lecture

Lire apres la chaine recommandation, puis utiliser cette page comme point d'entree de l'implementation detaillee.

### Lien avec qualification et recommandation

Cette page intervient dans la phase "implementation recommandee" du pipeline.

- La qualification determine d'abord `famille de projet` puis `mode de production`.
- Les modules servent ensuite a concretiser des `capacites` et peuvent influencer la categorie de complexite/cout (`CAT0..CAT4`).

### Repere de vocabulaire

- `module` = brique de realisation (canonique).
- `feature` = capacite atomique (canonique).
- `categorie` = niveau de complexite/cout (`CAT0..CAT4`), ce n'est pas une famille de projet.
- Le terme `framework` du titre est historique (legacy) et ne remplace pas les termes canoniques ci-dessus.

## Sommaire

- [Contexte de lecture (realignement)](#contexte-de-lecture-realignement)
- [Role du document](#role-du-document)
- [Place dans le parcours de lecture](#place-dans-le-parcours-de-lecture)
- [Lien avec qualification et recommandation](#lien-avec-qualification-et-recommandation)
- [Repere de vocabulaire](#repere-de-vocabulaire)
- [Source canonique](#source-canonique)
- [Champs clés du module](#champs-clés-du-module)
- [Modules standards](#modules-standards)
- [Stratégies d’implémentation](#stratégies-dimplémentation)
- [Module BOOKING](#module-booking)
- [Contraintes économiques](#contraintes-économiques)
- [Règle anti-dérive](#règle-anti-dérive)

## Source canonique

Le catalogue modules est défini dans [modules.json](../_spec/modules.json). Les invariants de cardinalité et de cohérence sont définis dans [decision-rules.json](../_spec/decision-rules.json).

## Champs clés du module

- Identité: `id` (immuable)
- Fonctionnel: `featureIds`, `compatibility`, `recommendedPluginsByCMS`
- Effort et exploitation: `estimatedEffort`, `ciImpact`
- Commercial: `pricingMode`, `priceSetupMin/Max`, `priceMonthlyMin/Max`, `targetCategory|minCategory`, `economicGuardrails`

## Modules standards

Les modules standards sont la base fonctionnelle couvrant la majorité des besoins clients. Le détail canonique reste dans [modules.json](../_spec/modules.json).

- `module.BOOKING`
- `module.LEAD_FORMS`
- `module.NEWSLETTER`
- `module.REVIEWS`
- `module.SEO_FOUNDATION`
- `module.ANALYTICS_FOUNDATION`
- `module.COMPLIANCE_BASE`
- `module.PAYMENTS_LIGHT`
- `module.ECOMMERCE_BASE`
- `module.CATALOG_SHOWCASE`
- `module.MULTILANGUAGE`
- `module.SEARCH`

## Stratégies d’implémentation

Trois stratégies sont utilisées pour implémenter un module. Le choix dépend des contraintes fonctionnelles, du CMS cible et du niveau de maîtrise attendu.
Ces stratégies sont orthogonales aux classifications canoniques (`CMS_NATIVE`, `PLUGIN_INTEGRATION`, `FRAMEWORK_MODULE`, `CUSTOM_APP`, `THEME_FEATURE`).

Note de vocabulaire (legacy/transitoire): les libelles de strategie (`EXTERNAL_WIDGET`, `CMS_PLUGIN`, `CUSTOM_APP`) sont des labels d'implementation. Ils ne doivent pas etre confondus avec:

- les familles de projet (`SITE_VITRINE`, `SITE_BUSINESS`, `ECOMMERCE`, `MVP_SAAS`, `APP_METIER`),
- l'offre runtime legacy `APP_CUSTOM`.

### EXTERNAL_WIDGET

- Quand utiliser: besoin couvert par un service SaaS avec intégration légère (embed ou lien), délai court, faible dépendance au CMS.
- Avantages: time-to-market rapide, maintenance réduite côté équipe, coûts d’implémentation faibles.
- Limites: personnalisation UI limitée, dépendance fournisseur, intégration data souvent partielle.
- Exemples typiques: booking via Calendly en embed, chat widget tiers, prise de rendez-vous simple.

### CMS_PLUGIN

- Quand utiliser: fonctionnalité native au CMS via plugin stable, intégration profonde requise, besoin d’admin back-office.
- Avantages: intégration CMS complète, gestion permissions/contenu, compatibilité SEO/analytics native.
- Limites: dépendance au cycle de vie du plugin, variabilité qualité/support, risques de conflits.
- Exemples typiques: formulaires avancés WordPress, avis produits WooCommerce, SEO plugin.

### CUSTOM_APP

- Quand utiliser: besoin métier spécifique, intégrations complexes, logique propriétaire ou multi-systèmes.
- Avantages: contrôle total, extensibilité, alignement exact au métier.
- Limites: coût et délai plus élevés, maintenance continue, expertise technique requise.
- Exemples typiques: moteur de devis sur-mesure, portail client dédié, orchestration multi-sources.

## Module BOOKING

Ce module couvre la réservation multi-format (rendez-vous, tables, événements). Le catalogue canonique reste dans [modules.json](../_spec/modules.json); cette section documente le schéma de configuration attendu.

Capacites (features) couvertes: `feature.BOOKING_APPOINTMENT`, `feature.BOOKING_TABLE`, `feature.BOOKING_EVENT` (module: `module.BOOKING`).

### Schéma canonique

- `booking.type`: `APPOINTMENT` | `TABLE` | `EVENT`
- `booking.provider`: `CALENDLY` | `SIMPLEBOOK` | `AMELIA` | `CUSTOM`
- `booking.mode`: `EMBED` | `LINK`
- `booking.payment`: `NONE` | `DEPOSIT` | `FULL`
- `booking.notifications`: `EMAIL` | `SMS`

Exemple:

```text
booking.type = APPOINTMENT | TABLE | EVENT
booking.provider = CALENDLY | SIMPLEBOOK | AMELIA | CUSTOM
booking.mode = EMBED | LINK
booking.payment = NONE | DEPOSIT | FULL
booking.notifications = EMAIL | SMS
```

## Contraintes économiques

Les règles de cohérence sont lues dans `economicRules.pricingCoherence` de [decision-rules.json](../_spec/decision-rules.json). Le positionnement tarifaire des catégories est lu dans `economicRules.basePricingByCategory`.

## Règle anti-dérive

Cette page ne maintient pas de copie manuelle de la liste des modules. Toute vérification de catalogue doit se faire dans [modules.json](../_spec/modules.json).

## Navigation

- Précédent: [architecture-spec-first.md](./architecture-spec-first.md)
- Suivant: [integrations-plugins-et-apps.md](./integrations-plugins-et-apps.md)
