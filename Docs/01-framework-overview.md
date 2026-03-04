# 01 — Vue d’ensemble du framework

## Sommaire

- [Contrat spec-first](#contrat-spec-first)
- [Objets canoniques](#objets-canoniques)
- [Pipeline cible](#pipeline-cible)
- [Workflow équipe](#workflow-équipe)

## Contrat spec-first

La logique exécutable vit uniquement dans `Docs/_spec/*.json`. Les fichiers Markdown sont des vues de lecture et ne doivent pas devenir une seconde source de vérité.

## Objets canoniques

- [cms.json](./_spec/cms.json)
- [features.json](./_spec/features.json)
- [plugins.json](./_spec/plugins.json)
- [modules.json](./_spec/modules.json)
- [decision-rules.json](./_spec/decision-rules.json)
- [commercial.json](./_spec/commercial.json)
- [custom-stacks.json](./_spec/custom-stacks.json)

## Pipeline cible

Le pipeline de sortie est défini par `decisionOutputPipeline` dans [decision-rules.json](./_spec/decision-rules.json) :

`project_requirements` → `recommended_CMS` → `recommended_plugins` → `activated_modules` → `recommended_content_workflow` → `recommended_stack_profile` → `technical_stack` → `estimated_cost`

## Workflow équipe

1. Modifier `Docs/_spec/*.json`.
2. Synchroniser avec `pnpm spec:sync`.
3. Vérifier `pnpm spec:check`.
4. Valider avec `pnpm validate`.

## Navigation

- Suivant: [02-supported-cms.md](./02-supported-cms.md)
