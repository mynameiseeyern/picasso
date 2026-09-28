import type { Meta, StoryObj } from "@storybook/react";
import { Bell, Download, Plus } from "lucide-react";
import { Button } from "../components/button/button";
import { Field, FieldControl, FieldDescription, FieldError, FieldLabel } from "../components/field/field";
import { Input } from "../components/input/input";
import { Textarea } from "../components/textarea/textarea";

/**
 * One screen that exercises every axis at once. The theme builder on the site
 * loads this story in an iframe and drives the axes on its <html>, so what it
 * shows is the real components on the real tokens — nothing re-implemented.
 *
 * Add to it as components land: the more of the system is on this screen, the
 * more a theme change is felt rather than described.
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

/* Written out in full so Tailwind can see every class. */
const tones = [
  { name: "Primary", className: "bg-surface-primary-subtle border-line-primary-muted text-content-primary-emphasis" },
  { name: "Success", className: "bg-surface-success-subtle border-line-success-muted text-content-success-emphasis" },
  { name: "Warning", className: "bg-surface-warning-subtle border-line-warning-muted text-content-warning-emphasis" },
  { name: "Danger", className: "bg-surface-danger-subtle border-line-danger-muted text-content-danger-emphasis" },
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
        {/* KPI tiles */}
        {[
          { label: "Endpoints online", value: "3,412", delta: "+2.1%", tone: "text-content-success-emphasis" },
          { label: "Mean MOS", value: "4.1", delta: "−0.1", tone: "text-content-warning-emphasis" },
          { label: "Open alerts", value: "7", delta: "3 critical", tone: "text-content-danger-emphasis" },
        ].map((k) => (
          <section key={k.label} className="rounded-lg border border-line-neutral-subtle bg-surface-card p-5">
            <p className="text-sm text-content-neutral-muted">{k.label}</p>
            <p className="mt-2 font-mono text-3xl font-medium">{k.value}</p>
            <p className={`mt-1 text-xs ${k.tone}`}>{k.delta}</p>
          </section>
        ))}

        {/* Table */}
        <section className="rounded-lg border border-line-neutral-subtle bg-surface-card lg:col-span-2">
          <div className="flex items-center gap-3 border-b border-line-neutral-subtle p-4">
            <h2 className="text-md font-semibold">Trunks</h2>
            <div className="ml-auto flex items-center gap-2">
              <Input placeholder="Search trunks" size="sm" aria-label="Search trunks" />
              <Button variant="outline" size="sm">
                <Download />
                Export
              </Button>
            </div>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-medium text-content-neutral-muted">
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
        </section>

        {/* Form */}
        <section className="rounded-lg border border-line-neutral-subtle bg-surface-card p-5">
          <h2 className="text-md font-semibold">Alert threshold</h2>
          <p className="mt-1 text-sm text-content-neutral-muted">Raise an alert when MOS falls below this value.</p>
          <div className="mt-4 space-y-4">
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
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <Button variant="ghost">Cancel</Button>
            <Button>Save changes</Button>
          </div>
        </section>

        {/* Every button variant, so a ramp change is seen across the hierarchy */}
        <section className="rounded-lg border border-line-neutral-subtle bg-surface-card p-5 lg:col-span-3">
          <h2 className="text-md font-semibold">Actions</h2>
          <div className="mt-3 flex flex-wrap items-center gap-2">
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
          <div className="mt-4 grid gap-2 sm:grid-cols-4">
            {tones.map((t) => (
              <div key={t.name} className={`rounded-md border p-3 text-sm ${t.className}`}>
                <span className="font-medium">{t.name}</span> — subtle surface
              </div>
            ))}
          </div>
          <pre className="mt-4 overflow-x-auto rounded-md bg-surface-neutral-subtle p-3 font-mono text-xs text-content-neutral-emphasis">
            {`INVITE sip:+61280000000@sbc.ir.local SIP/2.0  →  200 OK  (MOS 4.2, jitter 3 ms)`}
          </pre>
        </section>
      </main>
    </div>
  );
}

export const Default: StoryObj = { render: () => <Preview /> };
