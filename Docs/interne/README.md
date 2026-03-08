# Documentation interne

Cette section regroupe la documentation interne de pilotage, de cadrage et d'exploitation.

Rappel de doctrine :

- `Docs/_spec` est la source de vérité canonique.
- Les documents internes n'ont pas de statut canonique métier exécutable.
- Les documents internes peuvent cadrer le domaine, la méthode, la trajectoire et les conventions du projet.
- Les documents datés doivent rester explicitement identifiés comme datés.

## Structure

- `gouvernance/`: procédures internes evergreen (discipline de contribution, règles d'usage).
- `fondations/`: documents evergreen de cadrage stratégique et de structuration du domaine Site Factory.
- `qa/`: checklists opérationnelles evergreen.
- `roadmap/`: plans datés de pilotage.
- `audits/`: constats datés (snapshots techniques/fonctionnels).
- `archives/`: documents transitoires ou historiques sortis du tronc actif.
- `prompts/`: conventions internes pour les prompts du projet.

## Ordre de lecture recommandé

1. `fondations/DOMAIN_PRINCIPLES.md`
2. `fondations/CANONICAL_MODEL.md`
3. `fondations/DECISION_ENGINE.md`
4. `fondations/IMPLEMENTATION_CATALOG.md`
5. `fondations/ROADMAP_SITE_FACTORY.md`

## Index des documents

| Type                            | Statut                   | Fichier                                                      |
| --------------------------------| ------------------------ | ------------------------------------------------------------ |
| fondation de domaine evergreen  | actif                    | `fondations/DOMAIN_PRINCIPLES.md`                            |
| fondation de domaine evergreen  | actif                    | `fondations/CANONICAL_MODEL.md`                              |
| fondation de domaine evergreen  | actif                    | `fondations/DECISION_ENGINE.md`                              |
| fondation de domaine evergreen  | actif                    | `fondations/IMPLEMENTATION_CATALOG.md`                       |
| cadrage stratégique evergreen   | actif                    | `fondations/ROADMAP_SITE_FACTORY.md`                         |
| interne evergreen               | actif                    | `gouvernance/spec-first-contribution-workflow.md`            |
| interne evergreen               | actif                    | `gouvernance/taxonomy-signal-transition.md`                  |
| checklist opérationnelle        | actif                    | `qa/checklist-wizard-spec-dashboard.md`                      |
| roadmap datée                   | daté (actif sur fenêtre) | `roadmap/2026-03-04-roadmap-spec-first-30-60-90.md`          |
| audit daté                      | historique               | `audits/2026-03-04-audit-spec-industrialisation-part1.md`    |
| audit daté                      | historique               | `audits/2026-03-04-matrice-wizard-qualification-live.md`     |
| note de migration               | archivé                  | `archives/2026-03-04-migration-notes-spec-first.md`          |
| note de migration               | archivé                  | `archives/2026-03-06-migration-arborescence-documentaire.md` |
| convention interne              | actif                    | `prompts/README.md`                                          |