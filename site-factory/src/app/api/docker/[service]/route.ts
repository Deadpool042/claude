import { NextResponse } from "next/server";
import { exec } from "node:child_process";
import { promisify } from "node:util";

const execAsync = promisify(exec);

const COMPOSE_DIR = process.env.COMPOSE_ROOT ?? "/Users/laurent/Desktop/claude";

interface DockerService {
  Name: string;
  State: string;
  Status: string;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ service: string }> },
): Promise<NextResponse> {
  const { service } = await params;
  try {
    const { stdout } = await execAsync(
      `docker compose ps ${service} --format json`,
      { cwd: COMPOSE_DIR },
    );

    const lines = stdout.trim().split("\n").filter(Boolean);
    if (lines.length === 0) {
      return NextResponse.json({ running: false, status: "not found" });
    }

    const info = JSON.parse(lines[0]) as DockerService;
    return NextResponse.json({
      running: info.State === "running",
      status: info.Status,
      name: info.Name,
    });
  } catch {
    return NextResponse.json({ running: false, status: "not found" });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ service: string }> },
): Promise<NextResponse> {
  const { service } = await params;
  const body = (await req.json()) as { action: string };
  const { action } = body;

  if (action !== "start" && action !== "stop") {
    return NextResponse.json(
      { success: false, error: "Invalid action (start|stop)" },
      { status: 400 },
    );
  }

  try {
    const command =
      action === "start"
        ? `docker compose up -d ${service}`
        : `docker compose stop ${service}`;

    await execAsync(command, { cwd: COMPOSE_DIR });

    return NextResponse.json({ success: true, action, service });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
