# Socle technique -- Objectifs mesurables (toute stack)

> Ce document definit les **objectifs techniques obligatoires** pour tout projet livre.
> Les objectifs sont exprimes en **resultats mesurables**, independamment de la technologie.
> Pour des exemples d'implementation par stack, voir `07-Exemples/exemples-par-stack.md`.

---

## Principes directeurs

- Le socle definit des **objectifs**, pas des outils
- Chaque objectif est **mesurable** ou **verifiable** (oui/non, score, seuil)
- Le socle est **minimal et robuste** : tout ajout de complexite passe par un module
- Aucune technologie n'est imposee par le socle ; seul le resultat compte
- Toute exception doit etre documentee dans la fiche projet

---

## 1. Securite

### Objectifs mesurables

| Objectif | Seuil | Outil de verification |
| --- | --- | --- |
| Score securite globale | **A minimum** | [Mozilla Observatory](https://observatory.mozilla.org) |
| Certificat HTTPS | Valide, non expire | Navigateur / SSL Labs |
| Redirection HTTP vers HTTPS | 100 % des URLs | Curl / Lighthouse |
| TLS | Version maintenue (1.2+) | SSL Labs |

### Exigences fonctionnelles

- En-tetes de securite configures :
  - `Content-Security-Policy` (CSP adaptee au contexte)
  - `Strict-Transport-Security` (HSTS)
  - `X-Frame-Options`
  - `X-Content-Type-Options`
  - `Referrer-Policy`
- Cookies : attributs `Secure`, `HttpOnly`, `SameSite` adaptes
- Protection brute force sur les points d'authentification
- Surface d'attaque reduite (endpoints inutiles desactives)
- Variables d'environnement securisees (aucun secret en clair dans le code)

> Le prestataire n'assume **aucune obligation de resultat absolu**
> face a des attaques ciblees ou failles de composants tiers.

### Rappel maintenance

- **Tier 1** : protections standards = socle commun
- **Tier 2+** : durcissement et surveillance renforcée inclus via le niveau de maintenance

---

## 2. Performance

### Objectifs mesurables

| Objectif | Seuil | Outil de verification |
| --- | --- | --- |
| Score Lighthouse (mobile) | **>= 80** sur les pages cles | Google Lighthouse |
| Time To First Byte (TTFB) | **< 800 ms** | WebPageTest / Lighthouse |

### Exigences fonctionnelles

- Cache actif (page, assets, API selon la stack)
- Images optimisees (formats modernes : WebP, AVIF)
- Chargement differe des medias non critiques (lazy loading)
- Scripts tiers limites au strict necessaire
- Bundle optimise (split, tree-shaking, compression)

---

## 3. Conformite RGPD & consentement

### Objectifs mesurables

| Objectif | Seuil | Verification |
| --- | --- | --- |
| Consentement avant cookies non essentiels | 100 % | Test manuel / automatise |
| Modification du consentement | Possible a tout moment | Test manuel |
| Scripts marketing charges conditionnellement | 100 % | Audit reseau navigateur |

### Exigences fonctionnelles

- Bandeau de consentement fonctionnel (CMP valide, sans freemium bloquant)
- Categories minimales : necessaire / mesure / marketing
- Registre des consentements accessible
- Aucun tracking actif sans consentement explicite

---

## 4. Protection des formulaires

### Objectifs mesurables

| Objectif | Seuil | Verification |
| --- | --- | --- |
| Soumission spam bloquee | 100 % des formulaires publics | Test de soumission |
| Validation serveur | Active sur tous les formulaires | Revue de code |

### Exigences fonctionnelles

- Mecanisme anti-spam (honeypot, captcha, ou equivalent)
- Rate limiting sur les soumissions
- Validation serveur obligatoire (ne jamais se fier au client seul)

---

## 5. SEO de base

### Objectifs mesurables

| Objectif | Seuil | Verification |
| --- | --- | --- |
| Sitemap XML | Accessible et valide | Requete HTTP |
| Robots.txt | Present et coherent | Requete HTTP |
| Meta titres et descriptions | Configures sur toutes les pages | Lighthouse / outil SEO |
| Open Graph | Minimum (titre, description, image) | Validateur OG |

---

## 6. Accessibilite de base

### Objectifs mesurables

| Objectif | Seuil | Verification |
| --- | --- | --- |
| Score accessibilite Lighthouse | **>= 80** | Google Lighthouse |

### Exigences fonctionnelles

- Titres hierarchises (`h1` > `h2` > `h3`)
- Attributs `alt` sur les images
- Focus visible sur les elements interactifs
- Contraste suffisant (WCAG AA minimum)
- Navigation au clavier fonctionnelle

---

## 7. Sauvegardes & monitoring

### Objectifs mesurables

| Objectif | Seuil | Verification |
| --- | --- | --- |
| Sauvegardes automatiques | Actives (fichiers + donnees) | Preuve de snapshot |
| Retention minimale | **7 jours** | Verification du stockage |
| Monitoring uptime | Actif avec alertes | Dashboard monitoring |
| Restauration testee | **1 test avant livraison** | Preuve de restauration |

### Exigences fonctionnelles

- Sauvegardes automatiques (priorite infra, eviter les solutions applicatives lourdes)
- Stockage externe recommande (pas sur le meme serveur)
- Alertes en cas d'indisponibilite

---

## 8. Deploiement & mise en production

### Forfait mise en production

La mise en production initiale fait l'objet d'un **forfait unique** couvrant :
CI/CD, parametrage serveur, DNS, SSL, pipelines, verifications.

| Cible de deploiement | Forfait |
| --- | --- |
| Mutualise (o2switch, OVH) | **200 EUR** |
| Vercel / Cloud | **150 EUR** |
| Docker / VPS | **500 EUR** |
| Architecture split (backend + frontend separes) | **350 EUR** |
| Architecture unifiee (containers) | **500 EUR** |

### Objectifs mesurables

| Objectif | Seuil | Verification |
| --- | --- | --- |
| Certificat SSL | Valide et fonctionnel | SSL Labs |
| DNS | Correctement configure | Dig / nslookup |
| Pipeline CI/CD | Operationnel (si applicable) | Declenchement test |
| Premier deploiement | Verifie et fonctionnel | Test manuel |
| Secrets | Aucun en clair dans le code | Revue de code |

> Ce forfait est facture une seule fois, en sus du budget de developpement.
> L'hebergement recurrent reste a la charge du client.

---

## 9. Audit de livraison

Chaque livraison doit etre accompagnee d'un **audit documente** couvrant :

### Checklist universelle (toute stack)

- [ ] Securite : rapport Mozilla Observatory (score A minimum)
- [ ] Performance : Lighthouse mobile sur pages cles (score >= 80)
- [ ] RGPD : consentement + chargement conditionnel verifie
- [ ] Anti-spam : test de soumission bloquee
- [ ] Sauvegardes : snapshot + restauration testee
- [ ] SEO : sitemap, robots.txt, metas verifies
- [ ] Accessibilite : score Lighthouse >= 80
- [ ] Deploiement : SSL, DNS, pipeline fonctionnels
- [ ] Secrets : aucun secret expose dans le code source

### Verifications complementaires selon le contexte

| Contexte | Verifications supplementaires |
| --- | --- |
| CMS (WordPress, Strapi, etc.) | Liste des extensions/plugins actifs + versions |
| Application JS (Next, Nuxt, Astro) | Build prod OK, bundle analyse, lint OK |
| Architecture decouplee (headless) | Auth API, CORS, preview, webhooks, monitoring front+back |
| E-commerce | Tunnel commande, paiement test, emails transactionnels |

> L'audit est archive avec le projet (PDF ou capture).

---

## Hebergement & domaine

L'hebergement et le domaine sont **la propriete du client** et a sa charge financiere.
Ils constituent une **ligne separee** du budget de developpement.

### Matrice de compatibilite (indicative)

| Cible | CMS classique | CMS headless | Framework JS | Notes |
| --- | --- | --- | --- | --- |
| **Mutualise** | Oui | Backend seulement | Non | PHP + MySQL |
| **Vercel / Cloud** | Non | Frontend seulement | Oui | Serverless |
| **Docker / VPS** | Oui | Oui (unifie) | Oui | Containers |

> Cette matrice est indicative. Toute nouvelle stack doit etre evaluee
> selon le guide d'integration (`06-Integration-Technologie/guide-integration.md`).

---

## Regle fondamentale

> **Tout projet livre doit satisfaire ces objectifs mesurables.**
> La stack technique et les outils utilises sont des choix d'implementation ;
> seuls les resultats comptent.
