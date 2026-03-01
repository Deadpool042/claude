# 🔀 Flux décisionnel — Qualification des projets

> 🔒 **Document interne**
>
> Ce document sert de **référentiel décisionnel unique** pour qualifier
> un projet, déterminer sa catégorie réelle, appliquer les règles de
> requalification et identifier la maintenance applicable.
>
> Aucune interprétation commerciale ne doit primer sur ce flux.

---

## 🎯 Objectif du document

Ce flux décisionnel permet de :

- qualifier un projet de manière **factuelle**
- éviter les dérives de périmètre
- garantir la cohérence entre devis, production et maintenance
- s'appliquer **quelle que soit la stack technique** (WordPress, Next.js, Nuxt, Astro…)

---

## 🔒 Règles d'usage

- Ce document est **strictement interne**
- Il s'applique **avant devis**, **avant vente**, et **avant engagement**
- Toute décision doit pouvoir être **justifiée par une règle ci-dessous**
- En cas de doute → **requalification vers la catégorie supérieure**

---

## 0️⃣ Principe fondamental — Stack ≠ Catégorie

La **catégorie** d'un projet est déterminée par sa **complexité fonctionnelle**.
La stack technique **n'influence pas la catégorie** ; elle influence le **prix**
et les **contraintes de déploiement**.
Les modules et contraintes d'architecture peuvent **requalifier** la catégorie.

| Ce qui détermine la catégorie | Ce qui ne détermine PAS la catégorie |
| ----------------------------- | ------------------------------------ |
| Nombre de modules activés     | WordPress vs Next.js                 |
| Contraintes métier/légales    | Langage (PHP, TypeScript)            |
| Règles de requalification     | Framework front                      |
| Complexité fonctionnelle      | Mode de déploiement                  |

Un site vitrine en Next.js = Tier 1, exactement comme un site vitrine en WordPress.
Un e-commerce avec accises en Next.js = Tier 3, exactement comme en WooCommerce.

---

## 1️⃣ Point d'entrée — Type fonctionnel du projet

Le flux commence par l'identification du **type fonctionnel** du projet :

| Type fonctionnel     | Description                                    | Familles de stack (exemples)                         |
| -------------------- | ---------------------------------------------- | ---------------------------------------------------- |
| **Statique / HTML**  | Landing, mini-site, 1-3 pages                   | HTML/SSG, CMS minimal                                 |
| **Blog**             | Site éditorial, contenu                        | CMS monolithique, SSG, framework front                |
| **Vitrine**          | Présentation, landing pages                    | CMS monolithique, SSG, framework front                |
| **E-commerce**       | Vente en ligne (produits/services)             | CMS e-commerce, headless + front, framework full-stack |
| **Application**      | Webapp, plateforme, dashboard, SaaS            | Framework full-stack, headless + API                  |

Ce type est **indépendant de la stack technique** pour la logique fonctionnelle.
La stack est **proposée après qualification** (cf. §7) selon contraintes et contexte.

### ⚠️ Règle clé — Application = pas de WordPress

Une application custom (dashboard, SaaS, plateforme…) ne s’implémente
pas en WordPress. Les stacks JS (Next.js, Nuxt, Astro) sont les seules
options proposées.

---

## 2️⃣ Catégorie initiale par type fonctionnel

| Type fonctionnel           | Catégorie initiale |
| -------------------------- | ------------------ |
| Statique / mini-site       | Tier 0              |
| Blog simple                | Tier 1              |
| Vitrine                    | Tier 1              |
| E-commerce simple          | Tier 2              |
| E-commerce avancé          | Tier 2              |
| Application / plateforme   | Tier 4              |

### Précisions

- **E-commerce simple** : catalogue ≤ 50 produits, TVA standard, 1-2 moyens de paiement, pas de règles métier (Tier 2 — WooCommerce = setup complexe)
- **E-commerce avancé** : catalogue étendu, options de livraison multiples, variations produits complexes
- **Application** : logique métier, dashboard, gestion utilisateurs avancée, API, plateforme
- **E-commerce custom (sans CMS e-commerce)** : Tier 3 minimum

⚠️ Cette catégorie est **provisoire** et peut évoluer selon les modules activés.

---

## 3️⃣ Analyse des modules activés

Une fois le type fonctionnel identifié, il faut analyser les **modules activés**.
Les modules sont **compatibles selon la stack** et leur coût varie selon l'implémentation.

### 🟢 Modules neutres

Ces modules **n'entraînent pas de requalification** :

- SEO standard
- Sécurité standard (socle technique)
- Performance standard
- Compte client basique
- Dark mode
- Accessibilité de base

👉 Ils restent compatibles avec la catégorie initiale.

---

### 🔴 Modules structurants

Ces modules peuvent **modifier la catégorie du projet** :

- Multi-langue → **Tier 2 minimum**
- Multi-devises → **Tier 2 minimum**
- Paiement avancé → **Tier 2 minimum**
- Newsletter / email marketing → **Tier 2 minimum**
- Tunnel de vente / conversion avancé → **Tier 2 minimum**
- Recherche & filtres avancés → **Tier 2 minimum**
- Marketing & tracking avancé → **Tier 2 minimum**
- Accises / fiscalité réglementée → **Tier 3 obligatoire**
- Tarification métier → **Tier 3 obligatoire**
- Connecteurs métier → **Tier 3 obligatoire**
- IA avec logique métier → **Tier 3 obligatoire**
- Dashboard personnalisé → **Tier 3 obligatoire**
- Architecture headless → **Tier 4 obligatoire**
- Performance avancée → **Tier 4 obligatoire**

👉 Chaque module structurant déclenche une **vérification obligatoire**.

---

## 4️⃣ Règles de requalification

Les règles suivantes sont **non négociables** :

### Requalification automatique

| Déclencheur                          | Catégorie minimale |
| ------------------------------------ | ------------------ |
| Multi-langue (partiel)               | Tier 2              |
| Paiement en ligne                    | Tier 2              |
| Newsletter / CRM                     | Tier 2              |
| Multi-langue (site entier)           | Tier 3              |
| Accises / réglementation             | Tier 3              |
| Tarification métier                  | Tier 3              |
| Connecteurs métier                   | Tier 3              |
| IA avec logique métier               | Tier 3              |
| Dashboard personnalisé               | Tier 3              |
| Headless                             | Tier 4              |
| Performance avancée (CWV stricts)    | Tier 4              |

### Règle cumulative

- Si **un seul module** impose une catégorie supérieure → le projet est requalifié
- La **catégorie finale** est toujours la **plus élevée atteinte**

---

## 5️⃣ Détermination de la catégorie finale

La catégorie finale est définie par :

1. le type fonctionnel du projet
2. les modules activés
3. les règles de requalification

👉 Cette catégorie finale sert de référence pour :

- le périmètre
- la complexité
- la maintenance
- le budget

---

## 6️⃣ Détermination de la maintenance

Règles applicables :

- **Une seule maintenance active par site**
- La maintenance est **alignée sur la catégorie finale**
- Les modules **ne cumulent pas de maintenance**
- Les abonnements spécifiques (IA, emailing, APIs) sont traités à part

| Catégorie | Maintenance          |
| --------- | -------------------- |
| Tier 0     | Standard             |
| Tier 1     | Standard             |
| Tier 2     | Avancée              |
| Tier 3     | Métier renforcée     |
| Tier 4     | Premium              |

---

## 6️⃣bis Choix de stack (après qualification)

La stack est choisie **après** la catégorie et les modules, en fonction :
du budget, de l'hébergement cible, et des contraintes techniques.

Familles de stacks (exemples, non exhaustif) :

- CMS monolithique (WordPress, Drupal, etc.)
- Headless CMS + front (WordPress headless, Strapi, etc.)
- Framework full-stack (Next.js, Nuxt, SvelteKit, Remix, etc.)
- Statique / HTML (Astro, Eleventy, HTML simple)

👉 Toute stack non listée est possible **après validation** via le guide d'intégration.

---

## 7️⃣ Abonnements externes

Certains modules impliquent des **coûts externes récurrents** :

- Assistant IA → abonnement dédié
- Emailing / newsletter → abonnement possible
- APIs tierces → selon fournisseur

👉 Ces abonnements sont :

- **distincts de la maintenance**
- explicitement mentionnés
- facturés séparément si nécessaire

---

## 8️⃣ Cas fréquents à risque

### Client se pense Tier 1 mais ne l'est pas

Exemples :

- demande multi-langue
- tunnel de conversion avancé
- contraintes réglementaires

👉 Obligation de **requalification immédiate**.

---

### Ajout de module en cours de vie

- analyse du module
- application des règles
- possible changement de catégorie
- ajustement de la maintenance

---

### Retrait de module

- possible baisse de catégorie
- **uniquement après validation technique**
- jamais automatique

---

### Changement de stack en cours de projet

- la **catégorie ne change pas** si le périmètre fonctionnel reste identique
- le budget de base est ajusté selon la stack
- si la nouvelle stack implique une **architecture différente** (headless, custom),
  appliquer les règles de requalification

---

## 8️⃣bis Tarification par stack

Le prix total est **déterministe** : prix de base (selon la stack) + modules + mise en production.

### Coefficients de référence (modules)

| Stack | Coefficient module | Logique |
| --- | ---: | --- |
| WordPress / WooCommerce | ×1.0 | Plugins + configuration (référence) |
| Astro | ×1.2 | Dev custom léger (SSG) |
| Next.js / Nuxt | ×1.3 | Dev custom complet |
| WordPress headless | ×1.6 | Coordination front/back |
| WooCommerce headless | ×1.8 | Headless + e-commerce |

### Règles d'application

- E-commerce **custom (sans CMS e-commerce)** = **Tier 3 minimum**
- Architecture headless = **module obligatoire** (Tier 4 minimum)
- Les modules utilisent le même coefficient de stack que la base
- L'hébergement et le domaine sont **à la charge du client** (voir §8ter)

---

## 8️⃣ter Hébergement & domaine

L'hébergement et le domaine sont **la propriété du client** et à sa charge financière.
Ils constituent une **ligne séparée** du budget de développement.

### ⚠️ Règle : hébergement = client

- Le client **choisit, paie et est propriétaire** de son hébergement et de son domaine
- Ces coûts sont **mentionnés séparément** dans le devis (jamais inclus dans le budget dev)
- Le prestataire peut recommander un hébergeur mais le contrat est au nom du client

### Compatibilité stack ↔ hébergement

Toutes les combinaisons ne sont pas possibles. Cette matrice **filtre les options**
dans le flux de création/édition de projet :

| Cible               | WP classique | WP headless | Next.js | Nuxt | Astro | Notes                                     |
| -------------------- | ------------ | ----------- | ------- | ---- | ----- | ----------------------------------------- |
| **Mutualisé**        | ✅           | ✅ (split)  | ❌      | ❌   | ❌    | PHP + MySQL (WP), frontend via Vercel     |
| **Vercel / Cloud**   | ❌           | ❌          | ✅      | ✅   | ✅    | Serverless, pas de PHP                    |
| **Docker / VPS**     | ✅           | ✅ (unifié) | ✅      | ✅   | ✅    | Tout fonctionne (containers)              |

> **WP headless** = WordPress comme CMS API (backend PHP) + frontend JS séparé (Next.js, Nuxt ou Astro).
> Nécessite **2 services** (WP backend + frontend JS), deux architectures possibles :
>
> 1. **Split** : WP sur mutualisé (o2switch, OVH) + frontend sur Vercel → le plus économique (3–30 €/mois)
> 2. **Unifié** : WP + frontend en containers sur le même VPS (Docker) → plus de contrôle (15–50 €/mois)
>
> ⚠️ "Vercel seul" est exclu car WordPress (PHP) ne peut pas tourner sur Vercel.

### Coûts indicatifs

| Cible                              | Hébergement type                         | Coût indicatif      |
| ---------------------------------- | ---------------------------------------- | ------------------- |
| Mutualisé (o2switch, OVH)          | Hébergement mutualisé                    | 3–10 €/mois         |
| Vercel / Cloud                     | Vercel Free ou Pro                       | 0–20 €/mois         |
| Docker / VPS                       | VPS géré                                 | 15–50 €/mois        |
| WP headless — split                | Mutualisé (WP) + Vercel (frontend)       | 3–30 €/mois         |
| WP headless — unifié               | VPS (WP + frontend en containers)        | 15–50 €/mois        |

⚠️ L'hébergement est **facturé séparément** et explicité dans le devis.
Il n'est pas inclus dans le budget de base ni dans la maintenance.

---

## 8️⃣quater Forfait mise en production

La mise en production initiale d'un projet représente un **effort de développement réel** :
configuration CI/CD, paramétrage serveur, DNS, certificats SSL, pipelines de déploiement, etc.

Ce forfait est **facturé une seule fois** et ajouté au budget du projet.
Il est **distinct de l'hébergement** (qui est récurrent et à la charge du client).

### Grille tarifaire — Sites classiques (WP, Next.js, Nuxt, Astro)

| Cible de déploiement      | Forfait mise en production | Détail                                         |
| ------------------------- | -------------------------- | ---------------------------------------------- |
| **Mutualisé**             | **200 €**                  | Config FTP/SSH, DNS, SSL, mise en ligne         |
| **Vercel / Cloud**        | **150 €**                  | Config Vercel, variables d'env, domaine, CI/CD  |
| **Docker / VPS**          | **500 €**                  | Docker Compose, Traefik, SSL, CI/CD, monitoring |

### Grille tarifaire — WordPress headless

| Architecture              | Forfait mise en production | Détail                                                      |
| ------------------------- | -------------------------- | ----------------------------------------------------------- |
| **Split** (Mutu + Vercel) | **350 €**                  | WP sur mutualisé + frontend Vercel, 2 déploiements distincts |
| **Unifié** (Docker)       | **500 €**                  | WP + frontend en containers Docker sur VPS                   |

### Règles d'application

- Le forfait est **obligatoire** et apparaît comme ligne distincte dans le devis
- Il est facturé **une seule fois** à la livraison initiale
- Il couvre : CI/CD, configuration serveur, DNS, SSL, premiers déploiements, vérifications
- Il ne couvre **pas** : l'hébergement récurrent, le domaine, la maintenance
- En cas de **migration d'hébergement** ultérieure, un nouveau forfait peut s'appliquer

---

## 9️⃣ Règles non négociables

- Tier 1 = simplicité fonctionnelle réelle
- Toute complexité structurelle = requalification
- Aucun module ne "passe en douce"
- Le flux décisionnel prime sur le discours commercial
- La stack technique **n'influence pas la catégorie**, mais influence le coût

---

```mermaid

flowchart TD
  subgraph Qualifier un projet
  A0([Début — Brief client])
  A1{Type fonctionnel ?}
  B0[Statique /<br>Mini-site]
  B1[Blog / Vitrine]
  B2[E-commerce<br>(simple ou avancé)]
  B3[Application /<br>Plateforme]
  C1{Modules<br>structurants ?}
  C2{Modules<br>structurants ?}
  C3{Modules<br>structurants ?}
  OUT0([Tier 0 Starter])
  OUT1([Tier 1 Standard])
  OUT2([Tier 2 Avancé])
  OUT3([Tier 3 Métier])
  OUT4([Tier 4 Premium])
  end

    A0 --> A1
    A1 -- Statique --> B0
    A1 -- Blog / Vitrine --> B1
    A1 -- E-commerce --> B2
    A1 -- App / Plateforme --> B3

    B0 --> OUT0
    B1 --> C1
    C1 -- Aucun --> OUT1
    C1 -- Tier 2+ --> OUT2
    C1 -- Tier 3+ --> OUT3
    C1 -- Tier 4 --> OUT4

    B2 --> C2
    C2 -- Aucun --> OUT2
    C2 -- Tier 3+ --> OUT3
    C2 -- Tier 4 --> OUT4

    B3 --> C3
    C3 -- Aucun --> OUT3
    C3 -- Tier 4 --> OUT4

    style OUT1 fill:#E8F8F5,stroke:#1ABC9C,color:#0B5345
    style OUT2 fill:#EBF5FB,stroke:#3498DB,color:#1B4F72
    style OUT3 fill:#FEF9E7,stroke:#F4D03F,color:#7D6608
    style OUT4 fill:#FDEDEC,stroke:#E74C3C,color:#641E16
```

---

## 📌 Règle finale

> Ce flux est un **outil de protection** pour toi et pour le client.
>
> Toute demande hors cadre déclenche une **requalification**
> ou un **ajustement**, sans exception.
