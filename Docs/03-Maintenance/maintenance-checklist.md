# Checklist de maintenance mensuelle (toute stack)

Ce document definit la **checklist operationnelle mensuelle** de maintenance.
Objectif : maintenir les projets **securises, stables et conformes** en un temps maitrise.

**Temps cible** :
- Tier 0 : 10-15 min / projet
- Tier 1 : 15-20 min / projet
- Tier 2 : 20-30 min / projet
- Tier 3 : 30-45 min / projet
- Tier 4 : selon contrat

---

## Regles generales

- Toujours intervenir sur un projet **sauvegarde**
- Aucune evolution fonctionnelle pendant la maintenance
- Toute anomalie hors perimetre = ticket / devis
- La checklist fait foi (si ce n'est pas dedans, ce n'est pas inclus)

---

## 1. Securite (tous paliers)

- [ ] Certificat HTTPS valide
- [ ] Redirection HTTP vers HTTPS OK
- [ ] Acces admin securise (pas de comptes inconnus)
- [ ] Tentatives de connexion suspectes verifiees
- [ ] Headers de securite toujours actifs
- [ ] Aucun avertissement critique serveur

**Objectif** : conformite continue avec le socle technique.

---

## 2. Mises a jour (tous paliers)

### Framework / CMS / dependances

- [ ] Sauvegarde complete effectuee
- [ ] Framework / CMS a jour
- [ ] Dependances a jour (plugins, packages, extensions)
- [ ] Configuration / theme a jour
- [ ] Aucune erreur apres mise a jour

### Verifications post-update

- [ ] Projet accessible (front)
- [ ] Administration accessible (si applicable)
- [ ] Fonctionnalites cles OK
- [ ] Contenu affiche correctement
- [ ] Pages principales accessibles

---

## 3. Performance & stabilite (tous paliers)

- [ ] Cache actif
- [ ] Aucun ralentissement anormal
- [ ] Pas d'erreurs cote client visibles (JS, rendu)
- [ ] Pas d'erreurs cote serveur critiques
- [ ] Consommation ressources normale
- [ ] Chargement des pages principales normal

---

## 4. Contenu editorial (si present -- tous paliers)

- [ ] Articles / contenus accessibles (front)
- [ ] Categories et tags fonctionnels
- [ ] Pagination operationnelle
- [ ] Recherche fonctionnelle (si activee)
- [ ] Aucune erreur d'affichage liee au contenu

---

## 5. Verifications specifiques e-commerce (Tier 1+, si applicable)

### Tier 0

N/A (Tier 0 = sites minimaux, pas d'e-commerce)

### Tier 1-2

- [ ] Tunnel commande fonctionnel
- [ ] Paiement test OK
- [ ] Emails transactionnels OK

### Tier 3+

- [ ] Regles fiscales inchangees
- [ ] Calculs metier coherents
- [ ] Cas limites testes

---

## 6. Verifications specifiques architecture decouplee (si applicable)

- [ ] API backend accessible
- [ ] Frontend connecte au backend
- [ ] Preview fonctionnel (si applicable)
- [ ] Webhooks de revalidation OK
- [ ] Monitoring front + back actifs

---

## 7. Modules actifs (Tier 2+)

- [ ] Modules fonctionnels (pas de regression)
- [ ] Integrations externes operationnelles
- [ ] Consommation API normale
- [ ] Pas de reponses aberrantes (IA, si actif)

---

## 8. Logs & monitoring (tous paliers)

- [ ] Logs erreurs consultes
- [ ] Aucun pic anormal
- [ ] Uptime OK
- [ ] Alertes traitees

---

## 9. Reporting interne (tous paliers)

- [ ] Maintenance effectuee
- [ ] Incidents detectes (oui / non)
- [ ] Actions correctives realisees
- [ ] Points a surveiller

**Temps cible** : 2-3 minutes.

---

## Ce que cette checklist NE couvre PAS

- Ajout ou modification de contenu
- Changements design
- Nouvelles fonctionnalites
- Optimisations SEO editoriales
- Changements reglementaires
- Correction ou optimisation du contenu editorial
- Strategie de contenu ou de publication

---

## Regle fondamentale

> **La maintenance est un acte technique, pas une prestation creative.**
> Cette checklist garantit la qualite sans derive.
