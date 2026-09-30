import type { Meta, StoryObj } from "@storybook/react";
import { Command } from "lucide-react";
import { Button } from "../button/button";
import { Kbd, KbdGroup } from "./kbd";

const backgrounds = [
  "default",
  "neutral",
  "brand",
  "opaque",
  "on-emphasis",
] as const;

const meta: Meta<typeof Kbd> = {
  title: "Components/Kbd",
  component: Kbd,
  parameters: {
    docs: {
      description: {
        component:
          "A keyboard key or shortcut. Structure (the Background axis) comes from the Figma " +
          "component; measurements come from shadcn. Radius is radius/sm.",
      },
    },
  },
  argTypes: { background: { control: "select", options: backgrounds } },
  args: { children: "Ctrl", background: "default" },
};
export default meta;
type Story = StoryObj<typeof Kbd>;

export const Playground: Story = {};

export const Backgrounds: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      {backgrounds
        .filter((b) => b !== "on-emphasis")
        .map((b) => (
          <Kbd key={b} background={b}>
            Ctrl
          </Kbd>
        ))}
      <span className="inline-flex items-center rounded-md bg-surface-primary-emphasis p-2">
        <Kbd background="on-emphasis">Ctrl</Kbd>
      </span>
    </div>
  ),
};

export const Group: Story = {
  render: () => (
    <KbdGroup>
      <Kbd>
        <Command />
      </Kbd>
      <Kbd>K</Kbd>
    </KbdGroup>
  ),
};

export const InButton: Story = {
  render: () => (
    <Button>
      Search
      <KbdGroup>
        <Kbd background="on-emphasis">Ctrl</Kbd>
        <Kbd background="on-emphasis">K</Kbd>
      </KbdGroup>
    </Button>
  ),
};
