# Vision produit

## Positionnement

Site Factory est une plateforme de pilotage de projet digital qui couvre trois fonctions:

1. Cadrer un besoin client de facon exploitable.
2. Recommander un mode de production adapte.
3. Produire un projet avec un niveau de qualite et de cout explicite.

La promesse n'est pas "choisir un stack", mais "choisir la bonne strategie de production".

## Probleme resolu

Sans cadre commun, les decisions sont souvent prises dans le mauvais ordre:

- stack choisi trop tot,
- features negociees sans cadre de faisabilite,
- budget estime sans regles explicites,
- documentation dispersee entre narratif et logique executable.

Site Factory reduit ce risque en imposant un ordre de decision stable.

## Ordre de decision produit

1. Besoin client et contraintes projet.
2. Famille de projet.
3. Mode de production recommande (`CMS_NATIVE`, `PLUGIN_INTEGRATION`, `FRAMEWORK_MODULE`, `CUSTOM_APP`, `THEME_FEATURE`).
4. Choix d'implementation (CMS, stack, hosting, outillage).
5. Chiffrage et trajectoire de delivery.

## Ce que Site Factory n'est pas

- Un simple comparateur de CMS.
- Un catalogue de stacks sans logique metier.
- Une documentation marketing de promesses vagues.

## Existant

- Le socle spec-first est en place et valide par audit.
- Le moteur et la qualification live sont operationnels.
- La lisibilite produit reste heterogene car le vocabulaire historique runtime et le vocabulaire cible ne sont pas encore completement alignes.

## Cible

- Lire Site Factory d'abord comme produit de cadrage/recommandation/production.
- Assumer une taxonomie projet stable et explicite pour l'avant-vente, la qualification et le delivery.
- Garder `_spec` comme reference canonique et traiter le reste comme derive.

## Roadmap (post phase 1)

- Aligner progressivement les libelles applicatifs avec la taxonomie cible.
- Rationaliser les docs techniques historiques autour du nouveau parcours de lecture.
- Finaliser l'alignement entre langage commercial, qualification runtime et nomenclature UI.

## Liens

- Suivant: [positionnement-offres.md](./positionnement-offres.md)
- Canonique: [../_spec/README.md](../_spec/README.md)
