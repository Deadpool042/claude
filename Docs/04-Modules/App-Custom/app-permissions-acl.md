# Permissions / ACL

## Ce que ça inclut
- Modèle de rôles et ACL fines (ressources, actions)
- Partage de ressources (équipes, organisations)
- Hooks d’autorisation dans l’API/back-office

## Ce que ça n’inclut pas
- Moteur RBAC/ABAC complet avec UI d’édition des règles
- Conformité SOX/ISO complète
- Gestion d’identités externes (SSO) — à cadrer séparément

## Pré-requis (agnostiques)
- Backend : BaaS ou backend custom
- Auth/roles : requis
- Storage/realtime : si partage temps réel demandé

## Estimation (référence)
- Prix de référence : 1 200–1 900 €
- Coef stack : appliquer COEF_STACK
- Coef backend : peut augmenter si multi-tenant strict ou RLS/ACL avancées

## Impact CI (indicatif)
- SA : +0
- DE : +0
- CB : +1
- SD : +1
- Score indicatif : +2.5

## Points de requalification
- Multi-tenant strict ? (isolation par organisation)
- Besoin d’édition dynamique des ACL côté admin ?
- Audit trail requis sur toutes les décisions d’accès ?
