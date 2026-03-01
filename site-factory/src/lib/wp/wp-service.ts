import type { DeployTarget } from "@/generated/prisma/client";
import type { WpProjectRef } from "./infra/wp-project-repo";
import { runWpCli, type ComposeFile, type WpCliRunnerOpts } from "./infra/wp-cli-runner";
import type { WpInfoDto } from "./wp-types";
import type { ValidWpAction } from "./wp-validators";
import { stackSlugForMode } from "@/lib/docker/names";
import { syncProjectWpMuPlugins } from "@/lib/projects/generateProjectWpDevAssets";

import { SetPermalinkCommand } from "./commands/set-permalink";
import { CreatePageCommand } from "./commands/create-page";
import { DeletePageCommand } from "./commands/delete-page";
import { InstallPluginCommand } from "./commands/install-plugin";
import { TogglePluginCommand } from "./commands/toggle-plugin";
import { DeletePluginCommand } from "./commands/delete-plugin";
import { UpdatePluginCommand } from "./commands/update-plugin";
import { SearchPluginCommand } from "./commands/search-plugin";
import { ActivateThemeCommand } from "./commands/activate-theme";
import { SetOptionCommand } from "./commands/set-option";
import { ApplyPresetCommand } from "./commands/apply-preset";
import { TestHoneypotCommand } from "./commands/test-honeypot";
import { MaintenanceStatusCommand } from "./commands/maintenance-status";
import { ListCronCommand } from "./commands/list-cron";
import { RunHealthCheckCommand } from "./commands/run-health-check";
import { RunBackupCommand } from "./commands/run-backup";
import { RunRestoreCommand } from "./commands/run-restore";

export type WpServiceDeps = {
  runner: typeof runWpCli;
  resolveComposeFile: (deployTarget: DeployTarget | null) => ComposeFile;
  runnerOpts: (project: WpProjectRef) => WpCliRunnerOpts;
};

export function createWpServiceDeps(): WpServiceDeps {
  const resolveMode = (project: WpProjectRef) =>
    project.devMode === "DEV_PROD_LIKE" || project.devMode === "PROD"
      ? "prod-like"
      : "dev";
  const composeFileForMode = (mode: "dev" | "prod-like"): ComposeFile =>
    mode === "prod-like" ? "docker-compose.prod-like.yml" : "docker-compose.local.yml";

  return {
    runner: runWpCli,
    resolveComposeFile: () => "docker-compose.local.yml",
    runnerOpts: (project) => ({
      cwd: project.dir,
      composeFile: composeFileForMode(resolveMode(project)),
      service: stackSlugForMode(project.slug, resolveMode(project)),
      timeoutMs: 30_000,
    }),
  };
}

export class WpService {
  constructor(private readonly deps: WpServiceDeps) {}

  async getInfo(project: WpProjectRef): Promise<WpInfoDto> {
    const opts = this.deps.runnerOpts(project);

    const wp = async (args: string[]): Promise<string> => {
      try {
        const { stdout } = await this.deps.runner(args, opts);
        return stdout.trim();
      } catch {
        return "";
      }
    };

    const [permalinkRaw, pagesJson, pluginsJson, themesJson, siteurl] = await Promise.all([
      wp(["option", "get", "permalink_structure"]),
      wp(["post", "list", "--post_type=page", "--post_status=publish,draft", "--fields=ID,post_title,post_status", "--format=json"]),
      wp([
        "plugin",
        "list",
        "--status=active,inactive,must-use,dropin",
        "--fields=name,status,version",
        "--format=json",
      ]),
      wp(["theme", "list", "--fields=name,status,version", "--format=json"]),
      wp(["option", "get", "siteurl"]),
    ]);

    const safeParseArr = (s: string): unknown[] => {
      try {
        return JSON.parse(s) as unknown[];
      } catch {
        return [];
      }
    };

    return {
      deployTarget: project.deployTarget,
      permalink: permalinkRaw || "/%postname%/",
      pages: safeParseArr(pagesJson),
      plugins: safeParseArr(pluginsJson),
      themes: safeParseArr(themesJson),
      siteUrl: siteurl,
    };
  }

  async executeAction(project: WpProjectRef, action: ValidWpAction): Promise<unknown> {
    const ctx = { project };

    switch (action.action) {
      case "set-permalink":
        return SetPermalinkCommand.execute(
          { structure: action.args?.structure ?? "/%postname%/" },
          ctx,
          this.deps,
        );

      case "create-page":
        return CreatePageCommand.execute(
          { title: action.args?.title ?? "Nouvelle page" },
          ctx,
          this.deps,
        );

      case "delete-page":
        return DeletePageCommand.execute(
          { pageId: action.args.pageId },
          ctx,
          this.deps,
        );

      case "install-plugin":
        await syncProjectWpMuPlugins({
          clientSlug: project.clientSlug,
          projectSlug: project.slug,
        });
        return InstallPluginCommand.execute(
          { plugin: action.args.plugin },
          ctx,
          this.deps,
        );

      case "toggle-plugin":
        return TogglePluginCommand.execute(
          { plugin: action.args.plugin, activate: action.args.activate === "true" },
          ctx,
          this.deps,
        );

      case "delete-plugin":
        return DeletePluginCommand.execute(
          { plugin: action.args.plugin },
          ctx,
          this.deps,
        );

      case "update-plugin":
        return UpdatePluginCommand.execute(
          { plugin: action.args.plugin },
          ctx,
          this.deps,
        );

      case "search-plugin":
        return SearchPluginCommand.execute(
          { search: action.args.search },
          ctx,
          this.deps,
        );

      case "activate-theme":
        return ActivateThemeCommand.execute(
          { theme: action.args.theme },
          ctx,
          this.deps,
        );

      case "set-option":
        return SetOptionCommand.execute(
          { key: action.args.key, value: action.args.value },
          ctx,
          this.deps,
        );

      case "apply-preset":
        await syncProjectWpMuPlugins({
          clientSlug: project.clientSlug,
          projectSlug: project.slug,
        });
        return ApplyPresetCommand.execute(
          { preset: action.args.preset },
          ctx,
          this.deps,
        );

      case "sync-mu-plugins":
        await syncProjectWpMuPlugins({
          clientSlug: project.clientSlug,
          projectSlug: project.slug,
        });
        return { success: true, message: "MU-plugins synchronisés" };

      case "test-honeypot":
        await syncProjectWpMuPlugins({
          clientSlug: project.clientSlug,
          projectSlug: project.slug,
        });
        return TestHoneypotCommand.execute({}, ctx, this.deps);

      case "maintenance-status":
        await syncProjectWpMuPlugins({
          clientSlug: project.clientSlug,
          projectSlug: project.slug,
        });
        return MaintenanceStatusCommand.execute({}, ctx, this.deps);

      case "list-cron":
        return ListCronCommand.execute({}, ctx, this.deps);

      case "run-health-check":
        await syncProjectWpMuPlugins({
          clientSlug: project.clientSlug,
          projectSlug: project.slug,
        });
        return RunHealthCheckCommand.execute({}, ctx, this.deps);

      case "run-backup": {
        await syncProjectWpMuPlugins({
          clientSlug: project.clientSlug,
          projectSlug: project.slug,
        });
        const backupInput: { type?: string; keep?: string } = {};
        if (action.args?.type) backupInput.type = action.args.type;
        if (action.args?.keep) backupInput.keep = action.args.keep;
        return RunBackupCommand.execute(backupInput, ctx, this.deps);
      }

      case "restore-backup": {
        await syncProjectWpMuPlugins({
          clientSlug: project.clientSlug,
          projectSlug: project.slug,
        });
        const restoreInput: { type?: string; db?: string; uploads?: string } = {};
        if (action.args?.type) restoreInput.type = action.args.type;
        if (action.args?.db) restoreInput.db = action.args.db;
        if (action.args?.uploads) restoreInput.uploads = action.args.uploads;
        return RunRestoreCommand.execute(restoreInput, ctx, this.deps);
      }

      default: {
        // Exhaustive check
        const _never: never = action;
        throw new Error("Action non supportée");
      }
    }
  }
}
