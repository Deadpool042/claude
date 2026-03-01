import type { Command } from "./command";

export type RunBackupInput = {
  type?: string;
  keep?: string;
};

export type RunBackupOutput = {
  success: true;
  status: Record<string, unknown>;
};

function parseJsonOutput(stdout: string): Record<string, unknown> {
  const lines = stdout.split("\n").map((line) => line.trim()).filter(Boolean);
  const last = lines[lines.length - 1] ?? "{}";
  const parsed = JSON.parse(last) as Record<string, unknown>;
  return parsed;
}

export const RunBackupCommand: Command<RunBackupInput, RunBackupOutput> = {
  name: "run-backup",
  async execute(input, ctx, deps) {
    const type = input.type ?? "full";
    const keep = input.keep ?? "14";
    const { stdout } = await deps.runner(
      [
        "sf",
        "backup",
        `--client=${ctx.project.clientSlug}`,
        `--project=${ctx.project.slug}`,
        `--type=${type}`,
        `--keep=${keep}`,
      ],
      deps.runnerOpts(ctx.project)
    );

    return {
      success: true,
      status: parseJsonOutput(stdout),
    };
  },
};
