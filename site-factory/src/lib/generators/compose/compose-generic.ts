import type { ComposeMode, ComposeProjectInput } from "./types";
import { parseEnvVars } from "./shared/env";
import { composeHeader } from "./shared/header";
import { stackSlugForMode } from "@/lib/docker";

export function genericCompose(input: ComposeProjectInput, mode: ComposeMode): string {
  const customEnv = parseEnvVars(input.nextConfig?.envVarsJson ?? null);
  const envEntries = Object.entries(customEnv);
  const stackSlug = stackSlugForMode(input.projectSlug, mode);

  const lines: string[] = [
    composeHeader(input, mode),
    "services:",
    `  ${stackSlug}:`,
    "    image: node:22-alpine",
    "    restart: unless-stopped",
    "    working_dir: /app",
  ];

  if (envEntries.length > 0) {
    lines.push("    environment:");
    for (const [k, v] of envEntries) lines.push(`      ${k}: "${v}"`);
  }

  lines.push(
    "    networks:",
    "      - proxy",
    "",
    "networks:",
    "  proxy:",
    "    external: true",
    "",
  );

  return lines.join("\n");
}
