import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { readFile, writeFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";
import {
  featuresSpecSchema,
  modulesSpecSchema,
} from "@/lib/referential/spec/schema";
import {
  validateSpecContent,
  type SpecValidationContext,
} from "@/features/spec/logic/spec-validation";
import { isSpecFileName, type SpecFileName } from "../spec-files";

export const dynamic = "force-dynamic";

const execFileAsync = promisify(execFile);
const ROOT_DIR = path.resolve(process.cwd(), "..");
const SPEC_DIR = path.join(ROOT_DIR, "Docs", "_spec");

function resolveSpecFile(specFile: string): string | null {
  let name: string;
  try {
    name = decodeURIComponent(specFile);
  } catch {
    return null;
  }
  if (!isSpecFileName(name)) return null;
  return path.join(SPEC_DIR, name);
}

async function readSpecJson(specFile: SpecFileName): Promise<unknown | null> {
  try {
    const content = await readFile(path.join(SPEC_DIR, specFile), "utf8");
    return JSON.parse(content);
  } catch {
    return null;
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ specFile: string }> },
) {
  const { specFile } = await params;
  const filePath = resolveSpecFile(specFile);
  if (!filePath) {
    return NextResponse.json({ error: "Fichier non autorisé" }, { status: 403 });
  }

  try {
    const content = await readFile(filePath, "utf8");
    return NextResponse.json({
      name: specFile,
      content: JSON.parse(content),
      raw: content,
    });
  } catch {
    return NextResponse.json({ error: "Fichier introuvable" }, { status: 404 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ specFile: string }> },
) {
  const { specFile } = await params;
  const filePath = resolveSpecFile(specFile);
  if (!filePath) {
    return NextResponse.json({ error: "Fichier non autorisé" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const content = body.content;

    // Validate JSON
    if (typeof content !== "object" || content === null) {
      return NextResponse.json({ error: "Contenu JSON invalide" }, { status: 400 });
    }

    const context: SpecValidationContext = {};
    if (specFile === "features.json" || specFile === "modules.json") {
      const featuresSource = specFile === "features.json"
        ? content
        : await readSpecJson("features.json");
      const modulesSource = specFile === "modules.json"
        ? content
        : await readSpecJson("modules.json");
      if (featuresSource) {
        const parsed = featuresSpecSchema.safeParse(featuresSource);
        if (parsed.success) context.features = parsed.data;
      }
      if (modulesSource) {
        const parsed = modulesSpecSchema.safeParse(modulesSource);
        if (parsed.success) context.modules = parsed.data;
      }
    }

    const validation = validateSpecContent(specFile, content, context);
    if (!validation.ok) {
      return NextResponse.json(
        { error: "Spec invalide", details: validation.issues },
        { status: 422 },
      );
    }

    const normalized = `${JSON.stringify(content, null, 2)}\n`;

    // Write to Docs/_spec/
    await writeFile(filePath, normalized, "utf8");

    // Run sync script to copy to app runtime
    try {
      await execFileAsync("node", [path.join(ROOT_DIR, "scripts", "sync-spec-to-app.mjs")], {
        cwd: ROOT_DIR,
        timeout: 10000,
      });
    } catch {
      // File saved but sync failed — report partial success
      return NextResponse.json({
        saved: true,
        synced: false,
        warning: "Fichier sauvé mais la synchronisation a échoué. Lancez manuellement : pnpm spec:sync",
      });
    }

    return NextResponse.json({ saved: true, synced: true });
  } catch {
    return NextResponse.json(
      { error: "Erreur lors de la sauvegarde" },
      { status: 500 },
    );
  }
}
