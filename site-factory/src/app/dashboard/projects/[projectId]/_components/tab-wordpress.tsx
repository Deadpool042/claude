import { Wrench } from "lucide-react";
import { resolveDefaultHostingProfile } from "@/lib/projects/buildProjectCreateArgs";
import type { DeployTarget } from "@/lib/qualification";
import type { HostingProfileId } from "@/lib/hosting-profiles";
import type { DevMode } from "@/generated/prisma/client";
import { WpToolbox } from "../wordpress/_components/wp-toolbox";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface TabWordpressProps {
  projectId: string;
  projectType: string;
  deployTarget: DeployTarget;
  hostingProfileId: HostingProfileId | null;
  devMode: DevMode | null;
}

export function TabWordpress({
  projectId,
  projectType,
  deployTarget,
  hostingProfileId,
  devMode,
}: TabWordpressProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Wrench className="size-4 text-muted-foreground" />
          WordPress Toolbox
        </CardTitle>
        <CardDescription>Permaliens, pages, plugins et themes WordPress</CardDescription>
      </CardHeader>
      <div className="px-6 pb-6">
        <WpToolbox
          projectId={projectId}
          projectType={projectType}
          hostingProfileId={hostingProfileId ?? resolveDefaultHostingProfile(deployTarget)}
          devMode={devMode}
        />
      </div>
    </Card>
  );
}
