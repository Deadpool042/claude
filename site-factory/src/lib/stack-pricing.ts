import { getComplexityFactor, type LegacyTechStack, type ProjectType } from "@/lib/referential";

export function computeStackMultiplier(
  projectType: ProjectType,
  techStack: LegacyTechStack,
  wpHeadless = false,
): number {
  return getComplexityFactor(techStack, projectType, wpHeadless);
}

export function getMultiplierLabel(
  projectType: ProjectType,
  techStack: LegacyTechStack,
  wpHeadless = false,
): string {
  const multiplier = computeStackMultiplier(projectType, techStack, wpHeadless);
  if (multiplier === 1) return "";
  return `×${multiplier.toFixed(multiplier % 1 === 0 ? 1 : 3).replace(/\.?0+$/, "")}`;
}