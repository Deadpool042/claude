import type { Command } from "./command";
import { sanitizeFreeText } from "../utils/sanitize";

export type CreatePageInput = { title: string };
export type CreatePageOutput = { success: true; message: string; pageId: string };

export const CreatePageCommand: Command<CreatePageInput, CreatePageOutput> = {
  name: "create-page",
  async execute(input, ctx, deps) {
    const title = sanitizeFreeText(input.title || "Nouvelle page", { max: 120 });
    const { stdout } = await deps.runner(
      ["post", "create", "--post_type=page", `--post_title=${title}`, "--post_status=publish", "--porcelain"],
      deps.runnerOpts(ctx.project),
    );
    return { success: true, message: `Page créée (ID: ${stdout})`, pageId: stdout };
  },
};