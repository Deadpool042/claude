# Checklist opérationnelle — Wizard + Spec Dashboard

> Type documentaire: `checklist opérationnelle`
> Statut: evergreen (à maintenir)
> Dernière revue: `2026-03-06`
> Doctrine: `Docs/_spec` est la source canonique; cette checklist couvre la couche runtime/outillage.

## Wizard (création de projet)

- Étape 0 (questionnaire): vérifier les blocages "Informations manquantes" si un champ requis est vide.
- Étape 0: budget < 1200 bloque les types runtime `APP` et `ECOM` (message clair).
- Étape 1 (type runtime / famille technique): un cas headless exige une sélection frontend + hosting front/back selon le mode.
- Étape 2 (modules): sélection module OK + compatibilité stack; module `BOOKING`.
  - Activer Booking.
  - Choisir un type (`APPOINTMENT`/`TABLE`/`EVENT`).
  - Choisir un provider (par défaut `Calendly`).
  - Vérifier que la validation bloque "Suivant" si le type est manquant.
- Étape 3 (infos projet): nom >= 2 caractères et client requis.
- Étape 4 (résumé): vérifier modules sélectionnés, estimation budget, stack, hosting.
- Création: le projet est créé et les modules/qualification sont persistants.

## Spec Dashboard (CRUD spec)

- Chargement des fichiers spec: liste OK, ouverture sans erreur.
- Édition `features.json`: id unique, dependencies valides, domain valide.
- Édition `modules.json`: `module.featureIds` références existantes; pas de doublon d'id.
- Édition `capability-matrix.json` / `decision-rules.json`:
  - pas de doublon (`featureId`/`cmsId`)
  - `featureId` et `cmsId` existants
- Tentative de sauvegarde invalide:
  - un champ requis manquant => sauvegarde bloquée, erreur affichée
  - référence invalide => sauvegarde bloquée, erreur affichée
- Sauvegarde valide => fichier mis à jour sans perte de champs.
