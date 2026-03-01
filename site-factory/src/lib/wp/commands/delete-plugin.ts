import type { Command } from "./command";
import { sanitizeSlugLike } from "../utils/sanitize";

export type DeletePluginInput = { plugin: string };
export type DeletePluginOutput = { success: true; message: string };

export const DeletePluginCommand: Command<DeletePluginInput, DeletePluginOutput> = {
  name: "delete-plugin",
  async execute(input, ctx, deps) {
    const plugin = sanitizeSlugLike(input.plugin, "plugin");
    // deactivate best-effort
    try {
      await deps.runner(["plugin", "deactivate", plugin], deps.runnerOpts(ctx.project));
    } catch {
      // ignore
    }
    await deps.runner(["plugin", "delete", plugin], deps.runnerOpts(ctx.project));
    return { success: true, message: `Plugin ${plugin} supprimé` };
  },
};