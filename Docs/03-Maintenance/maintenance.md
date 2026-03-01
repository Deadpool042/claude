# Grille de maintenance -- Paliers bases sur le Complexity Index

Ce document definit **la maintenance officielle des projets**, son perimetre exact,
ses paliers et les responsabilites associees.

**Objectifs** :
- Garantir la **securite**, la **stabilite** et la **perennite** des projets
- Rendre la maintenance **previsible et industrialisable**
- Eviter toute derive de support ou de perimetre
- Proteger le temps du prestataire technique

> La maintenance est **obligatoire** pour tous les projets livres.

---

## Principe general

> **La maintenance n'est ni du support client, ni de l'evolution fonctionnelle.**
> Elle vise exclusivement a maintenir le projet **en etat de fonctionnement,
> de securite et de conformite**, selon son Complexity Index.

Toute demande qui modifie le comportement, les regles ou les fonctionnalites du projet
releve d'un **devis separe** ou d'un **module dedie**.

---

## Socle commun de maintenance (obligatoire -- tous paliers)

Ce socle s'applique a **tous les projets**, quel que soit le palier.

### Inclus systematiquement

- Mises a jour du framework / CMS et de ses dependances
- Verification post-mises a jour (non-regression)
- Sauvegardes automatiques (donnees + fichiers / code)
- Monitoring disponibilite (uptime + alertes)
- Corrections de bugs techniques mineurs
- Maintien de la conformite securite (socle technique)
- Restauration en cas d'incident lie aux mises a jour
- Surveillance des formulaires (envoi, securite, anti-spam)
- Surveillance technique du contenu (affichage, chargement, compatibilite)

### Exclus systematiquement

- Ajout ou modification de contenu
- Changements UI / design
- Nouvelles pages ou fonctionnalites
- SEO editorial
- Gestion des produits / commandes
- Formation client

---

## Determination du palier

Le palier de maintenance est determine par le **Complexity Index (CI)**
du projet (voir `02-Complexity-Index/complexity-index.md`).

| CI | Palier | Label | Tarif mensuel |
| --- | --- | --- | --- |
| 5 -- 7 | **Tier 0** | Minimal | **79 EUR/mois** |
| 8 -- 10 | **Tier 1** | Standard | **109 EUR/mois** |
| 11 -- 15 | **Tier 2** | Avance | **139 EUR/mois** |
| 16 -- 20 | **Tier 3** | Renforce | **169 EUR/mois** |
| 21 -- 25 | **Tier 4** | Premium | **A partir de 209 EUR/mois** |

---

## Tier 0 -- Minimal (CI 5-7)

### Repartition financiere

| Prix/mois | Prestataire (70 %) | Agence (30 %) |
| --- | --- | --- |
| 79 EUR | 55 EUR | 24 EUR |

### Inclus (en plus du socle commun)

- Controle securite mensuel (allege)
- Verification du tunnel de contact principal
- Surveillance compatibilite des dependances critiques
- Correction des bugs de securite uniquement
- Surveillance du bon fonctionnement du contenu editorial

### Hors perimetre

- Plus de 1 intervention corrective par trimestre
- Toute demande non prevue dans le standard
- Optimisation editoriale ou strategique

### Temps cible : 10-15 min / projet

> **Audience Tier 0** : Sites minimaux, statiques, ou blogs sans integrations externes.
> Ideal pour : landing pages, blogs Astro, vitrines ultra-simples.

---

## Tier 1 -- Standard (CI 8-10)

### Repartition financiere

| Prix/mois | Prestataire (70 %) | Agence (30 %) |
| --- | --- | --- |
| 109 EUR | 76 EUR | 33 EUR |

### Inclus (en plus du socle commun)

- Controle securite mensuel
- Verification du tunnel de contact principal
- Surveillance compatibilite des dependances
- Corrections techniques simples
- Verification du bon fonctionnement du contenu editorial

### Hors perimetre

- Plus d'1 intervention corrective par mois
- Toute demande non prevue dans le standard
- Optimisation editoriale ou strategique
- Usage marketing, analytique ou metier

### Temps cible : 15-20 min / projet

---

## Tier 2 -- Avance (CI 11-15)

### Repartition financiere

| Prix/mois | Prestataire (70 %) | Agence (30 %) |
| --- | --- | --- |
| 139 EUR | 97 EUR | 42 EUR |

### Inclus (en plus du Tier 1)

- Surveillance des modules actifs
- Verifications fonctionnelles etendues
- Support technique prioritaire
- Corrections liees aux modules (hors evolution)
- Surveillance des integrations marketing ou analytiques actives
- Surveillance du contenu structure (taxonomies, multi-langue, formulaires lies)

### Hors perimetre

- Ajout de nouvelles regles fonctionnelles
- Nouvelles integrations
- Modifications UX lourdes

### Temps cible : 20-30 min / projet

---

## Tier 3 -- Renforce (CI 16-20)

### Repartition financiere

| Prix/mois | Prestataire (70 %) | Agence (30 %) |
| --- | --- | --- |
| 169 EUR | 118 EUR | 51 EUR |

### Inclus (en plus du Tier 2)

- Surveillance regles metier / fiscales existantes
- Corrections necessaires au maintien de conformite
- Tests reguliers sur cas sensibles
- Documentation minimale mise a jour
- Surveillance du contenu a logique metier ou reglementaire

### Hors perimetre

- Nouvelles obligations legales
- Changement de reglementation
- Ajout de pays / marches
- Extension du perimetre metier

> Toute evolution reglementaire ou metier entraine :
> soit une reevaluation du CI,
> soit un ajustement de perimetre par avenant.

### Temps cible : 30-45 min / projet

---

## Tier 4 -- Premium (CI 21-25)

### Modalites

- **Contrat premium** obligatoire
- Tarif defini selon volumetrie et contraintes d'exploitation
- Repartition financiere definie au contrat (hors grille standard)

### Inclus (indicatif)

- Maintenance front + back (si architecture decouplee)
- Mises a jour stack technique complete
- Surveillance performance continue
- Support prioritaire
- Accompagnement evolutif
- Maintenance des plateformes a forte volumetrie

> En Tier 4, la maintenance fait partie integrante de l'architecture
> et ne peut pas etre standardisee. Le contrat est negocie au cas par cas.

---

## Lien entre maintenance et modules

- La maintenance est **toujours rattachee au CI reel du projet**
- Un module peut augmenter le CI et donc **changer le palier**
- La maintenance est **globale et non cumulative**
- Les modules n'ajoutent pas de "mini-maintenance" separee

Exemple :
- Projet CI = 8 (Tier 1) + module multi-langue (CI +2) = CI 10 --> Tier 2
- Projet CI = 12 (Tier 2) + module accises (CI +4.5) = CI 16.5 --> Tier 3

---

## Modalites d'intervention

- Maintenance **preventive et corrective**
- Pas d'intervention en urgence hors contrat specifique
- Interventions priorisees selon la criticite,
  sans engagement de delai ou de temps de reponse contractuel
- Communication par canal unique

---

## Cas de suspension de maintenance

La maintenance peut etre suspendue si :

- Le client refuse une mise a jour critique
- Les acces necessaires sont retires
- L'hebergement devient non conforme
- Des modifications sont faites hors cadre de maintenance

---

## Modules a abonnement

Certains modules fonctionnent avec un **abonnement mensuel distinct**
(ex. assistant intelligent, APIs tierces).

- Cet abonnement couvre l'exploitation du module (API, supervision, ajustements)
- Il est **independant** de la maintenance du projet
- La maintenance du projet reste due selon le palier CI
- Aucun pourcentage agence supplementaire n'est applique sans accord explicite

> Maintenance =/= abonnement fonctionnel.

---

## Resume

| Palier | CI | Tarif mensuel | Niveau |
| --- | --- | --- | --- |
| Tier 0 | 5-7 | 49 EUR | Minimal |
| Tier 1 | 8-10 | 79 EUR | Standard |
| Tier 2 | 11-15 | 109 EUR | Avance |
| Tier 3 | 16-20 | 139 EUR | Renforce |
| Tier 4 | 21-25 | A partir de 179 EUR | Premium |

> Les tarifs correspondent au palier effectif du projet,
> apres prise en compte des modules actifs et du CI reel.

---

## Regle fondamentale

> **La maintenance protege le projet, pas les decisions du client.**
> Elle garantit la stabilite, pas l'evolution.
