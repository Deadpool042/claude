# Documentation Agence -- Cadre projets & offres

Ce dossier contient **l'ensemble du cadre operationnel de l'agence** :
qualification des projets, structuration des offres, socle technique,
maintenance, modules et regles financieres internes.

**Objectif** : vendre, produire et maintenir des sites de facon rentable, claire et industrialisable.

---

## Vision globale

Le modele repose sur quatre piliers independants de toute technologie :

1. **Socle technique** -- Objectifs mesurables obligatoires pour tout projet livre
2. **Complexity Index (CI)** -- Mesure factuelle de la complexite d'un projet
3. **Maintenance** -- Paliers determines par le CI, applicables a toute stack
4. **Modules a valeur business** -- Fonctionnalites optionnelles facturees en sus

La technologie (WordPress, Next.js, Nuxt, Astro, ou toute future stack) est un **choix d'implementation**, jamais un critere de categorisation.

---

## Organisation des dossiers

### 01 -- Socle Technique

Objectifs mesurables obligatoires pour tout projet, independamment de la stack.
Securite, performance, conformite RGPD, deploiement, audit de livraison.

- **socle-technique.md** -- Reference unique du socle

---

### 02 -- Complexity Index

Outil de mesure objectif de la complexite d'un projet.
Formule, axes d'evaluation, seuils et correspondance avec les paliers de maintenance.

- **complexity-index.md** -- Definition, formule et seuils

---

### 03 -- Maintenance

Paliers de maintenance determines par le Complexity Index.
Perimetre, exclusions, modalites, grille tarifaire.

- **maintenance.md** -- Grille officielle de maintenance
- **maintenance-checklist.md** -- Checklist operationnelle mensuelle

---

### 04 -- Modules

Catalogue des modules a valeur business activables selon la complexite du projet.

- **modules.md** -- Index du catalogue, regles d'activation
- **module-\*.md** -- Un fichier par module (perimetre, prix, exclusions)

---

### 05 -- Bonnes Pratiques

Pratiques recommandees independantes de la stack : architecture, tests,
observabilite, deploiement, gestion des dependances.

- **bonnes-pratiques.md** -- Reference des pratiques stack-agnostiques

---

### 06 -- Integration Technologie

Guide pour integrer une nouvelle stack dans le cadre (Strapi, Django, Rails, etc.).
Processus de validation, criteres d'eligibilite, mise a jour du CI.

- **guide-integration.md** -- Processus d'ajout d'une nouvelle technologie

---

### 07 -- Exemples

Exemples concrets d'application du cadre pour les stacks actuellement supportees.
Ces exemples illustrent le cadre sans le restreindre.

- **exemples-par-stack.md** -- Illustrations par technologie

---

### 08 -- Commercial

Outils d'aide a la vente et a la pedagogie client.
Aucune information interne dans ces documents.

- **tableau-comparatif-offres.md** -- Comparatif client
- **guide-tier-0-1.md** -- Guide simplifié Tier 0 & Tier 1 pour la vente

> **Audience** : client / prospect.
> Ne contient ni formules internes, ni marges, ni splits financiers.

---

### 09 -- Interne

Documents strictement internes. Non transmissibles au client.

- **definition-standard-grille.md** -- Vision macro des offres
- **grille-qualification-client.md** -- Outil de decision (projet, CI, modules)
- **flux-decisionnel.md** -- Referentiel decisionnel unique
- **repartition-financiere.md** -- Regles de split agence / partenaire
- **process-livraison.md** -- Process de livraison des projets
- **cas-typiques-tier-0.md** -- Cas d'usage et business case Tier 0

> **Audience** : equipe interne uniquement.

---

## Distinction interne / commercial

| Aspect | Documents commerciaux (08) | Documents internes (09) |
| --- | --- | --- |
| **Audience** | Client, prospect | Equipe technique, direction |
| **Contenu** | Perimetre, prix publics, avantages | Marges, splits, flux decisionnels |
| **Ton** | Pedagogique, orientee valeur | Operationnel, directif |
| **Exemples** | Comparatif offres, grille tarifaire | Qualification, repartition financiere |

**Regle** : tout document transmis au client doit etre issu du dossier `08-Commercial/`.
Les documents `09-Interne/` ne quittent jamais l'organisation.

---

## Regles cles

- Le **socle technique est le prerequis obligatoire** pour tous les projets
- La **categorisation** est fonctionnelle (complexite), jamais technologique
- Le **Complexity Index** determine objectivement le palier de maintenance
- Les **modules** ajoutent de la valeur business et peuvent augmenter le CI
- La **maintenance** est globale, non cumulative, et obligatoire
- Toute sortie de cadre = **requalification**
- La stack est un choix d'implementation, pas une contrainte structurelle

### Compatibilite type ↔ hebergement ↔ famille

- STARTER : hebergements `Mutualise`, `Managed WP`, `Cloud statique`, `VPS`, `A confirmer` ; familles `Statique/SSG` ou `CMS mono` uniquement (jamais de headless).
- BLOG / VITRINE : familles `Statique/SSG`, `CMS mono`, `CMS headless` ; hebergements larges (mutualise, managed WP, cloud statique/SSR, VPS, SaaS, split headless, a confirmer).
- ECOM : familles `Commerce SaaS`, `Commerce auto-heberge`, `Commerce headless` ; hebergements e-commerce (mutualise WP, cloud SSR, VPS, SaaS, split headless, a confirmer).
- APP : famille `App/Plateforme` ; hebergements `Cloud SSR`, `VPS/Docker`, `Split headless` (pas de mutualise).
- Filtrage croise applique dans l'outil : l'UI n'affiche que les couples hebergement/famille compatibles avec le type selectionne.

---

## Principe fondamental

> **Ce cadre existe pour eviter l'improvisation.**
> Moins d'improvisation = plus de qualite, plus de marge, moins de stress.
