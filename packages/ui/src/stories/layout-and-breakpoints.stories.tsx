import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/table/table";

/**
 * Foundations / Layout and breakpoints — the rule for how wide content may
 * get. The numbers here are the same ones in the decisions log
 * (claude/picasso-decisions.md, 1 Oct), the App shell Rules and the Layout
 * page in Figma, and size/content/* + screen/desktop/* in @ir/tokens.
 */
const meta: Meta = {
  title: "Foundations/Layout and breakpoints",
  parameters: { layout: "fullscreen", controls: { disable: true } },
};
export default meta;

function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mt-10 mb-3 text-heading-lg text-content-neutral-emphasis">
      {children}
    </h2>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 text-body-md text-content-neutral-muted">{children}</p>
  );
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded-sm bg-surface-neutral-subtle px-1 text-code-sm text-content-neutral-emphasis">
      {children}
    </code>
  );
}

function Grid({ head, rows }: { head: string[]; rows: React.ReactNode[][] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {head.map((h, i) => (
            <TableHead key={h} numeric={i > 0 && typeof rows[0][i] === "number"}>
              {h}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((r, i) => (
          <TableRow key={i}>
            {r.map((c, j) => (
              <TableCell key={j} numeric={j > 0 && typeof c === "number"}>
                {c}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

/* Content column = viewport − rail − 2 × padding. Padding is 16 below xl
 * and 24 from xl; the rail is 256, or 48 collapsed at md. */
const COLUMN = [
  { vp: 768, note: "md, rail collapsed", rail: 48, pad: 16 },
  { vp: 1024, note: "lg", rail: 256, pad: 16 },
  { vp: 1280, note: "xl", rail: 256, pad: 24 },
  { vp: 1440, note: "wide-laptop", rail: 256, pad: 24 },
  { vp: 1536, note: "2xl", rail: 256, pad: 24 },
  { vp: 1920, note: "test only", rail: 256, pad: 24 },
  { vp: 2560, note: "test only", rail: 256, pad: 24 },
].map((r) => {
  const col = r.vp - r.rail - 2 * r.pad;
  const tiles = Math.floor((col + r.pad) / (224 + r.pad));
  const charts = col >= 1280 ? 3 : col >= 768 ? 2 : 1;
  return [
    `${r.vp} (${r.note})`,
    col,
    Math.min(col, 1280),
    Math.min(col, 768),
    tiles,
    charts,
  ];
});

export const LayoutAndBreakpoints: Story = {
  name: "Layout and breakpoints",
  render: () => (
    <article className="max-w-content-standard p-gutter">
      <h1 className="text-heading-xl text-content-neutral-emphasis">
        Layout and breakpoints
      </h1>
      <P>
        Viewport breakpoints belong to the shell: the rail, the page padding.
        Everything inside the content area answers to the content area. And
        how wide the content may get is a per-page choice between three
        modes.
      </P>

      <H2>The ladder</H2>
      <P>
        Tailwind&apos;s names and Tailwind&apos;s values, plus{" "}
        <Code>wide-laptop</Code> for 1440, which Tailwind has no rung for. One
        source: <Code>screen/desktop/*</Code>, with a build gate against{" "}
        <Code>--breakpoint-*</Code>. 1920 and 2560 are in the viewport
        toolbar for testing; they are not breakpoints.
      </P>
      <Grid
        head={["Name", "Width", "Use"]}
        rows={[
          ["sm", 640, "Below the supported floor. Present so the ladder is Tailwind's, entire"],
          ["md", 768, "Floor for desktop layouts. Rail collapsed by default"],
          ["lg", 1024, "Small laptop. Rail expanded from here"],
          ["xl", 1280, "Primary design canvas. Page padding steps 16 → 24"],
          ["wide-laptop", 1440, "Wide laptop. Named so because 1024 and 1280 are laptop widths too"],
          ["2xl", 1536, "Wide monitors, NOC displays"],
        ]}
      />

      <H2>Content width</H2>
      <P>
        Set per page with <Code>{'<AppShellContent width="…">'}</Code>. The
        default is <Code>fluid</Code>, so no existing page moves. Capped
        content stays left-aligned to the rail — never centred — so the page
        heading starts in the same place in every mode.
      </P>
      <Grid
        head={["Mode", "Max width", "Token", "Use for"]}
        rows={[
          ["fluid", "none", "—", "Dashboards, tables, log viewer"],
          ["standard", "1280", "size/content/standard", "Detail, settings and mixed pages"],
          ["reading", "768", "size/content/reading", "Forms and prose"],
        ]}
      />
      <P>
        <Code>standard</Code> only starts to bite above a 1584 viewport (1280
        + 256 rail + 48 padding), so it is a wide-screen rule.
      </P>

      <H2>What each viewport gets</H2>
      <P>
        Content column = viewport − rail − 2 × padding. Tiles assume the 224
        minimum and the gutter as gap.
      </P>
      <Grid
        head={["Viewport", "Fluid column", "Standard", "Reading", "KPI tiles per row", "Charts per row"]}
        rows={COLUMN}
      />

      <H2>Wide screens</H2>
      <P>On fluid pages, add columns; do not stretch.</P>
      <ul className="mb-3 list-disc space-y-1 ps-6 text-body-md text-content-neutral-muted">
        <li>
          KPI row: <Code>grid-cols-tiles</Code> — auto-fill with a 224 minimum
          (space/56, the tile as Figma&apos;s App shell draws it). More tiles
          per row as it widens.
        </li>
        <li>
          Chart rows: 1 across below 768 of content, 2 from 768, 3 from 1280 —{" "}
          <Code>grid-cols-1 @3xl:grid-cols-2 @7xl:grid-cols-3</Code>.
        </li>
        <li>
          Tables and time series take the full row at every width. Text
          columns keep a max width; spare width goes to spacing, not to
          stretched cells.
        </li>
        <li>
          Chart height is a fixed range (240–320), never an aspect ratio, so
          charts do not grow tall on wide screens.
        </li>
        <li>
          Grid gap is the gutter — <Code>gap-gutter</Code>, 16 below xl and 24
          from xl — because the Rules make the gutter equal the page padding.
        </li>
      </ul>

      <H2>Container, not viewport</H2>
      <P>
        The content column is a query container. Inside it, use{" "}
        <Code>@3xl:</Code> (768) and <Code>@7xl:</Code> (1280), never{" "}
        <Code>xl:</Code> or <Code>2xl:</Code>. The viewport does not know about
        the rail, the padding, a width cap or a drawer: the same grid gets 976
        at 1280 with the rail open and 1184 with it collapsed. Viewport
        breakpoints are for the shell only — rail collapse and page padding.
      </P>

      <H2>Out of scope</H2>
      <P>
        Wallboard and TV mode — a NOC screen across a room, read at a
        distance — is a different density, not a wider dashboard. Logged as
        open.
      </P>
    </article>
  ),
};
type Story = StoryObj;
