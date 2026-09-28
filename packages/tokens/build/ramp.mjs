#!/usr/bin/env node
/**
 * Brand ramp generation and contrast resolution — no dependencies.
 *
 * Two jobs, and they are the same job seen from both ends:
 *
 *  1. Build an 11-step ramp from one base colour, in OKLCH so the steps are
 *     perceptually even rather than evenly spaced in a space nobody sees in.
 *  2. Decide, for each step, whether white or dark ink sits on it — by
 *     measuring, not by eye.
 *
 * The flip point is relative luminance 0.179. White on a colour reaches 4.5:1
 * when Y ≤ 0.1833; black reaches it when Y ≥ 0.175. Between those two numbers
 * both pass, so the house rule breaks the tie: prefer white, per the brief.
 */

/* ---- sRGB ↔ OKLab (Björn Ottosson's matrices) ---------------------- */

const srgbToLinear = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const linearToSrgb = (c) => (c <= 0.0031308 ? c * 12.92 : 1.055 * c ** (1 / 2.4) - 0.055);

function hexToRgb(hex) {
  const h = hex.replace("#", "");
  const n = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  return [0, 2, 4].map((i) => parseInt(n.slice(i, i + 2), 16) / 255);
}
const rgbToHex = (rgb) =>
  "#" + rgb.map((c) => Math.round(Math.min(1, Math.max(0, c)) * 255).toString(16).padStart(2, "0")).join("").toUpperCase();

function rgbToOklab([r, g, b]) {
  const R = srgbToLinear(r), G = srgbToLinear(g), B = srgbToLinear(b);
  const l = Math.cbrt(0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B);
  const m = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B);
  const s = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

function oklabToRgb([L, a, b]) {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    linearToSrgb(+4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    linearToSrgb(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    linearToSrgb(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
  ];
}

const oklabToOklch = ([L, a, b]) => [L, Math.hypot(a, b), (Math.atan2(b, a) * 180) / Math.PI];
const oklchToOklab = ([L, C, h]) => [L, C * Math.cos((h * Math.PI) / 180), C * Math.sin((h * Math.PI) / 180)];

/* An OKLCH triple can name a colour sRGB cannot show. Reduce chroma until it
 * fits — lightness and hue are what carry the identity; chroma is what gives. */
function gamutMap([L, C, h]) {
  let lo = 0, hi = C;
  const inGamut = (c) => oklabToRgb(oklchToOklab([L, c, h])).every((v) => v >= -1e-4 && v <= 1 + 1e-4);
  if (inGamut(C)) return [L, C, h];
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    if (inGamut(mid)) lo = mid; else hi = mid;
  }
  return [L, lo, h];
}

/* ---- contrast ------------------------------------------------------ */

const luminance = ([r, g, b]) =>
  0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b);

const contrast = (a, b) => {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

/* ---- the ramp ------------------------------------------------------ */

const STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

/* Lightness targets, in OKLCH L. Chosen so that 600 — the emphasis step, the
 * one a primary button is painted with — lands below the white-text threshold,
 * and so the ends do not crush. */
const L_TARGETS = {
  50: 0.974, 100: 0.936, 200: 0.885, 300: 0.818, 400: 0.735,
  500: 0.645, 600: 0.556, 700: 0.468, 800: 0.395, 900: 0.330, 950: 0.258,
};

/* Chroma tapers towards both ends: a near-white or near-black step holding
 * full chroma reads as a tint, not as the same colour. */
const C_SCALE = {
  50: 0.10, 100: 0.24, 200: 0.46, 300: 0.70, 400: 0.90, 500: 1.00,
  600: 1.00, 700: 0.92, 800: 0.80, 900: 0.68, 950: 0.50,
};

/* White text reaches 4.5:1 when the surface's relative luminance is at or
 * below 0.1833; dark ink reaches it at or above 0.175. Between them both pass.
 *
 * OKLCH lightness is NOT this number. A green and a blue at the same L have
 * different luminance, because luminance weights green at 0.7152 and blue at
 * 0.0722. A fixed L table therefore lands one hue at 4.61 and another at 4.48,
 * and the second one fails. So the steps that carry text solve for luminance
 * instead: walk L down until Y clears the ceiling, keeping hue and chroma. */
const WHITE_TEXT_CEILING = 0.1833;

function solveLightnessForLuminance([L, C, h], ceiling, { margin = 0.008 } = {}) {
  const target = ceiling - margin;
  const yAt = (l) => luminance(oklabToRgb(oklchToOklab(gamutMap([l, C, h]))));
  if (yAt(L) <= target) return L;
  let lo = 0, hi = L;
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    if (yAt(mid) > target) hi = mid; else lo = mid;
  }
  return lo;
}

export function buildRamp(baseHex, { anchor = 600, hueDrift = 0, carriesText = [600, 700, 800, 900, 950] } = {}) {
  const [L0, C0, h0] = oklabToOklch(rgbToOklab(hexToRgb(baseHex)));
  // The base colour defines chroma and hue; the anchor step says where on the
  // ramp it sits, so a brand's own colour survives verbatim where it matters.
  const chromaAtAnchor = C0 / C_SCALE[anchor];
  const out = {};
  for (const step of STEPS) {
    let L = L_TARGETS[step];
    // A touch of hue drift keeps light steps from reading cold; 0 is fine too.
    const h = h0 + hueDrift * (L - L_TARGETS[anchor]);
    const C = chromaAtAnchor * C_SCALE[step];
    // The steps a button is painted with must hold white text, whatever the
    // hue. Darkening is the only lever that always works: chroma cannot save a
    // yellow, and hue is the brand's to keep.
    if (carriesText.includes(step)) L = solveLightnessForLuminance([L, C, h], WHITE_TEXT_CEILING);
    const [Lg, Cg, hg] = gamutMap([L, C, h]);
    out[step] = rgbToHex(oklabToRgb(oklchToOklab([Lg, Cg, hg])));
  }
  return out;
}

/* ---- which ink sits on it ------------------------------------------ */

const WHITE = [1, 1, 1];

export function inkFor(hex, { dark = "#161618", large = false } = {}) {
  const bg = hexToRgb(hex);
  const need = large ? 3 : 4.5;
  const onWhite = contrast(bg, WHITE);
  const onDark = contrast(bg, hexToRgb(dark));
  // Prefer white where it passes — that is the house rule, not a tie-break
  // the maths made. Fall to dark ink only when white cannot carry it.
  const ink = onWhite >= need ? "light" : onDark >= need ? "dark" : onWhite >= onDark ? "light" : "dark";
  return { ink, onWhite: +onWhite.toFixed(2), onDark: +onDark.toFixed(2), passes: Math.max(onWhite, onDark) >= need };
}

export { contrast, luminance, hexToRgb, rgbToHex, STEPS, WHITE_TEXT_CEILING };
