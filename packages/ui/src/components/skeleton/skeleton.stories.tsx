import type { Meta, StoryObj } from "@storybook/react";
import { Skeleton, SkeletonText } from "./skeleton";
import { Card, CardContent, CardHeader } from "../card/card";
import guidance from "./guidance.json";
import { Guidance, GuidanceStory, pairOf } from "@/stories/guidance";
import { Button } from "../button/button";

const meta: Meta<typeof Skeleton> = {
  title: "Components/Skeleton",
  component: Skeleton,
  parameters: {
    docs: {
      description: {
        component:
          "The shape of content that has not arrived. Match what is actually " +
          "coming — a skeleton is a promise about the layout, and breaking it " +
          "makes the page jump. No Figma component exists for this one yet.",
      },
    },
  },
  argTypes: {
    shape: { control: "inline-radio", options: ["block", "circle"] },
  },
};
export default meta;
type Story = StoryObj<typeof Skeleton>;

export const Default: Story = {
  render: (args) => <Skeleton shape={args.shape} className="h-4 w-48" />,
};

export const Text: Story = {
  render: () => (
    <div className="w-80">
      <SkeletonText lines={3} />
    </div>
  ),
};

/** The frame is real; only what is loading is greyed. */
export const InACard: Story = {
  name: "In a card",
  render: () => (
    <div className="w-80">
      <Card aria-busy>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Skeleton shape="circle" className="size-10" />
              <div className="flex-1">
                <SkeletonText lines={2} />
              </div>
            </div>
            <Skeleton className="h-24 w-full" />
          </div>
        </CardContent>
      </Card>
    </div>
  ),
};

/** Matching the shape of the table that is about to land. */
export const ATable: Story = {
  name: "A table",
  render: () => (
    <div className="flex w-96 flex-col gap-3" aria-busy>
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-10" />
        </div>
      ))}
    </div>
  ),
};

/**
 * Narrow — 328, a 360 phone minus its gutters. Every other story here pins a
 * width well above that, so this is the one that shows what a phone does to
 * it, and the one the overflow sweep can measure.
 */
export const Narrow: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex w-82 flex-col gap-3" aria-busy>
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-10" />
        </div>
      ))}
    </div>
  ),
};

const pair = pairOf(guidance);

export const DoAndDont: Story = {
  name: "Do and Don't",
  parameters: { controls: { disable: true } },
  render: () => (
    <GuidanceStory>
      <Guidance
        pair={pair("match-the-real-thing")}
        width="wide"
        stage="tall"
        dont={
          <div className="w-full space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        }
        do={
          <div className="w-full space-y-3" aria-busy>
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-10" />
              </div>
            ))}
          </div>
        }
      />

      <Guidance
        pair={pair("not-a-spinner")}
        width="wide"
        dont={<Skeleton className="h-9 w-28" />}
        do={<Button loading>Save changes</Button>}
      />

      <Guidance
        pair={pair("dont-skeleton-the-chrome")}
        width="wide"
        stage="tall"
        dont={
          <div className="w-full space-y-3">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        }
        do={
          <div className="w-full space-y-3">
            <p className="text-label-md text-content-neutral-emphasis">
              Endpoints
            </p>
            <Button size="sm">Add endpoint</Button>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        }
      />
    </GuidanceStory>
  ),
};
