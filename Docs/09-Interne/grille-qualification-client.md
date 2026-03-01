# Grille de qualification client — Projets web

> 🔒 **Document interne — ne pas transmettre au client**
>
> Cette grille permet de qualifier rapidement un projet web afin de :
>
> - déterminer le **tier du projet** (Tier 0 → Tier 4)
> - identifier les **modules nécessaires**
> - fixer le **niveau de maintenance**
>
> 👉 Cette grille est un **outil de pré-qualification**.
> Le tier final est toujours validé à l'aide du **flux décisionnel interne**,
> qui fait foi en cas de doute.
>
> ⚠️ Cette grille est **stack-agnostic** : la stack n'influence pas le tier.
> La stack est choisie **après la qualification** et influence le prix et le déploiement.

---

## 0️⃣ Identification du projet

### Q0a — Quel est le type fonctionnel du projet ?

☐ Statique / HTML simple
☐ Blog simple
☐ Site vitrine
☐ E-commerce
☐ Application / plateforme

### Q0b — Contraintes d'architecture (si déjà connues)

☐ CMS monolithique (ex: WordPress, Drupal)
☐ Headless CMS + front (ex: WP headless, Strapi)
☐ Framework full-stack (ex: Next, Nuxt, SvelteKit, Remix)
☐ Statique / HTML (ex: Astro, Eleventy, HTML simple)
☐ Autre / à valider

👉 La stack finale est proposée **après** la qualification (type + modules).
👉 Application / plateforme = pas de CMS monolithique.
👉 Architecture headless = requalification Tier 4 (module "architecture headless").

### Q0c — E-commerce custom (sans CMS e-commerce) ?

Si le type est **E-commerce** et l'architecture est **custom** :

⚠️ **Tier 3 minimum** (complexité checkout / intégrations e-commerce).

---

## 1️⃣ Qualification Tier 0 — Starter minimal

### Q1 — Le projet est-il ultra-minimaliste ?

- Landing page (1-3 pages)
- Blog très simple (< 10 articles, no intégrations)
- Site statique / vitrine basique

☐ Oui → **Tier 0 validé** (maintenance Minimal obligatoire)
☐ Non → continuer vers Tier 1

---

## 2️⃣ Prérequis obligatoires

### Q2 — Le client accepte-t-il le cadre technique et la maintenance obligatoire ?

- Hébergement compatible avec la base technique commune
- Accès techniques suffisants
- Maintenance mensuelle obligatoire

☐ Oui → continuer
☐ Non → **Refus du projet**

---

## 3️⃣ Qualification Tier 1 — Site standard

### Q3 — Le site est-il un projet standard ?

- Blog simple (éditorial, pas de conversion)
- Site vitrine
- E-commerce simple (≤ 50 produits, TVA standard, 1-2 paiements)

☐ Oui → continuer
☐ Non → Tier 2+

---

### Q4 — Le blog (si présent) est-il simple ?

- pas de multi-langue
- pas de taxonomies personnalisées
- pas de logique métier ou marketing
- pas d'intégrations externes

☐ Oui → continuer
☐ Non → Tier 2+

---

### Q5 — UI basée sur templates + variants (pas de design personnalisé) ?

☐ Oui
☐ Non → Tier 2+

---

### Q6 — E-commerce (si applicable) : simple ?

- catalogue ≤ 50 produits
- TVA standard uniquement
- aucune règle métier ou réglementaire
- 1-2 moyens de paiement / livraison

☐ Oui → **Tier 1 validé**
☐ Non → Tier 2 ou 3

---

## 4️⃣ Qualification Tier 2 — Site avancé

### Q7 — Le projet inclut-il des fonctionnalités avancées mais limitées (1 à 3) ?

Exemples (liste non exhaustive) :

- multi-langue partiel
- paiement en ligne
- newsletter / email marketing
- tunnel de conversion
- blog structuré (taxonomies, intégrations)
- recherche & filtres avancés
- connecteurs simples (CRM, newsletter)
- variations produits avancées

☐ Oui → **Tier 2 validé (sauf requalification Tier 3)**
☐ Non → Tier 1 ou 3

---

## 5️⃣ Qualification Tier 3 — Métier / réglementé

### Q8 — Le projet comporte-t-il des contraintes métier ou réglementaires ?

Exemples :

- accises ou fiscalité spécifique
- produits réglementés
- règles commerciales complexes
- responsabilité légale explicite
- tarification conditionnelle métier
- dashboard personnalisé
- connecteurs métier complexes
- IA avec logique métier
- blog à logique métier ou réglementaire

☐ Oui → **Tier 3 validé (requalification obligatoire)**
☐ Non → continuer

---

## 6️⃣ Qualification Tier 4 — Premium

### Q9 — Le projet nécessite-t-il un niveau premium ?

Exemples :

- architecture headless (CMS + frontend découplé)
- front applicatif dédié
- SEO international avancé
- exigences de performance élevées (CWV stricts)
- forte volumétrie / trafic
- branding premium

☐ Oui → **Tier 4 validé**
☐ Non → tier précédent

---

## 🧩 Modules à activer (si applicables)

Les modules sont **compatibles selon la stack** et leur coût varie selon l'implémentation.

### Modules structurants (peuvent changer la catégorie)

- ☐ Multi-langue → Tier 2 min
- ☐ Multi-devises → Tier 2 min
- ☐ Paiement avancé → Tier 2 min
- ☐ Newsletter / email marketing → Tier 2 min
- ☐ Tunnel de conversion → Tier 2 min
- ☐ Recherche & filtres avancés → Tier 2 min
- ☐ Marketing & tracking → Tier 2 min
- ☐ Accises & fiscalité → Tier 3
- ☐ Tarification métier → Tier 3
- ☐ Connecteurs métier → Tier 3
- ☐ Dashboard personnalisé → Tier 3
- ☐ Assistant IA → Tier 3
- ☐ Performance avancée → Tier 4
- ☐ Architecture headless → Tier 4

ℹ️ Règle importante :

- certains modules entraînent une **requalification automatique**
- la catégorie finale retenue est toujours la **plus élevée atteinte**
- la maintenance est ensuite alignée sur cette catégorie finale

---

## 🔧 Maintenance recommandée

| Tier | Maintenance          | Tarif indicatif |
| --------- | -------------------- | --------------- |
| Tier 0     | Minimal              | 49 €/mois    |
| Tier 1     | Standard             | 79 €/mois       |
| Tier 2     | Avancée              | 109 €/mois       |
| Tier 3     | Métier renforcée     | 139 €/mois      |
| Tier 4     | Premium              | 179 €/mois+      |

👉 Une seule maintenance s'applique par site.
Les modules n'ajoutent jamais de maintenance supplémentaire.

---

## ✅ Résumé final (à compléter)

- **Type fonctionnel** : ……………………………
- **Stack proposée (après qualification)** : ……………………………
- **Tier retenu** : ……………………………
- **Modules associés** : ……………………………
- **Maintenance** : ……………………………

---

## 📌 Règle finale

> Cette grille est **décisionnelle** et s'inscrit dans le cadre
> du flux décisionnel interne.
>
> La stack technique **n'ajuste pas le tier** : elle ajuste le pricing et le déploiement.
> Les modules et contraintes d'architecture peuvent requalifier la catégorie.
> Toute demande hors cadre entraîne une **requalification automatique**
> ou un **ajustement complémentaire**, sans exception.
