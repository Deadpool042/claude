import { generateSlug } from "@/lib/slug";
import { findNextAvailablePort, isPortInUse } from "@/lib/port";

export async function computeNextSlug(currentSlug: string, nextName: string): Promise<{
  slug: string;
  changed: boolean;
}> {
  const slug = generateSlug(nextName);
  return { slug, changed: slug !== currentSlug };
}

export async function computeNextPort(args: {
  desiredPort: number | null;
  currentPort: number | null;
  projectId: string;
}): Promise<number> {
  const { desiredPort, currentPort, projectId } = args;

  if (desiredPort != null) {
    if (desiredPort !== currentPort) {
      const used = await isPortInUse(desiredPort, projectId);
      if (used) {
        throw new Error(`Le port ${String(desiredPort)} est déjà utilisé par un autre projet.`);
      }
    }
    return desiredPort;
  }

  if (currentPort != null) return currentPort;
  return await findNextAvailablePort();
}

export function computeLocalHost(slug: string): string {
  return `${slug}.localhost`;
}