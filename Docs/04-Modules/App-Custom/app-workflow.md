# Workflows

## Ce que ça inclut
- États, transitions, validations (approbation/rejet)
- Assignation et tâches simples
- Journal des changements d’état

## Ce que ça n’inclut pas
- BPMN complet ou moteur de règles no-code
- SLA/ordonnancement complexe multi-services
- Intégration email poussée (templates transactionnels complexes)

## Pré-requis (agnostiques)
- Backend : BaaS ou backend custom
- Auth/roles : requis
- Storage/realtime : optionnel (notifications)

## Estimation (référence)
- Prix de référence : 1 500–2 300 €
- Coef stack : appliquer COEF_STACK
- Coef backend : peut augmenter si multi-tenant strict ou SLA forts

## Impact CI (indicatif)
- SA : +1
- DE : +0
- CB : +1
- SD : +0
- Score indicatif : +2.5

## Points de requalification
- Nombre d’états/transitions, règles conditionnelles
- Volumétrie d’événements et SLA de traitement
- Besoin d’édition des workflows par l’équipe métier ? → requalification
