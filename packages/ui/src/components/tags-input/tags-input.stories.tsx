import type { Meta, StoryObj } from "@storybook/react";
import { InputChip, TagsInput } from "./tags-input";
import {
  Field,
  FieldControl,
  FieldDescription,
  FieldLabel,
} from "../field/field";

const meta: Meta<typeof TagsInput> = {
  title: "Components/TagsInput",
  component: TagsInput,
  parameters: {
    docs: {
      description: {
        component:
          "Figma Input `Type=Tags` with Input chip. Enter or comma adds, paste splits a list, Backspace in the empty " +
          "field removes the last tag, duplicates are ignored.",
      },
    },
  },
  args: { defaultValue: ["syd-03", "mel-01"], "aria-label": "Hosts" },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md"] },
    disabled: { control: "boolean" },
  },
  decorators: [
    (S) => (
      <div className="w-80">
        <S />
      </div>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof TagsInput>;

export const Default: Story = {};
export const Empty: Story = { args: { defaultValue: [] } };
export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-col gap-3">
      <TagsInput {...args} size="sm" />
      <TagsInput {...args} size="md" />
    </div>
  ),
};
export const Validated: Story = {
  render: () => (
    <Field>
      <FieldLabel>Notify</FieldLabel>
      <FieldControl>
        <TagsInput
          defaultValue={["ops@ir.com"]}
          validate={(t) => /.+@.+\..+/.test(t)}
        />
      </FieldControl>
      <FieldDescription>Email addresses, separated by commas.</FieldDescription>
    </Field>
  ),
};
export const Disabled: Story = { args: { disabled: true } };
export const Chip: Story = {
  render: () => (
    <div className="flex gap-2">
      <InputChip>Label</InputChip>
      <InputChip onRemove={() => {}}>Removable</InputChip>
      <InputChip onRemove={() => {}} disabled>
        Disabled
      </InputChip>
    </div>
  ),
};
