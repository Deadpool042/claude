# Messagerie temps réel

## Ce que ça inclut
- Chat temps réel (WebSocket/BaaS realtime)
- Présence, statut lu/non-lu, pagination / lazy load
- Notifications in-app/push optionnelles

## Ce que ça n’inclut pas
- VoIP/visio
- Modération/anti-spam avancée
- SLA messagerie critique (24/7) hors scope

## Pré-requis (agnostiques)
- Backend : BaaS realtime ou backend custom WebSocket
- Auth/roles : requis
- Storage : optionnel (pièces jointes)

## Estimation (référence)
- Prix de référence : 1 800–2 600 €
- Coef stack : appliquer COEF_STACK
- Coef backend : peut augmenter si QoS/persistance forte

## Impact CI (indicatif)
- SA : +1
- DE : +2
- CB : +0
- SD : +0
- Score indicatif : +3

## Points de requalification
- Charge concurrente, volumétrie messages, historisation
- Besoin de modération, blocage utilisateurs, anti-spam
- Multi-tenant strict et isolation données → vérifier backend/ACL
