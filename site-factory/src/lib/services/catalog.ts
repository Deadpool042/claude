// src/lib/service-catalog.ts
import { stackSlugForMode } from "@/lib/docker";
// ── Service Catalog ────────────────────────────────────────────────────
// Source UI + règles de compat.
// Persisted services = ProjectService rows (hors DB).
// Database is stored in ProjectDatabase and rendered as {stackSlug}-db (mode-specific).

export type DatabaseServiceId = "db-mariadb" | "db-postgresql";

export type OptionalServiceId =
  | "phpmyadmin"
  | "redis"
  | "mailpit"
  | "minio"
  | "elasticsearch"
  | "meilisearch"
  | "memcached"
  | "rabbitmq"
  | "adminer"
  | "varnish"
  | "grafana";

export type ServiceId = DatabaseServiceId | OptionalServiceId;

export type ServiceCategory =
  | "database"
  | "cache"
  | "mail"
  | "search"
  | "storage"
  | "queue"
  | "admin"
  | "performance";

export type ServiceEnv = "dev" | "prod" | "both";

export type DevModeLiteral = "DEV_COMFORT" | "DEV_PROD_LIKE" | "PROD";
export type StackLiteral = "WORDPRESS" | "NEXTJS" | "NUXT" | "ASTRO";
export type DeployTargetLiteral = "DOCKER" | "VERCEL" | "SHARED_HOSTING";



export interface CatalogService {
  id: ServiceId;
  name: string;
  description: string;
  category: ServiceCategory;
  icon: string; // Lucide icon name
  stacks: StackLiteral[]; // empty = all
  targets: DeployTargetLiteral[]; // empty = all
  env: ServiceEnv;
  recommendedFor: StackLiteral[];
  image: string;
  isDatabase: boolean;
  requires?: ServiceId;
  dockerSuffix: string; // slug-{suffix}

  // Defaults (optional) — useful for seeding ProjectService rows
  defaultEnabled?: boolean;
  defaultFor?: {
    stacks?: StackLiteral[];
    targets?: DeployTargetLiteral[];
    devModes?: DevModeLiteral[];
  };
}

export interface PersistedProjectServiceRow {
  serviceId: OptionalServiceId; // ✅ persisted rows are ONLY optional services
  enabled: boolean;
  optionsJson?: string | null;
}

// ── Type guards ────────────────────────────────────────────────────────

export function isDatabaseServiceId(id: ServiceId): id is DatabaseServiceId {
  return id === "db-mariadb" || id === "db-postgresql";
}

export function isOptionalServiceId(id: ServiceId): id is OptionalServiceId {
  return !isDatabaseServiceId(id);
}

// ── Literal guards (from unknown/string) ───────────────────────────────

export function isDeployTargetLiteral(v: unknown): v is DeployTargetLiteral {
  return v === "DOCKER" || v === "VERCEL" || v === "SHARED_HOSTING";
}

export function isStackLiteral(v: unknown): v is StackLiteral {
  return v === "WORDPRESS" || v === "NEXTJS" || v === "NUXT" || v === "ASTRO";
}

export function isFrontendStackLiteral(v: unknown): v is "NEXTJS" | "NUXT" | "ASTRO" {
  return v === "NEXTJS" || v === "NUXT" || v === "ASTRO";
}

export function isDbTypeLiteral(v: unknown): v is "POSTGRESQL" | "MARIADB" {
  return v === "POSTGRESQL" || v === "MARIADB";
}

/**
 * IMPORTANT: Prisma returns serviceId as string.
 * We need a guard from string -> OptionalServiceId.
 */
export function isOptionalServiceIdString(v: unknown): v is OptionalServiceId {
  if (typeof v !== "string") return false;
  // OptionalServiceId is "all ServiceId minus db-*"
  return (
    v === "phpmyadmin" ||
    v === "redis" ||
    v === "mailpit" ||
    v === "minio" ||
    v === "elasticsearch" ||
    v === "meilisearch" ||
    v === "memcached" ||
    v === "rabbitmq" ||
    v === "adminer" ||
    v === "varnish" ||
    v === "grafana"
  );
}

// ── Full catalog ────────────────────────────────────────────────────────

export const SERVICE_CATALOG: CatalogService[] = [
  // ── Databases (UI only, NOT persisted in ProjectService) ────────────
  {
    id: "db-mariadb",
    name: "MariaDB",
    description: "Base de données relationnelle MySQL-compatible, performante et fiable.",
    category: "database",
    icon: "Database",
    stacks: [],
    targets: ["DOCKER", "SHARED_HOSTING"],
    env: "both",
    recommendedFor: ["WORDPRESS"],
    image: "mariadb:11",
    isDatabase: true,
    dockerSuffix: "db",
    defaultFor: {
      stacks: ["WORDPRESS"],
      devModes: ["DEV_COMFORT"],
    },
  },
  {
    id: "db-postgresql",
    name: "PostgreSQL",
    description: "Base de données relationnelle avancée, idéale pour les applications modernes.",
    category: "database",
    icon: "Database",
    stacks: ["NEXTJS"],
    targets: ["DOCKER", "VERCEL"],
    env: "both",
    recommendedFor: ["NEXTJS"],
    image: "postgres:17-alpine",
    isDatabase: true,
    dockerSuffix: "db",
    defaultFor: {
      stacks: ["NEXTJS"],
      devModes: ["DEV_COMFORT"],
    },
  },

  // ── Admin tools ────────────────────────────────────────────────────
  {
    id: "phpmyadmin",
    name: "phpMyAdmin",
    description: "Interface web pour gérer MariaDB/MySQL visuellement.",
    category: "admin",
    icon: "TableProperties",
    stacks: [],
    targets: ["DOCKER"],
    env: "dev",
    recommendedFor: ["WORDPRESS"],
    image: "phpmyadmin:latest",
    isDatabase: false,
    requires: "db-mariadb",
    dockerSuffix: "pma",
    defaultFor: {
      stacks: ["WORDPRESS"],
      devModes: ["DEV_COMFORT"],
    },
  },
  {
    id: "adminer",
    name: "Adminer",
    description: "Client DB léger et universel (MySQL, PostgreSQL, SQLite…).",
    category: "admin",
    icon: "TableProperties",
    stacks: ["NEXTJS"],
    targets: ["DOCKER"],
    env: "dev",
    recommendedFor: [],
    image: "adminer:latest",
    isDatabase: false,
    dockerSuffix: "adminer",
    defaultFor: {
      stacks: ["NEXTJS"],
      devModes: ["DEV_COMFORT"],
    },
  },

  // ── Cache ──────────────────────────────────────────────────────────
  {
    id: "redis",
    name: "Redis",
    description: "Cache en mémoire ultra-rapide, sessions, files d'attente.",
    category: "cache",
    icon: "Zap",
    stacks: [],
    targets: ["DOCKER"],
    env: "both",
    recommendedFor: ["WORDPRESS", "NEXTJS"],
    image: "redis:7-alpine",
    isDatabase: false,
    dockerSuffix: "redis",
    defaultFor: {
      stacks: ["WORDPRESS", "NEXTJS"],
      devModes: ["DEV_COMFORT"],
    },
  },
  {
    id: "memcached",
    name: "Memcached",
    description: "Cache distribué simple et performant pour les objets en mémoire.",
    category: "cache",
    icon: "Zap",
    stacks: ["WORDPRESS"],
    targets: ["DOCKER"],
    env: "both",
    recommendedFor: [],
    image: "memcached:1-alpine",
    isDatabase: false,
    dockerSuffix: "memcached",
    defaultFor: {
      stacks: ["WORDPRESS"],
      devModes: ["DEV_COMFORT"],
    },
  },

  // ── Mail ───────────────────────────────────────────────────────────
  {
    id: "mailpit",
    name: "Mailpit",
    description: "Intercepteur d'emails pour le développement — aucun mail ne sort.",
    category: "mail",
    icon: "Mail",
    stacks: [],
    targets: ["DOCKER"],
    env: "dev",
    recommendedFor: ["WORDPRESS"],
    image: "axllent/mailpit:latest",
    isDatabase: false,
    dockerSuffix: "mailpit",
    defaultFor: {
      stacks: ["WORDPRESS"],
      devModes: ["DEV_COMFORT"],
    },
  },

  // ── Search ─────────────────────────────────────────────────────────
  {
    id: "elasticsearch",
    name: "Elasticsearch",
    description: "Moteur de recherche full-text distribué, idéal pour le e-commerce.",
    category: "search",
    icon: "Search",
    stacks: [],
    targets: ["DOCKER"],
    env: "both",
    recommendedFor: [],
    image: "elasticsearch:8.17.0",
    isDatabase: false,
    dockerSuffix: "elasticsearch",
    defaultFor: {
      stacks: ["WORDPRESS"],
      devModes: ["DEV_COMFORT"],
    },
  },
  {
    id: "meilisearch",
    name: "Meilisearch",
    description: "Moteur de recherche rapide et facile à intégrer, léger et moderne.",
    category: "search",
    icon: "Search",
    stacks: ["NEXTJS"],
    targets: ["DOCKER"],
    env: "both",
    recommendedFor: [],
    image: "getmeili/meilisearch:latest",
    isDatabase: false,
    dockerSuffix: "meilisearch",
    defaultFor: {
      stacks: ["NEXTJS"],
      devModes: ["DEV_COMFORT"],
    },
  },

  // ── Storage ────────────────────────────────────────────────────────
  {
    id: "minio",
    name: "MinIO",
    description: "Stockage objet compatible S3, pour gérer les fichiers et médias.",
    category: "storage",
    icon: "HardDrive",
    stacks: [],
    targets: ["DOCKER"],
    env: "both",
    recommendedFor: [],
    image: "minio/minio:latest",
    isDatabase: false,
    dockerSuffix: "minio",
    defaultFor: {
      stacks: ["WORDPRESS"],
      devModes: ["DEV_COMFORT"],
    },
  },

  // ── Queue ──────────────────────────────────────────────────────────
  {
    id: "rabbitmq",
    name: "RabbitMQ",
    description: "Broker de messages pour les tâches asynchrones et les événements.",
    category: "queue",
    icon: "ArrowLeftRight",
    stacks: ["NEXTJS"],
    targets: ["DOCKER"],
    env: "both",
    recommendedFor: [],
    image: "rabbitmq:3-management-alpine",
    isDatabase: false,
    dockerSuffix: "rabbitmq",
    defaultFor: {
      stacks: ["NEXTJS"],
      devModes: ["DEV_COMFORT"],
    },
  },

  // ── Performance ────────────────────────────────────────────────────
  {
    id: "varnish",
    name: "Varnish",
    description: "Reverse proxy HTTP / cache haute performance devant WordPress.",
    category: "performance",
    icon: "Gauge",
    stacks: ["WORDPRESS"],
    targets: ["DOCKER"],
    env: "prod",
    recommendedFor: [],
    image: "varnish:7-alpine",
    isDatabase: false,
    dockerSuffix: "varnish",
    defaultFor: {
      stacks: ["WORDPRESS"],
      devModes: ["DEV_COMFORT"],
    },
  },

  // ── Monitoring ──────────────────────────────────────────────────────
  {
    id: "grafana",
    name: "Grafana",
    description: "Plateforme de visualisation de données pour surveiller vos services.",
    category: "admin",
    icon: "BarChart",
    stacks: [],
    targets: ["DOCKER"],
    env: "both",
    recommendedFor: [],
    image: "grafana/grafana:latest",
    isDatabase: false,
    dockerSuffix: "grafana",
    defaultFor: {
      stacks: ["WORDPRESS", "NEXTJS"],
      devModes: ["DEV_COMFORT"],
    },
  },
];

// ── Labels ────────────────────────────────────────────────────────────

export const CATEGORY_LABELS: Record<ServiceCategory, string> = {
  database: "Base de données",
  admin: "Administration",
  cache: "Cache",
  mail: "Email",
  search: "Recherche",
  storage: "Stockage",
  queue: "File d'attente",
  performance: "Performance",
};

export const CATEGORY_ORDER: ServiceCategory[] = [
  "database",
  "admin",
  "cache",
  "mail",
  "search",
  "storage",
  "queue",
  "performance",
];

export const ENV_LABELS: Record<ServiceEnv, string> = {
  dev: "Dev",
  prod: "Prod",
  both: "Dev & Prod",
};

// ── Filtering helpers ─────────────────────────────────────────────────

/**
 * Returns services compatible with a given techStack + deployTarget (+ optional env filter).
 *
 * Important: if svc.stacks is non-empty AND techStack is null => NOT compatible.
 */
export function getCompatibleServices(
  techStack: StackLiteral | null,
  deployTarget: DeployTargetLiteral,
  envFilter?: "dev" | "prod",
): CatalogService[] {
  return SERVICE_CATALOG.filter((svc) => {
    if (svc.stacks.length > 0) {
      if (!techStack) return false;
      if (!svc.stacks.includes(techStack)) return false;
    }
    if (svc.targets.length > 0 && !svc.targets.includes(deployTarget)) return false;
    if (envFilter && svc.env !== "both" && svc.env !== envFilter) return false;
    return true;
  });
}

export function isRecommended(svc: CatalogService, techStack: StackLiteral | null): boolean {
  return techStack !== null && svc.recommendedFor.includes(techStack);
}

export function groupByCategory(
  services: CatalogService[],
): { category: ServiceCategory; label: string; services: CatalogService[] }[] {
  const groups: { category: ServiceCategory; label: string; services: CatalogService[] }[] = [];
  for (const cat of CATEGORY_ORDER) {
    const catServices = services.filter((s) => s.category === cat);
    if (catServices.length) groups.push({ category: cat, label: CATEGORY_LABELS[cat], services: catServices });
  }
  return groups;
}

// ── Enabled set helpers ───────────────────────────────────────────────

/**
 * Build a Set of enabled optional services (persisted ones).
 * DB services MUST NEVER appear here.
 */
export function buildEnabledServiceIds(
  services: PersistedProjectServiceRow[],
): Set<OptionalServiceId> {
  const set = new Set<OptionalServiceId>();
  for (const s of services) if (s.enabled) set.add(s.serviceId);
  return set;
}

// ── Catalog helpers ───────────────────────────────────────────────────

export function getServiceById(id: ServiceId): CatalogService | undefined {
  return SERVICE_CATALOG.find((s) => s.id === id);
}

export function getOptionalServiceById(id: OptionalServiceId): CatalogService | undefined {
  const svc = getServiceById(id);
  return svc && isOptionalServiceId(svc.id) ? svc : undefined;
}

/**
 * Returns optional services only (no databases).
 */
export function getOptionalServices(): CatalogService[] {
  return SERVICE_CATALOG.filter((s) => !s.isDatabase && isOptionalServiceId(s.id));
}

/**
 * Minimal "requires" resolver for optional services.
 * - If an optional service requires a DB (ex: phpmyadmin -> db-mariadb), we DON'T add anything to persisted rows.
 *   DB is handled via ProjectDatabase.
 * - If an optional service requires another optional service, we can auto-enable it.
 */
export function resolveOptionalDependencies(
  enabled: Set<OptionalServiceId>,
): Set<OptionalServiceId> {
  const resolved = new Set<OptionalServiceId>(enabled);

  let changed = true;
  while (changed) {
    changed = false;

    for (const id of Array.from(resolved)) {
      const svc = getOptionalServiceById(id);
      const req = svc?.requires;
      if (!req) continue;

      if (isDatabaseServiceId(req)) {
        // DB dependency is informational here; handled by ProjectDatabase.
        continue;
      }

      // Optional -> optional
      if (isOptionalServiceId(req) && !resolved.has(req)) {
        resolved.add(req);
        changed = true;
      }
    }
  }

  return resolved;
}

// ── Expected services builder ─────────────────────────────────────────

export interface ExpectedService {
  service: string;
  label: string;
  state: string;
  status: string;
  ports: string[];
  description: string;
  expected: boolean;
}

/**
 * Expected services = main app + db (if configured) + enabled optional services.
 * DB does NOT come from enabledIds; it comes from dbType != null.
 */
export function buildExpectedServices(
  slug: string,
  techStack: StackLiteral | null,
  enabledIds: Set<OptionalServiceId>,
  dbType: "POSTGRESQL" | "MARIADB" | null,
  wpHeadless: boolean,
  frontendStack: "NEXTJS" | "NUXT" | "ASTRO" | null,
  mode: "dev" | "prod-like" = "dev",
  deployTarget: DeployTargetLiteral = "DOCKER",
): ExpectedService[] {
  const stackSlug = stackSlugForMode(slug, mode);
  const isWp = techStack === "WORDPRESS";
  const isNext = techStack === "NEXTJS";
  const services: ExpectedService[] = [];

  // Main app always
  if (isWp) {
    services.push({
      service: stackSlug,
      label: "WordPress",
      state: "not_created",
      status: "",
      ports: [],
      description: "Conteneur principal WordPress (Apache + PHP)",
      expected: true,
    });

    if (wpHeadless) {
      const fwLabels: Record<string, string> = { NEXTJS: "Next.js", NUXT: "Nuxt", ASTRO: "Astro" };
      const fw = frontendStack ?? "NEXTJS";
      services.push({
        service: `${stackSlug}-front`,
        label: `Frontend ${fwLabels[fw] ?? fw}`,
        state: "not_created",
        status: "",
        ports: [],
        description: `Conteneur frontend ${fwLabels[fw] ?? fw} (WP headless)`,
        expected: true,
      });
    }
  } else if (isNext) {
    services.push({
      service: stackSlug,
      label: "Next.js",
      state: "not_created",
      status: "",
      ports: [],
      description: "Conteneur Node.js pour l'application Next.js",
      expected: true,
    });
  } else {
    services.push({
      service: stackSlug,
      label: "Application",
      state: "not_created",
      status: "",
      ports: [],
      description: "Conteneur principal de l'application",
      expected: true,
    });
  }

  // DB expected if configured (dbType != null)
  if (dbType) {
    const label = dbType === "POSTGRESQL" ? "PostgreSQL" : "MariaDB";
    services.push({
      service: `${stackSlug}-db`,
      label,
      state: "not_created",
      status: "",
      ports: [],
      description: "Base de données du projet",
      expected: true,
    });
  }

  // Optional services from catalog (strict OptionalServiceId)
  const enabledResolved = resolveOptionalDependencies(enabledIds);

  for (const svc of getOptionalServices()) {
    // svc.id is ServiceId, but narrowed by getOptionalServices()
    const id = svc.id as OptionalServiceId;

    if (!enabledResolved.has(id)) continue;

    if (mode === "prod-like") {
      if (svc.env === "dev") continue;
      if (svc.targets.length > 0 && !svc.targets.includes(deployTarget)) continue;
    }

    services.push({
      service: `${stackSlug}-${svc.dockerSuffix}`,
      label: svc.name,
      state: "not_created",
      status: "",
      ports: [],
      description: svc.description,
      expected: true,
    });
  }

  // (optional) you can use isWp/isNext flags later if needed
  void isWp;
  void isNext;

  return services;
}
