import type { Command } from "./command";
import { sanitizeFreeText } from "../utils/sanitize";

export type SearchPluginInput = { search: string };
export type SearchPluginOutput = { success: true; plugins: unknown[] };

export const SearchPluginCommand: Command<SearchPluginInput, SearchPluginOutput> = {
  name: "search-plugin",
  async execute(input, ctx, deps) {
    const search = sanitizeFreeText(input.search, { max: 80 });
    const { stdout } = await deps.runner(
      ["plugin", "search", search, "--fields=name,slug,version,rating", "--format=json"],
      deps.runnerOpts(ctx.project),
    );

    let plugins: unknown[] = [];
    try {
      plugins = JSON.parse(stdout || "[]") as unknown[];
    } catch {
      plugins = [];
    }

    return { success: true, plugins };
  },
};