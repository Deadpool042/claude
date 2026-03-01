import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
    coverage: {
      provider: "v8",
      include: [
        "src/lib/slug.ts",
        "src/lib/docker/names.ts",
        "src/lib/service-catalog.ts",
        "src/lib/service-defaults.ts",
        "src/lib/generators/compose/**/*.ts",
      ],
      exclude: ["src/**/*.test.ts"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
