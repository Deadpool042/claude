# Prompts (PromptSpec)

Docs/interne/prompts est le point unique pour les prompts du projet.

## Format PromptSpec (minimal)

Chaque prompt est un fichier Markdown avec un frontmatter YAML. Les champs sont obligatoires :

- id
- title
- purpose
- inputs
- output_format
- constraints
- version
- tags

### Exemple

```md
---
id: prompt.example
title: Example prompt
purpose: Decrire le but principal du prompt.
inputs:
  - name: target
    type: string
    description: Cible ou objet principal.
    required: true
output_format: "markdown"
constraints:
  - "Docs/_spec est la source de verite"
  - "Separation logique/UI"
version: "1.0.0"
tags: ["spec", "docs"]
---

<Prompt content ici>
```

## Compatibilite

- Le corps du prompt reste identique : seule l'enveloppe PromptSpec est ajoutee.
- Les prompts existants hors de Docs/interne/prompts peuvent rester en place tant qu'ils ne sont pas migres.

## Inventaire

- Aucun prompt existant trouve dans le repo a ce stade.
