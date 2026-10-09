import type { Meta, StoryObj } from "@storybook/react";
import { ListCard } from "./list-card";
import guidance from "./guidance.json";
import { Guidance, GuidanceStory, pairOf } from "@/stories/guidance";

const pair = pairOf(guidance);

const meta: Meta<typeof ListCard> = {
  title: "Components/List card",
  component: ListCard,
  parameters: {
    docs: {
      description: {
        component:
          "A row in a list of things a person can open. The card owns the " +
          "hover and passes `active` to the drawing, which is the one place " +
          "a picture moves inside the console. It waits 120ms for the " +
          "pointer to settle, and the card itself only changes colour.",
      },
    },
    layout: "padded",
  },
  argTypes: {
    illustration: {
      control: "select",
      options: [
        "issue-alerts",
        "fleet-health",
        "call-readiness",
        "search-results",
        "dashboards",
        "topology",
        "team-access",
        "activity-log",
        "integrations",
        "assistant",
      ],
    },
  },
};
export default meta;
type Story = StoryObj<typeof ListCard>;

export const Default: Story = {
  args: { illustration: "issue-alerts" },
  render: (args) => (
    <div className="w-150">
      <ListCard
        href="#"
        illustration={args.illustration}
        badge="Alert rule"
        title="Packet loss above 2%"
        meta="Alert rule · 3 sites"
      />
    </div>
  ),
};

/**
 * The shape it is really for: a column of them. Rest the pointer on one and
 * only that one answers — and only after it has been rested on.
 */
export const InAList: Story = {
  name: "In a list",
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex w-150 flex-col gap-2">
      <ListCard
        href="#"
        illustration="issue-alerts"
        badge="Alert rule"
        title="Packet loss above 2%"
        meta="Alert rule · 3 sites"
      />
      <ListCard
        href="#"
        illustration="dashboards"
        badge="Dashboard"
        title="Operations overview"
        meta="Dashboard · 12 widgets"
      />
      <ListCard
        href="#"
        illustration="topology"
        badge="Topology"
        title="Settlement services"
        meta="Topology · 8 systems"
      />
      <ListCard
        href="#"
        illustration="call-readiness"
        badge="Readiness check"
        title="Pre-shift call readiness"
        meta="Readiness check · Runs at 8:45 am"
      />
    </div>
  ),
};

/** Without a badge, and without a meta line. Neither is invented to fill a gap. */
export const TitleOnly: Story = {
  name: "Title only",
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex w-150 flex-col gap-2">
      <ListCard
        href="#"
        illustration="search-results"
        title="Calls with poor MOS last week"
      />
      <ListCard
        href="#"
        illustration="activity-log"
        title="Failed transfers"
        meta="Saved search · Updated 3 hours ago"
      />
    </div>
  ),
};

export const Narrow: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex w-82 flex-col gap-2">
      <ListCard
        href="#"
        illustration="fleet-health"
        badge="Fleet"
        title="Sydney contact centre"
        meta="1,840 endpoints · 9 need attention"
      />
      <ListCard
        href="#"
        illustration="integrations"
        badge="Integration"
        title="Webex Calling"
        meta="Integration · Connected"
      />
    </div>
  ),
};

export const DoAndDont: Story = {
  name: "Do and don't",
  parameters: { controls: { disable: true } },
  render: () => (
    <GuidanceStory>
      <Guidance
        pair={pair("badge-is-a-kind-not-a-sentence")}
        width="wide"
        dont={
          <div className="w-full">
            <ListCard
              href="#"
              illustration="fleet-health"
              badge="3 sites need attention"
              title="Sydney contact centre"
              meta="Fleet"
            />
          </div>
        }
        do={
          <div className="w-full">
            <ListCard
              href="#"
              illustration="fleet-health"
              badge="Fleet"
              title="Sydney contact centre"
              meta="1,840 endpoints · 9 need attention"
            />
          </div>
        }
      />

      <Guidance
        pair={pair("pick-the-drawing-for-what-it-shows")}
        width="wide"
        dont={
          <div className="w-full">
            <ListCard
              href="#"
              illustration="call-readiness"
              badge="Fleet"
              title="Sydney contact centre"
              meta="1,840 endpoints · 9 need attention"
            />
          </div>
        }
        do={
          <div className="w-full">
            <ListCard
              href="#"
              illustration="fleet-health"
              badge="Fleet"
              title="Sydney contact centre"
              meta="1,840 endpoints · 9 need attention"
            />
          </div>
        }
      />
    </GuidanceStory>
  ),
};
