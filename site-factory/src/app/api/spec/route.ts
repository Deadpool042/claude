import { NextResponse } from "next/server";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { SPEC_FILE_LABELS, SPEC_FILES } from "./spec-files";
import { buildSpecCatalogEntry } from "@/features/spec/logic/spec-catalog";

export const dynamic = "force-dynamic";

const SPEC_DIR = path.resolve(process.cwd(), "..", "Docs", "_spec");

export async function GET() {
  try {
    const jsonFiles = [...SPEC_FILES].sort();
    const files = await Promise.all(
      jsonFiles.map(async (name) => {
        const filePath = path.join(SPEC_DIR, name);
        const [info, rawContent] = await Promise.all([
          stat(filePath),
          readFile(filePath, "utf8"),
        ]);
        const content = JSON.parse(rawContent) as unknown;

        return buildSpecCatalogEntry({
          name,
          label: SPEC_FILE_LABELS[name],
          size: info.size,
          lastModified: info.mtime.toISOString(),
        }, content);
      }),
    );

    return NextResponse.json({ files });
  } catch {
    return NextResponse.json(
      { error: "Impossible de lire le répertoire spec" },
      { status: 500 },
    );
  }
}
