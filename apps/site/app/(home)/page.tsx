import Link from "next/link";
import { componentsRoute, docsRoute } from "@/lib/shared";

/* The home page is an index, not a pitch.
 *
 * It was a marketing landing page — a display-type hero, a stats band, two
 * "doors" and four calls to action — and that is the wrong shape for the
 * audience. Nobody arrives here to be persuaded that IR has a design system;
 * they arrive to find a rule, a token or a component, usually having been
 * sent by a link. So the first screen is the table of contents, with the real
 * page names under each section rather than a sentence about them, which is
 * what design.atlassian.com and lightningdesignsystem.com both do.
 *
 * It stays an IR surface — the palette, the hairline rule and Oswald for
 * section headings — but the brand's marketing web pattern (alternating dark
 * bands, display hero, stats) is deliberately not used here. Spelling:
 * Australian.
 */

const start = [
  {
    title: "For designers",
    body: "The Figma library, what it is authoritative for, and what it mirrors from the repo.",
    href: `${docsRoute}/get-started/designers`,
  },
  {
    title: "For engineers",
    body: "Installing @ir/tokens and @ir/ui, the semantic utilities, and the linter that holds the line.",
    href: `${docsRoute}/get-started/engineers`,
  },
  {
    title: "Create a brand",
    body: "Making a brand and switching a product onto it, end to end.",
    href: `${docsRoute}/get-started/new-brand`,
  },
];

const sections = [
  {
    title: "Foundations",
    body: "The decisions every component inherits.",
    href: `${docsRoute}/foundations`,
    pages: [
      ["Tokens and brands", "tokens-and-brands"],
      ["Grid, spacing and radius", "grid-spacing-and-radius"],
      ["Responsive", "responsive"],
      ["Typography", "typography"],
      ["Colour", "colour"],
      ["Elevation", "elevation"],
      ["Motion", "motion"],
      ["Icons", "icons"],
      ["RTL", "rtl"],
      ["Accessibility", "accessibility"],
    ].map(([label, slug]) => ({
      label,
      href: `${docsRoute}/foundations/${slug}`,
    })),
  },
  {
    title: "Content",
    body: "The words are part of the system.",
    href: `${docsRoute}/content`,
    pages: [
      ["Principles and register", "principles-and-register"],
      ["Casing", "casing"],
      ["Buttons and labels", "buttons-and-labels"],
      ["Errors", "errors"],
      ["Empty and loading states", "empty-and-loading-states"],
      ["Numbers, units and time", "numbers-units-and-time"],
      ["Terminology", "terminology"],
    ].map(([label, slug]) => ({ label, href: `${docsRoute}/content/${slug}` })),
  },
  {
    title: "Contributing",
    body: "What “done” means before a change ships.",
    href: `${docsRoute}/contributing`,
    pages: [
      ["Adding a component", "adding-a-component"],
      ["Figma to code mapping", "figma-to-code-mapping"],
      ["Component checklist", "component-checklist"],
      ["Reporting off-system output", "reporting-off-system-output"],
    ].map(([label, slug]) => ({
      label,
      href: `${docsRoute}/contributing/${slug}`,
    })),
  },
];

const agentFiles = [
  ["llms.txt", "An index — one line per page, and a link to its Markdown."],
  ["llms-full.txt", "Everything, concatenated."],
  ["llms-foundations.txt", "The foundations only."],
  ["llms-components.txt", "The component guidance only."],
  ["llms-tokens.txt", "Every semantic token, resolved for light and dark."],
];

export default function HomePage() {
  return (
    <main className="bg-white text-ir-rich-grey">
      {/* Masthead — what this is, in two sentences. */}
      <header className="border-b border-ir-line-grey">
        <div className="mx-auto w-full max-w-6xl px-6 py-10 md:py-14">
          <img
            src="/brand/ir-icon-light.svg"
            alt="Integrated Research"
            className="h-8 w-8"
          />
          <h1 className="ir-display mt-6 text-3xl md:text-4xl">Picasso</h1>
          <p className="mt-4 max-w-2xl text-ir-text-grey leading-relaxed">
            The design system for Integrated Research’s products. Foundations,
            components and content guidance, written once and rendered in Figma,
            in code and on this site.
          </p>
          <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-4 text-sm">
            <div>
              <dt className="text-ir-text-grey">Packages</dt>
              <dd className="mt-1 font-mono text-inline-code">
                @ir/tokens · @ir/ui
              </dd>
            </div>
            <div>
              <dt className="text-ir-text-grey">Built on</dt>
              <dd className="mt-1">Tailwind v4, Radix, React 19</dd>
            </div>
            <div>
              <dt className="text-ir-text-grey">Brands</dt>
              <dd className="mt-1">Clarion, Vantage</dd>
            </div>
          </dl>
        </div>
      </header>

      {/* Start here — three paths, as links rather than doors. */}
      <section className="border-b border-ir-line-grey">
        <div className="mx-auto w-full max-w-6xl px-6 py-10 md:py-12">
          <h2 className="ir-display text-xl">Start here</h2>
          <ul className="mt-6 grid gap-x-10 gap-y-6 sm:grid-cols-3">
            {start.map(({ title, body, href }) => (
              <li key={title}>
                <Link
                  href={href}
                  className="font-semibold text-ir-purple hover:underline"
                >
                  {title}
                </Link>
                <p className="mt-1.5 text-sm text-ir-text-grey leading-relaxed">
                  {body}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Components — the thing most people came for, so it is first and it
          says how many there are rather than describing itself. */}
      <section className="border-b border-ir-line-grey">
        <div className="mx-auto w-full max-w-6xl px-6 py-10 md:py-12">
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <h2 className="ir-display text-xl">
              <Link href={componentsRoute} className="hover:text-ir-purple">
                Components
              </Link>
            </h2>
            <span className="text-sm text-ir-text-grey">
              58 in code, each with its variants, states and Do / Don’t guidance
            </span>
          </div>
          <p className="mt-4 max-w-2xl text-sm text-ir-text-grey leading-relaxed">
            Every component is live in Storybook with its real tokens,
            switchable by brand, mode, density and direction. The guidance sits
            beside it, not in a separate document.
          </p>
          <p className="mt-4 text-sm">
            <Link
              href={componentsRoute}
              className="font-semibold text-ir-purple hover:underline"
            >
              Browse the library
            </Link>
          </p>
        </div>
      </section>

      {/* The index — real page names, not blurbs about them. */}
      <section className="border-b border-ir-line-grey">
        <div className="mx-auto w-full max-w-6xl px-6 py-10 md:py-12">
          <div className="grid gap-10 md:grid-cols-3">
            {sections.map(({ title, body, href, pages }) => (
              <div key={title}>
                <h2 className="ir-display text-xl">
                  <Link href={href} className="hover:text-ir-purple">
                    {title}
                  </Link>
                </h2>
                <p className="mt-2 text-sm text-ir-text-grey">{body}</p>
                <ul className="mt-4 flex flex-col gap-2 text-sm">
                  {pages.map(({ label, href: pageHref }) => (
                    <li key={label}>
                      <Link
                        href={pageHref}
                        className="hover:text-ir-purple hover:underline"
                      >
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reference — the facts an engineer or an agent came for. */}
      <section className="border-b border-ir-line-grey">
        <div className="mx-auto w-full max-w-6xl px-6 py-10 md:py-12">
          <div className="grid gap-10 md:grid-cols-2">
            <div>
              <h2 className="ir-display text-xl">Theming</h2>
              <p className="mt-2 max-w-xl text-sm text-ir-text-grey leading-relaxed">
                Five axes — brand, neutral ramp, radius, typography and spacing
                — plus light and dark. They compose by cascade rather than being
                authored as separate themes: a theme axis overrides a primitive,
                and every semantic token aliases one.
              </p>
              <pre className="mt-5 overflow-x-auto rounded-lg bg-ir-rich-grey p-4 text-sm text-white">
                <code>{`<html
  data-brand="clarion"
  data-radius="sharp"
  class="dark"
>`}</code>
              </pre>
              <p className="mt-4 text-sm">
                <Link
                  href={`${docsRoute}/foundations/tokens-and-brands`}
                  className="font-semibold text-ir-purple hover:underline"
                >
                  Tokens and brands
                </Link>
              </p>
            </div>
            <div>
              <h2 className="ir-display text-xl">For agents</h2>
              <p className="mt-2 max-w-xl text-sm text-ir-text-grey leading-relaxed">
                Every page is served as Markdown, and the system is published as
                a set of text files. The token file is the useful one: an
                assistant without the resolved table invents hex codes, and one
                with it cannot.
              </p>
              <ul className="mt-5 flex flex-col gap-2 text-sm">
                {agentFiles.map(([file, note]) => (
                  <li
                    key={file}
                    className="flex flex-wrap items-baseline gap-x-3"
                  >
                    <a
                      href={`/${file}`}
                      className="font-mono text-inline-code text-ir-purple hover:underline"
                    >
                      /{file}
                    </a>
                    <span className="text-ir-text-grey">{note}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How it is kept true — one paragraph, no headline claim. */}
      <section>
        <div className="mx-auto w-full max-w-6xl px-6 py-10 md:py-12">
          <h2 className="ir-display text-xl">How it is kept true</h2>
          <div className="mt-4 grid gap-6 md:grid-cols-2">
            <p className="max-w-xl text-sm text-ir-text-grey leading-relaxed">
              The repo is the source of truth for tokens; Figma is authoritative
              for what a component does, and is reconciled to the code for
              everything else. Each rule lives in exactly one place — a page in
              these docs, or the guidance file beside a component — and the
              site, Storybook, the agent files and the Figma foundations pages
              are all renderings of it. A rule stated twice is a rule that will
              drift.
            </p>
            <p className="max-w-xl text-sm text-ir-text-grey leading-relaxed">
              Figma,{" "}
              <code className="font-mono text-inline-code">@ir/tokens</code> and{" "}
              <code className="font-mono text-inline-code">@ir/ui</code> share
              one version number and are published together, so a release note
              describes all three. Every entry carries a Figma impact line,
              because the question a designer asks of a release — what happens
              to my file when I accept the update — is not the one a changelog
              usually answers.
            </p>
          </div>
          <p className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <Link
              href={docsRoute}
              className="font-semibold text-ir-purple hover:underline"
            >
              All documentation
            </Link>
            <Link
              href={`${docsRoute}/releases`}
              className="font-semibold text-ir-purple hover:underline"
            >
              Releases
            </Link>
          </p>
        </div>
      </section>

      <footer className="text-ir-text-grey">
        <div className="mx-auto w-full max-w-6xl px-6">
          <div className="ir-hairline flex flex-wrap items-center justify-between gap-4 py-6 text-xs">
            <span>IR | Picasso design system</span>
            <span className="flex gap-5">
              <Link href={docsRoute} className="hover:text-ir-rich-grey">
                Docs
              </Link>
              <Link href={componentsRoute} className="hover:text-ir-rich-grey">
                Components
              </Link>
              <a
                href="https://github.com/ee-ng-ir/picasso"
                className="hover:text-ir-rich-grey"
              >
                GitHub
              </a>
            </span>
          </div>
        </div>
      </footer>
    </main>
  );
}
