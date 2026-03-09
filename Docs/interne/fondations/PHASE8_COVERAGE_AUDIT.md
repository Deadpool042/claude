# PHASE8_COVERAGE_AUDIT.md

## Objet

Audit de couverture de la phase 8 du roadmap Site Factory.

## Référence roadmap

La phase 8 demande :

- tests métier
- tests de règles
- tests de mappings
- tests de génération
- contrôle de dérive entre référentiel, moteur et runtime

Priorités explicites :

- modèle canonique
- moteur de décision
- règles de compatibilité
- exclusions
- delivery model
- mutualization level
- stratégies d’implémentation
- génération de projet

Scénarios complets attendus :

- projet custom livré
- projet custom managé
- offre standardisée managée
- projet éditorial Next.js + MDX
- projet non mutualisable
- cas compatible produit opéré

## Méthode d’audit

Pour chaque exigence roadmap :

- identifier les fichiers de tests du repo qui la couvrent
- qualifier la couverture : COUVERT / PARTIEL / MANQUANT
- noter les remarques éventuelles

---

## 1. Tests métier

### 1.1 Trajectoires métier canoniques

Statut : COUVERT

Fichiers :

- `src/tests/combos/canonical-trajectories.test.ts`
- `src/tests/combos/standardization-flow.test.ts`

Remarques :

- couvre custom livré
- couvre custom managé
- couvre standardisé managé
- couvre non mutualisable
- couvre cas opérable

### 1.2 Décision + standardization + explanation

Statut : COUVERT

Fichiers :

- `src/lib/domain/standardization-engine.test.ts`
- `src/lib/domain/standardization-explanation.test.ts`
- `src/tests/combos/standardization-flow.test.ts`

---

## 2. Tests de règles

### 2.1 Règles de catégorisation / floors / contraintes

Statut : COUVERT

Fichiers :

- `src/lib/services/qualification/category-rules.test.ts`
- `src/tests/combos/qualification.test.ts`

### 2.2 Compatibilités / exclusions

Statut : COUVERT ou PARTIEL
Fichiers :

- `src/tests/combos/final-guardrails-phase8.test.ts`
- `src/tests/combos/implementation-live-eligibility.test.ts`
- `src/tests/combos/service-defaults.test.ts`

Remarques :

- préciser si toutes les exclusions critiques sont bien couvertes
- noter les exclusions encore implicites s’il en reste

---

## 3. Tests de mappings

### 3.1 deliveryModel / mutualizationLevel

Statut : COUVERT

Fichiers :

- `src/tests/combos/mapping-invariants.test.ts`
- `src/tests/combos/canonical-trajectories.test.ts`
- `src/tests/combos/drift-guardrails.test.ts`

### 3.2 technicalProfile / implementationStrategy / generatorKey

Statut : COUVERT

Fichiers :

- `src/lib/domain/canonical-decision-mapping.test.ts`
- `src/lib/generation/manifest-adapter.test.ts`
- `src/tests/combos/mapping-invariants.test.ts`

---

## 4. Tests de génération

### 4.1 Domaine → génération

Statut : COUVERT

Fichiers :

- `src/tests/combos/generation-consistency.test.ts`
- `src/lib/generation/generators/router.test.ts`

### 4.2 Export / package / registry

Statut : COUVERT

Fichiers :

- `src/lib/generation/artifact-export.test.ts`
- `src/lib/generation/artifact-writer.test.ts`
- `src/lib/generation/export-layout.test.ts`
- `src/lib/generation/export-package.test.ts`
- `src/lib/generation/export-package-writer.test.ts`
- `src/lib/generation/export-registry.test.ts`
- `src/lib/generation/export-registry-writer.test.ts`
- `src/tests/combos/export-pipeline-consistency.test.ts`

---

## 5. Contrôle de dérive entre référentiel, moteur et runtime

Statut : COUVERT

Fichiers :

- `src/tests/combos/drift-guardrails.test.ts`
- `src/tests/combos/generation-consistency.test.ts`
- `src/tests/combos/export-pipeline-consistency.test.ts`

Remarques :

- couvre la cohérence inter-couches domaine → génération → export
- couvre la stabilité des métadonnées jusqu’au registry

---

## 6. Priorités explicites roadmap

| Priorité roadmap            | Statut          | Fichiers principaux                                                                                            |
| --------------------------- | --------------- | -------------------------------------------------------------------------------------------------------------- |
| modèle canonique            | COUVERT         | `src/lib/domain/canonical-input.test.ts`, `src/tests/combos/final-guardrails-phase8.test.ts`                   |
| moteur de décision          | COUVERT         | `src/lib/domain/decision-engine.test.ts`, `src/lib/domain/canonical-decision-mapping.test.ts`                  |
| règles de compatibilité     | COUVERT/PARTIEL | `src/tests/combos/final-guardrails-phase8.test.ts`, `src/tests/combos/implementation-live-eligibility.test.ts` |
| exclusions                  | COUVERT/PARTIEL | `src/tests/combos/final-guardrails-phase8.test.ts`                                                             |
| delivery model              | COUVERT         | `src/tests/combos/mapping-invariants.test.ts`, `src/tests/combos/canonical-trajectories.test.ts`               |
| mutualization level         | COUVERT         | `src/tests/combos/mapping-invariants.test.ts`, `src/tests/combos/drift-guardrails.test.ts`                     |
| stratégies d’implémentation | COUVERT         | `src/lib/domain/canonical-decision-mapping.test.ts`, `src/tests/combos/canonical-trajectories.test.ts`         |
| génération de projet        | COUVERT         | `src/tests/combos/generation-consistency.test.ts`, `src/tests/combos/export-pipeline-consistency.test.ts`      |

---

## 7. Conclusion

### État global

- phase 8 : COUVERT MAJORITAIREMENT / CLÔTURABLE / NON CLÔTURABLE

### Trous résiduels

- lister ici uniquement les trous réellement observés dans le repo
- ne pas inventer de manque théorique

### Recommandation

- soit : phase 8 considérée comme clôturable
- soit : ajouter un micro-lot correctif ciblé avant clôture
