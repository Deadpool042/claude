export const SPEC_FILES = [
  "cms.json",
  "features.json",
  "plugins.json",
  "modules.json",
  "capability-matrix.json",
  "decision-rules.json",
  "commercial.json",
  "custom-stacks.json",
  "stack-profiles.json",
  "shared-socle.json",
  "infra-services.json",
] as const;

export type SpecFileName = (typeof SPEC_FILES)[number];

export const SPEC_FILE_LABELS: Record<SpecFileName, string> = {
  "cms.json": "CMS disponibles",
  "features.json": "Fonctionnalités",
  "plugins.json": "Plugins recommandés",
  "modules.json": "Modules framework",
  "capability-matrix.json": "Matrice de capacités",
  "decision-rules.json": "Règles de décision",
  "commercial.json": "Données commerciales",
  "custom-stacks.json": "Stacks sur mesure",
  "stack-profiles.json": "Profils de stack",
  "shared-socle.json": "Socle partagé",
  "infra-services.json": "Services d'infrastructure",
};

const SPEC_FILE_SET = new Set<SpecFileName>(SPEC_FILES);

export function isSpecFileName(name: string): name is SpecFileName {
  return SPEC_FILE_SET.has(name as SpecFileName);
}
