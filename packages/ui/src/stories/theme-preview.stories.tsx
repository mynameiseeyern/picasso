import type { Meta, StoryObj } from "@storybook/react";
import { Bell, Download, MoreHorizontal, Plus } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "../components/alert/alert";
import { Badge } from "../components/badge/badge";
import { Button } from "../components/button/button";
import {
  Card, CardAction, CardContent, CardDescription, CardFooter,
  CardHeader, CardHeaderText, CardTitle,
} from "../components/card/card";
import { Field, FieldControl, FieldDescription, FieldError, FieldLabel } from "../components/field/field";
import { KpiTile } from "../components/kpi-tile/kpi-tile";
import { Input } from "../components/input/input";
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
  { name: "Sydney trunk 01", status: "healthy", mos: "4.2", calls: "1,284" },
  { name: "Melbourne trunk 02", status: "warning", mos: "3.6", calls: "912" },
  { name: "Auckland trunk 01", status: "critical", mos: "2.9", calls: "146" },
  { name: "Perth trunk 03", status: "unknown", mos: "—", calls: "0" },
] as const;

const statusClass = {
  healthy: "bg-status-healthy",
  warning: "bg-status-warning",
  critical: "bg-status-critical",
  unknown: "bg-status-unknown",
} as const;

const kpis = [
  { label: "Endpoints online", value: "3,412", unit: undefined, delta: <Badge color="success">+2.1%</Badge> },
  { label: "Mean MOS", value: "4.1", unit: "/ 5", delta: <Badge color="warning">−0.1</Badge> },
  { label: "Open alerts", value: "7", unit: "of 1,240", delta: <Badge color="danger">3 critical</Badge> },
] as const;

function Preview() {
  return (
    <div className="min-h-screen bg-surface-app text-content-neutral-emphasis font-sans">
      {/* Top bar */}
      <header className="flex items-center gap-4 border-b border-line-neutral-subtle bg-surface-card px-6 py-3">
        <span className="text-lg font-semibold">Fleet</span>
        <nav className="hidden items-center gap-1 sm:flex">
          {["Overview", "Endpoints", "Alerts", "Reports"].map((item, i) => (
            <Button key={item} variant={i === 0 ? "secondary" : "ghost"} size="sm">
              {item}
            </Button>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" size="icon-md" aria-label="Notifications">
            <Bell />
          </Button>
          <Button size="sm">
            <Plus />
            Add endpoint
          </Button>
        </div>
      </header>

      <main className="mx-auto grid max-w-5xl gap-6 p-6 lg:grid-cols-3">
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
          <KpiTile key={k.label} label={k.label} value={k.value} unit={k.unit} comparison={k.delta} />
        ))}

        {/* Table — header from the card, the table itself edge to edge */}
        <div className="lg:col-span-2 [&>*]:h-full">
          <Card>
            <CardHeader>
              <CardHeaderText>
                <CardTitle>Trunks</CardTitle>
              </CardHeaderText>
              <CardAction>
                <Input placeholder="Search trunks" size="sm" aria-label="Search trunks" />
                <Button variant="outline" size="sm">
                  <Download />
                  Export
                </Button>
              </CardAction>
            </CardHeader>
            <table className="mt-4 w-full text-body-sm">
              <thead>
                <tr className="text-left text-label-xs text-content-neutral-muted">
                  <th className="px-4 py-2">Trunk</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2 text-right">MOS</th>
                  <th className="px-4 py-2 text-right">Calls</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.name} className="border-t border-line-neutral-subtle hover:bg-surface-neutral-subtle-hovered">
                    <td className="px-4 py-2.5 font-medium">{r.name}</td>
                    <td className="px-4 py-2.5">
                      <span className="inline-flex items-center gap-2">
                        <span className={`size-2 rounded-full ${statusClass[r.status]}`} aria-hidden />
                        <span className="capitalize">{r.status}</span>
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono">{r.mos}</td>
                    <td className="px-4 py-2.5 text-right font-mono">{r.calls}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>

        {/* Form — the card's three sections doing exactly their job */}
        <Card>
          <CardHeader>
            <CardHeaderText>
              <CardTitle>Alert threshold</CardTitle>
              <CardDescription>Raise an alert when MOS falls below this value.</CardDescription>
            </CardHeaderText>
          </CardHeader>
          <CardContent>
            <Field>
              <FieldLabel required>Threshold</FieldLabel>
              <FieldControl>
                <Input placeholder="3.6" />
              </FieldControl>
              <FieldDescription>MOS is measured to one decimal.</FieldDescription>
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
          </CardContent>
          <CardFooter>
            <div className="ml-auto flex gap-2">
              <Button variant="ghost">Cancel</Button>
              <Button>Save changes</Button>
            </div>
          </CardFooter>
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
