import type { Meta, StoryObj } from "@storybook/react";
import { Calendar, Filter } from "lucide-react";
import { InputButton } from "./input-button";

const meta: Meta<typeof InputButton> = {
  title: "Components/InputButton",
  component: InputButton,
  parameters: {
    docs: {
      description: {
        component:
          "Figma Input `Type=Button` / `Type=Select trigger`: a button dressed as a field, for opening a picker. " +
          "Select uses it as its trigger.",
      },
    },
  },
  args: { icon: <Calendar />, placeholder: "Pick a date" },
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
type Story = StoryObj<typeof InputButton>;

export const Empty: Story = {};
export const WithAValue: Story = { args: { value: "28 Sep 2026" } };
export const Open: Story = { args: { "aria-expanded": true } };
export const Invalid: Story = { args: { "aria-invalid": true } };
export const Disabled: Story = { args: { disabled: true } };
export const AsAFilter: Story = {
  args: { icon: <Filter />, placeholder: "Filter actions…" },
};
