import js from "@eslint/js";
import tseslint from "typescript-eslint";
import nextPlugin from "@next/eslint-plugin-next";
import { defineConfig } from "eslint/config";

export default defineConfig([
  // Base JS
  js.configs.recommended,

  // TypeScript (non type-aware) pour les fichiers TS en général
  ...tseslint.configs.recommended,

  // Next rules
  {
    plugins: { "@next/next": nextPlugin },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
    },
  },

  // ✅ Type-aware UNIQUEMENT sur les fichiers TS/TSX ciblés
  {
    files: ["src/**/*.{ts,tsx}", "next.config.ts", "prisma.config.ts", "prisma/**/*.ts"],
    ...tseslint.configs.strictTypeChecked[0],
    languageOptions: {
      ...tseslint.configs.strictTypeChecked[0].languageOptions,
      parserOptions: {
        project: ["./tsconfig.eslint.json"],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/ban-ts-comment": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],
      "@typescript-eslint/require-await": "off",
      "@typescript-eslint/no-misused-promises": [
        "error",
        { checksVoidReturn: { attributes: false } },
      ],
    },
  },

  // ✅ Ignorer ce que TS project ne doit JAMAIS analyser
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "src/generated/**",
      "eslint.config.mjs",
      "postcss.config.mjs",
    ],
  },
]);
// import js from "@eslint/js";
// import tseslint from "typescript-eslint";
// import nextPlugin from "@next/eslint-plugin-next";
// import { defineConfig } from "eslint/config";

// export default defineConfig([
//   js.configs.recommended,
//   ...tseslint.configs.strictTypeChecked,
//   {
//     plugins: { "@next/next": nextPlugin },
//     rules: {
//       ...nextPlugin.configs.recommended.rules,
//       ...nextPlugin.configs["core-web-vitals"].rules,
//     },
//   },
//   {
//     languageOptions: {
//       parserOptions: {
//         project: ["./tsconfig.eslint.json"],          // ✅ IMPORTANT
//         tsconfigRootDir: import.meta.dirname,  // ✅ IMPORTANT
//       },
//     },
//     rules: {
//       "@typescript-eslint/no-explicit-any": "error",
//       "@typescript-eslint/ban-ts-comment": "error",
//       "@typescript-eslint/no-unused-vars": [
//         "error",
//         { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
//       ],
//       "@typescript-eslint/consistent-type-imports": [
//         "error",
//         { prefer: "type-imports", fixStyle: "inline-type-imports" },
//       ],
//       "@typescript-eslint/require-await": "off",
//       "@typescript-eslint/no-misused-promises": [
//         "error",
//         { checksVoidReturn: { attributes: false } },
//       ],
//     },
//   },
//   {
//     ignores: [".next/**", "node_modules/**", "src/generated/**"],
//   },
// ]);
// import js from "@eslint/js";
// import tseslint from "typescript-eslint";
// import nextPlugin from "@next/eslint-plugin-next";
// import { defineConfig } from "eslint/config";

// export default defineConfig([
//   js.configs.recommended,
//   ...tseslint.configs.strictTypeChecked,
//   {
//     plugins: {
//       "@next/next": nextPlugin,
//     },
//     rules: {
//       ...nextPlugin.configs.recommended.rules,
//       ...nextPlugin.configs["core-web-vitals"].rules,
//     },
//   },
//   {
//     languageOptions: {
//       parserOptions: {
//         projectService: {
//           allowDefaultProject: ["*.mjs"],
//         },
//         tsconfigRootDir: import.meta.dirname,
//       },
//     },
//     rules: {
//       "@typescript-eslint/no-explicit-any": "error",
//       "@typescript-eslint/ban-ts-comment": "error",
//       "@typescript-eslint/no-unused-vars": [
//         "error",
//         { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
//       ],
//       "@typescript-eslint/consistent-type-imports": [
//         "error",
//         { prefer: "type-imports", fixStyle: "inline-type-imports" },
//       ],
//       // Relax some strict rules that conflict with Next.js patterns
//       "@typescript-eslint/require-await": "off",
//       "@typescript-eslint/no-misused-promises": [
//         "error",
//         { checksVoidReturn: { attributes: false } },
//       ],
//     },
//   },
//   {
//     ignores: [".next/**", "node_modules/**", "src/generated/**"],
//   },
// ]);
