import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import * as React from "react";
import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import doc from "./motion-before-and-after.json";
import * as stories from "./motion-before-and-after.stories";

/**
 * Motion, before and after, is one thing written in four places: the pairs
 * (JSON), the examples (stories), the wrong animations (a Storybook-only
 * stylesheet) and the page that explains them (docs). Four copies of one
 * fact get a gate, or the page ends up describing an example that has since
 * changed.
 */
const root = resolve(__dirname, "../../../..");
const page = readFileSync(
  resolve(root, "docs/foundations/motion-before-and-after.md"),
  "utf8",
);
const specimens = readFileSync(
  resolve(root, "packages/ui/.storybook/motion-specimens.css"),
  "utf8",
);
const theme = readFileSync(resolve(root, "packages/tokens/theme.css"), "utf8");
const source = readFileSync(
  resolve(__dirname, "motion-before-and-after.stories.tsx"),
  "utf8",
);

const PREFIX = "foundations-motion-before-and-after--";

/** Storybook's own export-name-to-id: DataDoesNotMove → data-does-not-move. */
const idOf = (name: string) =>
  name
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
    .toLowerCase();

type Rendered = { render: () => React.ReactElement };
const exported = Object.entries(stories).filter(
  ([name]) => name !== "default",
) as [string, Rendered][];

describe("the pairs and their stories", () => {
  it("has one story per pair, named for it, in the same order", () => {
    expect(exported.map(([name]) => idOf(name))).toEqual(
      doc.pairs.map((p) => p.id),
    );
  });

  it.each(exported)("%s takes its words from the pair", (name, story) => {
    const p = doc.pairs.find((x) => x.id === idOf(name))!;
    render(story.render());
    expect(screen.getByText(new RegExp(escape(p.dont)))).toBeInTheDocument();
    expect(screen.getByText(new RegExp(escape(p.do)))).toBeInTheDocument();
    expect(screen.getByText(p.why)).toBeInTheDocument();
    expect(screen.getByText(p.dontValue)).toBeInTheDocument();
    expect(screen.getByText(p.doValue)).toBeInTheDocument();
  });

  it("plays both sides from one button, and the right side is the real animation", async () => {
    const user = userEvent.setup();
    render(stories.NothingStartsSlowly.render!({}, {} as never));
    const dont = document.querySelector<HTMLElement>(
      '[data-slot="guidance-dont"]',
    )!;
    const good = document.querySelector<HTMLElement>(
      '[data-slot="guidance-do"]',
    )!;
    expect(dont.querySelector("[data-state]")).toBeNull();

    await user.click(screen.getByRole("button", { name: "Open both" }));
    expect(dont.querySelector("[data-state]")).toHaveAttribute(
      "data-specimen",
      "ease-in-close",
    );
    const real = good.querySelector("[data-state]")!;
    expect(real).not.toHaveAttribute("data-specimen");
    expect(real).toHaveClass(
      "data-[state=open]:animate-dialog-in",
      "data-[state=closed]:animate-dialog-out",
    );

    // jsdom runs no animation, so there is nothing to wait for: both go.
    await user.click(screen.getByRole("button", { name: "Close both" }));
    expect(dont.querySelector("[data-state]")).toBeNull();
    expect(within(good).queryByText("Delete endpoint")).toBeNull();
  });

  it("slows both sides with one switch", async () => {
    const user = userEvent.setup();
    render(stories.NothingStartsSlowly.render!({}, {} as never));
    const pair = document.querySelector('[data-slot="motion-pair"]')!;
    expect(pair).not.toHaveAttribute("data-motion-speed");
    await user.click(screen.getByRole("switch", { name: /Slow motion/ }));
    expect(pair).toHaveAttribute("data-motion-speed", "slow");
  });
});

describe("the specimens", () => {
  const used = [...source.matchAll(/specimen="([a-z-]+)"/g)].map((m) => m[1]);

  it("are attribute rules, so no component can reach for one as a class", () => {
    const selectors = [...specimens.matchAll(/^([^\s@/}][^{]*)\{/gm)]
      .map((m) => m[1].trim())
      .filter((s) => !/^(from|to|\d+%)/.test(s));
    expect(selectors.length).toBeGreaterThan(10);
    for (const selector of selectors) expect(selector).not.toMatch(/\./);
  });

  it("exist for every specimen a story uses — except the one that is nothing", () => {
    expect(used.length).toBeGreaterThan(6);
    for (const name of new Set(used)) {
      const has = specimens.includes(`[data-specimen="${name}"]`);
      // "reduced-none" is the absence of animation; a rule would be a bug.
      const mention = specimens.match(
        new RegExp(`^\\s*\\[data-specimen="${name}"\\]`, "m"),
      );
      if (name === "reduced-none") expect(mention).toBeNull();
      else expect(has, name).toBe(true);
    }
  });

  it("never reach the package: theme.css knows nothing about them", () => {
    expect(theme).not.toMatch(/specimen/);
  });

  it("repeat the real reduced-motion branch exactly", () => {
    const flat = (s: string) => s.replace(/\s+/g, " ");
    const branch = (utility: string) =>
      flat(theme).match(
        new RegExp(
          `@utility ${utility} \\{[^@]*@media \\(prefers-reduced-motion: reduce\\) \\{ (animation: [^;]+;)`,
        ),
      )![1];
    expect(flat(specimens)).toContain(
      `[data-specimen="reduced-fade"][data-state="open"] { ${branch("animate-drawer-in-end")}`,
    );
    expect(flat(specimens)).toContain(
      `[data-specimen="reduced-fade"][data-state="closed"] { ${branch("animate-drawer-out-end")}`,
    );
  });

  it("stay still when the reader has asked for reduced motion", () => {
    expect(specimens.replace(/\s+/g, " ")).toMatch(
      /@media \(prefers-reduced-motion: reduce\) \{ \[data-specimen\]:not\(\[data-specimen="reduced-fade"\]\)/,
    );
  });
});

describe("the docs page", () => {
  it.each(doc.pairs)("embeds $id and states both of its values", (p) => {
    expect(page).toContain(`<Story id="${PREFIX}${p.id}"`);
    expect(page).toContain(`\`${p.dontValue}\``);
    expect(page).toContain(`\`${p.doValue}\``);
  });

  it("has a section for every pair, and no others", () => {
    const embedded = [...page.matchAll(/<Story id="([^"]+)"/g)].map((m) =>
      m[1].replace(PREFIX, ""),
    );
    expect(embedded).toEqual(doc.pairs.map((p) => p.id));
  });

  it("gives every embed a title, since a frame without one has no name", () => {
    for (const tag of page.match(/<Story [^>]*>/g)!)
      expect(tag).toMatch(/ title="[^"]{20,}"/);
  });
});

function escape(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
