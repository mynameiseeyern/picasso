import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Activity, Bell, Gauge, Server } from "lucide-react";

import {
  AppShell,
  AppShellContent,
  AppShellHeader,
  AppShellMain,
} from "./app-shell";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
} from "../breadcrumb/breadcrumb";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuLabel,
  SidebarProvider,
  SidebarTrigger,
} from "../sidebar/sidebar";

import { Badge } from "../badge/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../card/card";
import { Field, FieldControl, FieldDescription, FieldLabel } from "../field/field";
import { Input } from "../input/input";
import { KpiTile } from "../kpi-tile/kpi-tile";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../table/table";

import guidance from "./guidance.json";
import { Guidance, GuidanceStory, pairOf } from "@/stories/guidance";

const meta: Meta<typeof AppShell> = {
  title: "Components/App shell",
  component: AppShell,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "The frame every product screen starts from. Figma draws ten " +
          "variants across Screen × Sidebar; Screen is breakpoints, which " +
          "the browser does itself, so in code there are none — the shell " +
          "is chrome, and the chrome is fixed. Page padding steps from 16 " +
          "to 24 at 1280 (xl). Content width is a per-page choice: " +
          "`fluid`, `standard` (1280) or `reading` (768) — see " +
          "Foundations / Layout and breakpoints.",
      },
    },
  },
};
const pair = pairOf(guidance);

export default meta;
type Story = StoryObj<typeof AppShell>;

const NAV = [
  { icon: Gauge, label: "Overview" },
  { icon: Server, label: "Endpoints" },
  { icon: Activity, label: "Metrics" },
  { icon: Bell, label: "Alerts" },
];

function Nav({ active }: { active: string }) {
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-1 text-label-md text-content-neutral-emphasis">
          <span
            aria-hidden
            className="flex size-8 shrink-0 items-center justify-center rounded-md bg-surface-primary-emphasis text-label-sm text-content-on-primary-emphasis"
          >
            IR
          </span>
          <span className="truncate">Clarion</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Monitoring</SidebarGroupLabel>
          <SidebarMenu>
            {NAV.map(({ icon: Icon, label }) => (
              <SidebarMenuItem key={label}>
                <SidebarMenuButton active={label === active}>
                  <Icon aria-hidden />
                  <SidebarMenuLabel>{label}</SidebarMenuLabel>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

function Crumbs({ page }: { page: string }) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="#monitoring">Monitoring</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbPage>{page}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}

function Page({ title, lines = 3 }: { title: string; lines?: number }) {
  return (
    <>
      <h1 className="text-heading-md text-content-neutral-emphasis">{title}</h1>
      <div className="mt-4 space-y-4 text-body-md text-content-neutral-muted">
        {Array.from({ length: lines }, (_, i) => (
          <p key={i}>
            The page header, the page title and the page actions all live here,
            inside the content area — not in the top bar, which stays at 48 and
            carries the toggle and the breadcrumb only.
          </p>
        ))}
      </div>
    </>
  );
}

/** The default canvas: lg (1280), rail expanded. */
export const Default: Story = {
  render: () => (
    <div className="h-150">
      <SidebarProvider>
        <AppShell>
          <Nav active="Endpoints" />
          <AppShellMain>
            <AppShellHeader>
              <SidebarTrigger />
              <Crumbs page="Endpoints" />
            </AppShellHeader>
            <AppShellContent>
              <Page title="Endpoints" />
            </AppShellContent>
          </AppShellMain>
        </AppShell>
      </SidebarProvider>
    </div>
  ),
};

/** Collapsed to the 48 rail. The toggle is in the top bar, where it stays. */
export const Collapsed: Story = {
  render: () => (
    <div className="h-150">
      <SidebarProvider defaultCollapsed>
        <AppShell>
          <Nav active="Endpoints" />
          <AppShellMain>
            <AppShellHeader>
              <SidebarTrigger />
              <Crumbs page="Endpoints" />
            </AppShellHeader>
            <AppShellContent>
              <Page title="Endpoints" />
            </AppShellContent>
          </AppShellMain>
        </AppShell>
      </SidebarProvider>
    </div>
  ),
};

/* ------------------------------------------------------------------ */
/* Width modes                                                         */
/* ------------------------------------------------------------------ */

type Width = "fluid" | "standard" | "reading";

/** The shell at full canvas height, for the width-mode stories. */
function Shell({
  width,
  active,
  page,
  children,
}: {
  width?: Width;
  active: string;
  page: string;
  children: React.ReactNode;
}) {
  return (
    <div className="h-svh">
      <SidebarProvider>
        <AppShell>
          <Nav active={active} />
          <AppShellMain>
            <AppShellHeader>
              <SidebarTrigger />
              <Crumbs page={page} />
            </AppShellHeader>
            <AppShellContent width={width}>{children}</AppShellContent>
          </AppShellMain>
        </AppShell>
      </SidebarProvider>
    </div>
  );
}

const KPIS = [
  { label: "Availability", value: "99.95", unit: "%", status: "healthy" },
  { label: "Active calls", value: "1,284" },
  { label: "MOS", value: "4.1", unit: "/ 5", status: "healthy" },
  { label: "Jitter", value: "18", unit: "ms", status: "warning" },
  { label: "Packet loss", value: "0.4", unit: "%", status: "healthy" },
  { label: "Failed calls", value: "12", status: "critical" },
] as const;

const ROWS = [
  ["sbc-syd-01.edge.example.net", "Sydney", "healthy", "24", "8,412"],
  ["sbc-mel-02.edge.example.net", "Melbourne", "healthy", "31", "6,005"],
  ["teams-direct-routing-gateway-ap-southeast", "Singapore", "warning", "88", "2,341"],
  ["webex-trunk-03.example.net", "Auckland", "critical", "212", "419"],
] as const;

const STATUS = {
  healthy: { color: "success", label: "Healthy" },
  warning: { color: "warning", label: "Warning" },
  critical: { color: "danger", label: "Critical" },
} as const;

/**
 * A chart stand-in. The point is its box: full width of its grid cell and a
 * fixed height (h-64, 256 — inside the 240–320 range), never an aspect
 * ratio, so a wide screen gives it more time range, not more height.
 */
function ChartCard({ title, series }: { title: string; series: 1 | 2 | 3 }) {
  const stroke = ["stroke-chart-1", "stroke-chart-2", "stroke-chart-3"][
    series - 1
  ];
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <svg
          role="img"
          aria-label={`${title}, last 24 hours`}
          viewBox="0 0 400 100"
          preserveAspectRatio="none"
          className="block h-64 w-full"
        >
          <path
            d="M0 70 L40 62 L80 66 L120 40 L160 48 L200 30 L240 44 L280 36 L320 52 L360 28 L400 34"
            fill="none"
            className={stroke}
            strokeWidth={2}
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </CardContent>
    </Card>
  );
}

function Dashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-heading-xl text-content-neutral-emphasis">Overview</h1>

      {/* KPI row: auto-fill with a 224 minimum. More tiles per row as the
          column widens; never four stretched tiles. */}
      <section aria-label="Key metrics" className="grid grid-cols-tiles gap-gutter">
        {KPIS.map((k) => (
          <KpiTile
            key={k.label}
            label={k.label}
            value={k.value}
            unit={"unit" in k ? k.unit : undefined}
            status={"status" in k ? k.status : "none"}
          />
        ))}
      </section>

      {/* Chart row: 1 across below 768 of content, 2 from 768, 3 from 1280.
          @3xl / @7xl are container widths — the column, not the screen. */}
      <section
        aria-label="Trends"
        className="grid grid-cols-1 gap-gutter @3xl:grid-cols-2 @7xl:grid-cols-3"
      >
        <ChartCard title="Call volume" series={1} />
        <ChartCard title="MOS" series={2} />
        <ChartCard title="Jitter" series={3} />
      </section>

      {/* Tables take the full row at every width. The text column has a
          max width and truncates; spare width becomes spacing between
          columns, not a stretched cell. */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Endpoint</TableHead>
            <TableHead>Region</TableHead>
            <TableHead>Status</TableHead>
            <TableHead numeric>Latency (ms)</TableHead>
            <TableHead numeric>Calls</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ROWS.map(([name, region, status, latency, calls]) => (
            <TableRow key={name}>
              <TableCell>
                <span className="block max-w-80 truncate" title={name}>
                  {name}
                </span>
              </TableCell>
              <TableCell>{region}</TableCell>
              <TableCell>
                <Badge color={STATUS[status].color} dot>
                  {STATUS[status].label}
                </Badge>
              </TableCell>
              <TableCell numeric>{latency}</TableCell>
              <TableCell numeric>{calls}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function DetailPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-heading-xl text-content-neutral-emphasis">
        sbc-syd-01
      </h1>
      <div className="grid grid-cols-1 gap-gutter @3xl:grid-cols-2">
        <ChartCard title="Call volume" series={1} />
        <ChartCard title="MOS" series={2} />
      </div>
      <Page title="Configuration" lines={2} />
    </div>
  );
}

function SettingsForm() {
  return (
    <div className="space-y-6">
      <h1 className="text-heading-xl text-content-neutral-emphasis">
        Notification settings
      </h1>
      <p className="text-body-md text-content-neutral-muted">
        Alerts go to the people and channels below when an endpoint crosses a
        threshold. Changes apply to new alerts only; open alerts keep the
        routing they started with.
      </p>
      <Field>
        <FieldLabel>Alert email</FieldLabel>
        <FieldControl>
          <Input type="email" defaultValue="noc@example.com" />
        </FieldControl>
        <FieldDescription>One address. Use a list for a team.</FieldDescription>
      </Field>
      <Field>
        <FieldLabel>Webhook URL</FieldLabel>
        <FieldControl>
          <Input defaultValue="https://hooks.example.com/clarion/alerts" />
        </FieldControl>
      </Field>
    </div>
  );
}

/**
 * `fluid` — the default. No cap; on wide screens the page adds columns
 * rather than stretching. Check at 1280, 1536, 1920 and 2560.
 */
export const WidthFluid: Story = {
  name: "Width: fluid",
  render: () => (
    <Shell active="Overview" page="Overview">
      <Dashboard />
    </Shell>
  ),
};

/**
 * `standard` — capped at 1280 (size/content/standard), left-aligned. The
 * cap only bites above a 1584 viewport, so it looks like fluid until then.
 */
export const WidthStandard: Story = {
  name: "Width: standard",
  render: () => (
    <Shell width="standard" active="Endpoints" page="sbc-syd-01">
      <DetailPage />
    </Shell>
  ),
};

/**
 * `reading` — capped at 768 (size/content/reading), left-aligned. Forms
 * and prose.
 */
export const WidthReading: Story = {
  name: "Width: reading",
  render: () => (
    <Shell width="reading" active="Alerts" page="Notification settings">
      <SettingsForm />
    </Shell>
  ),
};

/**
 * The wide-screen rule end to end: KPI row (auto-fill, 224 minimum), three
 * charts (1 → 2 → 3 across on container width), one table (full row). Use
 * the viewport toolbar: 4 tiles at xl, 5 at 2xl, 6 at 1920, 9 at 2560;
 * charts go to 3 across once the column reaches 1280.
 */
export const DashboardExample: Story = {
  name: "Dashboard example",
  render: () => (
    <Shell active="Overview" page="Overview">
      <Dashboard />
    </Shell>
  ),
};

/** Long pages scroll in the content area; the rail and the bar stay put. */
export const Scrolling: Story = {
  render: () => (
    <div className="h-120">
      <SidebarProvider>
        <AppShell>
          <Nav active="Metrics" />
          <AppShellMain>
            <AppShellHeader>
              <SidebarTrigger />
              <Crumbs page="Metrics" />
            </AppShellHeader>
            <AppShellContent>
              <Page title="Metrics" lines={12} />
            </AppShellContent>
          </AppShellMain>
        </AppShell>
      </SidebarProvider>
    </div>
  ),
};

/* ------------------------------------------------------------------ */

/** A top bar, shown twice: overloaded, and as the Rules describe it. */
function TopBar({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full overflow-hidden rounded-md border border-line-neutral-muted">
      <SidebarProvider>
        <AppShell>
          <AppShellMain>
            <AppShellHeader>{children}</AppShellHeader>
            <AppShellContent>
              <p className="text-body-md text-content-neutral-muted">
                Page content
              </p>
            </AppShellContent>
          </AppShellMain>
        </AppShell>
      </SidebarProvider>
    </div>
  );
}

export const DoAndDont: Story = {
  name: "Do and Don't",
  parameters: { controls: { disable: true } },
  render: () => (
    <GuidanceStory>
      <Guidance
        pair={pair("top-bar-is-not-a-header")}
        width="wide"
        dont={
          <>
            <div className="h-32 w-full">
              <TopBar>
                <SidebarTrigger />
                <Crumbs page="Endpoints" />
                <span className="ml-2 truncate text-label-md text-content-neutral-emphasis">
                  Endpoints
                </span>
                <span className="ml-auto flex items-center gap-2 text-body-sm text-content-neutral-muted">
                  <span className="rounded-md border border-line-neutral-muted px-2 py-1">
                    Search
                  </span>
                  <span className="rounded-md border border-line-neutral-muted px-2 py-1">
                    Export
                  </span>
                </span>
              </TopBar>
            </div>
          </>
        }
        do={
          <>
            <div className="h-32 w-full">
              <TopBar>
                <SidebarTrigger />
                <Crumbs page="Endpoints" />
              </TopBar>
            </div>
          </>
        }
      />

      <Guidance
        pair={pair("cap-the-column-not-the-page")}
        width="wide"
        dont={
          <>
            <div className="w-full text-body-md text-content-neutral-muted">
              <div className="mx-auto max-w-80 rounded-md border border-line-neutral-muted p-3">
                Notification settings
              </div>
            </div>
          </>
        }
        do={
          <>
            <div className="w-full text-body-md text-content-neutral-muted">
              <div className="max-w-80 rounded-md border border-line-neutral-muted p-3">
                Notification settings
              </div>
            </div>
          </>
        }
      />

      <Guidance
        pair={pair("dashboards-add-columns")}
        width="wide"
        dont={
          <div className="grid w-full grid-cols-4 gap-2">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="h-12 rounded-md border border-line-neutral-muted bg-surface-card" />
            ))}
          </div>
        }
        do={
          <div className="grid w-full grid-cols-8 gap-2">
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} className="h-12 rounded-md border border-line-neutral-muted bg-surface-card" />
            ))}
          </div>
        }
      />

      <Guidance
        pair={pair("cap-forms-at-reading-width")}
        width="wide"
        dont={
          <div className="w-full">
            <Input aria-label="Alert email" defaultValue="noc@example.com" />
          </div>
        }
        do={
          <div className="w-full">
            <div className="max-w-60">
              <Input aria-label="Alert email" defaultValue="noc@example.com" />
            </div>
          </div>
        }
      />

      <Guidance
        pair={pair("grids-follow-the-container")}
        width="wide"
        stage="tall"
        dont={
          // A viewport breakpoint inside a narrow column: at a wide screen
          // it fires, and three columns are squeezed into 224.
          <div className="w-56 rounded-md border border-line-neutral-muted p-2">
            <div className="grid grid-cols-1 gap-2 xl:grid-cols-3">
              {["Calls", "MOS", "Jitter"].map((t) => (
                <div key={t} className="truncate rounded-md bg-surface-neutral-subtle p-2 text-body-sm text-content-neutral-emphasis">
                  {t} last 24 h
                </div>
              ))}
            </div>
          </div>
        }
        do={
          <div className="w-56 rounded-md border border-line-neutral-muted p-2 @container">
            <div className="grid grid-cols-1 gap-2 @3xl:grid-cols-3">
              {["Calls", "MOS", "Jitter"].map((t) => (
                <div key={t} className="truncate rounded-md bg-surface-neutral-subtle p-2 text-body-sm text-content-neutral-emphasis">
                  {t} last 24 h
                </div>
              ))}
            </div>
          </div>
        }
      />

      <Guidance
        pair={pair("charts-have-a-height-range")}
        width="wide"
        stage="tall"
        dont={
          <svg viewBox="0 0 400 100" preserveAspectRatio="none" aria-hidden className="block aspect-video w-full rounded-md bg-surface-neutral-subtle">
            <path d="M0 70 L80 66 L160 48 L240 44 L320 52 L400 34" fill="none" className="stroke-chart-1" strokeWidth={2} vectorEffect="non-scaling-stroke" />
          </svg>
        }
        do={
          <svg viewBox="0 0 400 100" preserveAspectRatio="none" aria-hidden className="block h-24 w-full rounded-md bg-surface-neutral-subtle">
            <path d="M0 70 L80 66 L160 48 L240 44 L320 52 L400 34" fill="none" className="stroke-chart-1" strokeWidth={2} vectorEffect="non-scaling-stroke" />
          </svg>
        }
      />
    </GuidanceStory>
  ),
};
