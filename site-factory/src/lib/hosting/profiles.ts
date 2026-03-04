// src/lib/hosting-profiles.ts
// ── Hosting profiles & capabilities ─────────────────────────────────────
//
// Goal: support many hosts without naming all of them.
// We map a host to a "profile", which expands to capabilities used by plugin resolver.

import type { DeployTargetLiteral } from "@/lib/services";
export type HostingCapability =
  | "server_page_cache" // cache serveur (managed / varnish / nginx)
  | "server_object_cache" // redis/memcached côté serveur
  | "litespeed_server" // LiteSpeed present
  | "allows_object_cache_dropin" // can use object-cache.php drop-in
  | "allows_full_page_cache_plugin" // can use page cache plugin
  | "allows_waf_plugin" // WAF/security plugins allowed
  | "allows_loopback_requests" // WP Site Health loopback OK
  | "allows_wp_cron" // wp-cron works
  | "supports_system_cron" // can set server cron
  | "allows_smtp_outbound" // outbound SMTP ports allowed
  | "allows_rest_api" // REST API not blocked
  | "disallows_heavy_plugins" // low CPU/RAM (shared cheap)
  | "restricts_background_jobs" // long tasks can be killed
  | "has_imagick"
  | "has_webp";

export type HostingProfileId =
  | "LOCAL_DOCKER"
  | "VPS_SELF_HOSTED"
  | "SHARED_CHEAP"
  | "SHARED_STANDARD"
  | "SHARED_LITESPEED"
  | "WP_MANAGED_GENERIC"
  | "WPENGINE"
  | "KINSTA"
  | "CLOUDFLARE_FRONT"
  | "CUSTOM";

export interface HostingProfile {
  id: HostingProfileId;
  label: string;
  caps: HostingCapability[];
  notes?: string;
}

export const HOSTING_PROFILES: Record<HostingProfileId, HostingProfile> = {
  LOCAL_DOCKER: {
    id: "LOCAL_DOCKER",
    label: "Local Docker (dev)",
    caps: [
      "allows_loopback_requests",
      "allows_wp_cron",
      "allows_rest_api",
      "allows_object_cache_dropin",
      "allows_full_page_cache_plugin",
      "allows_smtp_outbound",
      "has_imagick",
      "has_webp",
    ],
  },
  VPS_SELF_HOSTED: {
    id: "VPS_SELF_HOSTED",
    label: "VPS / auto-hébergé",
    caps: [
      "allows_loopback_requests",
      "allows_wp_cron",
      "supports_system_cron",
      "allows_rest_api",
      "allows_object_cache_dropin",
      "allows_full_page_cache_plugin",
      "allows_waf_plugin",
      "allows_smtp_outbound",
      "has_imagick",
      "has_webp",
    ],
  },
  SHARED_CHEAP: {
    id: "SHARED_CHEAP",
    label: "Mutualisé entrée de gamme",
    caps: [
      "allows_rest_api",
      "allows_wp_cron",
      "disallows_heavy_plugins",
      "restricts_background_jobs",
      // loopback often flaky → intentionally not set
    ],
    notes: "Ressources limitées, éviter plugins lourds, caches agressifs et jobs longs.",
  },
  SHARED_STANDARD: {
    id: "SHARED_STANDARD",
    label: "Mutualisé standard",
    caps: [
      "allows_rest_api",
      "allows_wp_cron",
      "allows_loopback_requests",
      "allows_full_page_cache_plugin",
      "allows_smtp_outbound",
      "has_imagick",
      "has_webp",
    ],
  },
  SHARED_LITESPEED: {
    id: "SHARED_LITESPEED",
    label: "Mutualisé LiteSpeed",
    caps: [
      "litespeed_server",
      "server_page_cache",
      "allows_rest_api",
      "allows_wp_cron",
      "allows_loopback_requests",
      "allows_smtp_outbound",
      "has_imagick",
      "has_webp",
    ],
  },
  WP_MANAGED_GENERIC: {
    id: "WP_MANAGED_GENERIC",
    label: "Managed WordPress (générique)",
    caps: [
      "server_page_cache",
      "allows_rest_api",
      "allows_wp_cron",
      "allows_loopback_requests",
      "allows_smtp_outbound",
      "disallows_heavy_plugins",
      "has_imagick",
      "has_webp",
    ],
    notes: "Cache serveur présent : éviter les doublons de cache page plugin.",
  },
  WPENGINE: {
    id: "WPENGINE",
    label: "WP Engine (managed strict)",
    caps: [
      "server_page_cache",
      "allows_rest_api",
      "allows_wp_cron",
      "allows_loopback_requests",
      "disallows_heavy_plugins",
      "has_imagick",
      "has_webp",
    ],
    notes: "Managed strict avec règles/blacklists (cache/sécurité). Utiliser alternatives.",
  },
  KINSTA: {
    id: "KINSTA",
    label: "Kinsta (managed strict)",
    caps: [
      "server_page_cache",
      "server_object_cache",
      "allows_rest_api",
      "allows_wp_cron",
      "allows_loopback_requests",
      "disallows_heavy_plugins",
      "has_imagick",
      "has_webp",
    ],
    notes: "Cache serveur + Object cache possible. Éviter cache page plugin (souvent inutile).",
  },
  CLOUDFLARE_FRONT: {
    id: "CLOUDFLARE_FRONT",
    label: "Cloudflare devant le site",
    caps: [
      "server_page_cache",
      "allows_rest_api",
      "allows_wp_cron",
      "allows_loopback_requests",
      "allows_smtp_outbound",
      "has_imagick",
      "has_webp",
    ],
    notes: "Cache edge + règles WAF possibles. Attention aux plugins de headers/caching en double.",
  },
  CUSTOM: {
    id: "CUSTOM",
    label: "Personnalisé (caps manuelles)",
    caps: [],
    notes: "Les capacités sont choisies manuellement dans l'UI.",
  },
};

export function getProfile(profileId: HostingProfileId): HostingProfile {
  return HOSTING_PROFILES[profileId];
}

export function hasCap(caps: HostingCapability[], cap: HostingCapability): boolean {
  return caps.includes(cap);
}

export function allowedHostingProfilesForDeployTarget(deployTarget: string): HostingProfileId[] {
  switch (deployTarget) {
    case "DOCKER":
      return ["LOCAL_DOCKER", "VPS_SELF_HOSTED", "CUSTOM"];
    case "SHARED_HOSTING":
      return ["SHARED_CHEAP", "SHARED_STANDARD", "SHARED_LITESPEED", "CUSTOM"];
    case "VERCEL":
      // Vercel = front; WP peut être managed ou shared ou VPS
      return ["WP_MANAGED_GENERIC", "WPENGINE", "KINSTA", "CLOUDFLARE_FRONT", "VPS_SELF_HOSTED", "SHARED_STANDARD", "SHARED_LITESPEED", "CUSTOM"];
    default:
      return ["CUSTOM"];
  }
}

export function defaultHostingProfileForDeployTarget(
  deployTarget: DeployTargetLiteral,
): HostingProfileId {
  switch (deployTarget) {
    case "DOCKER":
      return "VPS_SELF_HOSTED";
    case "VERCEL":
      return "WP_MANAGED_GENERIC";
    case "SHARED_HOSTING":
    default:
      return "SHARED_STANDARD";
  }
}
