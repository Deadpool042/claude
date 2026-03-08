# CANONICAL_MODEL.md

## Rôle du document

Ce document décrit le modèle canonique d’entrée de Site Factory.

Son rôle est de fournir une représentation stable, orientée besoin, indépendante des choix techniques précoces.

Le modèle canonique sert à :

- qualifier le besoin réel
- structurer les informations utiles à la décision
- alimenter le moteur de décision
- éviter les dérives où la stack devient l’identité du projet
- préparer des sorties cohérentes vers des implémentations variées

Le modèle canonique n’est pas un modèle de génération technique.  
Le modèle canonique n’est pas non plus un simple état de formulaire UI.

---

## Principe fondamental

Le modèle canonique décrit d’abord :

- le besoin
- les objectifs
- les contraintes
- les capacités attendues
- les acteurs
- le mode d’exploitation
- le niveau de standardisation acceptable

Il ne doit pas être structuré d’abord autour de :

- WordPress
- Next.js
- headless
- Vercel
- Docker
- un CMS
- un hébergeur
- une préférence de framework

La stack est une sortie dérivée.  
Elle n’est pas l’identité du projet.

---

## Place du modèle canonique dans la chaîne

La chaîne cible est :

**besoin**
→ **modèle canonique**
→ **moteur de décision**
→ **stratégie d’implémentation**
→ **profil technique**
→ **génération**
→ **exploitation**

Le modèle canonique doit donc être :

- suffisamment riche pour permettre une vraie décision
- suffisamment neutre pour ne pas imposer trop tôt une solution technique
- suffisamment stable pour survivre à plusieurs évolutions du catalogue technique

---

## Nature du modèle

Le modèle canonique doit représenter un projet selon quatre grands blocs :

1. identité et finalité du besoin
2. capacités fonctionnelles attendues
3. contraintes et contexte
4. modèle d’exploitation et degré de standardisation

---

# 1. Structure de haut niveau

Le modèle canonique peut être pensé comme un objet principal de type :

`CanonicalProjectInput`

Il devrait être structuré autour de blocs comme :

- `projectIdentity`
- `businessIntent`
- `contentModel`
- `functionalScope`
- `actorsAndOperations`
- `constraints`
- `integrations`
- `operatingModel`
- `economicContext`
- `signals`

L’objectif est de séparer les natures d’information, plutôt que de mélanger besoin, technique et commerce dans un seul niveau plat.

---

# 2. Bloc `projectIdentity`

## Rôle

Décrire l’identité générale du projet, sans figer sa réalisation technique.

## Contenu attendu

- identifiant interne
- nom de travail
- client ou entité concernée
- statut de qualification
- contexte de création
- source de la demande
- niveau de maturité du besoin

## Ce bloc ne doit pas contenir

- choix de stack
- choix de CMS
- détails d’hébergement
- préférences d’implémentation déjà figées

---

# 3. Bloc `businessIntent`

## Rôle

Décrire pourquoi le projet existe.

## Questions que ce bloc doit couvrir

- quel problème cherche-t-on à résoudre
- quel résultat le client attend
- quel type de présence ou service est recherché
- quelle est la finalité dominante
- quel est le niveau de spécificité métier

## Dimensions à décrire

- objectifs principaux
- objectifs secondaires
- proposition de valeur attendue
- type de présence attendue
- criticité du besoin
- stabilité ou volatilité du besoin
- caractère récurrent ou très spécifique

## Exemples de notions métier possibles

- visibilité / présence
- génération de leads
- contenu éditorial
- vente
- réservation
- espace membre
- portail client
- outil métier
- automatisation de processus
- offre opérée

Ce bloc sert à nourrir plus tard `solutionFamily`, mais ne doit pas contenir directement cette sortie.

---

# 4. Bloc `contentModel`

## Rôle

Décrire la place du contenu dans le projet.

## Questions que ce bloc doit couvrir

- le projet repose-t-il fortement sur du contenu
- quel type de contenu est central
- qui produit ce contenu
- à quel rythme
- avec quel niveau d’autonomie
- existe-t-il plusieurs types éditoriaux distincts

## Dimensions à décrire

- présence ou non d’un besoin éditorial
- intensité du besoin éditorial
- types de contenus principaux
- fréquence d’édition
- nombre d’éditeurs
- autonomie attendue des éditeurs
- besoin de workflow éditorial
- besoin de structuration de contenu
- besoin multilingue
- besoin de SEO éditorial
- besoin de publication programmée

## Ce bloc doit permettre de distinguer par exemple

- site quasi statique
- site éditorial simple
- plateforme de contenu
- solution mixte contenu + fonctionnalités métier

---

# 5. Bloc `functionalScope`

## Rôle

Décrire les capacités fonctionnelles attendues, sans encore choisir leur implémentation.

## Questions à couvrir

- que doit savoir faire la solution
- quelles fonctionnalités sont indispensables
- quelles fonctionnalités sont optionnelles
- quels modules sont structurants
- y a-t-il des zones de complexité spécifiques

## Dimensions à décrire

- fonctionnalités cœur
- fonctionnalités complémentaires
- présence de workflows
- besoin d’espace authentifié
- besoin de paiement
- besoin de réservation
- besoin de catalogue
- besoin de recherche avancée
- besoin de formulaires complexes
- besoin de tableaux de bord
- besoin d’administration métier
- besoin de notifications
- besoin de documents générés
- besoin d’automatisations

## Important

Ce bloc doit parler en capacités, pas en plugins ou frameworks.

Exemple correct :

- “prise de rendez-vous”
- “gestion de catalogue”
- “édition de contenus structurés”

Exemple incorrect :

- “WooCommerce”
- “Sanity”
- “plugin X”
- “Supabase”

---

# 6. Bloc `actorsAndOperations`

## Rôle

Décrire qui utilise le système et comment il est opéré au quotidien.

## Questions à couvrir

- qui utilise la solution
- quels rôles existent
- qui administre
- qui édite
- qui consulte
- quelles opérations sont réalisées régulièrement
- quelles zones exigent une administration simple ou experte

## Dimensions à décrire

- types d’acteurs
- rôles et permissions
- nombre d’utilisateurs internes
- nombre d’utilisateurs externes
- niveau de compétence attendu
- besoin d’administration déléguée
- opérations métier fréquentes
- complexité opérationnelle
- besoin de traçabilité
- besoin de validation ou de contrôle

Ce bloc est central pour évaluer :

- la simplicité attendue de l’outil
- le besoin de back-office
- le mode d’exploitation pertinent
- le potentiel de standardisation

---

# 7. Bloc `constraints`

## Rôle

Décrire toutes les contraintes qui limitent ou orientent la solution.

## Sous-familles de contraintes

- contraintes métier
- contraintes réglementaires
- contraintes organisationnelles
- contraintes de sécurité
- contraintes de performance
- contraintes de calendrier
- contraintes de réversibilité
- contraintes d’hébergement
- contraintes de gouvernance

## Dimensions possibles

- données sensibles ou non
- obligations légales ou sectorielles
- exigences de confidentialité
- exigences d’isolation
- besoin d’auditabilité
- contrainte de budget
- contrainte de délai
- contrainte de souveraineté
- contrainte de localisation
- contrainte d’accessibilité
- contrainte de disponibilité
- contrainte de charge
- contrainte de maintenance

## Important

Une contrainte technique imposée par le contexte peut exister, mais elle doit être modélisée comme contrainte, pas comme identité du projet.

Exemple :

- acceptable : “hébergement imposé chez un fournisseur donné”
- non acceptable comme identité : “ce projet est un projet Vercel”

---

# 8. Bloc `integrations`

## Rôle

Décrire les relations du projet avec des systèmes tiers.

## Questions à couvrir

- faut-il se connecter à des outils existants
- faut-il synchroniser des données
- y a-t-il des APIs critiques
- y a-t-il des dépendances externes fortes

## Dimensions à décrire

- nombre d’intégrations
- criticité des intégrations
- type d’intégrations
- flux entrants
- flux sortants
- besoin de synchronisation temps réel ou différée
- dépendance à des outils métiers tiers
- niveau de complexité d’intégration

## Exemples neutres

- CRM externe
- ERP
- outil de facturation
- paiement
- agenda
- email transactionnel
- stockage documentaire
- SSO
- analytics

Là encore, on décrit la dépendance fonctionnelle avant la technologie précise.

---

# 9. Bloc `operatingModel`

## Rôle

Décrire comment la solution doit être exploitée.

Ce bloc est de premier rang.

Il ne doit pas être dérivé trop tard, ni laissé au seul commercial.

## Questions à couvrir

- le client veut-il gérer lui-même ou non
- veut-il une solution livrée ou opérée
- quel niveau de prise en charge est attendu
- quel niveau de mutualisation est acceptable
- quel niveau de standardisation est acceptable
- quelle réversibilité est attendue
- quelle autonomie est attendue dans l’exploitation courante

## Dimensions à décrire

- niveau d’autonomie client
- niveau d’accompagnement souhaité
- préférence pour livraison / gestion / opération
- besoin de prise en charge complète
- niveau de standardisation acceptable
- niveau de personnalisation nécessaire
- acceptation d’un socle mutualisé
- exigence d’isolement
- exigence de réversibilité
- besoin de SLA ou support structuré
- intensité de maintenance attendue

## Ce bloc doit nourrir explicitement

- `deliveryModel`
- `mutualizationLevel`

Il est critique pour distinguer :

- un projet livré
- un projet managé
- une offre standardisée managée
- un produit opéré

---

# 10. Bloc `economicContext`

## Rôle

Décrire le cadre économique, sans réduire le projet à son budget.

## Questions à couvrir

- quel est le cadre économique du projet
- existe-t-il un budget fixe ou une enveloppe indicative
- quel modèle économique côté client est envisagé
- y a-t-il une logique CAPEX / OPEX implicite
- quelle sensibilité existe sur les coûts récurrents

## Dimensions à décrire

- budget indicatif
- tolérance aux coûts récurrents
- recherche de coût initial faible ou non
- sensibilité à la maintenance
- modèle d’achat attendu
- logique abonnement acceptable ou non
- horizon d’investissement

Ce bloc doit influencer `commercialProfile`, mais ne doit pas dicter seul la solution.

---

# 11. Bloc `signals`

## Rôle

Regrouper des signaux utiles à la décision, notamment ceux qui aident à évaluer la standardisation et la mutualisation.

## Exemples de signaux

- besoin fortement récurrent dans plusieurs dossiers
- faible variabilité métier
- périmètre fonctionnel stable
- forte autonomie de contenu
- très faible besoin d’exception
- intégrations simples
- exigences d’isolation fortes
- forte sensibilité des données
- fort potentiel de mutualisation
- fort risque de dérive custom

Ces signaux peuvent être saisis, dérivés, ou enrichis plus tard par le moteur.

---

# 12. Champs explicitement non canoniques

Certains champs peuvent exister dans le runtime ou dans les préférences utilisateur, mais ils ne doivent pas être des pivots du modèle canonique.

## Exemples de champs non canoniques

- `techStack`
- `cmsChoice`
- `wpHeadless`
- `frontendFramework`
- `deployTarget`
- `hostingVendor`
- `databaseVendor`
- `pluginChoice`
- `starterTemplate`
- `vercelProjectType`

Ces champs relèvent :

- soit d’une contrainte locale
- soit d’une préférence
- soit d’une implémentation proposée
- soit d’un état de génération

Ils ne doivent pas servir de base à la qualification métier.

---

# 13. Différence entre besoin, contrainte, préférence et implémentation

## Besoin

Ce qui doit être résolu ou rendu possible.

Exemple :

- publier du contenu
- prendre des rendez-vous
- vendre un catalogue
- gérer un espace client

## Contrainte

Ce qui limite le champ des solutions possibles.

Exemple :

- hébergement imposé
- données sensibles
- délai très court
- budget plafonné
- besoin d’isolation fort

## Préférence

Ce qui oriente la décision sans être structurant par nature.

Exemple :

- préférence pour une édition simple
- préférence pour un CMS connu
- préférence pour une maintenance minimale

## Implémentation

La manière retenue pour réaliser la solution.

Exemple :

- Next.js + MDX
- CMS configuré
- CMS étendu
- app custom
- offre opérée mutualisée

Le modèle canonique doit préserver cette séparation.

---

# 14. Qualités attendues du modèle canonique

Le modèle canonique doit être :

## Stable

Il doit survivre à un changement de stack ou d’outillage.

## Lisible

Un humain doit pouvoir comprendre le projet sans lire du code.

## Neutre techniquement

Il doit éviter les ancrages précoces dans une solution.

## Suffisamment riche

Il doit permettre une vraie décision, pas seulement un tri superficiel.

## Testable

Les invariants et mappings doivent pouvoir être vérifiés.

## Extensible

De nouvelles stratégies d’implémentation doivent pouvoir être ajoutées sans casser le modèle d’entrée.

---

# 15. Invariants du modèle canonique

Les invariants suivants doivent être respectés :

1. un projet doit pouvoir être décrit sans mentionner une techno donnée
2. le mode d’exploitation doit pouvoir être décrit avant la stack
3. le niveau de mutualisation doit être qualifiable sans dépendre d’un framework
4. les capacités fonctionnelles doivent être exprimées en besoins, pas en plugins
5. les contraintes techniques imposées doivent être modélisées comme contraintes, pas comme identité
6. le modèle canonique doit pouvoir alimenter plusieurs stratégies d’implémentation possibles
7. le modèle canonique doit rester exploitable même si le catalogue technique évolue

---

# 16. Exemple de lecture correcte du modèle

Exemple de lecture métier correcte :

- besoin principal : présence business avec contenu et génération de leads
- contenu : édition régulière par l’équipe client
- fonctionnalités : formulaires avancés, pages de services, blog
- acteurs : 2 éditeurs internes
- contraintes : budget encadré, faible complexité métier
- exploitation : client ne veut rien gérer
- standardisation acceptable : moyenne à forte

Ce type d’entrée peut ensuite conduire à plusieurs sorties possibles :

- projet managé basé sur CMS
- projet éditorial headless léger
- offre standardisée managée

Le modèle canonique n’a pas besoin de choisir cela à l’avance.

---

# 17. Résultat attendu

Si le modèle canonique est bon :

- le besoin réel est lisible
- le moteur peut raisonner proprement
- la stack devient une sortie
- le wizard consomme un vrai domaine
- la standardisation devient analysable
- la mutualisation devient analysable
- l’évolution vers des offres opérées reste possible

---

## Résumé opérationnel

Le modèle canonique de Site Factory doit être :

- orienté besoin
- indépendant de la stack
- structuré par blocs métier
- riche en signaux utiles à la décision
- explicite sur l’exploitation et la standardisation
- capable d’alimenter plusieurs stratégies d’implémentation

Il ne doit jamais être confondu avec :

- un simple formulaire UI
- un manifest technique
- un état de génération
- un catalogue d’implémentation
