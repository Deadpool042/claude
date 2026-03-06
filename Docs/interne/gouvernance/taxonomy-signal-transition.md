# Gouvernance evergreen - Transition taxonomy signal (runtime)

> Type documentaire: `interne evergreen`
> Statut: actif
> Derniere revue: `2026-03-06`
> Portee: transition taxonomique runtime (sans changement de schema ni runtime dans ce document)

## 1. Contexte

La taxonomie cible est canonique dans la documentation produit, mais le runtime conserve des enums legacy qui ne separent pas nativement certains cas:

- cluster `SITE`: `BLOG`/`VITRINE` couvrent `SITE_VITRINE` et `SITE_BUSINESS`;
- cluster `APP`: `APP` couvre `MVP_SAAS` et `APP_METIER`.

Le probleme initial est donc une ambiguite de lecture et de persistance pendant la transition, avec risque de perdre l'intention metier si on ne stocke pas un signal explicite.

Le signal transitoire `taxonomySignal` a ete introduit pour lever cette ambiguite, tout en conservant la compatibilite avec le legacy runtime.

## 2. Taxonomie cible

Taxonomie cible canonique (source de verite documentaire):

- `SITE_VITRINE`
- `SITE_BUSINESS`
- `ECOMMERCE`
- `MVP_SAAS`
- `APP_METIER`

Rappels normatifs:

- `Docs/_spec` reste la source canonique.
- `ECOMMERCE` est un mapping exact en runtime legacy (`ECOM`).
- Les zones d'ambiguite transitoire sont `SITE_VITRINE` vs `SITE_BUSINESS` et `MVP_SAAS` vs `APP_METIER`.

## 3. Legacy runtime encore en place

Etat runtime conserve pour compatibilite:

- `ProjectType` legacy: `BLOG`, `VITRINE`, `ECOM`, `APP` (+ `STARTER` legacy).
- `OfferCategory` legacy: `VITRINE_BLOG`, `ECOMMERCE`, `APP_CUSTOM`.
- Persistance historique CI: `ci_axes_json` (champ `ciAxesJson`).

Impact:

- un type runtime legacy ne suffit pas toujours a reconstituer une famille canonique cible;
- le fallback historique via `ciAxesJson` reste necessaire pendant la phase transitoire.

## 4. Architecture de transition actuelle

### 4.1 Mapping central

La couche centrale est dans:

- `site-factory/src/lib/taxonomy/runtime-taxonomy-mapping.ts`
- `site-factory/src/lib/taxonomy/transitional-taxonomy-signal.ts`

Responsabilites:

- mapping legacy <-> canonique avec statut (`EXACT`, `PROVISIONAL`, `APPROXIMATE`, `AMBIGUOUS`);
- normalisation/validation de `taxonomySignal`;
- resolution du signal (`persisted`, `inferred`, `default`, `none`).

### 4.2 Role de `taxonomySignal`

`taxonomySignal` est un signal metier explicite pour desambiguation de cluster.

Valeurs autorisees:

- `SITE_VITRINE`
- `SITE_BUSINESS`
- `MVP_SAAS`
- `APP_METIER`

Compatibilite imposee:

- `BLOG`/`VITRINE` acceptent uniquement `SITE_VITRINE` ou `SITE_BUSINESS`;
- `APP` accepte uniquement `MVP_SAAS` ou `APP_METIER`;
- `ECOM`/`STARTER` n'utilisent pas ce signal.

### 4.3 Dual-read

La lecture persistee suit une priorite stricte via `readPersistedTaxonomySignalDualSource`:

1. colonne dediee `taxonomy_signal` (si compatible type projet);
2. fallback transitoire `ciAxesJson` (enveloppe `SITE_FACTORY_TAXONOMY_SIGNAL_V1`);
3. sinon absence de signal persiste.

Les valeurs incompatibles avec le type projet sont ignorees.

### 4.4 Dual-write

Tant que la transition est active:

- les flux create/update ecrivent la colonne dediee `taxonomySignal` quand un signal stable existe;
- `ciAxesJson` est serialise via `serializeQualificationCiAxesJson`.

Quand un signal est present, `ciAxesJson` embarque une enveloppe transitoire:

```json
{
  "kind": "SITE_FACTORY_TAXONOMY_SIGNAL_V1",
  "version": 1,
  "taxonomySignal": "SITE_BUSINESS",
  "ciAxes": {}
}
```

Quand aucun signal n'est present, la serialisation revient au payload legacy `ciAxes` (sans enveloppe).

### 4.5 Fallback `ciAxesJson`

Le fallback sert uniquement de filet de compatibilite pendant la migration.

- Il est lu uniquement si la colonne dediee est absente/invalide.
- Il ne remplace pas la colonne dediee comme source cible long terme.

## 5. Persistance actuelle

Persistance dediee deja en place dans Prisma:

- modele: `ProjectQualification`
- champ Prisma: `taxonomySignal TaxonomyDisambiguationSignal?`
- colonne SQL: `project_qualifications.taxonomy_signal` (nullable)
- migration introduite: `site-factory/prisma/migrations/20260309120000_add_taxonomy_signal_persistence/migration.sql`

Persistance legacy conservee:

- `project_qualifications.ci_axes_json` reste presente pendant la phase transitoire.

## 6. Outils de suivi

Script de gouvernance:

- `site-factory/prisma/backfill-taxonomy-signal.ts`
- commande package: `pnpm sf:backfill-taxonomy-signal`

Modes supportes:

- `dry-run` (par defaut): sans `--apply`, aucune ecriture.
- `--apply`: applique les updates candidates.
- `--stats-only`: rapport de synthese uniquement, aucune ecriture (meme si `--apply` est present).
- `--json`: sortie JSON machine-readable.
- `--rollback`: mode rollback (remise a `null` de la colonne dediee pour les lignes encore alignees avec le fallback).

Exemples utiles:

```bash
pnpm sf:backfill-taxonomy-signal
pnpm sf:backfill-taxonomy-signal --stats-only --json
pnpm sf:backfill-taxonomy-signal --apply
pnpm sf:backfill-taxonomy-signal --rollback
pnpm sf:backfill-taxonomy-signal --rollback --apply
```

## 7. Interpretation des rapports

Lecture du rapport backfill (`--json` ou sortie texte):

- `recoverableViaCiAxesJson > 0`: lignes encore recuperables via fallback, backfill restant a appliquer.
- `ambiguousOrMissing > 0`: lignes in-scope (`BLOG`/`VITRINE`/`APP`) sans signal exploitable.
- `incompatible > 0`: signal fallback incompatible avec le `projectType`.
- `inconsistentDedicatedVsEnvelope > 0`: divergence entre colonne dediee et enveloppe `ciAxesJson`.
- `dedicatedIncompatibleWithProjectType > 0`: colonne dediee invalide vs type.
- `dedicatedWithoutCiAxesEnvelope > 0`: colonne dediee presente mais enveloppe fallback absente.
- `outOfScope > 0`: lignes sans signal hors perimetre signal (`STARTER`/`ECOM`), a suivre mais non bloquant pour la desambiguation.

Lecture du rapport rollback:

- `candidates.total`: lignes rollbackables en securite (uniquement miroir colonne/fallback).
- usage attendu: operation de mitigation, pas mode nominal.

## 8. Criteres de sortie / passage en column-only

Le passage futur en lecture column-only est `ready` seulement si tous les criteres suivants sont vrais:

1. `recoverableViaCiAxesJson = 0` sur au moins 2 runs consecutifs.
2. `ambiguousOrMissing = 0` sur les types in-scope.
3. `incompatible = 0`, `inconsistentDedicatedVsEnvelope = 0`, `dedicatedIncompatibleWithProjectType = 0`.
4. Aucun flux create/update n'introduit de nouvelle ligne in-scope sans signal stable persiste.
5. Les tests de flux taxonomie/persistance restent passants.

Tant qu'un critere est faux, le fallback `ciAxesJson` reste obligatoire.

## 9. Plan futur recommande de retrait du fallback

Plan recommande (hors execution dans cette phase):

1. Baseline: lancer `--stats-only --json` et archiver le snapshot.
2. Assainissement: corriger les anomalies et lancer le backfill `--apply` si necessaire.
3. Stabilisation: verifier 2 cycles consecutifs conformes aux criteres de sortie.
4. Bascule runtime (future PR dediee): lecture column-only avec garde temporaire.
5. Retrait progressif: suppression de la lecture fallback `ciAxesJson`, puis simplification de la serialisation.
6. Nettoyage final (phase ulterieure): fermeture de la transition et documentation post-migration.

## 10. Points d'attention / invariants

- `Docs/_spec` reste la source canonique metier.
- `taxonomySignal` ne doit jamais contourner les regles de compatibilite type projet.
- Les valeurs `inferred`/`default` servent la resolution runtime, pas une nouvelle verite persistente par defaut.
- Tant que la transition est active, le dual-read et le dual-write sont la norme.
- Le mode `--rollback` est reserve aux scenarios de mitigation, pas a l'exploitation courante.
- Toute decision de retrait fallback doit etre basee sur les rapports, pas sur une hypothese ponctuelle.
