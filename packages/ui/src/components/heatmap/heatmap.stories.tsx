import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Heatmap, type HeatmapRow } from "./heatmap";
import guidance from "./guidance.json";
import { Guidance, GuidanceStory, pairOf } from "@/stories/guidance";

const pair = pairOf(guidance);

const HOURS = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, "0")}:00`);

/** Deterministic, so the story does not shimmer between renders. */
const wave = (seed: number, n: number, peak: number) =>
  Array.from({ length: n }, (_, i) => {
    const v = Math.sin((i + seed) / 3) * 1.4 + Math.sin((i + seed) / 7) * 0.9;
    return Math.max(0, Math.round((v + 1.6) * peak) / 10);
  });

const FLEET: HeatmapRow[] = [
  { id: "syd1", label: "syd-edge-01", values: wave(0, 24, 9) },
  { id: "syd2", label: "syd-edge-02", values: wave(3, 24, 6) },
  { id: "mel1", label: "mel-edge-01", values: wave(5, 24, 14) },
  // A host that stopped reporting for six hours — the case that matters.
  {
    id: "akl1",
    label: "akl-edge-01",
    values: wave(8, 24, 7).map((v, i) => (i >= 9 && i < 15 ? null : v)),
  },
  { id: "per1", label: "per-edge-01", values: wave(11, 24, 4) },
];

const pct = (v: number) => `${v.toFixed(1)}%`;

const meta: Meta<typeof Heatmap> = {
  title: "Components/Heatmap",
  component: Heatmap,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "One measure across two dimensions — endpoint by time. This is the " +
          "only chart in Picasso that colours by value, and the only place " +
          "`chart/scale/1–5` belongs: a cell has no length or height to " +
          "encode with, so colour is the one channel it has. Five bands, not " +
          "a gradient. No Figma component exists for it yet.",
      },
    },
  },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
  },
};
export default meta;
type Story = StoryObj<typeof Heatmap>;

export const Default: Story = {
  args: { size: "md" },
  render: (args) => (
    <Heatmap
      {...args}
      x={HOURS}
      rows={FLEET}
      title="Packet loss by endpoint"
      subtitle="Last 24 hours · akl-edge-01 stopped reporting at 09:00"
      format={pct}
      xLabel="Hour"
      lowLabel="0%"
      highLabel="Worst"
      label="Packet loss per endpoint per hour over the last 24 hours."
    />
  ),
};

/**
 * Bands can mean something. Explicit stops put the boundaries where the SLA
 * puts them, rather than at even fifths of whatever the data happened to do.
 */
export const WithSLABands: Story = {
  name: "With SLA bands",
  parameters: { controls: { disable: true } },
  render: () => (
    <Heatmap
      x={HOURS}
      rows={FLEET}
      min={0}
      max={5}
      stops={[0.1, 0.5, 1, 2]}
      title="Packet loss by endpoint"
      subtitle="Bands at the SLA thresholds, not at even fifths"
      format={pct}
      xLabel="Hour"
      lowLabel="Within SLA"
      highLabel="Breach"
      label="Packet loss banded at the SLA thresholds."
    />
  ),
};

/**
 * Narrow — 328, a 360 phone minus its gutters. Fewer columns: 24 hourly cells
 * at this width are 8px each, which is below a tap target and past the point
 * the colour reads. Six four-hour buckets is the phone form.
 */
export const Narrow: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="w-82 border border-line-neutral-muted p-3">
      <Heatmap
        x={["00", "04", "08", "12", "16", "20"]}
        rows={FLEET.slice(0, 4).map((r) => ({
          ...r,
          values: r.values.filter((_, i) => i % 4 === 0),
        }))}
        size="sm"
        title="Packet loss"
        format={pct}
        xLabel="Hour"
        lowLabel="0%"
        highLabel="Worst"
        label="Packet loss per endpoint in four-hour buckets."
      />
    </div>
  ),
};

const Swatches = ({ classes }: { classes: readonly string[] }) => (
  <div className="flex items-center gap-0.5">
    {classes.map((c) => (
      <span key={c} className={`h-6 w-8 rounded-xs ${c}`} />
    ))}
  </div>
);

export const DoAndDont: Story = {
  name: "Do and Don't",
  parameters: { controls: { disable: true } },
  render: () => (
    <GuidanceStory>
      <Guidance
        pair={pair("no-data-is-not-zero")}
        dont={
          <div className="flex items-center gap-0.5">
            <span className="h-6 w-8 rounded-xs bg-chart-scale-2" />
            <span className="h-6 w-8 rounded-xs bg-chart-scale-1" />
            <span className="h-6 w-8 rounded-xs bg-chart-scale-3" />
          </div>
        }
        do={
          <div className="flex items-center gap-0.5">
            <span className="h-6 w-8 rounded-xs bg-chart-scale-2" />
            <span className="h-6 w-8 rounded-xs border border-dashed border-line-neutral-muted" />
            <span className="h-6 w-8 rounded-xs bg-chart-scale-3" />
          </div>
        }
      />

      <Guidance
        pair={pair("bands-not-a-gradient")}
        dont={
          <div className="flex items-center gap-0.5">
            {["bg-chart-scale-1", "bg-chart-scale-2", "bg-chart-scale-2",
              "bg-chart-scale-3", "bg-chart-scale-3", "bg-chart-scale-4"].map((c, i) => (
              <span key={i} className={`h-6 w-5 ${c} opacity-80`} />
            ))}
          </div>
        }
        do={
          <Swatches
            classes={[
              "bg-chart-scale-1", "bg-chart-scale-2", "bg-chart-scale-3",
              "bg-chart-scale-4", "bg-chart-scale-5",
            ]}
          />
        }
      />

      <Guidance
        pair={pair("scale-is-not-identity")}
        dont={
          <Swatches
            classes={["bg-chart-1", "bg-chart-2", "bg-chart-3", "bg-chart-4", "bg-chart-5"]}
          />
        }
        do={
          <Swatches
            classes={[
              "bg-chart-scale-1", "bg-chart-scale-2", "bg-chart-scale-3",
              "bg-chart-scale-4", "bg-chart-scale-5",
            ]}
          />
        }
      />
    </GuidanceStory>
  ),
};
