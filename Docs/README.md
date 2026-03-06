# Documentation Site Factory

Cette arborescence suit une seule logique de navigation: partir du produit, passer par la qualification et la recommandation, puis descendre vers la technique. Les documents internes et la spec canonique sont explicitement séparés du parcours principal.

## Doctrine de référence

- Le besoin client précède la technologie.
- La famille de projet précède le choix d'implémentation.
- Le moteur recommande un mode de production, pas seulement un stack.
- `Docs/_spec` reste la source de vérité canonique.
- Le reste de `Docs/` sert à lire, expliquer et opérer le système.

## Arborescence cible

| Dossier | Rôle |
|---|---|
| `produit/` | Vision, positionnement, taxonomie, glossaire métier. |
| `qualification/` | Logique de qualification, cadrage, règles d'entrée. |
| `recommandation/` | Moteur de recommandation, lecture des capacités, orientation de solution. |
| `technique/` | Implémentation, architecture spec-first, modules, intégrations, socles. |
| `interne/` | Gouvernance, QA, roadmap, audits, archives, prompts internes. |
| `_spec/` | Source canonique machine-readable. |

## Source de vérité et responsabilités

| Niveau | Chemin | Rôle |
|---|---|---|
| Canonique métier | `Docs/_spec/*` | Vérité exécutable: règles, catalogues, pricing, matrices, arbitrages. |
| Miroir runtime dérivé | `site-factory/src/lib/referential/spec/data/*` | Copie générée depuis `_spec`, consommée par l'application. |
| Couche applicative dérivée | `site-factory/src/lib/offers/*` | Adaptation UI/runtime pour l'app. |
| Documentation lisible | `Docs/produit/*`, `Docs/qualification/*`, `Docs/recommandation/*`, `Docs/technique/*`, `Docs/interne/*` | Guides de lecture et documentation d'exploitation. |

## Parcours de lecture recommandé

### Comprendre le produit

1. [produit/vision-produit.md](./produit/vision-produit.md)
2. [produit/positionnement-offres.md](./produit/positionnement-offres.md)
3. [produit/taxonomie-projets.md](./produit/taxonomie-projets.md)
4. [produit/glossaire-et-mapping-taxonomique.md](./produit/glossaire-et-mapping-taxonomique.md)

### Comprendre la qualification et la recommandation

1. [qualification/logique-de-qualification.md](./qualification/logique-de-qualification.md)
2. [recommandation/moteur-de-decision.md](./recommandation/moteur-de-decision.md)
3. [recommandation/cms-supportes.md](./recommandation/cms-supportes.md)
4. [recommandation/classification-des-capacites.md](./recommandation/classification-des-capacites.md)
5. [recommandation/matrice-capacites-cms.md](./recommandation/matrice-capacites-cms.md)

### Descendre vers l'implémentation

1. [technique/architecture-spec-first.md](./technique/architecture-spec-first.md)
2. [technique/catalogue-modules-framework.md](./technique/catalogue-modules-framework.md)
3. [technique/integrations-plugins-et-apps.md](./technique/integrations-plugins-et-apps.md)
4. [technique/mode-custom-app.md](./technique/mode-custom-app.md)
5. [technique/socle/README.md](./technique/socle/README.md)

### Modifier la vérité canonique

- [_spec/README.md](./_spec/README.md)
- [_spec/GENERATION.md](./_spec/GENERATION.md)
- [_spec/AUDIT.md](./_spec/AUDIT.md)

### Pilotage interne

- [interne/README.md](./interne/README.md)
- [interne/archives/2026-03-06-migration-arborescence-documentaire.md](./interne/archives/2026-03-06-migration-arborescence-documentaire.md)

## Règles de navigation

- Il n'y a plus de série numérotée active au niveau racine de `Docs/`.
- Les fichiers historiques ont été reclassés par rôle métier et technique.
- Les documents datés vivent dans `Docs/interne/roadmap`, `Docs/interne/audits` ou `Docs/interne/archives`.
- `_spec` n'est pas un guide de lecture produit: c'est la couche canonique.
