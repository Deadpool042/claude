# Offers (Application Layer)

This folder is an application consumption layer, not the business canonical source.

## Source-of-truth model

| Layer | Path | Role |
|---|---|---|
| Canonical | `Docs/_spec/*` | Business/functional source of truth (rules, catalogs, pricing logic, decision model). |
| Derived | `site-factory/src/lib/referential/spec/data/*` | Generated runtime mirror from `Docs/_spec` (never edited manually). |
| Application | `site-factory/src/lib/offers/*` | UI-facing adapters and compatibility structures used by the app (for example `/dashboard/offres`). |
| Internal | `Docs/interne/*` | Internal notes and audits; not canonical business truth. |

## Editing rules

1. Change business rules in `Docs/_spec/*` first.
2. Run `pnpm spec:sync` to refresh derived runtime data.
3. Run `pnpm spec:check` to detect drift.
4. Update this folder only for application-level adaptation (labels, ordering, compatibility mapping, UI consumption).

## Non-goals for this folder

- Do not treat `offers.ts` as canonical business truth.
- Do not define competing business rules here when they belong to `_spec`.
- Do not use this README as canonical functional documentation.
