// use-project-config-panel.ts
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getCompatibleServices,
  groupByCategory,
  isRecommended,
  isDeployTargetLiteral,
  type DeployTargetLiteral,
  type CatalogService,
  type ServiceId,
} from "@/lib/services";
import type { ActiveProfile, ProjectConfigPanelProps } from "./project-config-panel.types";
import { buildEnabledSet, serializeEnvVars } from "./project-config-panel.helpers";

export function useProjectConfigPanelState(props: ProjectConfigPanelProps) {
  const { techStack, deployTarget, database, enabledServiceIds, nextConfig } = props;

  const isWordpress = techStack === "WORDPRESS";
  const isNextjs = techStack === "NEXTJS";

  const [activeProfile, setActiveProfile] = useState<ActiveProfile>(null);

  const [enabledServices, setEnabledServices] = useState<Set<ServiceId>>(() =>
    buildEnabledSet({ database, enabledServiceIds, techStack }),
  );

  useEffect(() => {
    setEnabledServices(buildEnabledSet({ database, enabledServiceIds, techStack }));
  }, [enabledServiceIds, database, techStack]);

  const [dbType, setDbType] = useState<string>(
    database?.dbType ?? (isWordpress ? "MARIADB" : "POSTGRESQL"),
  );

  const [envVars, setEnvVars] = useState<{ key: string; value: string }[]>(() => {
    if (!nextConfig?.envVarsJson) return [];
    try {
      const parsed = JSON.parse(nextConfig.envVarsJson) as Record<string, string>;
      return Object.entries(parsed).map(([key, value]) => ({ key, value }));
    } catch {
      return [];
    }
  });

  const envVarsJson = useMemo(() => serializeEnvVars(envVars), [envVars]);

  // ✅ normalize deployTarget once
  const deployTargetLiteral: DeployTargetLiteral = isDeployTargetLiteral(deployTarget)
    ? deployTarget
    : "DOCKER";

  const effectiveTarget: DeployTargetLiteral =
    activeProfile === "dev" ? "DOCKER" : deployTargetLiteral;

  const envFilter = activeProfile === "prod-like" ? ("prod" as const) : undefined;

  const compatibleServices = useMemo(
    () => getCompatibleServices(techStack, effectiveTarget, envFilter),
    [techStack, effectiveTarget, envFilter],
  );

  const groups = useMemo(() => groupByCategory(compatibleServices), [compatibleServices]);

  const hasDb = enabledServices.has("db-mariadb") || enabledServices.has("db-postgresql");

  function toggleService(svcId: ServiceId, svc: CatalogService) {
    setEnabledServices((prev) => {
      const next = new Set(prev);

      if (next.has(svcId)) {
        next.delete(svcId);

        if (svc.isDatabase) {
          for (const s of compatibleServices) {
            if (s.requires === svcId) next.delete(s.id);
          }
        }
        return next;
      }

      next.add(svcId);

      if (svc.isDatabase) {
        for (const s of compatibleServices) {
          if (s.isDatabase && s.id !== svcId) {
            next.delete(s.id);
            for (const dep of compatibleServices) {
              if (dep.requires === s.id) next.delete(dep.id);
            }
          }
        }
        if (svcId === "db-mariadb") setDbType("MARIADB");
        if (svcId === "db-postgresql") setDbType("POSTGRESQL");
      }

      if (svc.requires && !next.has(svc.requires)) {
        next.add(svc.requires);
        if (svc.requires === "db-mariadb") setDbType("MARIADB");
        if (svc.requires === "db-postgresql") setDbType("POSTGRESQL");
      }

      return next;
    });
  }

  function addEnvVar() {
    setEnvVars((prev) => [...prev, { key: "", value: "" }]);
  }
  function removeEnvVar(index: number) {
    setEnvVars((prev) => prev.filter((_, i) => i !== index));
  }
  function updateEnvVar(index: number, field: "key" | "value", val: string) {
    setEnvVars((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: val } : item)));
  }

  const recommendedFn = useMemo(() => (svc: CatalogService) => isRecommended(svc, techStack), [techStack]);

  return {
    techStack,
    deployTargetLiteral, // (optionnel, utile si tu veux)
    isWordpress,
    isNextjs,
    hasDb,

    activeProfile,
    setActiveProfile,
    enabledServices,
    dbType,
    setDbType,
    envVars,
    envVarsJson,

    effectiveTarget,
    envFilter,
    compatibleServices,
    groups,
    recommendedFn,

    toggleService,
    addEnvVar,
    removeEnvVar,
    updateEnvVar,
    setEnabledServices,
  };
}