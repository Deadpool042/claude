# Offers - Source of Truth

This folder is the single source of truth for pricing and module metadata.

## Update prices
- Base prices: edit `BASE_PRICES` in `offers.ts`.
- Deployment fees: edit `DEPLOYMENT_FEES` in `offers.ts`.

## Update modules
- Module ids must match `Docs/04-Modules/module-*.md` filenames.
- Edit module labels, descriptions, categories, and prices in `MODULES`.
- If you add/remove a module doc file, update `MODULE_IDS` and `MODULES` to match exactly.

## UI updates
- The `/dashboard/offres` page reads only from `offers.ts`.
- Any change in `offers.ts` is reflected in the UI automatically.
