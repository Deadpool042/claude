# Glossaire métier et mapping taxonomique

## Objet

Ce document verrouille le vocabulaire de reference pour:

- la taxonomie strategique cible,
- les objets runtime historiques,
- les docs legacy.

Portee de phase 2:

- pas de migration runtime,
- pas de changement d'enum,
- pas de modification de `Docs/_spec`.

## Sources auditees

- Docs strategiques: `Docs/produit/vision-produit.md`, `Docs/produit/positionnement-offres.md`, `Docs/produit/taxonomie-projets.md`, `Docs/qualification/logique-de-qualification.md`
- Docs techniques/historiques qualification: `Docs/recommandation/classification-des-capacites.md`, `Docs/recommandation/matrice-capacites-cms.md`, `Docs/technique/catalogue-modules-framework.md`, `Docs/recommandation/moteur-de-decision.md`, `Docs/interne/audits/2026-03-04-matrice-wizard-qualification-live.md`
- Canonique machine-readable: `Docs/_spec/*.json`, `Docs/_spec/README.md`
- Runtime applicatif: `site-factory/src/lib/offers/*`, `site-factory/src/lib/referential/*`, `site-factory/src/lib/wizard-domain/*`, `site-factory/src/lib/project-choices/*`, `site-factory/src/lib/validators/project.ts`, `site-factory/prisma/schema.prisma`

## Glossaire canonique

| Terme | Statut | Definition normative | Objets references | A eviter |
|---|---|---|---|---|
| `famille de projet` | `canonique` | Axe strategique metier qui exprime la nature du besoin client, avant techno. Valeurs cibles: `SITE_VITRINE`, `SITE_BUSINESS`, `ECOMMERCE`, `MVP_SAAS`, `APP_METIER`. | Docs strategiques (`Docs/produit/taxonomie-projets.md`) | Dire `type de projet` pour cet axe. |
| `type de projet` | `derive (runtime)` | Enum de compatibilite wizard/runtime. Valeurs actuelles: `BLOG`, `VITRINE`, `ECOM`, `APP` (`STARTER` encore present en legacy DB/UI). | `referential/project.ts`, `validators/project.ts`, `schema.prisma` | L'utiliser comme synonyme de `famille de projet` cible. |
| `offre` | `derive (runtime + business)` | Proposition commerciale exploitable issue de la qualification (famille cible + mode de production + cadre economique). Runtime actuel: `VITRINE_BLOG`, `ECOMMERCE`, `APP_CUSTOM`. | `src/lib/offers/offers.ts` | Assimiler `offre` a une famille strategique. |
| `mode de production` | `canonique` | Mode principal de realisation fonctionnelle d'une capacite: `CMS_NATIVE`, `PLUGIN_INTEGRATION`, `FRAMEWORK_MODULE`, `CUSTOM_APP`, `THEME_FEATURE`. | `Docs/_spec/decision-rules.json` (`classificationEnum`) | Utiliser `PLUGIN`/`MODULE` seuls comme vocabulaire metier canonical. |
| `implementation` | `canonique (concept) / derive (runtime enum)` | Choix technique concret de realisation (CMS/stack/hosting/profil). | `ProjectImplementation`, `stack-profiles.json`, `project-choices` | Confondre implementation avec famille de projet. |
| `capacite` | `canonique` | Capacite fonctionnelle atomique exprimee par une `feature` (`feature.*`). | `Docs/_spec/features.json`, `capability-matrix.json` | Employer `module` comme synonyme de capacite. |
| `module` | `canonique` | Brique d'implementation reutilisable qui peut couvrir plusieurs capacites et requalifier la categorie. | `Docs/_spec/modules.json`, `referential/modules.ts` | Employer `feature` comme synonyme de module. |
| `qualification` | `canonique (process)` | Processus qui transforme besoin + contraintes en recommandation: famille cible -> mode -> implementation -> categorie/cout. | `Docs/qualification/logique-de-qualification.md`, `qualification-runtime.ts` | Reduire la qualification a un simple choix de stack. |
| `categorie (CAT0..CAT4)` | `derive (runtime/cout)` | Niveau de complexite/maintenance/cout. Ce n'est ni une famille de projet ni une offre. | `decision-rules.json`, `maintenance-cat.ts` | Employer `categorie` pour designer la famille strategique. |
| `famille technique` | `derive (runtime)` | Regroupement techno pour contraintes et pricing (`ProjectFamily`/`StackFamily`). | `project-choices`, `stack-families.ts`, `stack-profiles.json` | L'appeler simplement `famille` sans qualifier. |

## Tableau des ambiguities actuelles

| Collision / ambiguite | Constate dans l'existant | Decision normative |
|---|---|---|
| `famille de projet` vs `ProjectFamily` | Docs strategiques vs wizard (`projectFamily`) | Toujours qualifier: `famille de projet` (strategique) vs `famille technique` (runtime). |
| `type de projet` (metier) vs `ProjectType` (runtime) | Runtime `BLOG/VITRINE/ECOM/APP` + docs produit | `type de projet` devient terme runtime uniquement. Pour le metier: `famille de projet`. |
| `CUSTOM_APP` vs `APP_CUSTOM` vs `APP_PLATFORM` | `_spec` (mode), offers (offre), wizard (famille technique) | `CUSTOM_APP` = mode canonique; `APP_CUSTOM` = offre runtime legacy; `APP_PLATFORM` = famille technique runtime. |
| `PLUGIN_INTEGRATION/FRAMEWORK_MODULE` vs `PLUGIN/MODULE` | `classificationEnum` vs `decisionOrderCanonical` | En doc metier: toujours formes longues canoniques. `PLUGIN`/`MODULE` = alias runtime legacy. |
| `ECOMMERCE` multi-sens | Famille cible, offre runtime, domaine de feature | Toujours preciser l'axe: `famille ECOMMERCE`, `offre ECOMMERCE`, `domaine feature ECOMMERCE`. |
| `categorie` multi-sens | `ProjectCategory`, `OfferCategory`, categories modules | `categorie` reserve a `CAT0..CAT4` sauf mention explicite `offre runtime` ou `categorie de module`. |
| `STARTER` | Prisma/validators/UI, absent du referentiel `ProjectType` principal | `STARTER` = terme legacy de packaging UI, hors taxonomie cible. |
| `VITRINE_BLOG` | Offre runtime fusionnee | Terme runtime legacy. En doc produit, separer `SITE_VITRINE` et `SITE_BUSINESS`. |

## Mapping cible -> runtime -> legacy

### Mapping des familles de projet

| Famille cible strategique (canonique) | Type runtime actuel (`ProjectType`) | Offre runtime (`OfferCategory`) | Famille technique runtime dominante | Vocabulaire legacy courant | Statut |
|---|---|---|---|---|---|
| `SITE_VITRINE` | `VITRINE` + `BLOG` | `VITRINE_BLOG` | `STATIC_SSG`, `CMS_MONO`, `CMS_HEADLESS` | "Vitrine / Blog", "site simple", `CAT0/CAT1` | `regroupement provisoire` |
| `SITE_BUSINESS` | `VITRINE` ou `BLOG` (selon contexte) | `VITRINE_BLOG` + modules business | `CMS_MONO`, `CMS_HEADLESS`, parfois `APP_PLATFORM` | "vitrine avec integrations", "lead gen", "site business" | `approximation transitoire` |
| `ECOMMERCE` | `ECOM` | `ECOMMERCE` | `COMMERCE_SAAS`, `COMMERCE_SELF_HOSTED`, `COMMERCE_HEADLESS` | `COMMERCE_*`, "boutique en ligne" | `equivalent exact` |
| `MVP_SAAS` | `APP` | `APP_CUSTOM` | `APP_PLATFORM` | "App custom", "custom platform", `CAT3/CAT4` | `approximation transitoire` |
| `APP_METIER` | `APP` | `APP_CUSTOM` | `APP_PLATFORM` | "Application", "sur-mesure metier", `CAT3/CAT4` | `divergence connue` |

Notes de lecture:

- `MVP_SAAS` et `APP_METIER` convergent aujourd'hui vers les memes objets runtime (`APP` / `APP_CUSTOM` / `APP_PLATFORM`): la distinction n'est pas encodee.
- `SITE_VITRINE` et `SITE_BUSINESS` convergent partiellement vers `VITRINE_BLOG`: separation strategique non native en runtime.

### Mapping des modes de production

| Mode canonique cible | Runtime actuel (classification/matrix) | Runtime actuel (ordre decision) | Statut |
|---|---|---|---|
| `CMS_NATIVE` | `CMS_NATIVE` | `CMS_NATIVE` | `equivalent exact` |
| `PLUGIN_INTEGRATION` | `PLUGIN_INTEGRATION` | `PLUGIN` | `approximation transitoire` |
| `FRAMEWORK_MODULE` | `FRAMEWORK_MODULE` | `MODULE` | `approximation transitoire` |
| `CUSTOM_APP` | `CUSTOM_APP` | `CUSTOM_APP` | `equivalent exact` |
| `THEME_FEATURE` | `THEME_FEATURE` | absent de `decisionOrderCanonical` | `divergence connue` |

## Regles de vocabulaire a appliquer dans les futures docs

1. Toujours annoncer l'axe semantique: `famille de projet`, `type runtime`, `offre runtime`, `famille technique`, `categorie CAT`.
2. En cadrage produit et avant-vente, utiliser uniquement la taxonomie cible (`SITE_VITRINE`, `SITE_BUSINESS`, `ECOMMERCE`, `MVP_SAAS`, `APP_METIER`).
3. En references runtime, conserver les enums exacts du code, avec mention explicite `runtime legacy` si besoin.
4. Pour les modes, utiliser les libelles canoniques longs (`PLUGIN_INTEGRATION`, `FRAMEWORK_MODULE`) dans les docs fonctionnelles.
5. Une phrase de mapping doit toujours inclure un statut: `equivalent exact`, `approximation transitoire`, `regroupement provisoire`, ou `divergence connue`.
6. Ne jamais utiliser `categorie` (`CAT0..CAT4`) pour parler de famille de projet.
7. `feature` = capacite; `module` = brique de realisation. Ne pas inverser.

## Termes a eviter (et remplacement)

| Terme a eviter | Pourquoi | Remplacement recommande |
|---|---|---|
| "type de projet" (pour parler strategie) | Collision avec enum runtime | "famille de projet" |
| "famille" (sans precision) | Ambigu entre strategie et technique | "famille de projet" ou "famille technique" |
| "custom app" (sans contexte) | Confusion mode/offre/famille | `mode CUSTOM_APP`, `offre APP_CUSTOM` ou `famille APP_PLATFORM` |
| `PLUGIN` / `MODULE` en doc metier | Alias runtime incomplets | `PLUGIN_INTEGRATION` / `FRAMEWORK_MODULE` |
| `VITRINE_BLOG` en doc strategique | Fusion runtime, pas taxonomie cible | `SITE_VITRINE` ou `SITE_BUSINESS` selon intention |
| `STARTER` comme famille cible | Terme legacy de packaging UI | `SITE_VITRINE` (si besoin simplifie) + hypothese budgetaire explicite |

## Points ouverts (phase runtime suivante)

1. Encoder explicitement la distinction `SITE_VITRINE` vs `SITE_BUSINESS` dans le runtime (sans casser les flux existants).
2. Encoder explicitement la distinction `MVP_SAAS` vs `APP_METIER` (actuellement fusionnees sous `APP`).
3. Decider du statut final de `STARTER` (maintien legacy, deprecation, ou conversion explicite).
4. Aligner `decisionOrderCanonical` avec les libelles canoniques complets (`PLUGIN_INTEGRATION`, `FRAMEWORK_MODULE`) ou documenter formellement les alias.
5. Rationaliser les libelles UI offres (`VITRINE_BLOG`, `APP_CUSTOM`) vers la taxonomie cible apres plan de migration runtime.
