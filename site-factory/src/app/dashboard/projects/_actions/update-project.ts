"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { updateProjectSchema } from "@/lib/validators/project";
import { generateSlug } from "@/lib/slug";
import { isPortInUse, findNextAvailablePort } from "@/lib/port";
import { generateTraefikConfig } from "@/lib/generators/traefik";
import { resolveWpPlugins, serializeResolvedPlugins } from "@/lib/wp-plugin-resolver";
import type { WpFeature } from "@/lib/wp-features";
import type { DeployTargetLiteral } from "@/lib/service-catalog";
import { resolveHostingProviderForDeployTarget } from "@/lib/hosting-providers";
import {
  getMandatoryModules,
  isModuleCompatible,
  type ModuleId,
  type Stack as OfferStack,
} from "@/lib/offers/offers";
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

/** ───────────────────────────────────────────────────────────────
 * Types
 * ─────────────────────────────────────────────────────────────── */

interface ActionState {
  error: string | null;
}

/** ───────────────────────────────────────────────────────────────
 * FormData helpers (centralise les coercions)
 * ─────────────────────────────────────────────────────────────── */

function getStr(fd: FormData, key: string): string | undefined {
  const v = fd.get(key);
  if (typeof v !== "string") return undefined;
  const s = v.trim();
  return s === "" ? undefined : s;
}

function getStrOrNull(fd: FormData, key: string): string | null {
  const s = getStr(fd, key);
  return s ?? null;
}

function getNum(fd: FormData, key: string): number | undefined {
  const s = getStr(fd, key);
  if (!s) return undefined;
  const n = Number(s);
  return Number.isFinite(n) ? n : undefined;
}

function getBool(fd: FormData, key: string): boolean {
  // ton UI envoie "true"/"false"
  return fd.get(key) === "true";
}

function getBoolOptional(fd: FormData, key: string): boolean | undefined {
  const v = fd.get(key);
  if (v == null) return undefined;
  return v === "true";
}

function parseModuleIds(value?: string | null): ModuleId[] {
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
  value?: string | null,
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

function resolveEstimatedBudget(total: { priceFrom: number; priceTo?: number } | null): number | null {
  if (!total) return null;
  const priceTo = total.priceTo ?? total.priceFrom;
  return Math.round((total.priceFrom + priceTo) / 2);
}

/** ───────────────────────────────────────────────────────────────
 * Raw builder (shape attendue par Zod)
 * ─────────────────────────────────────────────────────────────── */

function buildRawFromFormData(formData: FormData) {
  const techStack = getStr(formData, "techStack"); // "WORDPRESS" | "NEXTJS" | ...
  const isWp = techStack === "WORDPRESS";

  return {
    name: formData.get("name"),
    type: formData.get("type"),
    status: formData.get("status"),
    description: getStr(formData, "description"),
    domain: getStrOrNull(formData, "domain"),
    gitRepo: getStr(formData, "gitRepo"),
    techStack: techStack ?? undefined,
    deployTarget: (getStr(formData, "deployTarget") ?? "DOCKER") as unknown,
    hostingProviderId: getStr(formData, "hostingProviderId"),
    category: getStr(formData, "category"),

    runtime: {
      port: getNum(formData, "port") ?? null,
    },

    wpConfig: isWp
      ? {
          phpVersion: "8.3",
          wpHeadless: getBool(formData, "wpHeadless"),
          frontendStack: getStr(formData, "frontendStack"),
        }
      : undefined,

    qualification: {
      modules: getStr(formData, "modules"),
      maintenanceLevel: getStr(formData, "maintenanceLevel"),
      estimatedBudget: getNum(formData, "estimatedBudget"),
      trafficLevel: getStr(formData, "trafficLevel"),
      productCount: getStr(formData, "productCount"),
      dataSensitivity: getStr(formData, "dataSensitivity"),
      scalabilityLevel: getStr(formData, "scalabilityLevel"),
      needsEditing: getBoolOptional(formData, "needsEditing"),
      editingFrequency: getStr(formData, "editingFrequency"),
      headlessRequired: getBoolOptional(formData, "headlessRequired"),
      commerceModel: getStr(formData, "commerceModel"),
      backendMode: getStr(formData, "backendMode"),
      backendFamily: getStr(formData, "backendFamily"),
      backendOpsHeavy: getBoolOptional(formData, "backendOpsHeavy"),
      ciScore: getNum(formData, "ciScore"),
      ciCategory: getStr(formData, "ciCategory"),
      ciAxesJson: getStr(formData, "ciAxesJson"),
    },
  };
}

/** ───────────────────────────────────────────────────────────────
 * Action
 * ─────────────────────────────────────────────────────────────── */

export async function updateProjectAction(
  projectId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  // 1) Parse + validate
  const raw = buildRawFromFormData(formData);
  const parsed = updateProjectSchema.safeParse(raw);

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Données invalides" };
  }

  // 2) Load existing
  const existing = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      client: { select: { slug: true } },
      runtime: true,
      wpConfig: true,
      nextConfig: true,
      qualification: true,
    },
  });

  if (!existing) return { error: "Projet introuvable." };

  // 3) Compute slug
  const nextSlug = generateSlug(parsed.data.name);
  const slugChanged = nextSlug !== existing.slug;

  // 4) Resolve port
  const existingPort = existing.runtime?.port ?? null;
  const desiredPort = parsed.data.runtime?.port ?? null;

  let finalPort: number;
  if (desiredPort != null) {
    // port fourni -> check si changé
    if (desiredPort !== existingPort) {
      const used = await isPortInUse(desiredPort, projectId);
      if (used) {
        return { error: `Le port ${String(desiredPort)} est déjà utilisé par un autre projet.` };
      }
    }
    finalPort = desiredPort;
  } else if (existingPort != null) {
    // pas fourni -> on garde
    finalPort = existingPort;
  } else {
    // pas fourni et pas d'existant -> auto
    finalPort = await findNextAvailablePort();
  }

  const finalLocalHost = `${nextSlug}.localhost`;
  const deployTargetLiteral = parsed.data.deployTarget as unknown as DeployTargetLiteral;
  const resolvedHostingProvider = resolveHostingProviderForDeployTarget(
    parsed.data.hostingProviderId ?? existing.hostingProviderId ?? null,
    deployTargetLiteral,
  );

  const resolvedTechStack = (parsed.data.techStack ?? existing.techStack ?? "WORDPRESS") as TechStack;
  const resolvedWpHeadless =
    resolvedTechStack === "WORDPRESS"
      ? parsed.data.wpConfig?.wpHeadless ?? existing.wpConfig?.wpHeadless ?? false
      : false;
  const selectedModuleIds = parseModuleIds(
    parsed.data.qualification?.modules ?? existing.qualification?.modules,
  );
  const tierSelections = parseTierSelections(getStr(formData, "tierSelections"));

  const rawQualification = {
    ...(existing.qualification ?? {}),
    ...(parsed.data.qualification ?? {}),
  };
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

  const hostingTargetValue =
    parsed.data.hostingTarget ?? existing.hostingTarget ?? "TO_CONFIRM";
  const projectFamilyValue =
    parsed.data.projectFamily ?? existing.projectFamily ?? null;
  const headlessImplicit =
    projectFamilyValue === "CMS_HEADLESS" ||
    projectFamilyValue === "COMMERCE_HEADLESS" ||
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
    projectFamily: parsed.data.projectFamily ?? existing.projectFamily ?? null,
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
    resolvedWpHeadless,
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
    wpHeadless: resolvedWpHeadless,
    tierSelections,
    constraints,
  });

  const resolvedCategory = qualification.finalCategory ?? parsed.data.category ?? null;
  const estimatedBudget = resolveEstimatedBudget({
    priceFrom: qualification.budget.grandTotal,
  });
  const resolvedMaintenanceLevel =
    qualification.maintenance ?? parsed.data.qualification?.maintenanceLevel ?? null;
  const ciScore = qualification.ci?.score ?? rawQualification.ciScore ?? null;
  const ciCategory = qualification.ci?.category ?? rawQualification.ciCategory ?? null;
  const ciAxesJson = qualification.ci
    ? JSON.stringify(qualification.ci.axes)
    : rawQualification.ciAxesJson ?? null;
  const normalizedModules =
    activeModuleIds.length > 0 ? JSON.stringify(activeModuleIds) : null;

  if (resolvedTechStack === "WORDPRESS") {
    try {
      const setupOptions = buildWpSetupOptionsFromConfig({
        wpPermalinkStructure: existing.wpConfig?.wpPermalinkStructure ?? null,
        wpDefaultPages: existing.wpConfig?.wpDefaultPages ?? null,
        wpPlugins: existing.wpConfig?.wpPlugins ?? null,
        wpTheme: existing.wpConfig?.wpTheme ?? null,
      });
      await generateProjectWpDevAssets({
        clientSlug: existing.client.slug,
        projectSlug: nextSlug,
        setupOptions,
        includeTheme: !resolvedWpHeadless,
      });
      await generateProjectWpThemeAssets({
        clientSlug: existing.client.slug,
        projectSlug: nextSlug,
        includeTheme: !resolvedWpHeadless,
      });
    } catch (e: unknown) {
      console.error("Failed to generate WP dev assets:", projectId, e);
    }
  }

  // 5) Transaction (slug unique + updates)
  try {
    await prisma.$transaction(async (tx) => {
      // slug unique only if changed
      if (slugChanged) {
        const slugTaken = await tx.project.findUnique({ where: { slug: nextSlug } });
        if (slugTaken) {
          // throw pour rollback
          throw new Error(`Un projet avec le slug "${nextSlug}" existe déjà.`);
        }
      }

      // base project update
      await tx.project.update({
        where: { id: projectId },
        data: {
          name: parsed.data.name,
          slug: nextSlug,
          type: parsed.data.type,
          status: parsed.data.status,
          description: parsed.data.description ?? null,
          domain: parsed.data.domain,
          gitRepo: parsed.data.gitRepo ?? null,
          techStack: parsed.data.techStack ?? null,
          deployTarget: parsed.data.deployTarget,
          hostingProviderId: resolvedHostingProvider.id,
          category: resolvedCategory,
        },
      });

      // runtime upsert
      await tx.projectRuntime.upsert({
        where: { projectId },
        create: { projectId, port: finalPort, localHost: finalLocalHost },
        update: { port: finalPort, localHost: finalLocalHost },
      });

      // qualification upsert (toujours)
      await tx.projectQualification.upsert({
        where: { projectId },
        create: {
          projectId,
          modules: normalizedModules,
          maintenanceLevel: resolvedMaintenanceLevel,
          estimatedBudget: estimatedBudget,
          trafficLevel: rawQualification.trafficLevel ?? null,
          productCount: rawQualification.productCount ?? null,
          dataSensitivity: rawQualification.dataSensitivity ?? null,
          scalabilityLevel: rawQualification.scalabilityLevel ?? null,
          needsEditing: rawQualification.needsEditing ?? null,
          editingFrequency: rawQualification.editingFrequency ?? null,
          headlessRequired: rawQualification.headlessRequired ?? null,
          commerceModel: rawQualification.commerceModel ?? null,
          backendMode: rawQualification.backendMode ?? null,
          backendFamily: rawQualification.backendFamily ?? null,
          backendOpsHeavy: rawQualification.backendOpsHeavy ?? null,
          ciScore: ciScore,
          ciCategory: ciCategory,
          ciAxesJson: ciAxesJson,
        },
        update: {
          modules: normalizedModules,
          maintenanceLevel: resolvedMaintenanceLevel,
          estimatedBudget: estimatedBudget,
          trafficLevel: rawQualification.trafficLevel ?? null,
          productCount: rawQualification.productCount ?? null,
          dataSensitivity: rawQualification.dataSensitivity ?? null,
          scalabilityLevel: rawQualification.scalabilityLevel ?? null,
          needsEditing: rawQualification.needsEditing ?? null,
          editingFrequency: rawQualification.editingFrequency ?? null,
          headlessRequired: rawQualification.headlessRequired ?? null,
          commerceModel: rawQualification.commerceModel ?? null,
          backendMode: rawQualification.backendMode ?? null,
          backendFamily: rawQualification.backendFamily ?? null,
          backendOpsHeavy: rawQualification.backendOpsHeavy ?? null,
          ciScore: ciScore,
          ciCategory: ciCategory,
          ciAxesJson: ciAxesJson,
        },
      });

      // WP config: upsert only if WP, else cleanup if switching away
      const isWp = (parsed.data.techStack ?? null) === "WORDPRESS";
      const wpHeadless = isWp && (parsed.data.wpConfig?.wpHeadless ?? false);

      if (isWp) {
        const nextHostingProfileId = resolvedHostingProvider.profileId;

        let wpPluginsJson = existing.wpConfig?.wpPlugins ?? null;
        if (existing.wpConfig?.wpFeatures) {
          try {
            const features = JSON.parse(existing.wpConfig.wpFeatures) as WpFeature[];
            const resolved = resolveWpPlugins(features, {
              profileId: nextHostingProfileId,
              excludeFreemium: existing.wpConfig.excludeFreemium ?? false,
            });
            wpPluginsJson = serializeResolvedPlugins(resolved.plugins);
          } catch {
            // Keep existing plugins if parsing fails
          }
        }

        await tx.wordpressConfig.upsert({
          where: { projectId },
          create: {
            projectId,
            phpVersion: parsed.data.wpConfig?.phpVersion ?? "8.3",
            wpHeadless,
            hostingProfileId: nextHostingProfileId,
            frontendStack: wpHeadless ? (parsed.data.wpConfig?.frontendStack ?? "NEXTJS") : null,
            wpPlugins: wpPluginsJson,
          },
          update: {
            phpVersion: parsed.data.wpConfig?.phpVersion ?? "8.3",
            wpHeadless,
            hostingProfileId: nextHostingProfileId,
            frontendStack: wpHeadless ? (parsed.data.wpConfig?.frontendStack ?? "NEXTJS") : null,
            wpPlugins: wpPluginsJson,
          },
        });

        // si tu veux: quand WP, tu peux décider de supprimer nextConfig (optionnel)
        // await tx.nextjsConfig.delete({ where: { projectId } }).catch(() => {});
      } else {
        // si le projet n'est plus WP, supprimer config WP si existante (optionnel mais propre)
        await tx.wordpressConfig.delete({ where: { projectId } }).catch(() => {});
      }

      // (Optionnel) Si tu veux gérer Next config ici aussi, même logique:
      // const isNext = (parsed.data.techStack ?? null) === "NEXTJS";
      // if (!isNext) await tx.nextjsConfig.delete({ where: { projectId } }).catch(() => {});
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Erreur inconnue";
    return { error: msg };
  }

  // 6) Traefik regen (non-fatal)
  try {
    await generateTraefikConfig();
  } catch {
    // ignore
  }

  redirect(`/dashboard/projects/${projectId}`);
}
