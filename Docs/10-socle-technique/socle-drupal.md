# Socle Stack — Drupal

## Sommaire

- [Delta vs canonique](#delta-vs-canonique)
- [Implémentation pratique](#implémentation-pratique)
- [Contraintes commerciales liées](#contraintes-commerciales-liées)
- [Navigation](#navigation)

## Delta vs canonique

Ce document décrit les deltas Drupal sans redéfinir le socle commun.

## Implémentation pratique

- `SOCLE.DEPLOY.PROCEDURE`: pipeline avec import de configuration contrôlé.
- `SOCLE.BACKUP.SCOPE`: DB + fichiers publics/privés + export config.
- `SOCLE.SECURITY.PATCH_POLICY`: patch core/modules avec fenêtre de validation.
- `SOCLE.OBS.ERROR_LOGS`: centralisation logs Drupal/PHP.
- `SOCLE.PERF.CACHING`: cache Drupal + edge/CDN selon contexte.

## Contraintes commerciales liées

- Déploiement one-shot + coûts récurrents via [../_spec/commercial.json](../_spec/commercial.json).

## Navigation

- ⬅️ Précédent: [socle-shopify.md](./socle-shopify.md)
- ➡️ Suivant: [socle-headless-custom.md](./socle-headless-custom.md)
- 📌 Prochain fichier à lire: [socle-headless-custom.md](./socle-headless-custom.md)
