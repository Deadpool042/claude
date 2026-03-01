import type { Command } from "./command";

export type WpCronEvent = {
  hook: string;
  next_run: string;
  next_run_relative?: string;
  schedule?: string;
  interval?: string;
  args?: string;
};

export type ListCronOutput = {
  success: true;
  events: WpCronEvent[];
};

function parseCronOutput(stdout: string): WpCronEvent[] {
  const lines = stdout.split("\n").map((line) => line.trim()).filter(Boolean);
  const payload = lines[lines.length - 1] ?? "[]";
  const parsed = JSON.parse(payload) as unknown;
  if (!Array.isArray(parsed)) return [];
  return parsed.filter((item): item is WpCronEvent => {
    if (!item || typeof item !== "object") return false;
    return "hook" in item && "next_run" in item;
  });
}

export const ListCronCommand: Command<Record<string, never>, ListCronOutput> = {
  name: "list-cron",
  async execute(_input, ctx, deps) {
    const { stdout } = await deps.runner(
      [
        "cron",
        "event",
        "list",
        "--format=json",
        "--fields=hook,next_run,next_run_relative,schedule,interval,args",
      ],
      deps.runnerOpts(ctx.project),
    );

    return {
      success: true,
      events: parseCronOutput(stdout),
    };
  },
};
