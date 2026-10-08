import type { Meta, StoryObj } from "@storybook/react";
import { NumberInput } from "./number-input";
import {
  Field,
  FieldControl,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "../field/field";
import guidance from "./guidance.json";
import { Guidance, GuidanceStory, pairOf } from "@/stories/guidance";
import { Input } from "../input/input";

const meta: Meta<typeof NumberInput> = {
  title: "Components/NumberInput",
  component: NumberInput,
  parameters: {
    docs: {
      description: {
        component:
          "Figma Input `Type=Number stepper`. A spinbutton with − / + steppers: arrows step, Page keys step ×10, " +
          "Home/End jump to the bounds; typing is free and clamps on blur.",
      },
    },
  },
  args: { defaultValue: 3, min: 0, max: 10, "aria-label": "Retries" },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md"] },
    disabled: { control: "boolean" },
  },
  decorators: [
    (S) => (
      <div className="w-60">
        <S />
      </div>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof NumberInput>;

export const Default: Story = {};
export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-col gap-3">
      <NumberInput {...args} size="sm" aria-label="Small" />
      <NumberInput {...args} size="md" aria-label="Medium" />
    </div>
  ),
};
export const Decimals: Story = {
  args: { defaultValue: 0.5, step: 0.1, min: 0, max: 1, "aria-label": "Ratio" },
};
export const AtTheBound: Story = { args: { defaultValue: 10 } };
export const Disabled: Story = { args: { disabled: true } };
export const InAField: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <Field>
        <FieldLabel>Timeout (seconds)</FieldLabel>
        <FieldControl>
          <NumberInput defaultValue={30} min={5} max={300} step={5} />
        </FieldControl>
        <FieldDescription>Between 5 and 300.</FieldDescription>
      </Field>
      <Field invalid>
        <FieldLabel>Retries</FieldLabel>
        <FieldControl>
          <NumberInput defaultValue={0} min={0} max={5} />
        </FieldControl>
        <FieldError>
          At least one retry is needed for flaky endpoints.
        </FieldError>
      </Field>
    </div>
  ),
};

const pair = pairOf(guidance);

/**
 * Narrow — 328, a 360 phone minus its gutters. The steppers keep their tap
 * targets while the label above them wraps.
 */
export const Narrow: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="w-82 border border-line-neutral-muted p-3">
      <Field>
        <FieldLabel>Retries before an endpoint is marked unreachable</FieldLabel>
        <FieldControl>
          <NumberInput defaultValue={3} min={0} max={10} aria-label="Retries" />
        </FieldControl>
      </Field>
    </div>
  ),
};

export const DoAndDont: Story = {
  name: "Do and Don't",
  parameters: { controls: { disable: true } },
  render: () => (
    <GuidanceStory>
      <Guidance
        pair={pair("not-for-identifiers")}
        width="wide"
        stage="tall"
        dont={
          <Field>
            <FieldLabel>Collector port</FieldLabel>
            <FieldControl>
              <NumberInput defaultValue={8086} />
            </FieldControl>
          </Field>
        }
        do={
          <Field>
            <FieldLabel>Collector port</FieldLabel>
            <FieldControl>
              <Input inputMode="numeric" defaultValue="8086" />
            </FieldControl>
          </Field>
        }
      />

      <Guidance
        pair={pair("unit-beside")}
        width="wide"
        stage="tall"
        dont={
          <Field>
            <FieldLabel>Timeout</FieldLabel>
            <FieldControl>
              <NumberInput defaultValue={30} />
            </FieldControl>
          </Field>
        }
        do={
          <Field>
            <FieldLabel>Timeout (seconds)</FieldLabel>
            <FieldControl>
              <NumberInput defaultValue={30} />
            </FieldControl>
          </Field>
        }
      />
    </GuidanceStory>
  ),
};
