"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";

import { createProjectSchema } from "@/lib/validators/project";
import { generateSlug } from "@/lib/slug";
import { findNextAvailablePort, isPortInUse } from "@/lib/port";
import {
  getMandatoryModules,
  isModuleCompatible,
  type ModuleId,
  type Stack as OfferStack,
} from "@/lib/offers/offers";

import {
  buildProjectCreateArgs,
  type CreatedProject,
} from "@/lib/projects/buildProjectCreateArgs";

import { generateProjectInfra } from "@/lib/projects/generateProjectInfra";
import {
  getOfferStackForProject,
  normalizeModuleIds,
  qualifyProject,
  type DeployTarget,
  type ModuleTierSelection,
  type ProjectType,
  type TechStack,
} from "@/lib/qualification";
import { DEFAULT_CONSTRAINTS, type ProjectConstraints } from "@/lib/referential";
import { deriveOfferProjectType, deriveQualificationProjectType } from "@/lib/wizard-domain";
import {
  buildWpSetupOptionsFromConfig,
  generateProjectWpDevAssets,
} from "@/lib/projects/generateProjectWpDevAssets";
import { generateProjectWpThemeAssets } from "@/lib/projects/generateProjectWpThemeAssets";
import { buildProjectDocIds, buildProjectDocRows } from "@/lib/docs/project-docs";

interface ActionState {
  error: string | null;
}

function getStr(fd: FormData, key: string): string | undefined {
  const v = fd.get(key);
  if (typeof v !== "string") return undefined;
  const s = v.trim();
  return s === "" ? undefined : s;
}

function getBool(fd: FormData, key: string): boolean | undefined {
  const v = fd.get(key);
  if (v == null) return undefined;
  return v === "true";
}

function parseModuleIds(value?: string): ModuleId[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return normalizeModuleIds(parsed.map((id) => String(id))) as ModuleId[];
  } catch {
    return [];
  }
}

function parseTierSelections(
  value?: string,
): Record<string, ModuleTierSelection> {
  if (!value) return {};
  try {
    const parsed = JSON.parse(value);
    if (!parsed || typeof parsed !== "object") return {};
    return parsed as Record<string, ModuleTierSelection>;
  } catch {
    return {};
  }
}

function resolveEstimatedBudget(total: { priceFrom: number; priceTo?: number } | null): number | undefined {
  if (!total) return undefined;
  const priceTo = total.priceTo ?? total.priceFrom;
  return Math.round((total.priceFrom + priceTo) / 2);
}

export async function createProjectAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const portStr = getStr(formData, "port"); // "3001" | undefined

  const raw = {
    name: getStr(formData, "name"),
    clientId: getStr(formData, "clientId"),
    type: getStr(formData, "type") ?? "VITRINE",
    devMode: getStr(formData, "devMode") ?? "DEV_COMFORT",

    description: getStr(formData, "description"),
    domain: (formData.get("domain") ?? null), // <- laisse Zod gérer ""/trim/null
    gitRepo: getStr(formData, "gitRepo"),

    techStack: getStr(formData, "techStack"),
    deployTarget: getStr(formData, "deployTarget") ?? "DOCKER",
    hostingTarget: getStr(formData, "hostingTarget"),
    hostingTargetBack: getStr(formData, "hostingTargetBack"),
    hostingTargetFront: getStr(formData, "hostingTargetFront"),
    projectFamily: getStr(formData, "projectFamily"),
    projectImplementation: getStr(formData, "projectImplementation"),
    projectImplementationLabel: getStr(formData, "projectImplementationLabel"),
    projectFrontendImplementation: getStr(formData, "projectFrontendImplementation"),
    projectFrontendImplementationLabel: getStr(formData, "projectFrontendImplementationLabel"),
    hostingProviderId: getStr(formData, "hostingProviderId"),
    category: getStr(formData, "category"), // si tu as le fix enum "" ci-dessus, tu peux passer formData.get

    runtime: {
      port: portStr ? Number(portStr) : null,
      localHost: null,
    },

    qualification: {
      modules: getStr(formData, "modules"),
      maintenanceLevel: getStr(formData, "maintenanceLevel"),
      estimatedBudget: getStr(formData, "estimatedBudget")
        ? Number(getStr(formData, "estimatedBudget"))
        : undefined,
      trafficLevel: getStr(formData, "trafficLevel"),
      productCount: getStr(formData, "productCount"),
      dataSensitivity: getStr(formData, "dataSensitivity"),
      scalabilityLevel: getStr(formData, "scalabilityLevel"),
      needsEditing: getBool(formData, "needsEditing"),
      editingFrequency: getStr(formData, "editingFrequency"),
      headlessRequired: getBool(formData, "headlessRequired"),
      commerceModel: getStr(formData, "commerceModel"),
      backendMode: getStr(formData, "backendMode"),
      backendFamily: getStr(formData, "backendFamily"),
      backendOpsHeavy: getBool(formData, "backendOpsHeavy"),
    },
  };


  const parsed = createProjectSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Données invalides" };
  }

  const resolvedTechStack = parsed.data.techStack as TechStack | undefined;
  const wpHeadless = formData.get("wpHeadless") === "true";
  let resolvedCategory = parsed.data.category ?? undefined;
  let estimatedBudget = parsed.data.qualification?.estimatedBudget;
  let modulesJson = parsed.data.qualification?.modules ?? null;
  let resolvedMaintenanceLevel = parsed.data.qualification?.maintenanceLevel ?? undefined;
  let ciScore = parsed.data.qualification?.ciScore ?? undefined;
  let ciCategory = parsed.data.qualification?.ciCategory ?? undefined;
  let ciAxesJson = parsed.data.qualification?.ciAxesJson ?? undefined;

  if (resolvedTechStack) {
    const selectedModuleIds = parseModuleIds(parsed.data.qualification?.modules);
    const tierSelections = parseTierSelections(getStr(formData, "tierSelections"));

    const rawQualification = parsed.data.qualification ?? {};
    const commerceModel =
      rawQualification.commerceModel ?? DEFAULT_CONSTRAINTS.commerceModel ?? null;
    const constraints: ProjectConstraints = {
      ...DEFAULT_CONSTRAINTS,
      trafficLevel: rawQualification.trafficLevel ?? DEFAULT_CONSTRAINTS.trafficLevel,
      productCount: rawQualification.productCount ?? DEFAULT_CONSTRAINTS.productCount,
      dataSensitivity: rawQualification.dataSensitivity ?? DEFAULT_CONSTRAINTS.dataSensitivity,
      scalabilityLevel: rawQualification.scalabilityLevel ?? DEFAULT_CONSTRAINTS.scalabilityLevel,
      needsEditing: rawQualification.needsEditing ?? DEFAULT_CONSTRAINTS.needsEditing,
      editingFrequency: rawQualification.editingFrequency ?? DEFAULT_CONSTRAINTS.editingFrequency,
      headlessRequired: rawQualification.headlessRequired ?? DEFAULT_CONSTRAINTS.headlessRequired,
      commerceModel,
      backendFamily: rawQualification.backendFamily ?? DEFAULT_CONSTRAINTS.backendFamily ?? null,
      backendOpsHeavy: rawQualification.backendOpsHeavy ?? DEFAULT_CONSTRAINTS.backendOpsHeavy ?? false,
    };

    const headlessImplicit =
      parsed.data.projectFamily === "CMS_HEADLESS" ||
      parsed.data.projectFamily === "COMMERCE_HEADLESS" ||
      (parsed.data.type === "ECOM" && commerceModel === "HEADLESS");
    if (headlessImplicit) {
      constraints.headlessRequired = true;
    }

    if (parsed.data.type !== "ECOM") {
      constraints.productCount = "NONE";
      constraints.commerceModel = null;
    }

    const offerInput = {
      projectType: parsed.data.type as ProjectType,
      projectFamily: parsed.data.projectFamily ?? null,
      needsEditing: constraints.needsEditing,
      editingFrequency: constraints.editingFrequency,
      trafficLevel: constraints.trafficLevel,
      productCount: constraints.productCount,
      dataSensitivity: constraints.dataSensitivity,
      scalabilityLevel: constraints.scalabilityLevel,
      selectedModulesCount: selectedModuleIds.length,
    };
    const qualificationProjectType =
      deriveQualificationProjectType(offerInput) ?? (parsed.data.type as ProjectType);
    const offerProjectType = deriveOfferProjectType(offerInput);
    if (!offerProjectType) {
      return { error: "Type de projet manquant pour déterminer l'offre." };
    }
    const offerStack = getOfferStackForProject(
      qualificationProjectType,
      resolvedTechStack,
      wpHeadless,
    ) as OfferStack;
    const activeModuleIds =
      offerProjectType === "STARTER"
        ? []
        : Array.from(
            new Set([
              ...selectedModuleIds.filter((id) =>
                isModuleCompatible(id, offerStack, offerProjectType),
              ),
              ...getMandatoryModules(offerProjectType, offerStack),
            ]),
          );

    const qualification = qualifyProject({
      projectType: qualificationProjectType,
      techStack: resolvedTechStack,
      selectedModuleIds: activeModuleIds,
      billingMode: "SOLO",
      deployTarget: parsed.data.deployTarget as DeployTarget,
      wpHeadless,
      tierSelections,
      constraints,
    });

    resolvedCategory = qualification.finalCategory ?? parsed.data.category ?? undefined;
    estimatedBudget = resolveEstimatedBudget({
      priceFrom: qualification.budget.grandTotal,
    });
    resolvedMaintenanceLevel = qualification.maintenance;
    ciScore = qualification.ci?.score ?? ciScore;
    ciCategory = qualification.ci?.category ?? ciCategory;
    ciAxesJson = qualification.ci
      ? JSON.stringify(qualification.ci.axes)
      : ciAxesJson;

    const normalizedModules =
      activeModuleIds.length > 0 ? JSON.stringify(activeModuleIds) : undefined;
    modulesJson = normalizedModules ?? parsed.data.qualification?.modules ?? null;
  }

  const client = await prisma.client.findUnique({
    where: { id: parsed.data.clientId },
    select: { id: true, slug: true },
  });
  if (!client) return { error: "Le client sélectionné n'existe pas." };

  const slug = generateSlug(parsed.data.name);

  const existing = await prisma.project.findUnique({ where: { slug } });
  if (existing) return { error: `Un projet avec le slug "${slug}" existe déjà.` };

  // Port
  let port: number;
  const requestedPort = parsed.data.runtime?.port ?? null;
  if (requestedPort != null) {
    if (await isPortInUse(requestedPort)) {
      return { error: `Le port ${String(requestedPort)} est déjà utilisé par un autre projet.` };
    }
    port = requestedPort;
  } else {
    port = await findNextAvailablePort();
  }

  const built = buildProjectCreateArgs({
    formData,
    slug,
    port,
    data: {
      ...parsed.data,
      category: resolvedCategory,
      qualification: {
        ...parsed.data.qualification,
        modules: modulesJson ?? undefined,
        maintenanceLevel:
          resolvedMaintenanceLevel ?? parsed.data.qualification?.maintenanceLevel,
        estimatedBudget: estimatedBudget ?? parsed.data.qualification?.estimatedBudget,
        ciScore,
        ciCategory,
        ciAxesJson,
      },
    },
  });

  const project: CreatedProject = await prisma.project.create(built.createArgs);

  try {
    const docIds = await buildProjectDocIds({
      techStack: project.techStack ?? null,
      modulesJson,
    });
    if (docIds.length > 0) {
      const rows = buildProjectDocRows(docIds).map((row) => ({
        projectId: project.id,
        ...row,
      }));
      await prisma.projectDoc.createMany({
        data: rows,
        skipDuplicates: true,
      });
    }
  } catch (e: unknown) {
    console.error("Failed to build project docs mapping:", project.id, e);
  }

  if (project.techStack === "WORDPRESS" && project.wpConfig) {
    try {
      const setupOptions = buildWpSetupOptionsFromConfig({
        wpPermalinkStructure: project.wpConfig.wpPermalinkStructure,
        wpDefaultPages: project.wpConfig.wpDefaultPages,
        wpPlugins: project.wpConfig.wpPlugins,
        wpTheme: project.wpConfig.wpTheme,
      });
      await generateProjectWpDevAssets({
        clientSlug: client.slug,
        projectSlug: project.slug,
        setupOptions,
        includeTheme: !project.wpConfig.wpHeadless,
      });
      await generateProjectWpThemeAssets({
        clientSlug: client.slug,
        projectSlug: project.slug,
        includeTheme: !project.wpConfig.wpHeadless,
      });
    } catch (e: unknown) {
      console.error("Failed to generate WP dev assets:", project.id, e);
    }
  }

  try {
    await generateProjectInfra({
      project,
      clientSlug: client.slug,
      port,
      domain: parsed.data.domain ?? null,
      type: project.type,
      techStack: built.techStack,
      deployTarget: built.deployTarget,
      devMode: parsed.data.devMode,
    });
  } catch (e: unknown) {
    console.error("Failed to generate infra configs for project:", project.id, e);
  }

  redirect(`/dashboard/clients/${parsed.data.clientId}`);
}
