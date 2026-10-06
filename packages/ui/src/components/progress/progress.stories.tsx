import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { Progress } from "./progress";
import guidance from "./guidance.json";
import { Guidance, GuidanceStory, pairOf } from "@/stories/guidance";
import { Meter } from "../meter/meter";

const meta: Meta<typeof Progress> = {
  title: "Components/Progress",
  component: Progress,
  parameters: {
    docs: {
      description: {
        component:
          "Work in flight, with an end. A reading that can go back down is a " +
          "Meter; a wait of unknown length is a spinner.",
      },
    },
  },
  argTypes: {
    variant: { control: "inline-radio", options: ["brand", "neutral"] },
    value: { control: { type: "range", min: 0, max: 100 } },
  },
  args: { value: 42 },
};
export default meta;
type Story = StoryObj<typeof Progress>;

export const Default: Story = {
  render: (args) => (
    <div className="w-96">
      <Progress {...args} />
    </div>
  ),
};

export const Steps: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex w-96 flex-col gap-4">
      {[0, 25, 50, 75, 100].map((v) => (
        <Progress key={v} value={v} />
      ))}
    </div>
  ),
};

export const Variants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex w-96 flex-col gap-4">
      <Progress value={60} variant="brand" />
      <Progress value={60} variant="neutral" />
    </div>
  ),
};

/** A percentage answers "how far". A count answers "of what". */
export const WithALabel: Story = {
  name: "With a label",
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex w-96 flex-col gap-6">
      <Progress value={42} label="Importing endpoints" />
      <Progress
        value={42}
        label="Importing endpoints"
        valueLabel="420 of 1,000"
      />
    </div>
  ),
};

/** Until the server says how much there is, say so rather than showing 0%. */
export const Indeterminate: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="w-96">
      <Progress value={null} label="Scanning" valueLabel="—" />
    </div>
  ),
};

/** Real work, so the bar means something. */
export const Live: Story = {
  parameters: { controls: { disable: true } },
  render: function Render() {
    const [v, setV] = React.useState(0);
    React.useEffect(() => {
      const t = setInterval(() => setV((x) => (x >= 100 ? 0 : x + 4)), 240);
      return () => clearInterval(t);
    }, []);
    return (
      <div className="w-96">
        <Progress
          value={v}
          label="Importing endpoints"
          valueLabel={`${v * 10} of 1,000`}
        />
      </div>
    );
  },
};

/**
 * Narrow — 328, a 360 phone minus its gutters. Every other story here pins a
 * width well above that, so this is the one that shows what a phone does to
 * it, and the one the overflow sweep can measure.
 */
export const Narrow: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex w-82 flex-col gap-6">
      <Progress value={42} label="Importing endpoints" />
      <Progress
        value={42}
        label="Importing endpoints"
        valueLabel="420 of 1,000"
      />
    </div>
  ),
};

const pair = pairOf(guidance);

export const DoAndDont: Story = {
  name: "Do and Don't",
  parameters: { controls: { disable: true } },
  render: () => (
    <GuidanceStory>
      <Guidance
        pair={pair("progress-is-not-a-meter")}
        width="wide"
        dont={
          <div className="w-full">
            <Progress value={70} label="Disk usage" />
          </div>
        }
        do={
          <div className="flex w-full items-center gap-3">
            <Meter value={3.5} max={5} />
            <span className="ltr-island text-body-sm tabular-nums">3.5</span>
          </div>
        }
      />

      <Guidance
        pair={pair("unknown-is-not-zero")}
        width="wide"
        dont={
          <div className="w-full">
            <Progress value={0} label="Importing endpoints" />
          </div>
        }
        do={
          <div className="w-full">
            <Progress value={null} label="Importing endpoints" valueLabel="—" />
          </div>
        }
      />

      <Guidance
        pair={pair("label-the-work")}
        width="wide"
        dont={
          <div className="w-full">
            <Progress value={42} />
          </div>
        }
        do={
          <div className="w-full">
            <Progress
              value={42}
              label="Importing endpoints"
              valueLabel="420 of 1,000"
            />
          </div>
        }
      />

      <Guidance
        pair={pair("one-at-a-time")}
        width="wide"
        stage="tall"
        dont={
          <div className="w-full space-y-2">
            {[20, 48, 71, 94].map((v) => (
              <Progress key={v} value={v} />
            ))}
          </div>
        }
        do={
          <div className="w-full">
            <Progress
              value={58}
              label="Importing endpoints"
              valueLabel="29 of 50"
            />
          </div>
        }
      />
    </GuidanceStory>
  ),
};
