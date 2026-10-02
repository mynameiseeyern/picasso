/**
 * Brands — turn brands/<brand>/brand.json + presets.json into that brand's
 * primitives, and export the Figma payload the sync plugin applies.
 *
 * A brand is a set of CHOICES, not a pile of values:
 *
 *   colour   base colour (+ optional pinned ramp)   → palette.brand.*
 *   neutral  cool | warm                            → palette.neutral.*
 *   radius   sharp | subtle | default | rounded     → radius.base
 *   spacing  compact | default | relaxed            → space.*  (rounded to 2px)
 *   type     sans + mono family                     → type.family.*
 *
 * Everything else (status ramps, type scale, semantics) is shared. The one
 * semantic a brand may change is fg/on/*-emphasis, and only by measurement.
 */
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { buildRamp, inkFor } from "./ramp.mjs";
import { toPx, pxToRem, scaleSpace } from "./space.mjs";
export { toPx, scaleSpace };

export const PKG_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const TOKENS_DIR = resolve(PKG_ROOT, "tokens");
const read = (f) => JSON.parse(readFileSync(resolve(TOKENS_DIR, f), "utf8"));

export const presets = read("presets.json");
export const core = read("core.json");
export const semantic = { light: read("light.json"), dark: read("dark.json") };

export const DEFAULT_BRAND = "clarion";
export const BRANDS = readdirSync(resolve(TOKENS_DIR, "brands"), { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
  .sort((a, b) => (a === DEFAULT_BRAND ? -1 : b === DEFAULT_BRAND ? 1 : a.localeCompare(b)));
if (!BRANDS.includes(DEFAULT_BRAND)) throw new Error(`tokens/brands/${DEFAULT_BRAND} is missing`);

const own = (o) => Object.entries(o).filter(([k]) => !k.startsWith("$"));

function font(name, role) {
  const f = presets.fonts[name];
  // Both stacks carry the Arabic and Hebrew faces ahead of the system fonts,
  // as every stack in presets.json does. Mono too: a mono role sometimes
  // holds a word (a Progress label is metric/md), and Arabic in an OS
  // monospace comes out unjoined.
  const scripts = "'Noto Sans Arabic', 'Noto Sans Hebrew'";
  const fallback = role === "mono" ? `${scripts}, ui-monospace, SFMono-Regular, Menlo, monospace` : `${scripts}, ui-sans-serif, system-ui, sans-serif`;
  return {
    name,
    stack: f?.stack ?? `'${name}', ${fallback}`,
    styles: f?.styles ?? { 400: "Regular", 500: "Medium", 600: "Semi Bold", 700: "Bold" },
  };
}

const cache = new Map();
/** The brand's own primitive layer, in the same token format as core.json. */
export function brandLayer(id) {
  if (cache.has(id)) return cache.get(id);
  const b = read(`brands/${id}/brand.json`);
  const pick = (axis, key) => {
    if (!(key in presets[axis]) || key.startsWith("$"))
      throw new Error(`brands/${id}: ${axis} "${key}" is not a preset (${own(presets[axis]).map(([k]) => k).join(", ")})`);
    return presets[axis][key];
  };
  const ramp = b.colour.ramp ?? buildRamp(b.colour.base);
  const neutral = pick("neutral", b.neutral);
  const mult = pick("spacing", b.spacing);
  const radiusBase = pick("radius", b.radius);
  const fonts = { sans: font(b.type.sans, "sans"), mono: font(b.type.mono, "mono") };
  const colours = (o) => Object.fromEntries(own(o).map(([k, v]) => [k, { $type: "color", $value: v.toUpperCase() }]));
  const space = Object.fromEntries(
    own(presets.space).map(([k, v]) => [k, { $type: "dimension", $value: k === "px" ? "1px" : pxToRem(scaleSpace(toPx(v), mult, k)) }]),
  );
  const layer = {
    id,
    name: b.name,
    choices: { neutral: b.neutral, radius: b.radius, spacing: b.spacing, sans: b.type.sans, mono: b.type.mono, base: b.colour.base },
    fonts,
    tokens: {
      $description: `Generated from brands/${id}/brand.json + presets.json. Do not edit.`,
      palette: { brand: colours(ramp), neutral: colours(neutral) },
      type: { family: { sans: { $type: "fontFamilies", $value: fonts.sans.stack }, mono: { $type: "fontFamilies", $value: fonts.mono.stack } } },
      radius: { base: { $type: "dimension", $value: radiusBase } },
      space,
    },
  };
  cache.set(id, layer);
  return layer;
}

/* ── resolution ─────────────────────────────────────────────────────── */
export function flatten(tree, pre = [], out = {}) {
  for (const [k, v] of own(tree)) {
    if (v && typeof v === "object" && "$value" in v) out[[...pre, k].join(".")] = v;
    else if (v && typeof v === "object") flatten(v, [...pre, k], out);
  }
  return out;
}
export function resolver(...trees) {
  const flat = Object.assign({}, ...trees.map((t) => flatten(t)));
  const res = (val) => {
    if (typeof val !== "string") return val;
    const ref = val.match(/^\{([^}]+)\}$/);
    if (ref) {
      if (!flat[ref[1]]) throw new Error(`unresolved reference ${val}`);
      return res(flat[ref[1]].$value);
    }
    if (val.includes("{")) {
      // Arithmetic on dimensions, e.g. "{radius.base} * 0.6" → px.
      const expr = val.replace(/\{([^}]+)\}/g, (_, r) => String(toPx(res(`{${r}}`))));
      if (!/^[\d.\s*+\-/()]+$/.test(expr)) throw new Error(`bad expression ${val}`);
      return `${+Function(`return (${expr})`)().toFixed(4)}px`;
    }
    return val;
  };
  return { flat, res };
}

/** Any CSS colour we author → #RRGGBB or #RRGGBBAA (uppercase). */
export function hex8(c) {
  const s = String(c).trim();
  let m = s.match(/^#([0-9a-f]{6})([0-9a-f]{2})?$/i);
  if (m) return (`#${m[1]}${m[2] && m[2].toLowerCase() !== "ff" ? m[2] : ""}`).toUpperCase();
  m = s.match(/^rgba?\(([^)]+)\)$/i);
  if (m) {
    const [r, g, b, a = 1] = m[1].split(/[\s,/]+/).filter(Boolean).map(Number);
    const h = (n) => Math.round(n).toString(16).padStart(2, "0");
    return (`#${h(r)}${h(g)}${h(b)}${a < 1 ? h(a * 255) : ""}`).toUpperCase();
  }
  throw new Error(`unsupported colour ${c}`);
}

/**
 * fg/on/<intent>-emphasis sits on bg/<intent>/emphasis. Pick white or the
 * darkest neutral by measured contrast (white preferred when both pass).
 * Returns only the tokens whose measured ink differs from the authored one.
 */
export function onColourOverrides(id) {
  const { res } = resolver(core, brandLayer(id).tokens);
  const out = { light: {}, dark: {} };
  for (const mode of ["light", "dark"]) {
    const sem = semantic[mode];
    for (const [name, tok] of own(sem.fg.on)) {
      if (!name.endsWith("-emphasis")) continue;
      const bgTok = sem.bg?.[name.replace(/-emphasis$/, "")]?.emphasis;
      if (!bgTok) continue;
      const bg = res(bgTok.$value);
      const darkInk = res("{palette.neutral.950}");
      const { ink } = inkFor(bg, { dark: darkInk });
      const want = ink === "light" ? "{palette.white}" : "{palette.neutral.950}";
      if (want !== tok.$value) out[mode][name] = want;
    }
  }
  return out;
}

/* ── Figma export ───────────────────────────────────────────────────── */
const SCOPES = [
  [/^palette\//, []],
  [/^bg\//, ["FRAME_FILL", "SHAPE_FILL"]],
  [/^fg\//, ["TEXT_FILL", "SHAPE_FILL", "STROKE_COLOR"]],
  [/^border\//, ["STROKE_COLOR", "SHAPE_FILL"]], // SHAPE_FILL: 1px divider rectangles
  [/^(status|chart)\//, ["FRAME_FILL", "SHAPE_FILL", "STROKE_COLOR", "TEXT_FILL"]],
  [/^_(shadow|ring)\//, ["EFFECT_COLOR"]],
  [/^space\//, ["GAP", "WIDTH_HEIGHT"]],
  [/^radius\/base$/, []],
  [/^radius\//, ["CORNER_RADIUS"]],
  [/^type\/size\//, ["FONT_SIZE"]],
  [/^type\/weight\//, ["FONT_WEIGHT"]],
  [/^type\/family\//, ["FONT_FAMILY"]],
  [/^_type\/style\//, ["FONT_STYLE"]],
  [/^paragraphSpacing\//, ["PARAGRAPH_SPACING"]],
  [/^paragraphIndent\//, ["PARAGRAPH_INDENT"]],
  [/^screen\//, ["WIDTH_HEIGHT"]],
  [/^size\//, ["WIDTH_HEIGHT"]],
  // layer/* is the z-index scale. Figma has no z-index to bind, so these are
  // hidden from every picker: they exist so the scale can be read in the file
  // and so both sides carry the same tokens.
  [/^layer\//, []],
  // motion/* has nothing to bind to in Figma either: hidden, there to be read.
  [/^motion\//, []],
];
const scopesFor = (name) => (SCOPES.find(([re]) => re.test(name)) ?? [null, []])[1];
const figmaName = (path) => path.replaceAll(".", "/");
const WEIGHT_KEY = { 400: "regular", 500: "medium", 600: "semibold", 700: "bold" };

export function figmaExport(id) {
  const L = brandLayer(id);
  const { flat, res } = resolver(core, L.tokens);
  const prim = [];
  const add = (name, type, value, description) =>
    prim.push({ name, type, scopes: scopesFor(name), ...(description ? { description } : {}), values: { [L.name]: value } });

  for (const [path, t] of Object.entries(flat)) {
    const name = figmaName(path);
    const v = res(t.$value);
    if (t.$type === "color") add(name, "COLOR", hex8(v), t.$description);
    else if (t.$type === "dimension" || t.$type === "fontSizes") add(name, "FLOAT", toPx(v), t.$description);
    else if (t.$type === "fontWeights") add(name, "FLOAT", Number(v));
    else if (t.$type === "number") add(name, "FLOAT", Number(v), t.$description);
    // Durations go across as a number of milliseconds; a curve as its string.
    else if (t.$type === "duration") add(name, "FLOAT", parseFloat(v), t.$description);
    else if (t.$type === "cubicBezier") add(name, "STRING", String(v), t.$description);
    else if (t.$type === "fontFamilies") add(name, "STRING", L.fonts[path.split(".").pop()].name);
    // lineHeights / letterSpacing / typography live in the text styles:
    // Figma variables cannot hold % line heights or em tracking.
  }

  // Text styles, plus the helper variables they bind (Figma binds font
  // STYLE by name, so each role × weight needs a string variable).
  const textStyles = [];
  const helpers = new Map();
  for (const [path, t] of Object.entries(flat)) {
    if (t.$type !== "typography") continue;
    const v = t.$value;
    const role = v.fontFamily.match(/type\.family\.(\w+)/)[1];
    const weight = Number(res(v.fontWeight));
    const styleVar = `_type/style/${role}-${WEIGHT_KEY[weight]}`;
    helpers.set(styleVar, L.fonts[role].styles[weight]);
    const lh = res(v.lineHeight);
    const ls = res(v.letterSpacing);
    textStyles.push({
      name: figmaName(path),
      fontFamily: L.fonts[role].name,
      fontStyle: L.fonts[role].styles[weight],
      fontSize: toPx(res(v.fontSize)),
      lineHeightPercent: parseFloat(lh),
      letterSpacingPercent: String(ls).endsWith("em") ? +(parseFloat(ls) * 100).toFixed(2) : 0,
      textCase: v.textCase === "uppercase" ? "UPPER" : "ORIGINAL",
      bind: {
        fontFamily: `type/family/${role}`,
        fontSize: figmaName(v.fontSize.slice(1, -1)),
        fontStyle: styleVar,
        paragraphSpacing: "paragraphSpacing/0",
        paragraphIndent: "paragraphIndent/0",
      },
    });
  }
  for (const [name, value] of [...helpers].sort()) add(name, "STRING", value);
  add("paragraphSpacing/0", "FLOAT", 0);
  add("paragraphIndent/0", "FLOAT", 0);

  // Semantic: aliases stay aliases, so Figma follows a primitive change.
  const over = onColourOverrides(id);
  const semVars = new Map();
  for (const mode of ["light", "dark"]) {
    const modeName = mode === "light" ? "Light" : "Dark";
    for (const [path, t] of Object.entries(flatten(semantic[mode]))) {
      if (t.$type !== "color") continue;
      let raw = t.$value;
      if (path.startsWith("fg.on.") && over[mode][path.slice(6)]) raw = over[mode][path.slice(6)];
      const name = figmaName(path);
      const ref = String(raw).match(/^\{([^}]+)\}$/);
      const value = ref ? { alias: figmaName(ref[1]) } : hex8(raw);
      if (!semVars.has(name)) semVars.set(name, { name, type: "COLOR", scopes: scopesFor(name), values: {} });
      semVars.get(name).values[modeName] = value;
    }
  }

  // Effect styles: geometry from the composite, colour bound to the layer's
  // variable. Figma lists effects bottom-up, CSS top-down — hence reverse().
  const effectStyles = [];
  for (const [path, t] of Object.entries(flatten(semantic.light))) {
    if (t.$type !== "shadow") continue;
    effectStyles.push({
      name: figmaName(path),
      effects: [...t.$value].reverse().map((l) => ({
        type: l.type === "innerShadow" ? "INNER_SHADOW" : "DROP_SHADOW",
        x: toPx(l.x), y: toPx(l.y), blur: toPx(l.blur), spread: toPx(l.spread),
        colorVar: figmaName(l.color.slice(1, -1)),
      })),
    });
  }

  return {
    $schema: "picasso-figma-sync/1",
    brand: id,
    name: L.name,
    choices: L.choices,
    collections: [
      { name: "Primitives", modes: [L.name], variables: prim },
      { name: "Semantic", modes: ["Light", "Dark"], variables: [...semVars.values()] },
    ],
    textStyles,
    effectStyles,
  };
}

/**
 * Every brand in ONE Figma payload: brands are modes of the Primitives
 * collection (Clarion · Vantage · …), Light/Dark stay modes of Semantic, so a
 * frame can be any brand × any mode.
 *
 * Semantic modes cannot vary by brand, so the one per-brand semantic —
 * fg/on/*-emphasis, chosen by contrast measurement — goes through an
 * internal primitive: fg/on/primary-emphasis (Light) → _on/primary-emphasis/light,
 * which each brand mode points at white or the darkest neutral.
 */
export function figmaExportAll() {
  const all = BRANDS.map(figmaExport);
  const [base] = all;
  const prim = base.collections[0].variables.map((v) => ({ ...v, values: {} }));
  const byName = new Map(prim.map((v) => [v.name, v]));
  for (const e of all)
    for (const v of e.collections[0].variables) {
      const t = byName.get(v.name);
      if (!t) throw new Error(`${e.brand}: primitive ${v.name} is not in ${base.brand}`);
      t.values[e.name] = v.values[e.name];
    }
  const sem = base.collections[1].variables.map((v) => ({ ...v, values: { ...v.values } }));
  for (const v of sem) {
    const perBrand = /^fg\/on\/.+-emphasis$/.test(v.name);
    for (const mode of ["Light", "Dark"]) {
      const vals = all.map((e) => JSON.stringify(e.collections[1].variables.find((x) => x.name === v.name).values[mode]));
      if (!perBrand) {
        if (new Set(vals).size > 1) throw new Error(`semantic ${v.name} (${mode}) differs between brands — only fg/on/*-emphasis may`);
        continue;
      }
      const helper = `_on/${v.name.slice("fg/on/".length)}/${mode.toLowerCase()}`;
      const h = { name: helper, type: "COLOR", scopes: [], description: `Internal: ink for ${v.name} in ${mode}, measured per brand.`, values: {} };
      all.forEach((e, i) => (h.values[e.name] = JSON.parse(vals[i])));
      prim.push(h);
      v.values[mode] = { alias: helper };
    }
  }
  return {
    $schema: "picasso-figma-sync/1",
    brand: "all",
    name: all.map((e) => e.name).join(" · "),
    brands: all.map((e) => ({ id: e.brand, name: e.name, choices: e.choices })),
    collections: [
      { name: "Primitives", modes: all.map((e) => e.name), variables: prim },
      { name: "Semantic", modes: ["Light", "Dark"], variables: sem },
    ],
    textStyles: base.textStyles,
    effectStyles: base.effectStyles,
  };
}

/** Write dist/brands/<id>/{layer,figma}.json for every brand, plus dist/figma.json (all brands as modes). */
export function writeBrandArtifacts(distDir) {
  const out = {};
  for (const id of BRANDS) {
    const dir = resolve(distDir, "brands", id);
    mkdirSync(dir, { recursive: true });
    const layerPath = resolve(dir, "layer.json");
    writeFileSync(layerPath, JSON.stringify(brandLayer(id).tokens, null, 2) + "\n");
    writeFileSync(resolve(dir, "figma.json"), JSON.stringify(figmaExport(id), null, 2) + "\n");
    out[id] = { layerPath, overrides: onColourOverrides(id), layer: brandLayer(id) };
  }
  writeFileSync(resolve(distDir, "figma.json"), JSON.stringify(figmaExportAll(), null, 2) + "\n");
  return out;
}
