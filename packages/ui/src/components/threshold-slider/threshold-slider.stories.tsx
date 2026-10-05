import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { ThresholdSlider } from "./threshold-slider";

import guidance from "./guidance.json";
import { Guidance, GuidanceStory, pairOf } from "@/stories/guidance";

const meta: Meta<typeof ThresholdSlider> = {
  title: "Components/Threshold slider",
  component: ThresholdSlider,
  parameters: {
    docs: {
      description: {
        component:
          "Sets the two numbers that decide when a metric stops being " +
          "healthy. Which direction is bad is derived from the order of the " +
          "thresholds rather than declared — `critical < warning` means low " +
          "is bad — so the bands can never contradict the values.",
      },
    },
  },
};
const pair = pairOf(guidance);

export default meta;
type Story = StoryObj<typeof ThresholdSlider>;

/**
 * The six metrics Figma draws. They are product policy rather than design
 * system — Clarion decides that CPU warns at 70% — so they live here as
 * examples and in Metrics as defaults, not in `@ir/ui`.
 */
const PRESETS = [
  {
    metric: "Network MOS",
    min: 1,
    max: 5,
    critical: 3,
    warning: 4,
    step: 0.1,
    format: (v: number) => v.toFixed(1),
  },
  {
    metric: "Platform MOS",
    min: 1,
    max: 5,
    critical: 3,
    warning: 4,
    step: 0.1,
    format: (v: number) => v.toFixed(1),
  },
  {
    metric: "Wi-Fi signal",
    min: -90,
    max: -30,
    critical: -80,
    warning: -70,
    step: 1,
    format: (v: number) => `${v} dBm`,
  },
  {
    metric: "CPU utilisation",
    min: 0,
    max: 100,
    warning: 70,
    critical: 85,
    step: 1,
    format: (v: number) => `${v}%`,
  },
  {
    metric: "Memory utilisation",
    min: 0,
    max: 100,
    warning: 75,
    critical: 90,
    step: 1,
    format: (v: number) => `${v}%`,
  },
  {
    metric: "Disk free space",
    min: 0,
    max: 100,
    critical: 5,
    warning: 15,
    step: 1,
    format: (v: number) => `${v}%`,
  },
];

function Live({
  metric,
  ...preset
}: (typeof PRESETS)[number] & { className?: string }) {
  const [value, setValue] = React.useState({
    warning: preset.warning,
    critical: preset.critical,
  });
  return (
    <div className="flex flex-col gap-2">
      <span className="text-label-md text-content-neutral-emphasis">
        {metric}
      </span>
      <ThresholdSlider
        aria-label={`${metric} thresholds`}
        min={preset.min}
        max={preset.max}
        step={preset.step}
        format={preset.format}
        warning={value.warning}
        critical={value.critical}
        onChange={setValue}
      />
    </div>
  );
}

/** Network MOS — higher is better, so the critical band is on the left. */
export const Default: Story = {
  render: () => (
    <div className="w-174 p-6">
      <Live {...PRESETS[0]} />
    </div>
  ),
};

/** CPU utilisation — lower is better, so the bands run the other way. */
export const HigherIsWorse: Story = {
  name: "Higher is worse",
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="w-174 p-6">
      <Live {...PRESETS[3]} />
    </div>
  ),
};

/** All six metrics Figma draws, live. */
export const Presets: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex w-174 flex-col gap-8 p-6">
      {PRESETS.map((p) => (
        <Live key={p.metric} {...p} />
      ))}
    </div>
  ),
};

/** Disabled is 50% on the whole control, which is what the file draws. */
export const Disabled: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="w-174 p-6">
      <ThresholdSlider
        aria-label="CPU utilisation thresholds"
        min={0}
        max={100}
        warning={70}
        critical={85}
        format={(v) => `${v}%`}
        disabled
      />
    </div>
  ),
};

/* ------------------------------------------------------------------ */

export const DoAndDont: Story = {
  name: "Do and Don't",
  parameters: { controls: { disable: true } },
  render: () => (
    <GuidanceStory>
      <Guidance
        pair={pair("units-belong-on-the-value")}
        width="wide"
        dont={
          <>
            <div className="w-full">
              <ThresholdSlider
                aria-label="Without units"
                min={-90}
                max={-30}
                critical={-80}
                warning={-70}
              />
            </div>
          </>
        }
        do={
          <>
            <div className="w-full">
              <ThresholdSlider
                aria-label="With units"
                min={-90}
                max={-30}
                critical={-80}
                warning={-70}
                format={(v) => `${v} dBm`}
              />
            </div>
          </>
        }
      />
    </GuidanceStory>
  ),
};

/**
 * Narrow — 328, a 360 phone minus its gutters. Every other story here pins a
 * width well above that, so this is the one that shows what a phone does to
 * it, and the one the overflow sweep can measure.
 */
export const Narrow: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="w-82 p-4">
      <Live {...PRESETS[0]} />
    </div>
  ),
};
