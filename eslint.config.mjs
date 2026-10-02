import { plugin as shadcn } from "@shadcn/lint";
import noPhysicalProperties from "./tools/eslint-rules/no-physical-properties.mjs";
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
    plugins: {
      shadcn,
      /* One local rule, because @shadcn/lint has no equivalent and the thing
         it guards — a component that reads correctly in both directions — is
         invisible in every LTR screenshot. */
      picasso: { rules: { "no-physical-properties": noPhysicalProperties } },
    },
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
      "picasso/no-physical-properties": "error",
      "shadcn/no-raw-colors": "error",
      "shadcn/no-arbitrary-values": "error",
      /**
       * no-restyle — a component owns its own look; the page owns where it
       * sits. By default that means NO classes from outside, and the fix for
       * "I need this 420 wide" or "this should span two columns" is a wrapper
       * element, not a class on the component. That default is deliberate and
       * should stay: it is what keeps a Button the same Button everywhere.
       *
       * A `contracts` entry is for the narrow case where a class is not
       * restyling but the component's entire purpose. Add one only when the
       * component has no other way to express the thing, and keep it to the
       * category it needs — `allow: ["layout"]` still refuses colour,
       * typography, spacing, shape, effects and motion.
       */
      "shadcn/no-restyle": ["warn", {
        contracts: [
          // <col> exists to carry a column width and accepts almost nothing
          // else. There is no parent to move the width to — the colgroup is
          // the parent — and no sensible closed set of widths to make into a
          // variant. Colour and type on it are still refused.
          { pattern: "^TableCol$", allow: ["layout"] },
          // A Skeleton is a stand-in for content that has not arrived, so its
          // size IS the component — and there is no closed set to make into
          // variants, because it mirrors whatever is coming (a label, an
          // avatar, a chart). A wrapper cannot express it without a second
          // element per skeleton. Shape is a variant instead of an allowance,
          // and colour, type and effects are still refused.
          { pattern: "^Skeleton$", allow: ["layout"] },
        ],
      }],
      "shadcn/no-inline-styles": "error",
      "shadcn/no-unknown-classes": "error",
      "shadcn/require-static-classes": "error",
    },
  },
]);
