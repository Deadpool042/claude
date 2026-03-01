export type LocalStackMode = "dev" | "prod-like" | "prod";

export function stackSlugForMode(projectSlug: string, mode: LocalStackMode): string {
  if (mode === "dev") return `${projectSlug}-dev`;
  if (mode === "prod-like") return `${projectSlug}-prod-like`;
  return projectSlug;
}

export function localHostBase(clientSlug: string, projectSlug: string, mode: LocalStackMode): string {
  if (mode === "dev") return `${clientSlug}-${projectSlug}-dev`;
  if (mode === "prod-like") return `${clientSlug}-${projectSlug}-prod-like`;
  return projectSlug;
}

export function localHostForMode(clientSlug: string, projectSlug: string, mode: LocalStackMode): string {
  return `${localHostBase(clientSlug, projectSlug, mode)}.localhost`;
}

export function localServiceHost(
  prefix: string,
  clientSlug: string,
  projectSlug: string,
  mode: LocalStackMode,
): string {
  return `${prefix}-${localHostBase(clientSlug, projectSlug, mode)}.localhost`;
}
