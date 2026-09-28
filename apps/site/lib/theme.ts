import { buildRamp, inkFor, STEPS, type Ramp } from '@ir/tokens/ramp';
import { spaceLadder } from '@ir/tokens/space';
import presets from '@ir/tokens/presets.json';

/* The theme builder's model. Everything a brand chooses, and nothing a brand
 * may not: status colours and every semantic except fg/on/* stay put
 * (picasso-multibrand-theming §2). */

export const SANS_FONTS = [
  { id: 'inter', label: 'Inter', family: 'Inter', google: 'Inter:wght@400;500;600' },
  { id: 'geist', label: 'Geist', family: 'Geist', google: 'Geist:wght@400;500;600' },
  { id: 'plex', label: 'IBM Plex Sans', family: 'IBM Plex Sans', google: 'IBM+Plex+Sans:wght@400;500;600' },
  { id: 'manrope', label: 'Manrope', family: 'Manrope', google: 'Manrope:wght@400;500;600' },
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

const SANS_FALLBACK = 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
const MONO_FALLBACK = 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace';

/* Read from packages/tokens/tokens/presets.json — the same menu a brand.json
 * picks from — so the builder cannot offer a value the tokens cannot honour. */
const own = <T,>(o: Record<string, T>) => Object.entries(o).filter(([k]) => !k.startsWith('$')) as [string, T][];
const cap = (s: string) => s[0].toUpperCase() + s.slice(1);
const remPx = (v: string) => (v === '0' ? 0 : parseFloat(v) * 16);

export const RADIUS = own(presets.radius as unknown as Record<string, string>).map(([id, value]) => ({ id, label: cap(id), value, px: remPx(value) }));

/* Each preset scales the whole ladder and rounds every step to the 2px grid,
 * so the 4pt-with-2pt-half-steps rule survives. `px` is space/4 (16px default). */
export const SPACING = own(presets.spacing as unknown as Record<string, number>).map(([id, mult]) => {
  const ladder = spaceLadder(presets.space as unknown as Record<string, string>, mult);
  return { id, label: cap(id), mult, ladder, px: remPx(ladder['4']) };
});

export const NEUTRALS = [
  { id: 'cool', label: 'Cool' },
  { id: 'warm', label: 'Warm' },
] as const;

export type Theme = {
  name: string;
  brand: string; // hex
  neutral: (typeof NEUTRALS)[number]['id'];
  radius: string;
  spacing: string;
  sans: (typeof SANS_FONTS)[number]['id'];
  mono: (typeof MONO_FONTS)[number]['id'];
};

export const DEFAULT_THEME: Theme = {
  name: 'my-brand',
  brand: '#007FAB',
  neutral: 'cool',
  radius: 'default',
  spacing: 'default',
  sans: 'inter',
  mono: 'jetbrains',
};

/* Which step each emphasis surface uses per mode — mirrors light.json /
 * dark.json, same as build/brand.mjs. */
const EMPHASIS = { light: 600, dark: 500 } as const;

export function fontStack(kind: 'sans' | 'mono', id: string) {
  const list = kind === 'sans' ? SANS_FONTS : MONO_FONTS;
  const f = list.find((x) => x.id === id) ?? list[0];
  const fallback = kind === 'sans' ? SANS_FALLBACK : MONO_FALLBACK;
  return f.family ? `"${f.family}", ${fallback}` : fallback;
}

export function googleFontsUrl(theme: Theme) {
  const fams = [
    SANS_FONTS.find((f) => f.id === theme.sans)?.google,
    MONO_FONTS.find((f) => f.id === theme.mono)?.google,
  ].filter(Boolean);
  return fams.length ? `https://fonts.googleapis.com/css2?${fams.map((f) => `family=${f}`).join('&')}&display=swap` : null;
}

export type Resolved = {
  ramp: Ramp;
  onColour: Record<'light' | 'dark', ReturnType<typeof inkFor> & { surface: string }>;
  vars: Record<string, string>; // custom properties to set on <html>
};

export function resolve(theme: Theme): Resolved {
  const ramp = buildRamp(theme.brand);
  const onColour = {
    light: { surface: ramp[EMPHASIS.light], ...inkFor(ramp[EMPHASIS.light]) },
    dark: { surface: ramp[EMPHASIS.dark], ...inkFor(ramp[EMPHASIS.dark]) },
  };
  const vars: Record<string, string> = {};
  for (const s of STEPS) vars[`--palette-brand-${s}`] = ramp[s];
  vars['--radius'] = RADIUS.find((r) => r.id === theme.radius)!.value;
  for (const [k, v] of Object.entries(SPACING.find((r) => r.id === theme.spacing)!.ladder)) vars[`--space-${k.replace(/_/g, '-')}`] = v;
  vars['--type-family-sans'] = fontStack('sans', theme.sans);
  vars['--type-family-mono'] = fontStack('mono', theme.mono);
  return { ramp, onColour, vars };
}

const slug = (s: string) => s.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'brand';
const inkVar = (ink: 'light' | 'dark') => (ink === 'light' ? 'var(--palette-white)' : 'var(--palette-neutral-950)');

/* A themes.css block in the shape build/brand.mjs emits — the brand sets the
 * axis defaults, and an explicit data-* axis still overrides it because the
 * axis blocks come later in the file. */
export function toCss(theme: Theme, r: Resolved) {
  const name = slug(theme.name);
  const lines = [
    `/* ${name} — generated by the Picasso theme builder. Do not hand-edit; regenerate. */`,
    `/* Preview only — the build generates this from brand.json. Commit the JSON, not this. */`,
    `[data-brand="${name}"] {`,
    `  /* brand ramp, OKLCH from ${theme.brand.toUpperCase()}; 600–950 solved for white text */`,
    ...STEPS.map((s) => `  --palette-brand-${s}: ${r.ramp[s]};`),
    ``,
    `  /* the brand's defaults for the axes */`,
    `  --radius: ${r.vars['--radius']};`,
    `  /* spacing: ${theme.spacing} — the full ladder is generated by the build */`,
    `  --type-family-sans: ${r.vars['--type-family-sans']};`,
    `  --type-family-mono: ${r.vars['--type-family-mono']};`,
    `}`,
  ];
  if (theme.neutral === 'warm') {
    lines.push(
      ``,
      `/* Neutral is an axis, not part of the brand block: the warm ramp already`,
      ` * lives in themes.css. Apply it with data-neutral="warm" beside data-brand. */`,
    );
  }
  lines.push(
    ``,
    `/* on-colours, measured — white where it passes 4.5:1, dark ink where it cannot */`,
    `[data-brand="${name}"] {`,
    `  --fg-on-primary-emphasis: ${inkVar(r.onColour.light.ink)}; /* on ${r.onColour.light.surface}: white ${r.onColour.light.onWhite}, dark ${r.onColour.light.onDark} */`,
    `}`,
    `.dark [data-brand="${name}"], [data-brand="${name}"].dark {`,
    `  --fg-on-primary-emphasis: ${inkVar(r.onColour.dark.ink)}; /* on ${r.onColour.dark.surface}: white ${r.onColour.dark.onWhite}, dark ${r.onColour.dark.onDark} */`,
    `}`,
  );
  return lines.join('\n');
}

const FONT_FAMILY = (kind: 'sans' | 'mono', id: string) =>
  (kind === 'sans' ? SANS_FONTS : MONO_FONTS).find((f) => f.id === id)?.family ?? 'system-ui';

/* The brand, as the repo stores it: save as
 * packages/tokens/tokens/brands/<name>/brand.json and run `npm run check`.
 * The same file `npm run brand:new` writes — the ramp is regenerated from
 * colour.base at build time, so it is not repeated here. */
export function toJson(theme: Theme, _r: Resolved) {
  return JSON.stringify(
    {
      $description: `${theme.name} — exported from the Picasso theme builder. Each field picks from presets.json.`,
      name: theme.name,
      colour: { base: theme.brand.toUpperCase() },
      neutral: theme.neutral,
      radius: theme.radius,
      spacing: theme.spacing,
      type: { sans: FONT_FAMILY('sans', theme.sans), mono: FONT_FAMILY('mono', theme.mono) },
    },
    null,
    2,
  );
}

export const STEPS_LABELS = STEPS;
