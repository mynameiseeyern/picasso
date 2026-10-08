import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";

/**
 * Foundations / Colour — the two chart palettes side by side, rendered rather
 * than described, with every swatch printing the colour it actually computed
 * to in this mode and this brand.
 *
 * It exists because both of this system's worst colour bugs were invisible on
 * screen. `chart/7` and `chart/8` were deleted from the tokens while swatches
 * stayed bound to them: Figma keeps a deleted variable resolvable, so the old
 * colour kept rendering and nothing looked wrong. And `chart/1` and `chart/4`
 * sat ΔE 4.3 apart — one line drawn twice — which reads as a palette until you
 * measure it. A page that prints the resolved value is the cheapest guard
 * against both.
 */
const meta: Meta = {
  title: "Foundations/Colour",
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

/** A swatch that reports the colour it resolved to, not the one we meant. */
function Swatch({ token, bg }: { token: string; bg: string }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [value, setValue] = React.useState("");
  React.useEffect(() => {
    if (ref.current) setValue(getComputedStyle(ref.current).backgroundColor);
  }, []);
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1">
      <div ref={ref} className={`h-12 rounded-sm ${bg}`} />
      <Code>{token}</Code>
      <span className="text-code-sm text-content-neutral-subtle">{value}</span>
    </div>
  );
}

const SERIES = [
  ["chart/1", "bg-chart-1"], ["chart/2", "bg-chart-2"], ["chart/3", "bg-chart-3"],
  ["chart/4", "bg-chart-4"], ["chart/5", "bg-chart-5"], ["chart/6", "bg-chart-6"],
] as const;

const SCALE = [
  ["scale/1", "bg-chart-scale-1"], ["scale/2", "bg-chart-scale-2"],
  ["scale/3", "bg-chart-scale-3"], ["scale/4", "bg-chart-scale-4"],
  ["scale/5", "bg-chart-scale-5"],
] as const;

/**
 * Identity. Six slots, a fixed order, and the order is the colourblind-safety
 * mechanism rather than a preference — so it never changes.
 */
export const ChartSeries: Story = {
  name: "Chart series",
  render: () => (
    <div className="p-8">
      <h1 className="text-heading-xl text-content-neutral-emphasis">
        Chart series — identity
      </h1>
      <P>
        Six slots, assigned in fixed order and never cycled. A seventh series
        folds into &ldquo;Other&rdquo; or becomes small multiples; it is never a
        generated hue. Eight were declared once and only three could be told
        apart.
      </P>
      <div className="flex gap-3">
        {SERIES.map(([t, bg]) => (
          <Swatch key={t} token={t} bg={bg} />
        ))}
      </div>
      <H2>What is deliberately not here</H2>
      <P>
        IR corporate blue sat 7° from brand blue — the same colour to anyone
        reading a chart — so it carries no series slot. It became the sequential
        scale instead. Teal cannot clear blue in both modes at once, and IR lime
        has no step inside the usable lightness band.
      </P>
    </div>
  ),
};

/**
 * Magnitude. One hue, five bands, ordered — and the two palettes never mix.
 */
export const ChartScale: Story = {
  name: "Chart scale",
  render: () => (
    <div className="p-8">
      <h1 className="text-heading-xl text-content-neutral-emphasis">
        Chart scale — magnitude
      </h1>
      <P>
        One hue, five bands, low to high. The categorical slots above are chosen
        to be maximally <em>unlike</em> each other, which is the opposite of what
        an ordered scale needs, so the two never mix.
      </P>
      <div className="flex gap-3">
        {SCALE.map(([t, bg]) => (
          <Swatch key={t} token={t} bg={bg} />
        ))}
      </div>
      <H2>It is not a flipped light scale</H2>
      <P>
        Switch the theme and watch the order reverse. Light runs light to dark;
        dark runs dark to light, because nothing can sit below the surface it is
        drawn on. A scale inverted from the light one would put the loudest
        cells nearest the background and the calmest ones shouting.
      </P>
      <H2>No data is not the lowest band</H2>
      <P>
        A cell with nothing in it is outlined and empty. &ldquo;Fine&rdquo; and
        &ldquo;we don&rsquo;t know&rdquo; are different answers, and only one of
        them is safe to ignore.
      </P>
      <div className="flex items-center gap-0.5">
        <span className="h-12 w-16 rounded-sm bg-chart-scale-2" />
        <span className="h-12 w-16 rounded-sm border border-dashed border-line-neutral-muted" />
        <span className="h-12 w-16 rounded-sm bg-chart-scale-4" />
      </div>
    </div>
  ),
};

/**
 * Narrow — 328, a 360 phone minus its gutters. Swatch rows have to wrap rather
 * than shrink each swatch below the size at which its colour can be judged.
 */
export const Narrow: Story = {
  render: () => (
    <div className="p-4">
      <div className="w-82 border border-line-neutral-muted p-3">
        <div className="flex flex-wrap gap-2">
          {[...SERIES, ...SCALE].map(([t, bg]) => (
            <div key={t} className="flex w-20 flex-col gap-1">
              <div className={`h-10 rounded-sm ${bg}`} />
              <span className="truncate text-code-sm text-content-neutral-subtle">
                {t}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  ),
};
