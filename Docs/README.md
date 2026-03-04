# Documentation Framework — Spec-first

## Spec Canonique

`Docs/_spec` est la source de vérité unique du référentiel.

### Fichiers canoniques

- [cms.json](./_spec/cms.json)
- [features.json](./_spec/features.json)
- [plugins.json](./_spec/plugins.json)
- [modules.json](./_spec/modules.json)
- [capability-matrix.json](./_spec/capability-matrix.json)
- [decision-rules.json](./_spec/decision-rules.json)
- [commercial.json](./_spec/commercial.json)
- [custom-stacks.json](./_spec/custom-stacks.json)
- [shared-socle.json](./_spec/shared-socle.json)

### Règles d’édition

1. Modifier d’abord `Docs/_spec/*.json`.
2. Exécuter `pnpm spec:sync`.
3. Vérifier `pnpm spec:check`.
4. Exécuter `pnpm validate`.

### Conventions d’ID

- `cms.*` (ex: `cms.WOOCOMMERCE`)
- `feature.*` (ex: `feature.SHIPPING_BASIC`)
- `plugin.*` (ex: `plugin.WOOCOMMERCE_DYNAMIC_PRICING`)
- `module.*` (ex: `module.ADVANCED_PRICING`)

### Versioning

- Chaque fichier canonique expose `version` et `_meta.version`.
- Les changements de structure se versionnent explicitement (minor/major selon impact de compatibilité).

### Consommation code (Step 3)

- L’application consomme un miroir généré dans `site-factory/src/lib/referential/spec/data/*`.
- Ce miroir est généré depuis `Docs/_spec` (jamais édité manuellement).
- Référence opérationnelle: [GENERATION.md](./_spec/GENERATION.md).

## Documentation lisible (alignée spec)

1. [01-framework-overview.md](./01-framework-overview.md)
2. [02-supported-cms.md](./02-supported-cms.md)
3. [03-feature-classification.md](./03-feature-classification.md)
4. [04-cms-capability-matrix.md](./04-cms-capability-matrix.md)
5. [05-framework-modules.md](./05-framework-modules.md)
6. [06-plugin-integrations.md](./06-plugin-integrations.md)
7. [07-custom-apps.md](./07-custom-apps.md)
8. [08-decision-engine.md](./08-decision-engine.md)
9. [10-Socle-Technique/README.md](./10-Socle-Technique/README.md)
