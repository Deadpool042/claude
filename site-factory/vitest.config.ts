import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    setupFiles: ["src/tests/ui/setup.ts"],
    coverage: {
      provider: "v8",
      include: [
        "src/lib/slug.ts",
        "src/lib/docker/names.ts",
        "src/lib/service-catalog.ts",
        "src/lib/service-defaults.ts",
        "src/lib/generators/compose/**/*.ts",
      ],
      exclude: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
