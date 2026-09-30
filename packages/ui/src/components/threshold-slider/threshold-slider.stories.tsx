import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { ThresholdSlider } from "./threshold-slider";

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

function Guidance({
  variant,
  caption,
  children,
}: {
  variant: "do" | "dont";
  caption: string;
  children: React.ReactNode;
}) {
  const isDo = variant === "do";
  return (
    <figure
      className={
        "m-0 min-w-80 flex-1 rounded-md border-2 p-4 " +
        (isDo ? "border-line-success-emphasis" : "border-line-danger-emphasis")
      }
    >
      <div className="flex min-h-20 items-center">{children}</div>
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

export const DoAndDont: Story = {
  name: "Do and Don't",
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="space-y-8 p-6">
      <div className="flex flex-wrap gap-4">
        <Guidance
          variant="dont"
          caption="Bare numbers. 70 what? −80 what? The unit is gone the moment the value is read anywhere else."
        >
          <div className="w-full">
            <ThresholdSlider
              aria-label="Without units"
              min={-90}
              max={-30}
              critical={-80}
              warning={-70}
            />
          </div>
        </Guidance>
        <Guidance
          variant="do"
          caption="`format` puts the unit on the value, where a screen reader and a summary both pick it up."
        >
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
        </Guidance>
      </div>
    </div>
  ),
};
