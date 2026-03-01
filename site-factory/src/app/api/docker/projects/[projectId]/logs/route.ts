import { resolve } from "node:path";
import { spawn } from "node:child_process";
import { prisma } from "@/lib/db";
import { stackSlugForMode } from "@/lib/docker/names";

const CONFIGS_ROOT = resolve(process.cwd(), "..", "configs");

export const dynamic = "force-dynamic";

type ComposeMode = "dev" | "prod-like";

function parseMode(req: Request): ComposeMode {
  const url = new URL(req.url);
  return url.searchParams.get("mode") === "prod-like" ? "prod-like" : "dev";
}

function composeFileForMode(mode: ComposeMode): string {
  return mode === "prod-like" ? "docker-compose.prod-like.yml" : "docker-compose.local.yml";
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> },
): Promise<Response> {
  const { projectId } = await params;
  const searchParams = new URL(req.url).searchParams;
  const service = searchParams.get("service") ?? undefined;
  const mode = parseMode(req);

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      slug: true,
      client: { select: { slug: true } },
    },
  });

  if (!project) {
    return new Response("Projet introuvable", { status: 404 });
  }

  const { slug: clientSlug } = project.client as { slug: string };
  const dir = resolve(CONFIGS_ROOT, clientSlug, project.slug);
  const composeFile = composeFileForMode(mode);
  const projectName = stackSlugForMode(project.slug, mode);

  const args = ["compose", "-p", projectName, "-f", composeFile, "logs", "--follow", "--tail", "80", "--no-color"];
  if (service) args.push(service);

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const proc = spawn("docker", args, { cwd: dir, stdio: ["ignore", "pipe", "pipe"] });

      function send(data: string) {
        const lines = data.split("\n");
        for (const line of lines) {
          if (line.trim()) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(line)}\n\n`));
          }
        }
      }

      proc.stdout.on("data", (chunk: Buffer) => {
        send(chunk.toString());
      });

      proc.stderr.on("data", (chunk: Buffer) => {
        send(chunk.toString());
      });

      proc.on("error", () => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify("[Erreur de connexion aux logs Docker]")}\n\n`));
        controller.close();
      });

      proc.on("close", () => {
        try { controller.close(); } catch { /* already closed */ }
      });

      // Cleanup on client disconnect
      req.signal.addEventListener("abort", () => {
        proc.kill("SIGTERM");
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
