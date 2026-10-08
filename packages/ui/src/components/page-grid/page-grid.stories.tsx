import type { Meta, StoryObj } from "@storybook/react";
import { ChartGrid, KpiRow } from "./page-grid";
import { KpiTile } from "../kpi-tile/kpi-tile";
import { Table, TableBody, TableCell, TableRow } from "../table/table";

import guidance from "./guidance.json";
import { Guidance, GuidanceStory, pairOf } from "@/stories/guidance";

const meta: Meta = {
  title: "Components/Page grid",
  parameters: {
    layout: "fullscreen",
    controls: { disable: true },
    docs: {
      description: {
        component:
          "The two grids a product page is made of. Both answer to the " +
          "content column, not the viewport: the tile row auto-fills at a " +
          "224 minimum, and the chart grid steps 1 → 2 → 3 at 768 and 1280 " +
          "of column. Resize the window — or the Storybook viewport — and " +
          "watch the counts change without a media query anywhere.",
      },
    },
  },
};
export default meta;
type Story = StoryObj;

const pair = pairOf(guidance);

const Chart = ({ label }: { label: string }) => (
  <div className="flex h-60 flex-col rounded-lg border border-line-neutral-muted bg-surface-card p-4">
    <span className="text-label-sm text-content-neutral-muted">{label}</span>
    <span className="mt-auto text-body-xs text-content-neutral-subtle">
      240–320 high, never an aspect ratio
    </span>
  </div>
);

/* The column is the query container, as AppShellContent makes it — padding on
   the parent, @container on the unpadded column, so the query size is the
   column width itself. */
const Column = ({ children }: { children: React.ReactNode }) => (
  <div className="bg-surface-app p-gutter">
    <div className="@container flex flex-col gap-gutter">{children}</div>
  </div>
);

export const Default: Story = {
  name: "A dashboard page",
  render: () => (
    <Column>
      <KpiRow>
        {[
          ["Calls in progress", "1,284"],
          ["MOS", "4.1"],
          ["Jitter", "12 ms"],
          ["Packet loss", "0.2%"],
          ["Registered endpoints", "9,610"],
          ["Alerts open", "7"],
        ].map(([label, value]) => (
          <KpiTile key={label} label={label} value={value} />
        ))}
      </KpiRow>
      <ChartGrid>
        <Chart label="MOS by region" />
        <Chart label="Jitter, 24h" />
        <Chart label="Loss by carrier" />
      </ChartGrid>
      {/* a table is the row, not a cell in it */}
      <Table>
        <TableBody>
          {["sbc-syd-01", "sbc-mel-02", "sbc-per-01"].map((n) => (
            <TableRow key={n}>
              <TableCell>{n}</TableCell>
              <TableCell numeric>4.1</TableCell>
              <TableCell numeric>12 ms</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Column>
  ),
};

export const TwoAcross: Story = {
  name: "Charts capped at two",
  render: () => (
    <Column>
      <ChartGrid max={2}>
        <Chart label="Inbound, by trunk" />
        <Chart label="Outbound, by trunk" />
        <Chart label="Failures, by cause" />
      </ChartGrid>
    </Column>
  ),
};

export const WhatNotToDo: Story = {
  name: "What not to do",
  render: () => (
    <GuidanceStory>
      <Guidance
        pair={pair("full-row-things-are-siblings")}
        width="wide"
        dont={
          <ChartGrid>
            <Chart label="MOS by region" />
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell>sbc-syd-01</TableCell>
                  <TableCell numeric>4.1</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </ChartGrid>
        }
        do={
          <div className="flex flex-col gap-gutter">
            <ChartGrid max={2}>
              <Chart label="MOS by region" />
              <Chart label="Jitter, 24h" />
            </ChartGrid>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell>sbc-syd-01</TableCell>
                  <TableCell numeric>4.1</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        }
      />
    </GuidanceStory>
  ),
};

/**
 * Narrow — a 360 viewport. Unlike every other Narrow story here, this one is
 * NOT a 328px box: the grid answers to its container, and the point is to see
 * it collapse to one column. The KPI row goes from six across to a stack, and
 * the chart grid to one chart per row.
 */
export const Narrow: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Column>
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
      <ChartGrid>
        <Chart label="MOS by region" />
        <Chart label="Jitter over time" />
      </ChartGrid>
    </Column>
  ),
};
