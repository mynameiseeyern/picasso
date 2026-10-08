import type { Meta, StoryObj } from "@storybook/react";
import { Command } from "lucide-react";
import { Button } from "../button/button";
import { Kbd, KbdGroup } from "./kbd";
import guidance from "./guidance.json";
import { Guidance, GuidanceStory, pairOf } from "@/stories/guidance";

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

const pair = pairOf(guidance);

/**
 * Narrow — 328, a 360 phone minus its gutters. A shortcut hint sits at the end
 * of a row of text, which is where it gets squeezed; it must not wrap mid-combo.
 */
export const Narrow: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex w-82 flex-col gap-3 border border-line-neutral-muted p-3">
      <div className="flex items-center justify-between gap-2 text-body-md text-content-neutral-emphasis">
        <span className="truncate">Search endpoints</span>
        <KbdGroup>
          <Kbd>Ctrl</Kbd>
          <Kbd>Shift</Kbd>
          <Kbd>K</Kbd>
        </KbdGroup>
      </div>
      <div className="grid gap-2">
        <Button>
          Open command palette
          <KbdGroup>
            <Kbd background="on-emphasis">
              <Command />
            </Kbd>
            <Kbd background="on-emphasis">K</Kbd>
          </KbdGroup>
        </Button>
      </div>
    </div>
  ),
};

export const DoAndDont: Story = {
  name: "Do and Don't",
  parameters: { controls: { disable: true } },
  render: () => (
    <GuidanceStory>
      <Guidance
        pair={pair("on-emphasis-only-on-fills")}
        dont={<Kbd background="on-emphasis">K</Kbd>}
        do={
          <Button>
            Search
            <Kbd background="on-emphasis">K</Kbd>
          </Button>
        }
      />

      <Guidance
        pair={pair("group-combos")}
        dont={<Kbd>Ctrl+K</Kbd>}
        do={
          <KbdGroup>
            <Kbd>Ctrl</Kbd>
            <Kbd>K</Kbd>
          </KbdGroup>
        }
      />
    </GuidanceStory>
  ),
};
