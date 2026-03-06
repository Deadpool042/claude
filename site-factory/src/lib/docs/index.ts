import fs from "node:fs/promises";
import path from "node:path";

export interface DocMeta {
  id: string;
  title: string;
  category: string;
  categoryKey: string;
  tags: string[];
  moduleId?: string;
  updatedAt: string;
}

interface DocContent extends DocMeta {
  content: string;
}

const DOCS_ROOT = process.env.DOCS_ROOT ?? path.join(process.cwd(), "..", "Docs");

const LEGACY_DOC_ID_MAP: Record<string, string> = {
  "00-vision-produit.md": "produit/vision-produit.md",
  "01-positionnement-offres.md": "produit/positionnement-offres.md",
  "02-taxonomie-projets.md": "produit/taxonomie-projets.md",
  "03-logique-de-qualification.md": "qualification/logique-de-qualification.md",
  "04-glossaire-et-mapping-taxonomique.md": "produit/glossaire-et-mapping-taxonomique.md",
  "01-framework-overview.md": "technique/architecture-spec-first.md",
  "02-supported-cms.md": "recommandation/cms-supportes.md",
  "03-feature-classification.md": "recommandation/classification-des-capacites.md",
  "04-cms-capability-matrix.md": "recommandation/matrice-capacites-cms.md",
  "05-framework-modules.md": "technique/catalogue-modules-framework.md",
  "06-plugin-integrations.md": "technique/integrations-plugins-et-apps.md",
  "07-custom-apps.md": "technique/mode-custom-app.md",
  "08-decision-engine.md": "recommandation/moteur-de-decision.md",
  "_prompts/README.md": "interne/prompts/README.md",
} as const;

const LEGACY_DOC_PREFIX_REWRITES = [
  ["09-Interne/", "interne/"],
  ["90-interne/", "interne/"],
  ["10-socle-technique/", "technique/socle/"],
] as const;

const CATEGORY_LABELS: Record<string, string> = {
  ROOT: "Documentation",
  produit: "Produit",
  qualification: "Qualification",
  recommandation: "Recommandation",
  technique: "Technique",
  interne: "Interne",
  _spec: "_spec",
};

const CATEGORY_TAGS: Record<string, string> = {
  ROOT: "docs",
  produit: "produit",
  qualification: "qualification",
  recommandation: "recommandation",
  technique: "technique",
  interne: "interne",
  _spec: "spec",
};

function sanitizeDocId(id: string): string {
  return id.replaceAll("\\", "/").replace(/^\/+/, "");
}

export function normalizeDocId(id: string): string {
  const safeId = sanitizeDocId(id);
  const directMatch = LEGACY_DOC_ID_MAP[safeId];
  if (directMatch) return directMatch;

  for (const [from, to] of LEGACY_DOC_PREFIX_REWRITES) {
    if (safeId.startsWith(from)) {
      return `${to}${safeId.slice(from.length)}`;
    }
  }

  return safeId;
}

function resolveDocPath(id: string): string {
  const safeId = normalizeDocId(id);
  const resolved = path.resolve(DOCS_ROOT, safeId);
  if (resolved !== DOCS_ROOT && !resolved.startsWith(`${DOCS_ROOT}${path.sep}`)) {
    throw new Error("Invalid doc path");
  }
  return resolved;
}

async function walkDocs(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walkDocs(fullPath)));
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      files.push(fullPath);
    }
  }
  return files;
}

function titleFromContent(content: string, fallback: string): string {
  const match = content.match(/^#\s+(.+)$/m);
  if (match?.[1]) return match[1].trim();
  return fallback;
}

function toDocMeta(id: string, content: string, updatedAt: Date): DocMeta {
  const canonicalId = normalizeDocId(id);
  const segments = canonicalId.split("/");
  const categoryKey = segments.length > 1 ? segments[0] : "ROOT";
  const filename = segments[segments.length - 1] ?? canonicalId;
  const title = titleFromContent(content, filename.replace(/\.md$/, ""));
  const moduleId =
    canonicalId.startsWith("technique/modules/") && filename.startsWith("module-")
      ? filename.replace(/\.md$/, "")
      : undefined;

  const tags = [CATEGORY_TAGS[categoryKey] ?? "docs"];
  if (moduleId) tags.push("module");
  if (filename === "modules.md") tags.push("catalog");

  const base: DocMeta = {
    id: canonicalId,
    title,
    category: CATEGORY_LABELS[categoryKey] ?? categoryKey,
    categoryKey,
    tags,
    updatedAt: updatedAt.toISOString(),
  };
  if (moduleId) {
    base.moduleId = moduleId;
  }
  return base;
}

export async function listDocs(): Promise<DocMeta[]> {
  const files = await walkDocs(DOCS_ROOT);
  const docs = await Promise.all(
    files.map(async (file) => {
      const content = await fs.readFile(file, "utf8");
      const stat = await fs.stat(file);
      const id = normalizeDocId(path.relative(DOCS_ROOT, file));
      return toDocMeta(id, content, stat.mtime);
    }),
  );
  return docs.sort((a, b) => a.id.localeCompare(b.id));
}

export async function readDoc(id: string): Promise<DocContent | null> {
  let filePath: string;
  try {
    filePath = resolveDocPath(id);
  } catch {
    return null;
  }
  try {
    const [content, stat] = await Promise.all([
      fs.readFile(filePath, "utf8"),
      fs.stat(filePath),
    ]);
    return { ...toDocMeta(normalizeDocId(id), content, stat.mtime), content };
  } catch {
    return null;
  }
}

export async function writeDoc(id: string, content: string): Promise<DocMeta> {
  const filePath = resolveDocPath(id);
  await fs.writeFile(filePath, content, "utf8");
  const stat = await fs.stat(filePath);
  return toDocMeta(normalizeDocId(id), content, stat.mtime);
}
