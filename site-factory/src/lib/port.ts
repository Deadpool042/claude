import { prisma } from "@/lib/db";
import { PROJECT_PORT_MIN, PROJECT_PORT_MAX } from "@/lib/validators/project";

/**
 * Find the next available port in the PROJECT_PORT range.
 * Queries all assigned ports from ProjectRuntime and returns the lowest unused one.
 * Throws if all ports are exhausted.
 */
export async function findNextAvailablePort(): Promise<number> {
  const usedPorts = await prisma.projectRuntime.findMany({
    where: { port: { not: null } },
    select: { port: true },
    orderBy: { port: "asc" },
  });

  const usedSet = new Set(
    usedPorts
      .map((p) => p.port)
      .filter((port): port is number => port !== null),
  );

  for (let port = PROJECT_PORT_MIN; port <= PROJECT_PORT_MAX; port++) {
    if (!usedSet.has(port)) {
      return port;
    }
  }

  throw new Error(
    `Tous les ports entre ${String(PROJECT_PORT_MIN)} et ${String(PROJECT_PORT_MAX)} sont utilisés.`,
  );
}

/**
 * Check if a specific port is already in use by another project.
 * Optionally exclude a project ID (for updates).
 */
export async function isPortInUse(
  port: number,
  excludeProjectId?: string,
): Promise<boolean> {
  const existing = await prisma.projectRuntime.findFirst({
    where: {
      port,
      ...(excludeProjectId ? { projectId: { not: excludeProjectId } } : {}),
    },
  });
  return existing !== null;
}
