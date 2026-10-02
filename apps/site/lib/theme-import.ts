import { STEPS, type Ramp, type Step } from '@ir/tokens/ramp';
import presets from '@ir/tokens/presets.json';
import {
  DEFAULT_THEME,
  MONO_FONTS,
  NEUTRALS,
  RADIUS,
  SANS_FONTS,
  SPACING,
  fontStack,
  type Theme,
} from '@/lib/theme';

/**
 * Reading a brand back in.
 *
 * The rule the whole file follows: the builder holds any value brand.json can
 * hold, and nothing else. brand.json names one preset per axis, so an imported
 * radius, spacing, neutral or font has to map back to a preset id — a value
 * matching none is reported rather than quietly snapped to a default, because
 * the build could not accept it either. `colour.ramp` is the one axis the
 * format lets a brand spell out, so eleven literal stops survive import
 * exactly as written.
 *
 * Two sources. brand.json is the authored file and round-trips field for
 * field. CSS is derived — the builder's own preview export, or the built
 * dist/tokens.css — and is read because it is the file most likely to get a
 * value poked into it by hand. What CSS cannot carry is `colour.base`: a
 * generated ramp takes hue and chroma from the base but lightness from the
 * ladder, so no step is the base verbatim. Step 600 is the anchor and the
 * closest thing to it, so that is what is read, and it is said out loud.
 * Nothing visible rests on the guess — the ramp is kept literally, so the base
 * matters again only if someone regenerates.
 */

export type ImportResult = {
  theme: Theme;
  /** What could not be honoured. Shown to the reader, never swallowed. */
  warnings: string[];
  from: 'json' | 'css';
  /** The brand this came from, when the source named one. */
  id?: string;
};

/** A CSS file with more than one brand in it — the caller picks, then re-calls. */
export class MultipleBrands extends Error {
  constructor(readonly ids: string[]) {
    super(`This file holds ${ids.length} brands.`);
    this.name = 'MultipleBrands';
  }
}

export class ImportError extends Error {
  name = 'ImportError';
}

const HEX = /^#[0-9a-f]{6}$/i;
const NEUTRAL_RAMPS = presets.neutral as unknown as Record<string, Record<string, string>>;
const eq = (a: string, b: string) => a.trim().toUpperCase() === b.trim().toUpperCase();

/** Sniff the format rather than trust the extension — people rename files. */
export function importTheme(text: string, opts: { brand?: string } = {}): ImportResult {
  const body = text.trim();
  if (!body) throw new ImportError('The file is empty.');
  if (body.startsWith('{')) return fromJson(body);
  if (body.includes('[data-brand')) return fromCss(body, opts.brand);
  throw new ImportError('Not a brand. Expected a brand.json, or CSS holding a [data-brand="…"] block.');
}

/* ---- brand.json ------------------------------------------------------ */

function fromJson(text: string): ImportResult {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch (e) {
    throw new ImportError(`That is not valid JSON — ${(e as Error).message}`);
  }
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new ImportError('Expected a brand object.');
  const o = raw as Record<string, any>;
  const warn: string[] = [];

  const named = typeof o.name === 'string' && o.name.trim();
  if (!named) warn.push(`No name in the file — using "${DEFAULT_THEME.name}".`);

  const base = typeof o.colour?.base === 'string' ? o.colour.base : undefined;
  if (base && !HEX.test(base)) warn.push(`colour.base "${base}" is not a six-digit hex.`);
  const { ramp, baseFromRamp } = readRamp(o.colour?.ramp, warn);

  return {
    from: 'json',
    id: named || undefined,
    warnings: warn,
    theme: {
      name: named || DEFAULT_THEME.name,
      brand: base && HEX.test(base) ? base : (baseFromRamp ?? DEFAULT_THEME.brand),
      ramp,
      neutral: pickId('neutral', o.neutral, NEUTRALS, warn),
      radius: pickId('radius', o.radius, RADIUS, warn),
      spacing: pickId('spacing', o.spacing, SPACING, warn),
      sans: fontId('sans', o.type?.sans, warn),
      mono: fontId('mono', o.type?.mono, warn),
    },
  };
}

/** `colour.ramp` is step → hex. A partial one is worth saying out loud: the
 *  missing stops would come from the base, and the result would be a ramp that
 *  is neither the file's nor the base's. Rather than show that, fall back to
 *  the generated eleven and say why. */
function readRamp(raw: unknown, warn: string[]): { ramp: Ramp | null; baseFromRamp?: string } {
  if (raw == null) return { ramp: null };
  if (typeof raw !== 'object') {
    warn.push('colour.ramp is not an object — stops generated from the base instead.');
    return { ramp: null };
  }
  const given = raw as Record<string, unknown>;
  const out = {} as Ramp;
  const bad: Step[] = [];
  for (const s of STEPS) {
    const v = given[String(s)];
    if (typeof v === 'string' && HEX.test(v)) out[s] = v;
    else bad.push(s);
  }
  if (bad.length) {
    warn.push(
      `colour.ramp is missing or malformed at ${bad.join(', ')} — a part-supplied ramp would be neither the file's nor the base's, so all eleven stops are generated from colour.base.`,
    );
    return { ramp: null };
  }
  return { ramp: out, baseFromRamp: out[600] };
}

/* ---- CSS ------------------------------------------------------------- */

/** Blocks that actually declare a brand. The on-colour override blocks the
 *  export also writes carry only --fg-on-primary-emphasis, so they are not it. */
function brandBlocks(css: string) {
  const out = new Map<string, string>();
  const re = /\[data-brand=["']([^"']+)["']\]\s*\{([^}]*)\}/g;
  for (let m = re.exec(css); m; m = re.exec(css)) {
    const [, id, block] = m;
    if (!block.includes('--palette-brand-')) continue;
    if (!out.has(id)) out.set(id, block);
  }
  return out;
}

function fromCss(source: string, wanted?: string): ImportResult {
  // Comments go first. The builder's own export opens every group with one
  // ("/* brand ramp — … */"), and a comment sitting between the brace and the
  // first declaration otherwise swallows that declaration's name.
  const css = source.replace(/\/\*[\s\S]*?\*\//g, '');
  const blocks = brandBlocks(css);
  if (!blocks.size) {
    throw new ImportError('No brand found. Expected a [data-brand="…"] block declaring --palette-brand-* stops.');
  }
  const ids = [...blocks.keys()];
  if (!wanted && ids.length > 1) throw new MultipleBrands(ids);
  const id = wanted ?? ids[0];
  const block = blocks.get(id);
  if (!block) throw new ImportError(`This file has no brand called "${id}".`);

  const decl = new Map<string, string>();
  for (const line of block.split(';')) {
    const i = line.indexOf(':');
    if (i < 0) continue;
    const k = line.slice(0, i).trim();
    if (k.startsWith('--')) decl.set(k, line.slice(i + 1).trim());
  }

  // The ramp is the reason to read CSS at all, so a partial one is an error
  // rather than a quiet fallback to generated stops.
  const ramp = {} as Ramp;
  const missing: Step[] = [];
  for (const s of STEPS) {
    const v = decl.get(`--palette-brand-${s}`);
    if (v && HEX.test(v)) ramp[s] = v;
    else missing.push(s);
  }
  if (missing.length) {
    throw new ImportError(
      `The [data-brand="${id}"] block is missing brand stops ${missing.join(', ')}, so there is no ramp to read.`,
    );
  }

  const warn = [
    `CSS does not carry colour.base — no generated stop is the base verbatim. Step 600 (${ramp[600].toUpperCase()}) is read as the base; the eleven stops are kept exactly as the file has them.`,
    ...offPreset(decl, id),
  ];

  return {
    from: 'css',
    id,
    warnings: warn,
    theme: {
      name: id,
      brand: ramp[600],
      ramp,
      neutral: matchNeutral(decl) ?? DEFAULT_THEME.neutral,
      radius: matchRadius(decl) ?? DEFAULT_THEME.radius,
      spacing: matchSpacing(decl) ?? DEFAULT_THEME.spacing,
      sans: matchFont('sans', decl) ?? DEFAULT_THEME.sans,
      mono: matchFont('mono', decl) ?? DEFAULT_THEME.mono,
    },
  };
}

/** Values a brand.json could not name, so the builder cannot carry them back
 *  out. Named with the value that was in the file, not just the axis. */
function offPreset(decl: Map<string, string>, id: string) {
  const out: string[] = [];
  const has = (p: string) => [...decl.keys()].some((k) => k.startsWith(p));
  if (decl.has('--radius') && !matchRadius(decl)) {
    out.push(`radius ${decl.get('--radius')} matches no preset — brand.json names a radius, so this value cannot be exported.`);
  }
  if (has('--space-') && !matchSpacing(decl)) {
    out.push('The spacing ladder matches no preset — brand.json scales the ladder by a named amount, it does not spell one out.');
  }
  if (has('--palette-neutral-') && !matchNeutral(decl)) {
    out.push('The neutral ramp matches no preset — brand.json names a neutral, it does not spell one out.');
  }
  for (const kind of ['sans', 'mono'] as const) {
    if (decl.has(`--type-family-${kind}`) && !matchFont(kind, decl)) {
      out.push(`The ${kind} stack in "${id}" is not a font the builder offers — left as ${DEFAULT_THEME[kind]}.`);
    }
  }
  return out;
}

const matchRadius = (d: Map<string, string>) => {
  const got = d.get('--radius');
  return got ? RADIUS.find((r) => eq(r.value, got))?.id : undefined;
};

function matchNeutral(d: Map<string, string>) {
  return Object.entries(NEUTRAL_RAMPS)
    .filter(([k]) => !k.startsWith('$'))
    .find(([, ramp]) =>
      Object.entries(ramp).every(([k, v]) => {
        const got = d.get(`--palette-neutral-${k}`);
        return got ? eq(got, v) : false;
      }),
    )?.[0];
}

function matchSpacing(d: Map<string, string>) {
  return SPACING.find((s) =>
    Object.entries(s.ladder).every(([k, v]) => {
      const got = d.get(`--space-${k.replace(/[._]/g, '-')}`);
      return got ? eq(got, v) : false;
    }),
  )?.id;
}

/** The whole stack first — that is what the build writes. The family name is
 *  the fallback, for a stack someone shortened by hand. */
function matchFont<K extends 'sans' | 'mono'>(kind: K, d: Map<string, string>): Theme[K] | undefined {
  const got = d.get(`--type-family-${kind}`);
  if (!got) return undefined;
  const list: readonly { id: string; family: string | null }[] = kind === 'sans' ? SANS_FONTS : MONO_FONTS;
  const hit =
    list.find((f) => eq(fontStack(kind, f.id), got)) ??
    list.find((f) => f.family && got.toLowerCase().includes(f.family.toLowerCase()));
  return hit?.id as Theme[K] | undefined;
}

/* ---- shared ---------------------------------------------------------- */

function pickId<T extends { id: string }>(axis: 'neutral' | 'radius' | 'spacing', value: unknown, options: readonly T[], warn: string[]) {
  if (value == null) return DEFAULT_THEME[axis];
  const hit = options.find((o) => o.id === value);
  if (hit) return hit.id;
  warn.push(`${axis} "${String(value)}" is not one of ${options.map((o) => o.id).join(', ')} — kept ${DEFAULT_THEME[axis]}.`);
  return DEFAULT_THEME[axis];
}

/** brand.json names a font by family ("IBM Plex Sans"), not by builder id. */
function fontId<K extends 'sans' | 'mono'>(kind: K, family: unknown, warn: string[]): Theme[K] {
  if (family == null) return DEFAULT_THEME[kind];
  const list: readonly { id: string; family: string | null }[] = kind === 'sans' ? SANS_FONTS : MONO_FONTS;
  const hit = list.find((f) => f.family && typeof family === 'string' && eq(f.family, family));
  if (hit) return hit.id as Theme[K];
  warn.push(`type.${kind} "${String(family)}" is not a font the builder offers — kept ${DEFAULT_THEME[kind]}.`);
  return DEFAULT_THEME[kind];
}
