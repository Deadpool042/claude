# Notifications

## Ce que ça inclut
- Notifications email/push/in-app
- Modèles et préférences utilisateurs
- Planification basique (batch, reminders)

## Ce que ça n’inclut pas
- Routage multi-canal avancé (priorités, règles complexes)
- SMS/voix (hors scope)
- Moteur marketing/automation complet

## Pré-requis (agnostiques)
- Backend : BaaS ou backend custom
- Auth/roles : requis
- Storage : optionnel (historique)

## Estimation (référence)
- Prix de référence : 800–1 200 €
- Coef stack : appliquer COEF_STACK
- Coef backend : peut augmenter si matrices de routage complexes

## Impact CI (indicatif)
- SA : +0
- DE : +1
- CB : +0
- SD : +0
- Score indicatif : +1

## Points de requalification
- Volumétrie quotidienne, canaux requis (push, email, in-app)
- Matrices de préférences complexes ? → revoir périmètre
- Contraintes légales (logs, preuve d’envoi) à préciser
