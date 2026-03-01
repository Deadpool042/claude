import type { Command } from "./command";
import { sanitizeOptionKey, sanitizeFreeText } from "../utils/sanitize";

export type SetOptionInput = { key: string; value: string };
export type SetOptionOutput = { success: true; message: string };

export const SetOptionCommand: Command<SetOptionInput, SetOptionOutput> = {
  name: "set-option",
  async execute(input, ctx, deps) {
    const key = sanitizeOptionKey(input.key);
    const value = sanitizeFreeText(input.value, { max: 500 });
    await deps.runner(["option", "update", key, value], deps.runnerOpts(ctx.project));
    return { success: true, message: `Option ${key} mise à jour` };
  },
};