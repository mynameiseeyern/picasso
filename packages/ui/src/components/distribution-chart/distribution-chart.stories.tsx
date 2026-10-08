import type { Meta, StoryObj } from "@storybook/react";
import { DistributionChart } from "./distribution-chart";
import guidance from "./guidance.json";
import { Guidance, GuidanceStory, pairOf } from "@/stories/guidance";

const pair = pairOf(guidance);

/** A tight spread around 80ms — the healthy case. */
const TIGHT = Array.from({ length: 400 }, (_, i) => {
  const t = (i % 40) / 40;
  return 60 + Math.round(40 * (0.5 - Math.cos(t * Math.PI * 2) / 2));
});

/** The same mean, in two clumps. This is the one an average hides. */
const BIMODAL = [
  ...Array.from({ length: 200 }, (_, i) => 15 + (i % 20)),
  ...Array.from({ length: 200 }, (_, i) => 125 + (i % 25)),
];

const ms = (v: number) => `${Math.round(v)}ms`;

const meta: Meta<typeof DistributionChart> = {
  title: "Components/Distribution chart",
  component: DistributionChart,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "The shape of a spread rather than its average. Binning is the " +
          "component's job — pass raw samples and it works out round edges. " +
          "Markers run down the measured axis, because a p95 is a value and " +
          "not a count. No Figma component exists for it yet.",
      },
    },
  },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    bins: { control: { type: "range", min: 4, max: 24, step: 1 } },
  },
};
export default meta;
type Story = StoryObj<typeof DistributionChart>;

export const Default: Story = {
  args: { size: "md", bins: 12 },
  render: (args) => (
    <DistributionChart
      {...args}
      values={TIGHT}
      title="Call setup latency"
      subtitle="Sydney · last 24 hours"
      format={ms}
      yLabel="Calls"
      xLabel="Latency"
      label="Call setup latency across 400 calls, Sydney, last 24 hours."
    />
  ),
};

/** The case the component exists for: one mean, two populations. */
export const Bimodal: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <DistributionChart
      values={BIMODAL}
      bins={14}
      title="Call setup latency"
      subtitle="Both clumps average to about 90ms"
      format={ms}
      yLabel="Calls"
      xLabel="Latency"
      label="A bimodal latency distribution whose mean falls in the empty middle."
    />
  ),
};

/** Markers run down the measured axis — a percentile, a limit. */
export const WithMarkers: Story = {
  name: "With markers",
  parameters: { controls: { disable: true } },
  render: () => (
    <DistributionChart
      values={TIGHT}
      max={160}
      title="Call setup latency"
      subtitle="The axis is pinned to 160 so the SLA is on it — a marker off the scale is not drawn"
      format={ms}
      yLabel="Calls"
      xLabel="Latency"
      markers={[
        { value: 95, label: "p95" },
        { value: 150, label: "SLA" },
      ]}
      label="Call setup latency with the p95 and the SLA limit marked."
    />
  ),
};

/**
 * Narrow — 328, a 360 phone minus its gutters. Fewer buckets, and the axis
 * drops to three labels; a 12-bucket histogram cannot label every edge here.
 */
export const Narrow: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="w-82 border border-line-neutral-muted p-3">
      <DistributionChart
        values={TIGHT}
        bins={8}
        size="sm"
        title="Latency"
        format={ms}
        yLabel="Calls"
        xLabel="Latency"
        markers={[{ value: 95, label: "p95" }]}
        label="Call setup latency on a phone."
      />
    </div>
  ),
};

export const DoAndDont: Story = {
  name: "Do and Don't",
  parameters: { controls: { disable: true } },
  render: () => (
    <GuidanceStory>
      <Guidance
        pair={pair("shape-not-average")}
        stage="tall"
        dont={
          <div className="flex h-full flex-col justify-center gap-1">
            <p className="text-body-sm text-content-neutral-muted">
              Average call setup
            </p>
            <p className="text-metric-lg text-content-neutral-emphasis">90ms</p>
          </div>
        }
        do={
          <DistributionChart
            values={BIMODAL}
            bins={12}
            size="sm"
            format={ms}
            yLabel="Calls"
            label="The same 90ms average, shown as two clumps."
          />
        }
      />

      <Guidance
        pair={pair("bins-touch")}
        stage="tall"
        dont={
          <div className="flex h-full items-end gap-2 pb-6">
            {[20, 48, 72, 40, 16].map((h, i) => (
              <div
                key={i}
                className="h-(--h) w-full rounded-t-xs bg-chart-1"
                style={{ "--h": `${h}%` } as React.CSSProperties}
              />
            ))}
          </div>
        }
        do={
          <div className="flex h-full items-end pb-6">
            {[20, 48, 72, 40, 16].map((h, i) => (
              <div
                key={i}
                className="h-(--h) w-full rounded-t-xs bg-chart-1"
                style={{ "--h": `${h}%` } as React.CSSProperties}
              />
            ))}
          </div>
        }
      />

      <Guidance
        pair={pair("markers-run-down")}
        stage="tall"
        dont={
          <div className="relative h-full">
            <div className="absolute inset-x-0 top-1/3 h-px bg-line-neutral-emphasis" />
            <span className="absolute end-0 top-1/3 -translate-y-full text-body-xs text-content-neutral-subtle">
              150
            </span>
          </div>
        }
        do={
          <DistributionChart
            values={TIGHT}
            bins={8}
            size="sm"
            format={ms}
            yLabel="Calls"
            markers={[{ value: 150, label: "SLA" }]}
            label="The SLA limit marked on the measured axis."
          />
        }
      />
    </GuidanceStory>
  ),
};
