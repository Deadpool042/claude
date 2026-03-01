# 📦 Module Tarification métier

> 🔒 **Document interne – module métier**
>
> Ce module définit le cadre de gestion des **règles de prix spécifiques**
> dépendant d’une logique métier.
>
> Il relève exclusivement de la **Tier 3**.  
> Il est explicitement exclu des **Catégories 1 & 2**.  
> En **Tier 4**, la logique tarifaire est intégrée à l’architecture globale et ne fait pas l’objet d’un module séparé.

**Référence prix** : `08-Commercial/tableau-comparatif-offres.md`.


---

## ⚠️ Nature du module (à lire en premier)

Le module Tarification métier impacte directement :

- le chiffre d’affaires
- la facturation
- parfois la fiscalité

👉 Une erreur de tarification = **perte financière immédiate**.  
Ce module nécessite donc **cadrage, validation et tests renforcés**.

---

## 🧠 C’est quoi le module Tarification métier ?

Le module Tarification métier permet de définir des **prix conditionnels**  
basés sur des règles métier claires et limitées.

👉 Objectif : implémenter des règles de prix **définies à l’avance**  
sans créer un moteur de tarification complexe ou évolutif.

---

## 🧩 Capacités natives de WooCommerce (hors module métier)

WooCommerce gère nativement :

- prix simples
- prix promotionnels
- coupons
- taxes standards

Limites natives (non couvertes par WooCommerce seul) :

- pas de tarification selon profil client
- pas de paliers ou tarifs par volume
- pas de tarification contractuelle spécifique
- pas de priorisation conditionnelle des règles

👉 Dès que le pricing dépasse ce cadre natif,  
le **module Tarification métier devient nécessaire**.

---

## ❌ Exclusions Catégories 1 & 2 (règle absolue)

- aucun prix conditionnel
- aucun prix par profil client
- aucune règle par volume ou quantité
- aucune tarification contractuelle

➡️ Toute demande de prix dépendant du contexte  
entraîne automatiquement une **requalification en Tier 3**.

---

## 🎯 Objectifs du module Tarification métier

- appliquer des règles de prix métier validées
- garantir la cohérence des montants affichés et facturés
- documenter précisément les règles implémentées
- éviter toute ambiguïté ou dérive future

---

## 🔴 Niveau unique — Tarification métier avancée (Tier 3)

### Rôle

Implémentation d’une **logique de prix conditionnelle**  
basée sur des règles fournies par le client.

---

### Exemples de règles couvertes

- prix par rôle client (B2B / B2C / revendeur)
- prix par volume ou palier
- prix contractuels par client
- règles de remise métier
- prix conditionnés à un statut spécifique

---

### Inclus — Tarification métier

- implémentation des règles de prix validées
- priorisation claire des règles
- affichage cohérent des prix
- compatibilité panier / checkout
- journalisation des règles appliquées
- documentation fonctionnelle détaillée

---

### Exclus — Tarification métier (non négociable)

- moteur de règles illimité
- pricing dynamique ou algorithmique
- optimisation automatique des marges
- IA de pricing
- interconnexion ERP complexe

---

### Pré-requis obligatoires

- règles de prix écrites et exhaustives
- validation écrite du client
- absence de règles implicites ou évolutives
- périmètre figé après validation

Sans ces éléments, **le module n’est pas activable**.

---

### Contraintes techniques

- règles isolées et traçables
- ordre de priorité documenté
- tests unitaires sur cas métier
- absence de logique cachée

---

💰 **Prix fixe** : **3 000 € HT**  
🔧 **Maintenance** : renforcée (selon grille globale)  
📦 **Impact catégorie** : Tier 3

---

## 🧪 Checklist avant livraison

- [ ] règles de prix fournies par écrit
- [ ] validation client signée
- [ ] tests sur tous les cas métier
- [ ] affichage panier / checkout validé
- [ ] documentation remise

---

## 🚫 Règles non négociables

- aucune tarification implicite
- aucune règle évolutive sans devis
- aucune responsabilité financière portée par le partenaire
- toute évolution = ajustement complémentaire

---

## 📌 Clause de protection (à reprendre au contrat)

> Le partenaire technique implémente les règles de tarification  
> **telles que fournies et validées** par le client.  
> Il n’assume **aucune responsabilité financière**  
> en cas d’erreur liée aux règles définies par le client.

---

## 📌 Règle finale

> La tarification métier est une **logique business critique**.  
> Elle impose cadrage strict, validation écrite et maintenance renforcée.
