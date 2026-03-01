# Messagerie asynchrone

## Ce que ça inclut
- Inbox in-app (threads/conversations)
- Statuts lu / non-lu, archivage basique
- Notifications in-app/Email optionnelles

## Ce que ça n’inclut pas
- Temps réel (présence, typing) — voir module dédié
- VoIP/visio
- Modération/anti-spam avancée

## Pré-requis (agnostiques)
- Backend : BaaS ou backend custom
- Auth/roles : requis
- Storage : optionnel (pièces jointes)

## Estimation (référence)
- Prix de référence : 1 400–2 100 €
- Coef stack : appliquer COEF_STACK
- Coef backend : peut augmenter si rétention ou modération avancée

## Impact CI (indicatif)
- SA : +1
- DE : +1
- CB : +0
- SD : +0
- Score indicatif : +2

## Points de requalification
- Rétention messages/pièces jointes, taille max
- Besoin de modération/flagging ? → complexité accrue
- Multi-tenant strict ou chiffrement end-to-end ? → requalification
