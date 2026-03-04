import type {
  LegacyTechStack as TechStack,
  ModuleDef,
  ProjectType,
  Category,
} from "@/lib/referential";
import type { ModuleCatSelection } from "@/lib/qualification-runtime";

export function resolveModulePrice(
  mod: ModuleDef,
  _projectType: ProjectType,
  techStack: TechStack,
  wpHeadless: boolean,
  tierSelection?: ModuleCatSelection,
  backendMultiplier = 1,
): { setup: number; setupMax: number | null; isCustom: boolean } {
  const isWP = techStack === "WORDPRESS" && !wpHeadless;
  const multiplier = (isWP ? 1.0 : mod.jsMultiplier) * backendMultiplier;

  if (tierSelection?.setupCatId && mod.setupCats) {
    const tier = mod.setupCats.find((t) => t.id === tierSelection.setupCatId);
    if (tier) {
      return {
        setup: Math.round(tier.priceSetup * multiplier),
        setupMax: null,
        isCustom: false,
      };
    }
  }

  return {
    setup: Math.round(mod.priceSetup * multiplier),
    setupMax:
      mod.priceSetupMax != null
        ? Math.round(mod.priceSetupMax * multiplier)
        : null,
    isCustom: false,
  };
}

export function resolveModuleMonthly(
  mod: ModuleDef,
  tierSelection?: ModuleCatSelection,
): number {
  if (tierSelection?.subCatId && mod.subscriptionCats) {
    const tier = mod.subscriptionCats.find((t) => t.id === tierSelection.subCatId);
    if (tier) return tier.priceMonthly;
  }
  return mod.priceMonthly;
}

export function resolveModuleRequalification(
  mod: ModuleDef,
  tierSelection?: ModuleCatSelection,
): Category | null {
  if (tierSelection?.setupCatId && mod.setupCats) {
    const tier = mod.setupCats.find((t) => t.id === tierSelection.setupCatId);
    if (tier) return (tier.requalifiesTo as Category) ?? mod.requalifiesTo;
  }
  return mod.requalifiesTo;
}