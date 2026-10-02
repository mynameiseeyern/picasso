import { buildRamp, inkFor, STEPS, type Ramp } from '@ir/tokens/ramp';
import { spaceLadder } from '@ir/tokens/space';
import presets from '@ir/tokens/presets.json';

/* The theme builder's model. Everything a brand chooses, and nothing a brand
 * may not: status colours and every semantic except fg/on/* stay put
 * (picasso-multibrand-theming §2).
 *
 * ── What a brand IS, since the token split ──────────────────────────
 * A brand is one file: tokens/brands/<id>/brand.json. It names a base colour
 * and one choice per axis from presets.json, and the build turns those
 * choices into that brand's primitive layer — the brand ramp, THE NEUTRAL
 * RAMP, the radius base, the whole spacing ladder and the font stacks —
 * emitted as a single [data-brand="<id>"] block in tokens.css.
 *
 * So the JSON is the deliverable and the CSS is a preview of what the build
 * will generate from it. Both are produced here from the same resolved
 * values the build uses, so they cannot disagree.
 */

export const SANS_FONTS = [
  { id: 'inter', label: 'Inter', family: 'Inter', google: 'Inter:wght@400;500;600' },
  { id: 'manrope', label: 'Manrope', family: 'Manrope', google: 'Manrope:wght@400;500;600' },
  { id: 'geist', label: 'Geist', family: 'Geist', google: 'Geist:wght@400;500;600' },
  { id: 'plex', label: 'IBM Plex Sans', family: 'IBM Plex Sans', google: 'IBM+Plex+Sans:wght@400;500;600' },
  { id: 'source', label: 'Source Sans 3', family: 'Source Sans 3', google: 'Source+Sans+3:wght@400;500;600' },
  { id: 'system', label: 'System', family: null, google: null },
] as const;

export const MONO_FONTS = [
  { id: 'jetbrains', label: 'JetBrains Mono', family: 'JetBrains Mono', google: 'JetBrains+Mono:wght@400;500' },
  { id: 'geist-mono', label: 'Geist Mono', family: 'Geist Mono', google: 'Geist+Mono:wght@400;500' },
  { id: 'plex-mono', label: 'IBM Plex Mono', family: 'IBM Plex Mono', google: 'IBM+Plex+Mono:wght@400;500' },
  { id: 'fira', label: 'Fira Code', family: 'Fira Code', google: 'Fira+Code:wght@400;500' },
  { id: 'system-mono', label: 'System', family: null, google: null },
] as const;

/* The build's own fallbacks (build/brands.mjs `font()`), so a font with no
 * presets.json entry gets the same stack here as it will in tokens.css. */
const SANS_FALLBACK = 'ui-sans-serif, system-ui, sans-serif';
const MONO_FALLBACK = 'ui-monospace, SFMono-Regular, Menlo, monospace';

/* Read from packages/tokens/tokens/presets.json — the same menu a brand.json
 * picks from — so the builder cannot offer a value the tokens cannot honour. */
const own = <T,>(o: Record<string, T>) => Object.entries(o).filter(([k]) => !k.startsWith('$')) as [string, T][];
const cap = (s: string) => s[0].toUpperCase() + s.slice(1);
const remPx = (v: string) => (v === '0' ? 0 : parseFloat(v) * 16);

type FontPreset = { stack?: string; styles?: Record<string, string> };
const FONT_PRESETS = Object.fromEntries(own(presets.fonts as unknown as Record<string, FontPreset>));

/** Exactly build/brands.mjs `font()`: the preset stack if there is one, else the generic. */
export function fontStack(kind: 'sans' | 'mono', id: string) {
  const f = (kind === 'sans' ? SANS_FONTS : MONO_FONTS).find((x) => x.id === id);
  const fallback = kind === 'sans' ? SANS_FALLBACK : MONO_FALLBACK;
  if (!f?.family) return fallback;
  return FONT_PRESETS[f.family]?.stack ?? `'${f.family}', ${fallback}`;
}

/** False when the build will warn: no presets.json entry, so a generic stack
 *  and Inter-style Figma weight names. */
export const isPresetFont = (family: string | null | undefined) => !!family && family in FONT_PRESETS;

export const RADIUS = own(presets.radius as unknown as Record<string, string>).map(([id, value]) => ({ id, label: cap(id), value, px: remPx(value) }));

/* Each preset scales the whole ladder and rounds every step to the 2px grid,
 * so the 4pt-with-2pt-half-steps rule survives. `px` is space/4 (16px default). */
export const SPACING = own(presets.spacing as unknown as Record<string, number>).map(([id, mult]) => {
  const ladder = spaceLadder(presets.space as unknown as Record<string, string>, mult);
  return { id, label: cap(id), mult, ladder, px: remPx(ladder['4']) };
});

/* The neutral ramps a brand chooses between. The chosen one is emitted INSIDE
 * the brand's block — brandLayer() puts palette.neutral in the brand's own
 * tokens, so it travels with the brand rather than being applied beside it. */
const NEUTRAL_RAMPS = presets.neutral as unknown as Record<string, Record<string, string>>;
export const NEUTRALS = own(NEUTRAL_RAMPS).map(([id]) => ({ id, label: cap(id) }));

export type Theme = {
  name: string;
  brand: string; // hex
  /* Eleven literal stops, when the brand carries its own. `colour.ramp` in
   * brand.json is the format's own escape hatch — Clarion's stops are
   * Marketing's and differ from the generated ones at all eleven — so the
   * builder has to be able to hold them too, or importing Clarion would show
   * a blue that is not Clarion's. Null means "generate from base", which is
   * what a brand without supplied values does. */
  ramp: Ramp | null;
  neutral: string;
  radius: string;
  spacing: string;
  sans: (typeof SANS_FONTS)[number]['id'];
  mono: (typeof MONO_FONTS)[number]['id'];
};

export const DEFAULT_THEME: Theme = {
  name: 'my-brand',
  brand: '#007FAB',
  ramp: null,
  neutral: 'cool',
  radius: 'default',
  spacing: 'default',
  sans: 'inter',
  mono: 'jetbrains',
};

/* Which step each emphasis surface uses per mode — mirrors light.json /
 * dark.json, the same pairing build/brands.mjs resolves. */
const EMPHASIS = { light: 600, dark: 500 } as const;

/* The ink light.json / dark.json already give fg/on/primary-emphasis. The
 * build emits an override only where the measured ink differs from these, so
 * the builder does too — otherwise the CSS shows overrides the build omits.
 * Only `primary` can differ at all: every other on-colour sits on a surface
 * no brand touches. */
const DEFAULT_ON_INK = { light: 'light', dark: 'dark' } as const;

export function googleFontsUrl(theme: Theme) {
  const fams = [
    SANS_FONTS.find((f) => f.id === theme.sans)?.google,
    MONO_FONTS.find((f) => f.id === theme.mono)?.google,
  ].filter(Boolean);
  return fams.length ? `https://fonts.googleapis.com/css2?${fams.map((f) => `family=${f}`).join('&')}&display=swap` : null;
}

export type Resolved = {
  ramp: Ramp;
  neutral: Record<string, string>;
  space: Record<string, string>;
  radius: string;
  sans: string;
  mono: string;
  onColour: Record<'light' | 'dark', ReturnType<typeof inkFor> & { surface: string; overridden: boolean }>;
  vars: Record<string, string>; // custom properties to set on <html>
};

export function resolve(theme: Theme): Resolved {
  const ramp = theme.ramp ?? buildRamp(theme.brand);
  const neutral = NEUTRAL_RAMPS[theme.neutral] ?? NEUTRAL_RAMPS.cool;
  const space = SPACING.find((s) => s.id === theme.spacing)!.ladder;
  const radius = RADIUS.find((r) => r.id === theme.radius)!.value;
  const sans = fontStack('sans', theme.sans);
  const mono = fontStack('mono', theme.mono);

  const onColour = {} as Resolved['onColour'];
  for (const mode of ['light', 'dark'] as const) {
    const surface = ramp[EMPHASIS[mode]];
    // The dark ink is the brand's own neutral-950, which is what
    // onColourOverrides() resolves ({palette.neutral.950}) — not inkFor's
    // generic default, or the measured ratios drift from the build's.
    const measured = inkFor(surface, { dark: neutral['950'] });
    onColour[mode] = { surface, ...measured, overridden: measured.ink !== DEFAULT_ON_INK[mode] };
  }

  /* Exactly the declarations the build puts in [data-brand="…"], so the live
   * preview and the exported CSS are the same set of values. */
  const vars: Record<string, string> = {};
  for (const s of STEPS) vars[`--palette-brand-${s}`] = ramp[s];
  for (const [k, v] of own(neutral)) vars[`--palette-neutral-${k}`] = v;
  vars['--type-family-sans'] = sans;
  vars['--type-family-mono'] = mono;
  vars['--radius'] = radius;
  for (const [k, v] of Object.entries(space)) vars[`--space-${cssKey(k)}`] = v;

  return { ramp, neutral, space, radius, sans, mono, onColour, vars };
}

/* presets.space spells half steps "0_5"; the build emits --space-0-5. */
const cssKey = (k: string) => k.replace(/[._]/g, '-');

const slug = (s: string) => s.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'brand';
const inkVar = (ink: 'light' | 'dark') => (ink === 'light' ? 'var(--palette-white)' : 'var(--palette-neutral-950)');

/**
 * The `[data-brand="…"]` block the build generates into tokens.css from this
 * brand.json — ramp, neutral ramp, fonts, radius base and the scaled spacing
 * ladder, in that order.
 *
 * It is a PREVIEW. Commit the JSON and let `npm run check` generate this;
 * pasting it by hand means the next build overwrites it.
 */
export function toCss(theme: Theme, r: Resolved) {
  const id = slug(theme.name);
  const L = (k: string, v: string) => `  --${k}: ${v};`;
  const lines = [
    `/* ${id} — preview of what the build generates from brands/${id}/brand.json.`,
    ` * Commit the JSON, not this: \`npm run check\` writes the real block into`,
    ` * dist/tokens.css, and anything pasted here is overwritten next build. */`,
    `[data-brand="${id}"] {`,
    `  /* brand ramp — OKLCH from ${theme.brand.toUpperCase()}, 600–950 solved for white text */`,
    ...STEPS.map((s) => L(`palette-brand-${s}`, r.ramp[s])),
    ``,
    `  /* neutral ramp — the brand's "${theme.neutral}" choice travels with it */`,
    ...own(r.neutral).map(([k, v]) => L(`palette-neutral-${k}`, v)),
    ``,
    `  /* type */`,
    L('type-family-sans', r.sans),
    L('type-family-mono', r.mono),
    ``,
    `  /* radius base — "${theme.radius}"; every radius step is a multiple of it */`,
    L('radius', r.radius),
    ``,
    `  /* spacing ladder — "${theme.spacing}", every step rounded to the 2px grid */`,
    ...Object.entries(r.space).map(([k, v]) => L(`space-${cssKey(k)}`, v)),
    `}`,
  ];

  const overrides = (['light', 'dark'] as const).filter((m) => r.onColour[m].overridden);
  if (overrides.length) {
    lines.push(
      ``,
      `/* on-colours — emitted only where the measured ink differs from the`,
      ` * default in light.json / dark.json. */`,
    );
    for (const mode of overrides) {
      const o = r.onColour[mode];
      const sel = mode === 'light' ? `[data-brand="${id}"]` : `.dark[data-brand="${id}"], .dark [data-brand="${id}"]`;
      lines.push(
        `${sel} {`,
        `  --fg-on-primary-emphasis: ${inkVar(o.ink)}; /* on ${o.surface}: white ${o.onWhite}, dark ${o.onDark} */`,
        `}`,
      );
    }
  } else {
    lines.push(
      ``,
      `/* No on-colour overrides: the measured ink matches light.json and`,
      ` * dark.json on both modes, so the build emits nothing here.`,
      ` * light — on ${r.onColour.light.surface}: white ${r.onColour.light.onWhite}, dark ${r.onColour.light.onDark}`,
      ` * dark  — on ${r.onColour.dark.surface}: white ${r.onColour.dark.onWhite}, dark ${r.onColour.dark.onDark} */`,
    );
  }
  return lines.join('\n');
}

const FONT_FAMILY = (kind: 'sans' | 'mono', id: string) =>
  (kind === 'sans' ? SANS_FONTS : MONO_FONTS).find((f) => f.id === id)?.family ?? 'system-ui';

/**
 * The brand, as the repo stores it. Save as
 * `packages/tokens/tokens/brands/<id>/brand.json`, then `npm run check`.
 *
 * The same file `npm run brand:new` writes, field for field. `colour.ramp` is
 * deliberately absent: the build regenerates the eleven stops from
 * `colour.base`. Pin them here only when Marketing supplies exact values.
 */
export function toJson(theme: Theme) {
  return JSON.stringify(
    {
      $description: `${theme.name} — exported from the Picasso theme builder. Each field picks from presets.json. colour.ramp pins the eleven stops; omit it and the build generates them from colour.base.`,
      name: theme.name,
      colour: theme.ramp
        ? { base: theme.brand.toUpperCase(), ramp: upper(theme.ramp) }
        : { base: theme.brand.toUpperCase() },
      neutral: theme.neutral,
      radius: theme.radius,
      spacing: theme.spacing,
      type: { sans: FONT_FAMILY('sans', theme.sans), mono: FONT_FAMILY('mono', theme.mono) },
    },
    null,
    2,
  );
}

/** The stops `colour.base` alone would produce — what Regenerate goes back to. */
export const generatedRamp = (theme: Theme) => buildRamp(theme.brand);

/** True when the stops in play are the ones the base would generate, so the
 *  builder knows whether to say the two have come apart. */
export function rampMatchesBase(theme: Theme) {
  if (!theme.ramp) return true;
  const gen = buildRamp(theme.brand);
  return STEPS.every((s) => theme.ramp![s].toUpperCase() === gen[s].toUpperCase());
}

const upper = (r: Ramp) => Object.fromEntries(STEPS.map((s) => [s, r[s].toUpperCase()]));

/** Where the exported brand.json belongs in the repo. */
export const brandPath = (theme: Theme) => `packages/tokens/tokens/brands/${slug(theme.name)}/brand.json`;

/** The brand id — the folder name, and the value of data-brand. */
export const brandId = (theme: Theme) => slug(theme.name);

export const STEPS_LABELS = STEPS;
