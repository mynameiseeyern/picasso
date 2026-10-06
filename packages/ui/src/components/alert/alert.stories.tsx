import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { Alert, AlertDescription, AlertTitle } from "./alert";
import { Button } from "../button/button";

import guidance from "./guidance.json";
import { Guidance, GuidanceStory, pairOf } from "@/stories/guidance";

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
    variant: {
      control: "inline-radio",
      options: ["info", "destructive", "warning", "success"],
    },
    icon: { control: "boolean" },
  },
};
const pair = pairOf(guidance);

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
        <AlertDescription>
          Sydney-01 has been reporting normally for 15 minutes.
        </AlertDescription>
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
      <AlertDescription>
        Sydney-01 is at 91% of its allocation.
      </AlertDescription>
    </Alert>
  ),
};

export const Dismissible: Story = {
  parameters: { controls: { disable: true } },
  render: function Render() {
    const [shown, setShown] = React.useState(true);
    return shown ? (
      <Alert
        variant="success"
        onDismiss={() => setShown(false)}
        dismissLabel="Dismiss probe notice"
      >
        <AlertTitle>Probe restored</AlertTitle>
        <AlertDescription>
          Sydney-01 has been reporting normally for 15 minutes.
        </AlertDescription>
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

export const DoAndDont: Story = {
  name: "Do and Don't",
  parameters: { controls: { disable: true } },
  render: () => (
    <GuidanceStory>
      <Guidance
        pair={pair("tone-means-something")}
        width="wide"
        dont={
          <>
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
          </>
        }
        do={
          <>
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
          </>
        }
      />

      <Guidance
        pair={pair("say-what-to-do")}
        width="wide"
        dont={
          <>
            <Alert variant="destructive">
              <AlertTitle>Connection failed</AlertTitle>
            </Alert>
          </>
        }
        do={
          <>
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
                Sydney-01 ran out of disk at 04:12. Calls since then were not
                recorded.
              </AlertDescription>
            </Alert>
          </>
        }
      />

      <Guidance
        pair={pair("dismissible-means-recoverable")}
        width="wide"
        dont={
          <>
            <Alert variant="warning" onDismiss={() => {}}>
              <AlertTitle>Disk at 91% and rising</AlertTitle>
            </Alert>
          </>
        }
        do={
          <>
            <Alert
              variant="success"
              onDismiss={() => {}}
              dismissLabel="Dismiss"
            >
              <AlertTitle>Probe restored</AlertTitle>
            </Alert>
          </>
        }
      />

      <Guidance
        pair={pair("one-at-a-time")}
        width="wide"
        stage="tall"
        dont={
          <div className="w-full space-y-2">
            <Alert variant="warning">
              <AlertTitle>Collector 4 is behind</AlertTitle>
            </Alert>
            <Alert variant="warning">
              <AlertTitle>Collector 7 is behind</AlertTitle>
            </Alert>
            <Alert variant="warning">
              <AlertTitle>Collector 9 is behind</AlertTitle>
            </Alert>
          </div>
        }
        do={
          <div className="w-full">
            <Alert variant="warning">
              <AlertTitle>Three collectors are behind</AlertTitle>
              <AlertDescription>
                Collectors 4, 7 and 9 have not reported for over an hour.
              </AlertDescription>
            </Alert>
          </div>
        }
      />

      <Guidance
        pair={pair("title-is-one-line")}
        width="wide"
        stage="tall"
        dont={
          <div className="w-full">
            <Alert variant="warning">
              <AlertTitle>
                Three collectors have not reported for over an hour and may be
                offline
              </AlertTitle>
            </Alert>
          </div>
        }
        do={
          <div className="w-full">
            <Alert variant="warning">
              <AlertTitle>Three collectors are behind</AlertTitle>
              <AlertDescription>
                They have not reported for over an hour and may be offline.
              </AlertDescription>
            </Alert>
          </div>
        }
      />
    </GuidanceStory>
  ),
};
