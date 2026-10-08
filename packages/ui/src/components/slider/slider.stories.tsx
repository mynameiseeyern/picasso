import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Slider } from "./slider";
import { Field, FieldLabel } from "../field/field";
import guidance from "./guidance.json";
import { Guidance, GuidanceStory, pairOf } from "@/stories/guidance";
import { NumberInput } from "../number-input/number-input";
import { FieldControl } from "../field/field";

const meta: Meta<typeof Slider> = {
  title: "Components/Slider",
  component: Slider,
  parameters: {
    docs: {
      description: {
        component:
          "Pick a value, or a span of values, where the approximate position " +
          "matters more than the number. One thumb or two is decided by how " +
          "many values you pass. Figma's third Type, Threshold, is a " +
          "different anatomy and lives in its own component.",
      },
    },
  },
  argTypes: {
    disabled: { control: "boolean" },
    min: { control: "number" },
    max: { control: "number" },
    step: { control: "number" },
  },
  args: { min: 0, max: 100, step: 1, disabled: false },
  decorators: [(S) => <div className="w-80">{S()}</div>],
};
export default meta;
type Story = StoryObj<typeof Slider>;

export const Default: Story = {
  render: (args) => <Slider defaultValue={[60]} {...args} />,
};

/** Two values, two thumbs — and both need names. */
export const Range: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Slider defaultValue={[25, 70]} thumbLabels={["Minimum", "Maximum"]} />
  ),
};

/** The value belongs next to the track, not only under the thumb. */
export const WithAReadout: Story = {
  name: "With a readout",
  parameters: { controls: { disable: true } },
  render: () => {
    const [v, setV] = React.useState([75]);
    return (
      <Field>
        <div className="flex items-baseline justify-between">
          <FieldLabel>Alert threshold</FieldLabel>
          <span className="text-code-xs text-content-neutral-emphasis">
            {v[0]}%
          </span>
        </div>
        <Slider
          value={v}
          onValueChange={setV}
          thumbLabels={["Alert threshold"]}
        />
      </Field>
    );
  },
};

/** Disabled — a correction. The file draws it identically to the default. */
export const Disabled: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-6">
      <Slider defaultValue={[60]} />
      <Slider defaultValue={[60]} disabled />
    </div>
  ),
};

const pair = pairOf(guidance);

/**
 * Narrow — this file's decorator pins 320, narrower than the 328 a 360 phone
 * leaves after its gutters. Two thumbs close together is the case to look at:
 * they must stay grabbable rather than overlapping into one target.
 */
export const Narrow: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Slider defaultValue={[42, 58]} thumbLabels={["Minimum", "Maximum"]} />
  ),
};

export const DoAndDont: Story = {
  name: "Do and Don't",
  parameters: { controls: { disable: true } },
  render: () => (
    <GuidanceStory>
      <Guidance
        pair={pair("show-the-number")}
        width="wide"
        stage="tall"
        dont={
          <Field>
            <FieldLabel>Sample rate</FieldLabel>
            <Slider defaultValue={[60]} thumbLabels={["Sample rate"]} />
          </Field>
        }
        do={
          <Field>
            <FieldLabel>Sample rate</FieldLabel>
            <div className="flex items-center gap-3">
              <Slider defaultValue={[60]} thumbLabels={["Sample rate"]} />
              <span className="ltr-island text-body-sm tabular-nums text-content-neutral-emphasis">
                60%
              </span>
            </div>
          </Field>
        }
      />

      <Guidance
        pair={pair("not-for-precision")}
        width="wide"
        stage="tall"
        dont={
          <Field>
            <FieldLabel>Timeout (ms)</FieldLabel>
            <Slider
              defaultValue={[250]}
              min={0}
              max={10000}
              thumbLabels={["Timeout"]}
            />
          </Field>
        }
        do={
          <Field>
            <FieldLabel>Timeout (ms)</FieldLabel>
            <FieldControl>
              <NumberInput defaultValue={250} min={0} max={10000} />
            </FieldControl>
          </Field>
        }
      />
    </GuidanceStory>
  ),
};
