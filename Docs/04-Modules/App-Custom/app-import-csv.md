# Import CSV (batch)

## Ce que ça inclut
- Upload CSV sécurisé avec modèle et validations
- Mapping des colonnes et erreurs bloquantes/non bloquantes
- Journal d’import et reprise simple en cas d’échec

## Ce que ça n’inclut pas
- Pipelines ETL complexes ou transformations métier avancées
- Haute volumétrie temps réel (streaming)
- Connecteurs propriétaires (API/FTP) — module séparé

## Pré-requis (agnostiques)
- Backend : BaaS ou backend custom
- Auth/roles : requis pour tracer l’opérateur
- Storage : S3 compatible ou storage BaaS

## Estimation (référence)
- Prix de référence : 900–1 400 €
- Coef stack : appliquer COEF_STACK
- Coef backend : peut augmenter si validations métier complexes

## Impact CI (indicatif)
- SA : +1
- DE : +1
- CB : +0
- SD : +0
- Score indicatif : +2

## Points de requalification
- Volume/poids des fichiers, fréquence d’import
- Règles de validation métier ? (formats, doublons, référentiels)
- Besoin de mapping dynamique par utilisateur ? → complexité accrue
