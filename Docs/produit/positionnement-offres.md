# Positionnement des offres

## Intention

Une offre Site Factory est une recommandation operationnelle, pas une simple etiquette commerciale.

Chaque offre doit repondre a la question:

"Quel mode de production minimise le risque et maximise la valeur pour ce besoin client?"

## Definition d'une offre

Une offre combine au minimum:

- une famille de projet,
- un mode de production principal,
- un niveau de service attendu,
- une enveloppe economique defendable.

## Principe directeur

Le moteur recommande d'abord un mode de production (`native`, `plugin`, `module`, `custom app`, `theme`) puis derive l'implementation.

Ce principe evite de vendre une technologie avant de qualifier le besoin reel.

## Existant

- Le runtime expose encore des categories historiques (ex: `VITRINE_BLOG`, `ECOMMERCE`, `APP_CUSTOM`) pour compatibilite applicative.
- La couche `site-factory/src/lib/offers` sert la consommation UI et les parcours applicatifs.
- Le coeur metier canonique reste dans `Docs/_spec`.

## Cible

Le positionnement offres doit devenir lisible par famille de besoin:

- `SITE_VITRINE`
- `SITE_BUSINESS`
- `ECOMMERCE`
- `MVP_SAAS`
- `APP_METIER`

et par niveau de mode de production recommande.

## Regles de lisibilite

- Une offre doit expliciter "pour quel besoin" avant "avec quelle techno".
- Une offre doit expliciter les limites (ce qu'elle ne couvre pas).
- Une offre doit expliciter les conditions de passage a une famille superieure.
- Le vocabulaire de vente et le vocabulaire de qualification doivent rester coherents.

## Roadmap (post phase 1)

- Aligner les libelles d'offres runtime avec la taxonomie cible.
- Harmoniser les pages applicatives qui presentent les offres.
- Rendre explicite le lien entre offre recommandee, modules actives et impact budgetaire.

## Liens

- Precedent: [vision-produit.md](./vision-produit.md)
- Suivant: [taxonomie-projets.md](./taxonomie-projets.md)
