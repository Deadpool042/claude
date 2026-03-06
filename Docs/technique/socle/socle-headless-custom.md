# Socle Stack — Headless Custom

## Sommaire

- [Delta vs canonique](#delta-vs-canonique)
- [Implémentation pratique](#implémentation-pratique)
- [Contraintes commerciales liées](#contraintes-commerciales-liées)
- [Navigation](#navigation)

## Delta vs canonique

Ce document couvre les stacks headless/custom (Next.js + API + BaaS ou architecture équivalente).

## Implémentation pratique

- `SOCLE.ENV.PARITY`: parité stricte local/staging/prod pour front, API et data.
- `SOCLE.DEPLOY.PROCEDURE`: CI/CD multi-composants avec rollback versionné.
- `SOCLE.BACKUP.SCOPE`: backup DB/BaaS + secrets + config infra.
- `SOCLE.OBS.ERROR_LOGS`: logs centralisés front/API/jobs + corrélation.
- `SOCLE.PERF.KPI`: KPI web + API avec seuils cibles.

## Contraintes commerciales liées

- Coûts infra récurrents et maintenance CAT0..CAT4 via [../../_spec/commercial.json](../../_spec/commercial.json).
- Les frais de déploiement restent une ligne séparée (réf `deployFees`).

## Navigation

- ⬅️ Précédent: [socle-drupal.md](./socle-drupal.md)
- ➡️ Suivant: [README.md](./README.md)
- 📌 Prochain fichier à lire: [README.md](./README.md)
