# DECISION_ENGINE.md

## Rôle du document

Ce document décrit le rôle, les responsabilités, les sorties et les règles structurantes du moteur de décision de Site Factory.

Le moteur de décision reçoit une **entrée canonique orientée besoin**.  
Il ne reçoit pas un projet déjà défini par sa stack.

Sa mission est de transformer un besoin qualifié en un ensemble de décisions explicites, cohérentes et traçables, qui pourront ensuite être mappées vers des implémentations techniques et des pipelines de génération.

Le moteur de décision est le cœur logique du système.  
Il ne doit pas être remplacé silencieusement par :

- l’UI
- le runtime legacy
- un ensemble de raccourcis techniques
- des choix implicites dans les générateurs

---

## Position dans la chaîne

La chaîne cible est :

**besoin**
→ **modèle canonique**
→ **moteur de décision**
→ **stratégie d’implémentation**
→ **profil technique**
→ **génération**
→ **exploitation**

Le moteur se situe entre :

- le modèle canonique d’entrée
- le catalogue d’implémentations
- la génération

Il ne doit pas être confondu avec :

- un formulaire
- un simulateur de stack
- un configurateur de CMS
- un moteur de templates
- un calculateur de pricing pur

---

## Mission du moteur

Le moteur doit répondre à la question :

**Quel type de solution faut-il produire, sous quel mode d’exploitation, avec quel niveau de mutualisation, et selon quelle stratégie d’implémentation ?**

Il ne doit pas répondre d’abord à :

- “WordPress ou Next ?”
- “Vercel ou autre ?”
- “Quel plugin ?”

Ces questions relèvent plus tard :

- du catalogue d’implémentations
- du mapping technique
- des adaptateurs de génération

---

## Entrée du moteur

L’entrée du moteur est un objet canonique du type :

`CanonicalProjectInput`

Cette entrée contient des informations structurées sur :

- l’identité du besoin
- la finalité métier
- le modèle de contenu
- le périmètre fonctionnel
- les acteurs
- les contraintes
- les intégrations
- le mode d’exploitation souhaité
- le contexte économique
- les signaux de standardisation et de mutualisation

Le moteur ne doit pas dépendre, comme pivots de décision, de champs tels que :

- `techStack`
- `wpHeadless`
- `deployTarget`
- `frontendFramework`
- `cmsChoice`
- `hostingVendor`

Si de tels champs existent, ils doivent être traités comme :

- préférences
- contraintes secondaires
- informations de compatibilité
- ou signaux contextuels limités

Ils ne doivent jamais servir d’identité première du projet.

---

## Sorties du moteur

Le moteur doit produire explicitement au minimum :

- `solutionFamily`
- `deliveryModel`
- `mutualizationLevel`
- `implementationStrategy`
- `technicalProfile`
- `commercialProfile`

Il peut également produire des sorties complémentaires comme :

- `editorialProfile`
- `hostingProfile`
- `operationsProfile`
- `riskFlags`
- `allowedVariants`
- `blockedVariants`
- `requiredCapabilities`
- `forbiddenCapabilities`
- `decisionNotes`
- `confidenceSignals`

L’objectif est que la décision soit :

- lisible
- composable
- testable
- explicable

---

# 1. Sortie `solutionFamily`

## Rôle

Exprimer la nature de la solution recommandée sur le plan métier et produit.

## Exemples possibles

- `SHOWCASE_SITE`
- `BUSINESS_SITE`
- `CONTENT_PLATFORM`
- `ECOMMERCE`
- `MEMBER_PORTAL`
- `BOOKING_PLATFORM`
- `BUSINESS_APP`
- `OPERATED_PRODUCT`

## Ce que `solutionFamily` doit exprimer

- le type dominant de besoin
- la finalité principale
- la logique globale de service rendu

## Ce que `solutionFamily` ne doit pas exprimer

- un framework
- un CMS
- un hébergeur
- un détail d’implémentation
- un niveau de pricing

Deux projets peuvent partager une même `solutionFamily` tout en ayant :

- des `deliveryModel` différents
- des `mutualizationLevel` différents
- des `implementationStrategy` différentes

---

# 2. Sortie `deliveryModel`

## Rôle

Exprimer comment la solution doit être livrée ou exploitée.

## Valeurs cibles

- `DELIVERED_CUSTOM`
- `MANAGED_CUSTOM`
- `MANAGED_STANDARDIZED`
- `OPERATED_PRODUCT`

## Sens des valeurs

### `DELIVERED_CUSTOM`

Projet spécifique, livré au client, avec forte individualisation.

### `MANAGED_CUSTOM`

Projet spécifique, mais exploité ou fortement pris en charge par le prestataire.

### `MANAGED_STANDARDIZED`

Offre encadrée, standardisée, opérée dans un cadre défini, avec variations limitées.

### `OPERATED_PRODUCT`

Produit opéré, logique d’abonnement ou de service, forte structuration, gouvernance produit commune.

## Important

`deliveryModel` est une sortie de premier rang.  
Il ne doit jamais être implicite ni reconstruit après coup par le commercial ou le runtime.

---

# 3. Sortie `mutualizationLevel`

## Rôle

Exprimer le niveau de mutualisation acceptable ou recommandé.

## Valeurs cibles

- `DEDICATED`
- `SHARED_SOCLE`
- `MUTUALIZED_SINGLE_TENANT`
- `MUTUALIZED_MULTI_TENANT`

## Sens des valeurs

### `DEDICATED`

Projet isolé, conçu pour un seul client, sans logique forte de mutualisation d’exploitation.

### `SHARED_SOCLE`

Projet dédié, mais construit sur un socle commun réutilisable.

### `MUTUALIZED_SINGLE_TENANT`

Offre fortement standardisée, déployée dans des environnements séparés mais reposant sur une base mutualisée.

### `MUTUALIZED_MULTI_TENANT`

Produit opéré avec mutualisation poussée au niveau plateforme et exploitation.

## Important

Le niveau de mutualisation doit dépendre du besoin, des contraintes et du modèle d’exploitation, pas seulement d’une stack.

---

# 4. Sortie `implementationStrategy`

## Rôle

Exprimer la stratégie générale de réalisation, avant les choix techniques fins.

## Exemples possibles

- `CMS_CONFIGURED`
- `CMS_EXTENDED`
- `HEADLESS_CONTENT_SITE`
- `CUSTOM_WEB_APP`
- `OPERATED_TEMPLATE_PRODUCT`
- `HYBRID_STACK`

## Ce que cette sortie doit permettre

- séparer stratégie et technologie
- mapper plusieurs implémentations possibles vers une même stratégie
- éviter qu’un CMS ou un framework devienne une identité métier

## Exemple

Un besoin peut conduire à :

- `solutionFamily = CONTENT_PLATFORM`
- `deliveryModel = MANAGED_CUSTOM`
- `mutualizationLevel = SHARED_SOCLE`
- `implementationStrategy = HEADLESS_CONTENT_SITE`

Le choix “Next.js + MDX” n’arrive qu’après.

---

# 5. Sortie `technicalProfile`

## Rôle

Exprimer un profil technique recommandé compatible avec la stratégie retenue.

## Exemples possibles

- `WP_EDITORIAL_STANDARD`
- `NEXT_MDX_EDITORIAL`
- `HEADLESS_CMS_FRONTEND`
- `CUSTOM_APP_MANAGED`
- `OPERATED_CONTENT_PRODUCT`

## Ce profil n’est pas encore la génération

Il sert à :

- cadrer les options techniques
- alimenter le mapping vers les implémentations
- sélectionner des générateurs adaptés
- contraindre les variantes autorisées

---

# 6. Sortie `commercialProfile`

## Rôle

Exprimer la structure commerciale cohérente avec la décision.

## Exemples possibles

- `ONE_SHOT_DELIVERY`
- `SETUP_PLUS_MANAGED_RETAINER`
- `STANDARDIZED_MONTHLY_PLAN`
- `OPERATED_SUBSCRIPTION`

## Important

Le moteur peut produire un profil commercial compatible avec la solution, mais ce profil ne doit pas devenir l’identité du projet.

---

# 7. Sorties complémentaires recommandées

## `editorialProfile`

Permet de qualifier le poids du contenu, de l’édition et des workflows éditoriaux.

Exemples :

- `STATIC_LIGHT`
- `EDITORIAL_SIMPLE`
- `EDITORIAL_STRUCTURED`
- `CONTENT_OPERATIONS_HEAVY`

## `hostingProfile`

Permet de qualifier les exigences d’hébergement, d’isolation et d’exploitation.

Exemples :

- `BASIC_MANAGED`
- `DEDICATED_MANAGED`
- `COMPLIANT_ISOLATED`
- `OPERATED_PLATFORM`

## `operationsProfile`

Permet de qualifier le niveau d’exploitation attendu.

Exemples :

- `CLIENT_OPERATED`
- `LIGHT_MANAGED`
- `FULLY_MANAGED`
- `PRODUCT_OPERATED`

## `riskFlags`

Liste de signaux d’attention.

Exemples :

- `HIGH_CUSTOMIZATION_PRESSURE`
- `DATA_SENSITIVITY_HIGH`
- `MUTUALIZATION_RISK`
- `UNCLEAR_SCOPE`
- `INTEGRATION_COMPLEXITY_HIGH`

## `allowedVariants`

Liste des variantes autorisées après décision.

## `blockedVariants`

Liste des variantes explicitement non compatibles.

## `decisionNotes`

Explications synthétiques utiles au runtime, au commercial ou à la génération.

---

# 8. Nature des règles du moteur

Le moteur manipule plusieurs catégories de règles.  
Elles doivent être distinguées explicitement.

## 8.1 Règles de qualification métier

Elles relient :

- objectifs
- contenu
- fonctionnalités
- acteurs
- contraintes
  à une famille de solution ou à un modèle d’exploitation.

Exemples :

- forte composante contenu + édition régulière → signal éditorial fort
- besoin de réservation structurante → signal booking
- forte spécificité métier + back-office important → signal business app

## 8.2 Règles de delivery

Elles déterminent :

- le degré de prise en charge
- le type de delivery model
- le niveau de service attendu
- le besoin d’opération continue

Exemples :

- client ne veut rien gérer → biais vers managed ou operated
- forte autonomie exigée → biais vers delivered ou managed dédié
- besoin d’un produit clé en main récurrent → signal operated

## 8.3 Règles de mutualisation

Elles déterminent :

- si le besoin est compatible avec un socle commun
- si l’isolation est nécessaire
- si la personnalisation est trop forte
- si une plateforme mutualisée est crédible

Exemples :

- faible variabilité métier + besoin récurrent → signal mutualisable
- exigences d’isolation fortes + règles métier spécifiques → signal dédié
- besoin stable + faible besoin d’exceptions → signal standardisable

## 8.4 Règles de stratégie d’implémentation

Elles déterminent la stratégie générale la plus adaptée.

Exemples :

- contenu éditorial central + édition simple → stratégie CMS ou headless content
- logique métier forte + workflows complexes → stratégie custom app
- offre opérée cadrée → stratégie operated template product

## 8.5 Règles commerciales

Elles déterminent la forme économique cohérente avec la décision.

Exemples :

- projet dédié ponctuel → one-shot delivery
- projet managé → setup + récurrent
- produit opéré → abonnement

---

# 9. Ce qui doit sortir du runtime legacy

Le moteur doit absorber progressivement toute règle structurante encore dispersée dans le runtime legacy.

## À extraire en priorité

- catégorisations implicites
- requalifications automatiques
- règles de floors structurels
- arbitrages cachés entre types de projets
- compatibilités majeures
- exclusions majeures
- règles de passage vers managed ou operated
- règles de mutualisation
- règles de standardisation
- signaux de complexité structurante

## À garder hors du moteur

Certaines logiques peuvent rester ailleurs si elles ne relèvent pas de la décision de domaine.

Exemples :

- validation UI locale
- formatage d’affichage
- détails de génération de fichiers
- choix fin de template de composant
- configuration d’API non structurante

---

# 10. Ce que le moteur ne doit pas faire

Le moteur ne doit pas :

- choisir directement des plugins
- générer des fichiers
- porter la logique de rendu UI
- dépendre d’un composant de formulaire
- dépendre d’un framework front
- reconstruire l’état de génération
- confondre stratégie et implémentation fine
- prendre une préférence technique comme vérité métier

Il doit produire des décisions, pas des artefacts.

---

# 11. Types de signaux utilisés par le moteur

Le moteur peut s’appuyer sur différents types de signaux.

## Signaux de besoin

- visibilité
- leads
- contenu
- vente
- réservation
- administration métier
- portail
- automatisation

## Signaux d’exploitation

- autonomie client forte
- absence de volonté de gestion
- besoin de support structuré
- besoin de prise en charge complète

## Signaux de standardisation

- périmètre stable
- faible variabilité
- faible besoin d’exception
- forte récurrence observée
- personnalisation encadrable

## Signaux de mutualisation

- besoin récurrent
- logique proche entre plusieurs dossiers
- structure de données comparable
- workflows comparables
- faible exigence d’isolation spécifique

## Signaux de complexité

- intégrations nombreuses
- workflow complexe
- données sensibles
- règles métier atypiques
- fortes exigences de performance ou conformité

---

# 12. Principes de décision

Le moteur doit respecter les principes suivants.

## 12.1 Primauté du besoin

La décision part du besoin, pas de la technologie.

## 12.2 Explicabilité

Une décision doit pouvoir être justifiée.

## 12.3 Composabilité

Les sorties doivent pouvoir être combinées sans ambiguïté.

## 12.4 Neutralité technique initiale

La stratégie précède la stack.

## 12.5 Traçabilité

On doit pouvoir comprendre pourquoi une sortie a été produite.

## 12.6 Tolérance au custom

Le moteur ne doit pas forcer artificiellement la standardisation.

## 12.7 Détection du standardisable

Le moteur doit repérer quand un besoin peut entrer dans un cadre plus mutualisé.

---

# 13. Exemples de lecture de décision

## Cas 1 — Site business éditorial managé

Entrée :

- contenu régulier
- besoin de visibilité et leads
- peu de complexité métier
- client ne veut rien gérer
- standardisation acceptable moyenne

Sortie possible :

- `solutionFamily = BUSINESS_SITE`
- `deliveryModel = MANAGED_CUSTOM`
- `mutualizationLevel = SHARED_SOCLE`
- `implementationStrategy = HEADLESS_CONTENT_SITE`
- `technicalProfile = NEXT_MDX_EDITORIAL`
- `commercialProfile = SETUP_PLUS_MANAGED_RETAINER`

## Cas 2 — Offre récurrente standardisable

Entrée :

- besoin récurrent observé
- périmètre stable
- faible besoin d’exception
- client veut une solution clé en main
- forte compatibilité de mutualisation

Sortie possible :

- `solutionFamily = OPERATED_PRODUCT`
- `deliveryModel = MANAGED_STANDARDIZED`
- `mutualizationLevel = MUTUALIZED_SINGLE_TENANT`
- `implementationStrategy = OPERATED_TEMPLATE_PRODUCT`
- `technicalProfile = OPERATED_CONTENT_PRODUCT`
- `commercialProfile = STANDARDIZED_MONTHLY_PLAN`

## Cas 3 — Outil métier très spécifique

Entrée :

- workflow métier spécifique
- nombreuses règles internes
- intégrations critiques
- forte personnalisation
- faible mutualisation possible

Sortie possible :

- `solutionFamily = BUSINESS_APP`
- `deliveryModel = MANAGED_CUSTOM`
- `mutualizationLevel = DEDICATED`
- `implementationStrategy = CUSTOM_WEB_APP`
- `technicalProfile = CUSTOM_APP_MANAGED`
- `commercialProfile = SETUP_PLUS_MANAGED_RETAINER`

---

# 14. Invariants du moteur

Les invariants suivants doivent être respectés :

1. le moteur doit produire un `deliveryModel` explicite
2. le moteur doit produire un `mutualizationLevel` explicite
3. `solutionFamily` ne doit pas être une techno
4. `implementationStrategy` doit précéder la stack détaillée
5. une préférence technique ne doit pas renverser seule une décision métier
6. une sortie doit pouvoir être expliquée à partir de l’entrée canonique
7. le moteur doit pouvoir traiter correctement du custom non mutualisable
8. le moteur doit pouvoir repérer des cas standardisables ou opérables
9. le moteur ne doit pas dépendre de l’UI
10. le moteur ne doit pas dépendre d’un générateur de projet

---

# 15. Tests à prévoir en priorité

Le moteur doit être testé en priorité sur :

- dérivation de `solutionFamily`
- dérivation de `deliveryModel`
- dérivation de `mutualizationLevel`
- arbitrage entre custom, standardisé et opéré
- compatibilités de stratégies
- exclusions structurantes
- signaux de mutualisation
- signaux de standardisation
- stabilité des décisions face à l’évolution du catalogue technique

Des tests de scénarios complets doivent couvrir :

- projet livré dédié
- projet managé dédié
- projet à socle partagé
- offre standardisée managée
- produit opéré
- cas très atypique non mutualisable

---

# 16. Résultat attendu

Le moteur de décision de Site Factory doit devenir :

- la source explicite des arbitrages structurants
- le lieu où le besoin devient décision
- un composant indépendant de l’UI
- un composant indépendant de la génération
- un composant capable de traiter à la fois :
  - le custom
  - le managé
  - le standardisé
  - l’opéré

Le moteur ne doit pas choisir d’abord une stack.  
Il doit d’abord qualifier la bonne forme de solution.

---

## Résumé opérationnel

Le moteur de décision reçoit un besoin canonique et doit produire, de manière explicite :

- une famille de solution
- un mode de delivery
- un niveau de mutualisation
- une stratégie d’implémentation
- un profil technique
- un profil commercial

Il doit sortir la logique structurante du runtime legacy, éviter toute dépendance au wizard, et préserver le principe central de Site Factory :

**le besoin précède la stack**
