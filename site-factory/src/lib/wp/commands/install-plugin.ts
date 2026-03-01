import type { Command } from "./command";
import { sanitizeSlugLike } from "../utils/sanitize";

export type InstallPluginInput = { plugin: string };
export type InstallPluginOutput = { success: true; message: string };

export const InstallPluginCommand: Command<InstallPluginInput, InstallPluginOutput> = {
  name: "install-plugin",
  async execute(input, ctx, deps) {
    const plugin = sanitizeSlugLike(input.plugin, "plugin");
    const { stdout } = await deps.runner(["plugin", "install", plugin, "--activate"], deps.runnerOpts(ctx.project));
    return { success: true, message: stdout || `Plugin ${plugin} installé` };
  },
};