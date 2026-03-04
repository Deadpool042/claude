# GENERATION — miroir de spec

## Objectif

Définir le mécanisme officiel de génération du miroir runtime utilisé par l’application.

## Source canonique

- Source unique: `Docs/_spec/*`

## Dossier généré

- Cible générée: `site-factory/src/lib/referential/spec/data/*`

## Commandes

- Génération: `pnpm spec:sync`
- Vérification anti-dérive: `pnpm spec:check`
- Validation complète: `pnpm validate`

## Interdits

- Ne jamais éditer manuellement `site-factory/src/lib/referential/spec/data/*`.
- Ne jamais traiter le miroir comme source canonique.
- Ne jamais ajouter une seconde source spec concurrente dans le monorepo.

## Consommation code (Step 3)

Le code applicatif continue de charger le miroir généré (`spec/data/*`) pour éviter un couplage runtime direct du build Next.js au dossier `Docs/_spec`.
