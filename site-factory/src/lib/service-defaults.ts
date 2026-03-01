import { type DeployTargetLiteral, SERVICE_CATALOG, type StackLiteral, type OptionalServiceId, type PersistedProjectServiceRow } from "@/lib/service-catalog";
import type { DevMode, DeployTarget, TechStack } from "@/generated/prisma/client";



function toStackLiteral(ts: TechStack | null): StackLiteral | null {
  if (!ts) return null;
  // Prisma enum → string key
  return ts as unknown as StackLiteral;
}

function toDeployTargetLiteral(dt: DeployTarget): DeployTargetLiteral {
  return dt as unknown as DeployTargetLiteral;
}

function matchesDefaultFor(args: {
  svcDefaultFor: NonNullable<(typeof SERVICE_CATALOG)[number]["defaultFor"]>;
  stack: StackLiteral | null;
  target: DeployTargetLiteral;
  devMode: DevMode;
}): boolean {
  const { svcDefaultFor, stack, target, devMode } = args;

  const okStack = !svcDefaultFor.stacks || (stack !== null && svcDefaultFor.stacks.includes(stack));
  const okTarget = !svcDefaultFor.targets || svcDefaultFor.targets.includes(target);
  const okMode = !svcDefaultFor.devModes || svcDefaultFor.devModes.includes(devMode);

  return okStack && okTarget && okMode;
}

/**
 * Build default persisted ProjectService rows (optional only).
 * - deterministic: always returns same set for a given catalog
 * - safe: incompatible services are disabled
 * - DB services are excluded by design
 */
export function buildDefaultOptionalServiceRows(args: {
  techStack: TechStack | null;
  deployTarget: DeployTarget;
  devMode: DevMode;
}): PersistedProjectServiceRow[] {
  const stack = toStackLiteral(args.techStack);
  const target = toDeployTargetLiteral(args.deployTarget);

  return SERVICE_CATALOG
    .filter((svc) => !svc.isDatabase)
    .map((svc) => {
      // compat
      const compatibleStack = svc.stacks.length === 0 || (stack !== null && svc.stacks.includes(stack));
      const compatibleTarget = svc.targets.length === 0 || svc.targets.includes(target);

      let enabled = false;

      if (typeof svc.defaultEnabled === "boolean") {
        enabled = svc.defaultEnabled;
      } else if (svc.defaultFor) {
        enabled = matchesDefaultFor({ svcDefaultFor: svc.defaultFor, stack, target, devMode: args.devMode });
      } else {
        enabled = false;
      }

      // force off if incompatible
      if (!compatibleStack || !compatibleTarget) enabled = false;

      return {
        serviceId: svc.id as OptionalServiceId,
        enabled,
        optionsJson: null,
      };
    });
}