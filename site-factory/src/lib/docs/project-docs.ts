import type { TechStack } from "@/generated/prisma/client";
import { normalizeModuleIds } from "@/lib/qualification";
import { listDocs, type DocMeta } from "./index";

const PROJECT_ALLOWED_CATEGORIES = new Set([
  "01-Socle-Technique",
  "02-Complexity-Index",
  "03-Maintenance",
  "04-Modules",
  "05-Bonnes-Pratiques",
  "06-Integration-Technologie",
  "07-Exemples",
]);

const STACK_DEPENDENT_CATEGORIES = new Set([
  "06-Integration-Technologie",
  "07-Exemples",
]);

function parseModuleIds(modulesJson: string | null): string[] {
  if (!modulesJson) return [];
  try {
    const parsed = JSON.parse(modulesJson);
    if (!Array.isArray(parsed)) return [];
    return normalizeModuleIds(parsed.map((id) => String(id)));
  } catch {
    return [];
  }
}

function isDocForProject(
  doc: DocMeta,
  techStack: TechStack | null,
  moduleIds: Set<string>,
): boolean {
  if (!PROJECT_ALLOWED_CATEGORIES.has(doc.categoryKey)) return false;

  if (doc.categoryKey === "04-Modules") {
    if (doc.moduleId) return moduleIds.has(doc.moduleId);
    return moduleIds.size > 0 && doc.id.endsWith("modules.md");
  }

  if (STACK_DEPENDENT_CATEGORIES.has(doc.categoryKey)) {
    return Boolean(techStack);
  }

  return true;
}

export async function buildProjectDocIds(input: {
  techStack: TechStack | null;
  modulesJson: string | null;
}): Promise<string[]> {
  const docs = await listDocs();
  const moduleIds = new Set(parseModuleIds(input.modulesJson));

  return docs
    .filter((doc) => isDocForProject(doc, input.techStack, moduleIds))
    .map((doc) => doc.id);
}

export function buildProjectDocRows(docIds: string[]): { docId: string; source: string }[] {
  return docIds.map((docId) => ({ docId, source: "AUTO" }));
}
