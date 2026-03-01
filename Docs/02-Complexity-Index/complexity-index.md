# Complexity Index (CI) -- Mesure de complexite projet

> Ce document definit le **Complexity Index (CI)**, un outil de mesure objectif
> de la complexite architecturale d'un projet. Le CI est **independant de la technologie** :
> il mesure la complexite fonctionnelle, pas le choix de stack.
>
> Le CI determine directement le **palier de maintenance** applicable.

---

## Objectif

Le Complexity Index repond a un besoin simple :
**mesurer objectivement la complexite d'un projet pour en deduire le niveau de maintenance**.

Il remplace toute logique de categorisation basee sur la stack technique.
Un site vitrine en WordPress et un site vitrine en Next.js avec le meme perimetre
fonctionnel auront le **meme CI** et donc le **meme palier de maintenance**.

---

## Axes d'evaluation

Le CI repose sur **quatre axes** notes de 1 a 5 :

### Axe 1 -- Surface applicative (SA)

Mesure l'etendue fonctionnelle du projet.

| Score | Description | Exemples |
| --- | --- | --- |
| 1 | Mini-site, 1-3 pages | Landing page, site one-page |
| 2 | Site simple, structure standard | Vitrine 5-10 pages, blog simple |
| 3 | Site structure, contenus diversifies | Blog multi-categories, catalogue produits |
| 4 | Application avec logique metier | E-commerce avance, portail client, dashboard |
| 5 | Plateforme complexe multi-fonctions | Marketplace, SaaS, plateforme media |

### Axe 2 -- Dependances externes (DE)

Mesure le nombre et la criticite des integrations tierces.

| Score | Description | Exemples |
| --- | --- | --- |
| 1 | Aucune dependance externe | Site statique autonome |
| 2 | 1-2 services simples | Formulaire de contact, analytics |
| 3 | 3-5 services ou 1 service critique | CRM, newsletter, passerelle paiement |
| 4 | Multi-services avec logique d'orchestration | ERP + CRM + emailing + paiement |
| 5 | Ecosysteme complexe, APIs critiques | Multi-APIs, webhooks bidirectionnels, temps reel |

### Axe 3 -- Criticite business (CB)

Mesure l'impact commercial et legal du projet.

| Score | Description | Exemples |
| --- | --- | --- |
| 1 | Impact negligeable | Site personnel, projet interne |
| 2 | Presence en ligne standard | Vitrine d'entreprise, blog d'information |
| 3 | Canal de vente ou de conversion | E-commerce simple, lead generation |
| 4 | Revenus significatifs dependants du site | E-commerce a fort volume, plateforme SaaS |
| 5 | Impact legal ou reglementaire | Donnees financieres, reglementation sectorielle, accises |

### Axe 4 -- Sensibilite des donnees (SD)

Mesure le niveau de protection requis pour les donnees traitees.

| Score | Description | Exemples |
| --- | --- | --- |
| 1 | Donnees publiques uniquement | Site vitrine sans formulaire |
| 2 | Donnees personnelles basiques | Formulaire de contact, inscription newsletter |
| 3 | Donnees personnelles etendues + comptes | Comptes utilisateurs, historique commandes |
| 4 | Donnees financieres ou sensibles | Paiement en ligne, donnees bancaires |
| 5 | Donnees hautement sensibles | Donnees de sante, donnees reglementees, KYC |

---

## Formule

```
CI = SA + DE + (CB x 1.5) + (SD x 1.5)
```

Les axes **Criticite business** et **Sensibilite des donnees** sont ponderes x1.5
car ils representent un risque plus eleve et un effort de maintenance plus important.

### Plage de valeurs

| Valeur | Minimum | Maximum |
| --- | --- | --- |
| SA | 1 | 5 |
| DE | 1 | 5 |
| CB x 1.5 | 1.5 | 7.5 |
| SD x 1.5 | 1.5 | 7.5 |
| **CI total** | **5** | **25** |

---

## Seuils et paliers de maintenance

| Plage CI | Palier | Label | Tarif mensuel indicatif |
| --- | --- | --- | --- |
| **5 -- 7** | Tier 0 | Minimal | 79 EUR/mois |
| **8 -- 10** | Tier 1 | Standard | 109 EUR/mois |
| **11 -- 15** | Tier 2 | Avance | 139 EUR/mois |
| **16 -- 20** | Tier 3 | Renforce | 169 EUR/mois |
| **21 -- 25** | Tier 4 | Premium | A partir de 209 EUR/mois |

> En cas de doute entre deux paliers, le palier superieur s'applique.

### Correspondance indicative avec les types de projets

| Type de projet | CI typique | Palier |
| --- | --- | --- |
| Landing page / mini-site 1-3 pages | 5-6 | Tier 0 |
| Blog tres simple (3-5 articles) | 5-7 | Tier 0 |
| Blog simple (5-10 articles, pas d'integ) | 7-9 | Tier 0 / Tier 1 |
| Site vitrine standard | 9-12 | Tier 1 |
| Blog structure (multi-langue, taxonomies) | 11-14 | Tier 1 / Tier 2 |
| E-commerce simple | 13-16 | Tier 2 |
| E-commerce avance (multi-devises, livraison) | 16-19 | Tier 2 / Tier 3 |
| Site metier / reglemente | 19-22 | Tier 3 / Tier 4 |
| Application / plateforme | 21-25 | Tier 3 / Tier 4 |
| Architecture decouplee (headless) | 18-25 | Tier 3 / Tier 4 |

---

## Impact des modules sur le CI

L'activation d'un module peut augmenter le CI en modifiant un ou plusieurs axes.

| Module | Axes impactes | Impact typique |
| --- | --- | --- |
| Multi-langue | SA +1, DE +1 | CI +2 |
| Paiement en ligne | DE +1, CB +1, SD +1 | CI +3.5 |
| Newsletter / emailing | DE +1 | CI +1 |
| Tunnel de conversion | SA +1, CB +1 | CI +2.5 |
| Accises / fiscalite | CB +2, SD +1 | CI +4.5 |
| Tarification metier | SA +1, CB +1 | CI +2.5 |
| Architecture headless | SA +1, DE +2 | CI +3 |
| Connecteurs metier | DE +2 | CI +2 |
| Dashboard personnalise | SA +2 | CI +2 |
| Assistant IA | DE +1, SA +1 | CI +2 |
| Performance avancee | (pas d'impact direct) | CI +0 (mais Tier 4 si CWV stricts) |

> Les impacts ci-dessus sont **indicatifs**. L'evaluation finale du CI
> se fait toujours sur la base du projet reel, pas par addition automatique.

## Impacts CI — Modules App Custom (indicatif)

> Le CI est indépendant de la technologie. Les impacts ci-dessous sont indicatifs et servent à requalifier les projets **App Custom (Cat 4)**.

| Module | SA | DE | CB | SD | Score indicatif |
| --- | --- | --- | --- | --- | --- |
| Documents & partage | +1 | +0 | +0 | +1 | +2 |
| Import CSV (batch) | +1 | +1 | +0 | +0 | +2 |
| Import quittances PDF | +1 | +1 | +0 | +1 | +3.5 |
| Messagerie asynchrone | +1 | +1 | +0 | +0 | +2 |
| Messagerie temps réel | +1 | +2 | +0 | +0 | +3 |
| Notifications | +0 | +1 | +0 | +0 | +1 |
| Permissions / ACL | +0 | +0 | +1 | +1 | +2.5 |
| Workflows | +1 | +0 | +1 | +0 | +2.5 |
| Audit logs | +0 | +0 | +0 | +1 | +1.5 |
| Reporting & exports | +1 | +1 | +0 | +0 | +2 |

---

## Processus d'evaluation

### Etape 1 -- Evaluation initiale

Lors de la qualification du projet (avant devis) :

1. Identifier le type fonctionnel (vitrine, blog, e-commerce, app)
2. Lister les modules requis
3. Evaluer chaque axe (SA, DE, CB, SD) sur 1-5
4. Calculer le CI
5. Determiner le palier de maintenance

### Etape 2 -- Reevaluation en cours de vie

Le CI peut evoluer si :

- Un module est ajoute ou retire
- Le perimetre fonctionnel change
- Les integrations externes evoluent
- La criticite business change

> Toute modification du CI entraine une reevaluation du palier de maintenance.

### Etape 3 -- Documentation

Le CI et ses composantes sont documentes dans la fiche projet :

```
Projet : [nom]
Date d'evaluation : [date]

SA : [1-5] -- [justification]
DE : [1-5] -- [justification]
CB : [1-5] -- [justification]
SD : [1-5] -- [justification]

CI = SA + DE + (CB x 1.5) + (SD x 1.5) = [valeur]
Palier de maintenance : Tier [1-4]
```

---

## Exemples d'evaluation

### Exemple 1 : Site vitrine WordPress

- SA = 2 (5-10 pages, structure standard)
- DE = 1 (aucune dependance externe)
- CB = 2 (presence en ligne standard)
- SD = 2 (formulaire de contact)

**CI = 2 + 1 + (2 x 1.5) + (2 x 1.5) = 9** --> Tier 1 (Standard) -- 109 EUR/mois

> Note : un site vitrine tres simple (3 pages, pas de formulaire) tomberait a CI = 7 --> Tier 0 (79 EUR/mois).

### Exemple 2 : E-commerce WooCommerce simple

- SA = 3 (catalogue, panier, commande)
- DE = 3 (passerelle paiement + emails transactionnels)
- CB = 3 (canal de vente)
- SD = 4 (donnees financieres client)

**CI = 3 + 3 + (3 x 1.5) + (4 x 1.5) = 16.5** --> Tier 3 (Renforce) -- 169 EUR/mois

### Exemple 3 : Application Next.js avec auth + API externe

- SA = 4 (dashboard, gestion utilisateurs)
- DE = 4 (auth provider + 2 APIs + BDD)
- CB = 4 (revenus dependants)
- SD = 4 (donnees utilisateurs + financieres)

**CI = 4 + 4 + (4 x 1.5) + (4 x 1.5) = 20** --> Tier 3 (Renforce) -- 169 EUR/mois

### Exemple 4 : Blog Astro statique

- SA = 2 (articles, categories)
- DE = 1 (aucune)
- CB = 1 (impact negligeable)
- SD = 1 (aucune donnee personnelle)

**CI = 2 + 1 + (1 x 1.5) + (1 x 1.5) = 6** --> Tier 0 (Minimal) -- 79 EUR/mois

### Exemple 5 : E-commerce international avec accises

- SA = 4 (catalogue etendu, multi-pays)
- DE = 5 (paiement + logistique + fiscalite + CRM + analytics)
- CB = 5 (reglementation sectorielle)
- SD = 4 (donnees financieres)

**CI = 4 + 5 + (5 x 1.5) + (4 x 1.5) = 22.5** --> Tier 4 (Premium) -- 209 EUR/mois

---

## Regles d'application

1. Le CI est **toujours evalue avant devis**
2. Le CI est **independant de la stack** : meme perimetre fonctionnel = meme CI
3. En cas de doute sur un axe, **arrondir vers le haut**
4. Le CI est **documente et archivable** (fiche projet)
5. Toute evolution du perimetre entraine une **reevaluation du CI**
6. Le palier de maintenance est **non negociable** une fois le CI etabli

---

## Regle fondamentale

> **Le Complexity Index mesure la complexite du projet, pas la difficulte de la stack.**
> Un e-commerce reglemente en WordPress et en Next.js auront le meme CI.
> La stack influence le budget de creation, pas le palier de maintenance.
