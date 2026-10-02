'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { AlertCircle, Check, Copy, Download, Moon, RotateCcw, Sun, Upload, Wand2, X } from 'lucide-react';
import { BrandColorPicker } from '@/components/brand-color-picker';
import { BrandFlow } from '@/components/brand-flow';
import {
  DEFAULT_THEME,
  MONO_FONTS,
  NEUTRALS,
  RADIUS,
  SANS_FONTS,
  SPACING,
  STEPS_LABELS,
  brandId,
  brandPath,
  googleFontsUrl,
  isPresetFont,
  rampMatchesBase,
  resolve,
  toCss,
  toJson,
  type Theme,
} from '@/lib/theme';
import { ImportError, MultipleBrands, importTheme } from '@/lib/theme-import';

/* The preview is the Storybook "Theming/Preview" story in an iframe. It is the
 * real components on the real tokens; the builder only drives the axes on the
 * iframe's <html>, the same way an app would. Same origin, so we can reach in. */
const PREVIEW_URL = '/components/iframe.html?id=theming-preview--default&viewMode=story';

export function ThemeBuilder() {
  const [theme, setTheme] = useState<Theme>(DEFAULT_THEME);
  const [dark, setDark] = useState(false);
  const [ready, setReady] = useState(false);
  const [copied, setCopied] = useState<'css' | 'json' | null>(null);
  const [tab, setTab] = useState<'readme' | 'css' | 'json'>('readme');
  const frame = useRef<HTMLIFrameElement>(null);
  const picker = useRef<HTMLInputElement>(null);

  /* Import state. `notice` is what came in and what could not be honoured;
     `problem` is a file that could not be read at all; `choose` is a CSS file
     holding more than one brand, waiting on which. */
  const [notice, setNotice] = useState<{ title: string; warnings: string[] } | null>(null);
  const [problem, setProblem] = useState<string | null>(null);
  const [choose, setChoose] = useState<{ ids: string[]; text: string } | null>(null);
  const [dropping, setDropping] = useState(false);

  /* What is being typed into the code panel. The panel shows the draft while
     it exists so the caret stays put; the theme only moves when the draft
     parses. Any control change drops it, because the control is then the
     newer statement of intent. */
  const [draft, setDraft] = useState<{ tab: 'css' | 'json'; text: string; error: string | null } | null>(null);

  const resolved = useMemo(() => resolve(theme), [theme]);
  const css = useMemo(() => toCss(theme, resolved), [theme, resolved]);
  const json = useMemo(() => toJson(theme), [theme, resolved]);
  const set = <K extends keyof Theme>(k: K, v: Theme[K]) => {
    setDraft(null);
    setTheme((t) => ({ ...t, [k]: v }));
  };

  /* Editing one stop makes the whole ramp the brand's own: brand.json takes
     eleven stops or none, so there is no such thing as one supplied stop. */
  const setStop = (step: number, hex: string) => set('ramp', { ...resolved.ramp, [step]: hex });

  const apply = (text: string, brand?: string) => {
    try {
      const r = importTheme(text, { brand });
      setTheme(r.theme);
      setDraft(null);
      setChoose(null);
      setProblem(null);
      setNotice({
        title: `${r.id ?? 'Brand'} — read from ${r.from === 'json' ? 'brand.json' : 'CSS'}`,
        warnings: r.warnings,
      });
    } catch (e) {
      if (e instanceof MultipleBrands) {
        setChoose({ ids: e.ids, text });
        setNotice(null);
        setProblem(null);
        return;
      }
      setProblem(e instanceof ImportError ? e.message : `Could not read that file — ${(e as Error).message}`);
      setNotice(null);
      setChoose(null);
    }
  };

  const openFile = async (file: File | null | undefined) => {
    if (file) apply(await file.text());
  };

  /* Typing in the panel runs the same importer the file picker does, so a
     value typed here and a value imported from a file cannot be read two
     different ways. */
  const editCode = (text: string, which: 'css' | 'json') => {
    try {
      const r = importTheme(text);
      setTheme(r.theme);
      setDraft({ tab: which, text, error: null });
    } catch (e) {
      setDraft({ tab: which, text, error: (e as Error).message });
    }
  };

  const matchesBase = rampMatchesBase(theme);

  /* Fonts with no presets.json entry: the build still works, but with a
     generic stack and Inter-style weight names in the Figma export. */
  const unlisted = [
    SANS_FONTS.find((f) => f.id === theme.sans),
    MONO_FONTS.find((f) => f.id === theme.mono),
  ]
    .filter((f) => f?.family && !isPresetFont(f.family))
    .map((f) => f!.label);

  /* Push the theme into the iframe whenever it changes. */
  useEffect(() => {
    const doc = frame.current?.contentDocument;
    const root = doc?.documentElement;
    if (!doc || !root || !ready) return;

    // resolved.vars IS the [data-brand] block: ramp, neutral ramp, fonts,
    // radius base and the spacing ladder. Setting them on <html> is what an
    // app does when it switches brand, so the preview and the export agree.
    for (const [k, v] of Object.entries(resolved.vars)) root.style.setProperty(k, v);
    // Neutral rides inside the brand now, so no data-neutral attribute: the
    // ramp is already in vars, and the attribute would be a second source.
    root.removeAttribute('data-neutral');
    // Pin the on-colour only where the build would emit an override.
    const on = resolved.onColour[dark ? 'dark' : 'light'];
    if (on.overridden) root.style.setProperty('--fg-on-primary-emphasis', on.ink === 'light' ? 'var(--palette-white)' : 'var(--palette-neutral-950)');
    else root.style.removeProperty('--fg-on-primary-emphasis');
    root.classList.toggle('dark', dark);
    doc.body.style.padding = '0';

    const url = googleFontsUrl(theme);
    let link = doc.getElementById('picasso-fonts') as HTMLLinkElement | null;
    if (url) {
      if (!link) {
        link = doc.createElement('link');
        link.id = 'picasso-fonts';
        link.rel = 'stylesheet';
        doc.head.appendChild(link);
      }
      if (link.href !== url) link.href = url;
    } else link?.remove();
  }, [theme, resolved, dark, ready]);

  const copy = async (kind: 'css' | 'json') => {
    await navigator.clipboard.writeText(kind === 'css' ? css : json);
    setCopied(kind);
    setTimeout(() => setCopied(null), 1600);
  };
  const download = (kind: 'css' | 'json') => {
    const blob = new Blob([kind === 'css' ? css : json], { type: kind === 'css' ? 'text/css' : 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = kind === 'css' ? `${theme.name || 'brand'}.preview.css` : 'brand.json';
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const validHex = /^#[0-9a-f]{6}$/i.test(theme.brand);
  const on = resolved.onColour[dark ? 'dark' : 'light'];

  return (
    <main
      className={`mx-auto w-full max-w-[1600px] px-4 py-6 md:px-6 ${dropping ? 'outline-2 outline-offset-[-8px] outline-dashed outline-fd-primary' : ''}`}
      onDragOver={(e) => {
        if (!e.dataTransfer.types.includes('Files')) return;
        e.preventDefault();
        setDropping(true);
      }}
      onDragLeave={(e) => {
        if (e.currentTarget.contains(e.relatedTarget as Node)) return;
        setDropping(false);
      }}
      onDrop={(e) => {
        if (!e.dataTransfer.files.length) return;
        e.preventDefault();
        setDropping(false);
        void openFile(e.dataTransfer.files[0]);
      }}
    >
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="ir-pill bg-ir-panel-grey text-ir-purple dark:bg-white/10 dark:text-ir-corporate-blue">Theming</span>
          <h1 className="ir-display mt-3 text-4xl md:text-5xl">Create a brand</h1>
          <p className="mt-2 max-w-2xl text-fd-muted-foreground">
            One colour becomes an eleven-step ramp in OKLCH, with the on-colours measured rather than chosen. Pick a
            neutral, a radius, a spacing base and type, watch real components change, then export.
          </p>
        </div>
        <div className="flex gap-2">
          <input
            ref={picker}
            type="file"
            accept=".json,.css,application/json,text/css"
            className="sr-only"
            onChange={(e) => {
              void openFile(e.target.files?.[0]);
              e.target.value = '';
            }}
          />
          <button type="button" onClick={() => picker.current?.click()} className="btn-ghost">
            <Upload className="size-4" aria-hidden /> Import
          </button>
          <button type="button" onClick={() => setDark((d) => !d)} className="btn-ghost" aria-pressed={dark}>
            {dark ? <Sun className="size-4" aria-hidden /> : <Moon className="size-4" aria-hidden />}
            {dark ? 'Light preview' : 'Dark preview'}
          </button>
          <button type="button" onClick={() => setTheme(DEFAULT_THEME)} className="btn-ghost">
            <RotateCcw className="size-4" aria-hidden /> Reset
          </button>
        </div>
      </header>

      {problem ? (
        <Banner tone="problem" onDismiss={() => setProblem(null)}>
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
          <p>{problem}</p>
        </Banner>
      ) : null}

      {choose ? (
        <Banner tone="note" onDismiss={() => setChoose(null)}>
          <div>
            <p className="font-medium">That file holds {choose.ids.length} brands. Which one?</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {choose.ids.map((id) => (
                <button key={id} type="button" className="btn-ghost" onClick={() => apply(choose.text, id)}>
                  {id}
                </button>
              ))}
            </div>
          </div>
        </Banner>
      ) : null}

      {notice ? (
        <Banner tone={notice.warnings.length ? 'note' : 'ok'} onDismiss={() => setNotice(null)}>
          <div>
            <p className="font-medium">{notice.title}</p>
            {notice.warnings.length ? (
              <ul className="mt-1 list-disc space-y-1 pl-4 text-fd-muted-foreground">
                {notice.warnings.map((w) => (
                  <li key={w}>{w}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-1 text-fd-muted-foreground">Every value mapped to a preset. Edit and download.</p>
            )}
          </div>
        </Banner>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        {/* Controls */}
        <aside className="space-y-7 lg:sticky lg:top-20 lg:self-start">
          <Section title="Name">
            <input
              className="field"
              value={theme.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="my-brand"
              aria-label="Brand name"
            />
          </Section>

          <Section title="Colour">
            <label className="mb-1.5 block text-xs font-semibold text-fd-muted-foreground">Brand</label>
            <BrandColorPicker
              value={validHex ? theme.brand : '#007FAB'}
              onChange={(hex) => set('brand', hex)}
            />
            <input
              className="field mt-2 font-mono uppercase"
              value={theme.brand}
              onChange={(e) => set('brand', e.target.value)}
              aria-label="Brand colour hex"
              aria-invalid={!validHex}
              spellCheck={false}
            />
            {/* Each stop is editable. A label wrapping a hidden colour input
                rather than a styled <input type="color">: the native control
                cannot be made to fill a cell the same way across browsers,
                and the swatch IS the control here. */}
            <div className="mt-3 grid grid-cols-11 gap-0.5" aria-label="Brand ramp">
              {STEPS_LABELS.map((s) => (
                <label
                  key={s}
                  title={`brand/${s} ${resolved.ramp[s]} — click to edit`}
                  className="block h-7 cursor-pointer first:rounded-l-md last:rounded-r-md"
                  style={{ background: resolved.ramp[s] }}
                >
                  <input
                    type="color"
                    className="sr-only"
                    value={resolved.ramp[s]}
                    onChange={(e) => setStop(s, e.target.value)}
                    aria-label={`Brand ${s}`}
                  />
                </label>
              ))}
            </div>
            {theme.ramp && !matchesBase ? (
              <div className="mt-2">
                <p className="text-xs text-fd-muted-foreground">
                  These stops came with the brand — they are not what{' '}
                  <span className="font-mono">{theme.brand.toUpperCase()}</span> generates. Kept as written, and
                  exported as <span className="font-mono">colour.ramp</span>.
                </p>
                <button type="button" className="btn-ghost mt-1.5" onClick={() => set('ramp', null)}>
                  <Wand2 className="size-3.5" aria-hidden /> Regenerate from base
                </button>
              </div>
            ) : null}
            <p className="mt-2 text-xs text-fd-muted-foreground">
              Emphasis {dark ? '500' : '600'} <span className="font-mono">{on.surface}</span> — {on.ink === 'light' ? 'white' : 'dark'} text at{' '}
              <span className="font-mono">{(on.ink === 'light' ? on.onWhite : on.onDark).toFixed(2)}:1</span>
              {on.passes ? '' : ' ⚠ neither ink passes'}
            </p>

            <label className="mb-1.5 mt-4 block text-xs font-semibold text-fd-muted-foreground">Neutral</label>
            <Segmented options={NEUTRALS} value={theme.neutral} onChange={(v) => set('neutral', v)} />
            <p className="mt-2 text-xs text-fd-muted-foreground">
              The chosen ramp is written into the brand&rsquo;s own block, not applied beside it.
            </p>
          </Section>

          <Section title="Radius">
            <Segmented options={RADIUS} value={theme.radius} onChange={(v) => set('radius', v)} hint={(o) => `${o.px}px`} />
          </Section>

          <Section title="Spacing">
            <Segmented options={SPACING} value={theme.spacing} onChange={(v) => set('spacing', v)} hint={(o) => `×${o.mult} · space/4 ${o.px}px`} />
            <p className="mt-2 text-xs text-fd-muted-foreground">Every step scales, then rounds to the 2px grid so the 4pt rule holds.</p>
          </Section>

          <Section title="Typography">
            <label className="mb-1.5 block text-xs font-semibold text-fd-muted-foreground">Main</label>
            <select className="field" value={theme.sans} onChange={(e) => set('sans', e.target.value as Theme['sans'])} aria-label="Main font">
              {SANS_FONTS.map((f) => (
                <option key={f.id} value={f.id}>{f.label}{f.family && !isPresetFont(f.family) ? ' — not in presets' : ''}</option>
              ))}
            </select>
            <label className="mb-1.5 mt-3 block text-xs font-semibold text-fd-muted-foreground">Mono</label>
            <select className="field" value={theme.mono} onChange={(e) => set('mono', e.target.value as Theme['mono'])} aria-label="Mono font">
              {MONO_FONTS.map((f) => (
                <option key={f.id} value={f.id}>{f.label}{f.family && !isPresetFont(f.family) ? ' — not in presets' : ''}</option>
              ))}
            </select>
            {unlisted.length ? (
              <p className="mt-2 text-xs text-fd-muted-foreground">
                <strong>{unlisted.join(' and ')}</strong> {unlisted.length > 1 ? 'are' : 'is'} not in{' '}
                <span className="font-mono">presets.json</span>, so the build falls back to a generic stack and
                Inter-style weight names in Figma. Add an entry to pin the stack.
              </p>
            ) : null}
          </Section>
        </aside>

        {/* Preview + export */}
        <div className="min-w-0 space-y-6">
          <div className="overflow-hidden rounded-xl border border-fd-border bg-fd-muted">
            <iframe
              ref={frame}
              src={PREVIEW_URL}
              title="Theme preview — real Picasso components"
              className="block h-[1040px] w-full bg-white"
              onLoad={() => setReady(true)}
            />
          </div>

          <section className="rounded-xl border border-fd-border">
            <div className="flex flex-wrap items-center gap-2 border-b border-fd-border px-3 py-2">
              <div role="tablist" className="flex gap-1">
                {(['readme', 'css', 'json'] as const).map((t) => (
                  <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className="tab">
                    {t === 'readme' ? 'readme' : t === 'css' ? 'tokens.css — preview' : 'brand.json'}
                  </button>
                ))}
              </div>
              {/* Copy and Download act on a file. The readme is not one. */}
              {tab === 'readme' ? null : (
                <div className="ml-auto flex gap-2">
                  <button type="button" className="btn-ghost" onClick={() => copy(tab)}>
                    {copied === tab ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}
                    {copied === tab ? 'Copied' : 'Copy'}
                  </button>
                  <button type="button" className="btn-ghost" onClick={() => download(tab)}>
                    <Download className="size-4" aria-hidden /> Download
                  </button>
                </div>
              )}
            </div>
            {tab === 'readme' ? null : (
            <p className="border-b border-fd-border px-4 py-2 text-xs text-fd-muted-foreground">
              {tab === 'json' ? (
                <>
                  Save as <span className="font-mono">{brandPath(theme)}</span>, then run{' '}
                  <span className="font-mono">npm run check</span>. The build generates the CSS, the Figma
                  export and the contrast checks from this one file.
                </>
              ) : (
                <>
                  What the build will generate as{' '}
                  <span className="font-mono">[data-brand=&quot;{brandId(theme)}&quot;]</span> in{' '}
                  <span className="font-mono">dist/tokens.css</span>. Shown so you can read it — commit the
                  JSON, not this.
                </>
              )}
            </p>
            )}
            {tab === 'readme' ? (
              <BrandFlow />
            ) : (
              <>
                {/* Editable, and read by the same importer the file picker
                    uses — so a value typed here and the same value imported
                    from a file cannot be understood two different ways. */}
                <textarea
                  className="block max-h-[420px] min-h-[280px] w-full resize-y overflow-auto bg-transparent p-4 font-mono text-xs leading-relaxed outline-none"
                  spellCheck={false}
                  value={draft?.tab === tab ? draft.text : tab === 'css' ? css : json}
                  onChange={(e) => editCode(e.target.value, tab)}
                  aria-label={tab === 'css' ? 'Generated CSS, editable' : 'brand.json, editable'}
                  aria-invalid={draft?.tab === tab && !!draft.error}
                />
                {draft?.tab === tab && draft.error ? (
                  <p className="flex items-start gap-2 border-t border-fd-border px-4 py-2 text-xs text-ir-red">
                    <AlertCircle className="mt-0.5 size-3.5 shrink-0" aria-hidden />
                    {draft.error} — the preview is still showing the last version that read.
                  </p>
                ) : null}
              </>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

function Banner({
  tone,
  onDismiss,
  children,
}: {
  tone: 'ok' | 'note' | 'problem';
  onDismiss: () => void;
  children: React.ReactNode;
}) {
  const ring =
    tone === 'problem'
      ? 'border-ir-red/40 bg-ir-red/5'
      : tone === 'note'
        ? 'border-fd-border bg-fd-muted'
        : 'border-fd-border bg-fd-card';
  return (
    <div role={tone === 'problem' ? 'alert' : 'status'} className={`mb-6 flex gap-3 rounded-xl border p-3 text-sm ${ring}`}>
      {children}
      <button type="button" onClick={onDismiss} className="ml-auto self-start rounded p-1 hover:bg-fd-accent" aria-label="Dismiss">
        <X className="size-4" aria-hidden />
      </button>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-2 text-sm font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function Segmented<T extends { id: string; label: string }>({
  options,
  value,
  onChange,
  hint,
}: {
  options: readonly T[];
  value: T['id'];
  onChange: (v: T['id']) => void;
  hint?: (o: T) => string;
}) {
  return (
    <div role="radiogroup" className="grid gap-1" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          role="radio"
          aria-checked={value === o.id}
          onClick={() => onChange(o.id)}
          className="seg"
        >
          <span className="block text-sm font-medium">{o.label}</span>
          {hint && <span className="block text-2xs text-fd-muted-foreground">{hint(o)}</span>}
        </button>
      ))}
    </div>
  );
}
