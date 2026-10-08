import type { Meta, StoryObj } from "@storybook/react";
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "./popover";
import { Button } from "../button/button";
import { Field, FieldControl, FieldLabel } from "../field/field";
import { Input } from "../input/input";
import guidance from "./guidance.json";
import { Guidance, GuidanceStory, pairOf } from "@/stories/guidance";
import { OverlaySurface } from "../overlay/overlay";

const meta: Meta<typeof Popover> = {
  title: "Components/Popover",
  component: Popover,
  parameters: {
    docs: {
      description: {
        component:
          "A small panel of content or controls, anchored to what opened it. " +
          "It is the Comfortable overlay surface — change that surface and " +
          "every anchored panel moves with it.",
      },
    },
  },
  decorators: [(S) => <div className="flex justify-center py-16">{S()}</div>],
};
export default meta;
type Story = StoryObj<typeof Popover>;

export const Default: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Dimensions</Button>
      </PopoverTrigger>
      <PopoverContent>
        <PopoverHeader>
          <PopoverTitle>Dimensions</PopoverTitle>
          <PopoverDescription>
            Set the dimensions for the layer.
          </PopoverDescription>
        </PopoverHeader>
        <div className="flex flex-col gap-3">
          <Field>
            <FieldLabel>Width</FieldLabel>
            <FieldControl>
              <Input defaultValue="100%" />
            </FieldControl>
          </Field>
          <Field>
            <FieldLabel>Height</FieldLabel>
            <FieldControl>
              <Input defaultValue="25px" />
            </FieldControl>
          </Field>
        </div>
      </PopoverContent>
    </Popover>
  ),
};

/** Without a header, give the panel a name yourself. */
export const NoHeader: Story = {
  name: "No header",
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Filters</Button>
      </PopoverTrigger>
      <PopoverContent aria-label="Filters">
        <p className="text-body-md text-content-neutral-muted">
          Anything can go in here.
        </p>
      </PopoverContent>
    </Popover>
  ),
};

/** Sides, so the anchoring is visible. */
export const Sides: Story = {
  render: () => (
    <div className="flex gap-3">
      {(["top", "right", "bottom", "left"] as const).map((side) => (
        <Popover key={side}>
          <PopoverTrigger asChild>
            <Button variant="outline">{side}</Button>
          </PopoverTrigger>
          <PopoverContent side={side} aria-label={side}>
            <p className="text-body-md text-content-neutral-muted">
              On the {side}.
            </p>
          </PopoverContent>
        </Popover>
      ))}
    </div>
  ),
};

/** A close inside the panel, for when dismissing by clicking away is not obvious. */
export const WithAClose: Story = {
  name: "With a close",
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Share</Button>
      </PopoverTrigger>
      <PopoverContent>
        <PopoverHeader>
          <PopoverTitle>Share this dashboard</PopoverTitle>
          <PopoverDescription>
            Anyone with the link can view it.
          </PopoverDescription>
        </PopoverHeader>
        <div className="flex justify-end gap-2">
          <PopoverClose asChild>
            <Button variant="ghost" size="sm">
              Cancel
            </Button>
          </PopoverClose>
          <PopoverClose asChild>
            <Button size="sm">Copy link</Button>
          </PopoverClose>
        </div>
      </PopoverContent>
    </Popover>
  ),
};

const pair = pairOf(guidance);

/**
 * Narrow — 328, a 360 phone minus its gutters. A popover is anchored, and on a
 * phone the edge it anchors against is the viewport, so there is nowhere for it
 * to go. Below `md` the phone form of this is `BottomSheet` — this story is
 * here to show the squeeze, not to endorse it.
 */
export const Narrow: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex w-82 justify-end border border-line-neutral-muted p-3">
      <Popover defaultOpen>
        <PopoverTrigger asChild>
          <Button variant="outline">Dimensions</Button>
        </PopoverTrigger>
        <PopoverContent>
          <PopoverHeader>
            <PopoverTitle>Dimensions</PopoverTitle>
          </PopoverHeader>
          <Field>
            <FieldLabel>Width</FieldLabel>
            <FieldControl>
              <Input defaultValue="328" aria-label="Width" />
            </FieldControl>
          </Field>
        </PopoverContent>
      </Popover>
    </div>
  ),
};

export const DoAndDont: Story = {
  name: "Do and Don't",
  parameters: { controls: { disable: true } },
  render: () => (
    <GuidanceStory>
      <Guidance
        pair={pair("give-it-a-name")}
        width="wide"
        stage="tall"
        dont={
          <div className="w-full">
            <OverlaySurface>
              <div className="space-y-3">
                <Field>
                  <FieldLabel>Warning</FieldLabel>
                  <FieldControl>
                    <Input defaultValue="4.0" />
                  </FieldControl>
                </Field>
              </div>
            </OverlaySurface>
          </div>
        }
        do={
          <div className="w-full">
            <OverlaySurface>
              <div className="space-y-3">
                <PopoverHeader>
                  <PopoverTitle>Thresholds</PopoverTitle>
                </PopoverHeader>
                <Field>
                  <FieldLabel>Warning</FieldLabel>
                  <FieldControl>
                    <Input defaultValue="4.0" />
                  </FieldControl>
                </Field>
              </div>
            </OverlaySurface>
          </div>
        }
      />
    </GuidanceStory>
  ),
};
