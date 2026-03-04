"use client";

import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ENV_LABELS, type CatalogService, type ServiceId } from "@/lib/services";
import { envBadgeVariant } from "./project-config-panel.helpers";

export function ServiceCatalogSection(props: {
  groups: { category: string; label: string; services: CatalogService[] }[];
  enabledServices: Set<ServiceId>;
  compatibleServices: CatalogService[];
  isWordpress: boolean;
  activeProfile: "dev" | "prod-like" | null;
  isRecommended: (svc: CatalogService) => boolean;
  onToggle: (svcId: ServiceId, svc: CatalogService) => void;
  renderIcon: (iconName: string) => React.ReactNode;
}) {
  const {
    groups,
    enabledServices,
    compatibleServices,
    isWordpress,
    activeProfile,
    isRecommended,
    onToggle,
    renderIcon,
  } = props;

  return (
    <div className="space-y-5">
      {groups.map((group) => (
        <div key={group.category}>
          <h3 className="mb-2 text-sm font-medium text-muted-foreground">{group.label}</h3>
          <div className="grid gap-2 sm:grid-cols-2">
            {group.services.map((svc) => {
              const enabled = enabledServices.has(svc.id);
              const recommended = isRecommended(svc);
              const requiresMissing = svc.requires && !enabledServices.has(svc.requires);
              const isMandatory = isWordpress && svc.isDatabase && svc.id === "db-mariadb";

              const excludedInProdLike = activeProfile === "prod-like" && enabled && svc.env === "dev";

              return (
                <button
                  key={svc.id}
                  type="button"
                  disabled={isMandatory}
                  onClick={() => onToggle(svc.id, svc)}
                  className={`relative flex items-start gap-3 rounded-lg border p-3 text-left transition-colors ${
                    excludedInProdLike
                      ? "border-amber-500/30 bg-amber-500/5 opacity-60"
                      : enabled
                        ? "border-primary/50 bg-primary/5"
                        : "border-border hover:border-muted-foreground/30 hover:bg-muted/30"
                  } ${isMandatory ? "cursor-not-allowed opacity-70" : "cursor-pointer"}`}
                >
                  <div
                    className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md ${
                      enabled ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {renderIcon(svc.icon)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-medium">{svc.name}</span>
                      {recommended ? <Star className="size-3 fill-amber-400 text-amber-400" /> : null}
                      <Badge variant={envBadgeVariant(svc.env)} className="px-1 py-0 text-[10px]">
                        {ENV_LABELS[svc.env]}
                      </Badge>
                      {isMandatory ? (
                        <Badge variant="outline" className="px-1 py-0 text-[10px]">
                          Requis
                        </Badge>
                      ) : null}
                    </div>

                    <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{svc.description}</p>

                    {requiresMissing ? (
                      <p className="mt-1 text-xs text-amber-500">
                        Nécessite{" "}
                        {compatibleServices.find((s) => s.id === svc.requires)?.name ?? svc.requires}
                      </p>
                    ) : null}

                    {excludedInProdLike ? (
                      <p className="mt-1 text-xs text-amber-500">Exclu du docker-compose.prod-like.yml</p>
                    ) : null}
                  </div>

                  <div
                    className={`mt-1 flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                      enabled ? "border-primary bg-primary" : "border-muted-foreground/30"
                    }`}
                  >
                    {enabled ? (
                      <svg className="size-3 text-primary-foreground" viewBox="0 0 12 12" fill="none">
                        <path
                          d="M2 6l3 3 5-5"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}