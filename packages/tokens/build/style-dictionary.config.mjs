/**
 * Style Dictionary v5 build config for @ir/tokens.
 *
 * Lifted directly from abhra/ui (clarion-tokens v0.1 by Ee Yern Ng) so the
 * standalone package and the abhra repo generate byte-identical output.
 * Only the build paths changed: output lands in this package's ./dist.
 *
 * Reads Token Studio JSON from ../tokens/:
 *   primitives.json       → palette, type, space, radius, screen, typography
 *   light.json             → light-mode semantic tokens
 *   dark.json              → dark-mode semantic tokens
 *
 * Outputs:
 *   dist/tokens.css        → :root holds palette + light semantic;
 *                            .dark holds dark semantic overrides.
 *   dist/generated.d.ts    → TypeScript token names for autocomplete.
 *
 * Run: `npm run build` (from packages/tokens).
 */

import StyleDictionary from "style-dictionary";
import { register } from "@tokens-studio/sd-transforms";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

await register(StyleDictionary);

const __dirname = dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = resolve(__dirname, "..");
const TOKENS_DIR = resolve(PKG_ROOT, "tokens");
const DIST_DIR = resolve(PKG_ROOT, "dist") + "/";

// Light and dark are separate token sets (tokens/light.json, tokens/dark.json —
// bare names, no parent folder, so a pushed Figma style/variable name matches
// the token's own path with nothing prepended). Route by source file, not path.
const isDarkToken = (t) =>
  typeof t.filePath === "string" && t.filePath.endsWith("dark.json");
const isLightToken = (t) =>
  typeof t.filePath === "string" && t.filePath.endsWith("light.json");

// ── Name transform ───────────────────────────────────────────────────
function buildCssName(token) {
  const path = [...token.path];
  if (path[0] === "light" || path[0] === "dark" || path[0] === "shared") {
    path.shift();
  }
  if (path[path.length - 1] === "DEFAULT") {
    path.pop();
  }
  return path.join("-").replace(/_/g, "-");
}

StyleDictionary.registerTransform({
  name: "name/ir/css",
  type: "name",
  transform: buildCssName,
});

// ── Reference resolution — keep refs as var() so DevTools stays readable ─
StyleDictionary.registerTransform({
  name: "value/ir/css-var-references",
  type: "value",
  transitive: true,
  filter: (token) =>
    token.original &&
    typeof token.original.$value === "string" &&
    token.original.$value.includes("{"),
  transform: (token) =>
    token.original.$value.replace(/\{([^}]+)\}/g, (_, ref) => {
      const cssName = ref.split(".").join("-");
      return `var(--${cssName})`;
    }),
});

// ── CSS format — emit :root and .dark blocks ─────────────────────────
StyleDictionary.registerFormat({
  name: "css/ir-themed",
  format: async ({ dictionary }) => {
    const rootDecls = [];
    const darkDecls = [];
    const typographyClasses = [];

    dictionary.allTokens.forEach((token) => {
      if (token.$type === "typography" && typeof token.$value === "object") {
        const v = token.$value;
        const className = token.name;
        rootDecls.push(`  --${className}-font-family: ${v.fontFamily};`);
        rootDecls.push(`  --${className}-font-size: ${v.fontSize};`);
        rootDecls.push(`  --${className}-font-weight: ${v.fontWeight};`);
        rootDecls.push(`  --${className}-line-height: ${v.lineHeight};`);
        rootDecls.push(`  --${className}-letter-spacing: ${v.letterSpacing};`);

        const props = [
          `  font-family: var(--${className}-font-family);`,
          `  font-size: var(--${className}-font-size);`,
          `  font-weight: var(--${className}-font-weight);`,
          `  line-height: var(--${className}-line-height);`,
          `  letter-spacing: var(--${className}-letter-spacing);`,
        ];
        if (v.textCase) props.push(`  text-transform: ${v.textCase};`);
        typographyClasses.push(`.${className} {\n${props.join("\n")}\n}`);
        return;
      }

      if (token.$type === "shadow" && Array.isArray(token.$value)) {
        const shadowStr = token.$value
          .map((s) => {
            const inset = s.type === "innerShadow" ? "inset " : "";
            const x = s.offsetX || "0";
            const y = s.offsetY || "0";
            const blur = s.blur || "0";
            const spread = s.spread && s.spread !== "0" ? ` ${s.spread}` : " 0";
            return `${inset}${x} ${y} ${blur}${spread} ${s.color}`;
          })
          .join(", ");
        const decl = `  --${token.name}: ${shadowStr};`;
        if (isDarkToken(token)) darkDecls.push(decl);
        else rootDecls.push(decl);
        return;
      }

      const decl = `  --${token.name}: ${token.$value};`;
      if (isLightToken(token)) rootDecls.push(decl);
      else if (isDarkToken(token)) darkDecls.push(decl);
      else if (token.path[0] === "palette") rootDecls.push(decl);
      else if (token.path[0] === "type") rootDecls.push(decl);
      else if (token.path[0] === "space" || token.path[0] === "radius") rootDecls.push(decl);
      else if (token.path[0] === "shared") rootDecls.push(decl);
    });

    return `/**
 * IR design tokens — generated by Style Dictionary.
 * Do not edit by hand. Source: packages/tokens/tokens/ (Token Studio).
 *
 * <html>               → light mode (default)
 * <html class="dark">  → dark mode
 */

:root {
${rootDecls.join("\n")}
}

/*__IR_DARK_BLOCK__*/

${typographyClasses.join("\n\n")}
`;
  },
});

// ── TypeScript types format ──────────────────────────────────────────
StyleDictionary.registerFormat({
  name: "typescript/ir-types",
  format: async ({ dictionary }) => {
    const colourAndPrimitiveNames = dictionary.allTokens
      .filter(
        (t) =>
          (t.path[0] === "palette" ||
            t.path[0] === "type" ||
            t.path[0] === "space" ||
            t.path[0] === "radius" ||
            isLightToken(t)) &&
          t.$type !== "typography",
      )
      .map((t) => `'${t.name}'`);

    const typographyClassNames = dictionary.allTokens
      .filter((t) => t.$type === "typography")
      .map((t) => `'${t.name}'`);

    return `// Generated by Style Dictionary — do not edit by hand.
// Source: packages/tokens/tokens/ (Token Studio).

/** All available IR design token CSS variable names. Dark-mode tokens
 *  share names with light-mode (the .dark class swaps values at runtime). */
export type IRTokenName =
  | ${colourAndPrimitiveNames.join("\n  | ")};

export const tokenNames: readonly IRTokenName[] = [
  ${colourAndPrimitiveNames.join(",\n  ")},
] as const;

/** Typography composite utility class names. Applied as React className. */
export type IRTypographyClass =
  | ${typographyClassNames.join("\n  | ")};

export const typographyClasses: readonly IRTypographyClass[] = [
  ${typographyClassNames.join(",\n  ")},
] as const;
`;
  },
});


// ── px → rem ─────────────────────────────────────────────────────────
// Figma can only store unitless numbers, so a variables export writes raw
// px into space/*, radius/* and type/size/*. This normalises them back to
// rem so the export can never silently convert the system to px.
// Deliberately NOT applied to screen/* (media queries stay px), shadow
// offsets/blur, space.px (a hairline) or radius.full (a pill).
const REM_BASE = 16;
StyleDictionary.registerTransform({
  name: "size/ir/rem",
  type: "value",
  transitive: true,
  filter: (token) => {
    const p = token.path;
    const isTarget =
      p[0] === "space" || p[0] === "radius" || (p[0] === "type" && p[1] === "size");
    if (!isTarget) return false;
    const key = p.join(".");
    if (key === "space.px" || key === "radius.full") return false;
    const v = token.$value;
    return typeof v === "number" || (typeof v === "string" && !v.includes("{"));
  },
  transform: (token) => {
    const v = token.$value;
    if (typeof v === "string" && (v.endsWith("rem") || v.includes("var("))) return v;
    const num = typeof v === "number" ? v : parseFloat(v);
    if (!isFinite(num)) return v;
    if (num === 0) return "0";
    return `${+(num / REM_BASE).toFixed(4)}rem`;
  },
});

// ── Build ───────────────────────────────────────────────────────────
// Light and dark are separate token SETS now, which means both carry the same
// token paths (bg.app, fg.neutral.subtle …). Style Dictionary merges all sources
// into one tree keyed by path, so feeding both to one build makes them collide
// and the last source silently wins. They must be built in two passes.

import { readFileSync } from "node:fs";

// Pass 1 — primitives (incl. typography) + light → :root (and a sentinel for .dark)
const light = new StyleDictionary({
  source: [
    resolve(TOKENS_DIR, "primitives.json"),
    resolve(TOKENS_DIR, "light.json"),
  ],
  preprocessors: ["tokens-studio"],
  platforms: {
    css: {
      transforms: ["name/ir/css", "value/ir/css-var-references", "size/ir/rem"],
      buildPath: DIST_DIR,
      files: [{ destination: "tokens.css", format: "css/ir-themed" }],
    },
    typescript: {
      transforms: ["name/ir/css"],
      buildPath: DIST_DIR,
      files: [{ destination: "generated.d.ts", format: "typescript/ir-types" }],
    },
  },
});
await light.buildAllPlatforms();

// Pass 2 — primitives (for reference resolution) + dark → .dark, spliced in
StyleDictionary.registerFormat({
  name: "css/ir-dark-only",
  format: async ({ dictionary }) => {
    const darkDecls = [];
    dictionary.allTokens.forEach((token) => {
      if (!isDarkToken(token)) return;
      if (token.$type === "shadow" && Array.isArray(token.$value)) {
        const shadowStr = token.$value
          .map((sh) => {
            const inset = sh.type === "innerShadow" ? "inset " : "";
            const x = sh.offsetX || "0";
            const y = sh.offsetY || "0";
            const blur = sh.blur || "0";
            const spread = sh.spread && sh.spread !== "0" ? ` ${sh.spread}` : " 0";
            return `${inset}${x} ${y} ${blur}${spread} ${sh.color}`;
          })
          .join(", ");
        darkDecls.push(`  --${token.name}: ${shadowStr};`);
        return;
      }
      darkDecls.push(`  --${token.name}: ${token.$value};`);
    });

    const existing = readFileSync(DIST_DIR + "tokens.css", "utf8");
    const darkBlock = `.dark {\n${darkDecls.join("\n")}\n}`;
    return existing.replace("/*__IR_DARK_BLOCK__*/", darkBlock);
  },
});

const dark = new StyleDictionary({
  source: [resolve(TOKENS_DIR, "primitives.json"), resolve(TOKENS_DIR, "dark.json")],
  preprocessors: ["tokens-studio"],
  platforms: {
    css: {
      transforms: ["name/ir/css", "value/ir/css-var-references", "size/ir/rem"],
      buildPath: DIST_DIR,
      files: [{ destination: "tokens.css", format: "css/ir-dark-only" }],
    },
  },
});
await dark.buildAllPlatforms();
