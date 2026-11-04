/**
 * @ir/eslint-config — Picasso's rules, packaged so they travel.
 *
 * The rules were the strongest thing the design system had and the least
 * portable: they lived in one `eslint.config.mjs` in the picasso repo, so the
 * moment `@ir/ui` is installed somewhere else the enforcement evaporates and
 * the product gets the components with none of the guarantees. Dev on 27 Oct
 * is what that looks like — one Ops Console page carrying 54 arbitrary
 * Tailwind values, 20 of them `[var(--…)]`, none of which could have been
 * written with these rules on.
 *
 * Two presets, because a design system repo honestly does things a product
 * should not. `library` is for this repo: it builds the components, so it
 * writes the classes. `product` is for an app consuming @ir/ui: it composes
 * components, so a class on one is almost always a mistake, and the page-level
 * rules apply.
 *
 *   // eslint.config.mjs in a product repo
 *   import { product } from "@ir/eslint-config";
 *   export default product();
 *
 * Both take the same options:
 *
 *   files     what to lint. Defaults to every ts/tsx outside the usual build
 *             output.
 *   ui        where the component source is, for the rules that read it.
 *             Defaults to node_modules/@ir/ui/src/components in a product.
 *   contracts no-restyle exceptions. See the note on that rule below.
 *   note      the sentence appended to every message. Point it at wherever
 *             the product keeps its own conventions.
 */

import { plugin as shadcn } from "@shadcn/lint";
import tsParser from "@typescript-eslint/parser";

import noPhysicalProperties from "./rules/no-physical-properties.mjs";
import noRawPageTitle from "./rules/no-raw-page-title.mjs";
import requireContentWidth from "./rules/require-content-width.mjs";

export const rules = {
  "no-physical-properties": noPhysicalProperties,
  "no-raw-page-title": noRawPageTitle,
  "require-content-width": requireContentWidth,
};

export const ignores = [
  "**/dist/**",
  "**/node_modules/**",
  "**/storybook-static/**",
  "**/.next/**",
  "**/.source/**",
  // Static assets and anything nested into them — a site that serves a built
  // Storybook under public/ was reporting that bundle's own rules as missing.
  "**/public/**",
  // Code Connect templates: they import Figma's virtual "figma" module and
  // run in Figma's runtime, not ours, so our rules do not apply to them.
  "**/*.figma.ts",
];

const NOTE =
  "Picasso's rules: semantic utilities only — surface-* for backgrounds, " +
  "content-* for text, line-* for borders. Never a raw hex, never an " +
  "arbitrary value, never a hard-coded corner. https://ir-picasso.vercel.app/docs";

function base({ files, ui, componentImports, contracts, note }) {
  return {
    files,
    languageOptions: {
      parser: tsParser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: { shadcn, picasso: { rules } },
    settings: {
      shadcn: {
        ui,
        componentImports,
        mergeFunctions: ["cn"],
        variantFunctions: ["cva"],
        note,
      },
    },
    rules: {
      "picasso/no-physical-properties": "error",
      "shadcn/no-raw-colors": "error",
      "shadcn/no-arbitrary-values": "error",
      "shadcn/no-inline-styles": "error",
      "shadcn/no-unknown-classes": "error",
      "shadcn/require-static-classes": "error",
      /**
       * no-restyle — a component owns its own look; the page owns where it
       * sits. By default that means NO classes from outside, and the fix for
       * "I need this 420 wide" is a wrapper element, not a class on the
       * component. A `contracts` entry is for the narrow case where a class
       * is the component's entire purpose; keep it to the category it needs,
       * since `allow: ["layout"]` still refuses colour, type and shape.
       */
      "shadcn/no-restyle": ["warn", { contracts }],
    },
  };
}

/** The design system's own repo: it writes the classes, so the page-level
 *  rules are off and an <h1> in a story is a specimen, not a page title. */
export function library(options = {}) {
  const {
    files = ["**/*.{ts,tsx}"],
    ui = "packages/ui/src/components",
    componentImports = ["^@ir/ui(/|$)"],
    contracts = [],
    note = NOTE,
  } = options;
  return [
    { ignores },
    {
      ...base({ files, ui, componentImports, contracts, note }),
      rules: {
        ...base({ files, ui, componentImports, contracts, note }).rules,
        "picasso/no-raw-page-title": "off",
        "picasso/require-content-width": "warn",
      },
    },
  ];
}

/** A product consuming @ir/ui: it composes components rather than building
 *  them, so a class on one is almost always a restyle, and every page owes a
 *  width and a PageHeader. */
export function product(options = {}) {
  const {
    files = ["**/*.{ts,tsx}"],
    ui = "node_modules/@ir/ui/src/components",
    componentImports = ["^@ir/ui(/|$)"],
    contracts = [],
    note = NOTE,
  } = options;
  const b = base({ files, ui, componentImports, contracts, note });
  return [
    { ignores },
    {
      ...b,
      rules: {
        ...b.rules,
        // A product has no reason to restyle a component it did not build.
        "shadcn/no-restyle": ["error", { contracts }],
        "picasso/no-raw-page-title": "error",
        "picasso/require-content-width": "error",
      },
    },
  ];
}

export default { library, product, rules, ignores };
