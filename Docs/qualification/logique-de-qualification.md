# Logique de qualification

## But

Qualifier un projet consiste a transformer un besoin client en recommandation exploitable:

- famille de projet,
- mode de production,
- options d'implementation,
- impact economique.

## Entrees de qualification

Les entrees se lisent en 4 blocs:

1. Besoin fonctionnel (objectif, usages, priorites).
2. Contraintes projet (delais, equipe, exploitation, conformite, risques).
3. Contexte technique (legacy, hebergement, integrations, autonomie client).
4. Parametres economiques (budget setup, budget recurrent, cout d'exploitation).

## Pipeline de qualification (lecture produit)

1. Determiner la famille cible (`SITE_VITRINE`, `SITE_BUSINESS`, `ECOMMERCE`, `MVP_SAAS`, `APP_METIER`).
2. Determiner le mode de production principal via les regles canoniques (`CMS_NATIVE`, `PLUGIN_INTEGRATION`, `FRAMEWORK_MODULE`, `CUSTOM_APP`, `THEME_FEATURE`).
3. Determiner l'implementation la plus adaptee (CMS/stack/hosting) en respectant les contraintes.
4. Determiner l'impact categorie/cout/maintenance avec les regles de qualification.

## Existant (etat valide)

- Qualification runtime stable et testee.
- Normalisation wizard appliquee (intersection type projet x hosting x famille technique).
- Requalification categorie active (contraintes, CI, floor de stack, modules structurants).
- Chiffrage derive du referentiel et des regles economiques.

## Cible documentaire

La qualification doit etre lisible en langage produit:

- le "pourquoi" de la famille recommandee,
- le "pourquoi" du mode de production recommande,
- le "comment" d'implementation en consequence,
- le "combien" avec hypotheses explicites.

## Regles de gouvernance

- Les regles metier canoniques vivent dans `Docs/_spec`.
- Le miroir runtime est derive de `_spec`.
- `site-factory/src/lib/offers` consomme ces regles pour l'application; il ne remplace pas la source canonique.
- Les docs markdown de qualification expliquent la logique; elles ne portent pas la logique executable.

## Roadmap (post phase 1)

- Aligner les ecrans de qualification avec la taxonomie cible (sans casser les flux existants).
- Rendre visible dans l'UI la chaine complete: besoin -> famille -> mode -> implementation -> cout.
- Simplifier le vocabulaire runtime historique pour converger vers le vocabulaire produit cible.

## Liens

- Precedent: [../produit/taxonomie-projets.md](../produit/taxonomie-projets.md)
- Canonique: [../_spec/README.md](../_spec/README.md)
- Recommandation detaillee: [../recommandation/moteur-de-decision.md](../recommandation/moteur-de-decision.md)
