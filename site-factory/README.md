# Site Factory - App Next.js

Application d'administration pour gerer les clients et projets de la Site Factory.

## Stack

- **Next.js 16** (App Router, Server Components, Server Actions)
- **TypeScript** strict (`strict: true`, `noImplicitAny`, `exactOptionalPropertyTypes`)
- **Tailwind CSS 4** + **shadcn/ui**
- **Prisma 6** (MariaDB)
- **Zod** pour la validation
- **react-hook-form** + `@hookform/resolvers`

## Commandes

```bash
# Developpement
pnpm dev              # Next.js dev sur port 3100

# Qualite
pnpm lint             # ESLint flat config strict
pnpm typecheck        # tsc --noEmit

# Base de donnees
pnpm prisma:migrate   # Prisma migrate dev
pnpm prisma:studio    # Interface Prisma Studio
pnpm prisma:generate  # Regenerer le client Prisma

# Production
pnpm build            # Build Next.js
pnpm start            # Start production
```

## Conventions

- **Aucun `any`** : ESLint `@typescript-eslint/no-explicit-any: error`
- **Imports types** : `import type { X } from ...` (enforced par ESLint)
- **Server Actions** : dans des fichiers `_actions/*.ts` avec `"use server"`
- **Validation** : schemas Zod dans `src/lib/validators/`
- **DB** : singleton Prisma dans `src/lib/db/`
- **Slugs** : generes via `src/lib/slug.ts`

## Structure des routes

```
src/app/
├── (dashboard)/
│   ├── layout.tsx              # App Shell (sidebar + header)
│   ├── loading.tsx             # Skeleton loading
│   ├── page.tsx                # Dashboard
│   ├── clients/
│   │   ├── page.tsx            # Liste clients
│   │   ├── new/page.tsx        # Creation client
│   │   └── [clientId]/page.tsx # Detail client
│   ├── projects/
│   │   ├── page.tsx            # Liste projets
│   │   └── new/page.tsx        # Creation projet
│   ├── configs/page.tsx        # Placeholder
│   └── infra/page.tsx          # Placeholder
├── api/clients/route.ts        # API clients (pour select)
└── page.tsx                    # Redirect -> /dashboard
```

## shadcn/ui

Composants disponibles dans `src/components/ui/` :
Button, Card, Input, Table, Label, Badge, Select, Skeleton.
