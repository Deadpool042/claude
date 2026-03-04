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
- **Server Actions** : dans des fichiers `server-actions/*.ts` (principalement sous `src/features/**`) avec `"use server"`
- **Validation** : schemas Zod dans `src/lib/validators/`
- **DB** : singleton Prisma dans `src/lib/db/`
- **Slugs** : generes via `src/lib/slug/`

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

## Wizard de création projet

Le parcours de création projet dans le dashboard suit l’ordre suivant :

1. Questionnaire
2. Cadrage technique
3. Modules
4. Projet
5. Résumé

Règles UX/produit en place :

- Démarrage progressif : la qualification live démarre après la première réponse utile.
- VITRINE/BLOG basiques peuvent être qualifiés en CAT0 ; CAT1+ dépend du CI et des contraintes/modules.
- Pré-remplissage : cadrage technique et modules sont proposés automatiquement depuis le questionnaire.
- Ajustabilité : les pré-remplissages peuvent être modifiés avant validation finale.
- Le questionnaire inclut le mode éditorial MDX/Git : qui publie (client ou agence), limites d’accès si push client, et options de coûts en sus.
- La qualification live et le résumé affichent ces informations d’exploitation sans modifier le CI à périmètre fonctionnel constant.

## shadcn/ui

Composants disponibles dans `src/components/ui/` :
Button, Card, Input, Table, Label, Badge, Select, Skeleton.
