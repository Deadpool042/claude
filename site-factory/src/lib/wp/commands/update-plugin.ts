import type { Command } from "./command";
import { sanitizeSlugLike } from "../utils/sanitize";

export type UpdatePluginInput = { plugin: string };
export type UpdatePluginOutput = { success: true; message: string };

export const UpdatePluginCommand: Command<UpdatePluginInput, UpdatePluginOutput> = {
  name: "update-plugin",
  async execute(input, ctx, deps) {
    const plugin = input.plugin.trim();
    if (plugin === "--all") {
      const { stdout } = await deps.runner(["plugin", "update", "--all"], deps.runnerOpts(ctx.project));
      return { success: true, message: stdout || "Plugins mis à jour" };
    }

    const safe = sanitizeSlugLike(plugin, "plugin");
    const { stdout } = await deps.runner(["plugin", "update", safe], deps.runnerOpts(ctx.project));
    return { success: true, message: stdout || `Plugin ${safe} mis à jour` };
  },
};