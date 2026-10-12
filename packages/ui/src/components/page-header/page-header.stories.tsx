import type { Meta, StoryObj } from "@storybook/react";
import { PageHeader } from "./page-header";
import { Card, CardContent } from "../card/card";
import { KpiRow } from "../page-grid/page-grid";
import { KpiTile } from "../kpi-tile/kpi-tile";

import guidance from "./guidance.json";
import { Guidance, GuidanceStory, pairOf } from "@/stories/guidance";

const meta: Meta<typeof PageHeader> = {
  title: "Components/Page header",
  component: PageHeader,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "The first thing on a page, inside the content area: the page's " +
          "name as the h1, optionally a line on what the page is for, and " +
          "the rule under both. The breadcrumb is not here — it stays in " +
          "the top bar, which does not scroll.",
      },
    },
  },
  args: {
    title: "Notification settings",
    description:
      "Alerts go to the people and channels below when an endpoint crosses " +
      "a threshold. Changes apply to new alerts only; open alerts keep the " +
      "routing they started with.",
  },
};
export default meta;
type Story = StoryObj<typeof PageHeader>;

const pair = pairOf(guidance);

/* The content column as AppShellContent builds it: padding on the parent,
   the column itself unpadded so a width cap and a container query both
   measure the column rather than the padding. */
const Column = ({ children }: { children: React.ReactNode }) => (
  <div className="bg-surface-app p-gutter">
    <div className="@container flex flex-col gap-gutter">{children}</div>
  </div>
);

export const Default: Story = {
  name: "Title and description",
  render: (args) => (
    <Column>
      <PageHeader {...args} />
    </Column>
  ),
};

/** Most pages. A dashboard's name needs no sentence under it. */
export const TitleOnly: Story = {
  name: "Title only",
  args: { description: undefined, title: "Overview" },
  render: (args) => (
    <Column>
      <PageHeader {...args} />
      <KpiRow>
        {[
          ["Calls in progress", "1,284"],
          ["MOS", "4.1"],
          ["Jitter", "12 ms"],
          ["Packet loss", "0.2%"],
        ].map(([label, value]) => (
          <KpiTile key={label} label={label} value={value} />
        ))}
      </KpiRow>
    </Column>
  ),
};

/** The rule comes off when the page starts with something that has an edge. */
export const NoDivider: Story = {
  name: "Without the rule",
  args: { divider: false, title: "Endpoints", description: undefined },
  render: (args) => (
    <Column>
      <PageHeader {...args} />
      <Card>
        <CardContent>
          A card, a panel or a full-bleed table already draws the line the
          header would have drawn.
        </CardContent>
      </Card>
    </Column>
  ),
};

/**
 * 328 — a 360 phone minus its gutters. The title wraps rather than truncating:
 * a page's name is not a table cell, and a name cut to "Notification sett…"
 * leaves the reader with less than no title. The description is already
 * narrower than its 768 cap here, so the cap does nothing and the column does
 * the work.
 */
export const Narrow: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="w-82 border border-line-neutral-muted p-4">
      <PageHeader
        title="Notification routing and escalation"
        description="Changes apply to new alerts only; open alerts keep the routing they started with."
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
        pair={pair("one-per-page")}
        width="wide"
        stage="tall"
        dont={
          <div className="flex-1 space-y-4">
            <PageHeader title="Endpoints" divider={false} />
            <PageHeader title="Recent alerts" divider={false} />
          </div>
        }
        do={
          <div className="flex-1 space-y-4">
            <PageHeader title="Endpoints" divider={false} />
            <h2 className="text-heading-lg text-content-neutral-emphasis">
              Recent alerts
            </h2>
          </div>
        }
      />

      <Guidance
        pair={pair("description-earns-its-line")}
        width="wide"
        stage="tall"
        dont={
          <PageHeader
            title="Notification settings"
            divider={false}
            description="This page shows information about your notification settings."
          />
        }
        do={
          <PageHeader
            title="Notification settings"
            divider={false}
            description="Changes apply to new alerts only; open alerts keep the routing they started with."
          />
        }
      />

      <Guidance
        pair={pair("divider-off-against-an-edge")}
        width="wide"
        stage="tall"
        dont={
          <div className="flex-1 space-y-6">
            <PageHeader title="Endpoints" />
            <Card>
              <CardContent>Two lines, 24 apart.</CardContent>
            </Card>
          </div>
        }
        do={
          <div className="flex-1 space-y-6">
            <PageHeader title="Endpoints" divider={false} />
            <Card>
              <CardContent>
                The card's own edge does the separating.
              </CardContent>
            </Card>
          </div>
        }
      />
    </GuidanceStory>
  ),
};
