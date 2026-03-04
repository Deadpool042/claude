import type { Command } from "./command";
import { WP_PRESETS, type ProjectPresetType } from "@/lib/wp";
import { resolveWpPlugins } from "@/lib/wp";
import { resolveDefaultHostingProfile } from "@/lib/projects";
import { DeployTarget } from "@/generated/prisma/client";

export type ApplyPresetInput = { preset: string };
export type ApplyPresetOutput = { success: true; message: string; details: string[] };

export const ApplyPresetCommand: Command<ApplyPresetInput, ApplyPresetOutput> = {
  name: "apply-preset",
  async execute(input, ctx, deps) {
    const presetType = input.preset as ProjectPresetType;

    if (!presetType || !(presetType in WP_PRESETS)) {
      throw new Error("preset invalide");
    }

    const preset = WP_PRESETS[presetType];
    const results: string[] = [];
    const runnerOpts = deps.runnerOpts(ctx.project);

    const wp = async (args: string[]) => {
      const { stdout } = await deps.runner(args, runnerOpts);
      return stdout.trim();
    };
    const isThemeInstalled = async (slug: string): Promise<boolean> => {
      try {
        await wp(["theme", "is-installed", slug]);
        return true;
      } catch {
        return false;
      }
    };

    // 1) permalinks
    await wp(["rewrite", "structure", preset.permalink]);
    await wp(["rewrite", "flush"]);
    results.push(`✅ Permaliens : ${preset.permalink}`);

    // 2) delete pages
    try {
      const existingIdsJson = await wp(["post", "list", "--post_type=page", "--post_status=any", "--field=ID", "--format=json"]);
      const existingIds = JSON.parse(existingIdsJson || "[]") as Array<number | string>;
      const ids = existingIds.map(String).filter(Boolean);
      if (ids.length > 0) {
        await wp(["post", "delete", ...ids, "--force"]);
        results.push(`🧹 ${String(ids.length)} page(s) supprimée(s)`);
      }
    } catch {
      results.push("⚠️ Impossible de supprimer les pages existantes");
    }

    // 3) create pages
    let frontPageId: string | null = null;

    for (const page of preset.pages) {
      try {
        const args: string[] = [
          "post",
          "create",
          "--post_type=page",
          `--post_title=${page.title}`,
          `--post_name=${page.slug}`,
          "--post_status=publish",
        ];

        if (page.content) {
          // on passe en args, pas en shell string (donc OK)
          args.push(`--post_content=${page.content}`);
        }

        args.push("--porcelain");

        const id = await wp(args);
        results.push(`📄 Page "${page.title}" créée (ID: ${id})`);
        if (page.isFrontPage && id) frontPageId = id;
      } catch {
        results.push(`⚠️ Page "${page.title}" — erreur de création`);
      }
    }

    // 4) set front page
    if (frontPageId) {
      await wp(["option", "update", "show_on_front", "page"]);
      await wp(["option", "update", "page_on_front", frontPageId]);
      results.push("🏠 Page d'accueil statique configurée");
    }

    // 5) delete plugins (best-effort)
    try {
      const existingPluginsJson = await wp(["plugin", "list", "--status=active,inactive", "--field=name", "--format=json"]);
      const existingPlugins = JSON.parse(existingPluginsJson || "[]") as string[];
      const list = existingPlugins.map(String).filter(Boolean);
      if (list.length > 0) {
        try {
          await wp(["plugin", "deactivate", ...list]);
        } catch {
          // ignore
        }
        await wp(["plugin", "delete", ...list]);
        results.push(`🧹 ${String(list.length)} plugin(s) supprimé(s)`);
      }
    } catch {
      results.push("⚠️ Impossible de supprimer les plugins existants");
    }

    // 6) resolver plugins
    const deployTarget = ctx.project.deployTarget ?? DeployTarget.DOCKER;
    const profileId = ctx.project.hostingProfileId ?? resolveDefaultHostingProfile(deployTarget);
    const resolved = resolveWpPlugins(preset.features, {
      profileId,
      excludeFreemium: ctx.project.excludeFreemium ?? false,
    });
    for (const w of resolved.warnings) results.push(w);

    for (const plugin of resolved.plugins) {
      try {
        const args: string[] = ["plugin", "install", plugin.slug];
        if (plugin.activate) args.push("--activate");
        await wp(args);
        results.push(`🔌 Plugin "${plugin.label}" installé${plugin.activate ? " et activé" : ""}`);
      } catch {
        results.push(`⚠️ Plugin "${plugin.label}" — erreur d'installation`);
      }
    }

    // 7) theme
    const childTheme = "sf-tt5";
    const parentTheme = "twentytwentyfive";
    const ensureParentTheme = async () => {
      if (await isThemeInstalled(parentTheme)) return;
      try {
        await wp(["theme", "install", parentTheme]);
        results.push(`🎨 Thème parent "${parentTheme}" installé`);
      } catch {
        results.push(`⚠️ Thème parent "${parentTheme}" — erreur d'installation`);
      }
    };

    if (preset.theme === childTheme) {
      await ensureParentTheme();
      if (await isThemeInstalled(childTheme)) {
        try {
          await wp(["theme", "activate", childTheme]);
          results.push(`🎨 Thème enfant "${childTheme}" activé`);
        } catch {
          results.push(`⚠️ Thème enfant "${childTheme}" — erreur`);
        }
      } else {
        results.push(`⚠️ Thème enfant "${childTheme}" introuvable`);
      }
    } else {
      try {
        await wp(["theme", "install", preset.theme, "--activate"]);
        results.push(`🎨 Thème "${preset.theme}" installé et activé`);
      } catch {
        results.push(`⚠️ Thème "${preset.theme}" — erreur`);
      }

      await ensureParentTheme();
      if (await isThemeInstalled(childTheme)) {
        try {
          await wp(["theme", "activate", childTheme]);
          results.push(`🎨 Thème enfant "${childTheme}" activé`);
        } catch {
          results.push(`⚠️ Thème enfant "${childTheme}" — erreur`);
        }
      }
    }

    // 8) cleanup default post
    try {
      await wp(["post", "delete", "1", "--force"]);
      results.push("🧹 Contenu par défaut supprimé");
    } catch {
      // ignore
    }

    return {
      success: true,
      message: `Preset "${preset.label}" appliqué`,
      details: results,
    };
  },
};
