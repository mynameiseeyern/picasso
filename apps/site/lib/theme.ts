import { buildRamp, inkFor, STEPS, type Ramp } from '@ir/tokens/ramp';

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

/* These mirror packages/tokens/themes.css. If an axis gains a value there, add
 * it here — the builder must not offer a value the tokens cannot honour. */
export const RADIUS = [
  { id: 'sharp', label: 'Sharp', value: '0', px: 0 },
  { id: 'subtle', label: 'Subtle', value: '0.375rem', px: 6 },
  { id: 'default', label: 'Default', value: '0.625rem', px: 10 },
  { id: 'rounded', label: 'Rounded', value: '1rem', px: 16 },
] as const;

/* Bases that keep the 4pt grid with 2pt half-steps — every multiple of 2.
 * Themes.css deliberately offers no 3px "compact"; neither does this. */
export const SPACING = [
  { id: 'default', label: 'Default', value: '0.25rem', px: 4 },
  { id: 'comfortable', label: 'Comfortable', value: '0.375rem', px: 6 },
  { id: 'spacious', label: 'Spacious', value: '0.5rem', px: 8 },
] as const;

export const NEUTRALS = [
  { id: 'cool', label: 'Cool' },
  { id: 'warm', label: 'Warm' },
] as const;

export type Theme = {
  name: string;
  brand: string; // hex
  neutral: (typeof NEUTRALS)[number]['id'];
  radius: (typeof RADIUS)[number]['id'];
  spacing: (typeof SPACING)[number]['id'];
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
  vars['--space-1'] = SPACING.find((r) => r.id === theme.spacing)!.value;
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
    `/* Paste ABOVE the axis blocks in packages/tokens/themes.css. */`,
    `[data-brand="${name}"] {`,
    `  /* brand ramp, OKLCH from ${theme.brand.toUpperCase()}; 600–950 solved for white text */`,
    ...STEPS.map((s) => `  --palette-brand-${s}: ${r.ramp[s]};`),
    ``,
    `  /* the brand's defaults for the axes */`,
    `  --radius: ${r.vars['--radius']};`,
    `  --space-1: ${r.vars['--space-1']};`,
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

/* A brand manifest: the inputs, plus what they resolved to. Enough to
 * regenerate the CSS, and to feed a Figma Brand collection. */
export function toJson(theme: Theme, r: Resolved) {
  return JSON.stringify(
    {
      $schema: 'picasso-brand/1',
      name: slug(theme.name),
      generatedBy: 'picasso theme builder',
      inputs: {
        brand: theme.brand.toUpperCase(),
        neutral: theme.neutral,
        radius: theme.radius,
        spacing: theme.spacing,
        typography: { sans: theme.sans, mono: theme.mono },
      },
      resolved: {
        'palette/brand': r.ramp,
        radius: r.vars['--radius'],
        'space/1': r.vars['--space-1'],
        'type/family/sans': r.vars['--type-family-sans'],
        'type/family/mono': r.vars['--type-family-mono'],
        'fg/on/primary-emphasis': {
          light: { ink: r.onColour.light.ink, surface: r.onColour.light.surface, white: r.onColour.light.onWhite, dark: r.onColour.light.onDark },
          dark: { ink: r.onColour.dark.ink, surface: r.onColour.dark.surface, white: r.onColour.dark.onWhite, dark: r.onColour.dark.onDark },
        },
      },
      html: `<html data-brand="${slug(theme.name)}" data-neutral="${theme.neutral}" data-radius="${theme.radius}" data-spacing="${theme.spacing}">`,
    },
    null,
    2,
  );
}

export const STEPS_LABELS = STEPS;
