# Import quittances PDF

## Ce que ça inclut
- Upload PDF et extraction (OCR léger si besoin)
- Mapping des champs quittance (montant, dates, référence, locataire)
- Journalisation des imports et contrôle qualité (erreurs bloquantes)

## Ce que ça n’inclut pas
- Reconnaissance documentaire full OCR multi-langue
- Signature électronique ou validation légale
- Automatisation fiscale/accises

## Pré-requis (agnostiques)
- Backend : BaaS ou backend custom
- Auth/roles : requis pour tracer les imports
- Storage : S3 compatible ou storage BaaS

## Estimation (référence)
- Prix de référence : 1 500–2 200 €
- Coef stack : appliquer COEF_STACK
- Coef backend : peut augmenter si règles d’accès strictes/PII sensibles

## Impact CI (indicatif)
- SA : +1
- DE : +1
- CB : +0
- SD : +1
- Score indicatif : +3.5

## Points de requalification
- Qualité des PDF (scans, photos) et taux d’erreur toléré
- Volumétrie mensuelle, SLA d’import
- Données sensibles (PII, bancaires) → exigences de chiffrement/audit
