# Archive — Migration notes spec-first & anti-drift

> Type documentaire: `note de migration`
> Date de référence: `2026-03-04`
> Statut: archivé (historique de transition)
> Remplacé pour l'usage courant par: `../gouvernance/spec-first-contribution-workflow.md`
> Doctrine: `Docs/_spec` reste la source de vérité canonique.

## Objectif

Passer à un mode **single source of truth** où `Docs/_spec/*` est la source canonique, et où la copie runtime app (`site-factory/src/lib/referential/spec/data/*`) est strictement synchronisée.

## État cible

- Source canonique: `Docs/_spec/*.json`
- Copie runtime: `site-factory/src/lib/referential/spec/data/*.json`
- Commande de sync: `pnpm spec:sync`
- Vérification anti-dérive: `pnpm spec:check`
- Validation complète recommandée: `pnpm validate`

## Procédure standard de contribution

1. Modifier uniquement les fichiers dans `Docs/_spec`.
2. Exécuter `pnpm spec:sync`.
3. Vérifier `pnpm spec:check`.
4. Exécuter `pnpm validate` avant merge.

## Règles de gouvernance

- Ne pas modifier directement `site-factory/src/lib/referential/spec/data/*`.
- Tout changement de prix/règle/matrice passe par `Docs/_spec`.
- Toute PR doit passer `pnpm spec:check`.
- Si `spec:check` échoue en CI: re-synchroniser via `pnpm spec:sync` puis recommiter.

## Contrôles d’intégrité ajoutés

- Validation Zod sur tous les blocs de spec au chargement.
- Contrôle d’existence des IDs (`cms`, `features`, `plugins`, `modules`) référencés.
- Contrôle de cohérence `decisionOrderCanonical`.
- Contrôle de whitelist `decisionRules.customStackProfiles` vs `custom-stacks.profiles`.
- Invariant dark mode (`THEME_FEATURE`) et bornes de nombre de modules.

## Points d’attention

- La copie runtime reste nécessaire pour les imports JSON côté app.
- `spec:check` compare le JSON normalisé (format stable, indentation 2 espaces).
- En cas d’écart local après modifications, l’ordre correct est toujours: `spec:sync` puis `spec:check`.

## Commandes utiles

```bash
pnpm spec:sync
pnpm spec:check
pnpm validate
```
