import { ProjectConfigPanel } from "./project-config-panel";
import {
  isStackLiteral,
  isDeployTargetLiteral,
  type StackLiteral,
  type DeployTargetLiteral,
} from "@/lib/service-catalog";
import type { DevMode } from "@/generated/prisma/client";

interface TabInfrastructureProps {
  projectId: string;
  techStack: string | null;
  deployTarget: string;
  devMode: DevMode;
  database: {
    dbType: string;
    dbVersion: string;
    dbName: string | null;
    dbUser: string | null;
    dbPassword: string | null;
  } | null;
  wpConfig: {
    phpVersion: string;
    wpSiteTitle: string | null;
    wpAdminUser: string | null;
    wpAdminPassword: string | null;
    wpAdminEmail: string | null;
  } | null;
  nextConfig: {
    nodeVersion: string;
    envVarsJson: string | null;
  } | null;
  enabledServiceIds: string[];
}

export function TabInfrastructure(props: TabInfrastructureProps) {
  const techStackLiteral: StackLiteral | null = isStackLiteral(props.techStack)
    ? props.techStack
    : null;

  const deployTargetLiteral: DeployTargetLiteral = isDeployTargetLiteral(props.deployTarget)
    ? props.deployTarget
    : "DOCKER";

  return (
    <ProjectConfigPanel
      key={props.enabledServiceIds.join(",")}
      projectId={props.projectId}
      techStack={techStackLiteral}
      deployTarget={deployTargetLiteral}
      devMode={props.devMode}
      database={props.database}
      wpConfig={props.wpConfig}
      nextConfig={props.nextConfig}
      enabledServiceIds={props.enabledServiceIds}
    />
  );
}
