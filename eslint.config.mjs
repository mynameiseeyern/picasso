import { defineConfig } from "eslint/config";
import { library } from "./packages/eslint-config/index.mjs";

/**
 * This repo's lint, from the same package a product gets.
 *
 * The rules used to live here and only here, which meant `@ir/ui` could be
 * installed anywhere and arrive with none of them. They are in
 * `packages/eslint-config` now; this file is the design system's own
 * application of it, so the config a product extends is the config that runs
 * against the library itself. One copy, two consumers — the repo's own rule
 * about two copies of one fact.
 *
 * Everything below is the narrow set of things that are true here and would
 * not be true in a product.
 */
export default defineConfig([
  ...library({
    files: ["packages/ui/src/**/*.{ts,tsx}"],
    contracts: [
      // <col> exists to carry a column width and accepts almost nothing else.
      // There is no parent to move the width to — the colgroup is the parent —
      // and no sensible closed set of widths to make into a variant. Colour
      // and type on it are still refused.
      { pattern: "^TableCol$", allow: ["layout"] },
      // A Skeleton is a stand-in for content that has not arrived, so its size
      // IS the component, and there is no closed set to make into variants
      // because it mirrors whatever is coming. Shape is a variant instead of
      // an allowance; colour, type and effects are still refused.
      { pattern: "^Skeleton$", allow: ["layout"] },
    ],
  }),
  {
    /* The site is not exempt. The theme builder renders the same components a
       product does, and the docs pages are the first thing an engineer copies
       from — a rule the library enforces and the site breaks teaches the
       break. One difference: fd-* is Fumadocs' own token namespace, declared
       in its package stylesheet, and @shadcn/lint only credits tokens the
       project itself declares. ir-* and fd-* are the site shell's whole
       vocabulary, and Picasso components never use either. */
    ...library({ files: ["apps/site/**/*.{ts,tsx}"] })[1],
    rules: {
      ...library({ files: ["apps/site/**/*.{ts,tsx}"] })[1].rules,
      "shadcn/no-raw-colors": ["error", { allow: ["*-fd-*"] }],
      "shadcn/no-unknown-classes": "off",
      "picasso/require-content-width": "off",
    },
  },
]);
