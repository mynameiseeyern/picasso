#!/usr/bin/env node
/**
 * Parity checks — run after the build (`npm run check`). Fails on:
 *   1. Light and dark semantics that do not define the same token names.
 *   2. A brand whose Figma export differs in structure from the default
 *      brand's (variable names, types, text/effect styles). Values may differ;
 *      shape may not, or a library swap in Figma would drop bindings.
 *   3. A shared primitive (anything a brand does not choose) that differs
 *      between brands.
 *   4. Hand-authored fg/on/* on the default brand that contrast measurement
 *      disagrees with.
 * The radius-multiplier check runs inside the build itself.
 */
import { BRANDS, DEFAULT_BRAND, semantic, flatten, figmaExport, onColourOverrides } from "./brands.mjs";

const problems = [];
const names = (t) => new Set(Object.keys(flatten(t)));
const [L, D] = [names(semantic.light), names(semantic.dark)];
for (const n of L) if (!D.has(n)) problems.push(`semantic: ${n} is in light.json but not dark.json`);
for (const n of D) if (!L.has(n)) problems.push(`semantic: ${n} is in dark.json but not light.json`);

const PER_BRAND = /^(palette\/(brand|neutral)\/|type\/family\/|radius\/|space\/|_type\/style\/)/;
const shape = (e) => ({
  vars: new Map(e.collections.flatMap((c) => c.variables.map((v) => [`${c.name}:${v.name}`, v]))),
  text: e.textStyles.map((s) => s.name).join("|"),
  fx: e.effectStyles.map((s) => `${s.name}:${s.effects.length}`).join("|"),
});
const ref = shape(figmaExport(DEFAULT_BRAND));
for (const id of BRANDS.filter((b) => b !== DEFAULT_BRAND)) {
  const s = shape(figmaExport(id));
  for (const [k, v] of ref.vars) {
    const o = s.vars.get(k);
    if (!o) { problems.push(`${id}: missing variable ${k}`); continue; }
    if (o.type !== v.type) problems.push(`${id}: ${k} is ${o.type}, ${DEFAULT_BRAND} has ${v.type}`);
    const name = k.split(":")[1];
    if (k.startsWith("Primitives:") && !PER_BRAND.test(name) &&
        JSON.stringify(Object.values(o.values)) !== JSON.stringify(Object.values(v.values)))
      problems.push(`${id}: shared primitive ${name} differs from ${DEFAULT_BRAND}`);
  }
  for (const k of s.vars.keys()) if (!ref.vars.has(k)) problems.push(`${id}: extra variable ${k}`);
  if (s.text !== ref.text) problems.push(`${id}: text styles differ from ${DEFAULT_BRAND}`);
  if (s.fx !== ref.fx) problems.push(`${id}: effect styles differ from ${DEFAULT_BRAND}`);
}

const own = onColourOverrides(DEFAULT_BRAND);
for (const m of ["light", "dark"])
  for (const [k, v] of Object.entries(own[m]))
    problems.push(`${DEFAULT_BRAND}: ${m} fg/on/${k} is authored differently from what contrast measurement picks (${v})`);

if (problems.length) {
  console.error(`✗ parity: ${problems.length} problem(s)\n  ` + problems.join("\n  "));
  process.exit(1);
}
console.log(`✓ parity: ${BRANDS.length} brand(s) — ${BRANDS.join(", ")}`);
