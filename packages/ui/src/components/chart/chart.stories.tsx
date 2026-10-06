import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { TimeSeriesChart, type TimeSeries } from "./time-series-chart";
import { Button } from "../button/button";
import guidance from "./guidance.json";
import { Guidance, GuidanceStory, pairOf } from "@/stories/guidance";

const pair = pairOf(guidance);

const HOURS = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, "0")}:00`);
const wave = (base: number, amp: number, phase: number, dip?: [number, number]) =>
  HOURS.map((_, i) => {
    if (dip && i >= dip[0] && i <= dip[1]) return null;
    return +(base + Math.sin((i + phase) / 3.2) * amp - (i > 16 ? (i - 16) * 0.02 : 0)).toFixed(2);
  });

const TRUNKS: TimeSeries[] = [
  { id: "syd-01", label: "Sydney-SBC-01", points: wave(4.2, 0.12, 0) },
  { id: "syd-02", label: "Sydney-SBC-02", points: wave(3.9, 0.2, 2) },
  { id: "mel-04", label: "Melbourne-SBC-04", points: wave(3.5, 0.3, 4, [8, 10]) },
  { id: "per-01", label: "Perth-SBC-01", points: wave(4.4, 0.08, 1) },
];

const meta: Meta<typeof TimeSeriesChart> = {
  title: "Components/Time series chart",
  component: TimeSeriesChart,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "The workhorse chart: something measured repeatedly, drawn against " +
          "time. Height is a fixed range (240/280/320), never an aspect ratio. " +
          "Colour follows the entity, gaps are gaps, and there is no second " +
          "y-axis. No Figma component exists for it yet.",
      },
    },
  },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    variant: { control: "inline-radio", options: ["line", "area"] },
  },
};
export default meta;
type Story = StoryObj<typeof TimeSeriesChart>;

export const Default: Story = {
  args: { size: "md" },
  render: (args) => (
    <div className="max-w-200">
      <TimeSeriesChart
        size={args.size}
        x={HOURS}
        series={TRUNKS}
        title="MOS by trunk"
        subtitle="Last 24 hours · hourly mean"
        yLabel="MOS"
        xLabel="Hour"
        yMin={2.5}
        yMax={5}
        format={(v) => v.toFixed(1)}
        threshold={{ value: 3.6, label: "SLA floor" }}
        label="Mean opinion score by trunk over the last 24 hours, against a 3.6 SLA floor"
        action={<Button variant="outline" size="sm">Last 7 days</Button>}
      />
    </div>
  ),
};

/** One series: no legend — the title already names it — and the fill reads as volume. */
export const SingleSeriesArea: Story = {
  name: "Single series, area",
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="max-w-200">
      <TimeSeriesChart
        variant="area"
        x={HOURS}
        series={[{ id: "calls", label: "Calls", points: HOURS.map((_, i) => Math.round(400 + Math.sin(i / 3) * 260 + i * 12)) }]}
        title="Concurrent calls"
        subtitle="Last 24 hours"
        yLabel="Calls"
        yZero
        format={(v) => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v))}
        label="Concurrent calls over the last 24 hours"
      />
    </div>
  ),
};

/** The outage is a break, not a crash — Melbourne stopped reporting at 08:00. */
export const WithAGap: Story = {
  name: "With a gap",
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="max-w-200">
      <TimeSeriesChart
        x={HOURS}
        series={TRUNKS.slice(2, 3)}
        title="Melbourne-SBC-04"
        subtitle="Two hours missing from 08:00"
        yLabel="MOS"
        yMin={2.5}
        yMax={5}
        format={(v) => v.toFixed(1)}
        label="Mean opinion score for Melbourne-SBC-04 over 24 hours, with no readings between 08:00 and 10:00"
      />
    </div>
  ),
};

/** 328 — the floor minus its gutters. The axis thins its own labels. */
export const Narrow: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="w-82">
      <TimeSeriesChart
        size="sm"
        x={HOURS}
        series={TRUNKS.slice(0, 2)}
        title="MOS by trunk"
        yLabel="MOS"
        yMin={2.5}
        yMax={5}
        format={(v) => v.toFixed(1)}
        label="Mean opinion score for two trunks over the last 24 hours"
      />
    </div>
  ),
};

export const DoAndDont: Story = {
  name: "Do and Don't",
  parameters: { controls: { disable: true } },
  render: () => {
    const two = TRUNKS.slice(0, 2);
    return (
      <GuidanceStory>
        <Guidance
          pair={pair("colour-follows-the-entity")}
          width="wide"
          stage="tall"
          dont={
            <div className="w-full">
              {/* Sydney-01 filtered out by rebuilding the list: Sydney-02 is
                  now series 1 and has taken its colour. */}
              <TimeSeriesChart
                size="sm"
                x={HOURS}
                series={[TRUNKS[1]]}
                title="Filtered to Sydney-SBC-02 — now blue"
                yLabel="MOS"
                yMin={2.5}
                yMax={5}
                format={(v) => v.toFixed(1)}
                label="Mean opinion score for Sydney-SBC-02, recoloured by filtering"
              />
            </div>
          }
          do={
            <div className="w-full">
              <TimeSeriesChart
                size="sm"
                x={HOURS}
                series={two}
                title="Hide it in the legend — it keeps its colour"
                yLabel="MOS"
                yMin={2.5}
                yMax={5}
                format={(v) => v.toFixed(1)}
                label="Mean opinion score for two trunks, each keeping its own colour"
              />
            </div>
          }
        />

        <Guidance
          pair={pair("gaps-not-zero")}
          width="wide"
          stage="tall"
          dont={
            <div className="w-full">
              <TimeSeriesChart
                size="sm"
                x={HOURS}
                series={[{ ...TRUNKS[2], points: TRUNKS[2].points.map((p) => (p === null ? 0 : p)) }]}
                title="Outage plotted as zero"
                yLabel="MOS"
                yMin={0}
                yMax={5}
                format={(v) => v.toFixed(1)}
                label="Mean opinion score with the outage plotted as a reading of zero"
              />
            </div>
          }
          do={
            <div className="w-full">
              <TimeSeriesChart
                size="sm"
                x={HOURS}
                series={[TRUNKS[2]]}
                title="Outage left as a gap"
                yLabel="MOS"
                yMin={0}
                yMax={5}
                format={(v) => v.toFixed(1)}
                label="Mean opinion score with the outage left as a gap"
              />
            </div>
          }
        />

        <Guidance
          pair={pair("area-is-for-one")}
          width="wide"
          stage="tall"
          dont={
            <div className="w-full">
              {/* `area` is refused past one series, so this is what asking for
                  it actually gets you — and why that is the better outcome. */}
              <TimeSeriesChart
                size="sm"
                variant="area"
                x={HOURS}
                series={two}
                title="Two series, area requested"
                yLabel="MOS"
                yMin={2.5}
                yMax={5}
                format={(v) => v.toFixed(1)}
                label="Two trunks drawn as lines because area is refused past one series"
              />
            </div>
          }
          do={
            <div className="w-full">
              <TimeSeriesChart
                size="sm"
                variant="area"
                x={HOURS}
                series={[TRUNKS[0]]}
                title="One series, filled"
                yLabel="MOS"
                yMin={2.5}
                yMax={5}
                format={(v) => v.toFixed(1)}
                label="One trunk drawn as a filled area"
              />
            </div>
          }
        />
      </GuidanceStory>
    );
  },
};
