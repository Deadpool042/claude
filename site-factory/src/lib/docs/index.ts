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

const CATEGORY_LABELS: Record<string, string> = {
  ROOT: "Documentation",
  "01-Socle-Technique": "Socle technique",
  "02-Complexity-Index": "Complexity Index",
  "03-Maintenance": "Maintenance",
  "04-Modules": "Modules",
  "05-Bonnes-Pratiques": "Bonnes pratiques",
  "06-Integration-Technologie": "Integration & techno",
  "07-Exemples": "Exemples",
  "08-Commercial": "Commercial",
  "09-Interne": "Interne",
};

const CATEGORY_TAGS: Record<string, string> = {
  ROOT: "docs",
  "01-Socle-Technique": "socle",
  "02-Complexity-Index": "complexity",
  "03-Maintenance": "maintenance",
  "04-Modules": "modules",
  "05-Bonnes-Pratiques": "bonnes-pratiques",
  "06-Integration-Technologie": "integration",
  "07-Exemples": "exemples",
  "08-Commercial": "commercial",
  "09-Interne": "interne",
};

function normalizeId(id: string): string {
  return id.replaceAll("\\", "/").replace(/^\/+/, "");
}

function resolveDocPath(id: string): string {
  const safeId = normalizeId(id);
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
  const segments = id.split("/");
  const categoryKey = segments.length > 1 ? segments[0] : "ROOT";
  const filename = segments[segments.length - 1] ?? id;
  const title = titleFromContent(content, filename.replace(/\.md$/, ""));
  const moduleId =
    categoryKey === "04-Modules" && filename.startsWith("module-")
      ? filename.replace(/\.md$/, "")
      : undefined;

  const tags = [CATEGORY_TAGS[categoryKey] ?? "docs"];
  if (moduleId) tags.push("module");
  if (filename === "modules.md") tags.push("catalog");

  const base: DocMeta = {
    id,
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
      const id = normalizeId(path.relative(DOCS_ROOT, file));
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
    return { ...toDocMeta(normalizeId(id), content, stat.mtime), content };
  } catch {
    return null;
  }
}

export async function writeDoc(id: string, content: string): Promise<DocMeta> {
  const filePath = resolveDocPath(id);
  await fs.writeFile(filePath, content, "utf8");
  const stat = await fs.stat(filePath);
  return toDocMeta(normalizeId(id), content, stat.mtime);
}
