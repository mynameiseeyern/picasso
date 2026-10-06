import type { Meta, StoryObj } from "@storybook/react";
import { BarChart, type BarSeries } from "./bar-chart";
import guidance from "./guidance.json";
import { Guidance, GuidanceStory, pairOf } from "@/stories/guidance";

const pair = pairOf(guidance);

const SITES = ["Sydney", "Melbourne", "Perth", "Brisbane", "Auckland"];
const BY_CAUSE: BarSeries[] = [
  { id: "codec", label: "Codec mismatch", points: [42, 31, 18, 24, 11] },
  { id: "jitter", label: "Jitter", points: [28, 44, 12, 19, 22] },
  { id: "auth", label: "Auth failure", points: [12, 8, 26, 7, 5] },
];

const meta: Meta<typeof BarChart> = {
  title: "Components/Bar chart",
  component: BarChart,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "A measure compared across categories. Bars always start at zero — " +
          "there is no `yMin` — and are capped at 24 wide so the air between " +
          "groups keeps doing its job. The bars are HTML rather than SVG, so " +
          "the cap, the 3.2 data-end and the 2px gap are exact at any width. " +
          "No Figma component exists for it yet.",
      },
    },
  },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    stacked: { control: "boolean" },
  },
};
export default meta;
type Story = StoryObj<typeof BarChart>;

export const Default: Story = {
  args: { size: "md", stacked: false },
  render: (args) => (
    <div className="max-w-200">
      <BarChart
        size={args.size}
        stacked={args.stacked}
        x={SITES}
        series={BY_CAUSE}
        title="Call failures by site"
        subtitle="Last 7 days"
        yLabel="Failures"
        xLabel="Site"
        label="Call failures by site and cause over the last seven days"
      />
    </div>
  ),
};

/** Parts of a whole: the total per site is the thing worth reading. */
export const Stacked: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="max-w-200">
      <BarChart
        stacked
        x={SITES}
        series={BY_CAUSE}
        title="Call failures by site"
        subtitle="Stacked — the column is the site's total"
        yLabel="Failures"
        xLabel="Site"
        label="Total call failures per site, split by cause"
      />
    </div>
  ),
};

/** One series needs no legend; the title names it. */
export const SingleSeries: Story = {
  name: "Single series",
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="max-w-200">
      <BarChart
        x={SITES}
        series={[BY_CAUSE[0]]}
        title="Codec mismatches by site"
        yLabel="Failures"
        xLabel="Site"
        threshold={{ value: 30, label: "Review threshold" }}
        label="Codec mismatch failures by site, against a review threshold of 30"
      />
    </div>
  ),
};

/** 328 — the floor minus its gutters. Labels truncate rather than rotate. */
export const Narrow: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="w-82">
      <BarChart
        size="sm"
        x={SITES}
        series={[BY_CAUSE[0]]}
        title="Codec mismatches"
        yLabel="Failures"
        xLabel="Site"
        label="Codec mismatch failures by site"
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
        pair={pair("bars-start-at-zero")}
        width="wide"
        stage="tall"
        dont={
          <div className="w-full">
            {/* A cut baseline, faked by subtracting it from the data — the
                component itself offers no yMin. */}
            <BarChart
              size="sm"
              x={SITES}
              series={[{ ...BY_CAUSE[0], points: BY_CAUSE[0].points.map((p) => (p as number) - 10) }]}
              title="Baseline cut at 10"
              yLabel="Failures"
              xLabel="Site"
              label="Codec mismatches with the baseline cut, exaggerating the differences"
            />
          </div>
        }
        do={
          <div className="w-full">
            <BarChart
              size="sm"
              x={SITES}
              series={[BY_CAUSE[0]]}
              title="Baseline at zero"
              yLabel="Failures"
              xLabel="Site"
              label="Codec mismatches by site, measured from zero"
            />
          </div>
        }
      />

      <Guidance
        pair={pair("stack-only-a-whole")}
        width="wide"
        stage="tall"
        dont={
          <div className="w-full">
            <BarChart
              size="sm"
              stacked
              x={SITES}
              series={BY_CAUSE}
              title="Which site has the most jitter?"
              yLabel="Failures"
              xLabel="Site"
              label="Failures stacked by cause, where the middle segments cannot be compared"
            />
          </div>
        }
        do={
          <div className="w-full">
            <BarChart
              size="sm"
              x={SITES}
              series={BY_CAUSE}
              title="Grouped — every bar on one baseline"
              yLabel="Failures"
              xLabel="Site"
              label="Failures grouped by cause, every bar measured from the same baseline"
            />
          </div>
        }
      />
    </GuidanceStory>
  ),
};
