import type { DeployTargetLiteral } from "@/lib/services";
import type { HostingProfileId } from "@/lib/hosting";

export type HostingProviderId =
  | "O2SWITCH"
  | "OVH_SHARED"
  | "IONOS"
  | "LWS"
  | "INFOMANIAK"
  | "PLANETHOSTER"
  | "KINSTA"
  | "WPENGINE"
  | "WP_MANAGED_GENERIC"
  | "CUSTOM_SHARED"
  | "OVH_VPS"
  | "SCALEWAY"
  | "HETZNER"
  | "DIGITALOCEAN"
  | "LOCAL_DOCKER"
  | "CUSTOM_VPS"
  | "VERCEL"
  | "CLOUDFLARE_PAGES"
  | "NETLIFY"
  | "CUSTOM_CLOUD";

export type HostingProviderCategory =
  | "shared"
  | "vps"
  | "managed_wp"
  | "cloud"
  | "custom";

export interface HostingProvider {
  id: HostingProviderId;
  label: string;
  deployTarget: DeployTargetLiteral;
  profileId: HostingProfileId;
  category: HostingProviderCategory;
  notes?: string;
}

export const HOSTING_PROVIDERS: HostingProvider[] = [
  // Shared hosting (France - common)
  {
    id: "O2SWITCH",
    label: "o2switch (LiteSpeed)",
    deployTarget: "SHARED_HOSTING",
    profileId: "SHARED_LITESPEED",
    category: "shared",
    notes: "LiteSpeed cache present.",
  },
  {
    id: "OVH_SHARED",
    label: "OVH mutualise",
    deployTarget: "SHARED_HOSTING",
    profileId: "SHARED_STANDARD",
    category: "shared",
  },
  {
    id: "IONOS",
    label: "IONOS",
    deployTarget: "SHARED_HOSTING",
    profileId: "SHARED_STANDARD",
    category: "shared",
  },
  {
    id: "LWS",
    label: "LWS",
    deployTarget: "SHARED_HOSTING",
    profileId: "SHARED_STANDARD",
    category: "shared",
  },
  {
    id: "INFOMANIAK",
    label: "Infomaniak",
    deployTarget: "SHARED_HOSTING",
    profileId: "SHARED_STANDARD",
    category: "shared",
  },
  {
    id: "PLANETHOSTER",
    label: "PlanetHoster",
    deployTarget: "SHARED_HOSTING",
    profileId: "SHARED_STANDARD",
    category: "shared",
  },
  {
    id: "KINSTA",
    label: "Kinsta (managed WP)",
    deployTarget: "SHARED_HOSTING",
    profileId: "KINSTA",
    category: "managed_wp",
    notes: "Managed WP with strict plugin rules.",
  },
  {
    id: "WPENGINE",
    label: "WP Engine (managed WP)",
    deployTarget: "SHARED_HOSTING",
    profileId: "WPENGINE",
    category: "managed_wp",
    notes: "Managed WP with strict plugin rules.",
  },
  {
    id: "WP_MANAGED_GENERIC",
    label: "Managed WP (generic)",
    deployTarget: "SHARED_HOSTING",
    profileId: "WP_MANAGED_GENERIC",
    category: "managed_wp",
  },
  {
    id: "CUSTOM_SHARED",
    label: "Autre mutualise",
    deployTarget: "SHARED_HOSTING",
    profileId: "CUSTOM",
    category: "custom",
  },

  // VPS / Docker
  {
    id: "OVH_VPS",
    label: "OVHcloud VPS",
    deployTarget: "DOCKER",
    profileId: "VPS_SELF_HOSTED",
    category: "vps",
  },
  {
    id: "SCALEWAY",
    label: "Scaleway VPS",
    deployTarget: "DOCKER",
    profileId: "VPS_SELF_HOSTED",
    category: "vps",
  },
  {
    id: "HETZNER",
    label: "Hetzner Cloud",
    deployTarget: "DOCKER",
    profileId: "VPS_SELF_HOSTED",
    category: "vps",
  },
  {
    id: "DIGITALOCEAN",
    label: "DigitalOcean",
    deployTarget: "DOCKER",
    profileId: "VPS_SELF_HOSTED",
    category: "vps",
  },
  {
    id: "LOCAL_DOCKER",
    label: "Local Docker (dev only)",
    deployTarget: "DOCKER",
    profileId: "LOCAL_DOCKER",
    category: "custom",
  },
  {
    id: "CUSTOM_VPS",
    label: "Autre VPS / Docker",
    deployTarget: "DOCKER",
    profileId: "CUSTOM",
    category: "custom",
  },

  // Cloud / PaaS
  {
    id: "VERCEL",
    label: "Vercel",
    deployTarget: "VERCEL",
    profileId: "WP_MANAGED_GENERIC",
    category: "cloud",
  },
  {
    id: "CLOUDFLARE_PAGES",
    label: "Cloudflare Pages",
    deployTarget: "VERCEL",
    profileId: "CLOUDFLARE_FRONT",
    category: "cloud",
  },
  {
    id: "NETLIFY",
    label: "Netlify",
    deployTarget: "VERCEL",
    profileId: "WP_MANAGED_GENERIC",
    category: "cloud",
  },
  {
    id: "CUSTOM_CLOUD",
    label: "Autre cloud",
    deployTarget: "VERCEL",
    profileId: "CUSTOM",
    category: "custom",
  },
];

const PROVIDER_BY_ID = new Map(HOSTING_PROVIDERS.map((p) => [p.id, p]));

export function getHostingProvider(id: string | null | undefined): HostingProvider | null {
  if (!id) return null;
  return PROVIDER_BY_ID.get(id as HostingProviderId) ?? null;
}

export function getHostingProvidersForDeployTarget(
  deployTarget: DeployTargetLiteral,
): HostingProvider[] {
  return HOSTING_PROVIDERS.filter((p) => p.deployTarget === deployTarget);
}

export function defaultHostingProviderForDeployTarget(
  deployTarget: DeployTargetLiteral,
): HostingProviderId {
  switch (deployTarget) {
    case "DOCKER":
      return "OVH_VPS";
    case "VERCEL":
      return "VERCEL";
    case "SHARED_HOSTING":
    default:
      return "O2SWITCH";
  }
}

export function resolveHostingProviderForDeployTarget(
  providerId: string | null | undefined,
  deployTarget: DeployTargetLiteral,
): HostingProvider {
  const candidate = getHostingProvider(providerId);
  if (candidate && candidate.deployTarget === deployTarget) return candidate;
  const fallback = defaultHostingProviderForDeployTarget(deployTarget);
  return getHostingProvider(fallback) ?? HOSTING_PROVIDERS[0];
}

export function resolveHostingProfileFromProvider(
  providerId: string | null | undefined,
  deployTarget: DeployTargetLiteral,
): HostingProfileId {
  return resolveHostingProviderForDeployTarget(providerId, deployTarget).profileId;
}
