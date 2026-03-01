# Audit logs

## Ce que ça inclut
- Journalisation des actions clés (création, mise à jour, suppression)
- Stockage horodaté avec utilisateur et contexte
- Export simple (CSV/JSON) et filtres basiques

## Ce que ça n’inclut pas
- Archivage WORM ou scellé légal
- SIEM / corrélation temps réel
- Monitoring infra (hors scope)

## Pré-requis (agnostiques)
- Backend : BaaS ou backend custom
- Auth/roles : requis
- Storage : S3 compatible ou storage BaaS

## Estimation (référence)
- Prix de référence : 900–1 400 €
- Coef stack : appliquer COEF_STACK
- Coef backend : peut augmenter si rétention longue ou exigences conformité

## Impact CI (indicatif)
- SA : +0
- DE : +0
- CB : +0
- SD : +1
- Score indicatif : +1.5

## Points de requalification
- Rétention légale, besoins d’immutabilité
- Volume d’événements par jour
- Intégration SIEM / alerting externe ? → module/portée distinct
