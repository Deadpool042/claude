import "dotenv/config";
import { PrismaClient, type DeployTarget } from "../src/generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { getPresetForType } from "../src/lib/wp-presets";
import {
  resolveWpPlugins,
  serializeResolvedPlugins,
} from "../src/lib/wp-plugin-resolver";
import {
  NON_PLUGIN_FEATURES,
  WP_FEATURE_LABELS,
  type WpFeature,
} from "../src/lib/wp-features";
import { normalizeInfraStatus, parseInfraStatus } from "../src/lib/wp-infra";
import { resolveDefaultHostingProfile } from "../src/lib/projects/buildProjectCreateArgs";
import type { HostingProfileId } from "../src/lib/hosting-profiles";

const adapter = new PrismaMariaDb(process.env.DATABASE_URL ?? "");
const prisma = new PrismaClient({ adapter });

const VALID_FEATURES = new Set(Object.keys(WP_FEATURE_LABELS) as WpFeature[]);
const REQUIRED_FEATURES: WpFeature[] = [...NON_PLUGIN_FEATURES];

function parseFeatures(raw: string | null | undefined): WpFeature[] | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    const filtered = parsed.filter((f) => VALID_FEATURES.has(f as WpFeature)) as WpFeature[];
    return filtered.length > 0 ? filtered : null;
  } catch {
    return null;
  }
}

function mergeFeatures(base: WpFeature[], required: WpFeature[]): { features: WpFeature[]; changed: boolean } {
  const set = new Set(base);
  let changed = false;
  for (const f of required) {
    if (!set.has(f)) {
      set.add(f);
      changed = true;
    }
  }
  return { features: Array.from(set), changed };
}

function resolveTheme(params: {
  wpHeadless: boolean;
  wpTheme: string | null;
}): { theme: string | null; changed: boolean } {
  const { wpHeadless, wpTheme } = params;
  if (wpHeadless) {
    if (!wpTheme || wpTheme === "sf-tt5" || wpTheme === "sf-block-theme") {
      return { theme: "twentytwentyfive", changed: wpTheme !== "twentytwentyfive" };
    }
    return { theme: wpTheme, changed: false };
  }

  if (!wpTheme || wpTheme === "sf-block-theme" || wpTheme === "twentytwentyfive") {
    return { theme: "sf-tt5", changed: wpTheme !== "sf-tt5" };
  }
  return { theme: wpTheme, changed: false };
}

async function main() {
  const isDryRun = process.argv.includes("--dry-run");

  const projects = await prisma.project.findMany({
    where: { techStack: "WORDPRESS" },
    select: {
      id: true,
      name: true,
      type: true,
      deployTarget: true,
      wpConfig: {
        select: {
          wpFeatures: true,
          wpPlugins: true,
          wpTheme: true,
          wpInfraStatus: true,
          wpHeadless: true,
          hostingProfileId: true,
          excludeFreemium: true,
        },
      },
    },
  });

  const results: Array<{ id: string; name: string; updates: string[] }> = [];

  for (const project of projects) {
    const wpConfig = project.wpConfig;
    if (!wpConfig) continue;

    const preset = getPresetForType(project.type);
    const parsed = parseFeatures(wpConfig.wpFeatures);
    const baseFeatures = parsed ?? preset.features;
    const merged = mergeFeatures(baseFeatures, REQUIRED_FEATURES);
    const infraParsed = parseInfraStatus(wpConfig.wpInfraStatus);
    const infraNormalized = normalizeInfraStatus(infraParsed);

    const themeResult = resolveTheme({
      wpHeadless: wpConfig.wpHeadless ?? false,
      wpTheme: wpConfig.wpTheme,
    });

    const updates: Record<string, unknown> = {};
    const updateReasons: string[] = [];

    if (!parsed || merged.changed) {
      updates.wpFeatures = JSON.stringify(merged.features);
      updateReasons.push("wpFeatures");
    }

    if (!infraParsed || infraNormalized.changed) {
      updates.wpInfraStatus = JSON.stringify(infraNormalized.status);
      updateReasons.push("wpInfraStatus");
    }

    if (themeResult.changed) {
      updates.wpTheme = themeResult.theme;
      updateReasons.push("wpTheme");
    }

    const shouldUpdatePlugins = !!updates.wpFeatures || !wpConfig.wpPlugins;
    if (shouldUpdatePlugins) {
      const hostingProfileId =
        (wpConfig.hostingProfileId as HostingProfileId | null) ??
        resolveDefaultHostingProfile(project.deployTarget as DeployTarget);
      const resolved = resolveWpPlugins(merged.features, {
        profileId: hostingProfileId,
        excludeFreemium: wpConfig.excludeFreemium ?? false,
      });
      updates.wpPlugins = serializeResolvedPlugins(resolved.plugins);
      updateReasons.push("wpPlugins");
    }

    if (updateReasons.length === 0) continue;

    results.push({ id: project.id, name: project.name, updates: updateReasons });

    if (!isDryRun) {
      await prisma.wordpressConfig.update({
        where: { projectId: project.id },
        data: updates,
      });
    }
  }

  if (results.length === 0) {
    console.log("No WordPress projects to update.");
  } else {
    console.log(isDryRun ? "Dry run:" : "Updated:");
    for (const item of results) {
      console.log(`- ${item.name} (${item.id}): ${item.updates.join(", ")}`);
    }
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
