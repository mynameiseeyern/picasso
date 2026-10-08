import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { ArrowDown, ArrowUp, MoreHorizontal, Search } from "lucide-react";
import { Button } from "../button/button";
import {
  Card,
  CardFooter,
  CardHeader,
  CardHeaderText,
  CardTitle,
} from "../card/card";
import { Checkbox } from "../checkbox/checkbox";
import { Input } from "../input/input";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableCol,
  TableColGroup,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "./table";

import guidance from "./guidance.json";
import { Guidance, GuidanceStory, pairOf } from "@/stories/guidance";

const meta: Meta<typeof Table> = {
  title: "Components/Table",
  component: Table,
  parameters: {
    docs: {
      description: {
        component:
          "Rows of the same kind of thing, compared column by column. Figma " +
          "builds a table out of columns placed side by side; HTML has no " +
          "column element, so this is row-oriented and Figma's column Types " +
          "are cell content rather than variants.",
      },
    },
  },
  argTypes: { size: { control: "inline-radio", options: ["md", "sm"] } },
};
const pair = pairOf(guidance);

export default meta;
type Story = StoryObj<typeof Table>;

const rows = [
  {
    id: 1,
    name: "Sydney trunk 01",
    status: "Healthy",
    mos: "4.2",
    calls: "1,284",
  },
  {
    id: 2,
    name: "Melbourne trunk 02",
    status: "Warning",
    mos: "3.6",
    calls: "912",
  },
  {
    id: 3,
    name: "Auckland trunk 01",
    status: "Critical",
    mos: "2.9",
    calls: "146",
  },
  { id: 4, name: "Perth trunk 03", status: "Unknown", mos: "—", calls: "0" },
];

export const Default: Story = {
  render: (args) => (
    <Table {...args} aria-label="Trunks">
      <TableHeader>
        <TableRow>
          <TableHead>Trunk</TableHead>
          <TableHead>Status</TableHead>
          <TableHead numeric>MOS</TableHead>
          <TableHead numeric>Calls</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((r) => (
          <TableRow key={r.id}>
            <TableCell>{r.name}</TableCell>
            <TableCell>{r.status}</TableCell>
            <TableCell numeric>{r.mos}</TableCell>
            <TableCell numeric>{r.calls}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

/** The header stays 40 at both sizes; only the rows compress. */
export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-8">
      {(["md", "sm"] as const).map((size) => (
        <Table key={size} size={size} aria-label={`Trunks ${size}`}>
          <TableCaption>size={size}</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Trunk</TableHead>
              <TableHead numeric>MOS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.slice(0, 3).map((r) => (
              <TableRow key={r.id}>
                <TableCell>{r.name}</TableCell>
                <TableCell numeric>{r.mos}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ))}
    </div>
  ),
};

/**
 * Column widths declared once, in column order — the closest HTML gets to
 * Figma v2's column slot.
 */
export const ColumnWidths: Story = {
  name: "Column widths",
  parameters: { controls: { disable: true } },
  render: () => (
    <Table aria-label="Trunks with fixed columns">
      <TableColGroup>
        <TableCol className="w-12" />
        <TableCol />
        <TableCol className="w-32" />
        <TableCol className="w-24" />
      </TableColGroup>
      <TableHeader>
        <TableRow>
          <TableHead>
            <Checkbox size="sm" aria-label="Select all" />
          </TableHead>
          <TableHead>Trunk</TableHead>
          <TableHead>Status</TableHead>
          <TableHead numeric>MOS</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.slice(0, 3).map((r) => (
          <TableRow key={r.id}>
            <TableCell>
              <Checkbox size="sm" aria-label={`Select ${r.name}`} />
            </TableCell>
            <TableCell>{r.name}</TableCell>
            <TableCell>{r.status}</TableCell>
            <TableCell numeric>{r.mos}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

/** Selection lives on the row, so it reads and looks selected. */
export const Selectable: Story = {
  parameters: { controls: { disable: true } },
  render: function Render() {
    const [sel, setSel] = React.useState<number[]>([2]);
    const all = sel.length === rows.length;
    return (
      <Table aria-label="Trunks, selectable">
        <TableColGroup>
          <TableCol className="w-12" />
          <TableCol />
          <TableCol className="w-32" />
        </TableColGroup>
        <TableHeader>
          <TableRow>
            <TableHead>
              <Checkbox
                size="sm"
                checked={all ? true : sel.length ? "indeterminate" : false}
                onCheckedChange={(v) =>
                  setSel(v === true ? rows.map((r) => r.id) : [])
                }
                aria-label="Select all trunks"
              />
            </TableHead>
            <TableHead>Trunk</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.id} selected={sel.includes(r.id)}>
              <TableCell>
                <Checkbox
                  size="sm"
                  checked={sel.includes(r.id)}
                  onCheckedChange={(v) =>
                    setSel((s) =>
                      v ? [...s, r.id] : s.filter((x) => x !== r.id),
                    )
                  }
                  aria-label={`Select ${r.name}`}
                />
              </TableCell>
              <TableCell>{r.name}</TableCell>
              <TableCell>{r.status}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  },
};

/** Sorting state belongs on the header cell, where assistive tech reads it. */
export const Sortable: Story = {
  parameters: { controls: { disable: true } },
  render: function Render() {
    const [dir, setDir] = React.useState<"ascending" | "descending">(
      "ascending",
    );
    const sorted = [...rows].sort((a, b) =>
      dir === "ascending"
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name),
    );
    return (
      <Table aria-label="Trunks, sorted">
        <TableHeader>
          <TableRow>
            <TableHead aria-sort={dir}>
              <button
                type="button"
                className="inline-flex items-center gap-1.5"
                onClick={() =>
                  setDir((d) =>
                    d === "ascending" ? "descending" : "ascending",
                  )
                }
              >
                Trunk
                {dir === "ascending" ? (
                  <ArrowUp className="size-3.5" aria-hidden />
                ) : (
                  <ArrowDown className="size-3.5" aria-hidden />
                )}
              </button>
            </TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((r) => (
            <TableRow key={r.id}>
              <TableCell>{r.name}</TableCell>
              <TableCell>{r.status}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  },
};

/**
 * The card, toolbar and pagination bar around a table in Figma are not part
 * of this component — that surface is a Card, so it composes.
 */
export const InACard: Story = {
  name: "In a card",
  parameters: { controls: { disable: true } },
  render: () => (
    <Card>
      <CardHeader>
        <CardHeaderText>
          <CardTitle>Trunks</CardTitle>
        </CardHeaderText>
        <Button variant="ghost" size="icon-sm" aria-label="Table options">
          <MoreHorizontal />
        </Button>
      </CardHeader>
      <div className="mt-4 flex items-center gap-3 px-4 pb-3">
        <Input
          size="sm"
          placeholder="Search trunks"
          aria-label="Search trunks"
        />
        <Button variant="outline" size="sm">
          <Search />
          Filter
        </Button>
      </div>
      <Table aria-label="Trunks">
        <TableHeader>
          <TableRow>
            <TableHead>Trunk</TableHead>
            <TableHead>Status</TableHead>
            <TableHead numeric>Calls</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.id}>
              <TableCell>{r.name}</TableCell>
              <TableCell>{r.status}</TableCell>
              <TableCell numeric>{r.calls}</TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={2}>Total</TableCell>
            <TableCell numeric>2,342</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
      <CardFooter>
        <span className="text-body-sm text-content-neutral-muted">
          Showing 4 of 1,240
        </span>
      </CardFooter>
    </Card>
  ),
};

/* ------------------------------------------------------------------ */

/**
 * Narrow — 328, a 360 phone minus its gutters. A table does not reflow: the
 * scroller belongs on the table's own container so the page stays still and
 * the header row stays where the reader left it.
 */
export const Narrow: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="w-82 border border-line-neutral-muted p-3">
      <div className="overflow-x-auto">
        <Table size="sm">
          <TableHeader>
            <TableRow>
              <TableHead>Endpoint</TableHead>
              <TableHead>Site</TableHead>
              <TableHead>Loss</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[
              ["syd-edge-gateway-01", "Sydney", "0.2%"],
              ["mel-edge-gateway-02", "Melbourne", "1.8%"],
              ["akl-edge-gateway-01", "Auckland", "0.0%"],
            ].map(([name, site, loss]) => (
              <TableRow key={name}>
                <TableCell>{name}</TableCell>
                <TableCell>{site}</TableCell>
                <TableCell>{loss}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  ),
};

export const DoAndDont: Story = {
  name: "Do and Don't",
  parameters: { controls: { disable: true } },
  render: () => (
    <GuidanceStory>
      <Guidance
        pair={pair("align-numbers-right")}
        width="wide"
        stage="tall"
        dont={
          <>
            <Table size="sm" aria-label="Left aligned">
              <TableBody>
                {rows.slice(0, 3).map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{r.name}</TableCell>
                    <TableCell>{r.calls}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        }
        do={
          <>
            <Table size="sm" aria-label="Right aligned">
              <TableBody>
                {rows.slice(0, 3).map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{r.name}</TableCell>
                    <TableCell numeric>{r.calls}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        }
      />

      <Guidance
        pair={pair("headers-say-what-not-how")}
        width="wide"
        stage="tall"
        dont={
          <>
            <Table size="sm" aria-label="Long header">
              <TableHeader>
                <TableRow>
                  <TableHead>Trunk</TableHead>
                  <TableHead>
                    MOS (calculated hourly, 0–5, higher is better)
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>Sydney trunk 01</TableCell>
                  <TableCell numeric>4.2</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </>
        }
        do={
          <>
            <Table size="sm" aria-label="Short header">
              <TableCaption>
                MOS is calculated hourly, from 0 to 5. Higher is better.
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Trunk</TableHead>
                  <TableHead numeric>MOS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>Sydney trunk 01</TableCell>
                  <TableCell numeric>4.2</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </>
        }
      />

      <Guidance
        pair={pair("empty-is-a-state")}
        width="wide"
        stage="tall"
        dont={
          <>
            <Table size="sm" aria-label="Empty">
              <TableHeader>
                <TableRow>
                  <TableHead>Trunk</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody />
            </Table>
          </>
        }
        do={
          <>
            <Table size="sm" aria-label="Empty, explained">
              <TableHeader>
                <TableRow>
                  <TableHead>Trunk</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={2}>
                    <span className="text-content-neutral-muted">
                      No trunks match “auckland”. Clear the search to see all
                      1,240.
                    </span>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </>
        }
      />

      <Guidance
        pair={pair("one-thing-per-row")}
        width="wide"
        stage="tall"
        dont={
          <Table>
            <TableBody>
              <TableRow>
                <TableCell>probe-04</TableCell>
                <TableCell>Sydney</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>10.4.12.80</TableCell>
                <TableCell>Online</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        }
        do={
          <Table>
            <TableBody>
              <TableRow>
                <TableCell>
                  <div className="flex flex-col">
                    <span>probe-04</span>
                    <span className="text-body-sm text-content-neutral-muted">
                      10.4.12.80
                    </span>
                  </div>
                </TableCell>
                <TableCell>Sydney</TableCell>
                <TableCell>Online</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        }
      />

      <Guidance
        pair={pair("selection-belongs-to-the-row")}
        width="wide"
        stage="tall"
        dont={
          <Table>
            <TableBody>
              <TableRow>
                <TableCell>
                  <Checkbox defaultChecked />
                </TableCell>
                <TableCell>probe-04</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        }
        do={
          <Table>
            <TableBody>
              <TableRow selected>
                <TableCell>
                  <Checkbox defaultChecked />
                </TableCell>
                <TableCell>probe-04</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        }
      />
    </GuidanceStory>
  ),
};
