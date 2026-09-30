import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Separator } from "./separator";
import { Card, CardContent, CardHeader, CardTitle } from "../card/card";
import { Button } from "../button/button";

import guidance from "./guidance.json";
import { Guidance, GuidanceStory, pairOf } from "@/stories/guidance";

const meta: Meta<typeof Separator> = {
  title: "Components/Separator",
  component: Separator,
  parameters: {
    docs: {
      description: {
        component:
          "A 1px rule dividing related groups inside one surface. Decorative " +
          "by default — the headings and landmarks around it already carry " +
          "the grouping for a screen reader.",
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
type Story = StoryObj<typeof Separator>;

export const Default: Story = {
  render: () => (
    <div className="flex w-80 flex-col gap-4">
      <p className="text-body-md text-content-neutral-emphasis">
        Above the rule
      </p>
      <Separator />
      <p className="text-body-md text-content-neutral-emphasis">Below it</p>
    </div>
  ),
};

/** In a toolbar it needs a height — here from the row's own stretch. */
export const Vertical: Story = {
  render: () => (
    <div className="flex h-9 items-center gap-2">
      <Button variant="ghost" size="sm">
        Copy
      </Button>
      <Button variant="ghost" size="sm">
        Duplicate
      </Button>
      <Separator orientation="vertical" />
      <Button variant="ghost" size="sm">
        Archive
      </Button>
    </div>
  ),
};

/** Sections of one card — the case the rule is actually for. */
export const InACard: Story = {
  name: "In a card",
  render: () => (
    <div className="w-80">
      <Card>
        <CardHeader>
          <CardTitle>Endpoint</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex justify-between text-body-sm">
              <span className="text-content-neutral-subtle">Region</span>
              <span>ap-southeast-2</span>
            </div>
            <Separator />
            <div className="flex justify-between text-body-sm">
              <span className="text-content-neutral-subtle">Protocol</span>
              <span>SIP</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  ),
};

/** Announced only where the rule is the sole boundary marker. */
export const Semantic: Story = {
  render: () => (
    <div className="flex w-80 flex-col gap-4">
      <p className="text-body-sm text-content-neutral-subtle">
        decorative={"{false}"} — reaches the accessibility tree
      </p>
      <Separator decorative={false} />
      <p className="text-body-sm text-content-neutral-subtle">
        Use it sparingly.
      </p>
    </div>
  ),
};

const Line = ({ children }: { children: React.ReactNode }) => (
  <div className="text-body-md text-content-neutral-emphasis">{children}</div>
);

export const DoAndDont: Story = {
  name: "Do and Don't",
  parameters: { controls: { disable: true } },
  render: () => (
    <GuidanceStory>
      <Guidance
        pair={pair("one-surface-only")}
        width="wide"
        stage="tall"
        dont={
          <div className="flex w-full flex-col gap-3">
            <Card size="sm">
              <CardContent>
                <Line>Probe health</Line>
              </CardContent>
            </Card>
            <Separator />
            <Card size="sm">
              <CardContent>
                <Line>Billing contact</Line>
              </CardContent>
            </Card>
          </div>
        }
        do={
          <div className="w-full">
            <Card size="sm">
              <CardContent>
                <Line>Probe health</Line>
                <Separator />
                <Line>Billing contact</Line>
              </CardContent>
            </Card>
          </div>
        }
      />

      <Guidance
        pair={pair("vertical-needs-height")}
        width="wide"
        dont={
          <div className="w-full">
            <span className="text-body-md">Sydney</span>
            <Separator orientation="vertical" />
            <span className="text-body-md">AU-East</span>
          </div>
        }
        do={
          <div className="flex h-6 items-center gap-3">
            <span className="text-body-md">Sydney</span>
            <Separator orientation="vertical" />
            <span className="text-body-md">AU-East</span>
          </div>
        }
      />

      <Guidance
        pair={pair("not-a-divider-grid")}
        width="wide"
        stage="tall"
        dont={
          <div className="flex w-full flex-col">
            {["Sydney-01", "Sydney-02", "Melbourne-01", "Perth-01"].map(
              (n, i) => (
                <React.Fragment key={n}>
                  {i > 0 && <Separator />}
                  <Line>{n}</Line>
                </React.Fragment>
              ),
            )}
          </div>
        }
        do={
          <div className="flex w-full flex-col gap-3">
            <div className="flex flex-col gap-1">
              <Line>Sydney-01</Line>
              <Line>Sydney-02</Line>
            </div>
            <Separator />
            <div className="flex flex-col gap-1">
              <Line>Melbourne-01</Line>
              <Line>Perth-01</Line>
            </div>
          </div>
        }
      />

      <Guidance
        pair={pair("space-first")}
        width="wide"
        stage="tall"
        dont={
          <div className="flex w-full flex-col">
            <Line>Threshold</Line>
            <Separator />
            <Line>Notifications</Line>
          </div>
        }
        do={
          <div className="flex w-full flex-col gap-4">
            <Line>Threshold</Line>
            <Line>Notifications</Line>
          </div>
        }
      />
    </GuidanceStory>
  ),
};
