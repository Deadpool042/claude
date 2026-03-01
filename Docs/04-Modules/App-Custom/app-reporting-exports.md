# Reporting & exports

## Ce que ça inclut
- Rapports standard (tableaux, métriques clés)
- Exports CSV/PDF programmés
- Filtres et critères basiques

## Ce que ça n’inclut pas
- BI/OLAP, cubes de données
- Data warehouse ou ETL
- Visualisations custom lourdes (dashboards analytiques avancés)

## Pré-requis (agnostiques)
- Backend : BaaS ou backend custom
- Auth/roles : requis
- Storage : S3 compatible ou storage BaaS pour les exports

## Estimation (référence)
- Prix de référence : 1 000–1 600 €
- Coef stack : appliquer COEF_STACK
- Coef backend : peut augmenter si volumétrie forte ou filtres complexes

## Impact CI (indicatif)
- SA : +1
- DE : +1
- CB : +0
- SD : +0
- Score indicatif : +2

## Points de requalification
- Volumétrie d’exports, fréquence, SLA
- Besoin de filtres dynamiques avancés ?
- Données sensibles dans les exports (PII) → exigences de chiffrement et rétention
