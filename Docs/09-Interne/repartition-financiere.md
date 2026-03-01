# Modele financier — Regles internes

> Document interne — non transmissible au client

---

## Modes de facturation

### Mode Solo (par defaut)

Tu factures le client en direct. **100 % de la prestation te revient.**

- Creation one-shot : prix catalogue
- Maintenance : recurrent mensuel, integralement pour toi
- Modules IA : abonnement mensuel, tu couvres les couts API

> C'est le mode standard. Pas de split, pas de partage.

### Mode Sous-traitant

Une agence fait appel a toi. Elle facture son client, tu factures l'agence.

| Composant | Toi (sous-traitant) | Agence |
|-----------|-------------------:|-------:|
| Base site (Tier 1-3) | **70 %** | 30 % |
| Modules standards (Tier 2) | **60 %** | 40 % |
| Modules metier (Tier 3) | **70 %** | 30 % |
| Tier 4 globale | **60 %** | 40 % |
| Maintenance (toutes) | **70 %** | 30 % |
| Abonnement IA | **70 %** | 30 % |

> Tu fais le boulot technique, tu captes la majorite.
> L'agence assume la vente, la relation client et le pilotage.
> Ces pourcentages sont des **references**, negociables au cas par cas.

---

## Grille tarifaire (mode Solo)

| | Tier 0 Starter | Tier 1 Standard | Tier 2 Avance | Tier 3 Metier | Tier 4 Premium |
|---|---|---|---|---|---|
| **Base technique (à partir de)** | 1 200 EUR | 1 800 EUR | 3 500 EUR | 5 600 EUR | Sur devis |
| **Maintenance** | 49 EUR/mois | 79 EUR/mois | 109 EUR/mois | 139 EUR/mois | 179 EUR/mois+ |
| **Modules** | Factures en sus, voir `modules.md` | | | | |

> Prix de base WordPress/Woo. Le prix total est deterministe : base (selon la stack) + modules + mise en production.

---

## Recurrent

- **Maintenance** : automatisee, facturee mensuellement
- **Abonnement IA** : 49-149 EUR/mois selon palier, en sus de la maintenance
- Les couts d'API sont a ta charge (inclus dans la marge du palier)

---

## Exclusions (toujours hors perimetre initial)

- Support client hors perimetre maintenance
- Evolutions fonctionnelles post-livraison
- Contenu / SEO editorial
- Refonte UI/UX
- Nouvelles obligations legales

Requalification et avenant systematiques.

---

## Regles structurantes

- Pas de projet sans maintenance
- Pas de module sans qualification tier
- Toute demande hors cadre = requalification
- En mode sous-traitant : accord ecrit sur les pourcentages avant demarrage
