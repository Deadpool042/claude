import { readdir, stat } from "node:fs/promises";
import { resolve } from "node:path";
import { Settings, FileCode } from "lucide-react";
import { PageLayout } from "@/components/shell/page-layout";
import { EmptyState } from "@/components/shell/empty-state";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ComposePreview } from "@/features/dashboard/configs";

type ComposeMode = "dev" | "prod-like";

interface ConfigEntry {
  client: string;
  project: string;
  modes: ComposeMode[];
  paths: Record<ComposeMode, string>;
}

async function exists(path: string): Promise<boolean> {
  try {
    const s = await stat(path);
    return s.isFile();
  } catch {
    return false;
  }
}

async function getConfigTree(): Promise<ConfigEntry[]> {
  const configsRoot = resolve(process.cwd(), "..", "configs");
  const entries: ConfigEntry[] = [];

  // Si ../configs n'existe pas, on retourne vide
  try {
    const rootStat = await stat(configsRoot);
    if (!rootStat.isDirectory()) return [];
  } catch {
    return [];
  }

  const clients = await readdir(configsRoot);

  for (const client of clients) {
    const clientDir = resolve(configsRoot, client);

    let clientStat;
    try {
      clientStat = await stat(clientDir);
    } catch {
      continue;
    }
    if (!clientStat.isDirectory()) continue;

    const projects = await readdir(clientDir);

    for (const project of projects) {
      const projectDir = resolve(clientDir, project);

      let projectStat;
      try {
        projectStat = await stat(projectDir);
      } catch {
        continue;
      }
      if (!projectStat.isDirectory()) continue;

      const localPath = resolve(projectDir, "docker-compose.local.yml");
      const prodLikePath = resolve(projectDir, "docker-compose.prod-like.yml");

      const hasLocal = await exists(localPath);
      const hasProdLike = await exists(prodLikePath);

      if (!hasLocal && !hasProdLike) continue;

      const modes: ComposeMode[] = [];
      const paths: Record<ComposeMode, string> = {
        dev: `configs/${client}/${project}/docker-compose.local.yml`,
        "prod-like": `configs/${client}/${project}/docker-compose.prod-like.yml`,
      };

      if (hasLocal) modes.push("dev");
      if (hasProdLike) modes.push("prod-like");

      entries.push({ client, project, modes, paths });
    }
  }

  // tri stable (client puis project)
  entries.sort((a, b) => {
    const c = a.client.localeCompare(b.client);
    if (c !== 0) return c;
    return a.project.localeCompare(b.project);
  });

  return entries;
}

export default async function ConfigsPage() {
  const configs = await getConfigTree();

  return (
    <PageLayout
      title="Configurations"
      description="docker-compose générés par projet (dev / prod-like)"
    >
      {configs.length === 0 ? (
        <EmptyState
          icon={<Settings className="size-6 text-muted-foreground" />}
          title="Aucune configuration"
          description="Les fichiers docker-compose seront générés automatiquement lors de la création de projets."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {configs.map((config) => (
            <Card key={`${config.client}/${config.project}`}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <FileCode className="size-4" />
                  {config.project}
                </CardTitle>
                <CardDescription>Client : {config.client}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {config.modes.map((m) => (
                    <span
                      key={m}
                      className="rounded-md border px-2 py-0.5 text-xs text-muted-foreground"
                    >
                      {m === "dev" ? "dev" : "prod-like"}
                    </span>
                  ))}
                </div>

                {config.modes.includes("dev") && (
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-xs font-medium">docker-compose.local.yml</div>
                      <code className="block truncate text-xs text-muted-foreground">
                        {config.paths.dev}
                      </code>
                    </div>

                    <ComposePreview
                      title={`${config.project} — dev`}
                      description={`Client: ${config.client}`}
                      client={config.client}
                      project={config.project}
                      mode="dev"
                      pathLabel={config.paths.dev}
                    />
                  </div>
                )}

                {config.modes.includes("prod-like") && (
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-xs font-medium">docker-compose.prod-like.yml</div>
                      <code className="block truncate text-xs text-muted-foreground">
                        {config.paths["prod-like"]}
                      </code>
                    </div>

                    <ComposePreview
                      title={`${config.project} — prod-like`}
                      description={`Client: ${config.client}`}
                      client={config.client}
                      project={config.project}
                      mode="prod-like"
                      pathLabel={config.paths["prod-like"]}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </PageLayout>
  );
}