# Guide d'integration d'une nouvelle technologie

> Ce document definit le processus pour integrer une nouvelle stack technique
> dans le cadre de l'agence. L'objectif est de garantir que toute nouvelle
> technologie respecte les memes exigences de qualite, maintenabilite
> et industrialisation que les stacks existantes.

---

## Pourquoi ce guide

Le cadre de l'agence est **technologie-agnostique par conception** :
le socle technique definit des objectifs mesurables, pas des outils.
Le Complexity Index mesure la complexite fonctionnelle, pas la stack.

Pour autant, chaque nouvelle technologie doit etre **evaluee et validee**
avant d'etre proposee aux clients. Ce guide formalise ce processus.

---

## Criteres d'eligibilite

Une technologie est eligible si elle satisfait **tous** les criteres suivants :

### 1. Maturite et perennite

| Critere | Seuil minimum |
| --- | --- |
| Version stable disponible | Oui (pas de beta/RC pour la production) |
| Communaute active | > 5 000 stars GitHub ou equivalent |
| Maintenance reguliere | Releases dans les 6 derniers mois |
| Documentation officielle | Complete et a jour |
| Roadmap publique | Visible et coherente |

### 2. Compatibilite avec le socle technique

La technologie doit permettre d'atteindre **tous les objectifs du socle** :

- [ ] Securite : HTTPS, headers, protection brute force realisables
- [ ] Performance : Lighthouse >= 80 atteignable
- [ ] RGPD : consentement conditionnel implementable
- [ ] SEO : sitemap, robots.txt, metas gerees
- [ ] Sauvegardes : mecanisme de backup faisable
- [ ] Deploiement : au moins 1 cible de deploiement supportee

### 3. Maintenabilite

| Critere | Exigence |
| --- | --- |
| Mises a jour | Processus clair et non-destructif |
| Dependances | Ecosysteme stable, pas de lock-in |
| Monitoring | Logs et erreurs exploitables |
| Rollback | Strategie de retour arriere possible |

### 4. Viabilite economique

| Critere | Exigence |
| --- | --- |
| Cout de licence | Compatible avec la grille tarifaire |
| Temps de dev initial | Estimable et cadrable |
| Courbe d'apprentissage | Raisonnable (< 2 semaines pour un dev senior) |
| Recrutement | Profils disponibles sur le marche |

---

## Processus de validation

### Phase 1 -- Evaluation (1-2 semaines)

1. **Recherche** : documentation, communaute, cas d'usage similaires
2. **Prototype** : realiser un mini-projet (site vitrine ou equivalent)
3. **Checklist socle** : verifier point par point la compatibilite
4. **Estimation** : evaluer le temps de dev vs stacks existantes

**Livrable** : fiche d'evaluation (voir template ci-dessous).

### Phase 2 -- Validation (decision)

La validation est effectuee par le responsable technique sur la base de :

- La fiche d'evaluation
- La viabilite economique
- La coherence avec la strategie de l'agence

**Decision** : Acceptee / Refusee / En observation.

### Phase 3 -- Integration (2-4 semaines)

Si acceptee :

1. **Documenter** les patterns d'implementation pour le socle technique
2. **Creer** un template/starter pour les futurs projets
3. **Definir** le coefficient de pricing (par rapport a la reference WP x1.0)
4. **Ajouter** les exemples dans `07-Exemples/exemples-par-stack.md`
5. **Mettre a jour** la matrice de compatibilite hebergement
6. **Tester** un premier projet reel (interne ou pilote client)

### Phase 4 -- Retour d'experience (apres 3 projets)

Apres 3 projets livres avec la nouvelle stack :

- Bilan qualite : incidents, delais, satisfaction client
- Bilan economique : rentabilite vs previsions
- Decision finale : maintien / ajustement / retrait

---

## Fiche d'evaluation (template)

```
FICHE D'EVALUATION -- NOUVELLE TECHNOLOGIE

Date : [date]
Evaluateur : [nom]
Technologie : [nom + version]

1. MATURITE
   - Version stable : [oui/non]
   - GitHub stars : [nombre]
   - Derniere release : [date]
   - Documentation : [complete/partielle/insuffisante]

2. COMPATIBILITE SOCLE
   - Securite : [oui/partiel/non] -- [commentaire]
   - Performance : [oui/partiel/non] -- [commentaire]
   - RGPD : [oui/partiel/non] -- [commentaire]
   - SEO : [oui/partiel/non] -- [commentaire]
   - Sauvegardes : [oui/partiel/non] -- [commentaire]
   - Deploiement : [oui/partiel/non] -- [cibles supportees]

3. MAINTENABILITE
   - Mises a jour : [processus]
   - Dependances : [ecosysteme]
   - Monitoring : [mecanismes]
   - Rollback : [strategie]

4. ECONOMIE
   - Licence : [gratuit/payant -- cout]
   - Temps de dev (vitrine standard) : [heures estimees]
   - Coefficient propose : x[valeur] (ref WP x1.0)
   - Recrutement : [facile/moyen/difficile]

5. PROTOTYPE
   - Realise : [oui/non]
   - URL / repo : [lien]
   - Observations : [commentaire]

6. DECISION
   - [ ] Acceptee
   - [ ] Refusee -- motif : [raison]
   - [ ] En observation -- revoir le [date]

Signature : _______________
```

---

## Impact sur le Complexity Index

L'ajout d'une nouvelle technologie **n'impacte pas le CI directement**.
Le CI mesure la complexite fonctionnelle, pas la stack.

Toutefois, si une technologie implique systematiquement une architecture
plus complexe (ex. architecture decouplee), cela se reflete naturellement
dans les axes SA et DE du CI.

---

## Technologies actuellement supportees (indicatif)

La liste ci-dessous est **indicative**. Toute nouvelle stack est possible
apres validation (cf. processus ci-dessus).

| Technologie | Statut | Reference pricing | Depuis |
| --- | --- | --- | --- |
| WordPress | Supportee | Voir tableau commercial | Origine |
| WooCommerce | Supportee | Voir tableau commercial | Origine |
| Next.js | Supportee | Voir tableau commercial | Origine |
| Nuxt | Supportee | Voir tableau commercial | Origine |
| Astro | Supportee | Voir tableau commercial | Origine |
| WordPress headless | Supportee | Voir tableau commercial | Origine |
| WooCommerce headless | Supportee | Voir tableau commercial | Origine |
| HTML / statique | Supportee | Voir tableau commercial | Origine |

### Technologies potentielles (non evaluees)

| Technologie | Type | Notes |
| --- | --- | --- |
| Strapi | CMS headless | Alternative a WP headless |
| Sanity | CMS headless | SaaS, pas de self-hosting |
| Payload CMS | CMS headless | TypeScript natif, self-hosted |
| Django | Framework backend | Python, ecosysteme different |
| Ruby on Rails | Framework full-stack | Ecosysteme mature |
| SvelteKit | Framework JS | Communaute croissante |
| Remix | Framework React | Alternative a Next.js |
| Shopify (headless) | E-commerce | Via Storefront API |

> Ces technologies peuvent etre evaluees a tout moment
> en suivant le processus decrit ci-dessus.

---

## Regles de retrait

Une technologie peut etre retiree du cadre si :

- Elle n'est plus maintenue (6+ mois sans release)
- Ses vulnerabilites ne sont plus corrigees
- Le cout de maintenance depasse la viabilite economique
- Aucun projet actif ne l'utilise (apres migration des existants)

> Le retrait est toujours precede d'un plan de migration pour les projets existants.

---

## Regle fondamentale

> **Ajouter une technologie est un engagement de maintenance.**
> Chaque stack supportee doit etre maintenue, documentee et rentable.
> La prudence est preferee a l'enthousiasme technologique.
