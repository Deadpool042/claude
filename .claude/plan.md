# Plan actif — Wizard Qualification (mars 2026)

## Objectif produit

Rendre la qualification **commercialement réaliste**, **cohérente de bout en bout** et **explicable** (décisions, garde-fous budget, suggestions modules).

## État actuel

### ✅ Terminé

- Harmonisation des alertes discovery (priorisation + wording "Alertes prioritaires").
- Refactor de `step-questionnaire` en sous-composants (`discovery`, `editorial`, `context`).
- Réduction des duplications de types UI vers types issus du contexte.
- Centralisation des repères marché dans `market-guardrails`.
- Garde-fous forts budget très bas :
  - blocage `APP + <1200` ;
  - blocage `ECOM + <1200` ;
  - orientation low-budget vers parcours CMS/hosting cohérent.
- Alignement documentaire commercial/interne sur ces règles.

### ✅ Terminé (itération en cours)

- Refonte du moteur de suggestions modules :
  - prise en compte du coût setup cumulé ;
  - compatibilité contraintes client (trafic, data, scalabilité) ;
  - exclusion des capacités déjà natives selon stack/mode e-commerce.
- Ajout d’explications visibles dans l’UI des recommandations (questionnaire, sidebar, summary).

## Prochaines étapes (priorisées)

1. Ajouter un libellé court du type "raison dominante" par module (objectif, ambition, budget, contrainte).
2. Ajouter un indicateur "hors enveloppe" explicite quand une recommandation fallback est proposée.
3. Ajouter 1 test unitaire ciblé sur `module-suggestions` (cas e-commerce SaaS + budget contraint).
4. Vérifier la cohérence des messages docs après prochaines évolutions métier.

## Règles de décision à conserver

- Les combinaisons irréalistes sont bloquées (pas seulement "hintées").
- Les recommandations doivent rester compréhensibles pour le commercial (pas de boîte noire).
- Les docs commerciaux restent alignés avec les garde-fous effectifs du wizard.

## Directive opératoire Claude

- Claude se contente d’appliquer la documentation validée ; il ne crée pas de nouvelle règle métier sans source documentaire explicite.
- En cas d’ambiguïté entre implémentation et doc, la doc fait foi et l’écart doit être signalé puis corrigé côté code.
- Toute évolution doit citer la source documentaire concernée (Commercial ou Interne) avant modification.
- Si aucune source documentaire n’existe, proposer une mise à jour de doc d’abord, puis implémenter seulement après validation.

### Protocole d’intervention (obligatoire)

1. Identifier la section doc de référence.
2. Vérifier la cohérence de la règle dans le wizard (questionnaire, contraintes, résumé).
3. Implémenter minimalement ce qui est documenté, sans extension non demandée.
4. Valider (`typecheck` + contrôle de messages UI) puis refléter le changement dans le plan si nécessaire.

## Archive

L’ancien plan "refonte documentation / éliminer les duplications" est considéré clôturé et remplacé par ce plan actif.
