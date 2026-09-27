import { plugin as shadcn } from "@shadcn/lint";
import tsParser from "@typescript-eslint/parser";
import { defineConfig, globalIgnores } from "eslint/config";

/**
 * @shadcn/lint — design system rules, enforced.
 *
 * ESLint rather than oxlint: oxlint is faster, but its Rust allocator aborts
 * in sandboxed Linux VMs, which is where some of this work happens. One
 * config that runs everywhere beats a fast one that runs in some places.
 */
export default defineConfig([
  globalIgnores([
    "**/dist/**",
    "**/storybook-static/**",
    "**/node_modules/**",
    "public/**",
    // Generated or vendored into the site: the nested Storybook bundle, Next's
    // output, and the Fumadocs collections. Linting a build artefact reports
    // other people's rules as missing definitions.
    "apps/site/public/**",
    "apps/site/.next/**",
    "apps/site/.source/**",
  ]),
  {
    files: ["packages/ui/src/**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: { shadcn },
    settings: {
      shadcn: {
        ui: "packages/ui/src/components",
        componentImports: ["^@ir/ui(/|$)"],
        mergeFunctions: ["cn"],
        variantFunctions: ["cva"],
        note:
          "Picasso rules are in AGENTS.md and docs/foundations/. Semantic utilities only: " +
          "surface-* for backgrounds, content-* for text, line-* for borders. Never a raw hex, " +
          "never a hard-coded corner — radius comes from rounded-*.",
      },
    },
    rules: {
      "shadcn/no-raw-colors": "error",
      "shadcn/no-arbitrary-values": "error",
      "shadcn/no-restyle": "warn",
      "shadcn/no-inline-styles": "error",
      "shadcn/no-unknown-classes": "error",
      "shadcn/require-static-classes": "error",
    },
  },
]);
