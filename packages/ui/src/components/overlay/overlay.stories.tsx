import type { Meta, StoryObj } from "@storybook/react";

import { OverlaySurface } from "./overlay";
import { dropdownMenuItemVariants } from "../dropdown-menu/dropdown-menu";
import { cn } from "@/lib/utils";

import guidance from "./guidance.json";
import { Guidance, GuidanceStory, pairOf } from "@/stories/guidance";

const meta: Meta<typeof OverlaySurface> = {
  title: "Components/Overlay",
  component: OverlaySurface,
  parameters: {
    docs: {
      description: {
        component:
          "The floating card every overlay sits on. Popover, Dropdown menu, " +
          "Dialog and Drawer all put `overlaySurfaceVariants` on their own " +
          "Content element rather than wrapping it, so there is one panel to " +
          "change and it changes everywhere at once.",
      },
    },
  },
  argTypes: {
    density: { control: "inline-radio", options: ["compact", "comfortable"] },
  },
  args: { density: "compact" },
};
export default meta;
type Story = StoryObj<typeof OverlaySurface>;

const pair = pairOf(guidance);

/* The menu row's own classes, because DropdownMenuItem is a Radix primitive
   and only renders inside an open menu. */
function Row({ children }: { children: React.ReactNode }) {
  return <div className={cn(dropdownMenuItemVariants())}>{children}</div>;
}

export const Default: Story = {
  render: (args) => (
    <div className="w-72">
      <OverlaySurface {...args}>
        <Row>Rename</Row>
        <Row>Duplicate</Row>
        <Row>Export</Row>
      </OverlaySurface>
    </div>
  ),
};

/** The two densities side by side — rows against prose. */
export const Densities: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex items-start gap-6">
      <div className="w-64">
        <OverlaySurface density="compact">
          <Row>Rename</Row>
          <Row>Duplicate</Row>
        </OverlaySurface>
      </div>
      <div className="w-64">
        <OverlaySurface density="comfortable">
          <p className="text-label-md text-content-neutral-emphasis">
            Thresholds
          </p>
          <p className="text-body-sm text-content-neutral-muted">
            Warning at 4.0, critical at 3.0. Both apply to the fleet average.
          </p>
        </OverlaySurface>
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
        pair={pair("density-by-content")}
        width="wide"
        stage="tall"
        dont={
          <div className="w-full">
            <OverlaySurface density="comfortable">
              <Row>Rename</Row>
              <Row>Duplicate</Row>
              <Row>Export</Row>
            </OverlaySurface>
          </div>
        }
        do={
          <div className="w-full">
            <OverlaySurface density="compact">
              <Row>Rename</Row>
              <Row>Duplicate</Row>
              <Row>Export</Row>
            </OverlaySurface>
          </div>
        }
      />
    </GuidanceStory>
  ),
};
