# ROADMAP_SITE_FACTORY.md

## Vision

Site Factory est un outil interne privé de qualification, décision, génération et industrialisation.

Il n’a pas vocation à être exposé en ligne comme produit client.  
Il sert à produire, selon le contexte :

- des projets custom livrés,
- des projets custom managés,
- des offres managées standardisées,
- et, à terme, des produits opérés de type mini-SaaS / SaaS vertical.

Le principe fondamental est simple :

**le besoin précède la stack**  
et  
**la stack est une sortie du moteur, pas l’entrée principale**.

---

## Objectif global

Faire de Site Factory un moteur privé capable de :

- traiter des projets uniques,
- industrialiser le custom,
- recommander le bon niveau de standardisation,
- choisir un mode d’exploitation cohérent,
- générer des projets fiables,
- et préparer, quand pertinent, des offres opérées.

---

## Ordre de priorité absolu

1. verrouiller le modèle canonique d’entrée
2. rendre explicites `deliveryModel` et `mutualizationLevel`
3. sortir les règles structurantes du runtime legacy
4. clarifier les sorties du moteur
5. faire du wizard un consommateur du domaine
6. fiabiliser la génération de projet
7. préparer le support des offres standardisées et opérées
8. renforcer les tests et garde-fous

---

## PHASE 1 — Verrouiller le modèle canonique d’entrée

### Objectif

Construire un vrai objet d’entrée métier, centré sur le besoin, indépendant des choix techniques précoces.

### Pourquoi

Tant que l’entrée dépend de la stack ou du legacy runtime, tout le système reste fragile et difficile à faire évoluer vers des modèles plus standardisés ou opérés.

### Livrables

- schéma canonique d’entrée
- dictionnaire des concepts métier
- invariants du modèle d’entrée
- clarification de ce qui relève du besoin, de la contrainte, de la préférence et de la techno

### Travail attendu

- définir les dimensions métier de l’entrée
- retirer du cœur les champs techniques hérités
- distinguer besoins, contraintes, préférences, contexte et exploitation
- poser des enums et types stables

### Le modèle doit pouvoir décrire au minimum

- nature du besoin
- objectifs du projet
- contenu et édition
- fonctionnalités attendues
- rôles et utilisateurs
- contraintes métier
- contraintes réglementaires
- intégrations
- volumétrie
- sensibilité des données
- niveau d’autonomie
- niveau de standardisation acceptable
- mode d’exploitation souhaité

### À retirer du cœur canonique

Ces éléments ne doivent pas être structurants dans l’entrée principale :

- `techStack`
- `wpHeadless`
- `deployTarget`
- `backendFamily`
- choix CMS trop précoces
- toute option technique qui biaise déjà la décision métier

### Critères de fin

- un projet peut être décrit sans parler de WordPress, Next.js, headless, Vercel ou Docker
- les concepts métier sont stables et compréhensibles
- l’entrée canonique ne dépend plus d’une implémentation spécifique

---

## PHASE 2 — Clarifier les sorties du moteur

### Objectif

Définir explicitement ce que le moteur doit produire comme décisions.

### Pourquoi

Si les sorties restent floues, le runtime compense avec des règles implicites, ce qui entretient la dette legacy.

### Livrables

- schéma de sortie du moteur
- liste des décisions structurantes
- vocabulaire cible des outputs

### Sorties attendues

Le moteur doit pouvoir dériver explicitement :

- `solutionFamily`
- `deliveryModel`
- `mutualizationLevel`
- `implementationStrategy`
- `technicalProfile`
- `commercialProfile`

### Delivery models cibles

- `DELIVERED_CUSTOM`
- `MANAGED_CUSTOM`
- `MANAGED_STANDARDIZED`
- `OPERATED_PRODUCT`

### Mutualization levels cibles

- `DEDICATED`
- `SHARED_SOCLE`
- `MUTUALIZED_SINGLE_TENANT`
- `MUTUALIZED_MULTI_TENANT`

### Travail attendu

- formaliser les outputs du moteur
- séparer famille de solution, mode d’exploitation, mutualisation et stratégie technique
- rendre les décisions composables
- éviter les sorties ambiguës ou surchargées

### Critères de fin

- deux projets peuvent partager une famille sans partager la même implémentation
- le mode d’exploitation est toujours explicite
- la mutualisation est toujours explicite

---

## PHASE 3 — Extraire et purifier le moteur de décision

### Objectif

Déplacer la logique structurante hors du runtime legacy et de l’UI.

### Pourquoi

Le système doit décider depuis le domaine, pas depuis les composants ou un runtime historique trop technique.

### Livrables

- moteur de décision lisible
- règles auditables
- séparation claire entre logique métier, logique d’implémentation et logique commerciale

### Travail attendu

- identifier les règles actuellement codées en dur
- recenser les arbitrages legacy
- distinguer :
  - règles métier
  - règles techniques
  - règles commerciales
- externaliser ce qui doit l’être
- garder des fonctions de domaine pures, testables et documentées

### Exemples de règles à sortir du runtime

- catégorisation implicite
- requalification
- compatibilités
- exclusions
- floors
- arbitrages de stratégie
- signaux de mutualisation
- règles de passage vers offre standardisée ou opérée

### Critères de fin

- le wizard n’est plus le lieu réel de la décision
- le runtime consomme le moteur au lieu de compenser ses faiblesses
- les règles structurantes sont visibles et testables

---

## PHASE 4 — Assainir le catalogue d’implémentations

### Objectif

Faire de la couche technique une sortie mappée depuis les stratégies, pas la source de vérité métier.

### Pourquoi

Le système doit rester piloté par le besoin, même si plusieurs implémentations techniques sont possibles.

### Livrables

- catalogue technique propre
- taxonomie des briques techniques
- mappings explicites stratégie → implémentation

### Travail attendu

- séparer clairement :
  - CMS
  - frameworks
  - plugins
  - modules
  - services infra
  - profils d’hébergement
  - patterns d’édition
  - patterns de déploiement
- documenter les compatibilités
- documenter les restrictions
- éviter les duplications entre référentiel, runtime et UI

### Critères de fin

- toute décision technique importante peut être rattachée à une stratégie ou une règle explicite
- la technique n’est plus l’identité du projet
- l’UI ne redéfinit pas les vérités du catalogue

---

## PHASE 5 — Refaire du wizard un consommateur du domaine

### Objectif

Transformer le wizard en interface de saisie, d’explication et de lecture des décisions.

### Pourquoi

L’UI ne doit pas porter seule la logique métier.

### Livrables

- wizard simplifié
- étapes réorganisées selon le raisonnement métier
- séparation nette UI / logique

### Travail attendu

- structurer les étapes du wizard autour de :
  - besoin
  - contenu
  - fonctionnalités
  - contraintes
  - exploitation
  - décision
  - implémentation proposée
- faire apparaître explicitement le mode d’exploitation
- repousser les choix techniques vers la fin
- rendre les composants UI plus génériques et réutilisables

### Critères de fin

- une refonte UI n’oblige pas à réécrire la logique métier
- le wizard peut être remplacé sans casser le domaine
- l’interface expose les décisions plutôt qu’elle ne les fabrique

---

## PHASE 6 — Fiabiliser la génération de projet

### Objectif

Faire de la génération un pipeline robuste et cohérent avec la décision amont.

### Pourquoi

La génération est la concrétisation du moteur. Si elle est instable, l’industrialisation échoue.

### Livrables

- pipeline de génération clair
- manifests de projet
- adaptateurs de génération par profil technique
- structure projet standardisée

### Travail attendu

- définir les types de sorties possibles
- standardiser les manifests
- créer des générateurs spécialisés par profil
- éviter le générateur monolithique
- garantir l’autonomie des projets exportés

### Chaque projet généré doit contenir au minimum

- identité projet
- famille de solution
- delivery model
- mutualization level
- stratégie d’implémentation
- profil technique retenu
- options et modules activés
- contraintes d’exploitation

### Critères de fin

- la génération est déterministe
- le résultat est cohérent avec la décision
- un projet exporté est compréhensible sans dépendre en permanence du repo privé Site Factory

---

## PHASE 7 — Industrialiser les offres standardisées

### Objectif

Permettre au système de repérer les motifs standardisables et de supporter les offres opérées.

### Pourquoi

Le custom doit pouvoir alimenter une trajectoire vers des offres plus mutualisées quand c’est pertinent.

### Livrables

- mécanisme de qualification du niveau de standardisation
- critères de mutualisation
- règles de passage vers offre managée standardisée ou produit opéré

### Travail attendu

- ajouter des signaux de standardisation
- ajouter des signaux de mutualisation
- différencier clairement :
  - custom dédié
  - custom managé
  - standardisé managé
  - produit opéré
- préparer la qualification de motifs de mini-SaaS / SaaS vertical

### Critères de fin

- le système peut dire explicitement si un besoin doit rester custom ou peut entrer dans une logique plus produit
- les cas opérables sont détectables
- le standardisé ne dépend plus uniquement d’une intuition manuelle

---

## PHASE 8 — Tests et garde-fous

### Objectif

Verrouiller le domaine avant d’élargir le périmètre fonctionnel.

### Pourquoi

Sans garde-fous, toute évolution risque de réintroduire du legacy implicite.

### Livrables

- tests métier
- tests de règles
- tests de mappings
- tests de génération
- contrôle de dérive entre référentiel, moteur et runtime

### Travail attendu

Priorité de test sur :

- modèle canonique
- moteur de décision
- règles de compatibilité
- exclusions
- delivery model
- mutualization level
- stratégies d’implémentation
- génération de projet

Créer des scénarios complets :

- projet custom livré
- projet custom managé
- offre standardisée managée
- projet éditorial Next.js + MDX
- projet non mutualisable
- cas compatible produit opéré

### Critères de fin

- les invariants majeurs sont couverts
- les régressions métier importantes ne passent plus silencieusement
- les évolutions du domaine sont plus sûres

---

## Définition de réussite

Site Factory sera considéré comme bien cadré lorsque :

- le besoin précède réellement la stack
- la décision est portée par le domaine, pas par l’UI
- `deliveryModel` et `mutualizationLevel` sont de premier rang
- la technique est un mapping, pas l’identité du projet
- le wizard consomme le domaine
- la génération est robuste
- le système peut traiter à la fois :
  - des projets uniques,
  - du custom managé,
  - des offres standardisées,
  - et des produits opérés

---

## Résultat cible

À terme, Site Factory doit être un moteur privé capable de :

- qualifier proprement des besoins hétérogènes,
- décider du bon niveau d’industrialisation,
- choisir une stratégie d’implémentation cohérente,
- générer des projets fiables,
- et soutenir l’émergence d’offres opérées quand les motifs deviennent suffisamment récurrents.
