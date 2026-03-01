import { readFile } from "node:fs/promises";
import { resolve, normalize } from "node:path";

export const dynamic = "force-dynamic";

function safeSegment(v: string) {
  // anti path traversal
  if (!/^[a-z0-9][a-z0-9-_]*$/i.test(v)) return null;
  return v;
}

export async function GET(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const client = url.searchParams.get("client") ?? "";
  const project = url.searchParams.get("project") ?? "";
  const mode = url.searchParams.get("mode") ?? "";

  const safeClient = safeSegment(client);
  const safeProject = safeSegment(project);
  const safeMode = mode === "dev" || mode === "prod-like" ? mode : null;

  if (!safeClient || !safeProject || !safeMode) {
    return Response.json({ ok: false, error: "Paramètres invalides." }, { status: 400 });
  }

  const filename = safeMode === "dev" ? "docker-compose.local.yml" : "docker-compose.prod-like.yml";

  const configsRoot = resolve(process.cwd(), "..", "configs");
  const target = resolve(configsRoot, safeClient, safeProject, filename);

  // double check: target must stay under configsRoot
  const normRoot = normalize(configsRoot + "/");
  const normTarget = normalize(target);
  if (!normTarget.startsWith(normRoot)) {
    return Response.json({ ok: false, error: "Chemin non autorisé." }, { status: 403 });
  }

  try {
    const content = await readFile(normTarget, "utf8");
    return Response.json({ ok: true, content });
  } catch {
    return Response.json({ ok: false, error: "Fichier introuvable." }, { status: 404 });
  }
}