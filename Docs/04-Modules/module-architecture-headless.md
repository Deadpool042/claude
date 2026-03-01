# 📦 Module Architecture headless

> 🔒 **Document interne – structurant**
>
> Ce module définit le cadre de mise en place d’une **architecture headless**
> reposant sur WordPress en back‑office et un front applicatif
> (Next.js ou équivalent).
>
> Il s’applique **exclusivement à la Tier 4**.
> L’architecture headless n’est **jamais proposée** en Tier 1, 2 ou 3.

**Référence prix** : `08-Commercial/tableau-comparatif-offres.md`.


---

## ⚠️ Nature du module (à lire en premier)

L’architecture headless n’est **pas une optimisation**
ni une évolution progressive d’un site WordPress classique.

Il s’agit d’un **changement d’architecture complet** impliquant :

- séparation totale front / back
- complexité technique accrue
- responsabilités renforcées
- maintenance spécifique

👉 Ce module **requalifie systématiquement** le projet en Tier 4.

---

## 🧠 C’est quoi le module Architecture headless ?

Le module Architecture headless consiste à utiliser WordPress
uniquement comme **CMS back‑office**, tandis que l’interface publique
est développée avec un framework applicatif moderne
(Next.js, React, etc.).

👉 Objectif : répondre à des besoins avancés
en termes de performance, SEO international,
scalabilité ou expérience utilisateur personnalisée.

---

## 🎯 Objectifs du module

- définir une architecture front / back découplée
- concevoir des APIs fiables et sécurisées (API REST, GraphQL)
- gérer le rendu SSR / ISR (Server-Side Rendering / Incremental Static Regeneration)
- optimiser le SEO en contexte headless
- documenter l’architecture et les flux

---

## ⚙️ Ce que WordPress gère (ou ne gère pas) nativement

WordPress permet nativement :

- la gestion des contenus
- les utilisateurs et rôles
- l’API REST / GraphQL (selon stack)
- l’administration éditoriale

WordPress **ne gère pas nativement** :

- le rendu front headless
- le SEO côté front applicatif
- le cache SSR / ISR
- le routage applicatif
- la gestion du déploiement front

👉 Dès qu’un front applicatif est requis,
l’architecture headless devient obligatoire.

---

## 🔵 Niveau unique — Architecture headless (Tier 4)

### Rôle

Concevoir et mettre en place une **architecture applicative complète**
reposant sur un back‑office WordPress
et un front découplé.

---

### Inclus

- définition de l’architecture globale
- conception des flux API
- sécurisation des échanges WP ↔ front
- mise en place du rendu SSR / ISR
- configuration SEO headless
- stratégie de cache adaptée
- déploiement initial
- documentation technique

---

### Exclus (non négociable)

- refonte fonctionnelle métier
- développement applicatif lourd hors périmètre
- maintenance applicative continue
- garantie chiffrée de performance

---

### Contraintes

- accès complet à l’infrastructure
- périmètre technique figé
- validation d’architecture obligatoire
- stack technique imposée
- coordination étroite avec les autres modules Tier 4

---

💰 **Tarification** : **A partir de 2 000 € HT**  
📦 **Catégorie** : 4  
🔧 **Impact maintenance** : élevé (selon grille globale)

---

## 🚫 Hors périmètre du module

- projets simples ou vitrines
- e‑commerce standards
- sites à faible trafic
- demandes “headless pour faire moderne”

---

## 🧪 Checklist avant livraison

- [ ] architecture validée
- [ ] APIs documentées
- [ ] flux sécurisés
- [ ] SEO testé côté front
- [ ] déploiement validé
- [ ] documentation remise

---

## 📌 Règle finale

> L’architecture headless est un **choix d’ingénierie**,
> pas une option esthétique.
>
> Elle implique une complexité, une maintenance
> et des coûts adaptés à la Tier 4.
