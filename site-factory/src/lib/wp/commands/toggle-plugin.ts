import type { Command } from "./command";
import { sanitizeSlugLike } from "../utils/sanitize";

export type TogglePluginInput = { plugin: string; activate: boolean };
export type TogglePluginOutput = { success: true; message: string };

export const TogglePluginCommand: Command<TogglePluginInput, TogglePluginOutput> = {
  name: "toggle-plugin",
  async execute(input, ctx, deps) {
    const plugin = sanitizeSlugLike(input.plugin, "plugin");
    const cmd = input.activate ? ["plugin", "activate", plugin] : ["plugin", "deactivate", plugin];
    await deps.runner(cmd, deps.runnerOpts(ctx.project));
    return { success: true, message: `Plugin ${plugin} ${input.activate ? "activé" : "désactivé"}` };
  },
};