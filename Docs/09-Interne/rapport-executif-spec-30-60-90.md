# Rapport exécutif — Spec-first (30/60/90 jours)

Date: 2026-03-04
Périmètre: gouvernance documentaire/spec, cohérence référentiel, exploitabilité commerciale et opérationnelle.

## Sommaire

- [Résumé dirigeant](#résumé-dirigeant)
- [État actuel](#état-actuel)
- [Risques majeurs](#risques-majeurs)
- [Plan 30/60/90 jours](#plan-306090-jours)
- [Quick wins immédiats](#quick-wins-immédiats)
- [KPIs de pilotage](#kpis-de-pilotage)
- [Décisions attendues](#décisions-attendues)

## Résumé dirigeant

Le socle spec-first est en place et stable: `Docs/_spec` est la source canonique, la copie app est générée et contrôlée anti-dérive.

Le principal risque n’est plus technique court terme, mais **qualité de gouvernance des données**:

- métadonnées plugins incomplètes (vendor/source/pricing),
- risque de divergence si discipline d’édition non respectée,
- maturité inégale du volet run/ops selon stacks.

Objectif des 90 jours: passer d’un référentiel correct à un référentiel **audit-ready**, mesurable et industrialisé.

## État actuel

- Source canonique consolidée: `Docs/_spec/*`.
- Miroir app généré: `site-factory/src/lib/referential/spec/data/*`.
- Check anti-dérive opérationnel: `pnpm spec:sync` + `pnpm spec:check`.
- Section socle technique créée et reliée au spec machine-readable:
  - `Docs/10-Socle-Technique/*`
  - `Docs/_spec/shared-socle.json`
- Audit Step 2 fait, invariants bloquants levés.

## Risques majeurs

### R1 — Qualité des métadonnées plugins (élevé)

- Symptôme: plusieurs plugins sans `vendor`, `url`, `pricingMode`.
- Impact: arbitrage plugin/module moins fiable, chiffrage tiers plus fragile.
- Effet business: variabilité devis récurrents et discussions commerciales plus longues.

### R2 — Discipline de contribution (moyen)

- Symptôme: risque de modification hors source canonique.
- Impact: dérive doc/app et perte de confiance dans la spec.
- Effet business: erreurs de qualification, coûts de correction en aval.

### R3 — Maturité run stack hétérogène (moyen)

- Symptôme: deltas stack bien posés mais non encore instrumentés par KPI homogènes.
- Impact: service levels inégaux selon stack/projet.
- Effet business: qualité perçue variable en maintenance.

### R4 — Évolutivité des règles (moyen)

- Symptôme: ajout de règles possible sans trajectoire de versionning formel des changements majeurs.
- Impact: migrations plus difficiles à piloter.
- Effet business: ralentissement des évolutions offre/process.

## Plan 30/60/90 jours

### 0–30 jours (stabilisation)

- Compléter 100% des métadonnées plugins critiques (`vendor`, `url`, `pricingMode`, plage coûts si connue).
- Formaliser une checklist PR obligatoire « spec-first » (édition canonique + sync/check + impacts docs).
- Standardiser le format des notes de justification `module vs plugin`.
- Cadrer les champs manquants tolérés vs bloquants pour audit futur.

**Critère de sortie J+30**
- 0 plugin critique sans métadonnées minimales.
- 100% des PR spec conformes au workflow canonique.

### 31–60 jours (industrialisation)

- Ajouter des garde-fous CI de qualité de contenu (lint JSON sémantique simple côté spec).
- Produire une vue « readiness par stack » basée sur `shared-socle.json` (coverage des exigences SOCLE).
- Aligner les artefacts runbook par stack sur les IDs SOCLE.

**Critère de sortie J+60**
- KPI de qualité spec visible et suivi.
- Écart de conformité SOCLE par stack mesuré.

### 61–90 jours (auditabilité)

- Introduire une politique de versioning des breaking changes de structure spec.
- Mettre en place un cycle de revue mensuelle référentiel/commercial/ops.
- Préparer un pack « audit client/prospect » (preuve source unique, invariants, gouvernance).

**Critère de sortie J+90**
- Référentiel audit-ready avec traçabilité de changement.
- Décisions commerciales/techniques alignées sur un corpus stable.

## Quick wins immédiats

1. Prioriser les 18 plugins du référentiel actuel et compléter les champs minimaux en 1 lot.
2. Créer un tableau de bord simple: nombre de warnings spec, taux de complétude plugins, drift incidents.
3. Exiger une section « impact commercial » dans chaque PR touchant `commercial.json` ou `plugins.json`.
4. Ajouter un template de justification standard pour les features où plugin et module coexistent.

## KPIs de pilotage

- Taux de complétude plugins (% avec `vendor` + `url` + `pricingMode`).
- Nombre de warnings audit spec (cible: décroissance continue).
- Taux de PR conformes workflow spec-first (cible: 100%).
- Nombre d’incidents de dérive canonique/mirror (cible: 0).
- Couverture SOCLE par stack (% exigences applicables documentées et prouvables).

## Décisions attendues

1. Valider la politique « champs plugins minimaux obligatoires ».
2. Valider le niveau de contrôle CI (bloquant ou non bloquant) pour warnings de qualité spec.
3. Valider le rythme de revue gouvernance (mensuel recommandé).
4. Valider le propriétaire opérationnel du référentiel (single owner + backup owner).
