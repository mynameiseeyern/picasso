import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * The Do-and-Don't figure, shared by every component's guidance story.
 *
 * It was copy-pasted into eighteen stories files before this existed, and
 * the eighteen copies had already drifted into eleven shapes. The drift was
 * entirely two things — the panel's min-width and the height of the area the
 * example sits in — so those are the two props, as named choices, and every
 * other line is fixed. Colour, border, the ✓/✗ and the caption are not
 * tunable, for the same reason a Button's are not.
 *
 * ⭐ The words come from the component's own `guidance.json`, not from the
 * story. They used to be written twice: once in the JSON, which feeds the
 * docs site through build-llms.mjs, and once as a hand-written caption here.
 * Every component I compared had already drifted — Badge's JSON said
 * "Signal status with colour and nothing else" while its story said "Status
 * by colour alone". One source now, and `pairOf` throws on an id that is not
 * in the file, so renaming a pair breaks the story instead of quietly
 * leaving the old text on screen.
 *
 * Not every pair can be a picture: across the first eighteen stories, 111
 * pairs were written and 49 rendered. "Don't make a badge clickable" is
 * sound guidance and a pointless figure. So a story renders the pairs that
 * have an example and leaves the rest to the JSON — the site publishes all
 * of them either way.
 */

export interface GuidancePair {
  id: string;
  dont: string;
  do: string;
  why: string;
}

export interface GuidanceDoc {
  component: string;
  summary: string;
  pairs: GuidancePair[];
}

/**
 * Look a pair up by id, loudly.
 *
 * `const pair = pairOf(guidance)` at the top of a stories file, then
 * `pair("never-colour-alone")`. A typo or a renamed id throws while the
 * story renders rather than silently showing nothing.
 */
export function pairOf(doc: GuidanceDoc) {
  return (id: string): GuidancePair => {
    const found = doc.pairs.find((p) => p.id === id);
    if (!found) {
      throw new Error(
        `guidance.json for ${doc.component} has no pair "${id}". ` +
          `It has: ${doc.pairs.map((p) => p.id).join(", ")}`,
      );
    }
    return found;
  };
}

const WIDTH = {
  narrow: "min-w-64",
  default: "min-w-72",
  wide: "min-w-80",
} as const;

const STAGE = {
  short: "min-h-16",
  default: "min-h-20",
  tall: "min-h-28",
} as const;

export interface GuidanceProps {
  pair: GuidancePair;
  /**
   * The panel's minimum width. Both panels are `flex-1`, so this does not
   * set how wide they are — it sets how narrow the viewport has to get
   * before they stop sitting side by side.
   */
  width?: keyof typeof WIDTH;
  /** How tall the example is. */
  stage?: keyof typeof STAGE;
  /** The example itself: what not to do, and what to do instead. */
  dont: React.ReactNode;
  do: React.ReactNode;
}

function Panel({
  variant,
  caption,
  width,
  stage,
  children,
}: {
  variant: "do" | "dont";
  caption: string;
  width: keyof typeof WIDTH;
  stage: keyof typeof STAGE;
  children: React.ReactNode;
}) {
  const isDo = variant === "do";
  return (
    <figure
      data-slot={`guidance-${variant}`}
      className={cn(
        "m-0 flex-1 rounded-md border-2 p-4",
        WIDTH[width],
        isDo ? "border-line-success-emphasis" : "border-line-danger-emphasis",
      )}
    >
      {/* gap-3 because an example is often two or three elements side by
          side, and a fragment with no gap renders them touching. It is a
          no-op for the single-element examples, which are most of them. */}
      <div className={cn("flex items-center gap-3", STAGE[stage])}>
        {children}
      </div>
      <figcaption className="mt-4 text-label-sm">
        <span
          className={
            isDo
              ? "text-content-success-emphasis"
              : "text-content-danger-emphasis"
          }
        >
          {isDo ? "✓ Do" : "✗ Don't"}
        </span>
        <span className="text-content-neutral-muted"> — {caption}</span>
      </figcaption>
    </figure>
  );
}

/** One guidance pair: the two panels, and the reason underneath them. */
export function Guidance({
  pair,
  width = "default",
  stage = "default",
  dont,
  do: doExample,
}: GuidanceProps) {
  return (
    <section data-slot="guidance" data-pair={pair.id} className="space-y-3">
      <div className="flex flex-wrap gap-4">
        <Panel variant="dont" caption={pair.dont} width={width} stage={stage}>
          {dont}
        </Panel>
        <Panel variant="do" caption={pair.do} width={width} stage={stage}>
          {doExample}
        </Panel>
      </div>
      <p className="max-w-240 text-body-sm text-content-neutral-muted">
        {pair.why}
      </p>
    </section>
  );
}

/** The wrapper a Do-and-Don't story renders its pairs into. */
export function GuidanceStory({ children }: { children: React.ReactNode }) {
  return <div className="space-y-8 p-6">{children}</div>;
}
