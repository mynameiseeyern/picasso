/**
 * The spacing-preset rule, shared by the build (brands.mjs), the docs-site
 * theme builder and anything else that previews a brand. Pure — no Node APIs.
 *
 * A preset is a multiplier on the default ladder; each step is rounded to the
 * 2px grid so Picasso's 4pt-with-2pt-half-steps rule survives. ×1 returns the
 * ladder untouched; space.0 and space.px never scale.
 */
const REM = 16;
export const toPx = (v) => {
  const s = String(v).trim();
  if (s === "0") return 0;
  if (s.endsWith("rem")) return parseFloat(s) * REM;
  return parseFloat(s);
};
export const pxToRem = (px) => (px === 0 ? "0" : `${+(px / REM).toFixed(4)}rem`);
export function scaleSpace(px, mult, key) {
  if (key === "px" || key === "0" || mult === 1) return px;
  return Math.max(2, Math.round((px * mult) / 2) * 2);
}
/** { "1": "0.25rem", … } for a multiplier, from presets.space. */
export function spaceLadder(presetSpace, mult) {
  const out = {};
  for (const [k, v] of Object.entries(presetSpace)) {
    if (k.startsWith("$")) continue;
    out[k] = k === "px" ? "1px" : pxToRem(scaleSpace(toPx(v), mult, k));
  }
  return out;
}
