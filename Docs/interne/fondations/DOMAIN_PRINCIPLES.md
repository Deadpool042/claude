# DOMAIN_PRINCIPLES.md

## Rôle du document

Ce document fixe les principes de domaine non négociables de Site Factory.

Il sert à éviter les dérives suivantes :

- transformer Site Factory en simple configurateur technique
- mélanger besoin, décision, implémentation et runtime
- laisser l’UI devenir la vraie source de logique métier
- faire dépendre l’identité d’un projet d’une stack
- empêcher l’évolution du custom vers des offres plus standardisées ou opérées

Ce document a priorité sur les choix d’implémentation locaux, les raccourcis UI et les héritages legacy.

---

## 1. Site Factory est un moteur interne, pas un produit client

Site Factory est un outil interne privé de :

- qualification
- décision
- génération
- industrialisation

Il n’est pas destiné à être exposé tel quel comme produit client.

Il peut produire ou alimenter :

- des projets custom livrés
- des projets custom managés
- des offres managées standardisées
- des produits opérés de type mini-SaaS / SaaS vertical

Conséquence :
la qualité première attendue de Site Factory n’est pas le polish produit public, mais la solidité de son domaine, de ses décisions et de sa génération.

---

## 2. Le besoin précède la stack

Principe fondamental :
**le besoin précède la stack**.

La stack ne doit jamais être l’entrée principale du système.  
Elle est une conséquence de l’analyse du besoin, des contraintes, du mode d’exploitation et du niveau de standardisation acceptable.

Conséquences :

- un projet ne doit pas être défini d’abord comme “WordPress”, “Next.js” ou “headless”
- le questionnaire ne doit pas être un configurateur technique déguisé
- les choix techniques précoces doivent être évités dans le cœur canonique
- la même famille de besoin peut conduire à plusieurs implémentations différentes

---

## 3. L’identité d’un projet ne doit jamais dépendre d’une techno

Un projet doit être identifiable par :

- son besoin
- sa finalité
- ses capacités attendues
- ses contraintes
- son mode d’exploitation
- son niveau de mutualisation
- son niveau de standardisation

Il ne doit pas être identifié d’abord par :

- un CMS
- un framework
- un hébergeur
- un mode de rendu
- une préférence technique

Conséquence :
la technique est une couche de réalisation, pas une ontologie métier.

---

## 4. Séparation stricte des couches

Site Factory doit toujours respecter les quatre couches suivantes.

### 4.1 Questionnaire canonique

Décrit le besoin, le contexte, les contraintes et le mode d’exploitation attendu.

### 4.2 Moteur de décision

Transforme l’entrée canonique en décisions structurées.

### 4.3 Catalogue d’implémentations

Expose les options techniques disponibles, leurs compatibilités et leurs limites.

### 4.4 Runtime / UI / génération

Consomme le domaine, applique les décisions, génère les projets et les artefacts.

Conséquence :
aucune de ces couches ne doit absorber silencieusement le rôle d’une autre.

---

## 5. Le runtime ne doit pas porter seul la logique métier

Le runtime peut :

- orchestrer
- afficher
- guider
- générer
- valider des contraintes locales

Le runtime ne doit pas être la seule source de vérité pour :

- les arbitrages de qualification
- les choix de famille de solution
- les règles de mutualisation
- les règles de passage entre custom, standardisé et opéré
- les compatibilités structurantes
- les exclusions majeures

Conséquence :
les règles structurantes doivent vivre dans le domaine, dans le moteur, ou dans des référentiels explicites.

---

## 6. Le questionnaire canonique doit rester orienté besoin

Le questionnaire canonique doit d’abord décrire :

- le problème à résoudre
- les objectifs
- les utilisateurs
- les flux métier
- les contenus
- les contraintes
- les intégrations
- le niveau d’autonomie
- le mode d’exploitation
- le niveau de standardisation acceptable

Il ne doit pas être structuré autour de :

- `techStack`
- `wpHeadless`
- `deployTarget`
- `backendFamily`
- un choix de CMS imposé trop tôt

Conséquence :
les champs techniques ne peuvent exister qu’en tant que préférences, contraintes secondaires ou sorties proposées.

---

## 7. Le moteur doit produire des sorties explicites

Le moteur de décision doit dériver explicitement au minimum :

- `solutionFamily`
- `deliveryModel`
- `mutualizationLevel`
- `implementationStrategy`
- `technicalProfile`
- `commercialProfile`

Ces sorties ne doivent pas être implicites, dispersées ou reconstruites par l’UI.

Conséquence :
chaque projet doit pouvoir être compris à partir des décisions du moteur, sans lecture du code de génération.

---

## 8. Le mode d’exploitation est de premier rang

Site Factory ne décide pas seulement ce qu’il faut construire.  
Il doit aussi décider comment la solution doit être exploitée.

Les modèles de delivery cibles sont :

- `DELIVERED_CUSTOM`
- `MANAGED_CUSTOM`
- `MANAGED_STANDARDIZED`
- `OPERATED_PRODUCT`

Conséquence :
un même besoin fonctionnel peut déboucher sur plusieurs modes d’exploitation différents selon :

- le niveau d’autonomie client
- le niveau de standardisation acceptable
- le besoin de prise en charge
- le potentiel de mutualisation

Le mode d’exploitation n’est pas un détail commercial ajouté après coup.  
C’est une dimension de domaine.

---

## 9. La mutualisation est de premier rang

Le moteur doit pouvoir distinguer explicitement le niveau de mutualisation de la solution.

Les niveaux cibles sont :

- `DEDICATED`
- `SHARED_SOCLE`
- `MUTUALIZED_SINGLE_TENANT`
- `MUTUALIZED_MULTI_TENANT`

Conséquence :
la mutualisation ne doit pas être implicite, ni déduite uniquement à partir de la stack.

Elle doit dépendre de critères comme :

- récurrence du besoin
- stabilité du périmètre
- variabilité métier
- contraintes d’isolation
- personnalisation nécessaire
- exigences d’exploitation

---

## 10. Le custom n’est pas un échec

Le custom n’est pas l’opposé du produit.  
Le custom remplit plusieurs fonctions stratégiques :

- répondre à des besoins spécifiques
- apprendre des cas réels
- identifier les motifs récurrents
- détecter les zones standardisables
- préparer d’éventuelles offres opérées futures

Conséquence :
Site Factory doit à la fois :

- traiter correctement le custom
- industrialiser le custom
- détecter ce qui peut sortir du custom

---

## 11. Le standardisé ne doit pas être confondu avec le figé

Une offre standardisée peut rester :

- configurable
- habillable
- extensible dans des limites connues
- exploitable dans plusieurs contextes proches

Conséquence :
le standardisé n’est pas l’absence de souplesse.  
C’est un cadre maîtrisé.

Site Factory doit pouvoir reconnaître :

- ce qui est encore du custom nécessaire
- ce qui est du standard configurable
- ce qui relève d’un produit opéré

---

## 12. La technique doit être une sortie mappée depuis une stratégie

La couche technique doit répondre à une stratégie décidée par le domaine.

Exemples de stratégies possibles :

- `CMS_CONFIGURED`
- `CMS_EXTENDED`
- `HEADLESS_CONTENT_SITE`
- `CUSTOM_WEB_APP`
- `OPERATED_TEMPLATE_PRODUCT`
- `HYBRID_STACK`

Conséquence :
les CMS, frameworks, plugins, services infra et patterns d’édition doivent être sélectionnés à partir d’une stratégie, et non servir de source de vérité métier.

---

## 13. Le wizard doit être un consommateur du domaine

Le wizard n’est pas le moteur.  
Le wizard est une interface de :

- collecte
- reformulation
- aide à la décision
- restitution
- visualisation des choix
- déclenchement de génération

Conséquence :
il doit consommer :

- le modèle canonique
- le moteur de décision
- le catalogue d’implémentations
- les règles explicites

Il ne doit pas redéfinir silencieusement :

- la taxonomie du projet
- les compatibilités majeures
- les règles de passage d’un modèle d’offre à un autre

---

## 14. La génération doit être déterministe et lisible

La génération de projet doit être une conséquence claire de la décision.

Chaque projet généré doit pouvoir être rattaché à :

- une entrée canonique
- une sortie de moteur
- une stratégie d’implémentation
- un profil technique
- un mode d’exploitation

Conséquence :
la génération ne doit pas compenser des ambiguïtés du domaine.

Elle doit produire des artefacts cohérents, compréhensibles et traçables.

---

## 15. Les projets exportés doivent être autonomes dans leur exploitation courante

Même si Site Factory reste privé, les projets générés doivent pouvoir être exploités proprement dans leur propre cycle de vie.

Conséquence :
un projet exporté ne doit pas dépendre en permanence du repo privé Site Factory pour fonctionner au quotidien.

Site Factory peut rester :

- le moteur de fabrication
- le socle d’industrialisation
- la source de templates et règles

Mais le projet généré doit rester :

- lisible
- exploitable
- maintenable dans son périmètre

---

## 16. Les exceptions doivent être visibles

Toute exception majeure doit être :

- nommée
- justifiée
- localisée
- testable si possible

Conséquence :
les cas particuliers ne doivent pas être injectés silencieusement dans le domaine général.

Si une exception se répète, elle doit être évaluée comme motif potentiel de standardisation ou de nouvelle stratégie.

---

## 17. Le legacy ne doit pas définir la cible

L’existant peut imposer des transitions, mais ne doit pas dicter le modèle final.

Conséquence :

- les enums historiques peuvent être tolérés comme couche de compatibilité
- les mappings legacy peuvent exister temporairement
- mais la cible doit rester pilotée par le modèle canonique et les sorties du moteur

Le legacy est une contrainte de migration, pas une vérité de domaine.

---

## 18. Toute évolution doit préserver la chaîne de causalité

La chaîne cible est :

**besoin**
→ **qualification canonique**
→ **décision**
→ **stratégie**
→ **implémentation**
→ **génération**
→ **exploitation**

Conséquence :
aucune évolution ne doit court-circuiter cette chaîne en faisant remonter la technique au niveau du besoin.

---

## 19. Priorités absolues

Les priorités structurantes de Site Factory sont :

1. verrouiller le modèle canonique d’entrée
2. rendre explicites `deliveryModel` et `mutualizationLevel`
3. sortir les règles structurantes du runtime legacy
4. clarifier les sorties du moteur
5. faire du wizard un consommateur du domaine
6. fiabiliser la génération de projet

Tout travail futur doit être évalué à l’aune de ces priorités.

---

## 20. Critère de cohérence global

Une évolution est cohérente avec Site Factory si :

- elle renforce la séparation des couches
- elle réduit la dépendance du domaine à une techno
- elle clarifie la décision
- elle rend explicite le mode d’exploitation
- elle rend explicite la mutualisation
- elle améliore la robustesse de la génération
- elle prépare la standardisation sans casser la capacité à traiter du custom

Une évolution est suspecte si :

- elle introduit une techno comme identité du projet
- elle ajoute de la logique métier dans l’UI
- elle contourne le moteur
- elle mélange décision métier et préférence technique
- elle rend la génération plus magique que traçable

---

## Résumé opérationnel

Site Factory doit rester :

- un moteur privé
- orienté besoin
- structuré par un modèle canonique
- piloté par un moteur de décision explicite
- capable de traiter le custom
- capable d’industrialiser le custom
- capable de recommander le bon niveau de standardisation
- capable de soutenir des offres managées et opérées quand pertinent

La stack n’est jamais l’entrée principale.  
Elle est une sortie du système.
