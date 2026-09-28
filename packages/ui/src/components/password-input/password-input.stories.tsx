import type { Meta, StoryObj } from "@storybook/react";
import { PasswordInput } from "./password-input";
import { Field, FieldControl, FieldDescription, FieldLabel } from "../field/field";

const meta: Meta<typeof PasswordInput> = {
  title: "Components/PasswordInput",
  component: PasswordInput,
  parameters: { docs: { description: { component: "Figma Input `Type=Password`: the field plus an eye that shows and hides the value." } } },
  args: { placeholder: "••••••••", "aria-label": "Password" },
  argTypes: { size: { control: "inline-radio", options: ["sm", "md"] }, disabled: { control: "boolean" } },
  decorators: [(S) => <div className="w-72"><S /></div>],
};
export default meta;
type Story = StoryObj<typeof PasswordInput>;

export const Default: Story = {};
export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-col gap-3">
      <PasswordInput {...args} size="sm" />
      <PasswordInput {...args} size="md" />
    </div>
  ),
};
export const NewPassword: Story = {
  render: () => (
    <Field>
      <FieldLabel required>New password</FieldLabel>
      <FieldControl required><PasswordInput autoComplete="new-password" /></FieldControl>
      <FieldDescription>At least 12 characters.</FieldDescription>
    </Field>
  ),
};
export const Disabled: Story = { args: { disabled: true, defaultValue: "secret" } };
