# Socle Stack — WordPress

## Sommaire

- [Delta vs canonique](#delta-vs-canonique)
- [Implémentation pratique](#implémentation-pratique)
- [Contraintes commerciales liées](#contraintes-commerciales-liées)
- [Navigation](#navigation)

## Delta vs canonique

Ce document applique [10-socle-technique-canonique.md](./10-socle-technique-canonique.md) à WordPress sans redéfinir les règles.

## Implémentation pratique

- `SOCLE.DEPLOY.PROCEDURE`: déploiement thème/plugins custom versionnés.
- `SOCLE.BACKUP.SCOPE`: DB WordPress + uploads + config runtime.
- `SOCLE.SECURITY.PATCH_POLICY`: patch core + plugins + thème selon criticité.
- `SOCLE.OBS.ERROR_LOGS`: logs PHP/FPM + logs applicatifs.
- `SOCLE.PERF.CACHING`: cache page/objet avec exclusions admin.

## Contraintes commerciales liées

- Référencer `annexCosts.hostingMonthlyRangeByStack.WORDPRESS_*` dans [../_spec/commercial.json](../_spec/commercial.json).
- Référencer `maintenanceByCategory` (CAT0..CAT4) dans [../_spec/commercial.json](../_spec/commercial.json).

## Navigation

- ⬅️ Précédent: [10-socle-technique-canonique.md](./10-socle-technique-canonique.md)
- ➡️ Suivant: [socle-woocommerce.md](./socle-woocommerce.md)
- 📌 Prochain fichier à lire: [socle-woocommerce.md](./socle-woocommerce.md)
