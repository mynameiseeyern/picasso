import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { ArrowUpRight, MoreHorizontal } from "lucide-react";
import { Badge } from "../badge/badge";
import { Button } from "../button/button";
import { KpiTile } from "./kpi-tile";

import guidance from "./guidance.json";
import { Guidance, GuidanceStory, pairOf } from "@/stories/guidance";

const meta: Meta<typeof KpiTile> = {
  title: "Components/KPI tile",
  component: KpiTile,
  parameters: {
    docs: {
      description: {
        component:
          "One headline number, with just enough around it to say what the " +
          "number is and whether it is a problem. If a tile needs two " +
          "numbers, it is a Card.",
      },
    },
  },
  argTypes: {
    status: {
      control: "inline-radio",
      options: ["none", "healthy", "warning", "critical", "unknown"],
    },
  },
  args: { label: "Conversion rate", value: "3.5%" },
};
const pair = pairOf(guidance);

export default meta;
type Story = StoryObj<typeof KpiTile>;

export const Default: Story = {
  render: (args) => (
    <div className="w-80">
      <KpiTile {...args} />
    </div>
  ),
};

/** Tiles are built for a row of peers, at equal width. */
export const ARow: Story = {
  name: "A row",
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="grid grid-cols-3 gap-4">
      <KpiTile
        label="Endpoints online"
        value="3,412"
        comparison={<Badge color="success">+2.1%</Badge>}
      />
      <KpiTile label="Mean MOS" value="4.1" unit="/ 5" />
      <KpiTile label="Open alerts" value="7" unit="of 1,240" />
    </div>
  ),
};

/** Status names itself, colours its dot and colours the meter. */
export const Statuses: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="grid grid-cols-2 gap-4">
      <KpiTile
        label="Sydney MOS"
        value="4.0"
        unit="/ 5"
        status="healthy"
        meter={{ value: 4, max: 5 }}
      />
      <KpiTile
        label="Melbourne MOS"
        value="3.4"
        unit="/ 5"
        status="warning"
        meter={{ value: 3.4, max: 5 }}
      />
      <KpiTile
        label="Auckland MOS"
        value="1.2"
        unit="/ 5"
        status="critical"
        meter={{ value: 1.2, max: 5 }}
      />
      <KpiTile
        label="Perth MOS"
        value="—"
        unit="/ 5"
        status="unknown"
        meter={{ value: 0, max: 5 }}
      />
    </div>
  ),
};

export const WithAnAction: Story = {
  name: "With an action and a footer",
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="w-80">
      <KpiTile
        label="Endpoints online"
        value="3,412"
        comparison={<Badge color="success">+2.1%</Badge>}
        action={
          <Button variant="ghost" size="icon-sm" aria-label="Tile options">
            <MoreHorizontal />
          </Button>
        }
        footer={
          <Button variant="link" size="sm">
            See all endpoints
            <ArrowUpRight />
          </Button>
        }
      />
    </div>
  ),
};

/* ------------------------------------------------------------------ */

/**
 * Narrow — 328, a 360 phone minus its gutters. One tile per row: two side by
 * side put a metric/xl number in 160px, which is where the number stops being
 * the loud part.
 */
export const Narrow: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex w-82 flex-col gap-2 border border-line-neutral-muted p-3">
      <KpiTile label="Mean opinion score" value="4.1" unit="/ 5" status="healthy" />
      <KpiTile
        label="Endpoints not reporting in the last hour"
        value="12"
        status="warning"
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
        pair={pair("no-reading-is-not-zero")}
        width="wide"
        stage="tall"
        dont={
          <>
            <KpiTile
              label="Perth MOS"
              value="0"
              unit="/ 5"
              status="critical"
              meter={{ value: 0, max: 5 }}
            />
          </>
        }
        do={
          <>
            <KpiTile
              label="Perth MOS"
              value="—"
              unit="/ 5"
              status="unknown"
              meter={{ value: 0, max: 5 }}
            />
          </>
        }
      />

      <Guidance
        pair={pair("unit-not-in-the-number")}
        width="wide"
        stage="tall"
        dont={
          <>
            <KpiTile label="Sydney MOS" value="4.0 / 5" />
          </>
        }
        do={
          <>
            <KpiTile label="Sydney MOS" value="4.0" unit="/ 5" />
          </>
        }
      />

      <Guidance
        pair={pair("label-says-what")}
        width="wide"
        stage="tall"
        dont={
          <>
            <KpiTile label="MOS" value="4.1" unit="/ 5" />
          </>
        }
        do={
          <>
            <KpiTile label="Network MOS, all regions" value="4.1" unit="/ 5" />
          </>
        }
      />

      <Guidance
        pair={pair("one-number")}
        width="wide"
        stage="tall"
        dont={
          <div className="w-full">
            <KpiTile label="Endpoints" value="3,412 online / 61 down" />
          </div>
        }
        do={
          <div className="grid w-full grid-cols-2 gap-3">
            <KpiTile label="Endpoints online" value="3,412" />
            <KpiTile label="Endpoints down" value="61" />
          </div>
        }
      />

      <Guidance
        pair={pair("tiles-are-a-row")}
        width="wide"
        stage="tall"
        dont={
          <div className="flex w-full items-start gap-3">
            <div className="w-40">
              <KpiTile label="Mean MOS" value="4.1" unit="/ 5" />
            </div>
            <div className="w-24">
              <KpiTile label="Open alerts" value="7" />
            </div>
          </div>
        }
        do={
          <div className="grid w-full grid-cols-2 gap-3">
            <KpiTile label="Mean MOS" value="4.1" unit="/ 5" />
            <KpiTile label="Open alerts" value="7" />
          </div>
        }
      />
    </GuidanceStory>
  ),
};
