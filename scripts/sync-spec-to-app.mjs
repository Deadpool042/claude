#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const isCheckMode = process.argv.includes("--check");
const rootDir = path.resolve(process.cwd());
const sourceDir = path.join(rootDir, "Docs", "_spec");
const targetDir = path.join(rootDir, "site-factory", "src", "lib", "referential", "spec", "data");

const files = [
  "cms.json",
  "features.json",
  "plugins.json",
  "modules.json",
  "capability-matrix.json",
  "decision-rules.json",
  "commercial.json",
  "custom-stacks.json",
  "shared-socle.json",
];

await mkdir(targetDir, { recursive: true });

const driftedFiles = [];

for (const name of files) {
  const sourcePath = path.join(sourceDir, name);
  const targetPath = path.join(targetDir, name);
  const content = await readFile(sourcePath, "utf8");
  const parsed = JSON.parse(content);
  const normalized = `${JSON.stringify(parsed, null, 2)}\n`;

  if (isCheckMode) {
    let targetContent = "";
    try {
      targetContent = await readFile(targetPath, "utf8");
    } catch {
      targetContent = "";
    }
    if (targetContent !== normalized) {
      driftedFiles.push(name);
    }
  } else {
    await writeFile(targetPath, normalized, "utf8");
  }
}

if (isCheckMode) {
  if (driftedFiles.length > 0) {
    console.error("Spec drift detected between Docs/_spec and app runtime copy:");
    for (const file of driftedFiles) {
      console.error(`- ${file}`);
    }
    console.error("Run: pnpm spec:sync");
    process.exit(1);
  }

  console.log(`Spec check OK: ${files.length} files are in sync.`);
} else {
  console.log(`Synced ${files.length} spec files to ${targetDir}`);
}
