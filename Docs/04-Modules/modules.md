# Modules — Catalogue (index)

> Ce document est l'**index** du catalogue modules.
> Chaque module a son fichier dédié avec le détail (périmètre, prix, exclusions).
>
> 👉 **Un module n'est jamais inclus par défaut.**
> 👉 Les prix sont alignés sur `08-Commercial/tableau-comparatif-offres.md`.

---

## 🧱 Stack technique

Les modules sont **compatibles selon la stack** (WordPress, WooCommerce, Next.js, Nuxt, Astro, headless).
Le tarif de référence est **WordPress / WooCommerce**, et un coefficient est appliqué selon la stack.

| Stack | Coefficient module | Logique |
| --- | ---: | --- |
| WordPress / WooCommerce | ×1.0 | Plugins + configuration (référence) |
| Astro | ×1.2 | Dev custom léger (SSG) |
| Next.js / Nuxt | ×1.3 | Dev custom complet |
| WordPress headless | ×1.6 | Coordination front/back |
| WooCommerce headless | ×1.8 | Headless + e-commerce |

👉 Tout écart entraîne une **requalification** et un **recalage du prix**.

---

## 🟢 Tier 2 — Modules standards

> **Prix de base (WP/Woo)** = référence.  
> Le prix final dépend du coefficient de stack (table ci-dessus).

| Module | Prix base (WP/Woo) | Compatibilite | Fichier |
|--------|-------------------:|---------------|---------|
| Multi-langue | 900–1 500 € | Tous stacks | `module-multi-langue.md` |
| Multi-devises | 600 € | E-commerce | `module-multi-devises.md` |
| Paiement | 600 € | E-commerce | `module-paiement.md` |
| Livraison | 700 € | E-commerce | `module-livraison.md` |
| Tunnel de vente | 1 000 € | E-commerce / lead | `module-tunnel-de-vente.md` |
| Analytics e-com | 500 € | E-commerce | `module-analytics-woo.md` |
| Assistant IA (setup) | 1 500 € | Tous stacks | `module-assistant-ia.md` |
| Newsletter & Email | 500 € | Tous stacks | `module-newsletter-email-marketing.md` |
| Recherche & filtres | 800 € | Tous stacks | `module-filtre-et-recherche.md` |
| SEO avancé | 500 € | Tous stacks | `module-seo-avance.md` |
| Compte client | 800 € | E-commerce | `module-compte-client.md` |
| Dark mode | 300 € | Tous stacks | `module-dark-mode.md` |
| Accessibilité renforcée | 600 € | Tous stacks | `module-accessibilite-renforcee.md` |
| Connecteurs | 800 € | Tous stacks | `module-connecteurs.md` |
| Marketing & tracking | 600 € | Tous stacks | `module-marketing-traking.md` |

> La sécurité renforcée est couverte par le **socle commun** et le **niveau de maintenance** (pas de module dédié).
> (ce n'est plus un module optionnel).

---

## 🔴 Tier 3 — Modules métier / réglementés

| Module | Prix base (WP/Woo) | Compatibilite | Fichier |
|--------|-------------------:|---------------|---------|
| Accises & fiscalité | 4 000 € | E-commerce | `module-accises-fiscalite.md` |
| Tarification métier | 3 000 € | E-commerce | `module-tarification-metier.md` |
| Dashboard personnalisé | 3 500 € | Stacks WordPress/Woo | `module-dashboard-personnalise.md` |

> Les modules Tier 2 ont aussi un Niveau 2 en Tier 3 (prix plus élevé).
> Voir chaque fichier module pour les détails.

---

## 🔵 Tier 4 — Modules premium

| Module | Prix base (WP/Woo) | Compatibilite | Fichier |
|--------|-------------------:|---------------|---------|
| Architecture headless | 2 000 € | Headless (WP/Woo) | `module-architecture-headless.md` |
| Performance avancée | 1 500 € | Tous stacks | `module-performance-avancee.md` |

---

## 🟣 Modules App Custom (Cat 4 uniquement)

> Ces modules ne s’appliquent qu’aux projets **App Custom (Cat 4)**.  
> Ils ne concernent pas WordPress/WooCommerce.

Prix de référence (base) — appliquer **COEF_STACK** selon le front choisi.

| Module | Périmètre | Prix de référence (base) | Impact CI (indicatif) | Notes |
| --- | --- | --- | --- | --- |
| Documents & partage | Drive léger, upload, tags, partage interne | 1 200–1 800 € | SA +1, SD +1 | `App-Custom/app-documents.md` |
| Import CSV (batch) | Upload CSV, mapping, validations | 900–1 400 € | SA +1, DE +1 | `App-Custom/app-import-csv.md` |
| Import quittances PDF | Extraction PDF, OCR léger, mapping quittances | 1 500–2 200 € | SA +1, DE +1, SD +1 | `App-Custom/app-import-quittance-pdf.md` |
| Messagerie asynchrone | Inbox in-app (threads), statut lu/non-lu | 1 400–2 100 € | SA +1, DE +1 | `App-Custom/app-messaging-async.md` |
| Messagerie temps réel | Chat temps réel, présence, pagination | 1 800–2 600 € | SA +1, DE +2 | `App-Custom/app-messaging-realtime.md` |
| Notifications | Email/push/in-app, modèles, préférences | 800–1 200 € | DE +1 | `App-Custom/app-notifications.md` |
| Permissions / ACL | Rôles, ACL fines, partage ressources | 1 200–1 900 € | CB +1, SD +1 | `App-Custom/app-permissions-acl.md` |
| Workflows | États, transitions, validations, tâches | 1 500–2 300 € | SA +1, CB +1 | `App-Custom/app-workflow.md` |
| Audit logs | Traçabilité actions, export | 900–1 400 € | SD +1 | `App-Custom/app-audit-logs.md` |
| Reporting & exports | Rapports, exports CSV/PDF programmés | 1 000–1 600 € | SA +1, DE +1 | `App-Custom/app-reporting-exports.md` |

---

## 🤖 Abonnements récurrents

| Service | Prix HT/mois | Split | Fichier |
|---------|-------------|-------|---------|
| Assistant IA Starter | 49 € | 70/30 partenaire/agence | `module-assistant-ia.md` |
| Assistant IA Business | 99 € | 70/30 | `module-assistant-ia.md` |
| Assistant IA Premium | 149 € | 70/30 | `module-assistant-ia.md` |

---

## 📌 Règles

- Un module ne devient jamais "inclus"
- Tout module ajoute de la complexité et peut requalifier la catégorie finale
- Trop de modules → requalification tier
- Un module mal défini = refus
- Aucun outil marketing/tracking sans consentement explicite
- La maintenance est **globale**, non cumulative par module

> **Les modules créent de la valeur, pas du chaos.**
