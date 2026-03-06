# Taxonomie projets

## Taxonomie cible imposee

Les familles de projet strategiques a utiliser dans la documentation produit sont:

- `SITE_VITRINE`
- `SITE_BUSINESS`
- `ECOMMERCE`
- `MVP_SAAS`
- `APP_METIER`

Cette taxonomie sert le cadrage, la qualification et la lisibilite commerciale.

## Definitions de reference

### `SITE_VITRINE`

- Objectif principal: presence, credibilite, information.
- Complexite metier: faible a moderee.
- Critere dominant: time-to-market et clarte de contenu.

### `SITE_BUSINESS`

- Objectif principal: acquisition, conversion, automatisation marketing/vente.
- Complexite metier: moderee.
- Critere dominant: performance business (leads, qualification, integrations).

### `ECOMMERCE`

- Objectif principal: vendre en ligne (catalogue, panier, paiement, logistique).
- Complexite metier: moderee a elevee.
- Critere dominant: fiabilite transactionnelle et evolution du canal de vente.

### `MVP_SAAS`

- Objectif principal: valider un produit logiciel commercialisable en abonnement.
- Complexite metier: elevee mais perimetre volontairement limite.
- Critere dominant: vitesse de validation produit + architecture evolutive.

### `APP_METIER`

- Objectif principal: digitaliser une logique operationnelle specifique a un metier.
- Complexite metier: elevee.
- Critere dominant: adequation fonctionnelle, integrations et gouvernance applicative.

## Regles d'usage

- La famille de projet est decidee avant le choix d'implementation.
- Une famille peut mener a plusieurs implementations, selon contraintes de contexte.
- Le changement de famille doit etre justifie par un changement de besoin ou de risque, pas par preference stack.

## Existant vs cible (phase 1)

Le runtime actuel conserve des enums historiques (types `BLOG/VITRINE/ECOM/APP`, categories `VITRINE_BLOG/ECOMMERCE/APP_CUSTOM`, familles techniques `STATIC_SSG/CMS_MONO/...`).

En phase 1, la taxonomie cible est imposee dans la documentation strategique, sans migration massive immediate des enums runtime.

## Mapping documentaire transitoire

| Taxonomie cible | Appui principal dans l'existant | Note de transition |
|---|---|---|
| `SITE_VITRINE` | `VITRINE` ou `BLOG` + `STATIC_SSG`/`CMS_MONO` | Segment editorial/presence. |
| `SITE_BUSINESS` | `VITRINE` ou `BLOG` + modules business (lead, CRM, analytics) | Niveau business plus structure. |
| `ECOMMERCE` | `ECOM` + `COMMERCE_*` | Segment deja explicite dans l'existant. |
| `MVP_SAAS` | `APP` + `APP_PLATFORM` (souvent scope limite) | Positionnement produit SaaS a formaliser. |
| `APP_METIER` | `APP` + `APP_PLATFORM` + logique specifique | Cas sur mesure, contraintes metier fortes. |

Ce mapping est un guide de lecture, pas une migration technique.

## Roadmap (post phase 1)

- Introduire progressivement la taxonomie cible dans les interfaces de qualification et d'offres.
- Aligner les enums et labels applicatifs sans rupture de compatibilite.
- Mettre a jour les docs techniques detaillees quand la migration runtime sera planifiee.

## Liens

- Precedent: [positionnement-offres.md](./positionnement-offres.md)
- Suivant: [../qualification/logique-de-qualification.md](../qualification/logique-de-qualification.md)
