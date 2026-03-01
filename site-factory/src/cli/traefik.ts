// src/cli/traefik.ts
import "dotenv/config";
import { generateTraefikConfig } from "@/lib/generators/traefik";

async function main() {
  console.log("📡 Generating Traefik dynamic config...");
  await generateTraefikConfig();
  console.log("✅ Traefik dynamic.yml generated");
}

main().catch((err: unknown) => {
  console.error("❌ Traefik generation failed:", err);
  process.exit(1);
});