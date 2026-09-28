/**
 * Style Dictionary v5 build config for @ir/tokens.
 *
 * Lifted directly from abhra/ui (clarion-tokens v0.1 by Ee Yern Ng) so the
 * standalone package and the abhra repo generate byte-identical output.
 * Only the build paths changed: output lands in this package's ./dist.
 *
 * Reads Token Studio JSON from ../tokens/:
 *   core.json                     → shared primitives: neutral + status ramps,
 *                                   type scale, space, radius ladder, screen
 *   brands/<brand>/primitives.json → per-brand: palette.brand, type.family,
 *                                   radius.base (the one radius knob)
 *   light.json / dark.json        → semantic tokens, shared by every brand
 *
 * The default brand (clarion) lands in :root; every brand also gets a
 * [data-brand="…"] block so a subtree can switch brand.
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

// ── Brands ───────────────────────────────────────────────────────────
import { readFileSync, writeFileSync } from "node:fs";
import { BRANDS, DEFAULT_BRAND, presets, writeBrandArtifacts, toPx, scaleSpace } from "./brands.mjs";
const CORE = resolve(TOKENS_DIR, "core.json");
// Each brand's primitive layer is generated from brand.json + presets.json
// (see brands.mjs) into dist/brands/<id>/layer.json, alongside the figma.json
// the sync plugin applies.
const ARTIFACTS = writeBrandArtifacts(resolve(PKG_ROOT, "dist"));
const brandFile = (b) => ARTIFACTS[b].layerPath;
// `_`-prefixed tokens (_shadow, _ring) are internal: they feed composites and
// Figma effect styles, and are never emitted as CSS custom properties.
const isInternal = (t) => t.path.some((p) => p.startsWith("_"));
const isBrandToken = (t) =>
  typeof t.filePath === "string" && t.filePath.replace(/\\/g, "/").includes("/brands/");

// The radius ladder is NOT emitted as static values. Code derives it at
// runtime from --radius in theme.css (calc), so the data-radius axis can
// turn one knob. Emitting static --radius-sm etc. here would shadow that —
// the 28 Sept bug. Only radius.base (→ --radius), none and full go out.
const isDerivedRadius = (t) =>
  t.path[0] === "radius" && !["base", "none", "full"].includes(t.path[1]);

// ── Drift gate: token formulas ⇔ theme.css calc() ────────────────────
// Token Studio needs the multipliers (it resolves them into Figma numbers);
// CSS needs them as calc(). Two copies of one fact — so the build checks
// they agree and fails loudly if not.
{
  const core = JSON.parse(readFileSync(CORE, "utf8"));
  const themeCss = readFileSync(resolve(PKG_ROOT, "theme.css"), "utf8");
  const problems = [];
  for (const [step, tok] of Object.entries(core.radius)) {
    if (step.startsWith("$") || step === "none" || step === "full") continue;
    const m = String(tok.$value).match(/^\{radius\.base\}(?:\s*\*\s*([\d.]+))?$/);
    if (!m) { problems.push(`core radius.${step} = "${tok.$value}" is not {radius.base} * n`); continue; }
    const want = m[1] ? Number(m[1]) : 1;
    const line = themeCss.match(new RegExp(`--radius-${step}:\\s*([^;]+);`));
    if (!line) { problems.push(`theme.css has no --radius-${step}`); continue; }
    const c = line[1].trim().match(/^(?:calc\(var\(--radius\)\s*\*\s*([\d.]+)\)|var\(--radius\))$/);
    const got = c ? (c[1] ? Number(c[1]) : 1) : NaN;
    if (got !== want) problems.push(`radius.${step}: tokens say ×${want}, theme.css says "${line[1].trim()}"`);
  }
  if (problems.length) throw new Error("Radius ladder drift:\n  " + problems.join("\n  "));
}

// ── Name transform ───────────────────────────────────────────────────
function buildCssName(token) {
  const path = [...token.path];
  if (path[0] === "light" || path[0] === "dark" || path[0] === "shared") {
    path.shift();
  }
  if (path[path.length - 1] === "DEFAULT") {
    path.pop();
  }
  // radius.base is shadcn's single knob, which CSS has always called --radius.
  if (path[0] === "radius" && path[1] === "base" && path.length === 2) {
    return "radius";
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
      const cssName = buildCssName({ path: ref.split(".") });
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
      if (isDerivedRadius(token) || isInternal(token)) return;
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
        // `@utility`, not a plain `.class`. A bare class is invisible to
        // Tailwind: it cannot take a variant (`md:text-label-sm` silently does
        // nothing), it sits outside the utilities layer so cascade order is by
        // source position, and tooling cannot see it. @utility makes each step
        // a first-class Tailwind utility.
        typographyClasses.push(`@utility ${className} {\n${props.join("\n")}\n}`);
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
          t.$type !== "typography" &&
          !isInternal(t),
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


// Pass 1 — primitives (incl. typography) + light → :root (and a sentinel for .dark)
const light = new StyleDictionary({
  source: [
    CORE,
    brandFile(DEFAULT_BRAND),
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
      if (!isDarkToken(token) || isInternal(token)) return;
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
  source: [CORE, brandFile(DEFAULT_BRAND), resolve(TOKENS_DIR, "dark.json")],
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

// Pass 3 — one [data-brand="…"] block per brand, appended after :root/.dark.
// tokens.css is imported BEFORE themes.css, so an explicit axis
// (data-radius, data-type …) still beats the brand's default. That ordering
// is load-bearing: brand sets defaults, axes override them.
const brandBlocks = [];
for (const brand of BRANDS) {
  StyleDictionary.registerFormat({
    name: `css/ir-brand-${brand}`,
    format: async ({ dictionary }) => {
      const decls = dictionary.allTokens
        .filter((t) => isBrandToken(t) && !isDerivedRadius(t))
        .map((t) => `  --${t.name}: ${t.$value};`);
      const o = ARTIFACTS[brand].overrides;
      const on = (m) => Object.entries(o[m]).map(([k, v]) => `  --fg-on-${k}: var(--${v.slice(1, -1).replaceAll(".", "-")});`);
      decls.push(...on("light"));
      let block = `[data-brand="${brand}"] {\n${decls.join("\n")}\n}`;
      if (on("dark").length)
        block += `\n.dark[data-brand="${brand}"], .dark [data-brand="${brand}"] {\n${on("dark").join("\n")}\n}`;
      brandBlocks.push(block);
      return "";
    },
  });
  const sd = new StyleDictionary({
    source: [CORE, brandFile(brand)],
    preprocessors: ["tokens-studio"],
    log: { verbosity: "silent" },
    platforms: {
      css: {
        transforms: ["name/ir/css", "value/ir/css-var-references", "size/ir/rem"],
        buildPath: DIST_DIR,
        files: [{ destination: `.brand-${brand}.tmp`, format: `css/ir-brand-${brand}` }],
      },
    },
  });
  await sd.formatPlatform("css");
}
// Axes — the same presets a brand chooses from, applied at runtime. They come
// AFTER the brand blocks, so an explicit axis beats the brand's default.
const own = (o) => Object.entries(o).filter(([k]) => !k.startsWith("$"));
const axisBlocks = [];
for (const [k, v] of own(presets.radius)) axisBlocks.push(`[data-radius="${k}"] { --radius: ${v}; }`);
for (const [k, ramp] of own(presets.neutral))
  axisBlocks.push(`[data-neutral="${k}"] {\n${own(ramp).map(([s, c]) => `  --palette-neutral-${s}: ${c};`).join("\n")}\n}`);
for (const [k, mult] of own(presets.spacing))
  axisBlocks.push(
    `[data-spacing="${k}"] {\n${own(presets.space)
      .map(([s, v]) => {
        const px = scaleSpace(toPx(v), mult, s);
        return `  --space-${s.replace(/_/g, "-")}: ${s === "px" ? "1px" : px === 0 ? "0" : `${+(px / 16).toFixed(4)}rem`};`;
      })
      .join("\n")}\n}`,
  );
brandBlocks.push("/* ── Axes (presets.json) — after brands, so an explicit axis wins ── */", ...axisBlocks);

const css = readFileSync(DIST_DIR + "tokens.css", "utf8");
writeFileSync(
  DIST_DIR + "tokens.css",
  css.replace(/\n*$/, "\n\n/* ── Brands (default brand is also in :root) ── */\n" + brandBlocks.join("\n\n") + "\n"),
);
