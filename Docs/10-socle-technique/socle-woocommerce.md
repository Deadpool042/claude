# Socle Stack — WooCommerce

## Sommaire

- [Delta vs canonique](#delta-vs-canonique)
- [Implémentation pratique](#implémentation-pratique)
- [Contraintes commerciales liées](#contraintes-commerciales-liées)
- [Navigation](#navigation)

## Delta vs canonique

Ce document décrit uniquement les deltas WooCommerce par rapport au canonique.

## Implémentation pratique

- `SOCLE.DEPLOY.POST_CHECK`: smoke tests panier/checkout obligatoires.
- `SOCLE.BACKUP.SCOPE`: DB commandes + médias + config paiement/livraison.
- `SOCLE.SECURITY.PATCH_POLICY`: priorité patch plugins paiement.
- `SOCLE.OBS.ERROR_LOGS`: logs checkout, gateway et webhooks.
- `SOCLE.PERF.CACHING`: exclusions strictes sur panier/checkout/compte.

## Contraintes commerciales liées

- Coûts d’exploitation et maintenance via [../_spec/commercial.json](../_spec/commercial.json).
- Coûts apps/plugins récurrents via `pluginRecurringCosts` et `plugins.json`.

## Navigation

- ⬅️ Précédent: [socle-wordpress.md](./socle-wordpress.md)
- ➡️ Suivant: [socle-prestashop.md](./socle-prestashop.md)
- 📌 Prochain fichier à lire: [socle-prestashop.md](./socle-prestashop.md)
