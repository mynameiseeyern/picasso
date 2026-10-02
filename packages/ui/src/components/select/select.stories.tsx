import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { Select, type SelectOption } from "./select";
import {
  Field,
  FieldControl,
  FieldDescription,
  FieldLabel,
} from "../field/field";

const actions: SelectOption[] = [
  { value: "probe.created", label: "Created", group: "Probe" },
  { value: "probe.updated", label: "Updated", group: "Probe" },
  { value: "probe.deleted", label: "Deleted", group: "Probe" },
  { value: "probe.paused", label: "Paused", group: "Probe" },
  { value: "alert.fired", label: "Fired", group: "Alert" },
  { value: "alert.acknowledged", label: "Acknowledged", group: "Alert" },
  { value: "alert.resolved", label: "Resolved", group: "Alert" },
  { value: "user.signed_in", label: "Signed in", group: "Access" },
  { value: "user.signed_out", label: "Signed out", group: "Access" },
  {
    value: "user.role_changed",
    label: "Role changed",
    group: "Access",
    disabled: true,
  },
];

const meta: Meta<typeof Select> = {
  title: "Components/Select",
  component: Select,
  parameters: {
    docs: {
      description: {
        component:
          "A searchable, multi-select filter (Figma Select 1580:759). The trigger keeps its label and shows a count; " +
          "ticks collect in a draft and commit once on Apply. Escape or a click away discards the draft.",
      },
    },
  },
  args: { label: "Filter actions…", options: actions },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md"] },
    disabled: { control: "boolean" },
  },
  decorators: [
    (S) => (
      <div className="w-50">
        <S />
      </div>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof Select>;

export const Default: Story = {};

export const WithASelection: Story = {
  args: { defaultValue: ["probe.created", "alert.fired", "alert.resolved"] },
};

export const Controlled: Story = {
  render: (args) => {
    const [value, setValue] = React.useState<string[]>([]);
    return (
      <div className="flex flex-col gap-3">
        <Select {...args} value={value} onValueChange={setValue} />
        <p className="text-body-sm text-content-neutral-subtle">
          Applied: {value.length ? value.join(", ") : "nothing"}
        </p>
      </div>
    );
  },
};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-col gap-3">
      <Select {...args} size="sm" />
      <Select {...args} size="md" />
    </div>
  ),
};

export const InAField: Story = {
  render: (args) => (
    <Field>
      <FieldLabel>Event types</FieldLabel>
      <FieldControl>
        <Select {...args} />
      </FieldControl>
      <FieldDescription>Only these appear in the audit log.</FieldDescription>
    </Field>
  ),
};

export const Disabled: Story = {
  args: { disabled: true, defaultValue: ["probe.created"] },
};

/** Invalid is `aria-invalid` on the trigger: the border turns red, and a Field sets it for you. */
export const Invalid: Story = {
  args: { "aria-invalid": true },
};
