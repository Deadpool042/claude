"use client";

import { Info } from "lucide-react";
import { DEPLOY_TARGET_LABELS } from "@/lib/validators";
import { getCompatibleServices, type StackLiteral } from "@/lib/services";

export function DeployTargetBanner(props: {
  techStack: StackLiteral;
  deployTarget: string;
  activeProfile: "dev" | "prod-like" | null;
  compatibleCount: number;
}) {
  const { techStack, deployTarget, activeProfile, compatibleCount } = props;

  if (!techStack) return null;
  if (deployTarget === "DOCKER") return null;
  if (activeProfile === "dev") return null;

  const allCount = getCompatibleServices(techStack, "DOCKER").length;
  const hidden = allCount - compatibleCount;

  return (
    <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
      <Info className="mt-0.5 size-4 shrink-0 text-amber-500" />
      <div className="text-sm">
        <p className="font-medium text-amber-600 dark:text-amber-400">
          Cible de déploiement : {DEPLOY_TARGET_LABELS[deployTarget as keyof typeof DEPLOY_TARGET_LABELS]}
        </p>
        <p className="mt-0.5 text-muted-foreground">
          {deployTarget === "SHARED_HOSTING"
            ? "L'hébergement mutualisé ne supporte pas les services Docker (Redis, Elasticsearch, Mailpit...)."
            : "Vercel ne supporte pas les services Docker auto-hébergés. Utilisez des services managés."}
        </p>
        {hidden > 0 ? (
          <p className="mt-1 text-xs text-muted-foreground">
            {hidden} service{hidden > 1 ? "s" : ""} masqué{hidden > 1 ? "s" : ""} car incompatible
            {hidden > 1 ? "s" : ""} avec cette cible.
          </p>
        ) : null}
      </div>
    </div>
  );
}
