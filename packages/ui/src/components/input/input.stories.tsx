import type { Meta, StoryObj } from "@storybook/react";
import { Input } from "./input";

import guidance from "./guidance.json";
import { Guidance, GuidanceStory, pairOf } from "@/stories/guidance";
import { Select } from "../select/select";
import { Field, FieldControl, FieldLabel } from "../field/field";

const meta: Meta<typeof Input> = {
  title: "Components/Input",
  component: Input,
  parameters: {
    docs: {
      description: {
        component:
          "A single-line text field, always paired with a visible label. " +
          "Figma's Type and State axes are the native type attribute and CSS " +
          "states rather than props — see the component's doc block.",
      },
    },
  },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md"] },
    disabled: { control: "boolean" },
    readOnly: { control: "boolean" },
  },
  args: { placeholder: "SYD-03", "aria-label": "Probe name" },
};
const pair = pairOf(guidance);

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {};

export const Sizes: Story = {
  render: () => (
    <div className="flex max-w-sm flex-col gap-3">
      <Input
        size="sm"
        placeholder="sm — table row, toolbar"
        aria-label="Small"
      />
      <Input size="md" placeholder="md — form field" aria-label="Medium" />
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div className="flex max-w-sm flex-col gap-3">
      <Input placeholder="Default" aria-label="Default" />
      <Input defaultValue="SYD-03" aria-label="Filled" />
      <Input aria-invalid defaultValue="SYD-3" aria-label="Invalid" />
      <Input readOnly defaultValue="SYD-03" aria-label="Read only" />
      <Input disabled placeholder="Disabled" aria-label="Disabled" />
    </div>
  ),
};

export const Types: Story = {
  render: () => (
    <div className="flex max-w-sm flex-col gap-3">
      <Input type="password" defaultValue="hunter2" aria-label="Password" />
      <Input type="number" defaultValue="3.6" aria-label="Threshold" />
      <Input type="file" aria-label="Upload" />
    </div>
  ),
};

/* ------------------------------------------------------------------ */
/* Guidance — rendered, so it breaks when the component does           */
/* ------------------------------------------------------------------ */

const Pair = ({ children }: { children: React.ReactNode }) => (
  <div className="flex flex-wrap gap-4">{children}</div>
);

const Label = ({ children }: { children: React.ReactNode }) => (
  <span className="text-label-md text-content-neutral-emphasis">
    {children}
  </span>
);

export const DoAndDont: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <GuidanceStory>
      <Guidance
        pair={pair("placeholder-is-not-a-label")}
        dont={
          <>
            <Input placeholder="Probe name" aria-label="Probe name" />
          </>
        }
        do={
          <>
            <Label>Probe name</Label>
            <Input placeholder="SYD-03" aria-label="Probe name" />
          </>
        }
      />

      <Guidance
        pair={pair("invalid-needs-a-message")}
        dont={
          <>
            <Label>Threshold</Label>
            <Input aria-invalid defaultValue="3.60000" aria-label="Threshold" />
          </>
        }
        do={
          <>
            <Label>Threshold</Label>
            <Input
              aria-invalid
              aria-describedby="threshold-error"
              defaultValue="3.60000"
              aria-label="Threshold"
            />
            <span
              id="threshold-error"
              className="text-body-sm text-content-danger-emphasis"
            >
              MOS is measured to one decimal. Use 3.6.
            </span>
          </>
        }
      />

      <Guidance
        pair={pair("disabled-is-not-read-only")}
        dont={
          <>
            <Label>Probe</Label>
            <Input disabled defaultValue="SYD-03" aria-label="Probe" />
          </>
        }
        do={
          <>
            <Label>Probe</Label>
            <Input readOnly defaultValue="SYD-03" aria-label="Probe" />
          </>
        }
      />

      <Guidance
        pair={pair("placeholder-shows-format")}
        width="wide"
        dont={<Input placeholder="Enter the probe name" />}
        do={<Input placeholder="SYD-03" />}
      />

      <Guidance
        pair={pair("known-set-is-a-select")}
        width="wide"
        stage="tall"
        dont={
          <Field>
            <FieldLabel>Region</FieldLabel>
            <FieldControl>
              <Input placeholder="Sydney" />
            </FieldControl>
          </Field>
        }
        do={
          <Field>
            <FieldLabel>Region</FieldLabel>
            <FieldControl>
              <Select
                label="Region"
                options={[
                  { value: "syd", label: "Sydney" },
                  { value: "sin", label: "Singapore" },
                  { value: "lon", label: "London" },
                ]}
              />
            </FieldControl>
          </Field>
        }
      />
    </GuidanceStory>
  ),
};
