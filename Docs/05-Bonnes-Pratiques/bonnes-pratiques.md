# Bonnes pratiques -- Stack-agnostiques

> Ce document definit les bonnes pratiques applicables a tout projet,
> independamment de la technologie choisie. Ces pratiques sont des **recommandations
> graduees** (pas des obligations absolues) dont l'application depend du
> Complexity Index du projet.

---

## 1. Architecture & structure de code

### Objectifs

- Code maintenable par un tiers sans documentation excessive
- Separation claire des responsabilites
- Modifications localisees (un changement n'impacte pas tout le projet)

### Pratiques

| Pratique | Tier 1 | Tier 2 | Tier 3-4 |
| --- | --- | --- | --- |
| Arborescence claire et conventionnelle | Oui | Oui | Oui |
| Separation logique metier / presentation | -- | Oui | Oui |
| Patterns documentes (naming, structure) | -- | Recommande | Oui |
| Architecture modulaire (decoupage en composants) | -- | -- | Oui |

### Principe directeur

> Privilegier la **convention** plutot que la configuration.
> Un nouveau developpeur doit comprendre le projet en lisant la structure.

---

## 2. Gestion des dependances

### Objectifs

- Dependances tracees et reproductibles
- Aucune dependance fantome ou non justifiee
- Capacite de remplacement si un outil devient obsolete

### Pratiques

| Pratique | Application |
| --- | --- |
| Fichier de lock versionne | Obligatoire (tous paliers) |
| Dependances justifiees (pas d'empilement) | Obligatoire (tous paliers) |
| Pas de freemium bloquant | Obligatoire (tous paliers) |
| Encapsulation via adapter/wrapper | Recommande (Tier 2+) |
| Audit periodique des dependances obsoletes | Recommande (Tier 3+) |
| Capacite de remplacement documentee | Recommande (Tier 3+) |

### Principe directeur

> Chaque dependance est un **engagement de maintenance**.
> Moins de dependances = moins de surface d'attaque, moins de travail de mise a jour.

---

## 3. Tests & validation

### Objectifs

- Detecter les regressions avant la mise en production
- Valider les cas critiques (paiement, formulaires, regles metier)
- Automatiser ce qui est repetable

### Pratiques graduees

| Type de test | Tier 1 | Tier 2 | Tier 3-4 |
| --- | --- | --- | --- |
| Tests manuels avant livraison | Oui | Oui | Oui |
| Checklist de livraison | Oui | Oui | Oui |
| Tests fonctionnels automatises | -- | Recommande | Oui |
| Tests unitaires (logique metier) | -- | -- | Oui |
| Tests de non-regression | -- | -- | Recommande |
| Tests de performance (load testing) | -- | -- | Tier 4 |

### Principe directeur

> Tester en priorite ce qui est **critique et fragile** :
> tunnels de paiement, calculs metier, integrations externes.

---

## 4. Observabilite & monitoring

### Objectifs

- Detecter les incidents avant le client
- Comprendre les erreurs sans acceder a la production
- Suivre la sante du projet dans le temps

### Pratiques graduees

| Capacite | Tier 1 | Tier 2 | Tier 3-4 |
| --- | --- | --- | --- |
| Monitoring uptime (ping) | Oui | Oui | Oui |
| Alertes en cas d'indisponibilite | Oui | Oui | Oui |
| Logs d'erreurs consultables | Recommande | Oui | Oui |
| Logs structures (niveau, contexte) | -- | Recommande | Oui |
| Metriques de performance (TTFB, LCP) | -- | -- | Recommande |
| Dashboard de monitoring | -- | -- | Tier 4 |
| Alertes sur seuils metier | -- | -- | Tier 4 |

### Principe directeur

> L'observabilite est proportionnelle a la criticite.
> Un blog statique n'a pas besoin d'un dashboard Grafana.

---

## 5. Deploiement & CI/CD

### Objectifs

- Deployments reproductibles et reversibles
- Pas de deploiement "a la main" en production
- Capacite de rollback rapide

### Pratiques graduees

| Capacite | Tier 1 | Tier 2 | Tier 3-4 |
| --- | --- | --- | --- |
| Deploiement documente | Oui | Oui | Oui |
| Environnement de dev / staging | Recommande | Oui | Oui |
| Pipeline CI/CD automatise | -- | Recommande | Oui |
| Verification automatique pre-deploy (lint, build) | -- | Recommande | Oui |
| Strategie de rollback | -- | -- | Oui |
| Deployments blue/green ou canary | -- | -- | Tier 4 |

### Principe directeur

> Le deploiement doit etre un **non-evenement** :
> previsible, rapide, sans surprise.

---

## 6. Securite applicative

### Objectifs

- Reduire la surface d'attaque
- Proteger les donnees utilisateur
- Maintenir la conformite dans le temps

### Pratiques (au-dela du socle technique obligatoire)

| Pratique | Tier 1 | Tier 2 | Tier 3-4 |
| --- | --- | --- | --- |
| Principe du moindre privilege (roles, permissions) | Oui | Oui | Oui |
| Secrets hors du code source | Oui | Oui | Oui |
| Mises a jour de securite rapides | Oui | Oui | Oui |
| Revue de securite avant livraison | Checklist | Checklist | Audit |
| Scan de vulnerabilites automatise | -- | Recommande | Oui |
| Politique de rotation des secrets | -- | -- | Recommande |

### Principe directeur

> La securite n'est pas un module optionnel.
> Elle est integree dans chaque decision technique.

---

## 7. Documentation projet

### Objectifs

- Un nouveau intervenant peut reprendre le projet sans formation orale
- Les decisions techniques sont tracees
- Le client sait ce qui est installe et pourquoi

### Pratiques graduees

| Element | Tier 1 | Tier 2 | Tier 3-4 |
| --- | --- | --- | --- |
| README avec instructions de setup | Oui | Oui | Oui |
| Liste des dependances et justifications | Oui | Oui | Oui |
| Fiche projet (CI, modules, palier) | Oui | Oui | Oui |
| Documentation des regles metier | -- | -- | Oui |
| Architecture Decision Records (ADR) | -- | -- | Recommande |
| Guide de deploiement | -- | Recommande | Oui |

### Principe directeur

> Documenter les **decisions**, pas le code evident.
> Le "pourquoi" est plus important que le "comment".

---

## 8. Gestion des sauvegardes

### Objectifs

- Restauration possible en moins de 24h
- Donnees jamais perdues de maniere irrecuperable
- Processus teste regulierement

### Pratiques

| Capacite | Tier 1 | Tier 2 | Tier 3-4 |
| --- | --- | --- | --- |
| Sauvegardes automatiques | Oui | Oui | Oui |
| Retention 7 jours minimum | Oui | Oui | Oui |
| Stockage externe (hors serveur principal) | Recommande | Oui | Oui |
| Test de restauration avant livraison | Oui | Oui | Oui |
| Test de restauration periodique | -- | Recommande | Oui |
| Retention etendue (30 jours+) | -- | -- | Recommande |

---

## Resume : graduation par palier

| Domaine | Tier 1 | Tier 2 | Tier 3-4 |
| --- | --- | --- | --- |
| Architecture | Convention | Separation | Modulaire |
| Dependances | Justifiees | Encapsulees | Auditees |
| Tests | Manuels | Automatises partiels | Automatises complets |
| Observabilite | Uptime | Logs | Metriques + alertes |
| Deploiement | Documente | CI/CD | Blue/green |
| Securite | Checklist | Scans | Audit |
| Documentation | README | Guide | ADR |
| Sauvegardes | Auto 7j | Externe + test | Etendu |

---

## Regle fondamentale

> **Les bonnes pratiques sont graduees, pas binaires.**
> Un blog statique n'a pas les memes exigences qu'une plateforme e-commerce.
> Le Complexity Index guide le niveau d'exigence attendu.
