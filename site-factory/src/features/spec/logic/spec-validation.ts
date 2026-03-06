import { z } from "zod";
import {
  capabilityMatrixSpecSchema,
  cmsSpecSchema,
  commercialSpecSchema,
  customStacksSpecSchema,
  decisionRulesSpecSchema,
  featuresSpecSchema,
  infraServicesSpecSchema,
  modulesSpecSchema,
  pluginsSpecSchema,
  stackProfilesSpecSchema,
  type FeaturesSpec,
  type ModulesSpec,
} from "@/lib/referential/spec/schema";

const sharedSocleSpecSchema = z
  .object({
    version: z.string().min(1),
  })
  .passthrough();

const SPEC_SCHEMAS = {
  "cms.json": cmsSpecSchema,
  "features.json": featuresSpecSchema,
  "plugins.json": pluginsSpecSchema,
  "modules.json": modulesSpecSchema,
  "capability-matrix.json": capabilityMatrixSpecSchema,
  "decision-rules.json": decisionRulesSpecSchema,
  "commercial.json": commercialSpecSchema,
  "custom-stacks.json": customStacksSpecSchema,
  "stack-profiles.json": stackProfilesSpecSchema,
  "shared-socle.json": sharedSocleSpecSchema,
  "infra-services.json": infraServicesSpecSchema,
} as const;

export type SpecFileName = keyof typeof SPEC_SCHEMAS;

export interface SpecValidationIssue {
  path: string;
  message: string;
}

export interface SpecValidationResult {
  ok: boolean;
  issues: SpecValidationIssue[];
}

export interface SpecValidationContext {
  features?: FeaturesSpec;
  modules?: ModulesSpec;
}

function formatPath(path: Array<string | number>): string {
  if (!path.length) return "root";
  return path.reduce<string>((acc, part) => {
    if (typeof part === "number") return `${acc}[${part}]`;
    return acc ? `${acc}.${part}` : part;
  }, "");
}

function addZodIssues(
  issues: SpecValidationIssue[],
  error: z.ZodError,
) {
  for (const issue of error.issues) {
    issues.push({
      path: formatPath(issue.path),
      message: issue.message,
    });
  }
}

function addDuplicateIdIssues(
  issues: SpecValidationIssue[],
  items: Array<Record<string, unknown>>,
  idKey: string,
  pathPrefix: string,
) {
  const seen = new Map<string, number>();
  items.forEach((item, idx) => {
    const raw = item[idKey];
    if (typeof raw !== "string") return;
    if (seen.has(raw)) {
      issues.push({
        path: `${pathPrefix}[${idx}].${idKey}`,
        message: `ID duplique: ${raw} (deja vu en index ${seen.get(raw)})`,
      });
    } else {
      seen.set(raw, idx);
    }
  });
}

function addMissingFeatureIssues(
  issues: SpecValidationIssue[],
  featureIds: Set<string>,
  features: string[],
  pathPrefix: string,
) {
  features.forEach((featureId, idx) => {
    if (!featureIds.has(featureId)) {
      issues.push({
        path: `${pathPrefix}[${idx}]`,
        message: `Feature inconnue: ${featureId}`,
      });
    }
  });
}

function validateFeatureDependencies(
  issues: SpecValidationIssue[],
  featuresSpec: FeaturesSpec,
) {
  const featureIds = new Set(featuresSpec.features.map((f) => f.id));
  featuresSpec.features.forEach((feature, idx) => {
    const deps = feature.dependencies ?? [];
    deps.forEach((dep, depIdx) => {
      if (!featureIds.has(dep)) {
        issues.push({
          path: `features[${idx}].dependencies[${depIdx}]`,
          message: `Dependance inconnue: ${dep}`,
        });
      }
    });
  });
}

function validateModulesFeatureRefs(
  issues: SpecValidationIssue[],
  modulesSpec: ModulesSpec,
  featuresSpec: FeaturesSpec,
) {
  const featureIds = new Set(featuresSpec.features.map((f) => f.id));
  modulesSpec.modules.forEach((mod, idx) => {
    addMissingFeatureIssues(
      issues,
      featureIds,
      mod.featureIds,
      `modules[${idx}].featureIds`,
    );
  });
}

function addMatrixRowDuplicates(
  issues: SpecValidationIssue[],
  rows: Array<{ cmsId: string }>,
  pathPrefix: string,
) {
  const seen = new Map<string, number>();
  rows.forEach((row, idx) => {
    const cmsId = row.cmsId;
    if (seen.has(cmsId)) {
      issues.push({
        path: `${pathPrefix}[${idx}].cmsId`,
        message: `cmsId duplique: ${cmsId} (deja vu en index ${seen.get(cmsId)})`,
      });
    } else {
      seen.set(cmsId, idx);
    }
  });
}

export function validateSpecContent(
  specFile: string,
  content: unknown,
  context: SpecValidationContext = {},
): SpecValidationResult {
  const issues: SpecValidationIssue[] = [];
  const schema = SPEC_SCHEMAS[specFile as SpecFileName];
  if (!schema) {
    return { ok: true, issues };
  }

  const parsed = schema.safeParse(content);
  if (!parsed.success) {
    addZodIssues(issues, parsed.error);
    return { ok: false, issues };
  }

  switch (specFile) {
    case "cms.json": {
      const cmsSpec = parsed.data as z.infer<typeof cmsSpecSchema>;
      addDuplicateIdIssues(issues, cmsSpec.cms, "id", "cms");
      break;
    }
    case "features.json": {
      const featuresSpec = parsed.data as FeaturesSpec;
      addDuplicateIdIssues(issues, featuresSpec.features, "id", "features");
      validateFeatureDependencies(issues, featuresSpec);
      if (context.modules) {
        validateModulesFeatureRefs(issues, context.modules, featuresSpec);
      }
      break;
    }
    case "plugins.json": {
      const pluginsSpec = parsed.data as z.infer<typeof pluginsSpecSchema>;
      addDuplicateIdIssues(issues, pluginsSpec.plugins, "id", "plugins");
      break;
    }
    case "modules.json": {
      const modulesSpec = parsed.data as ModulesSpec;
      addDuplicateIdIssues(issues, modulesSpec.modules, "id", "modules");
      if (context.features) {
        validateModulesFeatureRefs(issues, modulesSpec, context.features);
      }
      break;
    }
    case "capability-matrix.json": {
      const matrixSpec = parsed.data as z.infer<typeof capabilityMatrixSpecSchema>;
      addDuplicateIdIssues(issues, matrixSpec.matrix, "featureId", "matrix");
      matrixSpec.matrix.forEach((entry, idx) => {
        addMatrixRowDuplicates(issues, entry.rows, `matrix[${idx}].rows`);
      });
      break;
    }
    case "decision-rules.json": {
      const rulesSpec = parsed.data as z.infer<typeof decisionRulesSpecSchema>;
      addDuplicateIdIssues(issues, rulesSpec.matrix, "featureId", "matrix");
      rulesSpec.matrix.forEach((entry, idx) => {
        addMatrixRowDuplicates(issues, entry.rows, `matrix[${idx}].rows`);
      });
      break;
    }
    case "custom-stacks.json": {
      const customStacksSpec = parsed.data as z.infer<typeof customStacksSpecSchema>;
      addDuplicateIdIssues(issues, customStacksSpec.profiles, "id", "profiles");
      break;
    }
    case "stack-profiles.json": {
      const stackProfilesSpec = parsed.data as z.infer<typeof stackProfilesSpecSchema>;
      addDuplicateIdIssues(issues, stackProfilesSpec.families, "id", "families");
      addDuplicateIdIssues(issues, stackProfilesSpec.profiles, "id", "profiles");
      break;
    }
    case "infra-services.json": {
      const infraServicesSpec = parsed.data as z.infer<typeof infraServicesSpecSchema>;
      addDuplicateIdIssues(issues, infraServicesSpec.categories, "id", "categories");
      addDuplicateIdIssues(issues, infraServicesSpec.services, "id", "services");
      break;
    }
    default:
      break;
  }

  return { ok: issues.length === 0, issues };
}

export function formatSpecValidationIssues(
  issues: SpecValidationIssue[],
  max = 6,
): string {
  if (!issues.length) return "";
  const lines = issues.slice(0, max).map((issue) => {
    const path = issue.path || "root";
    return `- ${path}: ${issue.message}`;
  });
  if (issues.length > max) {
    lines.push(`- ...${issues.length - max} autres`);
  }
  return `Spec invalide:\n${lines.join("\n")}`;
}
