# ROADMAP_V1_CLOSURE.md

## Objet

Clôture du roadmap fondateur Site Factory v1.

## Référence

Ce document clôt le roadmap fondateur Site Factory :

- phases 1 à 8
- définition de réussite
- résultat cible

Référence principale :

- `Docs/interne/fondations/ROADMAP_SITE_FACTORY.md`

## État global

- Phase 1 — verrouiller le modèle canonique d’entrée : **OK**
- Phase 2 — expliciter `deliveryModel` et `mutualizationLevel` : **OK**
- Phase 3 — sortir les règles structurantes du runtime legacy : **OK**
- Phase 4 — clarifier les sorties du moteur : **OK**
- Phase 5 — faire du wizard un consommateur du domaine : **OK**
- Phase 6 — fiabiliser la génération de projet : **OK**
- Phase 7 — préparer la standardisation et les trajectoires opérées : **OK**
- Phase 8 — renforcer les tests et garde-fous : **OK**

## Contrats désormais considérés comme stables

Les contrats suivants sont désormais des sorties structurantes du système et ne doivent plus être modifiés sans migration explicite, adaptation des consommateurs, et couverture de tests correspondante :

- `CanonicalProjectInputDraft`
- `CanonicalDecisionOutput`
- `ProjectManifestDraft`
- `GenerationPlan`
- `GenerationArtifactDraft`
- `ExportBundleDraft`
- `ExportPackageDraft`
- `ExportRegistryDraft`
- `StandardizationAssessment`
- `StandardizationExplanation`

## Invariants à ne pas casser sans migration explicite

- le besoin précède la stack
- `deliveryModel` et `mutualizationLevel` sont de premier rang
- la technique est une sortie mappée, pas l’identité du projet
- l’UI consomme le domaine et ne porte pas seule la logique métier
- la génération reste cohérente avec la décision et le manifest
- les trajectoires custom / standardisé / opéré restent explicites et testables
- la mutualisation reste une décision de domaine, pas un effet secondaire d’implémentation
- les sorties d’export restent lisibles, déterministes et traçables

## Acquis structurants du roadmap v1

### Domaine

- entrée canonique explicite
- moteur de décision explicite
- qualification de standardisation et d’opérabilité explicite
- sorties de décision lisibles et testées

### Génération

- manifest projet structuré
- plan de génération explicite
- artefact de génération enrichi
- bundle d’export, package d’export et registre d’exports

### Fiabilité

- scénarios métier canoniques couverts
- cohérence domaine → génération couverte
- cohérence export → package → registry couverte
- invariants de mapping critiques couverts
- garde-fous de dérive inter-couches couverts
- audit de couverture de phase 8 présent

## Reste ouvert mais non bloquant

Les éléments suivants restent ouverts, mais ne bloquent pas la clôture du roadmap v1 :

- consommation plus large des sorties explicatives de standardisation par les consommateurs aval
- enrichissement futur du catalogue d’implémentations avec d’autres stacks
- industrialisation opérationnelle supplémentaire autour des exports et usages internes
- backlog DX / QA / outillage au-delà du socle actuel

## Ce qui n’appartient plus au roadmap fondateur

Les éléments suivants relèvent désormais d’un backlog post-roadmap, et non d’une réouverture des fondations :

- nouvelles stacks
- nouvelles variantes d’implémentation
- industrialisation produit plus poussée
- packaging opérationnel avancé
- outillage interne complémentaire
- améliorations UX non structurantes pour le domaine

## Décision

Le **roadmap fondateur Site Factory v1 est considéré comme clôturé**.

Le projet dispose maintenant :

- d’un modèle canonique d’entrée explicite
- d’un moteur de décision explicite
- d’un catalogue de sorties techniques et de génération cohérent
- d’une chaîne domaine → manifest → génération → export structurée
- d’un niveau de garde-fous suffisant pour considérer le socle v1 comme stabilisé

La suite doit désormais être pilotée via un **backlog post-roadmap** séparé des fondations.
