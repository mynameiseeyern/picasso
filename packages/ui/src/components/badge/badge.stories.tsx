import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { Check, Clock } from "lucide-react";
import { Badge } from "./badge";
import { Chip } from "../chip/chip";

import guidance from "./guidance.json";
import { Guidance, GuidanceStory, pairOf } from "@/stories/guidance";

const meta: Meta<typeof Badge> = {
  title: "Components/Badge",
  component: Badge,
  parameters: {
    docs: {
      description: {
        component:
          "A short, static label on a thing — a status, a count, a category. " +
          "Nothing happens when you click it: a badge people act on is a " +
          "Button, and one they select is a Chip.",
      },
    },
  },
  argTypes: {
    color: {
      control: "inline-radio",
      options: ["neutral", "success", "warning", "danger", "info"],
    },
    variant: {
      control: "inline-radio",
      options: ["subtle", "emphasis", "outline"],
    },
    size: { control: "inline-radio", options: ["md", "lg"] },
    dot: { control: "boolean" },
  },
  args: { children: "Healthy", color: "success" },
};
const pair = pairOf(guidance);

export default meta;
type Story = StoryObj<typeof Badge>;

const COLORS = ["neutral", "success", "warning", "danger", "info"] as const;

export const Default: Story = {};

export const Colors: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-4">
      {(["subtle", "emphasis", "outline"] as const).map((variant) => (
        <div key={variant} className="flex items-center gap-3">
          <span className="w-20 text-label-sm text-content-neutral-muted">
            {variant}
          </span>
          {COLORS.map((color) => (
            <Badge key={color} variant={variant} color={color}>
              {color}
            </Badge>
          ))}
        </div>
      ))}
      <p className="max-w-lg text-body-sm text-content-neutral-muted">
        Outline is deliberately colourless — all five render the same. Use
        subtle for a quiet coloured badge.
      </p>
    </div>
  ),
};

export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex items-center gap-3">
      <Badge color="success">md</Badge>
      <Badge color="success" size="lg">
        lg
      </Badge>
    </div>
  ),
};

/** The dot comes from the status palette, so one hue means one thing. */
export const WithADot: Story = {
  name: "With a dot",
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex items-center gap-3">
      {COLORS.map((color) => (
        <Badge key={color} color={color} dot>
          {color}
        </Badge>
      ))}
    </div>
  ),
};

export const WithAnIcon: Story = {
  name: "With an icon",
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex items-center gap-3">
      <Badge color="success">
        <Check />
        Verified
      </Badge>
      <Badge color="warning" size="lg">
        <Clock />
        Pending
      </Badge>
    </div>
  ),
};

/** `asChild` makes the badge the element it labels — a link, usually. */
export const AsALink: Story = {
  name: "As a link",
  parameters: { controls: { disable: true } },
  render: () => (
    <Badge asChild color="info">
      <a href="#release">Version 13.3</a>
    </Badge>
  ),
};

/* ------------------------------------------------------------------ */

const Row = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center gap-2 text-body-md text-content-neutral-emphasis">
    {children}
  </div>
);

export const DoAndDont: Story = {
  name: "Do and Don't",
  parameters: { controls: { disable: true } },
  render: () => (
    <GuidanceStory>
      <Guidance
        pair={pair("never-colour-alone")}
        dont={
          <Row>
            Sydney-01
            <Badge color="danger" variant="emphasis" aria-label="Critical">
              {" "}
            </Badge>
          </Row>
        }
        do={
          <Row>
            Sydney-01
            <Badge color="danger" dot>
              Critical
            </Badge>
          </Row>
        }
      />

      <Guidance
        pair={pair("one-badge")}
        dont={
          <Row>
            Sydney-01
            <Badge color="danger">Critical</Badge>
            <Badge color="info">v13.3</Badge>
            <Badge color="neutral">AU-East</Badge>
          </Row>
        }
        do={
          <Row>
            Sydney-01
            <Badge color="danger">Critical</Badge>
          </Row>
        }
      />

      <Guidance
        pair={pair("emphasis-is-for-one-thing")}
        stage="tall"
        dont={
          <div className="flex flex-col gap-2">
            <Row>
              Sydney-01{" "}
              <Badge color="success" variant="emphasis">
                Healthy
              </Badge>
            </Row>
            <Row>
              Melbourne-02{" "}
              <Badge color="success" variant="emphasis">
                Healthy
              </Badge>
            </Row>
            <Row>
              Auckland-01{" "}
              <Badge color="danger" variant="emphasis">
                Critical
              </Badge>
            </Row>
          </div>
        }
        do={
          <div className="flex flex-col gap-2">
            <Row>
              Sydney-01 <Badge color="success">Healthy</Badge>
            </Row>
            <Row>
              Melbourne-02 <Badge color="success">Healthy</Badge>
            </Row>
            <Row>
              Auckland-01{" "}
              <Badge color="danger" variant="emphasis">
                Critical
              </Badge>
            </Row>
          </div>
        }
      />

      <Guidance
        pair={pair("badge-is-not-a-control")}
        dont={
          <Row>
            <Badge asChild color="info">
              <button type="button">Region: AU-East ✕</button>
            </Badge>
          </Row>
        }
        do={
          <Row>
            <Chip onRemove={() => {}} removeLabel="Remove AU-East filter">
              Region: AU-East
            </Chip>
          </Row>
        }
      />

      <Guidance
        pair={pair("keep-it-short")}
        stage="tall"
        dont={
          <Row>
            <Badge color="warning">
              Probe has not reported in the last 15 minutes
            </Badge>
          </Row>
        }
        do={
          <div className="flex flex-col gap-1">
            <Row>
              Sydney-01 <Badge color="warning">Stale</Badge>
            </Row>
            <span className="text-body-sm text-content-neutral-muted">
              No reading in the last 15 minutes.
            </span>
          </div>
        }
      />

      <Guidance
        pair={pair("outline-is-colourless")}
        dont={
          <Row>
            <Badge variant="outline" color="danger">
              Critical
            </Badge>
            <Badge variant="outline" color="success">
              Healthy
            </Badge>
          </Row>
        }
        do={
          <Row>
            <Badge color="danger">Critical</Badge>
            <Badge color="success">Healthy</Badge>
          </Row>
        }
      />
    </GuidanceStory>
  ),
};
