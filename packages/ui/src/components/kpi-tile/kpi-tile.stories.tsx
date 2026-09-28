import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { ArrowUpRight, MoreHorizontal } from "lucide-react";
import { Badge } from "../badge/badge";
import { Button } from "../button/button";
import { KpiTile } from "./kpi-tile";

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
    status: { control: "inline-radio", options: ["none", "healthy", "warning", "critical", "unknown"] },
  },
  args: { label: "Conversion rate", value: "3.5%" },
};
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
      <KpiTile label="Endpoints online" value="3,412" comparison={<Badge color="success">+2.1%</Badge>} />
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
      <KpiTile label="Sydney MOS" value="4.0" unit="/ 5" status="healthy" meter={{ value: 4, max: 5 }} />
      <KpiTile label="Melbourne MOS" value="3.4" unit="/ 5" status="warning" meter={{ value: 3.4, max: 5 }} />
      <KpiTile label="Auckland MOS" value="1.2" unit="/ 5" status="critical" meter={{ value: 1.2, max: 5 }} />
      <KpiTile label="Perth MOS" value="—" unit="/ 5" status="unknown" meter={{ value: 0, max: 5 }} />
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
        "m-0 min-w-80 flex-1 rounded-md border-2 p-4 " +
        (isDo ? "border-line-success-emphasis" : "border-line-danger-emphasis")
      }
    >
      <div className="min-h-28">{children}</div>
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
        <Guidance variant="dont" caption="A dead probe reading 0 — a measurement that is not true, and someone will act on it.">
          <KpiTile label="Perth MOS" value="0" unit="/ 5" status="critical" meter={{ value: 0, max: 5 }} />
        </Guidance>
        <Guidance variant="do" caption="No reading is its own state: unknown, and an em dash.">
          <KpiTile label="Perth MOS" value="—" unit="/ 5" status="unknown" meter={{ value: 0, max: 5 }} />
        </Guidance>
      </div>

      <div className="flex flex-wrap gap-4">
        <Guidance variant="dont" caption="The qualifier set as loud as the figure.">
          <KpiTile label="Sydney MOS" value="4.0 / 5" />
        </Guidance>
        <Guidance variant="do" caption="Value in the metric face, unit in body beside it.">
          <KpiTile label="Sydney MOS" value="4.0" unit="/ 5" />
        </Guidance>
      </div>

      <div className="flex flex-wrap gap-4">
        <Guidance variant="dont" caption="A label that only makes sense with the rest of the page around it.">
          <KpiTile label="MOS" value="4.1" unit="/ 5" />
        </Guidance>
        <Guidance variant="do" caption="Names the measure and its scope, so the tile stands on its own.">
          <KpiTile label="Network MOS, all regions" value="4.1" unit="/ 5" />
        </Guidance>
      </div>
    </div>
  ),
};
