# Exemples d'implémentation par Tier

> Ce document fournit des **checklists universelles** d'implémentation du socle technique
> organisées par **Tier de maintenance** (déterminé par le Complexity Index).
> Les checklists sont **indépendantes de la technologie** et applicables à TOUTE stack.
> Les exemples de stacks mentionnées sont des **illustrations optionnelles**, pas une liste exhaustive.
>
> Le socle technique (`01-Socle-Technique/socle-technique.md`) définit les objectifs.
> Ce document montre **comment les vérifier** pour chaque tier, quelle que soit la technologie choisie.

---

## Tier 0 — Minimal (CI 5-7) — 79 €/mois

### Caractéristiques Tier 0

- Landing page ou site ultra-simple (1-5 pages)
- Contenu statique ou très peu dynamique
- Zéro logique métier complexe
- Maintenance minimaliste (mises à jour, monitoring)

### Checklist universel Tier 0

#### Sécurité
- [ ] HTTPS obligatoire et valide
- [ ] Pas d'authentification complexe (formulaires publics OK)
- [ ] Pas d'accès admin exposé
- [ ] Aucun secret (clés API, credentials) en dur

#### Performance
- [ ] Lighthouse >= 80 (mobile)
- [ ] TTFB < 800ms
- [ ] Images optimisées (WebP, responsive)
- [ ] Aucun JS superflu

#### SEO
- [ ] Sitemap valide (sitemap.xml)
- [ ] Robots.txt présent
- [ ] Meta titres et descriptions configurés
- [ ] Canonical tags si duplicatas potentiels

#### Formulaires & anti-spam
- [ ] Validation client présente
- [ ] Anti-spam actif (honeypot ou CAPTCHA léger)
- [ ] Aucune donnée sensible collectée

#### Consentement RGPD
- [ ] Pas de tracking par défaut
- [ ] Si analytics : consentement explicite
- [ ] Politique de confidentialité accessible

#### Sauvegardes
- [ ] Code source versionné (Git)
- [ ] Contenu versionné ou sauvegardable
- [ ] Déploiement reproductible

### Exemples de stacks Tier 0

**Générateurs statiques** :
- Astro, Hugo, Jekyll, 11ty, Next.js static, Nuxt SSG, SvelteKit static
- Caractéristiques : zéro JS dynamique, build statique, déploiement CDN

**Hébergement** :
- Vercel, Netlify, Cloudflare Pages, AWS S3 + CDN

---

## Tier 1 — Standard (CI 8-10) — 109 €/mois

### Caractéristiques Tier 1

- Vitrine d'entreprise (5-10 pages)
- Blog simple avec articles et catégories
- Formulaires de contact simples
- Gestion de contenu basique par client
- Pas d'e-commerce ou e-commerce très basique

### Checklist universel Tier 1

#### Sécurité
- [ ] HTTPS obligatoire et valide (HSTS)
- [ ] WAF ou durcissement basique appliqué
- [ ] Authentification admin sécurisée
- [ ] Pas de secrets en dur
- [ ] Mises à jour sécurité régulières

#### Performance
- [ ] Lighthouse >= 80 (mobile)
- [ ] TTFB < 800ms
- [ ] Cache HTTP configuré (navigateur + serveur)
- [ ] Images optimisées (WebP, responsive, lazy-load)
- [ ] Pas de dépendances JavaScript inutiles

#### SEO
- [ ] Sitemap XML valide et actualisé
- [ ] Robots.txt présent et adapté
- [ ] Meta titres / descriptions personnalisés
- [ ] Headers H1-H6 structurés
- [ ] Canonical tags si duplicatas
- [ ] URLs lisibles (slugs explicites)

#### Blog (si applicable)
- [ ] Articles et catégories
- [ ] Pas de multi-langue
- [ ] Pas de taxonomies personnalisées complexes
- [ ] Pas de logique métier ou marketing
- [ ] Pas d'intégrations externes avancées

#### Formulaires & anti-spam
- [ ] Validation serveur obligatoire
- [ ] Anti-spam actif (honeypot, CAPTCHA, rate limiting)
- [ ] Stockage des soumissions sécurisé
- [ ] Emails de confirmation fonctionnels

#### Consentement RGPD
- [ ] Banneau de consentement CMP valide
- [ ] Scripts de tracking chargés conditionnellement
- [ ] Politique de confidentialité complète et accessible

#### Email
- [ ] SMTP ou API emailing (jamais mail() basique)
- [ ] SPF / DKIM / DMARC configurés

#### Sauvegardes
- [ ] Code source versionné (Git)
- [ ] Base de données sauvegardée régulièrement
- [ ] Restauration testée

#### Monitoring
- [ ] Uptime monitoring actif (Ping, Updown, etc.)
- [ ] Alertes d'erreurs configurées
- [ ] Logs accessibles

### Exemples de stacks Tier 1

**CMS headful (gestion de contenu admin intégrée)** :
- WordPress, Strapi, Directus, Craft CMS, Ghost
- Caractéristiques : interface admin pour client, contenu persistant, extensible

**Frameworks JavaScript** :
- Next.js, Nuxt, SvelteKit, Remix, Astro (avec contenu dynamique)
- Caractéristiques : SSR/SSG hybride, gestion de contenu possible (headless ou fichiers)

**Frameworks backend classiques** :
- Django, Rails, Laravel, ASP.NET Core, Spring Boot
- Caractéristiques : backend + frontend, ORM intégré, routing natif

**Déploiement** :
- Vercel, Netlify, Heroku, DigitalOcean, AWS, VPS
- Quel que soit le choix, les critères de sécurité et performance restent identiques

---

## Tier 2 — Avancé (CI 11-15) — 139 €/mois

### Caractéristiques Tier 2

- Vitrine avec modules standards (e-commerce simple, newsletter, multi-langue partiel)
- E-commerce basique (< 50 produits, TVA simple, 1-2 paiements)
- Intégrations simples (newsletter, CRM léger, tracking avancé)
- Recherche et filtres basiques

### Checklist universel Tier 2

#### Héritage Tier 1
- ✅ Tous les critères Tier 1 s'appliquent

#### Modules standards
- [ ] Module choisi identifié (voir `04-Modules/modules.md`)
- [ ] Module compatible avec la stack choisie
- [ ] Intégration non-invasive (pas de dépendances excessives)

#### E-commerce (si applicable)
- [ ] Catalogue <= 50 produits
- [ ] TVA standard uniquement (pas de règles conditionnelles)
- [ ] Panier et commande fonctionnels
- [ ] Paiement tiers sécurisé (Stripe, PayPal, etc.)
- [ ] Emails transactionnels testés
- [ ] Gestion de stock basique

#### Newsletter / Email marketing (si applicable)
- [ ] Service tiers intégré (Mailchimp, SendGrid, ConvertKit)
- [ ] Double opt-in respecté
- [ ] Désinscription facile
- [ ] RGPD respecté

#### Tracking & Analytics (si applicable)
- [ ] Google Analytics ou équivalent intégré
- [ ] Tracking des conversions basique
- [ ] Consentement préalable requis

#### Recherche & filtres (si applicable)
- [ ] Recherche full-text fonctionnelle
- [ ] Filtres par catégorie / tag
- [ ] Pas de recherche facettée complexe

#### Performance (renforcée)
- [ ] Lighthouse >= 80 (mobile)
- [ ] Core Web Vitals passants
- [ ] Images optimisées (CDN recommandé)
- [ ] Caching avancé (ETags, cache layers)

#### Sauvegardes & disponibilité
- [ ] Backups automatiques quotidiens
- [ ] Restauration testée et documentée
- [ ] Plan de continuité en cas de perte

### Exemples de stacks Tier 2

**E-commerce** :
- WooCommerce (WordPress), Shopify API, Medusa, Saleor, Big Commerce
- Next.js + Stripe, Rails + Solidus

**Newsletter** :
- Brevo, Mailchimp, ConvertKit, Substack, Ghost (natif)

**CMS headless + Frontend** :
- Strapi + Next.js/Nuxt, Contentful + React, Sanity + SvelteKit

**Analytics avancé** :
- Hotjar, Segment, Mixpanel, Plausible

**Aucune stack n'est obligatoire** — le critère est la **satisfaction des objectifs Tier 2**.

---

## Tier 3 — Métier (CI 16-20) — 169 €/mois

### Caractéristiques Tier 3

- Logique métier complexe spécifique au domaine
- Réglementations sectorielles (accises, TVA complexe, etc.)
- Intégrations métier avancées (CRM complexe, ERP, APIs propriétaires)
- Dashboards personnalisés
- Contenu avec règles commerciales
- IA avec logique métier

### Checklist universel Tier 3

#### Héritage Tier 1-2
- ✅ Tous les critères Tier 1-2 s'appliquent

#### Logique métier
- [ ] Module **métier** appliqué (voir grille-qualification-client.md)
- [ ] Règles métier documentées (spécifications fonctionnelles)
- [ ] Cas limites testés (validation métier)
- [ ] Audit métier effectué

#### Réglementations
- [ ] Secteur d'activité identifié
- [ ] Obligations légales inventoriées
- [ ] Conformité vérifiée par personne compétente
- [ ] Évolutions réglementaires monitorées

#### Intégrations métier
- [ ] Chaque API/intégration documentée
- [ ] Protocoles sécurisés (OAuth, API keys sécurisées)
- [ ] Fallbacks et gestion d'erreurs prévus
- [ ] SLA des partenaires connus

#### Performance & monitoring
- [ ] Monitoring renforcé (APM, logs centralisés)
- [ ] Alertes configurées sur métriques critiques
- [ ] SLA défini et mesuré

### Exemples de stacks Tier 3

**Pas d'exemples standardisés** — chaque Tier 3 est bespoke.

Voir `09-Interne/grille-qualification-client.md` section Q8 pour identifier les critères de passage en Tier 3.

---

## Tier 4 — Premium (CI 21-25) — 209 €/mois+

### Caractéristiques Tier 4

- Architecture découplée (headless) avec frontend indépendant
- Haute performance extrême (CWV < 50ms, LH 95+)
- Branding très premium et custom
- Forte volumétrie (100k+ pages, 100k+ utilisateurs)
- Observabilité avancée

### Checklist universel Tier 4

#### Héritage Tier 1-3
- ✅ Tous les critères Tier 1-3 s'appliquent

#### Architecture headless (si applicable)
- [ ] Module **architecture headless** appliqué
- [ ] Séparation claire CMS / Frontend
- [ ] Auth API + CORS sécurisés
- [ ] Draft preview fonctionnel
- [ ] Webhooks de revalidation configurés
- [ ] Cache API + stratégie de revalidation définie
- [ ] Monitoring front + back indépendants

#### Performance extrême
- [ ] Lighthouse >= 95 (mobile)
- [ ] Core Web Vitals : P75 < 100ms
- [ ] TTFB < 200ms
- [ ] CLS < 0.1
- [ ] LCP < 2.5s
- [ ] Optimisations avancées : code splitting, tree shaking, edge computing

#### Branding premium
- [ ] Design custom très poussé
- [ ] Animations / micro-interactions fluides
- [ ] Accessibilité WCAG AA+
- [ ] Responsive sur tous les appareils

#### Observabilité avancée
- [ ] APM (Application Performance Monitoring) intégré
- [ ] Logs centralisés et queryables
- [ ] Tracing distribué (si services multiples)
- [ ] Dashboards de KPIs métier
- [ ] Alertes intelligentes

#### Disponibilité & résilience
- [ ] Clustering ou multi-région
- [ ] Fallbacks automatiques
- [ ] Disaster recovery plan documenté
- [ ] RTO/RPO définis et testés

### Exemples de stacks Tier 4

**Architecture headless** :
- WordPress API (découpé) + Next.js / Nuxt / Astro
- Strapi + Next.js / Nuxt
- Sanity + Next.js / SvelteKit
- Contentful + React
- Rails API + Next.js
- Django API + React / Vue

**Haute performance** :
- Astro + CDN edge
- Next.js + Vercel Edge Runtime
- Cloudflare Workers
- Deno Deploy
- Remix + Cloudflare

**Observabilité** :
- Datadog, New Relic, Sentry, LogRocket, Grafana

**Aucune combination n'est imposée** — l'important est d'atteindre les **objectifs de performance et résilience**.

---

## Extensibilité : évaluer une nouvelle stack

Quand une stack n'est pas mentionnée dans ce document (Django, Elixir, Go, etc.), comment la **qualifier pour un Tier** ?

### Processus de validation

1. **Vérifier la capacité à atteindre le socle technique**
   - Peut-on faire du HTTPS + WAF ?
   - Peut-on optimiser images et performances ?
   - Comment gérer les backups ?

2. **Vérifier la maintenabilité**
   - Version stable maintenue ?
   - Communauté active ?
   - Dépendances à jour ?

3. **Appliquer la checklist du Tier visé**
   - Tous les critères doivent être satisfaisables

4. **Documenter l'approche**
   - Ajouter une section "Stacks > [Nouvelle stack]" dans ce document
   - Suivre le format des autres stacks

5. **Valider avec tech lead**
   - Voir `06-Integration-Technologie/guide-integration.md`

### Exemple : évaluer Django pour Tier 2

**Django peut atteindre Tier 2** si :
- [ ] ORM + migrations gérées (données persistantes)
- [ ] Admin natif configurable
- [ ] Gestion d'authentification
- [ ] API REST facilement implémentable
- [ ] Tests et monitoring possibles
- [ ] Déploiement sur VPS / Docker

→ **Conclusion** : Django peut être utilisé en Tier 1-4 selon la complexité du projet.

---

## Coefficients de pricing par stack

Le prix de base et les modules sont calculés avec un **coefficient par stack**,
reflétant l'effort de développement relatif.

| Stack | Coefficient | Logique |
| --- | --- | --- |
| WordPress / WooCommerce | x1.0 | Plugins + configuration (référence) |
| CMS headless simple (Strapi, Directus) | x1.2 | Config + peu de custom |
| Générateur statique (Astro, Hugo, 11ty) | x1.2 | Dev custom léger (SSG) |
| Framework JS moderne (Next.js, Nuxt, SvelteKit) | x1.3 | Dev custom complet |
| Framework backend (Django, Rails, Laravel) | x1.3 | Dev + gestion d'infra |
| WordPress headless | x1.6 | Coordination front/back |
| WooCommerce headless | x1.8 | Headless + e-commerce |
| Autre stack validée | x1.4 - x1.6 | À négocier selon complexité |

> Ces coefficients s'appliquent au prix de base **et** aux modules.
> Ils n'impactent pas le CI ni le palier de maintenance.

---

## Règle fondamentale

> **Ces exemples illustrent le cadre, ils ne le définissent pas.**
> Le socle technique (01-Socle-Technique/) fixe les objectifs.
> Chaque Tier définit les critères à valider.
> Chaque stack les atteint avec ses propres outils.
>
> Toute nouvelle stack doit démontrer qu'elle peut atteindre
> les mêmes objectifs de sécurité, performance, maintenabilité et conformité.
> Aucune stack n'est interdite si elle peut le prouver.
