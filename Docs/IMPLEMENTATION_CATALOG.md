# IMPLEMENTATION_CATALOG.md

## Rôle du document

Ce document décrit la couche d’implémentation de Site Factory.

Son rôle est de cadrer la manière dont les décisions du moteur sont mappées vers des solutions techniques concrètes.

Cette couche n’est pas la source de vérité métier.  
Elle est une couche de réalisation.

Elle sert à :

- référencer les briques techniques disponibles
- décrire leurs capacités
- décrire leurs limites
- documenter leurs compatibilités
- permettre le mapping entre stratégie d’implémentation et options concrètes
- alimenter la génération de projet

---

## Principe fondamental

La couche d’implémentation est une **sortie mappée** depuis :

- le modèle canonique
- le moteur de décision
- la stratégie d’implémentation
- le profil technique retenu

Elle ne doit jamais devenir :

- l’identité du projet
- la source principale de la qualification
- le lieu où l’on décide du besoin
- le substitut du moteur de décision

La technique est une conséquence.  
Elle n’est pas le point de départ du système.

---

## Position dans la chaîne

La chaîne cible est :

**besoin**
→ **modèle canonique**
→ **moteur de décision**
→ **implementationStrategy**
→ **technicalProfile**
→ **catalogue d’implémentation**
→ **génération**
→ **exploitation**

Le catalogue intervient donc après la décision structurante.

Il doit permettre de répondre à la question :

**Avec quelles briques concrètes réalise-t-on la stratégie retenue ?**

et non à :

**De quelle technologie part-on pour définir le projet ?**

---

# 1. Responsabilités de la couche catalogue

Le catalogue d’implémentation doit :

- recenser les options techniques disponibles
- documenter leurs usages pertinents
- documenter leurs limites
- définir leurs compatibilités
- définir leurs incompatibilités
- exposer des profils techniques cohérents
- servir de base aux générateurs
- éviter la redondance de vérité dans l’UI et le runtime

Le catalogue ne doit pas :

- déterminer seul la famille de solution
- déterminer seul le delivery model
- déterminer seul le niveau de mutualisation
- redéfinir le besoin métier
- faire disparaître les arbitrages du moteur

---

# 2. Niveaux de modélisation à distinguer

La couche d’implémentation doit être structurée en plusieurs niveaux distincts.

## 2.1 Stratégie d’implémentation

Niveau abstrait, décidé par le moteur.

Exemples :

- `CMS_CONFIGURED`
- `CMS_EXTENDED`
- `HEADLESS_CONTENT_SITE`
- `CUSTOM_WEB_APP`
- `OPERATED_TEMPLATE_PRODUCT`
- `HYBRID_STACK`

## 2.2 Profil technique

Niveau intermédiaire, également dérivé du moteur.

Exemples :

- `WP_EDITORIAL_STANDARD`
- `NEXT_MDX_EDITORIAL`
- `HEADLESS_CMS_FRONTEND`
- `CUSTOM_APP_MANAGED`
- `OPERATED_CONTENT_PRODUCT`

## 2.3 Implémentation concrète

Niveau technique réel.

Exemples :

- WordPress avec jeu de plugins donné
- Next.js + MDX
- CMS headless + frontend web
- application custom full stack
- base opérée mutualisée avec modules dédiés

## 2.4 Génération

Transformation de l’implémentation concrète en artefacts :

- repo projet
- structure de fichiers
- configs
- manifest
- conventions
- scripts
- pipeline de déploiement

Ces quatre niveaux ne doivent pas être confondus.

---

# 3. Familles de briques à cataloguer

Le catalogue doit séparer les briques techniques par nature.

## 3.1 CMS

Exemples :

- WordPress
- CMS headless
- CMS éditoriaux spécialisés
- autres outils de gestion de contenu

## 3.2 Frameworks applicatifs

Exemples :

- frameworks frontend
- frameworks full stack
- moteurs de rendu
- systèmes de routing et rendering

## 3.3 Modules fonctionnels

Exemples :

- contenu éditorial
- booking
- paiement
- espace membre
- formulaires
- catalogue
- recherche
- notifications
- dashboard métier

## 3.4 Plugins / extensions / connecteurs

Exemples :

- plugins CMS
- connecteurs métier
- extensions SEO
- extensions multilingues
- extensions e-commerce

## 3.5 Services d’infrastructure

Exemples :

- base de données
- cache
- stockage
- mail
- search
- CDN
- observabilité
- auth

## 3.6 Profils d’hébergement

Exemples :

- basic managed
- dedicated managed
- compliant isolated
- operated platform

## 3.7 Patterns d’édition

Exemples :

- édition bloc/CMS
- MDX
- contenu structuré
- édition simple statique
- édition hybride

## 3.8 Patterns de déploiement

Exemples :

- repo Git + Vercel
- serveur managé
- conteneur dédié
- plateforme mutualisée
- mono-tenant standardisé
- multi-tenant opéré

Cette séparation évite de tout mélanger dans un seul objet “stack”.

---

# 4. Ce que le catalogue doit décrire pour chaque brique

Chaque brique référencée doit pouvoir documenter au minimum :

- identifiant stable
- nom lisible
- catégorie
- rôle
- usages pertinents
- prérequis
- limites
- compatibilités
- incompatibilités
- contraintes d’exploitation
- niveau de mutualisation compatible
- niveau de standardisation compatible
- niveau de custom acceptable
- impact sur la génération

Le but n’est pas seulement de lister des technologies, mais de les relier au système de décision.

---

# 5. Mapping stratégie → implémentations

Le catalogue doit permettre un mapping clair :

**implementationStrategy**
→ **technicalProfile**
→ **options concrètes compatibles**
→ **génération**

## Exemples

### `CMS_CONFIGURED`

Peut mener vers :

- profil CMS éditorial simple
- profil CMS vitrine business
- profil CMS contenu léger

### `CMS_EXTENDED`

Peut mener vers :

- CMS avec modules métier encadrés
- CMS avec extensions e-commerce
- CMS avec connecteurs spécifiques

### `HEADLESS_CONTENT_SITE`

Peut mener vers :

- frontend éditorial + contenu géré séparément
- profil Next.js + MDX
- profil CMS headless + frontend web

### `CUSTOM_WEB_APP`

Peut mener vers :

- app métier dédiée
- portail spécifique
- back-office métier avancé

### `OPERATED_TEMPLATE_PRODUCT`

Peut mener vers :

- base opérée standardisée
- produit à abonnement
- plateforme mutualisée

### `HYBRID_STACK`

Peut mener vers :

- CMS + frontend dédié
- noyau standard + modules spécifiques
- combinaison éditoriale et métier

Le catalogue doit donc relier les couches sans les fusionner.

---

# 6. Compatibilités et incompatibilités

Le catalogue doit documenter explicitement :

- ce qui est autorisé
- ce qui est recommandé
- ce qui est conditionnel
- ce qui est interdit

## Types de compatibilités à documenter

### Compatibilités avec `solutionFamily`

Exemple :

- certaines briques conviennent bien à `CONTENT_PLATFORM`
- d’autres sont peu adaptées à `BUSINESS_APP`

### Compatibilités avec `deliveryModel`

Exemple :

- certaines implémentations sont adaptées au `DELIVERED_CUSTOM`
- d’autres sont plus cohérentes avec `MANAGED_STANDARDIZED` ou `OPERATED_PRODUCT`

### Compatibilités avec `mutualizationLevel`

Exemple :

- une implémentation peut être acceptable en `SHARED_SOCLE`
- mais inadaptée en `MUTUALIZED_MULTI_TENANT`

### Compatibilités avec l’éditorial

Exemple :

- certaines solutions supportent mieux les workflows éditoriaux riches
- d’autres conviennent mieux à un contenu léger ou quasi statique

### Compatibilités avec les contraintes

Exemple :

- certaines briques sont peu adaptées à de fortes contraintes de conformité
- certaines sont inadaptées à un isolement fort
- certaines supportent mal un besoin de custom très profond

Le catalogue doit rendre ces arbitrages visibles, pas implicites.

---

# 7. Le catalogue ne doit pas devenir un configurateur de techno

Le principal risque est de transformer le catalogue en point d’entrée principal du système.

Cela doit être évité.

## Dérive incorrecte

- on choisit un CMS
- on choisit une stack
- puis on essaie de faire rentrer le besoin dedans

## Approche correcte

- on qualifie le besoin
- on décide d’une famille de solution
- on décide d’un delivery model
- on décide d’un niveau de mutualisation
- on décide d’une stratégie
- ensuite seulement on choisit les briques compatibles

Le catalogue intervient donc **après la décision**, pas avant.

---

# 8. Place des préférences techniques

Des préférences techniques peuvent exister.

Exemples :

- préférence pour un CMS connu
- préférence pour une édition simple
- préférence pour un hébergement donné
- préférence pour un mode de déploiement particulier

Mais elles doivent être modélisées comme :

- préférences
- contraintes secondaires
- informations contextuelles

Elles ne doivent pas :

- remplacer le moteur
- inverser la hiérarchie besoin → décision → implémentation
- définir seules le projet

---

# 9. Profils techniques recommandés

Le catalogue doit favoriser des **profils techniques** plutôt qu’une explosion de combinaisons brutes.

Un profil technique est une composition cohérente de briques.

## Exemples de profils

### `WP_EDITORIAL_STANDARD`

Pour :

- contenu éditorial classique
- édition simple
- besoin standard
- exploitation dédiée ou socle partagé

### `NEXT_MDX_EDITORIAL`

Pour :

- contenu maîtrisé
- édition structurée légère
- besoins éditoriaux compatibles MDX
- delivery dédié ou managé

### `HEADLESS_CMS_FRONTEND`

Pour :

- contenu structuré
- séparation forte contenu/frontend
- expérience éditoriale dédiée

### `CUSTOM_APP_MANAGED`

Pour :

- logique métier forte
- opérations spécifiques
- besoin d’exploitation gérée

### `OPERATED_CONTENT_PRODUCT`

Pour :

- offre standardisée
- logique mutualisable
- cadre produit opéré

Ces profils servent d’interface entre décision et génération.

---

# 10. Lien entre catalogue et génération

Le catalogue doit alimenter la génération de manière déterministe.

La génération ne doit pas “deviner” des associations non documentées.

Pour chaque profil technique retenu, le catalogue doit permettre de savoir :

- quels générateurs utiliser
- quelle structure de projet produire
- quels modules inclure
- quelles configs initialiser
- quels patterns de déploiement appliquer
- quelles contraintes d’exploitation noter dans le manifest

Le catalogue doit donc être **actionnable**, pas seulement descriptif.

---

# 11. Place des modules fonctionnels standardisés

Le catalogue doit distinguer les **briques techniques** des **modules fonctionnels récurrents**.

Exemples de modules fonctionnels :

- booking
- catalogue
- paiement
- espace membre
- formulaires avancés
- portail client
- dashboard simple
- publication éditoriale
- recherche
- emails transactionnels

Ces modules ne sont pas nécessairement liés à une seule stack.

Un même module fonctionnel doit pouvoir être :

- implémenté différemment selon la stratégie
- réutilisé comme motif de standardisation
- qualifié indépendamment de son implémentation

C’est important pour préserver l’évolution vers des offres standardisées ou opérées.

---

# 12. Place des offres opérées dans le catalogue

Le catalogue doit aussi pouvoir représenter les implémentations propres aux offres opérées.

Cela inclut notamment :

- socles mutualisés
- variantes mono-tenant standardisées
- patterns multi-tenant
- modules à options limitées
- politiques de personnalisation encadrée
- patterns de déploiement opérés
- contraintes de versioning produit

Ces éléments doivent être modélisés explicitement, et non cachés dans des templates ad hoc.

---

# 13. Ce qui doit rester hors du catalogue

Le catalogue ne doit pas porter :

- la qualification du besoin
- les arbitrages métier primaires
- les calculs de catégorie historique
- les règles de pricing global non liées aux implémentations
- la logique UI
- les états de formulaire
- les conventions de présentation

Il peut contenir des règles de compatibilité technique, mais il ne doit pas devenir un moteur métier caché.

---

# 14. Invariants du catalogue

Les invariants suivants doivent être respectés :

1. le catalogue ne définit pas l’identité du projet
2. le catalogue intervient après la décision métier
3. chaque brique documente ses compatibilités et ses limites
4. chaque profil technique correspond à une composition cohérente
5. les modules fonctionnels ne doivent pas être confondus avec une stack unique
6. la génération doit pouvoir s’appuyer sur le catalogue sans logique implicite majeure
7. l’UI ne doit pas redéfinir localement ce qui existe déjà dans le catalogue
8. le catalogue doit permettre plusieurs implémentations pour une même stratégie
9. les offres opérées doivent être représentables explicitement
10. les préférences techniques ne doivent pas devenir des vérités de domaine

---

# 15. Exemples de lecture correcte

## Exemple 1 — Projet éditorial managé

Décision :

- `solutionFamily = BUSINESS_SITE`
- `deliveryModel = MANAGED_CUSTOM`
- `mutualizationLevel = SHARED_SOCLE`
- `implementationStrategy = HEADLESS_CONTENT_SITE`
- `technicalProfile = NEXT_MDX_EDITORIAL`

Le catalogue doit alors permettre de retrouver :

- les briques compatibles
- les modules éditoriaux compatibles
- les patterns de déploiement compatibles
- les contraintes de génération associées

## Exemple 2 — Offre opérée standardisée

Décision :

- `solutionFamily = OPERATED_PRODUCT`
- `deliveryModel = MANAGED_STANDARDIZED`
- `mutualizationLevel = MUTUALIZED_SINGLE_TENANT`
- `implementationStrategy = OPERATED_TEMPLATE_PRODUCT`
- `technicalProfile = OPERATED_CONTENT_PRODUCT`

Le catalogue doit alors permettre de retrouver :

- le socle opéré compatible
- les limites de personnalisation
- les modules standards activables
- les patterns d’exploitation compatibles

## Exemple 3 — Outil métier spécifique

Décision :

- `solutionFamily = BUSINESS_APP`
- `deliveryModel = MANAGED_CUSTOM`
- `mutualizationLevel = DEDICATED`
- `implementationStrategy = CUSTOM_WEB_APP`
- `technicalProfile = CUSTOM_APP_MANAGED`

Le catalogue doit alors permettre de retrouver :

- les briques d’application adaptées
- les services infra requis
- les patterns de déploiement dédiés
- les contraintes d’exploitation propres à ce profil

---

# 16. Résultat attendu

Si le catalogue d’implémentation est bien conçu :

- le besoin reste séparé de la technique
- les stratégies restent explicites
- les profils techniques sont lisibles
- les générateurs deviennent plus fiables
- les compatibilités sont visibles
- les duplications de vérité diminuent
- les offres standardisées ou opérées deviennent plus simples à modéliser
- l’ajout d’une nouvelle stack ne casse pas le domaine

---

## Résumé opérationnel

Le catalogue d’implémentation de Site Factory doit être :

- une couche de réalisation
- structurée par catégories techniques
- pilotée par les stratégies décidées en amont
- fondée sur des profils techniques cohérents
- exploitable par les générateurs
- explicite sur les compatibilités et limites
- compatible avec le custom, le managé, le standardisé et l’opéré

Il ne doit jamais devenir :

- la source principale de vérité métier
- le point d’entrée du système
- un configurateur technique qui dicte le projet
