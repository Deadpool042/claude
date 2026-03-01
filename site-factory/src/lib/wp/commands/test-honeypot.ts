import type { Command } from "./command";

export type TestHoneypotOutput = {
  success: boolean;
  ok?: boolean;
  message: string;
  details?: {
    cf7_active: boolean;
    empty_pass: boolean | null;
    filled_blocked: boolean | null;
  };
};

type HoneypotDetails = {
  cf7_active: boolean;
  empty_pass: boolean | null;
  filled_blocked: boolean | null;
};

export const TestHoneypotCommand: Command<Record<string, never>, TestHoneypotOutput> = {
  name: "test-honeypot",
  async execute(_input, ctx, deps) {
    const { stdout } = await deps.runner(
      ["sf", "honeypot-test"],
      deps.runnerOpts(ctx.project)
    );

    const lines = stdout.split("\n").map((l) => l.trim()).filter(Boolean);
    const last = lines[lines.length - 1] ?? "";

    try {
      const parsed = JSON.parse(last) as Partial<HoneypotDetails> | null;
      if (!parsed || typeof parsed.cf7_active !== "boolean") {
        throw new Error("Invalid honeypot output");
      }
      const details: HoneypotDetails = {
        cf7_active: parsed.cf7_active,
        empty_pass: typeof parsed.empty_pass === "boolean" ? parsed.empty_pass : null,
        filled_blocked: typeof parsed.filled_blocked === "boolean" ? parsed.filled_blocked : null,
      };
      const ok = Boolean(details.cf7_active && details.empty_pass && details.filled_blocked);
      return {
        success: true,
        ok,
        details,
        message: ok
          ? "Honeypot OK"
          : "Honeypot KO (verifier CF7 et MU-plugin)",
      };
    } catch {
      return {
        success: false,
        message: "Impossible de lire le resultat du test honeypot.",
      };
    }
  },
};
