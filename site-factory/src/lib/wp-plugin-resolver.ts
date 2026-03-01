//src/lib/wp-plugin-resolver.ts// src/lib/wp-plugin-resolver.ts
import type { HostingProfileId, HostingCapability } from "@/lib/hosting-profiles";
import { getProfile } from "@/lib/hosting-profiles";
import type { WpFeature } from "@/lib/wp-features";
import { NON_PLUGIN_FEATURES } from "@/lib/wp-features";
import { WP_PLUGIN_CATALOG, type WpPluginCandidate } from "@/lib/wp-plugin-catalog";

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
  /** Exclude all freemium plugins — only 100% free candidates */
  excludeFreemium?: boolean;
  /** future use */
  mode?: "monolith_wp" | "wp_headless";
}

export interface ResolveResult {
  plugins: ResolvedPlugin[];
  warnings: string[];
  missingFeatures: WpFeature[];
}

const NON_PLUGIN_FEATURES_SET = new Set<WpFeature>(NON_PLUGIN_FEATURES);

/**
 * Decide if a candidate is allowed under current hosting profile.
 */
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

/**
 * Hosting-aware feature policy.
 * - server_page_cache => skip page_cache feature (avoid double cache)
 * - no SMTP outbound => keep smtp as best-effort + warning
 * - if host doesn't allow full page cache plugins => skip page_cache feature + warning
 */
function normalizeRequestedFeatures(
  requested: WpFeature[],
  caps: Set<HostingCapability>,
): { features: WpFeature[]; warnings: string[] } {
  const warnings: string[] = [];
  const set = new Set<WpFeature>(requested);

  // Cache page: avoid plugin on managed / varnish / nginx cache hosts
  if (caps.has("server_page_cache") && set.has("page_cache")) {
    set.delete("page_cache");
    warnings.push("ℹ️ Cache serveur détecté (server_page_cache) : plugin de cache page désactivé (évite le double-cache).");
  }

  // If host forbids full page cache plugins, skip that feature to avoid proposing incompatible plugins
  if (!caps.has("allows_full_page_cache_plugin") && set.has("page_cache")) {
    set.delete("page_cache");
    warnings.push("ℹ️ Ce profil n'autorise pas les plugins de cache page : feature page_cache ignorée.");
  }

  // SMTP outbound potentially blocked
  if (!caps.has("allows_smtp_outbound") && set.has("smtp")) {
    warnings.push("⚠️ SMTP sortant non garanti sur ce profil : plugin SMTP restera optionnel / best-effort.");
    // we keep the feature, resolver will pick optional SMTP plugin if available
  }

  // WAF/security plugins not allowed on some managed hosts
  if (!caps.has("allows_waf_plugin") && set.has("waf_security")) {
    warnings.push("ℹ️ Plugins WAF/sécurité avancée non autorisés sur ce profil : fallback vers solution légère (anti brute-force).");
    // keep feature; catalog should provide a light candidate without requiresCaps
  }

  return { features: Array.from(set), warnings };
}

/**
 * Candidate scoring:
 * - preferProfiles match => strong bonus
 * - disallows_heavy_plugins => heavy gets strong penalty (or reject)
 * - litespeed_server => LiteSpeed Cache gets huge bonus
 * - optional candidates less preferred when satisfying mandatory features
 */
function scoreCandidate(
  c: WpPluginCandidate,
  profileId: HostingProfileId,
  caps: Set<HostingCapability>,
): number {
  let score = 0;

  if (c.preferProfiles?.includes(profileId)) score += 60;

  // LiteSpeed special case
  if (caps.has("litespeed_server") && c.slug === "litespeed-cache") score += 80;

  // Hosting profile that dislikes heavy plugins
  if (caps.has("disallows_heavy_plugins")) {
    if (c.weight === "heavy") score -= 200; // almost never
    if (c.weight === "medium") score -= 10;
    if (c.weight === "light") score += 10;
  } else {
    if (c.weight === "light") score += 6;
    if (c.weight === "medium") score += 2;
  }

  // Freemium is okay but pure free strongly preferred
  if (c.freemium) score -= 5;

  // Non optional a bit preferred
  if (!c.optional) score += 3;

  return score;
}

/**
 * Resolve a plugin list from requested WP features + hosting profile.
 */
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

  // index candidates by feature
  const byFeature = new Map<WpFeature, WpPluginCandidate[]>();
  for (const c of WP_PLUGIN_CATALOG) {
    for (const f of c.features) {
      const arr = byFeature.get(f) ?? [];
      arr.push(c);
      byFeature.set(f, arr);
    }
  }

  const chosen = new Map<string, ResolvedPlugin>(); // by slug
  const blockedSlugs = new Set<string>(); // conflicts once chosen
  const missingFeatures: WpFeature[] = [];

  const pickForFeature = (feature: WpFeature): WpPluginCandidate | null => {
    const candidates = byFeature.get(feature) ?? [];
    const allowed: WpPluginCandidate[] = [];

    for (const c of candidates) {
      if (blockedSlugs.has(c.slug)) continue;

      // Exclude freemium plugins when user wants 100% free only
      if (ctx.excludeFreemium && c.freemium) continue;

      // If hosting disallows heavy plugins, we can outright reject heavy candidates
      if (caps.has("disallows_heavy_plugins") && c.weight === "heavy") continue;

      const allowedCheck = isAllowedForProfile(c, ctx.profileId, caps);
      if (!allowedCheck.ok) continue;

      // If feature is page_cache, ensure hosting actually allows such plugins
      if (feature === "page_cache" && !caps.has("allows_full_page_cache_plugin")) continue;

      // If feature is waf_security, and host doesn't allow waf plugin, avoid heavy WAFs
      if (feature === "waf_security" && !caps.has("allows_waf_plugin") && c.weight === "heavy") continue;

      // conflicts with already chosen
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
    activate: false, // installé mais non activé par défaut
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



  // SMTP best-effort handling: if outbound SMTP not allowed, mark chosen SMTP plugin as optional + warning
  if (!caps.has("allows_smtp_outbound")) {
    for (const p of chosen.values()) {
      // any plugin that provides smtp feature
      const cand = WP_PLUGIN_CATALOG.find((c) => c.slug === p.slug);
      if (cand?.features.includes("smtp")) {
        p.optional = true;
        p.reason = `${p.reason} (SMTP best-effort sur ce profil)`;
      }
    }
  }

  // If server cache exists, ensure we didn't select a cache plugin by mistake (defensive)
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

/**
 * Serialize plugins for wp-setup.sh consumption:
 *   [{ slug: "...", activate: true }, ...]
 */
export function serializeResolvedPlugins(plugins: ResolvedPlugin[]): string {
  return JSON.stringify(plugins.map((p) => ({ slug: p.slug, activate: p.activate })));
}
