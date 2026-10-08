import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";

/**
 * Foundations / Typography — the three families, the five roles and the three
 * weight tiers, rendered rather than described.
 *
 * It exists because of a bug a prose doc could not have caught: every
 * `text-*` step was frozen to Inter regardless of brand, because a `var()`
 * inside a `:root` custom property is substituted where it is DECLARED. The
 * step computed to Inter on `:root` and inherited as Inter, so no amount of
 * `[data-brand]` below it could move the family. Nothing on screen said so —
 * the type simply never changed. The Brand row below is the check: switch the
 * brand in the toolbar and the families must follow.
 */
const meta: Meta = {
  title: "Foundations/Typography",
  parameters: { layout: "fullscreen", controls: { disable: true } },
};
export default meta;

type Story = StoryObj;

function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mt-10 mb-3 text-heading-lg text-content-neutral-emphasis">
      {children}
    </h2>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-4 max-w-prose text-body-md text-content-neutral-muted">
      {children}
    </p>
  );
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded-sm bg-surface-neutral-subtle px-1 text-code-sm text-content-neutral-emphasis">
      {children}
    </code>
  );
}

/** One step, with the class that produces it and its live computed family. */
function Step({ cls, note }: { cls: string; note?: string }) {
  const ref = React.useRef<HTMLParagraphElement>(null);
  const [computed, setComputed] = React.useState("");
  React.useEffect(() => {
    if (!ref.current) return;
    const s = getComputedStyle(ref.current);
    // The first family is the one that matters; the rest is the fallback stack.
    setComputed(
      `${s.fontFamily.split(",")[0].replace(/["']/g, "")} · ${s.fontSize} / ${s.lineHeight} · ${s.fontWeight}`,
    );
  }, []);
  return (
    <div className="flex flex-col gap-1 border-b border-line-neutral-muted py-3 @3xl:flex-row @3xl:gap-6">
      <div className="flex flex-col gap-0.5 @3xl:w-64 @3xl:shrink-0">
        <Code>{cls}</Code>
        <span className="text-code-sm text-content-neutral-subtle">
          {computed}
        </span>
        {note ? (
          <span className="text-body-sm text-content-neutral-subtle">{note}</span>
        ) : null}
      </div>
      <p ref={ref} className={`${cls} text-content-neutral-emphasis`}>
        Packet loss on trunk 14
      </p>
    </div>
  );
}

const HEADINGS = [
  ["text-heading-display", "36px. Marketing and the empty-state hero. Once per screen at most."],
  ["text-heading-xl", ""],
  ["text-heading-lg", ""],
  ["text-heading-md", ""],
  ["text-heading-sm", ""],
  ["text-heading-xs", "16px — the same size as body-lg. Weight is what separates them."],
] as const;

const BODY = [
  ["text-body-lg", "16px — the same size as heading-xs."],
  ["text-body-md", "14px. The default, not Tailwind's 16."],
  ["text-body-sm", ""],
] as const;

const MONO = [
  ["text-code-md", "JetBrains Mono. SIP traces, log payloads, config."],
  ["text-metric-lg", "100% leading — a number is a shape, not a line of prose."],
] as const;

export const Families: Story = {
  render: () => (
    <div className="@container p-8">
      <h1 className="text-heading-xl text-content-neutral-emphasis">
        Three families
      </h1>
      <P>
        Inter for everything, JetBrains Mono for <Code>code</Code> and{" "}
        <Code>metric</Code>, and Oswald for the wordmark. All three carry full
        fallback stacks, Noto Sans Arabic and Hebrew among them.
      </P>
      <P>
        The display family is the wordmark&rsquo;s alone. It is{" "}
        <strong>not</strong> <Code>heading/display</Code>, which is the 36px
        step of the Inter ramp — the two share a word and nothing else, and the
        pair below is here to make that impossible to confuse.
      </P>
      <Step cls="text-wordmark" note="type/family/display — Oswald" />
      <Step cls="text-heading-display" note="type/family/sans — Inter, at 36px" />
      <Step cls="text-code-md" note="type/family/mono — JetBrains Mono" />
    </div>
  ),
};

export const Headings: Story = {
  render: () => (
    <div className="@container p-8">
      <h1 className="text-heading-xl text-content-neutral-emphasis">Headings</h1>
      <P>Semi Bold 600 at every step. Dark mode thins type, and this is a
      product people run dark during incidents — Medium goes soft where Semi
      Bold holds.</P>
      {HEADINGS.map(([cls, note]) => (
        <Step key={cls} cls={cls} note={note || undefined} />
      ))}
    </div>
  ),
};

export const BodyAndMono: Story = {
  render: () => (
    <div className="@container p-8">
      <h1 className="text-heading-xl text-content-neutral-emphasis">
        Body and mono
      </h1>
      <P>
        <Code>text-md</Code> is 14px, not Tailwind&rsquo;s 16px{" "}
        <Code>text-base</Code>. There is one vocabulary.
      </P>
      {BODY.map(([cls, note]) => (
        <Step key={cls} cls={cls} note={note || undefined} />
      ))}
      {MONO.map(([cls, note]) => (
        <Step key={cls} cls={cls} note={note || undefined} />
      ))}
    </div>
  ),
};

/**
 * The regression guard. Switch brand in the toolbar: every family below must
 * change with it. If they all stay Inter, the indirection has collapsed back
 * into `:root` and the composite steps are brand-frozen again.
 */
export const FollowsTheBrand: Story = {
  render: () => (
    <div className="@container p-8">
      <h1 className="text-heading-xl text-content-neutral-emphasis">
        Follows the brand
      </h1>
      <P>
        Each row prints the family it actually computed to. Switch the brand in
        the toolbar — they must change. The indirection has to live in the
        utility, as <Code>var(--text-body-md-font-family, var(--type-family-sans))</Code>,
        because a <Code>var()</Code> inside a <Code>:root</Code> custom property
        resolves where it is declared and can never follow a{" "}
        <Code>[data-brand]</Code> below it.
      </P>
      <Step cls="text-wordmark" note="display" />
      <Step cls="text-heading-lg" note="sans" />
      <Step cls="text-body-md" note="sans" />
      <Step cls="text-code-md" note="mono" />
      <Step cls="text-metric-lg" note="mono" />
    </div>
  ),
};
