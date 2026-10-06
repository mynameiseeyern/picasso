import type { Meta, StoryObj } from "@storybook/react";
import { Search, Inbox } from "lucide-react";
import { EmptyState } from "./empty-state";
import { Alert, AlertDescription, AlertTitle } from "../alert/alert";
import { Button } from "../button/button";
import { ButtonGroup } from "../button-group/button-group";
import { Card, CardContent, CardHeader, CardTitle } from "../card/card";
import guidance from "./guidance.json";
import { Guidance, GuidanceStory, pairOf } from "@/stories/guidance";

const pair = pairOf(guidance);

const meta: Meta<typeof EmptyState> = {
  title: "Components/Empty state",
  component: EmptyState,
  parameters: {
    docs: {
      description: {
        component:
          "What a data component shows when it is working and has found " +
          "nothing. `description` is a required prop because “No data.” is " +
          "what ships when it is not. Loading is Skeleton's job and partial " +
          "data is Alert's; this covers empty and first use. No Figma " +
          "component exists for it yet.",
      },
    },
  },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md"] },
    illustration: {
      control: "inline-radio",
      options: ["issue-alerts", "fleet-health", "call-readiness"],
    },
  },
};
export default meta;
type Story = StoryObj<typeof EmptyState>;

export const Default: Story = {
  args: { size: "md", illustration: "issue-alerts" },
  render: (args) => (
    <div className="w-150">
      <EmptyState
        size={args.size}
        illustration={args.illustration}
        title="No alerts in the last 24 hours"
        description="Nothing has crossed a threshold since yesterday. Widen the time range to see older activity."
        action={<Button variant="outline">Last 7 days</Button>}
      />
    </div>
  ),
};

/**
 * First use is not empty. The reader has not done anything wrong, so there is
 * no filter to clear — there is a thing to set up, and a sentence saying what
 * will appear once it is.
 */
export const FirstUse: Story = {
  name: "First use",
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="w-150">
      <EmptyState
        illustration="fleet-health"
        title="No endpoints connected yet"
        description="Connect a site and its endpoints appear here within a few minutes, with call quality for each one."
        action={
          <ButtonGroup>
            <Button>Connect a site</Button>
            <Button variant="outline">Read the setup guide</Button>
          </ButtonGroup>
        }
      />
    </div>
  ),
};

/** Inside a chart frame or a card, where a 160 drawing would be bigger than the hole. */
export const Small: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="w-80">
      <Card>
      <CardHeader>
        <CardTitle>MOS by trunk</CardTitle>
      </CardHeader>
      <CardContent>
        <EmptyState
          size="sm"
          icon={<Search />}
          title="No trunks match"
          description="Clear the SIP filter to see all 24 trunks."
          action={
            <Button variant="ghost" size="sm">
              Clear filter
            </Button>
          }
        />
      </CardContent>
      </Card>
    </div>
  ),
};

/** No drawing, no icon — the text carries it. A table body is the usual case. */
export const TextOnly: Story = {
  name: "Text only",
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="w-150">
      <EmptyState
        title="No results for “melbourne-sbc-04”"
        description="Check the spelling, or search by site instead of endpoint name."
      />
    </div>
  ),
};

/** 328 — the floor minus its gutters. The cap on the text is what keeps it readable. */
export const Narrow: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="w-82">
      <EmptyState
        illustration="call-readiness"
        title="No scheduled tests"
        description="Nothing is queued for this site. Schedule a readiness test and the results land here."
        action={<Button size="sm">Schedule a test</Button>}
      />
    </div>
  ),
};

export const DoAndDont: Story = {
  name: "Do and Don't",
  parameters: { controls: { disable: true } },
  render: () => (
    <GuidanceStory>
      <Guidance
        pair={pair("say-why-and-what-would-fill-it")}
        width="wide"
        stage="tall"
        dont={
          <div className="flex w-full flex-col items-center gap-4 px-6 py-10 text-center">
            <p className="text-heading-sm text-content-neutral-emphasis">
              No data.
            </p>
          </div>
        }
        do={
          <div className="w-full">
            <EmptyState
              icon={<Inbox />}
            title="No alerts in the last 24 hours"
              description="Nothing has crossed a threshold since yesterday. Widen the time range to see older activity."
              action={<Button variant="outline">Last 7 days</Button>}
            />
          </div>
        }
      />

      <Guidance
        pair={pair("partial-is-an-alert")}
        width="wide"
        stage="tall"
        dont={
          <div className="w-full">
            <EmptyState
              size="sm"
              icon={<Search />}
              title="Couldn't load MOS"
              description="One of four sources did not respond."
            />
          </div>
        }
        do={
          <div className="flex w-full flex-col gap-3">
            <Alert variant="warning">
              <AlertTitle>Showing 3 of 4 sources</AlertTitle>
              <AlertDescription>
                Sydney-SBC-02 did not respond. The figures below exclude it.
              </AlertDescription>
            </Alert>
            {/* Standing in for the chart that did load. Plain shapes, not
                Skeleton — nothing here is loading. */}
            <div className="flex items-end gap-1.5" aria-hidden>
              {[28, 44, 36, 52, 48, 60, 40].map((h, i) => (
                <div
                  key={i}
                  className="h-(--h) flex-1 rounded-sm bg-surface-layer-emphasis"
                  style={{ "--h": `${h}px` } as React.CSSProperties}
                />
              ))}
            </div>
          </div>
        }
      />
    </GuidanceStory>
  ),
};
