import type { Meta, StoryObj } from "@storybook/react";
import { Bell, Download, MapPin, MoreHorizontal, Plus, Search } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../components/accordion/accordion";
import { Alert, AlertDescription, AlertTitle } from "../components/alert/alert";
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarStatus,
} from "../components/avatar/avatar";
import { Badge } from "../components/badge/badge";
import { BarChart, type BarSeries } from "../components/bar-chart/bar-chart";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
} from "../components/breadcrumb/breadcrumb";
import { Button } from "../components/button/button";
import { Checkbox } from "../components/checkbox/checkbox";
import { Chip } from "../components/chip/chip";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardHeaderText,
  CardTitle,
} from "../components/card/card";
import {
  Field,
  FieldControl,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldOption,
} from "../components/field/field";
import { KpiTile } from "../components/kpi-tile/kpi-tile";
import { Input } from "../components/input/input";
import { Kbd, KbdGroup } from "../components/kbd/kbd";
import { Meter } from "../components/meter/meter";
import { Progress } from "../components/progress/progress";
import { Radio, RadioGroup } from "../components/radio-group/radio-group";
import { Select, type SelectOption } from "../components/select/select";
import {
  SegmentedControl,
  SegmentedControlItem,
} from "../components/segmented-control/segmented-control";
import { Separator } from "../components/separator/separator";
import { Skeleton, SkeletonText } from "../components/skeleton/skeleton";
import { Slider } from "../components/slider/slider";
import { Sparkline } from "../components/sparkline/sparkline";
import { Switch } from "../components/switch/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/table/table";
import { Tabs, TabsList, TabsTrigger } from "../components/tabs/tabs";
import { Textarea } from "../components/textarea/textarea";

/**
 * One screen that exercises every axis at once. The theme builder on the site
 * loads this story in an iframe and drives the axes on its <html>, so what it
 * shows is the real components on the real tokens — nothing re-implemented.
 *
 * That last part is the rule, not a description: every surface here that
 * could be a component IS one. The sections used to be hand-rolled
 * `rounded-lg border bg-surface-card` divs, which meant the radius axis moved
 * them by a different amount than it moved a real Card, and nobody could see
 * it. Add to it as components land.
 */
const meta: Meta = {
  title: "Theming/Preview",
  parameters: { layout: "fullscreen", a11y: { test: "todo" } },
};
export default meta;

const rows = [
  {
    name: "Sydney trunk 01",
    status: "healthy",
    mos: 4.2,
    calls: "1,284",
    trend: [4.3, 4.2, 4.4, 4.3, 4.1, 4.2, 4.2, 4.3, 4.2],
  },
  {
    name: "Melbourne trunk 02",
    status: "warning",
    mos: 3.6,
    calls: "912",
    trend: [4.1, 4.0, 3.9, 3.8, 3.8, 3.7, 3.6, 3.7, 3.6],
  },
  {
    name: "Auckland trunk 01",
    status: "critical",
    mos: 2.9,
    calls: "146",
    trend: [3.9, 3.7, 3.4, 3.2, 3.0, 2.8, 2.9, 2.8, 2.9],
  },
  {
    name: "Perth trunk 03",
    status: "unknown",
    mos: null,
    calls: "0",
    trend: [4.0, 4.1, null, null, null, null, null, null, null],
  },
] as const;

const sparklineTone = {
  healthy: "healthy",
  warning: "warning",
  critical: "critical",
  unknown: "neutral",
} as const;

const regions = ["Sydney", "Melbourne", "Auckland", "Perth"] as const;

const eventTypes: SelectOption[] = [
  { value: "alert.fired", label: "Fired", group: "Alert" },
  { value: "alert.acknowledged", label: "Acknowledged", group: "Alert" },
  { value: "alert.resolved", label: "Resolved", group: "Alert" },
  { value: "probe.paused", label: "Paused", group: "Probe" },
];

const failureSites = ["Sydney", "Melbourne", "Perth", "Brisbane", "Auckland"];
const failuresByCause: BarSeries[] = [
  { id: "codec", label: "Codec mismatch", points: [42, 31, 18, 24, 11] },
  { id: "jitter", label: "Jitter", points: [28, 44, 12, 19, 22] },
  { id: "auth", label: "Auth failure", points: [12, 8, 26, 7, 5] },
];

const team = [
  { initials: "OR", status: "online" },
  { initials: "JL", status: "online" },
  { initials: "SK", status: "offline" },
] as const;

const statusClass = {
  healthy: "bg-status-healthy",
  warning: "bg-status-warning",
  critical: "bg-status-critical",
  unknown: "bg-status-unknown",
} as const;

const kpis = [
  {
    label: "Endpoints online",
    value: "3,412",
    unit: undefined,
    delta: <Badge color="success">+2.1%</Badge>,
  },
  {
    label: "Mean MOS",
    value: "4.1",
    unit: "/ 5",
    delta: <Badge color="warning">−0.1</Badge>,
  },
  {
    label: "Open alerts",
    value: "7",
    unit: "of 1,240",
    delta: <Badge color="danger">3 critical</Badge>,
  },
] as const;

function Preview() {
  return (
    <div className="min-h-screen bg-surface-app text-content-neutral-emphasis font-sans">
      {/* Top bar */}
      <header className="flex items-center gap-4 border-b border-line-neutral-muted bg-surface-card px-6 py-3">
        <span className="text-lg font-semibold">Fleet</span>
        <nav className="hidden items-center gap-1 sm:flex">
          {["Overview", "Endpoints", "Alerts", "Reports"].map((item, i) => (
            <Button
              key={item}
              variant={i === 0 ? "secondary" : "ghost"}
              size="sm"
            >
              {item}
            </Button>
          ))}
        </nav>
        <div className="ms-auto flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Search />
            Search
            <KbdGroup>
              <Kbd>Ctrl</Kbd>
              <Kbd>K</Kbd>
            </KbdGroup>
          </Button>
          <Button variant="outline" size="icon-md" aria-label="Notifications">
            <Bell />
          </Button>
          <Button size="sm">
            <Plus />
            Add endpoint
          </Button>
          <Avatar>
            <AvatarFallback>EN</AvatarFallback>
            <AvatarStatus type="online" />
          </Avatar>
        </div>
      </header>

      <main className="mx-auto grid max-w-5xl gap-6 p-6 lg:grid-cols-3">
        {/* Page header — where you are, the views of it, and the time range */}
        <div className="flex flex-col gap-4 lg:col-span-3">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="#">Fleet</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbItem>
                <BreadcrumbLink href="#">APAC</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbItem>
                <BreadcrumbPage>Voice trunks</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <Tabs defaultValue="overview">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="quality">Call quality</TabsTrigger>
                <TabsTrigger value="capacity">Capacity</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>
            </Tabs>
            <SegmentedControl aria-label="Range" defaultValue="day">
              <SegmentedControlItem value="hour">1h</SegmentedControlItem>
              <SegmentedControlItem value="day">24h</SegmentedControlItem>
              <SegmentedControlItem value="week">7d</SegmentedControlItem>
              <SegmentedControlItem value="month">30d</SegmentedControlItem>
            </SegmentedControl>
          </div>
        </div>

        {/* A standing condition, in place — the tone lives in the surface */}
        <div className="lg:col-span-3">
          <Alert variant="warning" role="status">
            <AlertTitle>Auckland trunk 01 below threshold</AlertTitle>
            <AlertDescription>
              MOS has been under 3.0 for 12 minutes. Calls are still connecting.
            </AlertDescription>
          </Alert>
        </div>

        {/* KPI tiles — the real component, not a Card standing in for one.
            A tile is deliberately quieter than a Card: border/neutral/subtle
            and no shadow, because it lives in a row of its peers. */}
        {kpis.map((k) => (
          <KpiTile
            key={k.label}
            label={k.label}
            value={k.value}
            unit={k.unit}
            comparison={k.delta}
          />
        ))}

        {/* Table — the Table component, with the data-viz primitives in cells */}
        <div className="lg:col-span-2 [&>*]:h-full">
          <Card>
            <CardHeader>
              <CardHeaderText>
                <CardTitle>Trunks</CardTitle>
                <CardDescription>4 of 38 in APAC</CardDescription>
              </CardHeaderText>
              <CardAction>
                <Input
                  placeholder="Search trunks"
                  size="sm"
                  aria-label="Search trunks"
                />
                <Button variant="outline" size="sm">
                  <Download />
                  Export
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {regions.map((r, i) => (
                  <Chip key={r} selected={i < 2}>
                    <MapPin aria-hidden />
                    {r}
                  </Chip>
                ))}
              </div>
            </CardContent>
            <Table aria-label="Trunks" className="mt-2">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox aria-label="Select all trunks" />
                  </TableHead>
                  <TableHead>Trunk</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>24h</TableHead>
                  <TableHead numeric>MOS</TableHead>
                  <TableHead numeric>Calls</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r, i) => (
                  <TableRow key={r.name} selected={i === 2}>
                    <TableCell>
                      <Checkbox
                        defaultChecked={i === 2}
                        aria-label={`Select ${r.name}`}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{r.name}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-2">
                        <span
                          className={`size-2 rounded-full ${statusClass[r.status]}`}
                          aria-hidden
                        />
                        <span className="capitalize">{r.status}</span>
                      </span>
                    </TableCell>
                    <TableCell>
                      <Sparkline
                        values={r.trend}
                        tone={sparklineTone[r.status]}
                        min={2.5}
                        max={5}
                        label={null}
                      />
                    </TableCell>
                    <TableCell numeric>
                      {r.mos === null ? (
                        <span className="font-mono">—</span>
                      ) : (
                        <span className="inline-flex items-center justify-end gap-2">
                          <Meter
                            value={r.mos}
                            max={5}
                            status={r.status}
                            className="w-12"
                          />
                          <span className="font-mono">{r.mos.toFixed(1)}</span>
                        </span>
                      )}
                    </TableCell>
                    <TableCell numeric className="font-mono">
                      {r.calls}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>

        {/* Form — every input type, so a radius or ramp change reaches them all */}
        <Card>
          <CardHeader>
            <CardHeaderText>
              <CardTitle>Alert threshold</CardTitle>
              <CardDescription>
                Raise an alert when MOS falls below this value.
              </CardDescription>
            </CardHeaderText>
          </CardHeader>
          <CardContent>
            <Field>
              <FieldLabel required>Threshold</FieldLabel>
              <FieldControl>
                <Input placeholder="3.6" />
              </FieldControl>
              <FieldDescription>
                MOS is measured to one decimal.
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel>Sensitivity</FieldLabel>
              <Slider defaultValue={[60]} thumbLabels={["Sensitivity"]} />
            </Field>
            <Field>
              <FieldLabel>Severity</FieldLabel>
              <RadioGroup
                aria-label="Severity"
                defaultValue="medium"
                className="flex gap-4"
              >
                {["Low", "Medium", "High"].map((l) => (
                  <FieldOption
                    key={l}
                    control={<Radio value={l.toLowerCase()} />}
                  >
                    {l}
                  </FieldOption>
                ))}
              </RadioGroup>
            </Field>
            <Field>
              <FieldLabel>Event types</FieldLabel>
              <FieldControl>
                <Select label="Choose events…" options={eventTypes} />
              </FieldControl>
            </Field>
            <Field invalid>
              <FieldLabel>Notify</FieldLabel>
              <FieldControl>
                <Input defaultValue="ops@ir" />
              </FieldControl>
              <FieldError>Enter a full email address.</FieldError>
            </Field>
            <Field>
              <FieldLabel>Note</FieldLabel>
              <FieldControl>
                <Textarea placeholder="Why this threshold?" rows={2} />
              </FieldControl>
            </Field>
            <FieldOption control={<Switch defaultChecked />}>
              Quiet hours, 10 pm to 6 am
            </FieldOption>
          </CardContent>
          <CardFooter>
            <div className="ms-auto flex gap-2">
              <Button variant="ghost">Cancel</Button>
              <Button>Save changes</Button>
            </div>
          </CardFooter>
        </Card>

        {/* Chart — the categorical palette against the theme's neutrals */}
        <div className="lg:col-span-2 [&>*]:h-full">
          <Card>
            <CardContent>
              <BarChart
                x={failureSites}
                series={failuresByCause}
                title="Call failures by site"
                subtitle="Last 7 days"
                yLabel="Failures"
                xLabel="Site"
                label="Call failures by site and cause over the last seven days"
              />
            </CardContent>
          </Card>
        </div>

        {/* Work in progress — progress, loading and who's on it */}
        <Card>
          <CardHeader>
            <CardHeaderText>
              <CardTitle>Incident 4127</CardTitle>
              <CardDescription>Auckland trunk 01</CardDescription>
            </CardHeaderText>
            <CardAction>
              <Badge color="danger">Critical</Badge>
            </CardAction>
          </CardHeader>
          <CardContent>
            <AvatarGroup>
              {team.map((m) => (
                <Avatar key={m.initials}>
                  <AvatarFallback>{m.initials}</AvatarFallback>
                  <AvatarStatus type={m.status} />
                </Avatar>
              ))}
            </AvatarGroup>
            <Progress value={64} label="Re-probing endpoints" />
            <Progress value={30} variant="neutral" label="Collecting traces" />
            <Separator />
            <div className="flex items-center gap-3">
              <Skeleton shape="circle" className="size-8" />
              <SkeletonText lines={2} className="flex-1" />
            </div>
          </CardContent>
        </Card>

        {/* Every button variant, so a ramp change is seen across the hierarchy */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardHeaderText>
                <CardTitle>Actions</CardTitle>
              </CardHeaderText>
              <CardAction>
                <Button variant="ghost" size="icon-sm" aria-label="More">
                  <MoreHorizontal />
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center gap-2">
                <Button>Primary</Button>
                <Button variant="neutral">Neutral</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="link">Link</Button>
                <Button disabled>Disabled</Button>
                <Button loading>Loading</Button>
              </div>

              {/* Badges and selection controls, side by side */}
              <div className="flex flex-wrap items-center gap-2">
                <Badge color="success">Healthy</Badge>
                <Badge color="warning">Degraded</Badge>
                <Badge color="danger">Down</Badge>
                <Badge>Neutral</Badge>
                <Separator orientation="vertical" className="h-5" />
                <Checkbox defaultChecked aria-label="Checked" />
                <Checkbox aria-label="Unchecked" />
                <Switch defaultChecked aria-label="On" />
                <Switch aria-label="Off" />
              </div>

              {/* The four tones as the component that owns them */}
              <div className="grid gap-2 sm:grid-cols-2">
                <Alert variant="info">
                  <AlertTitle>Maintenance on Sunday</AlertTitle>
                </Alert>
                <Alert variant="success">
                  <AlertTitle>Probe restored</AlertTitle>
                </Alert>
                <Alert variant="warning">
                  <AlertTitle>Disk at 91%</AlertTitle>
                </Alert>
                <Alert variant="destructive">
                  <AlertTitle>Collection stopped</AlertTitle>
                </Alert>
              </div>

              <Accordion type="single" collapsible defaultValue="q0">
                <AccordionItem value="q0">
                  <AccordionTrigger>Why is MOS measured out of 5?</AccordionTrigger>
                  <AccordionContent>
                    Mean opinion score is the ITU scale for perceived call
                    quality: 1 is unusable, 5 is perfect.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="q1" divider>
                  <AccordionTrigger>What counts as a failed call?</AccordionTrigger>
                  <AccordionContent>
                    Any call that does not reach 200 OK within the trunk's
                    timeout.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <pre className="overflow-x-auto rounded-md bg-surface-neutral-subtle p-3 font-mono text-body-xs text-content-neutral-emphasis">
                {`INVITE sip:+61280000000@sbc.ir.local SIP/2.0  →  200 OK  (MOS 4.2, jitter 3 ms)`}
              </pre>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

export const Default: StoryObj = { render: () => <Preview /> };
