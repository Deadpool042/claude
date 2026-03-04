import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

import { TechStack } from "@/generated/prisma/client";

import type { ComposeProjectInput, ComposeMode } from "./types";
import {  supportsProdCompose } from "./types";

import { wordpressCompose } from "./compose-wordpress";
import { nextjsCompose } from "./compose-nextjs";
import { genericCompose } from "./compose-generic";
import {
  buildWpSetupOptionsFromConfig,
  generateProjectWpDevAssets,
} from "@/lib/projects";

/** Monorepo root configs directory */
const CONFIGS_ROOT = resolve(process.cwd(), "..", "configs");

function fileNameForMode(mode: ComposeMode): string {
  switch (mode) {
    case "dev":
      return "docker-compose.local.yml";
    case "prod-like":
      return "docker-compose.prod-like.yml";
    case "prod":
      return "docker-compose.prod.yml";
  }
}

function renderCompose(input: ComposeProjectInput, mode: ComposeMode): string {
  switch (input.techStack) {
    case TechStack.WORDPRESS:
      return wordpressCompose(input, mode);
    case TechStack.NEXTJS:
      return nextjsCompose(input, mode);
    default:
      return genericCompose(input, mode);
  }
}

function buildGeneratedModes(input: ComposeProjectInput): ComposeMode[] {
  const modes: ComposeMode[] = ["dev", "prod-like"];
  if (supportsProdCompose(input.deployTarget)) modes.push("prod");
  return modes;
}

export async function generateComposeFragment(
  input: ComposeProjectInput,
  options?: { modes?: ComposeMode[] },
): Promise<string> {
  const dir = resolve(CONFIGS_ROOT, input.clientSlug, input.projectSlug);
  await mkdir(dir, { recursive: true });

  const requestedModes = options?.modes ?? buildGeneratedModes(input);
  const modes = requestedModes.filter(
    (mode) => mode !== "prod" || supportsProdCompose(input.deployTarget),
  );

  if (input.techStack === TechStack.WORDPRESS) {
    const setupOptions = buildWpSetupOptionsFromConfig(input.wpConfig ?? undefined);
    await generateProjectWpDevAssets({
      clientSlug: input.clientSlug,
      projectSlug: input.projectSlug,
      setupOptions,
      includeTheme: !(input.wpConfig?.wpHeadless ?? false),
    });
  }

  // 1) Génération des fichiers par mode
  for (const mode of modes) {
    const content = renderCompose(input, mode);
    const fileName = fileNameForMode(mode);
    await writeFile(resolve(dir, fileName), content, "utf-8");
  }

  

  return resolve(dir, "docker-compose.yml");
}
