import { ServicesOrchestrator } from "../services/_components/services-orchestrator";
import type { DeployTarget } from "@/lib/referential";

// ── Types ──────────────────────────────────────────────────────────

interface TabServicesProps {
  projectId: string;
  projectSlug: string;
  techStack: string | null;
  deployTarget: DeployTarget;
}

// ── Component ──────────────────────────────────────────────────────

export function TabServices({
  projectId,
  projectSlug,
  techStack,
  deployTarget,
}: TabServicesProps) {

  return (
    <div className="space-y-6">
      <ServicesOrchestrator
        projectId={projectId}
        projectSlug={projectSlug}
        techStack={techStack}
        deployTarget={deployTarget}
      />
    </div>
  );
}
