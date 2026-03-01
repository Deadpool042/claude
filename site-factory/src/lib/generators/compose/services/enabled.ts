import { SERVICE_CATALOG } from "@/lib/service-catalog";
import type { DeployTarget } from "@/generated/prisma/client";
import type { ComposeMode } from "../types";

/** Optional services enabled? (mode + target filtering) */
export function isServiceEnabledForMode(
  serviceId: string,
  enabledIds: Set<string>,
  deployTarget: DeployTarget,
  mode: ComposeMode,
): boolean {
  if (!enabledIds.has(serviceId)) return false;
  if (mode === "dev") return true;

  const svc = SERVICE_CATALOG.find((s) => s.id === serviceId);
  if (!svc) return false;

  // prod-like / prod : on exclut les services "dev" (ex: phpmyadmin, mailpit)
  if (svc.env === "dev") return false;

  // targets: DOCKER/VERCEL/SHARED_HOSTING etc.
  if (svc.targets.length > 0 && !svc.targets.includes(deployTarget)) return false;

  return true;
}