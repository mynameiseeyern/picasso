import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { Calendar, ChevronDown, Copy, Minus, Plus, RotateCcw } from "lucide-react";
import { Button } from "../button/button";
import { ButtonGroup } from "./button-group";

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
    orientation: { control: "inline-radio", options: ["horizontal", "vertical"] },
  },
};
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

function Guidance({
  variant,
  caption,
  children,
}: {
  variant: "do" | "dont";
  caption: string;
  children: React.ReactNode;
}) {
  const isDo = variant === "do";
  return (
    <figure
      className={
        "m-0 flex-1 min-w-72 rounded-md border-2 p-4 " +
        (isDo ? "border-line-success-emphasis" : "border-line-danger-emphasis")
      }
    >
      <div className="flex min-h-20 items-center">{children}</div>
      <figcaption className="mt-4 text-label-sm">
        <span className={isDo ? "text-content-success-emphasis" : "text-content-danger-emphasis"}>
          {isDo ? "✓ Do" : "✗ Don't"}
        </span>
        <span className="text-content-neutral-muted"> — {caption}</span>
      </figcaption>
    </figure>
  );
}

export const DoAndDont: Story = {
  name: "Do and Don't",
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-4">
        <Guidance variant="dont" caption="Unrelated actions joined because they were adjacent — and Delete is now one pixel from Save.">
          <ButtonGroup aria-label="Bad">
            <Button variant="outline">Save</Button>
            <Button variant="outline">Cancel</Button>
            <Button variant="destructive">Delete</Button>
          </ButtonGroup>
        </Guidance>
        <Guidance variant="do" caption="Variations of one job, so the shared edge means something.">
          <ButtonGroup aria-label="Good">
            <Button variant="outline">Day</Button>
            <Button variant="outline">Week</Button>
            <Button variant="outline">Month</Button>
          </ButtonGroup>
        </Guidance>
      </div>

      <div className="flex flex-wrap gap-4">
        <Guidance variant="dont" caption="Five primaries competing — no hierarchy left to offer.">
          <ButtonGroup aria-label="Bad">
            <Button>Day</Button>
            <Button>Week</Button>
            <Button>Month</Button>
            <Button>Quarter</Button>
            <Button>Year</Button>
          </ButtonGroup>
        </Guidance>
        <Guidance variant="do" caption="Solid is for one action plus its options; peers are Outline.">
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
        </Guidance>
      </div>

      <div className="flex flex-wrap gap-4">
        <Guidance variant="dont" caption="Bare icons with no names — nothing beside them to borrow meaning from.">
          <ButtonGroup aria-label="Bad">
            <Button variant="outline" size="icon-md">
              <Calendar />
            </Button>
            <Button variant="outline" size="icon-md">
              <Copy />
            </Button>
          </ButtonGroup>
        </Guidance>
        <Guidance variant="do" caption="Each icon button carries its own name, and the group carries theirs.">
          <ButtonGroup aria-label="Row actions">
            <Button variant="outline" size="icon-md" aria-label="Change date range">
              <Calendar />
            </Button>
            <Button variant="outline" size="icon-md" aria-label="Duplicate">
              <Copy />
            </Button>
          </ButtonGroup>
        </Guidance>
      </div>
    </div>
  ),
};
