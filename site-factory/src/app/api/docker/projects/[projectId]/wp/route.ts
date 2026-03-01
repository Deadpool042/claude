import { NextResponse } from "next/server";
import { getWpProjectRef } from "@/lib/wp/infra/wp-project-repo";
import { WpService, createWpServiceDeps } from "@/lib/wp/wp-service";
import { WpRuntimeUnavailableError } from "@/lib/wp/infra/wp-cli-runner";
import { wpActionSchema } from "@/lib/wp/wp-validators";
import { appendActionLog, envFromDevMode } from "@/lib/logs";

const service = new WpService(createWpServiceDeps());

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ projectId: string }> },
): Promise<NextResponse> {
  const { projectId } = await params;
  const ref = await getWpProjectRef(projectId);

  if (!ref) {
    return NextResponse.json({ error: "Projet WordPress introuvable" }, { status: 404 });
  }

  try {
    const dto = await service.getInfo(ref);
    return NextResponse.json(dto);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> },
): Promise<NextResponse> {
  const { projectId } = await params;
  const ref = await getWpProjectRef(projectId);

  if (!ref) {
    return NextResponse.json({ error: "Projet WordPress introuvable" }, { status: 404 });
  }

  const json = (await req.json()) as unknown;
  const parsed = wpActionSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Payload invalide", issues: parsed.error.issues }, { status: 400 });
  }

  const env = envFromDevMode(ref.devMode);
  const maintenanceActions = new Set([
    "test-honeypot",
    "maintenance-status",
    "list-cron",
    "run-health-check",
    "run-backup",
    "restore-backup",
    "sync-mu-plugins",
  ]);
  const logType = maintenanceActions.has(parsed.data.action) ? "maintenance" : "audit";
  const args = "args" in parsed.data ? parsed.data.args ?? null : null;

  try {
    const result = await service.executeAction(ref, parsed.data);
    await appendActionLog({
      clientSlug: ref.clientSlug,
      projectSlug: ref.slug,
      projectId,
      env,
      type: logType,
      level: "info",
      source: "wp:action",
      message: `Action ${parsed.data.action} executee`,
      meta: {
        service: "wordpress",
        action: parsed.data.action,
        args,
      },
    });
    return NextResponse.json(result);
  } catch (error: unknown) {
    if (error instanceof WpRuntimeUnavailableError) {
      return NextResponse.json(
        {
          success: false,
          error: "Services Docker arretes pour cet environnement.",
        },
        { status: 503 },
      );
    }
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    await appendActionLog({
      clientSlug: ref.clientSlug,
      projectSlug: ref.slug,
      projectId,
      env,
      type: logType,
      level: "error",
      source: "wp:action",
      message: `Action ${parsed.data.action} echouee`,
      meta: {
        service: "wordpress",
        action: parsed.data.action,
        args,
        error: message,
      },
    });
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
