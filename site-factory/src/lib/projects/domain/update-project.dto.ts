import type { DeployTarget, TechStack } from "@/generated/prisma/client";

export type UpdateProjectDto = {
  name: string;
  type: string;
  status: string;

  description: string | null;
  domain: string | null;
  gitRepo: string | null;

  techStack: TechStack | null;
  deployTarget: DeployTarget;

  category: string | null;

  runtime: { port: number | null };

  wpConfig?: {
    phpVersion: string;
    wpHeadless: boolean;
    frontendStack: string | null;
  } | null;

  qualification?: {
    modules: string | null;
    maintenanceLevel: string | null;
    estimatedBudget: number | null;
    trafficLevel?: string | null;
    productCount?: string | null;
    dataSensitivity?: string | null;
    scalabilityLevel?: string | null;
    needsEditing?: boolean | null;
    editingFrequency?: string | null;
    headlessRequired?: boolean | null;
    commerceModel?: string | null;
    ciScore?: number | null;
    ciCategory?: string | null;
    ciAxesJson?: string | null;
  } | null;
};

function getStr(fd: FormData, key: string): string | null {
  const v = fd.get(key);
  if (typeof v !== "string") return null;
  const s = v.trim();
  return s === "" ? null : s;
}

function getNum(fd: FormData, key: string): number | null {
  const s = getStr(fd, key);
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function getBool(fd: FormData, key: string): boolean {
  return fd.get(key) === "true";
}

function getBoolOptional(fd: FormData, key: string): boolean | null {
  const v = fd.get(key);
  if (v == null) return null;
  return v === "true";
}

/**
 * Remarque: ici on laisse volontairement `type/status/category` en string,
 * car ces enums peuvent bouger et tu as déjà du Zod pour valider.
 */
export function formDataToUpdateProjectDto(formData: FormData): {
  raw: unknown; // pour Zod (si tu veux conserver updateProjectSchema)
  dtoDraft: {
    techStackRaw: string | null;
    deployTargetRaw: string | null;
  };
} {
  const techStackRaw = getStr(formData, "techStack");
  const deployTargetRaw = getStr(formData, "deployTarget");

  const raw = {
    name: formData.get("name"),
    type: formData.get("type"),
    status: formData.get("status"),
    description: getStr(formData, "description") ?? undefined,
    domain: getStr(formData, "domain"),
    gitRepo: getStr(formData, "gitRepo") ?? undefined,
    techStack: techStackRaw ?? undefined,
    deployTarget: deployTargetRaw ?? "DOCKER",
    category: getStr(formData, "category") ?? undefined,
    runtime: { port: getNum(formData, "port") },
    wpConfig:
      techStackRaw === "WORDPRESS"
        ? {
            phpVersion: "8.3",
            wpHeadless: getBool(formData, "wpHeadless"),
            frontendStack: getStr(formData, "frontendStack"),
          }
        : undefined,
    qualification: {
      modules: getStr(formData, "modules") ?? undefined,
      maintenanceLevel: getStr(formData, "maintenanceLevel") ?? undefined,
      estimatedBudget: getNum(formData, "estimatedBudget") ?? undefined,
      trafficLevel: getStr(formData, "trafficLevel") ?? undefined,
      productCount: getStr(formData, "productCount") ?? undefined,
      dataSensitivity: getStr(formData, "dataSensitivity") ?? undefined,
      scalabilityLevel: getStr(formData, "scalabilityLevel") ?? undefined,
      needsEditing: getBoolOptional(formData, "needsEditing") ?? undefined,
      editingFrequency: getStr(formData, "editingFrequency") ?? undefined,
      headlessRequired: getBoolOptional(formData, "headlessRequired") ?? undefined,
      commerceModel: getStr(formData, "commerceModel") ?? undefined,
      ciScore: getNum(formData, "ciScore") ?? undefined,
      ciCategory: getStr(formData, "ciCategory") ?? undefined,
      ciAxesJson: getStr(formData, "ciAxesJson") ?? undefined,
    },
  };

  return { raw, dtoDraft: { techStackRaw, deployTargetRaw } };
}
