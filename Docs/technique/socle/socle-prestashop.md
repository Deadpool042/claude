# Socle Stack — PrestaShop

## Sommaire

- [Delta vs canonique](#delta-vs-canonique)
- [Implémentation pratique](#implémentation-pratique)
- [Contraintes commerciales liées](#contraintes-commerciales-liées)
- [Navigation](#navigation)

## Delta vs canonique

Ce document contient uniquement les particularités PrestaShop.

## Implémentation pratique

- `SOCLE.ENV.PARITY`: version PHP/extensions alignées staging/prod.
- `SOCLE.DEPLOY.PROCEDURE`: déploiement modules + thème avec rollback versionné.
- `SOCLE.BACKUP.SCOPE`: DB + médias produits + modules custom.
- `SOCLE.SECURITY.PATCH_POLICY`: suivi des vulnérabilités modules.
- `SOCLE.OBS.INCIDENT_LOG`: incidents tunnel d’achat tracés.

## Contraintes commerciales liées

- Coûts hébergement + domaine + maintenance via [../../_spec/commercial.json](../../_spec/commercial.json).
- Coûts plugin/app via [../../_spec/plugins.json](../../_spec/plugins.json).

## Navigation

- ⬅️ Précédent: [socle-woocommerce.md](./socle-woocommerce.md)
- ➡️ Suivant: [socle-shopify.md](./socle-shopify.md)
- 📌 Prochain fichier à lire: [socle-shopify.md](./socle-shopify.md)
