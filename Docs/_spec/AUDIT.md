# AUDIT Step 2 — Canonical Spec (`Docs/_spec`)

Date: 2026-03-04
Périmètre audité: `cms.json`, `features.json`, `plugins.json`, `modules.json`, `capability-matrix.json`, `decision-rules.json`, `commercial.json`, `custom-stacks.json`, `shared-socle.json`.

## 1) Summary table

| Metric | Total |
| --- | ---: |
| CMS | 6 |
| Features | 31 |
| Plugins | 18 |
| Modules | 12 |

## 2) Broken invariants (must fix now)

État actuel: **aucune violation bloquante**.

Invariants vérifiés:
- IDs `cms.*`, `feature.*`, `plugin.*`, `module.*` uniques et stables.
- Couverture `capability-matrix.json`: 1 ligne par CMS pour chaque feature.
- `feature.DARK_MODE` classée `THEME_FEATURE` partout.
- Justification module vs plugin présente quand une voie `PLUGIN_INTEGRATION` existe.
- Mapping maintenance `CAT0..CAT4` complet dans `commercial.json`.

## 3) Warnings (can fix later)

État actuel: **aucun warning**.

## 4) Redundancy audit

### Feature IDs duplicatifs
- Aucun doublon d’ID détecté.
- Aucune collision de convention d’ID détectée.

### Modules redondants avec CMS native/plugin
- Aucun module n’est exclusivement redondant `CMS_NATIVE` ou `PLUGIN_INTEGRATION` sur tous les CMS.
- Coexistence plugin/module présente et justifiée pour:
  - `module.ADVANCED_PRICING`
  - `module.MARKETING_AUTOMATION`
  - `module.PRODUCT_RECOMMENDATION`
  - `module.IDENTITY_SSO`

## 5) Proposed diffs (applied)

### Features completeness
- File: `Docs/_spec/features.json`
  - Node: `features[id=*].type`
  - New value: type ajouté pour toutes les features (`CMS`, `COMMERCE`, `ANALYTICS`, `MARKETING`, `UX`) selon `domain` + `uiOnly`.

### Modules rationale completeness
- File: `Docs/_spec/modules.json`
  - Node: `modules[id=*].classificationRationale`
  - New value: `"Module framework réutilisable à forte valeur métier transversale."`
- File: `Docs/_spec/modules.json`
  - Node: `modules[id=module.ADVANCED_PRICING].pluginInsufficiencyRationale`
  - New value: `"Les plugins existants ne couvrent pas durablement les besoins multi-CMS, la réutilisabilité et la gouvernance CI/maintenance."`
- File: `Docs/_spec/modules.json`
  - Node: `modules[id=module.MARKETING_AUTOMATION].pluginInsufficiencyRationale`
  - New value: `"Les plugins existants ne couvrent pas durablement les besoins multi-CMS, la réutilisabilité et la gouvernance CI/maintenance."`
- File: `Docs/_spec/modules.json`
  - Node: `modules[id=module.PRODUCT_RECOMMENDATION].pluginInsufficiencyRationale`
  - New value: `"Les plugins existants ne couvrent pas durablement les besoins multi-CMS, la réutilisabilité et la gouvernance CI/maintenance."`
- File: `Docs/_spec/modules.json`
  - Node: `modules[id=module.IDENTITY_SSO].pluginInsufficiencyRationale`
  - New value: `"Les plugins existants ne couvrent pas durablement les besoins multi-CMS, la réutilisabilité et la gouvernance CI/maintenance."`

### Commercial completeness
- File: `Docs/_spec/commercial.json`
  - Node: `annexCosts.deploySetupFeeRange`
  - New value: `{ "min": 390, "max": 390 }`
- File: `Docs/_spec/commercial.json`
  - Node: `pluginRecurringCosts`
  - New value: `{ "monthlyMin": 0, "monthlyMax": 350, "source": "Derived from plugins pricingMode/priceMonthlyMin/priceMonthlyMax" }`

### Plugins metadata completeness (immediate adjustments)
- File: `Docs/_spec/plugins.json`
  - Nodes: `plugins[id=*].vendor`, `plugins[id=*].url`, `plugins[id=*].pricingMode`
  - New value: complétés pour supprimer les warnings de traçabilité.

## 6) Validation

- Audit machine: `Docs/_spec/audit-step2.raw.json` => `errors: []`, `warnings: []`.
- Synchronisation miroir: `pnpm spec:sync`.
- Vérification anti-dérive: `pnpm spec:check`.
