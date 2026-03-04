# PART 1 — AUDIT CURRENT STATE

Date: 2026-03-04
Périmètre: `Docs/_spec`, `site-factory/src/lib/referential/spec`, moteur de décision, wizard qualification, sortie commerciale.

## 1) Résumé exécutif

- L’architecture **spec-first** est désormais en place côté application: chargement, validation Zod, invariants clés, moteur de résolution et estimation.
- Le flux qualification/wizard est stabilisé et validé (typecheck OK + tests OK).
- Le risque principal restant est la **cohérence long terme** entre la spec canonique documentaire et la copie runtime embarquée côté app.
- Priorité suivante recommandée: automatiser la synchronisation canonique et verrouiller les contrôles de dérive dans CI.

## 2) Constat Docs / Spécifications

### Points conformes

- Spécifications canoniques structurées et complètes: `cms`, `features`, `plugins`, `modules`, `decision-rules`, `commercial`, `custom-stacks`.
- Règles économiques explicites (base par catégorie, maintenance, coûts annexes, règles plugin vs module).
- Invariants métiers explicites (ordre de décision canonique, dark mode en thème, bornes modules).

### Écarts / risques

- Double source potentielle: des données runtime existent sous `site-factory/src/lib/referential/spec/data/*` alors que la source documentaire attendue est `Docs/_spec/*`.
- Certaines docs markdown historiques peuvent encore contenir de la logique dupliquée (risque d’obsolescence si non régénérées depuis la spec).

### Niveau de sévérité

- Sévérité moyenne: pas de casse immédiate, mais risque de divergence de vérité si contribution parallèle docs/app.

## 3) Constat Code / Intégration app

### Points conformes

- Loader spec robuste avec validation schéma + assertions d’invariants (`load.ts`).
- Exposition centralisée (`getSpec`, exports constants) et moteurs dédiés (`resolve-feature`, `estimate-quote`, `estimate-plugin-subscriptions`).
- Sorties commerciales cohérentes avec le modèle (devis PDF, résumé wizard, sidebar qualification).
- Éligibilité live SaaS corrigée et couverte par test régression.

### Écarts / risques

- `loadReferentialSpec` assemble des objets enrichis avec un cast final `as FullSpec` pour concilier `exactOptionalPropertyTypes` et enrichissement runtime.
  - Impact: dette de typage faible à moyenne (technique, non fonctionnelle).
- Ambiguïté export types/schema résolue localement, mais à surveiller lors d’ajout de nouveaux types nommés.

### Niveau de sévérité

- Sévérité faible: comportement fonctionnel validé, dette surtout typage strict/ergonomie dev.

## 4) Validation technique

- `pnpm typecheck`: ✅
- `pnpm test`: ✅
- Résultat: 14 fichiers de tests, 193 tests passants.

## 5) Matrice des gaps (synthèse)

| Gap | Impact | Statut | Action suivante |
|---|---|---|---|
| Source canonique docs vs data runtime app | Dérive de contenu | Partiellement traité | Mettre sync automatique unique (`Docs/_spec` -> app) |
| Markdown potentiellement dupliqué | Incohérence documentaire | À vérifier en lot | Générer/rafraîchir docs depuis la spec |
| Cast `as FullSpec` dans loader | Dette type-safety | Temporaire acceptable | Introduire normaliseur strict sans cast global |
| Garde-fous CI sur dérive spec | Qualité process | À renforcer | Ajouter check de sync + check invariants en pipeline |

## 6) Recommandations immédiates (ordre d’exécution)

1. Verrouiller un **single source of truth**: `Docs/_spec/*`.
2. Ajouter (ou finaliser) un script de sync idempotent vers `site-factory/src/lib/referential/spec/data/*`.
3. Ajouter une vérification CI: échec si diff après sync.
4. Rafraîchir les markdown de référence pour ne garder que narration + références à la spec.
5. Itérer sur le typage du loader pour retirer progressivement le cast global.

## 7) Conclusion

Le socle demandé est largement en place et techniquement stable. Le chantier restant est principalement un chantier de **gouvernance des données** (anti-drift) et de **discipline documentaire** pour fiabiliser l’exploitation à long terme.