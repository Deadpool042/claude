import type { Command } from "./command";

export type RunHealthCheckOutput = {
  success: true;
  status: Record<string, unknown>;
};

function parseJsonOutput(stdout: string): Record<string, unknown> {
  const lines = stdout.split("\n").map((line) => line.trim()).filter(Boolean);
  const last = lines[lines.length - 1] ?? "{}";
  const parsed = JSON.parse(last) as Record<string, unknown>;
  return parsed;
}

export const RunHealthCheckCommand: Command<Record<string, never>, RunHealthCheckOutput> = {
  name: "run-health-check",
  async execute(_input, ctx, deps) {
    const { stdout } = await deps.runner(
      [
        "sf",
        "health-check",
        `--client=${ctx.project.clientSlug}`,
        `--project=${ctx.project.slug}`,
      ],
      deps.runnerOpts(ctx.project)
    );

    return {
      success: true,
      status: parseJsonOutput(stdout),
    };
  },
};
