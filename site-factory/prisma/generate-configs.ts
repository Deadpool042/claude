/**
 * Generate all docker-compose + Traefik configs for seeded projects.
 * Run with: npx tsx prisma/generate-configs.ts
 */
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { generateComposeFragment } from "../src/lib/generators/compose";
import { generateTraefikConfig } from "../src/lib/generators/traefik";

const adapter = new PrismaMariaDb(process.env.DATABASE_URL ?? "");
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("⚙️  Generating configs for all projects...\n");

  const projects = await prisma.project.findMany({
    include: {
      client: { select: { slug: true } },
      runtime: true,
      services: true, // includes enabled flag
      database: true,
      wpConfig: true,
      nextConfig: true,
    },
    orderBy: { slug: "asc" },
  });

  for (const p of projects) {
    try {
          const enabledServiceIds = new Set(
      p.services.filter((s) => s.enabled).map((s) => s.serviceId),
    );

      const path = await generateComposeFragment({
  projectSlug: p.slug,
  clientSlug: p.client.slug,
  port: p.runtime?.port ?? 3000,
  domain: p.domain,
  type: p.type,
  techStack: p.techStack,
  deployTarget: p.deployTarget,
  devMode: p.devMode, // ✅ AJOUT ICI
  enabledServiceIds,
  database: p.database
    ? {
        dbType: p.database.dbType,
        dbVersion: p.database.dbVersion,
        dbName: p.database.dbName,
        dbUser: p.database.dbUser,
        dbPassword: p.database.dbPassword,
      }
    : null,
  wpConfig: p.wpConfig
    ? {
        phpVersion: p.wpConfig.phpVersion,
        wpHeadless: p.wpConfig.wpHeadless,
        frontendStack: p.wpConfig.frontendStack,
        wpSiteTitle: p.wpConfig.wpSiteTitle,
        wpAdminUser: p.wpConfig.wpAdminUser,
        wpAdminPassword: p.wpConfig.wpAdminPassword,
        wpAdminEmail: p.wpConfig.wpAdminEmail,
        wpPermalinkStructure: p.wpConfig.wpPermalinkStructure,
        wpDefaultPages: p.wpConfig.wpDefaultPages,
        wpPlugins: p.wpConfig.wpPlugins,
        wpTheme: p.wpConfig.wpTheme,
      }
    : null,
  nextConfig: p.nextConfig
    ? {
        nodeVersion: p.nextConfig.nodeVersion,
        envVarsJson: p.nextConfig.envVarsJson,
      }
    : null,
});

      console.log(`  ✅ ${p.name} → ${path.replace(process.cwd() + "/../", "")}`);
    } catch (e) {
      console.error(`  ❌ ${p.name}: ${String(e)}`);
    }
  }

  console.log("\n📡 Generating Traefik config...");
  await generateTraefikConfig();
  console.log("  ✅ Traefik dynamic.yml generated");

  console.log("\n🎉 Done!");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e: unknown) => {
    console.error(e);
    return prisma.$disconnect().then(() => process.exit(1));
  });