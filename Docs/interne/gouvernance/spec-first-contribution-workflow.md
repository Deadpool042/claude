# Gouvernance evergreen — Workflow de contribution spec-first

> Type documentaire: `interne evergreen`
> Statut: actif
> Dernière revue: `2026-03-06`

## Règle de vérité

- Source canonique: `Docs/_spec/*.json`.
- Miroir runtime dérivé: `site-factory/src/lib/referential/spec/data/*.json`.
- La documentation interne ne remplace jamais le canonique.

## Workflow standard (PR)

1. Modifier uniquement `Docs/_spec/*`.
2. Exécuter `pnpm spec:sync`.
3. Vérifier `pnpm spec:check`.
4. Exécuter `pnpm validate` avant merge.

## Règles de gouvernance

- Ne pas modifier directement `site-factory/src/lib/referential/spec/data/*`.
- Tout changement de règle métier/pricing/matrice passe par `_spec`.
- Toute PR qui touche `_spec` doit passer `spec:check`.
- Si `spec:check` échoue en CI: relancer `spec:sync`, recommiter, relancer la CI.

## Commandes utiles

```bash
pnpm spec:sync
pnpm spec:check
pnpm validate
```
