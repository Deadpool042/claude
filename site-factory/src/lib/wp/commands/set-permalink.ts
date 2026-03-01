import type { Command } from "./command";
import { sanitizePermalinkStructure } from "../utils/sanitize";

export type SetPermalinkInput = { structure: string };
export type SetPermalinkOutput = { success: true; message: string };

export const SetPermalinkCommand: Command<SetPermalinkInput, SetPermalinkOutput> = {
  name: "set-permalink",
  async execute(input, ctx, deps) {
    const structure = sanitizePermalinkStructure(input.structure || "/%postname%/");
    await deps.runner(["rewrite", "structure", structure], deps.runnerOpts(ctx.project));
    await deps.runner(["rewrite", "flush"], deps.runnerOpts(ctx.project));
    return { success: true, message: `Permaliens mis à jour : ${structure}` };
  },
};