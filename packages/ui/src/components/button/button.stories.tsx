import type { Meta, StoryObj } from "@storybook/react";
import { Download, Plus, Trash2 } from "lucide-react";
import { Button } from "./button";

import guidance from "./guidance.json";
import { Guidance, GuidanceStory, pairOf } from "@/stories/guidance";

const variants = [
  "default",
  "neutral",
  "secondary",
  "outline",
  "ghost",
  "destructive",
  "link",
] as const;
const textSizes = ["xs", "sm", "md", "lg"] as const;
const iconSizes = ["icon-xs", "icon-sm", "icon-md", "icon-lg"] as const;

const meta: Meta<typeof Button> = {
  title: "Components/Button",
  component: Button,
  parameters: {
    docs: {
      description: {
        component:
          "Triggers an action. Structure (variants, sizes, states) comes from the Figma " +
          "component; measurements (height, padding, gap, radius) come from shadcn.",
      },
    },
  },
  argTypes: {
    variant: { control: "select", options: variants },
    size: { control: "select", options: [...textSizes, ...iconSizes] },
    loading: { control: "boolean" },
    disabled: { control: "boolean" },
  },
  args: { children: "Save changes", variant: "default", size: "md" },
};
const pair = pairOf(guidance);

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {};

export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      {variants.map((v) => (
        <Button key={v} variant={v}>
          {v}
        </Button>
      ))}
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        {textSizes.map((s) => (
          <Button key={s} size={s}>
            {s}
          </Button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        {textSizes.map((s) => (
          <Button key={s} size={s}>
            <Download />
            {s}
          </Button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        {iconSizes.map((s) => (
          <Button key={s} size={s} aria-label={`Add (${s})`}>
            <Plus />
          </Button>
        ))}
      </div>
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div className="space-y-3">
      {variants.map((v) => (
        <div key={v} className="flex flex-wrap items-center gap-3">
          <Button variant={v}>Default</Button>
          <Button variant={v} loading>
            Loading
          </Button>
          <Button variant={v} disabled>
            Disabled
          </Button>
        </div>
      ))}
    </div>
  ),
};

/* ------------------------------------------------------------------ */
/* Guidance — rendered, so it breaks when the component does           */
/* ------------------------------------------------------------------ */

/**
 * Narrow — 328, a 360 phone minus its gutters. Two buttons side by side stop
 * fitting here, so the pair stacks and each one fills the width rather than
 * shrinking its label to nothing.
 */
export const Narrow: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex w-82 flex-col gap-4 border border-line-neutral-muted p-3">
      <div className="grid gap-2">
        <Button>Acknowledge and silence for 24 hours</Button>
        <Button variant="outline">Cancel</Button>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button size="sm">
          <Plus />
          Add
        </Button>
        <Button size="sm" variant="outline">
          <Download />
          Export
        </Button>
        <Button size="sm" variant="ghost">
          <Trash2 />
          Delete
        </Button>
      </div>
    </div>
  ),
};

export const DoAndDont: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <GuidanceStory>
      <Guidance
        pair={pair("submit-and-ok")}
        width="narrow"
        stage="short"
        dont={
          <>
            <Button>Submit</Button>
            <Button variant="secondary">Cancel</Button>
          </>
        }
        do={
          <>
            <Button>Save changes</Button>
            <Button variant="secondary">Cancel</Button>
          </>
        }
      />

      <Guidance
        pair={pair("one-primary-per-row")}
        width="narrow"
        stage="short"
        dont={
          <>
            <Button>Save changes</Button>
            <Button>Export CSV</Button>
          </>
        }
        do={
          <>
            <Button>Save changes</Button>
            <Button variant="ghost">Export CSV</Button>
          </>
        }
      />

      <Guidance
        pair={pair("ghost-resting-fill")}
        width="narrow"
        stage="short"
        dont={
          <>
            <Button variant="outline">Filter</Button>
            <Button variant="outline">Sort</Button>
            <Button variant="outline">Group</Button>
          </>
        }
        do={
          <>
            <Button variant="ghost">Filter</Button>
            <Button variant="ghost">Sort</Button>
            <Button variant="ghost">Group</Button>
          </>
        }
      />

      <Guidance
        pair={pair("icon-only-needs-label")}
        width="narrow"
        stage="short"
        dont={
          <Button size="icon-md">
            <Trash2 />
          </Button>
        }
        do={
          <Button size="icon-md" aria-label="Delete probe">
            <Trash2 />
          </Button>
        }
      />

      <Guidance
        pair={pair("link-in-a-box")}
        dont={<Button variant="outline">View the audit log</Button>}
        do={<Button variant="link">View the audit log</Button>}
      />
    </GuidanceStory>
  ),
};
