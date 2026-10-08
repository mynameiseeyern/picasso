import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import {
  Calendar,
  ChevronDown,
  Copy,
  Minus,
  Plus,
  RotateCcw,
} from "lucide-react";
import { Button } from "../button/button";
import { ButtonGroup } from "./button-group";

import guidance from "./guidance.json";
import { Guidance, GuidanceStory, pairOf } from "@/stories/guidance";
import {
  SegmentedControl,
  SegmentedControlItem,
} from "../segmented-control/segmented-control";

const meta: Meta<typeof ButtonGroup> = {
  title: "Components/Button group",
  component: ButtonGroup,
  parameters: {
    docs: {
      description: {
        component:
          "Several buttons that belong to one decision, joined into a single " +
          "control. Nothing here stays pressed — if one option should remain " +
          "selected afterwards, the control is Radio, not this.",
      },
    },
  },
  argTypes: {
    orientation: {
      control: "inline-radio",
      options: ["horizontal", "vertical"],
    },
  },
};
const pair = pairOf(guidance);

export default meta;
type Story = StoryObj<typeof ButtonGroup>;

export const Default: Story = {
  render: (args) => (
    <ButtonGroup aria-label="View as" {...args}>
      <Button variant="outline">Day</Button>
      <Button variant="outline">Week</Button>
      <Button variant="outline">Month</Button>
    </ButtonGroup>
  ),
};

/**
 * The group owns the geometry; each button owns its colour. Figma restates
 * the variant on the group because a component there cannot read its children.
 */
export const Variants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-4">
      {(["default", "outline", "secondary"] as const).map((v) => (
        <ButtonGroup key={v} aria-label={v}>
          <Button variant={v}>Day</Button>
          <Button variant={v}>Week</Button>
          <Button variant={v}>Month</Button>
          <Button variant={v} size="icon-md" aria-label="More views">
            <ChevronDown />
          </Button>
        </ButtonGroup>
      ))}
    </div>
  ),
};

export const Vertical: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <ButtonGroup orientation="vertical" aria-label="Export">
      <Button variant="outline">Export as CSV</Button>
      <Button variant="outline">Export as PDF</Button>
      <Button variant="outline">Copy to clipboard</Button>
    </ButtonGroup>
  ),
};

/** Any number of children: the ends follow whichever buttons are there. */
export const AnyLength: Story = {
  name: "Any number of children",
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      {[1, 2, 3, 5].map((n) => (
        <ButtonGroup key={n} aria-label={`${n} buttons`}>
          {Array.from({ length: n }, (_, i) => (
            <Button key={i} variant="outline">
              {i + 1}
            </Button>
          ))}
        </ButtonGroup>
      ))}
    </div>
  ),
};

/** A split of one action: the action, and its options. */
export const SplitAction: Story = {
  name: "A split action",
  parameters: { controls: { disable: true } },
  render: () => (
    <ButtonGroup aria-label="Export">
      <Button>Export</Button>
      <Button size="icon-md" aria-label="Export options">
        <ChevronDown />
      </Button>
    </ButtonGroup>
  ),
};

export const IconsOnly: Story = {
  name: "Icons only",
  parameters: { controls: { disable: true } },
  render: () => (
    <ButtonGroup aria-label="Zoom">
      <Button variant="outline" size="icon-md" aria-label="Zoom out">
        <Minus />
      </Button>
      <Button variant="outline" size="icon-md" aria-label="Reset zoom">
        <RotateCcw />
      </Button>
      <Button variant="outline" size="icon-md" aria-label="Zoom in">
        <Plus />
      </Button>
    </ButtonGroup>
  ),
};

/* ------------------------------------------------------------------ */

/**
 * Narrow — 328, a 360 phone minus its gutters. A group does not wrap: the
 * members are joined, so wrapping would break the join. Past the width it
 * fits, drop to icons or split the group.
 */
export const Narrow: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex w-82 flex-col gap-4 border border-line-neutral-muted p-3">
      <ButtonGroup>
        <Button variant="outline">Day</Button>
        <Button variant="outline">Week</Button>
        <Button variant="outline">Month</Button>
      </ButtonGroup>
      {/* Icon-only is the phone form of a group that no longer fits. */}
      <ButtonGroup>
        <Button variant="outline" aria-label="Zoom out">
          <Minus />
        </Button>
        <Button variant="outline" aria-label="Reset">
          <RotateCcw />
        </Button>
        <Button variant="outline" aria-label="Zoom in">
          <Plus />
        </Button>
      </ButtonGroup>
    </div>
  ),
};

export const DoAndDont: Story = {
  name: "Do and Don't",
  parameters: { controls: { disable: true } },
  render: () => (
    <GuidanceStory>
      <Guidance
        pair={pair("same-level-actions")}
        dont={
          <>
            <ButtonGroup aria-label="Bad">
              <Button variant="outline">Save</Button>
              <Button variant="outline">Cancel</Button>
              <Button variant="destructive">Delete</Button>
            </ButtonGroup>
          </>
        }
        do={
          <>
            <ButtonGroup aria-label="Good">
              <Button variant="outline">Day</Button>
              <Button variant="outline">Week</Button>
              <Button variant="outline">Month</Button>
            </ButtonGroup>
          </>
        }
      />

      <Guidance
        pair={pair("one-primary")}
        dont={
          <>
            <ButtonGroup aria-label="Bad">
              <Button>Day</Button>
              <Button>Week</Button>
              <Button>Month</Button>
              <Button>Quarter</Button>
              <Button>Year</Button>
            </ButtonGroup>
          </>
        }
        do={
          <>
            <div className="flex flex-col gap-3">
              <ButtonGroup aria-label="Split">
                <Button>Export</Button>
                <Button size="icon-md" aria-label="Export options">
                  <ChevronDown />
                </Button>
              </ButtonGroup>
              <ButtonGroup aria-label="Peers">
                <Button variant="outline">Day</Button>
                <Button variant="outline">Week</Button>
                <Button variant="outline">Month</Button>
              </ButtonGroup>
            </div>
          </>
        }
      />

      <Guidance
        pair={pair("icon-buttons-need-names")}
        dont={
          <>
            <ButtonGroup aria-label="Bad">
              <Button variant="outline" size="icon-md">
                <Calendar />
              </Button>
              <Button variant="outline" size="icon-md">
                <Copy />
              </Button>
            </ButtonGroup>
          </>
        }
        do={
          <>
            <ButtonGroup aria-label="Row actions">
              <Button
                variant="outline"
                size="icon-md"
                aria-label="Change date range"
              >
                <Calendar />
              </Button>
              <Button variant="outline" size="icon-md" aria-label="Duplicate">
                <Copy />
              </Button>
            </ButtonGroup>
          </>
        }
      />

      <Guidance
        pair={pair("group-is-not-a-choice")}
        width="wide"
        dont={
          <ButtonGroup aria-label="View as">
            <Button variant="outline">Day</Button>
            <Button variant="secondary">Week</Button>
            <Button variant="outline">Month</Button>
          </ButtonGroup>
        }
        do={
          <SegmentedControl defaultValue="week" aria-label="View as">
            <SegmentedControlItem value="day">Day</SegmentedControlItem>
            <SegmentedControlItem value="week">Week</SegmentedControlItem>
            <SegmentedControlItem value="month">Month</SegmentedControlItem>
          </SegmentedControl>
        }
      />

      <Guidance
        pair={pair("keep-it-short")}
        width="wide"
        stage="tall"
        dont={
          <ButtonGroup aria-label="Actions">
            {["Copy", "Move", "Rename", "Export", "Archive", "Share"].map(
              (l) => (
                <Button key={l} variant="outline" size="sm">
                  {l}
                </Button>
              ),
            )}
          </ButtonGroup>
        }
        do={
          <ButtonGroup aria-label="Actions">
            <Button variant="outline" size="sm">
              Copy
            </Button>
            <Button variant="outline" size="sm">
              Export
            </Button>
            <Button variant="outline" size="sm">
              More
              <ChevronDown aria-hidden />
            </Button>
          </ButtonGroup>
        }
      />
    </GuidanceStory>
  ),
};
