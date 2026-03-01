import type { Command } from "./command";
import { sanitizeSlugLike } from "../utils/sanitize";

export type ActivateThemeInput = { theme: string };
export type ActivateThemeOutput = { success: true; message: string };

export const ActivateThemeCommand: Command<ActivateThemeInput, ActivateThemeOutput> = {
  name: "activate-theme",
  async execute(input, ctx, deps) {
    const theme = sanitizeSlugLike(input.theme, "theme");
    await deps.runner(["theme", "activate", theme], deps.runnerOpts(ctx.project));
    return { success: true, message: `Thème ${theme} activé` };
  },
};