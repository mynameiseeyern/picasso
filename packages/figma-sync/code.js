/**
 * Picasso Sync — applies a brand's tokens (packages/tokens/dist/brands/<id>/figma.json)
 * to the open Figma file: Primitives + Semantic variables, text styles and
 * effect styles. The repo is the source of truth; this plugin only follows it.
 *
 *   Check  — report every difference, change nothing.
 *   Sync   — make the file match. Never deletes.
 *   Sync + prune — also delete variables/styles the repo no longer has.
 *
 * Everything between the CORE markers is also run headlessly (via the Figma
 * MCP use_figma tool), so keep it free of UI code.
 */

// ── CORE:start ─────────────────────────────────────────────────────────
// One-off renames, applied before matching so existing bindings survive.
const PICASSO_RENAMES = {
  "_type/style/inter-regular": "_type/style/sans-regular",
  "_type/style/inter-medium": "_type/style/sans-medium",
  "_type/style/inter-semibold": "_type/style/sans-semibold",
  "_type/style/inter-bold": "_type/style/sans-bold",
  // The phone canvases came off Tailwind's t-shirt ladder: lg has to mean 1024
  // wherever it appears, and screen/mobile/lg was 390. Renamed here rather
  // than left to matching, so the frames bound to them keep their binding
  // instead of the sync creating four new variables and orphaning four.
  "screen/mobile/sm": "screen/mobile/min",
  "screen/mobile/md": "screen/mobile/small",
  "screen/mobile/lg": "screen/mobile/base",
  "screen/mobile/xl": "screen/mobile/max",
};

/**
 * Which variables are actually bound to nodes, and where.
 *
 * A definition-level diff cannot see this. Figma keeps a deleted variable
 * RESOLVABLE BY ID after dropping it from the local set, so a node bound to
 * one still answers with its old name while `getLocalVariablesAsync` has
 * forgotten it. That is how a file full of orphaned bindings reports "no
 * changes": the two sides of the diff agree, and nobody asked the nodes.
 */
async function picassoBindings() {
  const usage = new Map();
  const scanned = [];
  const unscanned = [];
  for (const page of figma.root.children) {
    // MUST load before reading. In a dynamic-page document `findAll` on a
    // partially-loaded page returns a PARTIAL list and does NOT throw — measured
    // on this file, Colours gave 2492 nodes unloaded and 3598 loaded. An earlier
    // version of this function guarded with try/catch and treated "no throw" as
    // "fully read", which made three consecutive runs report 8, 73 and 0
    // dangling bindings on an unchanged file. A partial read that calls itself
    // clean is the precise failure this whole function exists to catch, so the
    // load is not optional and there is no catch to swallow it.
    await page.loadAsync();
    const nodes = page.findAll(() => true);
    scanned.push(page.name);
    for (const n of nodes) {
      const bv = n.boundVariables;
      if (!bv) continue;
      for (const prop of Object.keys(bv)) {
        const val = bv[prop];
        for (const a of (Array.isArray(val) ? val : [val])) {
          if (!a || !a.id) continue;
          let rec = usage.get(a.id);
          if (!rec) { rec = { count: 0, sample: null }; usage.set(a.id, rec); }
          rec.count++;
          if (!rec.sample) rec.sample = page.name + " \u203a " + n.name + " (" + prop + ")";
        }
      }
    }
  }
  return { usage, scanned, unscanned };
}

async function picassoSync(payload, opts) {
  const apply = !!(opts && opts.apply);
  const prune = !!(opts && opts.prune);
  const r = { brand: payload.name, apply, prune, created: [], changed: [], renamed: [], extra: [], removed: [], problems: [], unchanged: 0 };

  const hex = (c) => {
    const h = (n) => Math.round(n * 255).toString(16).padStart(2, "0");
    const a = c.a === undefined ? 1 : c.a;
    return ("#" + h(c.r) + h(c.g) + h(c.b) + (a < 0.999 ? h(a) : "")).toUpperCase();
  };
  const rgba = (s) => {
    const m = s.replace("#", "");
    const n = (i) => parseInt(m.slice(i, i + 2), 16) / 255;
    return { r: n(0), g: n(2), b: n(4), a: m.length === 8 ? n(6) : 1 };
  };
  const near = (a, b) => Math.abs(a - b) < 0.001;

  // Taken BEFORE any mutation, so prune can ask what a variable is holding up.
  const bindings = await picassoBindings();
  r.pagesScanned = bindings.scanned.length;
  r.pagesUnscanned = bindings.unscanned;

  let collections = await figma.variables.getLocalVariableCollectionsAsync();
  let vars = await figma.variables.getLocalVariablesAsync();
  const colName = (v) => (collections.find((c) => c.id === v.variableCollectionId) || {}).name;
  const findVar = (name, col) => vars.find((v) => v.name === name && (!col || colName(v) === col));

  // 0. Renames
  for (const [from, to] of Object.entries(PICASSO_RENAMES)) {
    const v = findVar(from);
    if (v && !findVar(to)) {
      r.renamed.push(`${from} → ${to}`);
      if (apply) v.name = to;
    }
  }

  // 1. Collections, modes, variables (created first so aliases can resolve)
  const plan = [];
  for (const spec of payload.collections || []) {
    let col = collections.find((c) => c.name === spec.name);
    if (!col) {
      r.created.push(`collection ${spec.name}`);
      if (!apply) { for (const v of spec.variables) r.created.push(`${spec.name}: ${v.name}`); continue; }
      col = figma.variables.createVariableCollection(spec.name);
      collections = await figma.variables.getLocalVariableCollectionsAsync();
    }
    // Modes: a single-mode collection is renamed to the brand's mode name.
    if (col.modes.length === 1 && spec.modes.length === 1 && col.modes[0].name !== spec.modes[0]) {
      r.changed.push(`${spec.name}: mode "${col.modes[0].name}" → "${spec.modes[0]}"`);
      if (apply) col.renameMode(col.modes[0].modeId, spec.modes[0]);
    }
    const modeId = {};
    spec.modes.forEach((m, i) => {
      let mode = col.modes.find((x) => x.name === m);
      if (!mode && col.modes.length === 1 && spec.modes.length === 1) mode = col.modes[0];
      if (!mode && i === 0 && col.modes.length && !col.modes.some((x) => spec.modes.includes(x.name))) {
        // A fresh collection starts with "Mode 1": adopt it as the first mode.
        mode = col.modes[0];
        r.changed.push(`${spec.name}: mode "${mode.name}" → "${m}"`);
        if (apply) col.renameMode(mode.modeId, m);
      }
      if (!mode) {
        r.created.push(`${spec.name}: mode ${m}`);
        if (apply) modeId[m] = col.addMode(m);
      } else modeId[m] = mode.modeId;
    });
    for (const v of spec.variables) {
      let fv = vars.find((x) => x.variableCollectionId === col.id && x.name === v.name);
      if (fv && fv.resolvedType !== v.type) {
        r.problems.push(`${spec.name}: ${v.name} is ${fv.resolvedType} in Figma, ${v.type} in the repo — left alone`);
        continue;
      }
      if (!fv) {
        r.created.push(`${spec.name}: ${v.name}`);
        if (apply) { fv = figma.variables.createVariable(v.name, col, v.type); vars.push(fv); }
      }
      plan.push({ spec, col, v, fv, modeId });
    }
    // Extras: in a managed collection, absent from the repo
    const want = new Set(spec.variables.map((v) => v.name));
    const renamedFrom = new Set(Object.keys(PICASSO_RENAMES));
    for (const fv of vars.filter((x) => x.variableCollectionId === col.id)) {
      if (want.has(fv.name) || renamedFrom.has(fv.name)) continue;
      r.extra.push(`${spec.name}: ${fv.name}`);
      if (apply && prune) {
        // Removing a variable that nodes still bind to leaves them pointing at
        // a ghost: the swatch keeps rendering its last colour and nothing says
        // otherwise. Refuse, and name a place it is used so it can be rebound.
        const use = bindings.usage.get(fv.id);
        if (use) {
          r.problems.push(`${spec.name}: ${fv.name} is still bound in ${use.count} place(s), e.g. ${use.sample} — not removed. Rebind those first.`);
        } else {
          fv.remove();
          r.removed.push(`${spec.name}: ${fv.name}`);
        }
      }
    }
  }
  if (apply && prune) vars = await figma.variables.getLocalVariablesAsync();

  // 2. Values, scopes, descriptions
  for (const { spec, v, fv, modeId } of plan) {
    const diffs = [];
    if (fv) {
      const scopes = [...fv.scopes].sort().join(",");
      if (scopes !== [...v.scopes].sort().join(",")) { diffs.push(`scopes ${scopes || "none"} → ${v.scopes.join(",") || "none"}`); if (apply) fv.scopes = v.scopes; }
      if (v.description !== undefined && fv.description !== v.description) { diffs.push("description"); if (apply) fv.description = v.description; }
    }
    for (const [mode, want] of Object.entries(v.values)) {
      const id = modeId[mode];
      const cur = fv && id ? fv.valuesByMode[id] : undefined;
      let curS = "∅", wantS, next;
      if (cur && cur.type === "VARIABLE_ALIAS") { const t = vars.find((x) => x.id === cur.id); curS = "→" + (t ? t.name : "?"); }
      else if (cur !== undefined) curS = v.type === "COLOR" ? hex(cur) : String(cur);
      if (want && typeof want === "object" && want.alias) {
        wantS = "→" + want.alias;
        const target = findVar(want.alias, "Primitives") || findVar(want.alias);
        if (!target) { if (apply) r.problems.push(`${spec.name}: ${v.name} aliases ${want.alias}, which does not exist`); continue; }
        next = figma.variables.createVariableAlias(target);
      } else if (v.type === "COLOR") { wantS = want; next = rgba(want); }
      else { wantS = String(want); next = want; }
      const same = curS === wantS || (v.type === "FLOAT" && cur !== undefined && typeof cur === "number" && near(cur, want));
      if (!same) { diffs.push(`${mode} ${curS} → ${wantS}`); if (apply && fv && id) fv.setValueForMode(id, next); }
    }
    if (!fv) continue;
    if (diffs.length) r.changed.push(`${spec.name}: ${v.name} — ${diffs.join("; ")}`);
    else r.unchanged++;
  }
  vars = await figma.variables.getLocalVariablesAsync();
  const byName = (n) => findVar(n, "Semantic") || findVar(n, "Primitives") || findVar(n);

  // 3. Text styles
  if (payload.textStyles) {
    const styles = await figma.getLocalTextStylesAsync();
    for (const t of payload.textStyles) {
      let s = styles.find((x) => x.name === t.name);
      const diffs = [];
      if (!s) { r.created.push(`text style ${t.name}`); if (!apply) continue; s = figma.createTextStyle(); s.name = t.name; }
      const font = { family: t.fontFamily, style: t.fontStyle };
      if (s.fontName.family !== font.family || s.fontName.style !== font.style) diffs.push(`font ${s.fontName.family} ${s.fontName.style} → ${font.family} ${font.style}`);
      if (!near(s.fontSize, t.fontSize)) diffs.push(`size ${s.fontSize} → ${t.fontSize}`);
      if (s.lineHeight.unit !== "PERCENT" || !near(s.lineHeight.value, t.lineHeightPercent)) diffs.push(`line height → ${t.lineHeightPercent}%`);
      if (s.letterSpacing.unit !== "PERCENT" || !near(s.letterSpacing.value, t.letterSpacingPercent)) diffs.push(`tracking → ${t.letterSpacingPercent}%`);
      if (s.textCase !== t.textCase) diffs.push(`case ${s.textCase} → ${t.textCase}`);
      const bound = s.boundVariables || {};
      for (const [field, name] of Object.entries(t.bind)) {
        const cur = bound[field] ? (vars.find((x) => x.id === bound[field].id) || {}).name : undefined;
        if (cur !== name) diffs.push(`${field} bound ${cur || "—"} → ${name}`);
      }
      if (diffs.length) r.changed.push(`text style ${t.name} — ${diffs.join("; ")}`); else r.unchanged++;
      if (!apply || !diffs.length) continue;
      try { await figma.loadFontAsync(font); }
      catch (e) { r.problems.push(`text style ${t.name}: font "${font.family} ${font.style}" is not available in Figma — install it, then sync again`); continue; }
      await figma.loadFontAsync(s.fontName);
      s.fontName = font;
      s.fontSize = t.fontSize;
      s.lineHeight = { unit: "PERCENT", value: t.lineHeightPercent };
      s.letterSpacing = { unit: "PERCENT", value: t.letterSpacingPercent };
      s.textCase = t.textCase;
      for (const [field, name] of Object.entries(t.bind)) {
        const v = byName(name);
        if (v) s.setBoundVariable(field, v); else r.problems.push(`text style ${t.name}: ${name} not found`);
      }
    }
    for (const s of styles) {
      if (payload.textStyles.some((t) => t.name === s.name)) continue;
      if (prune && apply) { r.removed.push(`text style ${s.name}`); s.remove(); }
      else r.extra.push(`text style ${s.name}`);
    }
  }

  // 4. Effect styles — geometry from the repo, colour bound per layer
  if (payload.effectStyles) {
    const styles = await figma.getLocalEffectStylesAsync();
    for (const e of payload.effectStyles) {
      let s = styles.find((x) => x.name === e.name);
      if (!s) { r.created.push(`effect style ${e.name}`); if (!apply) continue; s = figma.createEffectStyle(); s.name = e.name; }
      const sig = (fx) => fx.map((f) => [f.type, +f.x.toFixed(2), +f.y.toFixed(2), +f.blur.toFixed(2), +f.spread.toFixed(2), f.colorVar].join(" ")).join(" | ");
      const cur = s.effects.map((f) => ({
        type: f.type, x: (f.offset && f.offset.x) || 0, y: (f.offset && f.offset.y) || 0, blur: f.radius || 0, spread: f.spread || 0,
        colorVar: f.boundVariables && f.boundVariables.color ? (vars.find((x) => x.id === f.boundVariables.color.id) || {}).name : "(unbound)",
      }));
      if (sig(cur) === sig(e.effects)) { r.unchanged++; continue; }
      r.changed.push(`effect style ${e.name} — ${sig(cur)}  ⇒  ${sig(e.effects)}`);
      if (!apply) continue;
      const fx = [];
      for (const f of e.effects) {
        const v = byName(f.colorVar);
        const base = { type: f.type, color: { r: 0, g: 0, b: 0, a: 0.1 }, offset: { x: f.x, y: f.y }, radius: f.blur, spread: f.spread, visible: true, blendMode: "NORMAL" };
        if (f.type === "DROP_SHADOW") base.showShadowBehindNode = false;
        fx.push(v ? figma.variables.setBoundVariableForEffect(base, "color", v) : base);
        if (!v) r.problems.push(`effect style ${e.name}: ${f.colorVar} not found`);
      }
      s.effects = fx;
    }
    for (const s of styles) {
      if (payload.effectStyles.some((t) => t.name === s.name)) continue;
      if (prune && apply) { r.removed.push(`effect style ${s.name}`); s.remove(); }
      else r.extra.push(`effect style ${s.name}`);
    }
  }

  // Bindings pointing at a variable that no longer exists — including any this
  // run just removed. Computed against the live set, not the pre-run snapshot.
  const liveIds = new Set((await figma.variables.getLocalVariablesAsync()).map((v) => v.id));
  r.dangling = [];
  r.remoteBindings = [];
  for (const [id, rec] of bindings.usage) {
    if (liveIds.has(id)) continue;
    const ghost = await figma.variables.getVariableByIdAsync(id);
    const where = `${ghost ? ghost.name : id} — ${rec.count} binding(s), e.g. ${rec.sample}`;
    // A library-key prefix ahead of the node id means the binding is SUBSCRIBED
    // to another file rather than pointing at something deleted. The symptom is
    // identical — absent from the local set — and the fix is not: one is rebind
    // to the replacement, the other is rebind to this file's own variable.
    if (id.includes("/")) r.remoteBindings.push(where);
    else r.dangling.push(where);
  }

  r.inSync =
    !r.created.length && !r.changed.length && !r.renamed.length &&
    !r.problems.length && !r.dangling.length && !r.remoteBindings.length &&
    !(prune && r.extra.length);
  // A clean verdict is only as wide as the scan behind it.
  if (r.inSync && r.pagesUnscanned.length) r.inSync = "partial";
  // Every page is loaded before it is read, so a count below the file's page
  // count means the sweep stopped early and the verdict is not trustworthy.
  if (r.pagesScanned !== figma.root.children.length) {
    r.problems.push(
      `Binding sweep read ${r.pagesScanned} of ${figma.root.children.length} pages — verdict is incomplete.`,
    );
    r.inSync = false;
  }
  return r;
}
/**
 * Export one brand from the open file, in the same shape the repo's build
 * writes to dist/brands/<brand>/figma.json. `npm run figma:import` turns it
 * back into repo files. Semantic fg/on/*-emphasis are resolved through the
 * brand's _on/* primitives, so the result is exactly one brand's view.
 */
async function picassoExport(brandName) {
  const hex = (c) => {
    const h = (n) => Math.round(n * 255).toString(16).padStart(2, "0");
    const a = c.a === undefined ? 1 : c.a;
    return ("#" + h(c.r) + h(c.g) + h(c.b) + (a < 0.999 ? h(a) : "")).toUpperCase();
  };
  const collections = await figma.variables.getLocalVariableCollectionsAsync();
  const vars = await figma.variables.getLocalVariablesAsync();
  const prim = collections.find((c) => c.name === "Primitives");
  const sem = collections.find((c) => c.name === "Semantic");
  if (!prim || !sem) throw new Error("This file has no Primitives/Semantic collections.");
  const bMode = prim.modes.find((m) => m.name === brandName);
  if (!bMode) throw new Error(`No brand "${brandName}" — Primitives modes are ${prim.modes.map((m) => m.name).join(", ")}`);
  const byId = new Map(vars.map((v) => [v.id, v]));
  const val = (v, modeId) => {
    const x = v.valuesByMode[modeId];
    if (x && x.type === "VARIABLE_ALIAS") return { alias: byId.get(x.id).name };
    return v.resolvedType === "COLOR" ? hex(x) : x;
  };
  const inPrim = vars.filter((v) => v.variableCollectionId === prim.id);
  const primOut = inPrim.filter((v) => !v.name.startsWith("_on/")).map((v) => ({
    name: v.name, type: v.resolvedType, scopes: [...v.scopes],
    ...(v.description ? { description: v.description } : {}),
    values: { [brandName]: val(v, bMode.modeId) },
  }));
  const pv = (name) => { const v = inPrim.find((x) => x.name === name); return v ? val(v, bMode.modeId) : undefined; };
  const semOut = vars.filter((v) => v.variableCollectionId === sem.id).map((v) => {
    const values = {};
    for (const m of sem.modes) {
      let x = val(v, m.modeId);
      // Follow the brand's _on/* indirection so the export reads like one brand.
      if (x && x.alias && x.alias.startsWith("_on/")) x = pv(x.alias);
      values[m.name] = x;
    }
    return { name: v.name, type: v.resolvedType, scopes: [...v.scopes], values };
  });
  const textStyles = [];
  for (const s of await figma.getLocalTextStylesAsync()) {
    const b = s.boundVariables || {};
    const bind = {};
    for (const k of Object.keys(b)) bind[k] = byId.get(b[k].id).name;
    const family = bind.fontFamily ? pv(bind.fontFamily) : s.fontName.family;
    const style = bind.fontStyle ? pv(bind.fontStyle) : s.fontName.style;
    textStyles.push({
      name: s.name, fontFamily: family, fontStyle: style, fontSize: s.fontSize,
      lineHeightPercent: s.lineHeight.unit === "PERCENT" ? +s.lineHeight.value.toFixed(3) : null,
      letterSpacingPercent: s.letterSpacing.unit === "PERCENT" ? +s.letterSpacing.value.toFixed(3) : null,
      textCase: s.textCase, bind,
    });
  }
  const effectStyles = [];
  for (const s of await figma.getLocalEffectStylesAsync())
    effectStyles.push({
      name: s.name,
      effects: s.effects.map((f) => ({
        type: f.type, x: (f.offset && f.offset.x) || 0, y: (f.offset && f.offset.y) || 0,
        blur: f.radius || 0, spread: f.spread || 0,
        colorVar: f.boundVariables && f.boundVariables.color ? byId.get(f.boundVariables.color.id).name : null,
      })),
    });
  return {
    $schema: "picasso-figma-sync/1", brand: brandName.toLowerCase().replace(/[^a-z0-9]+/g, "-"), name: brandName,
    exportedFrom: figma.root.name, exportedAt: new Date().toISOString(),
    collections: [
      { name: "Primitives", modes: [brandName], variables: primOut },
      { name: "Semantic", modes: sem.modes.map((m) => m.name), variables: semOut },
    ],
    textStyles, effectStyles,
  };
}

async function picassoBrands() {
  const prim = (await figma.variables.getLocalVariableCollectionsAsync()).find((c) => c.name === "Primitives");
  return prim ? prim.modes.map((m) => m.name) : [];
}
// ── CORE:end ───────────────────────────────────────────────────────────

if (typeof __html__ !== "undefined") {
  figma.showUI(__html__, { width: 520, height: 600, themeColors: true });
  picassoBrands().then((brands) => figma.ui.postMessage({ type: "brands", brands }));
  figma.ui.onmessage = async (msg) => {
    if (msg.type === "export") {
      try {
        const data = await picassoExport(msg.brand);
        figma.ui.postMessage({ type: "exported", brand: msg.brand, json: JSON.stringify(data, null, 2) });
      } catch (e) {
        figma.ui.postMessage({ type: "error", message: String(e && e.message ? e.message : e) });
      }
      return;
    }
    if (msg.type !== "run") return;
    try {
      const report = await picassoSync(msg.payload, { apply: msg.apply, prune: msg.prune });
      figma.ui.postMessage({ type: "report", report });
    } catch (e) {
      figma.ui.postMessage({ type: "error", message: String(e && e.message ? e.message : e) });
    }
  };
}
