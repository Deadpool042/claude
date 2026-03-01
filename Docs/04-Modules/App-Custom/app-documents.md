# Documents & partage

## Ce que ça inclut
- Upload de documents (PDF, images, CSV) avec métadonnées (tags, dossiers légers)
- Visualisation / téléchargement sécurisé selon droits
- Partage interne (rôles/ACL) et journalisation des actions basiques

## Ce que ça n’inclut pas
- Signature électronique qualifiée
- Anti-virus/anti-malware avancé
- DLP (Data Loss Prevention) ou chiffrement E2E

## Pré-requis (agnostiques)
- Backend : BaaS ou backend custom
- Auth/roles : requis
- Storage : S3 compatible ou storage BaaS

## Estimation (référence)
- Prix de référence : 1 200–1 800 €
- Coef stack : appliquer COEF_STACK
- Coef backend : peut augmenter si contraintes de chiffrement strict

## Impact CI (indicatif)
- SA : +1
- DE : +0
- CB : +0
- SD : +1
- Score indicatif : +2

## Points de requalification
- Volumétrie (taille/nb de fichiers), rétention légale
- Besoin de signature ou de DLP ? → module/portée distincts
- Partage externe ou multi-tenant strict ? → requalification
