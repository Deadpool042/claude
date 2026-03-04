import type { HostingProfileId, HostingCapability } from "@/lib/hosting";
import { getProfile } from "@/lib/hosting";
import type { WpFeature } from "./features";
import { NON_PLUGIN_FEATURES } from "./features";
import { WP_PLUGIN_CATALOG, type WpPluginCandidate } from "./plugin-catalog";

export interface ResolvedPlugin {
  slug: string;
  label: string;
  category: WpPluginCandidate["category"];
  activate: boolean;
  optional: boolean;
  reason: string;
  notes?: string;
  weight: WpPluginCandidate["weight"];
  freemium: boolean;
}

export interface ResolveContext {
  profileId: HostingProfileId;
  excludeFreemium?: boolean;
  mode?: "monolith_wp" | "wp_headless";
}

export interface ResolveResult {
  plugins: ResolvedPlugin[];
  warnings: string[];
  missingFeatures: WpFeature[];
}

const NON_PLUGIN_FEATURES_SET = new Set<WpFeature>(NON_PLUGIN_FEATURES);

function isAllowedForProfile(
  c: WpPluginCandidate,
  profileId: HostingProfileId,
  caps: Set<HostingCapability>,
): { ok: boolean; reason?: string } {
  if (c.disallowProfiles?.includes(profileId)) {
    return { ok: false, reason: `Interdit pour le profil ${profileId}` };
  }
  if (c.requiresCaps && c.requiresCaps.length > 0) {
    for (const cap of c.requiresCaps) {
      if (!caps.has(cap)) return { ok: false, reason: `Capacité requise manquante: ${cap}` };
    }
  }
  return { ok: true };
}

function normalizeRequestedFeatures(
  requested: WpFeature[],
  caps: Set<HostingCapability>,
): { features: WpFeature[]; warnings: string[] } {
  const warnings: string[] = [];
  const set = new Set<WpFeature>(requested);

  if (caps.has("server_page_cache") && set.has("page_cache")) {
    set.delete("page_cache");
    warnings.push("ℹ️ Cache serveur détecté (server_page_cache) : plugin de cache page désactivé (évite le double-cache).")
  }

  if (!caps.has("allows_full_page_cache_plugin") && set.has("page_cache")) {
    set.delete("page_cache");
    warnings.push("ℹ️ Ce profil n'autorise pas les plugins de cache page : feature page_cache ignorée.");
  }

  if (!caps.has("allows_smtp_outbound") && set.has("smtp")) {
    warnings.push("⚠️ SMTP sortant non garanti sur ce profil : plugin SMTP restera optionnel / best-effort.");
  }

  if (!caps.has("allows_waf_plugin") && set.has("waf_security")) {
    warnings.push("ℹ️ Plugins WAF/sécurité avancée non autorisés sur ce profil : fallback vers solution légère (anti brute-force).");
  }

  return { features: Array.from(set), warnings };
}

function scoreCandidate(
  c: WpPluginCandidate,
  profileId: HostingProfileId,
  caps: Set<HostingCapability>,
): number {
  let score = 0;

  if (c.preferProfiles?.includes(profileId)) score += 60;

  if (caps.has("litespeed_server") && c.slug === "litespeed-cache") score += 80;

  if (caps.has("disallows_heavy_plugins")) {
    if (c.weight === "heavy") score -= 200;
    if (c.weight === "medium") score -= 10;
    if (c.weight === "light") score += 10;
  } else {
    if (c.weight === "light") score += 6;
    if (c.weight === "medium") score += 2;
  }

  if (c.freemium) score -= 5;
  if (!c.optional) score += 3;

  return score;
}

export function resolveWpPlugins(
  requestedFeatures: WpFeature[],
  ctx: ResolveContext,
): ResolveResult {
  const profile = getProfile(ctx.profileId);
  const caps = new Set<HostingCapability>(profile.caps);

  const pluginFeatures = requestedFeatures.filter((feature) => !NON_PLUGIN_FEATURES_SET.has(feature));
  const normalized = normalizeRequestedFeatures(pluginFeatures, caps);
  const features = normalized.features;
  const warnings: string[] = [...normalized.warnings];

  const byFeature = new Map<WpFeature, WpPluginCandidate[]>();
  for (const c of WP_PLUGIN_CATALOG) {
    for (const f of c.features) {
      const arr = byFeature.get(f) ?? [];
      arr.push(c);
      byFeature.set(f, arr);
    }
  }

  const chosen = new Map<string, ResolvedPlugin>();
  const blockedSlugs = new Set<string>();
  const missingFeatures: WpFeature[] = [];

  const pickForFeature = (feature: WpFeature): WpPluginCandidate | null => {
    const candidates = byFeature.get(feature) ?? [];
    const allowed: WpPluginCandidate[] = [];

    for (const c of candidates) {
      if (blockedSlugs.has(c.slug)) continue;
      if (ctx.excludeFreemium && c.freemium) continue;
      if (caps.has("disallows_heavy_plugins") && c.weight === "heavy") continue;

      const allowedCheck = isAllowedForProfile(c, ctx.profileId, caps);
      if (!allowedCheck.ok) continue;

      if (feature === "page_cache" && !caps.has("allows_full_page_cache_plugin")) continue;
      if (feature === "waf_security" && !caps.has("allows_waf_plugin") && c.weight === "heavy") continue;

      const conflicts = c.conflictsWith ?? [];
      let conflict = false;
      for (const s of conflicts) {
        if (chosen.has(s)) {
          conflict = true;
          break;
        }
      }
      if (conflict) continue;

      allowed.push(c);
    }

    if (allowed.length === 0) return null;

    allowed.sort((a, b) => scoreCandidate(b, ctx.profileId, caps) - scoreCandidate(a, ctx.profileId, caps));
    return allowed[0] ?? null;
  };

  for (const f of features) {
    const candidate = pickForFeature(f);

    if (!candidate) {
      missingFeatures.push(f);
      warnings.push(
        `⚠️ Aucun plugin compatible trouvé pour la feature: ${f} (profil: ${ctx.profileId}).`,
      );
      continue;
    }

    if (chosen.has(candidate.slug)) continue;

    const resolved: ResolvedPlugin = {
      slug: candidate.slug,
      label: candidate.label,
      category: candidate.category,
      activate: false,
      optional: candidate.optional ?? false,
      reason: `Implémente: ${candidate.features.join(", ")}`,
      weight: candidate.weight,
      freemium: candidate.freemium,
      ...(candidate.notes ? { notes: candidate.notes } : {}),
    };

    chosen.set(candidate.slug, resolved);

    for (const s of candidate.conflictsWith ?? []) {
      blockedSlugs.add(s);
    }
  }

  if (!caps.has("allows_smtp_outbound")) {
    for (const p of chosen.values()) {
      const cand = WP_PLUGIN_CATALOG.find((c) => c.slug === p.slug);
      if (cand?.features.includes("smtp")) {
        p.optional = true;
        p.reason = `${p.reason} (SMTP best-effort sur ce profil)`;
      }
    }
  }

  if (caps.has("server_page_cache")) {
    for (const p of Array.from(chosen.values())) {
      const cand = WP_PLUGIN_CATALOG.find((c) => c.slug === p.slug);
      if (cand?.features.includes("page_cache")) {
        chosen.delete(p.slug);
      }
    }
  }

  const plugins = Array.from(chosen.values()).sort((a, b) => a.category.localeCompare(b.category));
  return { plugins, warnings, missingFeatures };
}

export function serializeResolvedPlugins(plugins: ResolvedPlugin[]): string {
  return JSON.stringify(plugins.map((p) => ({ slug: p.slug, activate: p.activate })));
}
