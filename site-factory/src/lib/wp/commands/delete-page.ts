import type { Command } from "./command";
import { sanitizeSlugLike } from "../utils/sanitize";

export type DeletePageInput = { pageId: string };
export type DeletePageOutput = { success: true; message: string };

export const DeletePageCommand: Command<DeletePageInput, DeletePageOutput> = {
  name: "delete-page",
  async execute(input, ctx, deps) {
    const pageId = sanitizeSlugLike(input.pageId, "pageId");
    await deps.runner(["post", "delete", pageId, "--force"], deps.runnerOpts(ctx.project));
    return { success: true, message: `Page ${pageId} supprimée` };
  },
};