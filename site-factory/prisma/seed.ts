import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const adapter = new PrismaMariaDb(process.env.DATABASE_URL ?? "");
const prisma = new PrismaClient({ adapter });

// ── Types ──────────────────────────────────────────────────────────────

type ProjectType = "VITRINE" | "BLOG" | "ECOM" | "APP";
type ProjectStatus = "DRAFT" | "ACTIVE" | "ARCHIVED";
type TechStack = "WORDPRESS" | "NEXTJS";
type DeployTarget = "DOCKER" | "VERCEL" | "SHARED_HOSTING";
type FrontendStack = "NEXTJS" | "NUXT" | "ASTRO";
type DbType = "MARIADB" | "POSTGRESQL";
type ProjectCategory = "CAT1" | "CAT2" | "CAT3" | "CAT4";
type MaintenanceLevel = "MINIMAL" | "STANDARD" | "ADVANCED" | "BUSINESS" | "PREMIUM";

interface ProjectSeed {
  name: string;
  slug: string;
  clientSlug: string;
  type: ProjectType;
  category: ProjectCategory;
  description: string | null;
  domain: string | null;
  gitRepo: string | null;
  techStack: TechStack | null;
  deployTarget: DeployTarget;
  status: ProjectStatus;
}

interface RuntimeSeed {
  port: number;
  localHost: string | null;
}

interface DatabaseSeed {
  dbType: DbType;
  dbVersion: string;
  dbName: string | null;
  dbUser: string | null;
  dbPassword: string | null;
}

interface ServiceFlag {
  serviceId: string;
  enabled: boolean;
}

interface WordpressConfigSeed {
  phpVersion: string;
  wpHeadless: boolean;
  frontendStack: FrontendStack | null;
  wpSiteTitle: string | null;
  wpAdminUser: string | null;
  wpAdminPassword: string | null;
  wpAdminEmail: string | null;
  wpPermalinkStructure: string | null;
  wpDefaultPages: string | null;
  wpPlugins: string | null;
  wpTheme: string | null;
}

interface NextjsConfigSeed {
  nodeVersion: string;
  envVarsJson: string | null;
}

interface QualificationSeed {
  modules: string | null;
  maintenanceLevel: MaintenanceLevel | null;
  estimatedBudget: number | null;
}

interface ProjectFullSeed {
  project: ProjectSeed;
  runtime: RuntimeSeed;
  database: DatabaseSeed | null;
  services: ServiceFlag[];
  wpConfig: WordpressConfigSeed | null;
  nextConfig: NextjsConfigSeed | null;
  qualification: QualificationSeed;
}

// ── Helpers ────────────────────────────────────────────────────────────

const WP_PAGES_STANDARD = JSON.stringify([
  { title: "Accueil", slug: "accueil", isFrontPage: true },
  { title: "Contact", slug: "contact" },
  { title: "Mentions legales", slug: "mentions-legales" },
  { title: "Politique de confidentialite", slug: "politique-de-confidentialite" },
]);

const WP_PAGES_VITRINE = JSON.stringify([
  { title: "Accueil", slug: "accueil", isFrontPage: true },
  { title: "A propos", slug: "a-propos" },
  { title: "Nos services", slug: "nos-services" },
  { title: "Contact", slug: "contact" },
  { title: "Mentions legales", slug: "mentions-legales" },
  { title: "Politique de confidentialite", slug: "politique-de-confidentialite" },
]);

const WP_PLUGINS_BASE = JSON.stringify([
  { slug: "contact-form-7", activate: true },
  { slug: "wordpress-seo", activate: true },
  { slug: "redirection", activate: true },
  { slug: "wp-mail-smtp", activate: true },
  { slug: "compstarter", activate: true },
]);

const WP_PLUGINS_ECOM = JSON.stringify([
  { slug: "contact-form-7", activate: true },
  { slug: "wordpress-seo", activate: true },
  { slug: "redirection", activate: true },
  { slug: "wp-mail-smtp", activate: true },
  { slug: "woocommerce", activate: true },
  { slug: "woo-stripe-payment", activate: true },
]);

const WP_PLUGINS_BLOG = JSON.stringify([
  { slug: "wordpress-seo", activate: true },
  { slug: "redirection", activate: true },
  { slug: "wp-mail-smtp", activate: true },
  { slug: "table-of-contents-plus", activate: true },
]);

/**
 * Convert the old enable* boolean flags into ProjectService rows.
 */
function buildServices(flags: {
  enableDb?: boolean;
  dbType?: DbType;
  enablePhpMyAdmin?: boolean;
  enableRedis?: boolean;
  enableMailpit?: boolean;
  enableAdminer?: boolean;
  enableMemcached?: boolean;
  enableElasticsearch?: boolean;
  enableMeilisearch?: boolean;
  enableMinio?: boolean;
  enableRabbitmq?: boolean;
  enableVarnish?: boolean;
}): ServiceFlag[] {
  const services: ServiceFlag[] = [];

  if (flags.enableDb) {
    const dbServiceId = flags.dbType === "POSTGRESQL" ? "db-postgresql" : "db-mariadb";
    services.push({ serviceId: dbServiceId, enabled: true });
  }
  if (flags.enablePhpMyAdmin) services.push({ serviceId: "phpmyadmin", enabled: true });
  if (flags.enableRedis) services.push({ serviceId: "redis", enabled: true });
  if (flags.enableMailpit) services.push({ serviceId: "mailpit", enabled: true });
  if (flags.enableAdminer) services.push({ serviceId: "adminer", enabled: true });
  if (flags.enableMemcached) services.push({ serviceId: "memcached", enabled: true });
  if (flags.enableElasticsearch) services.push({ serviceId: "elasticsearch", enabled: true });
  if (flags.enableMeilisearch) services.push({ serviceId: "meilisearch", enabled: true });
  if (flags.enableMinio) services.push({ serviceId: "minio", enabled: true });
  if (flags.enableRabbitmq) services.push({ serviceId: "rabbitmq", enabled: true });
  if (flags.enableVarnish) services.push({ serviceId: "varnish", enabled: true });

  return services;
}

/**
 * Build a full WordPress project seed from overrides, mirroring the old wpConfig() helper.
 */
function wpProject(overrides: {
  wpSiteTitle: string;
  wpAdminEmail: string;
  port: number;
  dbName?: string | null;
  dbType?: DbType;
  dbVersion?: string;
  dbUser?: string;
  dbPassword?: string;
  phpVersion?: string;
  enableDb?: boolean;
  enablePhpMyAdmin?: boolean;
  enableRedis?: boolean;
  enableMailpit?: boolean;
  enableAdminer?: boolean;
  enableMemcached?: boolean;
  enableElasticsearch?: boolean;
  enableMeilisearch?: boolean;
  enableMinio?: boolean;
  enableRabbitmq?: boolean;
  enableVarnish?: boolean;
  wpHeadless?: boolean;
  frontendStack?: FrontendStack | null;
  wpAdminUser?: string;
  wpAdminPassword?: string;
  wpPermalinkStructure?: string;
  wpDefaultPages?: string;
  wpPlugins?: string;
  wpTheme?: string;
  modules?: string | null;
  maintenanceLevel?: MaintenanceLevel | null;
  estimatedBudget?: number | null;
}): Omit<ProjectFullSeed, "project"> {
  const enableDb = overrides.enableDb ?? true;
  const enablePhpMyAdmin = overrides.enablePhpMyAdmin ?? true;
  const enableRedis = overrides.enableRedis ?? false;
  const enableMailpit = overrides.enableMailpit ?? true;
  const enableAdminer = overrides.enableAdminer ?? false;
  const enableMemcached = overrides.enableMemcached ?? false;
  const enableElasticsearch = overrides.enableElasticsearch ?? false;
  const enableMeilisearch = overrides.enableMeilisearch ?? false;
  const enableMinio = overrides.enableMinio ?? false;
  const enableRabbitmq = overrides.enableRabbitmq ?? false;
  const enableVarnish = overrides.enableVarnish ?? false;
  const dbType = overrides.dbType ?? "MARIADB";

  return {
    runtime: {
      port: overrides.port,
      localHost: null,
    },
    database: enableDb
      ? {
          dbType,
          dbVersion: overrides.dbVersion ?? "11",
          dbName: overrides.dbName ?? null,
          dbUser: overrides.dbUser ?? "wordpress",
          dbPassword: overrides.dbPassword ?? "wordpress",
        }
      : null,
    services: buildServices({
      enableDb,
      dbType,
      enablePhpMyAdmin,
      enableRedis,
      enableMailpit,
      enableAdminer,
      enableMemcached,
      enableElasticsearch,
      enableMeilisearch,
      enableMinio,
      enableRabbitmq,
      enableVarnish,
    }),
    wpConfig: {
      phpVersion: overrides.phpVersion ?? "8.3",
      wpHeadless: overrides.wpHeadless ?? false,
      frontendStack: overrides.frontendStack ?? null,
      wpSiteTitle: overrides.wpSiteTitle,
      wpAdminUser: overrides.wpAdminUser ?? "admin",
      wpAdminPassword: overrides.wpAdminPassword ?? "admin",
      wpAdminEmail: overrides.wpAdminEmail,
      wpPermalinkStructure: overrides.wpPermalinkStructure ?? "/%postname%/",
      wpDefaultPages: overrides.wpDefaultPages ?? WP_PAGES_VITRINE,
      wpPlugins: overrides.wpPlugins ?? WP_PLUGINS_BASE,
      wpTheme: overrides.wpTheme ?? "flavor",
    },
    nextConfig: null,
    qualification: {
      modules: overrides.modules ?? null,
      maintenanceLevel: overrides.maintenanceLevel ?? "STANDARD",
      estimatedBudget: overrides.estimatedBudget ?? null,
    },
  };
}

// ── Main ───────────────────────────────────────────────────────────────

async function main() {
  console.log("🌱 Seeding database...\n");

  // ════════════════════════════════════════════════════════════════════
  // 1. CLIENTS
  // ════════════════════════════════════════════════════════════════════

  const clients = [
    {
      name: "Cafe Lunaire",
      slug: "cafe-lunaire",
      firstName: "Emma",
      lastName: "Girard",
      email: "emma@cafe-lunaire.fr",
      phone: "06 11 22 33 44",
      notes: "Coffee shop a Lyon, torrefaction artisanale, vente en ligne de grains.",
    },
    {
      name: "Maitre Duval Notaire",
      slug: "maitre-duval-notaire",
      firstName: "Antoine",
      lastName: "Duval",
      email: "contact@duval-notaire.fr",
      phone: "01 44 55 66 77",
      notes: "Etude notariale Paris 8e, 3 notaires associes.",
    },
    {
      name: "Vignobles Castex",
      slug: "vignobles-castex",
      firstName: "Julien",
      lastName: "Castex",
      email: "julien@castex-vins.fr",
      phone: "05 56 78 90 12",
      notes: "Domaine viticole en Bordelais, 25 hectares, vente directe et export.",
    },
    {
      name: "Green Factory",
      slug: "green-factory",
      firstName: "Sarah",
      lastName: "Petit",
      email: "sarah@green-factory.io",
      phone: "07 88 99 00 11",
      notes: "Start-up greentech, plateforme SaaS de monitoring energetique.",
    },
    {
      name: "Atelier Nomade",
      slug: "atelier-nomade",
      firstName: "Lucas",
      lastName: "Martin",
      email: "lucas@atelier-nomade.fr",
      phone: "06 55 44 33 22",
      notes: "Artisan ebeniste, meubles sur mesure et restauration.",
    },
  ];

  const createdClients: Record<string, string> = {};

  for (const c of clients) {
    const client = await prisma.client.upsert({
      where: { slug: c.slug },
      update: {},
      create: c,
    });
    createdClients[c.slug] = client.id;
  }

  console.log(`  ✅ ${String(clients.length)} clients crees`);

  // ════════════════════════════════════════════════════════════════════
  // 2. PROJECTS + SUB-MODELS
  // ════════════════════════════════════════════════════════════════════

  const projectSeeds: ProjectFullSeed[] = [
    // ──────────────────────────────────────────────────────────────────
    // CAFE LUNAIRE — 3 projets (CAT1, CAT1->CAT2 via modules, CAT1)
    // ──────────────────────────────────────────────────────────────────

    // P1: Vitrine simple — CAT1
    // Un cafe qui veut juste presenter son lieu et sa carte.
    {
      project: {
        name: "Vitrine Cafe Lunaire",
        slug: "vitrine-cafe-lunaire",
        clientSlug: "cafe-lunaire",
        type: "VITRINE",
        category: "CAT1",
        description: "Site vitrine du cafe : carte, horaires, localisation.",
        domain: "cafe-lunaire.localhost",
        gitRepo: null,
        techStack: "WORDPRESS",
        deployTarget: "DOCKER",
        status: "ACTIVE",
      },
      ...wpProject({
        port: 3001,
        wpSiteTitle: "Cafe Lunaire",
        wpAdminEmail: "emma@cafe-lunaire.fr",
        dbName: "wp_vitrine_cafe",
        estimatedBudget: 2500,
      }),
    },

    // P2: Boutique en ligne — CAT1 (Woo simple) -> requalifie CAT2 par modules
    // Le cafe vend aussi ses grains en ligne. Paiement Stripe + newsletter = CAT2.
    {
      project: {
        name: "Boutique Cafe Lunaire",
        slug: "boutique-cafe-lunaire",
        clientSlug: "cafe-lunaire",
        type: "ECOM",
        category: "CAT2",
        description: "Vente de cafe en grains, capsules et accessoires. Paiement Stripe, newsletter Brevo.",
        domain: "shop.cafe-lunaire.localhost",
        gitRepo: "https://github.com/cafe-lunaire/boutique",
        techStack: "WORDPRESS",
        deployTarget: "DOCKER",
        status: "ACTIVE",
      },
      ...wpProject({
        port: 3002,
        wpSiteTitle: "Boutique Cafe Lunaire",
        wpAdminEmail: "emma@cafe-lunaire.fr",
        dbName: "wp_shop_cafe",
        enableRedis: true,
        wpPlugins: WP_PLUGINS_ECOM,
        modules: JSON.stringify(["paiement", "newsletter", "tunnel-vente"]),
        maintenanceLevel: "ADVANCED",
        estimatedBudget: 5300,
      }),
    },

    // P3: Blog recettes — CAT1
    // Blog simple sur le mutualise, pas de module.
    {
      project: {
        name: "Blog Cafe Lunaire",
        slug: "blog-cafe-lunaire",
        clientSlug: "cafe-lunaire",
        type: "BLOG",
        category: "CAT1",
        description: "Blog de recettes et actualites autour du cafe.",
        domain: "blog.cafe-lunaire.localhost",
        gitRepo: null,
        techStack: "WORDPRESS",
        deployTarget: "SHARED_HOSTING",
        status: "ACTIVE",
      },
      ...wpProject({
        port: 3003,
        wpSiteTitle: "Blog Cafe Lunaire",
        wpAdminEmail: "emma@cafe-lunaire.fr",
        dbName: "wp_blog_cafe",
        enablePhpMyAdmin: false,
        enableMailpit: false,
        wpPermalinkStructure: "/%year%/%monthnum%/%postname%/",
        wpDefaultPages: WP_PAGES_STANDARD,
        wpPlugins: WP_PLUGINS_BLOG,
        modules: JSON.stringify(["dark-mode"]),
        estimatedBudget: 2400,
      }),
    },

    // ──────────────────────────────────────────────────────────────────
    // MAITRE DUVAL NOTAIRE — 2 projets (CAT1, CAT2 via modules)
    // ──────────────────────────────────────────────────────────────────

    // P4: Site du cabinet — CAT1
    // Vitrine classique, infos pratiques, rien de complexe.
    {
      project: {
        name: "Cabinet Duval",
        slug: "cabinet-duval",
        clientSlug: "maitre-duval-notaire",
        type: "VITRINE",
        category: "CAT1",
        description: "Site de l'etude notariale : equipe, domaines d'expertise, coordonnees.",
        domain: "duval-notaire.localhost",
        gitRepo: null,
        techStack: "WORDPRESS",
        deployTarget: "DOCKER",
        status: "ACTIVE",
      },
      ...wpProject({
        port: 3004,
        wpSiteTitle: "Etude Duval Notaires",
        wpAdminEmail: "contact@duval-notaire.fr",
        dbName: "wp_cabinet_duval",
        modules: JSON.stringify(["seo-avance", "accessibilite"]),
        estimatedBudget: 3800,
      }),
    },

    // P5: Blog juridique — CAT1 base -> requalifie CAT2 par multi-langue + marketing
    // Le notaire veut un blog bilingue FR/EN pour attirer des clients internationaux.
    {
      project: {
        name: "Blog Juridique Duval",
        slug: "blog-juridique-duval",
        clientSlug: "maitre-duval-notaire",
        type: "BLOG",
        category: "CAT2",
        description: "Blog d'articles juridiques bilingue FR/EN, tracking analytics avance.",
        domain: "blog.duval-notaire.localhost",
        gitRepo: null,
        techStack: "WORDPRESS",
        deployTarget: "DOCKER",
        status: "ACTIVE",
      },
      ...wpProject({
        port: 3005,
        wpSiteTitle: "Blog Juridique — Duval Notaires",
        wpAdminEmail: "contact@duval-notaire.fr",
        dbName: "wp_blog_duval",
        enableRedis: true,
        wpPlugins: WP_PLUGINS_BLOG,
        wpDefaultPages: WP_PAGES_STANDARD,
        wpPermalinkStructure: "/%year%/%monthnum%/%postname%/",
        modules: JSON.stringify(["multi-langue", "marketing-tracking", "seo-avance"]),
        maintenanceLevel: "ADVANCED",
        estimatedBudget: 5400,
      }),
    },

    // ──────────────────────────────────────────────────────────────────
    // VIGNOBLES CASTEX — 3 projets (CAT1, CAT2->CAT3 via accises, CAT2)
    // ──────────────────────────────────────────────────────────────────

    // P6: Vitrine domaine — CAT1
    // Presentation du domaine, pas de module particulier.
    {
      project: {
        name: "Domaine Castex",
        slug: "domaine-castex",
        clientSlug: "vignobles-castex",
        type: "VITRINE",
        category: "CAT1",
        description: "Presentation du domaine viticole : terroir, cepages, visites.",
        domain: "castex-vins.localhost",
        gitRepo: null,
        techStack: "WORDPRESS",
        deployTarget: "DOCKER",
        status: "ACTIVE",
      },
      ...wpProject({
        port: 3006,
        wpSiteTitle: "Vignobles Castex",
        wpAdminEmail: "julien@castex-vins.fr",
        dbName: "wp_domaine_castex",
        estimatedBudget: 2500,
      }),
    },

    // P7: E-commerce vins — CAT1 (Woo simple) -> requalifie CAT3 par accises + multi-devises
    // Vente de vin : obligations accises (CRD, DRM), export multi-devises.
    // L'accises requalifie en CAT3, multi-devises en CAT2 — le max l'emporte.
    {
      project: {
        name: "Cave en ligne Castex",
        slug: "cave-en-ligne-castex",
        clientSlug: "vignobles-castex",
        type: "ECOM",
        category: "CAT3",
        description: "Boutique de vins avec gestion des accises (CRD, DRM), multi-devises pour l'export.",
        domain: "shop.castex-vins.localhost",
        gitRepo: "https://github.com/castex/cave-en-ligne",
        techStack: "WORDPRESS",
        deployTarget: "DOCKER",
        status: "ACTIVE",
      },
      ...wpProject({
        port: 3007,
        wpSiteTitle: "Cave en ligne — Castex",
        wpAdminEmail: "julien@castex-vins.fr",
        dbName: "wp_cave_castex",
        enableRedis: true,
        wpPlugins: WP_PLUGINS_ECOM,
        modules: JSON.stringify(["accises-fiscalite", "multi-devises", "paiement", "livraison"]),
        maintenanceLevel: "BUSINESS",
        estimatedBudget: 9200,
      }),
    },

    // P8: Blog oenotourisme — CAT1 -> CAT2 via newsletter + connecteurs
    // Blog lie au CRM du domaine pour relances clients.
    {
      project: {
        name: "Blog Castex",
        slug: "blog-castex",
        clientSlug: "vignobles-castex",
        type: "BLOG",
        category: "CAT2",
        description: "Blog oenotourisme avec newsletter et connecteur CRM pour relances.",
        domain: "blog.castex-vins.localhost",
        gitRepo: null,
        techStack: "WORDPRESS",
        deployTarget: "DOCKER",
        status: "ACTIVE",
      },
      ...wpProject({
        port: 3008,
        wpSiteTitle: "Blog — Vignobles Castex",
        wpAdminEmail: "julien@castex-vins.fr",
        dbName: "wp_blog_castex",
        wpPlugins: WP_PLUGINS_BLOG,
        wpDefaultPages: WP_PAGES_STANDARD,
        wpPermalinkStructure: "/%year%/%monthnum%/%postname%/",
        modules: JSON.stringify(["newsletter", "connecteurs"]),
        maintenanceLevel: "ADVANCED",
        estimatedBudget: 4700,
      }),
    },

    // ──────────────────────────────────────────────────────────────────
    // GREEN FACTORY — 2 projets (CAT4 headless, CAT3 dashboard)
    // ──────────────────────────────────────────────────────────────────

    // P9: Plateforme SaaS — CAT4 (Headless)
    // App full-stack Next.js : WP headless + frontend decouple.
    // L'architecture headless requalifie directement en CAT4.
    {
      project: {
        name: "Plateforme Green Factory",
        slug: "plateforme-green-factory",
        clientSlug: "green-factory",
        type: "APP",
        category: "CAT4",
        description: "Plateforme SaaS de monitoring energetique — architecture headless WP + Next.js.",
        domain: "app.green-factory.localhost",
        gitRepo: "https://github.com/green-factory/platform",
        techStack: "WORDPRESS",
        deployTarget: "DOCKER",
        status: "ACTIVE",
      },
      ...wpProject({
        port: 3009,
        wpSiteTitle: "Green Factory Platform",
        wpAdminEmail: "sarah@green-factory.io",
        dbName: "wp_green_factory",
        enableRedis: true,
        enableMeilisearch: true,
        enableMinio: true,
        enableRabbitmq: true,
        wpHeadless: true,
        frontendStack: "NEXTJS",
        modules: JSON.stringify(["performance-avancee", "assistant-ia"]),
        maintenanceLevel: "PREMIUM",
        estimatedBudget: 22000,
      }),
    },

    // P10: Dashboard interne — CAT1 vitrine base -> requalifie CAT3 par dashboard-personnalise
    // Un dashboard metier pour les techniciens terrain.
    {
      project: {
        name: "Dashboard Green Factory",
        slug: "dashboard-green-factory",
        clientSlug: "green-factory",
        type: "APP",
        category: "CAT3",
        description: "Dashboard interne techniciens : suivi interventions, alertes, KPIs energie.",
        domain: "dashboard.green-factory.localhost",
        gitRepo: "https://github.com/green-factory/dashboard",
        techStack: "NEXTJS",
        deployTarget: "DOCKER",
        status: "DRAFT",
      },
      runtime: {
        port: 3010,
        localHost: null,
      },
      database: {
        dbType: "POSTGRESQL",
        dbVersion: "17",
        dbName: "green_dashboard",
        dbUser: "app",
        dbPassword: "app_secret",
      },
      services: buildServices({
        enableDb: true,
        dbType: "POSTGRESQL",
        enablePhpMyAdmin: false,
        enableRedis: true,
        enableMailpit: true,
        enableAdminer: true,
        enableMemcached: false,
        enableElasticsearch: false,
        enableMeilisearch: false,
        enableMinio: false,
        enableRabbitmq: false,
        enableVarnish: false,
      }),
      wpConfig: null,
      nextConfig: {
        nodeVersion: "22",
        envVarsJson: null,
      },
      qualification: {
        modules: JSON.stringify(["dashboard-personnalise", "connecteurs"]),
        maintenanceLevel: "BUSINESS",
        estimatedBudget: 10200,
      },
    },

    // ──────────────────────────────────────────────────────────────────
    // ATELIER NOMADE — 2 projets (CAT1, CAT2 via modules)
    // ──────────────────────────────────────────────────────────────────

    // P11: Portfolio artisan — CAT1
    // Vitrine ultra simple, pas de module.
    {
      project: {
        name: "Portfolio Atelier Nomade",
        slug: "portfolio-atelier-nomade",
        clientSlug: "atelier-nomade",
        type: "VITRINE",
        category: "CAT1",
        description: "Portfolio de realisations : meubles sur mesure, restauration, bois massif.",
        domain: "atelier-nomade.localhost",
        gitRepo: null,
        techStack: "WORDPRESS",
        deployTarget: "DOCKER",
        status: "ACTIVE",
      },
      ...wpProject({
        port: 3011,
        wpSiteTitle: "Atelier Nomade",
        wpAdminEmail: "lucas@atelier-nomade.fr",
        dbName: "wp_atelier_nomade",
        enablePhpMyAdmin: false,
        enableMailpit: false,
        estimatedBudget: 2000,
      }),
    },

    // P12: Boutique mobilier — CAT1 (Woo simple) -> CAT2 via filtres + compte client
    // Vente de meubles avec recherche par essence de bois, dimensions, style.
    {
      project: {
        name: "Boutique Atelier Nomade",
        slug: "boutique-atelier-nomade",
        clientSlug: "atelier-nomade",
        type: "ECOM",
        category: "CAT2",
        description: "Boutique en ligne de mobilier artisanal avec filtres par essence, dimensions et style.",
        domain: "shop.atelier-nomade.localhost",
        gitRepo: "https://github.com/atelier-nomade/boutique",
        techStack: "WORDPRESS",
        deployTarget: "DOCKER",
        status: "ACTIVE",
      },
      ...wpProject({
        port: 3012,
        wpSiteTitle: "Boutique — Atelier Nomade",
        wpAdminEmail: "lucas@atelier-nomade.fr",
        dbName: "wp_shop_nomade",
        enableRedis: true,
        wpPlugins: WP_PLUGINS_ECOM,
        modules: JSON.stringify(["filtre-recherche", "compte-client", "paiement"]),
        maintenanceLevel: "ADVANCED",
        estimatedBudget: 5800,
      }),
    },
  ];

  let projectCount = 0;

  for (const { project: pData, runtime, database, services, wpConfig, nextConfig, qualification } of projectSeeds) {
    const clientId = createdClients[pData.clientSlug];
    if (!clientId) {
      console.error(`  ❌ Client slug "${pData.clientSlug}" introuvable`);
      continue;
    }

    // ── Project ──────────────────────────────────────────────────────
    const project = await prisma.project.upsert({
      where: { slug: pData.slug },
      update: {},
      create: {
        name: pData.name,
        slug: pData.slug,
        clientId,
        type: pData.type,
        category: pData.category,
        description: pData.description,
        domain: pData.domain,
        gitRepo: pData.gitRepo,
        techStack: pData.techStack,
        deployTarget: pData.deployTarget,
        status: pData.status,
      },
    });

    // ── Runtime ──────────────────────────────────────────────────────
    await prisma.projectRuntime.upsert({
      where: { projectId: project.id },
      update: runtime,
      create: {
        projectId: project.id,
        ...runtime,
      },
    });

    // ── Database ─────────────────────────────────────────────────────
    if (database) {
      await prisma.projectDatabase.upsert({
        where: { projectId: project.id },
        update: database,
        create: {
          projectId: project.id,
          ...database,
        },
      });
    }

    // ── Services (delete + recreate for idempotency) ─────────────────
    await prisma.projectService.deleteMany({
      where: { projectId: project.id },
    });
    if (services.length > 0) {
      await prisma.projectService.createMany({
        data: services.map((s) => ({
          projectId: project.id,
          serviceId: s.serviceId,
          enabled: s.enabled,
        })),
      });
    }

    // ── WordPress Config ─────────────────────────────────────────────
    if (wpConfig) {
      await prisma.wordpressConfig.upsert({
        where: { projectId: project.id },
        update: wpConfig,
        create: {
          projectId: project.id,
          ...wpConfig,
        },
      });
    }

    // ── Next.js Config ───────────────────────────────────────────────
    if (nextConfig) {
      await prisma.nextjsConfig.upsert({
        where: { projectId: project.id },
        update: nextConfig,
        create: {
          projectId: project.id,
          ...nextConfig,
        },
      });
    }

    // ── Qualification ────────────────────────────────────────────────
    await prisma.projectQualification.upsert({
      where: { projectId: project.id },
      update: qualification,
      create: {
        projectId: project.id,
        ...qualification,
      },
    });

    projectCount++;
  }

  console.log(`  ✅ ${String(projectCount)} projets + sub-models crees`);

  // ════════════════════════════════════════════════════════════════════
  // 3. SUMMARY
  // ════════════════════════════════════════════════════════════════════

  const summary = await prisma.project.findMany({
    select: {
      name: true,
      slug: true,
      type: true,
      category: true,
      techStack: true,
      deployTarget: true,
      status: true,
      runtime: {
        select: { port: true },
      },
      wpConfig: {
        select: {
          wpHeadless: true,
          frontendStack: true,
        },
      },
      services: {
        select: { serviceId: true, enabled: true },
      },
      qualification: {
        select: {
          modules: true,
          maintenanceLevel: true,
          estimatedBudget: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });

  console.log("\n  📋 Resume des projets :\n");
  console.log("  Port  Cat   Type      Stack       Maint.    Budget     Nom");
  console.log("  ────  ────  ────────  ──────────  ────────  ─────────  ──────────────────────────");

  for (const p of summary) {
    const port = p.runtime?.port ? String(p.runtime.port).padEnd(4) : "—   ";
    const cat = (p.category ?? "—").padEnd(4);
    const type = p.type.padEnd(8);
    const stack = (p.techStack ?? "—").padEnd(10);
    const maint = (p.qualification?.maintenanceLevel ?? "—").padEnd(8);
    const budget = p.qualification?.estimatedBudget
      ? `${String(p.qualification.estimatedBudget).padStart(6)} €`
      : "     — €";
    const modules = p.qualification?.modules ? JSON.parse(p.qualification.modules) as string[] : [];
    const modStr = modules.length > 0 ? ` [${modules.join(", ")}]` : "";
    const headless = p.wpConfig?.wpHeadless ? ` (headless:${p.wpConfig.frontendStack ?? "?"})` : "";
    const svcList = p.services.filter((s) => s.enabled).map((s) => s.serviceId);
    const svcStr = svcList.length > 0 ? ` {${svcList.join(", ")}}` : "";

    console.log(`  ${port}  ${cat}  ${type}  ${stack}  ${maint}  ${budget}  ${p.name}${headless}${modStr}${svcStr}`);
  }

  console.log("\n🎉 Seed termine !");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e: unknown) => {
    console.error(e);
    return prisma.$disconnect().then(() => {
      process.exit(1);
    });
  });
