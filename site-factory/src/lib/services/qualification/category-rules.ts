import {
  CONSTRAINT_MIN_CATEGORY_INDEX,
  categoryIndex,
  getStackProfileFromLegacy,
  indexToCategory,
  maxCategory,
  type Category,
  type LegacyTechStack,
  type ProjectConstraints,
  type ProjectType,
} from "@/lib/referential";

export interface CategoryRuleInput {
  projectType: ProjectType;
  techStack: LegacyTechStack;
  wpHeadless: boolean;
  constraints: Partial<ProjectConstraints> | undefined;
}

export interface CategoryRuleResult {
  initialCategory: Category;
  categoryAfterBaseRules: Category;
  categoryAfterConstraintRules: Category;
  stackFloorCategory: Category;
  finalCategoryBeforeModules: Category;
}

const INITIAL_CATEGORY_BY_PROJECT_TYPE: Record<ProjectType, Category> = {
  BLOG: "CAT0",
  VITRINE: "CAT0",
  ECOM: "CAT2",
  APP: "CAT2",
};

function applyBaseCategoryRules(
  initialCategory: Category,
  input: CategoryRuleInput,
): Category {
  let category = initialCategory;

  if (input.projectType === "ECOM" && input.techStack !== "WORDPRESS") {
    category = maxCategory(category, "CAT3");
  }

  if (input.projectType === "ECOM") {
    category = maxCategory(category, "CAT2");
  }

  if (input.projectType === "APP") {
    category = maxCategory(category, "CAT2");
  }

  if (input.techStack === "WORDPRESS" && input.wpHeadless) {
    category = maxCategory(category, "CAT3");
  }

  return category;
}

function applyConstraintCategoryRules(
  currentCategory: Category,
  constraints: Partial<ProjectConstraints> | undefined,
): Category {
  if (!constraints) {
    return currentCategory;
  }

  let category = currentCategory;

  if (constraints.trafficLevel) {
    const minTier =
      CONSTRAINT_MIN_CATEGORY_INDEX.trafficLevel[constraints.trafficLevel];
    category = maxCategory(category, indexToCategory(minTier));
  }

  if (constraints.productCount) {
    const minTier =
      CONSTRAINT_MIN_CATEGORY_INDEX.productCount[constraints.productCount];
    category = maxCategory(category, indexToCategory(minTier));
  }

  if (constraints.dataSensitivity) {
    const minTier =
      CONSTRAINT_MIN_CATEGORY_INDEX.dataSensitivity[
        constraints.dataSensitivity
      ];
    category = maxCategory(category, indexToCategory(minTier));
  }

  if (constraints.scalabilityLevel) {
    const minTier =
      CONSTRAINT_MIN_CATEGORY_INDEX.scalabilityLevel[
        constraints.scalabilityLevel
      ];
    category = maxCategory(category, indexToCategory(minTier));
  }

  return category;
}

function getStackFloorCategory(input: CategoryRuleInput): Category {
  const stackProfile = getStackProfileFromLegacy(
    input.techStack,
    input.projectType,
    input.wpHeadless,
  );

  const orderedCategories: Category[] = ["CAT0", "CAT1", "CAT2", "CAT3", "CAT4"];

  return orderedCategories[Math.min(stackProfile.maintenanceFloorIndex, 4)];
}

export function resolveBaseCategoryRules(
  input: CategoryRuleInput,
): CategoryRuleResult {
  const initialCategory = INITIAL_CATEGORY_BY_PROJECT_TYPE[input.projectType];
  const categoryAfterBaseRules = applyBaseCategoryRules(initialCategory, input);
  const categoryAfterConstraintRules = applyConstraintCategoryRules(
    categoryAfterBaseRules,
    input.constraints,
  );
  const stackFloorCategory = getStackFloorCategory(input);

  const finalCategoryBeforeModules =
    categoryIndex(stackFloorCategory) > categoryIndex(categoryAfterConstraintRules)
      ? stackFloorCategory
      : categoryAfterConstraintRules;

  return {
    initialCategory,
    categoryAfterBaseRules,
    categoryAfterConstraintRules,
    stackFloorCategory,
    finalCategoryBeforeModules,
  };
}