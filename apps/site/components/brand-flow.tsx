import { AlertTriangle, ArrowLeft } from 'lucide-react';

/* The README tab of the theme builder: what actually has to happen for a new
 * brand to exist, in order, with the lane that owns each step. Every command
 * here is a real script in the repo — brand:new, check, figma:import — so the
 * page cannot drift from the pipeline without the pipeline breaking first. */

type Lane = 'design' | 'eng';

const LANE: Record<Lane, { label: string; className: string }> = {
  design: { label: 'Design', className: 'bg-fd-primary/10 text-fd-primary ring-fd-primary/25' },
  eng: { label: 'Eng', className: 'bg-fd-muted text-fd-foreground ring-fd-border' },
};

function Pill({ lane }: { lane: Lane }) {
  const l = LANE[lane];
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold tracking-wide ring-1 ring-inset ${l.className}`}>
      {l.label}
    </span>
  );
}

function Cmd({ children }: { children: React.ReactNode }) {
  return (
    <pre className="mt-2 overflow-x-auto rounded-lg border border-fd-border bg-fd-muted/60 px-3 py-2 font-mono text-xs leading-relaxed">
      <code>{children}</code>
    </pre>
  );
}

function Step({
  n,
  lane,
  title,
  children,
  last,
}: {
  n: number;
  lane: Lane;
  title: string;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <li className="relative flex gap-4 pb-6 last:pb-0">
      {/* the rail */}
      {!last ? <span aria-hidden className="absolute start-3.75 top-9 bottom-0 w-px bg-fd-border" /> : null}
      <span
        aria-hidden
        className="z-10 flex size-8 shrink-0 items-center justify-center rounded-full border border-fd-border bg-fd-background font-mono text-sm font-semibold"
      >
        {n}
      </span>
      <div className="min-w-0 flex-1 pt-0.5">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-sm font-semibold">{title}</h3>
          <Pill lane={lane} />
        </div>
        <div className="mt-1.5 space-y-1.5 text-sm leading-relaxed text-fd-muted-foreground">{children}</div>
      </div>
    </li>
  );
}

const M = ({ children }: { children: React.ReactNode }) => (
  /* wrap-anywhere: these carry file paths and token names, unbreakable runs
     wider than a 360px viewport. Breaking them also drops the min-content of
     any grid or flex item they sit in. */
  <span className="font-mono text-fd-foreground wrap-anywhere">{children}</span>
);

export function BrandFlow() {
  return (
    <div className="p-4 sm:p-6">
      <p className="mb-6 max-w-2xl text-sm leading-relaxed text-fd-muted-foreground">
        A brand is five choices in one file. Everything else — the ramps, the on-colours, the CSS, the
        Figma variables — is generated from it, so these steps are the whole job.
      </p>
      <p className="-mt-4 mb-6 max-w-2xl text-sm leading-relaxed text-fd-muted-foreground">
        The same process with every command, the product setup and what to check when it looks wrong:{' '}
        <a href="/docs/get-started/new-brand" className="font-medium text-fd-primary underline underline-offset-4">
          Create a brand and apply Picasso
        </a>
        .
      </p>

      <ol className="max-w-2xl">
        <Step n={1} lane="design" title="Pick the five choices">
          <p>
            One brand colour, a neutral, a radius, a spacing and a type pair. Make them above and watch
            them on real components, in light and dark, before anyone writes anything down.
          </p>
          <p>
            Download <M>brand.json</M> from the tab beside this one.
          </p>
        </Step>

        <Step n={2} lane="eng" title="Create the brand file">
          <p>
            Save that download to <M>packages/tokens/tokens/brands/&lt;id&gt;/brand.json</M> — or generate
            the same file from the command line:
          </p>
          <Cmd>
            {'npm run brand:new -- <id> --base "#RRGGBB" \\\n  --name "<Name>" --neutral cool --radius default \\\n  --spacing default --sans Inter --mono "JetBrains Mono"'}
          </Cmd>
          <p>
            It refuses an id that already exists and a base that is not a hex colour, so it cannot quietly
            overwrite a brand.
          </p>
        </Step>

        <Step n={3} lane="eng" title="Build it, and prove it">
          <Cmd>{'cd packages/tokens && npm run check'}</Cmd>
          <p>
            Generates <M>dist/tokens.css</M> and <M>dist/figma.json</M>, then checks the things that break
            silently: light and dark defining the same tokens, the new brand&apos;s structure matching
            Clarion&apos;s, shared primitives agreeing across brands, on-colours agreeing with contrast
            measurement, and the radius multipliers in <M>theme.css</M> not having drifted from{' '}
            <M>core.json</M>.
          </p>
        </Step>

        <li className="relative flex gap-4 pb-6">
          <span aria-hidden className="absolute start-3.75 top-9 bottom-0 w-px bg-fd-border" />
          <span
            aria-hidden
            className="z-10 flex size-8 shrink-0 rotate-45 items-center justify-center rounded-md border border-fd-primary/50 bg-fd-background"
          >
            <AlertTriangle className="size-3.5 -rotate-45 text-fd-primary" />
          </span>
          <div className="min-w-0 flex-1 pt-0.5">
            <h3 className="text-sm font-semibold">Does check pass?</h3>
            <div className="mt-1.5 space-y-1.5 text-sm leading-relaxed text-fd-muted-foreground">
              <p>
                <strong className="font-semibold text-fd-foreground">A light brand colour is not a failure.</strong>{' '}
                <M>fg/on/*</M> is measured, not chosen: white where white reaches 4.5:1,{' '}
                <M>palette/neutral/950</M> where it does not. A yellow gets dark ink at 13.69:1 and the
                button is still a button. Nothing to fix.
              </p>
              <p className="flex items-start gap-1.5">
                <ArrowLeft className="mt-0.5 size-3.5 shrink-0" aria-hidden />
                <span>
                  <strong className="font-semibold text-fd-foreground">What does send you back:</strong>{' '}
                  &quot;matches no preset&quot; — the neutral, radius or spacing is not one of the options,
                  so add it to <M>presets.json</M> first. Light and dark not defining the same tokens. A
                  structure that differs from Clarion&apos;s. Then run <M>check</M> again.
                </span>
              </p>
              <p>
                <strong className="font-semibold text-fd-foreground">Yes</strong> — carry on.
              </p>
            </div>
          </div>
        </li>

        <Step n={4} lane="eng" title="Run the contrast tests">
          <Cmd>{'npm test --workspace @ir/ui'}</Cmd>
          <p>
            Every on-colour pair, in both modes, for every brand, at 4.5:1 — and the focus ring at 3:1,
            because a focus indicator is a UI component rather than text.
          </p>
          <p>
            This is the gate that catches the one colour problem worth catching: a surface that{' '}
            <em>neither</em> ink reaches — white under 4.5:1 and <M>neutral/950</M> under 4.5:1 too. That
            colour has to move. Everything else the build resolves on its own.
          </p>
        </Step>

        <Step n={5} lane="design" title="Sync it into Figma">
          <p>
            In the Figma <strong className="font-semibold text-fd-foreground">desktop app</strong> — the
            browser cannot load local plugins — run Plugins → Development → Picasso Sync and choose{' '}
            <M>packages/tokens/dist/figma.json</M>.
          </p>
          <p>
            Press <strong className="font-semibold text-fd-foreground">Check</strong> first: it lists every
            difference and changes nothing. Then <strong className="font-semibold text-fd-foreground">Sync</strong>.
          </p>
          <p>
            The brand arrives as a new mode of the <M>Primitives</M> collection. No component or layer is
            touched — they already point at the variables.
          </p>
        </Step>

        <Step n={6} lane="design" title="Look at it, then publish">
          <p>
            Set any frame&apos;s Primitives mode to the new brand; Light and Dark stay independent, so any
            frame can be any brand in either mode. The <em>Brand modes (demo)</em> page shows the
            combinations side by side.
          </p>
          <p>Publish Picasso as usual — Sync does not publish.</p>
        </Step>

        <Step n={7} lane="eng" title="Record it, and give it a version">
          <p>
            Add the brand under <strong className="font-semibold text-fd-foreground">Added</strong> in{' '}
            <M>CHANGELOG.md</M> with its Figma impact (&quot;new Primitives mode, synced&quot;). A brand is
            additive, so it is a minor version — but a product cannot install it until there is one.
          </p>
        </Step>

        <Step n={8} lane="eng" title="Switch a product onto it" last>
          <Cmd>{'<html data-brand="<id>" class="dark">'}</Cmd>
          <p>
            <strong className="font-semibold text-fd-foreground">On <M>&lt;html&gt;</M>, not on a wrapper.</strong>{' '}
            Semantics are declared on <M>:root</M>, so a <M>data-brand</M> further down changes the raw brand
            colours inside it but not the semantics components actually use. One product, one brand, set at
            the top. Dark mode is a separate switch.
          </p>
          <p>
            Then: the four CSS imports in order, plus <M>@source</M> for <M>@ir/ui</M>; the brand&apos;s fonts
            loaded in the product; and any product that keeps its own copy of <M>tokens.css</M> re-copied.
            Every component, chart and illustration follows — nothing in the product names the brand.
          </p>
        </Step>
      </ol>

      <section className="mt-8 max-w-2xl rounded-xl border border-fd-border bg-fd-muted/40 p-4">
        <h3 className="text-sm font-semibold">Changing a brand later, from Figma</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-fd-muted-foreground">
          A change can start in Figma, but it only counts once it is back in the repo — otherwise the next
          Sync overwrites it. Picasso Sync → <strong className="font-semibold text-fd-foreground">Export a brand</strong>, then:
        </p>
        <Cmd>{'npm run figma:import -- ~/Downloads/<brand>.figma-export.json --dry-run'}</Cmd>
        <p className="mt-2 text-sm leading-relaxed text-fd-muted-foreground">
          Drop <M>--dry-run</M> to write, review the <M>git diff</M>, then <M>npm run check</M>. The import
          writes nothing at all when a change breaks the model — a single radius step edited instead of the
          base, an axis matching no preset, or an <M>fg/on/*-emphasis</M> edited by hand when it is
          measured.
        </p>
      </section>
    </div>
  );
}
