import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { Check, Clock } from "lucide-react";
import { Badge } from "./badge";

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
    color: { control: "inline-radio", options: ["neutral", "success", "warning", "danger", "info"] },
    variant: { control: "inline-radio", options: ["subtle", "emphasis", "outline"] },
    size: { control: "inline-radio", options: ["md", "lg"] },
    dot: { control: "boolean" },
  },
  args: { children: "Healthy", color: "success" },
};
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
          <span className="w-20 text-label-sm text-content-neutral-muted">{variant}</span>
          {COLORS.map((color) => (
            <Badge key={color} variant={variant} color={color}>
              {color}
            </Badge>
          ))}
        </div>
      ))}
      <p className="max-w-lg text-body-sm text-content-neutral-muted">
        Outline is deliberately colourless — all five render the same. Use subtle for a quiet
        coloured badge.
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
        "m-0 min-w-72 flex-1 rounded-md border-2 p-4 " +
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

const Row = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center gap-2 text-body-md text-content-neutral-emphasis">
    {children}
  </div>
);

export const DoAndDont: Story = {
  name: "Do and Don't",
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-4">
        <Guidance variant="dont" caption="Status by colour alone — unreadable if you cannot separate the hues.">
          <Row>
            Sydney-01
            <Badge color="danger" variant="emphasis" aria-label="Critical">
              {" "}
            </Badge>
          </Row>
        </Guidance>
        <Guidance variant="do" caption="The word is the signal; the colour reinforces it.">
          <Row>
            Sydney-01
            <Badge color="danger" dot>
              Critical
            </Badge>
          </Row>
        </Guidance>
      </div>

      <div className="flex flex-wrap gap-4">
        <Guidance variant="dont" caption="Three badges competing on one object.">
          <Row>
            Sydney-01
            <Badge color="danger">Critical</Badge>
            <Badge color="info">v13.3</Badge>
            <Badge color="neutral">AU-East</Badge>
          </Row>
        </Guidance>
        <Guidance variant="do" caption="The one that changes what happens next.">
          <Row>
            Sydney-01
            <Badge color="danger">Critical</Badge>
          </Row>
        </Guidance>
      </div>

      <div className="flex flex-wrap gap-4">
        <Guidance variant="dont" caption="Emphasis on every row, so the exception has nowhere left to go.">
          <div className="flex flex-col gap-2">
            <Row>
              Sydney-01 <Badge color="success" variant="emphasis">Healthy</Badge>
            </Row>
            <Row>
              Melbourne-02 <Badge color="success" variant="emphasis">Healthy</Badge>
            </Row>
            <Row>
              Auckland-01 <Badge color="danger" variant="emphasis">Critical</Badge>
            </Row>
          </div>
        </Guidance>
        <Guidance variant="do" caption="Subtle for the rest; emphasis earns attention.">
          <div className="flex flex-col gap-2">
            <Row>
              Sydney-01 <Badge color="success">Healthy</Badge>
            </Row>
            <Row>
              Melbourne-02 <Badge color="success">Healthy</Badge>
            </Row>
            <Row>
              Auckland-01 <Badge color="danger" variant="emphasis">Critical</Badge>
            </Row>
          </div>
        </Guidance>
      </div>
    </div>
  ),
};
