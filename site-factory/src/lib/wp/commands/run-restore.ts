import type { Command } from "./command";
import { sanitizeRelativePath } from "../utils/sanitize";

export type RunRestoreInput = {
  type?: string;
  db?: string;
  uploads?: string;
};

export type RunRestoreOutput = {
  success: true;
  status: Record<string, unknown>;
};

function parseJsonOutput(stdout: string): Record<string, unknown> {
  const lines = stdout.split("\n").map((line) => line.trim()).filter(Boolean);
  const last = lines[lines.length - 1] ?? "{}";
  const parsed = JSON.parse(last) as Record<string, unknown>;
  return parsed;
}

export const RunRestoreCommand: Command<RunRestoreInput, RunRestoreOutput> = {
  name: "restore-backup",
  async execute(input, ctx, deps) {
    const args: string[] = [
      "sf",
      "restore",
      `--client=${ctx.project.clientSlug}`,
      `--project=${ctx.project.slug}`,
    ];

    if (input.type) {
      args.push(`--type=${input.type}`);
    }
    if (input.db) {
      const dbPath = sanitizeRelativePath(input.db, "Fichier DB");
      args.push(`--db=${dbPath}`);
    }
    if (input.uploads) {
      const uploadsPath = sanitizeRelativePath(input.uploads, "Fichier uploads");
      args.push(`--uploads=${uploadsPath}`);
    }

    const { stdout } = await deps.runner(args, deps.runnerOpts(ctx.project));

    return {
      success: true,
      status: parseJsonOutput(stdout),
    };
  },
};
