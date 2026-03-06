# Migration d'arborescence documentaire

> Date de reference: `2026-03-06`
> Statut: archive de migration

## Objet

Cette note archive la bascule du dossier `Docs/` vers une structure unique par couche:

- `produit/`
- `qualification/`
- `recommandation/`
- `technique/`
- `interne/`
- `_spec/`

## Pourquoi

L'ancien tronc mélangeait plusieurs logiques en parallèle:

- une série numérotée plate (`00`, `01`, `02`, ...),
- une logique canonique `_spec`,
- une logique interne déjà séparée.

La migration retire les numéros du parcours principal et reclassifie les documents par rôle.

## Table de migration

| Ancien chemin | Nouveau chemin |
|---|---|
| `Docs/00-vision-produit.md` | `Docs/produit/vision-produit.md` |
| `Docs/01-positionnement-offres.md` | `Docs/produit/positionnement-offres.md` |
| `Docs/02-taxonomie-projets.md` | `Docs/produit/taxonomie-projets.md` |
| `Docs/03-logique-de-qualification.md` | `Docs/qualification/logique-de-qualification.md` |
| `Docs/04-glossaire-et-mapping-taxonomique.md` | `Docs/produit/glossaire-et-mapping-taxonomique.md` |
| `Docs/01-framework-overview.md` | `Docs/technique/architecture-spec-first.md` |
| `Docs/02-supported-cms.md` | `Docs/recommandation/cms-supportes.md` |
| `Docs/03-feature-classification.md` | `Docs/recommandation/classification-des-capacites.md` |
| `Docs/04-cms-capability-matrix.md` | `Docs/recommandation/matrice-capacites-cms.md` |
| `Docs/05-framework-modules.md` | `Docs/technique/catalogue-modules-framework.md` |
| `Docs/06-plugin-integrations.md` | `Docs/technique/integrations-plugins-et-apps.md` |
| `Docs/07-custom-apps.md` | `Docs/technique/mode-custom-app.md` |
| `Docs/08-decision-engine.md` | `Docs/recommandation/moteur-de-decision.md` |
| `Docs/10-socle-technique/*` | `Docs/technique/socle/*` |
| `Docs/90-interne/*` | `Docs/interne/*` |
| `Docs/_prompts/README.md` | `Docs/interne/prompts/README.md` |

## Effet attendu

- une seule logique de navigation au niveau racine;
- plus de série numérotée concurrente;
- `Docs/README.md` devient la porte d'entrée unique;
- les documents datés restent visibles uniquement dans `Docs/interne`.
