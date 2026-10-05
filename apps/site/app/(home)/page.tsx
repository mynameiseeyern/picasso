import Link from 'next/link';
import { ArrowRight, Blocks, BookOpenText, Bot, GitBranch, GitCommitHorizontal, Palette, PenLine, Ruler } from 'lucide-react';
import { componentsRoute, docsRoute } from '@/lib/shared';

/* The landing page is an IR brand piece (design.md §9.3 web pattern), not a
 * Picasso product screen — so it uses the brand palette and fonts, alternates
 * light and dark bands, and puts the primary lockup where the brand first
 * appears. Spelling: Australian. */

const sections = [
  {
    icon: Ruler,
    title: 'Foundations',
    body: 'Grid, spacing, radius, typography and colour. The decisions every component inherits.',
    href: `${docsRoute}/foundations`,
  },
  {
    icon: PenLine,
    title: 'Content',
    body: 'Voice, casing, errors, empty states, numbers and terminology. The words are part of the system.',
    href: `${docsRoute}/content`,
  },
  {
    icon: Blocks,
    title: 'Components',
    body: 'Live, themeable React components with every variant and state, and the Do/Don’t guidance beside them.',
    href: componentsRoute,
  },
  {
    icon: Palette,
    title: 'Theming',
    body: 'Five independent axes and dark mode compose by cascade. Clarion and Prognosis are the same components, differently dialled.',
    href: `${docsRoute}/foundations/colour`,
  },
  {
    icon: GitBranch,
    title: 'Contributing',
    body: 'How to add a component, and what “done” means before it ships to Figma, npm and the docs together.',
    href: `${docsRoute}/contributing`,
  },
  {
    icon: BookOpenText,
    title: 'Releases',
    body: 'One version number across Figma, @ir/tokens and @ir/ui, with a Figma impact line on every change.',
    href: `${docsRoute}/releases`,
  },
];

const stats = [
  { figure: '132', label: 'semantic tokens, each resolved for light and dark' },
  { figure: '5 × 2', label: 'theme axes and modes, composed by cascade' },
  { figure: '44', label: 'components documented, landing in code one PR at a time' },
  { figure: '1', label: 'source of truth — the repo. Figma is a consumer.' },
];

export default function HomePage() {
  return (
    <main className="flex flex-col">
      {/* Hero — dark band, primary lockup top-left (brand §8), Oswald caps with
          one Corporate Blue accent keyword (allowed on dark, §6.4). */}
      <section className="ir-dark bg-ir-rich-grey text-white">
        <div className="mx-auto w-full max-w-6xl px-6 pt-14 pb-20 md:pt-20 md:pb-28">
          <img src="/brand/ir-lockup-dark.svg" alt="Integrated Research" className="h-9 w-auto mb-14 md:mb-20" />
          <span className="ir-pill border border-white/20 text-ir-corporate-blue">Design system</span>
          <h1 className="ir-display mt-6 text-display-hero leading-none sm:text-6xl md:text-7xl lg:text-8xl max-w-5xl">
            One system.
            <br />
            <span className="text-ir-corporate-blue">Every IR product.</span>
          </h1>
          <p className="mt-8 max-w-2xl text-lg md:text-xl font-light text-white/80 leading-relaxed">
            Picasso is the design system behind Integrated Research’s products. Tokens, components, foundations and
            content guidance, written once and rendered everywhere — in Figma, in code and in the docs you are
            reading now.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href={`${docsRoute}/get-started`}
              className="inline-flex items-center gap-2 rounded-full bg-ir-corporate-blue px-6 py-3 text-sm font-semibold text-ir-rich-grey hover:bg-white transition-colors"
            >
              Get started <ArrowRight className="size-4" aria-hidden />
            </Link>
            <Link
              href={componentsRoute}
              className="inline-flex items-center gap-2 rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white hover:border-white hover:bg-white/5 transition-colors"
            >
              Browse components
            </Link>
          </div>
        </div>
      </section>

      {/* Stats — Ink band, big Corporate Blue figures (brand §9.1 Stats). */}
      <section className="ir-dark bg-ir-ink text-white">
        <div className="mx-auto w-full max-w-6xl px-6 py-14 md:py-16 grid grid-cols-2 gap-x-8 gap-y-10 md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.figure}>
              <div className="text-4xl md:text-5xl font-semibold text-ir-corporate-blue tabular-nums tracking-tight">
                {s.figure}
              </div>
              <p className="mt-3 text-sm text-white/75 leading-snug max-w-64">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Two doors — light split (Panel Grey | White), brand §8. */}
      <section className="grid md:grid-cols-2">
        <div className="min-w-0 bg-ir-panel-grey text-ir-rich-grey">
          <div className="mx-auto max-w-xl px-6 py-16 md:py-20 md:ms-auto md:me-0 md:pe-12">
            <span className="ir-pill bg-white text-ir-purple">For designers</span>
            <h2 className="ir-display mt-5 text-4xl md:text-5xl">Start in Figma</h2>
            <p className="mt-5 text-ir-text-grey leading-relaxed">
              The Picasso library carries the foundations, the 44 documented components and the tokens as
              variables. It is authoritative for which variants and states exist, and a mirror of the repo for
              everything else — the page says so.
            </p>
            <Link
              href={`${docsRoute}/get-started/designers`}
              className="mt-8 inline-flex items-center gap-2 font-semibold text-ir-purple hover:underline"
            >
              The designer’s path <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
        </div>
        <div className="min-w-0 bg-white text-ir-rich-grey">
          <div className="mx-auto max-w-xl px-6 py-16 md:py-20 md:me-auto md:ms-0 md:ps-12">
            <span className="ir-pill bg-ir-panel-grey text-ir-purple">For engineers</span>
            <h2 className="ir-display mt-5 text-4xl md:text-5xl">Install and theme</h2>
            <p className="mt-5 text-ir-text-grey leading-relaxed">
              <code className="font-mono text-inline-code">@ir/tokens</code> and{' '}
              <code className="font-mono text-inline-code">@ir/ui</code> on Tailwind v4 and Radix. Semantic utilities
              only, never a raw value — and a linter that holds the line.
            </p>
            <pre className="mt-6 rounded-lg bg-ir-rich-grey text-white text-sm p-4 overflow-x-auto">
              <code>{`<html data-brand="clarion" data-radius="sharp" class="dark">`}</code>
            </pre>
            <Link
              href={`${docsRoute}/get-started/engineers`}
              className="mt-8 inline-flex items-center gap-2 font-semibold text-ir-purple hover:underline"
            >
              The engineer’s path <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
        </div>
      </section>

      {/* What's in the system — white content page, icon top-right (brand §8). */}
      <section className="bg-white text-ir-rich-grey">
        <div className="mx-auto w-full max-w-6xl px-6 py-16 md:py-24">
          <div className="flex items-start justify-between gap-6">
            <div>
              <span className="ir-pill bg-ir-panel-grey text-ir-purple">What’s in the system</span>
              <h2 className="ir-display mt-5 text-4xl md:text-5xl max-w-3xl">
                Organised around the work, not the package
              </h2>
              <p className="mt-5 max-w-2xl text-ir-text-grey leading-relaxed">
                A PM can read the content guide and a designer can read foundations without touching a component
                API. Engineers get the same rules as code.
              </p>
            </div>
            <img src="/brand/ir-icon-light.svg" alt="" className="hidden md:block h-10 w-10 shrink-0 mt-1" />
          </div>
          <ul className="mt-12 grid gap-px bg-ir-line-grey sm:grid-cols-2 lg:grid-cols-3 border border-ir-line-grey">
            {sections.map(({ icon: Icon, title, body, href }) => (
              <li key={title} className="bg-white">
                <Link href={href} className="group flex h-full flex-col p-7 hover:bg-ir-panel-grey/60 transition-colors">
                  <Icon className="size-6 text-ir-secondary-blue" aria-hidden strokeWidth={1.75} />
                  <h3 className="mt-5 text-lg font-semibold">{title}</h3>
                  <p className="mt-2 text-sm text-ir-text-grey leading-relaxed flex-1">{body}</p>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-ir-purple">
                    Open <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Agents — dark statement band (brand §9.1 Statement). */}
      <section className="ir-dark bg-ir-rich-grey text-white">
        <div className="mx-auto w-full max-w-6xl px-6 py-16 md:py-24 grid gap-12 lg:grid-cols-split-emphasis lg:items-center">
          <div>
            <span className="ir-pill border border-white/20 text-ir-corporate-blue">
              <Bot className="size-3.5" aria-hidden /> UI for agents
            </span>
            <h2 className="ir-display mt-5 text-4xl md:text-5xl">
              An agent with the <span className="text-ir-corporate-blue">token table</span> cannot invent a hex code
            </h2>
            <p className="mt-5 text-white/80 leading-relaxed max-w-xl">
              Every page here is also served as Markdown, and the whole system is published as a set of{' '}
              <code className="font-mono text-inline-code">llms*.txt</code> files — including every semantic token
              resolved to its light and dark value. Point your assistant at it and it writes on-system code.
            </p>
          </div>
          <div className="rounded-xl border border-white/15 bg-ir-ink p-5 text-sm font-mono leading-relaxed overflow-x-auto">
            <div className="text-white/50"># Claude Code, Cursor, Windsurf — any assistant that takes a URL</div>
            <div className="mt-2 text-ir-corporate-blue">Use Picasso design system documentation from</div>
            <div className="text-white">https://ir-picasso.vercel.app/llms.txt</div>
            <div className="mt-4 text-white/50"># The file set</div>
            {['llms.txt', 'llms-full.txt', 'llms-foundations.txt', 'llms-components.txt', 'llms-tokens.txt'].map((f) => (
              <div key={f}>
                <a href={`/${f}`} className="text-white hover:text-ir-corporate-blue">
                  /{f}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Direction of truth — white closing statement. */}
      <section className="bg-white text-ir-rich-grey">
        <div className="mx-auto w-full max-w-6xl px-6 py-16 md:py-24">
          <div className="grid gap-10 md:grid-cols-icon-text md:items-start">
            <GitCommitHorizontal className="size-8 text-ir-red" aria-hidden strokeWidth={1.5} />
            <div>
              <h2 className="ir-display text-4xl md:text-5xl max-w-3xl">The repo is the source of truth</h2>
              <p className="mt-5 max-w-2xl text-ir-text-grey leading-relaxed">
                Figma is a consumer: it receives tokens and is reconciled to match the code. Every rule lives in
                exactly one place — this folder of docs, or the guidance beside each component — and the site,
                Storybook, the agent files and the Figma foundations pages are all renderings of it. If you find a
                rule stated twice, one of them is wrong.
              </p>
              <Link
                href={`${docsRoute}`}
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-ir-rich-grey px-6 py-3 text-sm font-semibold text-white hover:bg-ir-purple transition-colors"
              >
                Read the documentation <ArrowRight className="size-4" aria-hidden />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer — hairline rule, label left, links right (brand §8). */}
      <footer className="bg-white text-ir-text-grey">
        <div className="mx-auto w-full max-w-6xl px-6">
          <div className="ir-hairline flex flex-wrap items-center justify-between gap-4 py-6 text-xs">
            <span>IR | Picasso design system</span>
            <span className="flex gap-5">
              <Link href={docsRoute} className="hover:text-ir-rich-grey">Docs</Link>
              <Link href={componentsRoute} className="hover:text-ir-rich-grey">Components</Link>
              <a href="https://github.com/ee-ng-ir/picasso" className="hover:text-ir-rich-grey">GitHub</a>
            </span>
          </div>
        </div>
      </footer>
    </main>
  );
}
