import type { TechStack } from "@/generated/prisma/client";
import { normalizeModuleIds } from "@/lib/referential";
import { listDocs, type DocMeta } from "./index";

const PROJECT_ALLOWED_CATEGORIES = new Set([
  "qualification",
  "recommandation",
  "technique",
]);

const MODULE_DOC_PREFIX = "technique/modules/";
const STACK_DOC_PREFIX = "technique/socle/";

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

  if (doc.id.startsWith(MODULE_DOC_PREFIX)) {
    if (doc.moduleId) return moduleIds.has(doc.moduleId);
    return moduleIds.size > 0 && doc.id.endsWith("modules.md");
  }

  if (
    doc.id.startsWith(STACK_DOC_PREFIX) &&
    doc.id !== "technique/socle/README.md" &&
    doc.id !== "technique/socle/socle-technique-canonique.md"
  ) {
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
