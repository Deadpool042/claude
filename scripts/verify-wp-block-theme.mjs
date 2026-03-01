import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";

const THEME_ROOT = resolve(process.cwd(), "assets", "wp", "theme-child", "sf-tt5");
console.log("theme root: ",THEME_ROOT)
const TARGET_DIRS = ["templates", "parts", "patterns"].map((dir) =>
  resolve(THEME_ROOT, dir),
);

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = resolve(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(fullPath)));
    } else {
      files.push(fullPath);
    }
  }

  return files;
}

function parseBlockComment(raw) {
  const trimmed = raw.trim();
  if (!trimmed.startsWith("wp:") || trimmed.startsWith("/wp:")) return null;

  const cleaned = trimmed.replace(/\s*\/$/, "").trim();
  const match = cleaned.match(/^wp:([^\s]+)(?:\s+(\{[\s\S]*\}))?$/);
  if (!match) return { blockName: null, json: null, error: "Malformed block comment" };

  const blockName = match[1];
  const jsonText = match[2];
  if (!jsonText) return { blockName, json: null };

  try {
    const json = JSON.parse(jsonText);
    return { blockName, json };
  } catch (error) {
    return { blockName, json: null, error: String(error) };
  }
}

function collectComments(content) {
  const comments = [];
  const regex = /<!--([\s\S]*?)-->/g;
  let match = null;

  while ((match = regex.exec(content)) !== null) {
    comments.push(match[1]);
  }

  return comments;
}

const errors = [];

const requiredTemplates = [
  "page-2col-left.html",
  "page-2col-right.html",
  "page-centered.html",
  "page-fullwidth.html",
];

const files = [];
for (const dir of TARGET_DIRS) {
  try {
    files.push(...(await walk(dir)));
  } catch (error) {
    errors.push(`Missing directory: ${dir}`);
  }
}

const patternSlugs = new Set();
const patternFiles = files.filter((file) => file.includes(`${resolve(THEME_ROOT, "patterns")}`));

for (const file of patternFiles) {
  const content = await readFile(file, "utf-8");
  const slugMatch = content.match(/^[ \t]*\*\s*Slug:\s*([^\r\n]+)/m);
  if (!slugMatch) {
    errors.push(`Pattern missing Slug header: ${file}`);
    continue;
  }
  const slug = slugMatch[1].trim();
  if (!slug) {
    errors.push(`Pattern empty Slug header: ${file}`);
    continue;
  }
  if (patternSlugs.has(slug)) {
    errors.push(`Duplicate pattern slug: ${slug}`);
  }
  patternSlugs.add(slug);
}

const referencedPatterns = new Set();
const referencedTemplateParts = new Set();

for (const file of files) {
  const content = await readFile(file, "utf-8");
  const comments = collectComments(content);

  for (const comment of comments) {
    const parsed = parseBlockComment(comment);
    if (!parsed) continue;

    if (parsed.error) {
      errors.push(`Invalid JSON in ${file}: ${parsed.error}`);
      continue;
    }

    if (parsed.blockName === "pattern") {
      const slug = parsed.json?.slug;
      if (!slug) {
        errors.push(`Pattern block missing slug in ${file}`);
        continue;
      }
      referencedPatterns.add(slug);
    }

    if (parsed.blockName === "template-part") {
      const slug = parsed.json?.slug;
      if (!slug) {
        errors.push(`Template part missing slug in ${file}`);
        continue;
      }
      referencedTemplateParts.add(slug);
    }
  }
}

for (const slug of referencedPatterns) {
  if (!patternSlugs.has(slug)) {
    errors.push(`Missing pattern for slug: ${slug}`);
  }
}

for (const slug of referencedTemplateParts) {
  const partPath = resolve(THEME_ROOT, "parts", `${slug}.html`);
  const hasPart = files.includes(partPath);
  if (!hasPart) {
    errors.push(`Missing template part file for slug: ${slug}`);
  }
}

for (const name of requiredTemplates) {
  const templatePath = resolve(THEME_ROOT, "templates", name);
  if (!files.includes(templatePath)) {
    errors.push(`Missing required template: ${name}`);
  }
}

if (errors.length > 0) {
  console.error("WP block theme verification failed:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log("WP block theme verification passed.");
