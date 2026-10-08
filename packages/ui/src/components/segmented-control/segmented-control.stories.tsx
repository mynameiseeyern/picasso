import type { Meta, StoryObj } from "@storybook/react";
import { ArrowDown, ArrowUp, LayoutGrid, List } from "lucide-react";
import { SegmentedControl, SegmentedControlItem } from "./segmented-control";
import { Button } from "../button/button";
import { ButtonGroup } from "../button-group/button-group";

import guidance from "./guidance.json";
import { Guidance, GuidanceStory, pairOf } from "@/stories/guidance";

const meta: Meta<typeof SegmentedControl> = {
  title: "Components/Segmented control",
  component: SegmentedControl,
  parameters: {
    docs: {
      description: {
        component:
          "A choice that stays selected, drawn as one control: a muted track " +
          "with the current option on a raised thumb. It is a radio group — " +
          "one option is always selected and the arrow keys move it. For " +
          "actions, use ButtonGroup; for panels of content, use Tabs.",
      },
    },
  },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md"] },
    fullWidth: { control: "boolean" },
    disabled: { control: "boolean" },
  },
};
const pair = pairOf(guidance);

export default meta;
type Story = StoryObj<typeof SegmentedControl>;

export const Default: Story = {
  render: (args) => (
    <SegmentedControl aria-label="Range" defaultValue="week" {...args}>
      <SegmentedControlItem value="day">Day</SegmentedControlItem>
      <SegmentedControlItem value="week">Week</SegmentedControlItem>
      <SegmentedControlItem value="month">Month</SegmentedControlItem>
    </SegmentedControl>
  ),
};

/** An icon before the label, at 16. The label still carries the meaning. */
export const WithIcons: Story = {
  name: "With icons",
  render: (args) => (
    <SegmentedControl aria-label="Order" defaultValue="asc" {...args}>
      <SegmentedControlItem value="asc">
        <ArrowUp aria-hidden /> Ascending
      </SegmentedControlItem>
      <SegmentedControlItem value="desc">
        <ArrowDown aria-hidden /> Descending
      </SegmentedControlItem>
    </SegmentedControl>
  ),
};

/** Icon-only options need a name each: the icon is not one. */
export const IconOnly: Story = {
  name: "Icon only",
  render: (args) => (
    <SegmentedControl aria-label="View as" defaultValue="list" {...args}>
      <SegmentedControlItem value="list" aria-label="List">
        <List aria-hidden />
      </SegmentedControlItem>
      <SegmentedControlItem value="grid" aria-label="Grid">
        <LayoutGrid aria-hidden />
      </SegmentedControlItem>
    </SegmentedControl>
  ),
};

/** 36 and 32 — Button's and Input's heights, so it sits in a row with either. */
export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col items-start gap-4">
      {(["md", "sm"] as const).map((size) => (
        <SegmentedControl
          key={size}
          size={size}
          aria-label={`Range, ${size}`}
          defaultValue="week"
        >
          <SegmentedControlItem value="day">Day</SegmentedControlItem>
          <SegmentedControlItem value="week">Week</SegmentedControlItem>
          <SegmentedControlItem value="month">Month</SegmentedControlItem>
        </SegmentedControl>
      ))}
    </div>
  ),
};

/** In a sheet or a narrow column the options share the width. */
export const FullWidth: Story = {
  name: "Full width",
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="w-80">
      <SegmentedControl fullWidth aria-label="Order" defaultValue="asc">
        <SegmentedControlItem value="asc">
          <ArrowUp aria-hidden /> Ascending
        </SegmentedControlItem>
        <SegmentedControlItem value="desc">
          <ArrowDown aria-hidden /> Descending
        </SegmentedControlItem>
      </SegmentedControl>
    </div>
  ),
};

export const Disabled: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col items-start gap-4">
      <SegmentedControl aria-label="Range" defaultValue="week" disabled>
        <SegmentedControlItem value="day">Day</SegmentedControlItem>
        <SegmentedControlItem value="week">Week</SegmentedControlItem>
        <SegmentedControlItem value="month">Month</SegmentedControlItem>
      </SegmentedControl>
      <SegmentedControl aria-label="Range" defaultValue="week">
        <SegmentedControlItem value="day">Day</SegmentedControlItem>
        <SegmentedControlItem value="week">Week</SegmentedControlItem>
        <SegmentedControlItem value="month" disabled>
          Month
        </SegmentedControlItem>
      </SegmentedControl>
    </div>
  ),
};

/**
 * Narrow — 328, a 360 phone minus its gutters. Four segments is where the
 * labels stop fitting; this is the width that decides whether the set holds or
 * needs fewer options.
 */
export const Narrow: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex w-82 flex-col gap-3 border border-line-neutral-muted p-3">
      <SegmentedControl aria-label="Range" defaultValue="week">
        <SegmentedControlItem value="day">Day</SegmentedControlItem>
        <SegmentedControlItem value="week">Week</SegmentedControlItem>
        <SegmentedControlItem value="month">Month</SegmentedControlItem>
      </SegmentedControl>
      <SegmentedControl aria-label="Scope" defaultValue="site">
        <SegmentedControlItem value="fleet">Fleet</SegmentedControlItem>
        <SegmentedControlItem value="site">Site</SegmentedControlItem>
        <SegmentedControlItem value="endpoint">Endpoint</SegmentedControlItem>
        <SegmentedControlItem value="trunk">Trunk</SegmentedControlItem>
      </SegmentedControl>
    </div>
  ),
};

export const DoAndDont: Story = {
  name: "Do and Don't",
  parameters: { controls: { disable: true } },
  render: () => (
    <GuidanceStory>
      <Guidance
        pair={pair("choice-not-actions")}
        width="wide"
        dont={
          <ButtonGroup aria-label="Order">
            <Button variant="secondary">
              <ArrowUp aria-hidden /> Ascending
            </Button>
            <Button variant="outline">
              <ArrowDown aria-hidden /> Descending
            </Button>
          </ButtonGroup>
        }
        do={
          <SegmentedControl aria-label="Order" defaultValue="asc">
            <SegmentedControlItem value="asc">
              <ArrowUp aria-hidden /> Ascending
            </SegmentedControlItem>
            <SegmentedControlItem value="desc">
              <ArrowDown aria-hidden /> Descending
            </SegmentedControlItem>
          </SegmentedControl>
        }
      />

      <Guidance
        pair={pair("always-one-selected")}
        dont={
          <SegmentedControl aria-label="Range">
            <SegmentedControlItem value="day">Day</SegmentedControlItem>
            <SegmentedControlItem value="week">Week</SegmentedControlItem>
            <SegmentedControlItem value="month">Month</SegmentedControlItem>
          </SegmentedControl>
        }
        do={
          <SegmentedControl aria-label="Range" defaultValue="week">
            <SegmentedControlItem value="day">Day</SegmentedControlItem>
            <SegmentedControlItem value="week">Week</SegmentedControlItem>
            <SegmentedControlItem value="month">Month</SegmentedControlItem>
          </SegmentedControl>
        }
      />

      <Guidance
        pair={pair("short-and-few")}
        width="wide"
        dont={
          <SegmentedControl aria-label="Range" defaultValue="d">
            <SegmentedControlItem value="h">Hour</SegmentedControlItem>
            <SegmentedControlItem value="d">Day</SegmentedControlItem>
            <SegmentedControlItem value="w">Week</SegmentedControlItem>
            <SegmentedControlItem value="m">Month</SegmentedControlItem>
            <SegmentedControlItem value="q">Quarter</SegmentedControlItem>
            <SegmentedControlItem value="y">Year</SegmentedControlItem>
          </SegmentedControl>
        }
        do={
          <SegmentedControl aria-label="Range" defaultValue="w">
            <SegmentedControlItem value="d">Day</SegmentedControlItem>
            <SegmentedControlItem value="w">Week</SegmentedControlItem>
            <SegmentedControlItem value="m">Month</SegmentedControlItem>
          </SegmentedControl>
        }
      />
    </GuidanceStory>
  ),
};
