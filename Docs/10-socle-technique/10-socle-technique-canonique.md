# 10 — Socle Technique Canonique

## Sommaire

- [10 — Socle Technique Canonique](#10--socle-technique-canonique)
  - [Sommaire](#sommaire)
  - [Référence normative](#référence-normative)
  - [Exigences communes](#exigences-communes)
  - [Contraintes commerciales reliées](#contraintes-commerciales-reliées)
  - [Navigation](#navigation)

## Référence normative

La source de vérité de cette page est [../_spec/shared-socle.json](../_spec/shared-socle.json).

Les exigences sont référencées par IDs stables `SOCLE.*`.

## Exigences communes

- Sécurité
  - `SOCLE.SECURITY.HTTPS`
  - `SOCLE.SECURITY.MFA`
  - `SOCLE.SECURITY.ROLES`
  - `SOCLE.SECURITY.PATCH_POLICY`
- Backups
  - `SOCLE.BACKUP.SCOPE`
  - `SOCLE.BACKUP.FREQUENCY_BY_CAT`
  - `SOCLE.BACKUP.RESTORE_TEST`
- Déploiement
  - `SOCLE.DEPLOY.PROCEDURE`
  - `SOCLE.DEPLOY.ROLLBACK`
  - `SOCLE.DEPLOY.POST_CHECK`
- Observabilité
  - `SOCLE.OBS.UPTIME`
  - `SOCLE.OBS.ERROR_LOGS`
  - `SOCLE.OBS.INCIDENT_LOG`
- Performance
  - `SOCLE.PERF.IMAGES`
  - `SOCLE.PERF.CACHING`
  - `SOCLE.PERF.SCRIPT_HYGIENE`
  - `SOCLE.PERF.KPI`

## Contraintes commerciales reliées

Cette section ne redéfinit pas de pricing. Les points commerciaux reliés sont:

- Frais de déploiement one-time (`deploySetupFee`, `deploySetupFeeRange`) via [../_spec/commercial.json](../_spec/commercial.json)
- Coûts récurrents domaine/hébergement/email/stockage via `annexCosts` dans [../_spec/commercial.json](../_spec/commercial.json)
- Alignement maintenance CAT0..CAT4 via `maintenanceByCategory` dans [../_spec/commercial.json](../_spec/commercial.json)

## Navigation

- ⬅️ Précédent: [README.md](./README.md)
- ➡️ Suivant: [socle-wordpress.md](./socle-wordpress.md)
- 📌 Prochain fichier à lire: [socle-wordpress.md](./socle-wordpress.md)
