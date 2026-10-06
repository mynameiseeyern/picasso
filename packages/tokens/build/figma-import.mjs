#!/usr/bin/env node
/**
 * Bring one brand exported from Figma (Picasso Sync → Export) back into the repo.
 *
 *   npm run figma:import -- ~/Downloads/vantage.figma-export.json [--dry-run]
 *
 * It diffs the export against what the repo would generate for that brand,
 * then turns each difference into a repo edit:
 *
 *   palette/brand/*           → brand.json colour.ramp (dropped again if it equals the generated ramp)
 *   palette/neutral/*         → brand.json neutral   — must match a preset
 *   radius/base               → brand.json radius    — must match a preset
 *   radius/<step>             → refused: steps are base × multiplier; change radius/base
 *   space/*                   → brand.json spacing   — the whole ladder must match a preset
 *   type/family/*             → brand.json type
 *   _type/style/*             → presets.json fonts (Figma's style name per weight)
 *   other primitives          → core.json            — shared by every brand, so it says so
 *   semantic (Light/Dark)     → light.json / dark.json
 *   fg/on/*-emphasis          → refused: measured by contrast; change the ramp
 *   text styles               → core.json shared.text (leading/tracking must be existing tokens)
 *   effect styles             → shadow/ring geometry in light.json and dark.json
 *
 * Nothing new is invented: a value that matches no preset or token is
 * reported, and the files are left alone. Review with `git diff`, then run
 * `npm run check`.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { TOKENS_DIR, DEFAULT_BRAND, presets, flatten, figmaExport, toPx, scaleSpace } from "./brands.mjs";
import { buildRamp, STEPS } from "./ramp.mjs";

const argv = process.argv.slice(2);
const file = argv.find((a) => !a.startsWith("--"));
const dry = argv.includes("--dry-run");
if (!file) { console.error("usage: npm run figma:import -- <brand>.figma-export.json [--dry-run]"); process.exit(1); }

const read = (f) => JSON.parse(readFileSync(resolve(TOKENS_DIR, f), "utf8"));
const write = (f, o) => { if (!dry) writeFileSync(resolve(TOKENS_DIR, f), JSON.stringify(o, null, 2) + "\n"); };
const own = (o) => Object.entries(o).filter(([k]) => !k.startsWith("$"));
const near = (a, b) => Math.abs(a - b) < 0.01;
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

const incoming = JSON.parse(readFileSync(file, "utf8"));
if (incoming.$schema !== "picasso-figma-sync/1") throw new Error("Not a Picasso Sync export");
const [primC, semC] = incoming.collections;
if (primC.modes.length !== 1) throw new Error("Export one brand at a time");
const brandName = primC.modes[0];
const id = brandName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
const brandPath = `brands/${id}/brand.json`;
const isNew = !existsSync(resolve(TOKENS_DIR, brandPath));

const files = { core: read("core.json"), light: read("light.json"), dark: read("dark.json"), presets: read("presets.json") };
const brand = isNew
  ? { $description: `${brandName} — imported from Figma. Each field picks from presets.json.`, name: brandName, colour: {}, neutral: "cool", radius: "default", spacing: "default", type: {} }
  : read(brandPath);
const touched = new Set();
const changes = [], refused = [], notes = [];

// A new brand has no repo export of its own: its primitives are all "new",
// and its shared layers (semantics, styles) are compared with the default brand.
const repo = isNew ? null : figmaExport(id);
const shared = repo ?? figmaExport(DEFAULT_BRAND);
const index = (c) => new Map((c ? c.variables : []).map((v) => [v.name, v]));
const repoPrim = index(repo && repo.collections[0]);
const repoSem = index(shared.collections[1]);
const inPrim = new Map(primC.variables.map((v) => [v.name, v.values[brandName]]));
const changed = (name) => !repoPrim.has(name) || !same(Object.values(repoPrim.get(name).values)[0], inPrim.get(name));
const group = (prefix) => [...inPrim.keys()].filter((n) => n.startsWith(prefix));
const ladder = (prefix) => Object.fromEntries(group(prefix).map((n) => [n.slice(prefix.length), inPrim.get(n)]));

// ── brand choices ───────────────────────────────────────────────────────
const ramp = ladder("palette/brand/");
if (isNew || group("palette/brand/").some(changed)) {
  const upper = Object.fromEntries(STEPS.map((s) => [String(s), String(ramp[s]).toUpperCase()]));
  const base = brand.colour.base ?? upper["600"];
  const generated = buildRamp(base);
  brand.colour = same(Object.fromEntries(STEPS.map((s) => [String(s), generated[s].toUpperCase()])), upper)
    ? { base } : { base, ramp: upper };
  changes.push(`${brandPath}: brand ramp ${brand.colour.ramp ? "pinned to Figma's 11 stops" : "matches the ramp generated from " + base}`);
  touched.add("brand");
}
const neutral = ladder("palette/neutral/");
if (isNew || group("palette/neutral/").some(changed)) {
  const hit = own(presets.neutral).find(([, r]) => own(r).every(([s, c]) => String(neutral[s]).toUpperCase() === c.toUpperCase()));
  if (hit) { brand.neutral = hit[0]; changes.push(`${brandPath}: neutral → ${hit[0]}`); touched.add("brand"); }
  else refused.push("palette/neutral/* matches no neutral preset — add the ramp to presets.json neutral, or revert it in Figma");
}
if (isNew || changed("radius/base")) {
  const hit = own(presets.radius).find(([, v]) => near(toPx(v), inPrim.get("radius/base")));
  if (hit) { brand.radius = hit[0]; changes.push(`${brandPath}: radius → ${hit[0]} (${inPrim.get("radius/base")}px)`); touched.add("brand"); }
  else refused.push(`radius/base ${inPrim.get("radius/base")}px matches no radius preset (${own(presets.radius).map(([k, v]) => `${k} ${toPx(v)}`).join(", ")})`);
}
for (const [step, tok] of own(files.core.radius)) {
  const m = String(tok.$value).match(/^\{radius\.base\}(?:\s*\*\s*([\d.]+))?$/);
  if (!m) continue;
  const want = inPrim.get("radius/base") * (m[1] ? Number(m[1]) : 1);
  if (!near(inPrim.get(`radius/${step}`), want))
    refused.push(`radius/${step} is ${inPrim.get(`radius/${step}`)}, but radius steps are radius/base × ${m[1] ?? 1} (= ${+want.toFixed(2)}). Change radius/base in Figma instead`);
}
const space = ladder("space/");
if (isNew || group("space/").some(changed)) {
  const hit = own(presets.spacing).find(([, mult]) => own(presets.space).every(([k, v]) => near(space[k], scaleSpace(toPx(v), mult, k))));
  if (hit) { brand.spacing = hit[0]; changes.push(`${brandPath}: spacing → ${hit[0]}`); touched.add("brand"); }
  else refused.push("space/* matches no spacing preset — spacing is a preset × the default ladder; edit presets.json, not individual steps");
}
for (const role of ["sans", "mono", "display"]) {
  // A brand with no display of its own shows its sans in type/family/display.
  // Writing that back would turn an inherited family into a declared one.
  if (role === "display" && !brand.type.display) continue;
  const fam = inPrim.get(`type/family/${role}`);
  if (fam && brand.type[role] !== fam) { brand.type[role] = fam; changes.push(`${brandPath}: type.${role} → ${fam}`); touched.add("brand"); }
}
for (const name of group("_type/style/")) {
  const [role, wkey] = name.slice("_type/style/".length).split("-");
  const weight = Number(files.core.type.weight[wkey]?.$value);
  const fam = brand.type[role];
  if (!fam || !weight) continue;
  files.presets.fonts[fam] ??= { stack: `'${fam}', ${role === "mono" ? "'Noto Sans Arabic', 'Noto Sans Hebrew', ui-monospace, monospace" : "'Noto Sans Arabic', 'Noto Sans Hebrew', ui-sans-serif, system-ui, sans-serif"}`, styles: {} };
  if (files.presets.fonts[fam].styles[weight] !== inPrim.get(name)) {
    files.presets.fonts[fam].styles[weight] = inPrim.get(name);
    changes.push(`presets.json: ${fam} ${weight} is "${inPrim.get(name)}" in Figma`);
    touched.add("presets");
  }
}

// ── shared primitives → core.json ───────────────────────────────────────
const PER_BRAND = /^(palette\/(brand|neutral)\/|radius\/|space\/|type\/family\/|_type\/style\/|paragraph(Spacing|Indent)\/)/;
const coreFlat = flatten(files.core);
for (const [name, v] of inPrim) {
  if (PER_BRAND.test(name)) continue;
  const path = name.replaceAll("/", ".");
  const tok = coreFlat[path];
  if (!tok) { refused.push(`${name} is new in Figma — add it to core.json (shared) or presets (per brand) by hand, then sync`); continue; }
  if (!changed(name)) continue;
  const cur = String(tok.$value);
  const next = typeof v === "string" ? v.toUpperCase()
    : cur.endsWith("rem") ? `${+(v / 16).toFixed(4)}rem` : cur.endsWith("px") ? `${v}px` : String(v);
  if (next !== cur) { tok.$value = next; changes.push(`core.json: ${path} ${cur} → ${next}  (shared — every brand changes)`); touched.add("core"); }
}
if (repo) for (const name of repoPrim.keys()) if (!inPrim.has(name)) notes.push(`${name} is in the repo but not in Figma — left in place`);

// ── semantics → light.json / dark.json ──────────────────────────────────
for (const v of semC.variables) {
  for (const [mode, file] of [["Light", "light"], ["Dark", "dark"]]) {
    const x = v.values[mode];
    const repoV = repoSem.get(v.name)?.values[mode];
    if (same(x, repoV)) continue;
    const path = v.name.split("/");
    if (/^fg\/on\/.+-emphasis$/.test(v.name)) {
      if (isNew) continue; // measured for the new brand at build time
      refused.push(`${v.name} (${mode}) is measured by contrast, not set — change the brand ramp instead`);
      continue;
    }
    const value = x && x.alias ? `{${x.alias.replaceAll("/", ".")}}` : String(x).toUpperCase();
    let node = files[file];
    for (const p of path.slice(0, -1)) node = node[p] ??= {};
    const leaf = path.at(-1);
    const before = node[leaf]?.$value;
    if (before === value) continue;
    node[leaf] = { ...(node[leaf] ?? { $type: "color" }), $value: value };
    changes.push(`${file}.json: ${v.name} ${before ?? "(new)"} → ${value}`);
    touched.add(file);
  }
}

// ── text styles → core.json shared.text ─────────────────────────────────
const leading = own(files.core.type.leading).map(([k, t]) => [k, parseFloat(t.$value)]);
const tracking = own(files.core.type.tracking).map(([k, t]) => [k, t.$value === "0" ? 0 : parseFloat(t.$value) * 100]);
const repoText = new Map(shared.textStyles.map((t) => [t.name, t]));
for (const t of incoming.textStyles) {
  const r = repoText.get(t.name);
  if (r && near(r.fontSize, t.fontSize) && near(r.lineHeightPercent, t.lineHeightPercent ?? -1) && near(r.letterSpacingPercent, t.letterSpacingPercent ?? -1) && r.textCase === t.textCase && same(r.bind, t.bind)) continue;
  const path = t.name.split("/");
  let node = files.core;
  for (const p of path) node = node?.[p];
  if (!node) { refused.push(`text style ${t.name} is new in Figma — add it to core.json shared.text by hand`); continue; }
  const lh = leading.find(([, v]) => near(v, t.lineHeightPercent ?? -1));
  const ls = tracking.find(([, v]) => near(v, t.letterSpacingPercent ?? -1));
  const size = t.bind.fontSize?.startsWith("type/size/") ? `{${t.bind.fontSize.replaceAll("/", ".")}}` : null;
  const style = t.bind.fontStyle?.match(/^_type\/style\/(sans|mono)-(\w+)$/);
  if (!lh || !ls || !size || !style) {
    refused.push(`text style ${t.name}: ${[!lh && `line height ${t.lineHeightPercent}% is not a leading token`, !ls && `tracking ${t.letterSpacingPercent}% is not a tracking token`, !size && "size is not bound to type/size/*", !style && "style is not bound to _type/style/*"].filter(Boolean).join("; ")}`);
    continue;
  }
  const next = { ...node.$value, fontFamily: `{type.family.${style[1]}}`, fontSize: size, fontWeight: `{type.weight.${style[2]}}`, lineHeight: `{type.leading.${lh[0]}}`, letterSpacing: `{type.tracking.${ls[0]}}` };
  if (t.textCase === "UPPER") next.textCase = "uppercase"; else delete next.textCase;
  if (!same(next, node.$value)) { node.$value = next; changes.push(`core.json: shared.text ${t.name.replace("shared/text/", "")} updated from Figma`); touched.add("core"); }
}

// ── effect styles → shadow/ring geometry ────────────────────────────────
const repoFx = new Map(shared.effectStyles.map((e) => [e.name, e]));
const sig = (fx) => fx.map((f) => [f.type, +f.x.toFixed(2), +f.y.toFixed(2), +f.blur.toFixed(2), +f.spread.toFixed(2), f.colorVar].join(" ")).join("|");
const px = (n) => (n === 0 ? "0" : `${+n.toFixed(4)}px`);
for (const e of incoming.effectStyles) {
  const r = repoFx.get(e.name);
  if (r && sig(r.effects) === sig(e.effects)) continue;
  const path = e.name.split("/");
  let ok = true;
  for (const file of ["light", "dark"]) {
    let node = files[file];
    for (const p of path) node = node?.[p];
    if (!node) { ok = false; break; }
    node.$value = [...e.effects].reverse().map((f) => ({
      color: `{${f.colorVar.replaceAll("/", ".")}}`, x: px(f.x), y: px(f.y), blur: px(f.blur), spread: px(f.spread),
      type: f.type === "INNER_SHADOW" ? "innerShadow" : "dropShadow",
    }));
    touched.add(file);
  }
  if (ok) changes.push(`light.json + dark.json: ${e.name} geometry updated from Figma`);
  else refused.push(`effect style ${e.name} is new in Figma — add the composite to light.json/dark.json by hand`);
}

// ── write ───────────────────────────────────────────────────────────────
if (refused.length) {
  console.error(`✗ ${refused.length} change(s) cannot be imported as they are:\n  ` + refused.join("\n  "));
  console.error("\nNothing was written. Fix these in Figma (or the presets), export again.");
  process.exit(1);
}
if (!changes.length) { console.log(`✓ ${brandName}: Figma matches the repo — nothing to import.`); process.exit(0); }
if (touched.has("brand")) { if (!dry) mkdirSync(resolve(TOKENS_DIR, "brands", id), { recursive: true }); write(brandPath, brand); }
if (touched.has("core")) write("core.json", files.core);
if (touched.has("light")) write("light.json", files.light);
if (touched.has("dark")) write("dark.json", files.dark);
if (touched.has("presets")) write("presets.json", files.presets);
console.log(`${dry ? "Would import" : "Imported"} ${changes.length} change(s) for ${brandName}${isNew ? " (new brand)" : ""}:\n  ` + changes.join("\n  "));
for (const n of notes) console.log(`note: ${n}`);
console.log(dry ? "\n(dry run — nothing written)" : "\nNext: review `git diff`, then `npm run check`.");
