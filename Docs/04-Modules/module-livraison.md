# 📦 Module Livraison & Logistique

> 🔒 **Document interne**
>
> Ce module définit le cadre de gestion des modes de livraison,
> des règles de calcul et des intégrations transporteurs.
>
> Il s’applique à partir de la **Tier 2**.
> En **Tier 4**, la logistique fait partie intégrante
> de l’architecture e‑commerce et n’est pas traitée comme un module isolé.

**Référence prix** : `08-Commercial/tableau-comparatif-offres.md`.


---

## 🧠 C’est quoi ce module ?

Le module Livraison permet de structurer la gestion des frais,
des zones et des règles de livraison lorsque le standard WooCommerce
n’est plus suffisant.

Il garantit un calcul fiable des frais de livraison,
un parcours panier → checkout cohérent
et une logique exploitable sans risque métier.

---

## ⚙️ Ce que WooCommerce gère nativement

WooCommerce propose nativement :

- des zones de livraison
- des méthodes simples (forfait, gratuit, retrait)
- des règles basées sur le montant ou le poids

WooCommerce **ne gère pas nativement** :

- règles conditionnelles complexes (produit, volume, pays)
- orchestration de plusieurs transporteurs
- calculs dynamiques via API
- stratégies de fallback ou d’optimisation logistique

👉 Dès que les règles dépassent le standard,
le **module Livraison** devient obligatoire.

---

## 🟢 Niveau 1 — Livraison standard étendue (Tier 2)

### Rôle

Structurer proprement les règles de livraison
au‑delà du strict minimum WooCommerce,
sans logique métier complexe.

### Inclus

- configuration avancée des zones de livraison
- règles par tranches (poids / montant)
- relais colis ou livraison à domicile
- tests panier → checkout
- documentation des règles

### Exclus

- règles conditionnelles par produit
- intégrations transporteurs API
- calculs temps réel

### Contraintes

- règles simples et lisibles
- pas de dépendance externe

💰 **Prix fixe** : **700 € HT**  
📦 **Catégorie** : 2

---

## 🔴 Niveau 2 — Logistique métier & transporteurs (Tier 3)

### Rôle - Tier 3

Gérer une logistique structurée,
avec contraintes métier, transporteurs multiples
ou calculs avancés.

### Inclus - gestion avancée des zones de livraison

- règles conditionnelles (produit, poids, volume, pays)
- intégration API transporteurs (tarifs, tracking)
- gestion multi-transporteurs
- scénarios de secours (fallback)
- tests et recette approfondis
- documentation fonctionnelle

### Exclus - solutions logistiques personnalisées

- ERP / WMS complet
- architecture logistique internationale (Tier 4)

### Contraintes - catégorie 3

- cadrage fonctionnel obligatoire
- validation client des règles
- responsabilité accrue sur les calculs

💰 **Prix fixe** : **3 500 € HT**  
📦 **Catégorie** : 3

---

## 🧪 Checklist avant livraison

- [ ] règles de livraison testées
- [ ] frais correctement calculés
- [ ] zones validées
- [ ] parcours commande vérifié
- [ ] documentation remise

---

## 📌 Règle finale

> Tier 1 = livraison WooCommerce native uniquement.  
> Toute règle conditionnelle, calcul avancé
> ou intégration transporteur entraîne
> l’activation du **module Livraison**
> ou une **requalification de catégorie**.
