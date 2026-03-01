# Modèle de chiffrage (App Custom)

Formule spécifique aux projets **App Custom (Cat 4)** :

```
PRIX_BUILD = SOCLE_APP_CUSTOM + Σ(MODULES_APP_CUSTOM × COEF_STACK) × COEF_BACKEND
```

- **SOCLE_APP_CUSTOM** : prix de base Cat 4 (App Custom).
- **MODULES_APP_CUSTOM** : modules **exclusivement** Cat 4 (voir catalogue dédié).
- **COEF_STACK** : coefficient par stack front (ex. Next/Nuxt/SSR = ×1.3 ; Astro = ×1.2 ; ajuster selon la table active).
- **COEF_BACKEND** : coefficient lié à la famille backend (agnostique) :

| Famille backend | Exemples | Coef |
| --- | --- | --- |
| BaaS standard | Supabase, Firebase, Appwrite Cloud | ×1.00 |
| BaaS avancé (sécurité/droits/data strict) | RLS/ACL avancés, multi-tenant strict, audit logs | ×1.10–×1.20 |
| Backend custom API | NestJS, Symfony API, Django | ×1.20–×1.35 |
| Self-hosted / VPS ops lourds | DB + backups + monitoring gérés par nous | +0.10 sur le coef choisi |

### Exemples

**Exemple MVP — App locative**
- Socle App Custom
- Modules : documents, import CSV, permissions simples
- Backend : BaaS standard (Supabase/Firebase en exemple) → COEF_BACKEND ×1.00
- Prix build = SOCLE_APP_CUSTOM + Σ(modules × COEF_STACK)

**Exemple Standard — App locative**
- Socle App Custom
- Modules : documents, import quittances PDF, messagerie temps réel (lu/non-lu, pagination), notifications, droits fichiers stricts
- Backend : BaaS avancé (RLS/ACL serrés) → COEF_BACKEND ×1.10–×1.20
- Prix build = SOCLE_APP_CUSTOM + Σ(modules × COEF_STACK) × COEF_BACKEND
