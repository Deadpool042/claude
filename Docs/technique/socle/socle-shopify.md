# Socle Stack — Shopify

## Sommaire

- [Delta vs canonique](#delta-vs-canonique)
- [Implémentation pratique](#implémentation-pratique)
- [Contraintes et limites stack](#contraintes-et-limites-stack)
- [Contraintes commerciales liées](#contraintes-commerciales-liées)
- [Navigation](#navigation)

## Delta vs canonique

Ce document applique le canonique à un contexte SaaS Shopify.

## Implémentation pratique

- `SOCLE.DEPLOY.PROCEDURE`: publication thème via workflow contrôlé (preview puis prod).
- `SOCLE.BACKUP.SCOPE`: exports catalogue/commandes + snapshot thème/config.
- `SOCLE.SECURITY.ROLES`: gestion fine des rôles staff + MFA obligatoire.
- `SOCLE.OBS.UPTIME`: monitoring externe + signaux plateforme.
- `SOCLE.PERF.SCRIPT_HYGIENE`: gouvernance stricte des apps/scripts externes.

## Contraintes et limites stack

- Pas d’accès direct DB.
- Stratégie backup/restore dépendante des capacités SaaS et apps.
- Dépendance forte à l’écosystème d’apps.

## Contraintes commerciales liées

- Frais de déploiement et coûts récurrents référencés dans [../../_spec/commercial.json](../../_spec/commercial.json).
- Coûts apps mensuels référencés dans [../../_spec/plugins.json](../../_spec/plugins.json).

## Navigation

- ⬅️ Précédent: [socle-prestashop.md](./socle-prestashop.md)
- ➡️ Suivant: [socle-drupal.md](./socle-drupal.md)
- 📌 Prochain fichier à lire: [socle-drupal.md](./socle-drupal.md)
