import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { Alert, AlertDescription, AlertTitle } from "./alert";
import { Button } from "../button/button";

const meta: Meta<typeof Alert> = {
  title: "Components/Alert",
  component: Alert,
  parameters: {
    docs: {
      description: {
        component:
          "Something the page needs to say about itself, in place. An Alert " +
          "stays in the layout — it is not a Toast, which arrives and leaves, " +
          "and not a Dialog, which stops everything until it is answered.",
      },
    },
  },
  argTypes: {
    variant: { control: "inline-radio", options: ["info", "destructive", "warning", "success"] },
    icon: { control: "boolean" },
  },
};
export default meta;
type Story = StoryObj<typeof Alert>;

export const Default: Story = {
  render: (args) => (
    <Alert {...args}>
      <AlertTitle>Scheduled maintenance</AlertTitle>
      <AlertDescription>
        Reporting will be unavailable on Sunday between 02:00 and 04:00 AEST.
      </AlertDescription>
    </Alert>
  ),
};

/** The tone lives in the surface and the border. The icon changes; its ink does not. */
export const Tones: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-3">
      <Alert variant="info">
        <AlertTitle>Scheduled maintenance</AlertTitle>
        <AlertDescription>
          Reporting will be unavailable on Sunday between 02:00 and 04:00 AEST.
        </AlertDescription>
      </Alert>
      <Alert variant="success">
        <AlertTitle>Probe restored</AlertTitle>
        <AlertDescription>Sydney-01 has been reporting normally for 15 minutes.</AlertDescription>
      </Alert>
      <Alert variant="warning">
        <AlertTitle>Disk nearly full</AlertTitle>
        <AlertDescription>
          Sydney-01 is at 91% of its allocation. Collection stops at 95%.
        </AlertDescription>
      </Alert>
      <Alert variant="destructive">
        <AlertTitle>Collection stopped</AlertTitle>
        <AlertDescription>
          Sydney-01 ran out of disk at 04:12 and is no longer recording calls.
        </AlertDescription>
      </Alert>
    </div>
  ),
};

export const WithAnAction: Story = {
  name: "With an action",
  parameters: { controls: { disable: true } },
  render: () => (
    <Alert
      variant="warning"
      action={
        <Button variant="outline" size="xs">
          Free up space
        </Button>
      }
    >
      <AlertTitle>Disk nearly full</AlertTitle>
      <AlertDescription>Sydney-01 is at 91% of its allocation.</AlertDescription>
    </Alert>
  ),
};

export const Dismissible: Story = {
  parameters: { controls: { disable: true } },
  render: function Render() {
    const [shown, setShown] = React.useState(true);
    return shown ? (
      <Alert variant="success" onDismiss={() => setShown(false)} dismissLabel="Dismiss probe notice">
        <AlertTitle>Probe restored</AlertTitle>
        <AlertDescription>Sydney-01 has been reporting normally for 15 minutes.</AlertDescription>
      </Alert>
    ) : (
      <Button variant="outline" size="sm" onClick={() => setShown(true)}>
        Bring it back
      </Button>
    );
  },
};

/** Title alone for a one-liner; the icon and dismiss live in that row. */
export const TitleOnly: Story = {
  name: "Title only",
  parameters: { controls: { disable: true } },
  render: () => (
    <Alert variant="info">
      <AlertTitle>Maintenance window: Sunday 02:00–04:00 AEST</AlertTitle>
    </Alert>
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
        "m-0 flex-1 min-w-80 rounded-md border-2 p-4 " +
        (isDo ? "border-line-success-emphasis" : "border-line-danger-emphasis")
      }
    >
      <div className="min-h-20">{children}</div>
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
        <Guidance variant="dont" caption="Everything is destructive, so nothing is.">
          <div className="flex flex-col gap-2">
            <Alert variant="destructive">
              <AlertTitle>Maintenance on Sunday</AlertTitle>
            </Alert>
            <Alert variant="destructive">
              <AlertTitle>Disk at 91%</AlertTitle>
            </Alert>
            <Alert variant="destructive">
              <AlertTitle>Collection stopped</AlertTitle>
            </Alert>
          </div>
        </Guidance>
        <Guidance variant="do" caption="One alert per state, and the tone tells you which is which.">
          <div className="flex flex-col gap-2">
            <Alert variant="info">
              <AlertTitle>Maintenance on Sunday</AlertTitle>
            </Alert>
            <Alert variant="warning">
              <AlertTitle>Disk at 91%</AlertTitle>
            </Alert>
            <Alert variant="destructive">
              <AlertTitle>Collection stopped</AlertTitle>
            </Alert>
          </div>
        </Guidance>
      </div>

      <div className="flex flex-wrap gap-4">
        <Guidance variant="dont" caption="States the problem and leaves the reader to guess.">
          <Alert variant="destructive">
            <AlertTitle>Connection failed</AlertTitle>
          </Alert>
        </Guidance>
        <Guidance variant="do" caption="Says what happened, what it means, and what to do.">
          <Alert
            variant="destructive"
            action={
              <Button variant="outline" size="xs">
                Retry
              </Button>
            }
          >
            <AlertTitle>Collection stopped</AlertTitle>
            <AlertDescription>
              Sydney-01 ran out of disk at 04:12. Calls since then were not recorded.
            </AlertDescription>
          </Alert>
        </Guidance>
      </div>

      <div className="flex flex-wrap gap-4">
        <Guidance variant="dont" caption="Dismissing a live condition only hides it — the disk is still full.">
          <Alert variant="warning" onDismiss={() => {}}>
            <AlertTitle>Disk at 91% and rising</AlertTitle>
          </Alert>
        </Guidance>
        <Guidance variant="do" caption="Dismiss what has been acknowledged; leave a live condition until it clears.">
          <Alert variant="success" onDismiss={() => {}} dismissLabel="Dismiss">
            <AlertTitle>Probe restored</AlertTitle>
          </Alert>
        </Guidance>
      </div>
    </div>
  ),
};
