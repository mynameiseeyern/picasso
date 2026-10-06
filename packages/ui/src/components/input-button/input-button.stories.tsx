import type { Meta, StoryObj } from "@storybook/react";
import { Calendar, Filter } from "lucide-react";
import { InputButton } from "./input-button";
import guidance from "./guidance.json";
import { Guidance, GuidanceStory, pairOf } from "@/stories/guidance";
import { Input } from "../input/input";

const meta: Meta<typeof InputButton> = {
  title: "Components/InputButton",
  component: InputButton,
  parameters: {
    docs: {
      description: {
        component:
          "Figma's `Input button`: a button dressed as a field, for opening a picker. " +
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

const pair = pairOf(guidance);

export const DoAndDont: Story = {
  name: "Do and Don't",
  parameters: { controls: { disable: true } },
  render: () => (
    <GuidanceStory>
      <Guidance
        pair={pair("button-not-readonly-input")}
        dont={<Input readOnly value="12 Mar 2026" />}
        do={<InputButton icon={<Calendar aria-hidden />} value="12 Mar 2026" />}
      />

      <Guidance
        pair={pair("placeholder-when-empty")}
        dont={<InputButton icon={<Filter aria-hidden />} value="Select…" />}
        do={<InputButton icon={<Filter aria-hidden />} placeholder="Select…" />}
      />
    </GuidanceStory>
  ),
};
