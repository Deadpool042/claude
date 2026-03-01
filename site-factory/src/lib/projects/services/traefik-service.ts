import { generateTraefikConfig } from "@/lib/generators/traefik";

export class TraefikService {
  async regenerate(): Promise<void> {
    await generateTraefikConfig();
  }
}