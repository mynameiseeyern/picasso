import type { Meta, StoryObj } from "@storybook/react";
import { Loader } from "./loader";
import { Button } from "../button/button";
import { Card, CardContent } from "../card/card";

const meta: Meta<typeof Loader> = {
  title: "Components/Loader",
  component: Loader,
  parameters: {
    docs: {
      description: {
        component:
          "Indeterminate wait indicators — pick by context. **Spinner** for " +
          "in-console waits with no layout to skeleton. **Fuse** for brand " +
          "moments only: app boot, the widget's first run, empty states. " +
          "**Pulse** for Iris thinking in the assistant thread. Turn on " +
          "*Reduce motion* in your OS to see the fallbacks: nothing travels or " +
          "rotates, Fuse and Pulse cross-fade instead. Figma: `Loader`.",
      },
    },
  },
  argTypes: {
    variant: { control: "inline-radio", options: ["spinner", "fuse", "pulse"] },
    label: { control: "text" },
    delay: { control: { type: "number", min: 0, step: 100 } },
  },
};
export default meta;
type Story = StoryObj<typeof Loader>;

export const Playground: Story = {
  args: { variant: "spinner", delay: 0 },
};

/** Figma `_Loader / Spinner`: Size 3 · 4 · 5 · 6 · 8 · XL (12–64px). Inherits text colour. */
export const Spinner: Story = {
  render: () => (
    <div className="flex items-end gap-6">
      {(["3", "4", "5", "6", "8", "xl"] as const).map((s) => (
        <div key={s} className="flex flex-col items-center gap-2">
          <Loader variant="spinner" size={s} label={null} />
          <span className="text-xs text-content-neutral-muted">{s}</span>
        </div>
      ))}
    </div>
  ),
};

/** Figma `_Loader / Fuse`: 56 floor · 96 default · 160 splash. Never smaller than 56 — the merge stops being legible. */
export const Fuse: Story = {
  render: () => (
    <div className="flex items-end gap-10">
      {([56, 96, 160] as const).map((s) => (
        <div key={s} className="flex flex-col items-center gap-3">
          <Loader variant="fuse" size={s} label={null} />
          <span className="text-xs text-content-neutral-muted">{s}px</span>
        </div>
      ))}
    </div>
  ),
};

/** A boot screen: the label names the work, not the state. */
export const FuseBootScreen: Story = {
  name: "Fuse · boot screen",
  render: () => (
    <div className="flex h-80 w-80 flex-col items-center justify-center gap-4 bg-surface-app">
      <Loader variant="fuse" label={null} />
      <p className="text-md text-content-neutral-muted">
        Bringing your fleet online
      </p>
    </div>
  ),
};

/** Figma `_Loader / Pulse`, Surface=Tint: in the assistant bubble the lead blue steps down to fg/info/muted. */
export const Pulse: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Loader variant="pulse" delay={0} />
        <span className="text-xs text-content-neutral-muted">On the page</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="inline-flex min-h-10 items-center rounded-xl bg-surface-neutral-subtle-hovered px-4">
          <Loader variant="pulse" onTint delay={0} />
        </div>
        <span className="text-xs text-content-neutral-muted">
          In the assistant bubble (onTint)
        </span>
      </div>
    </div>
  ),
};

/** Pulse waits 400ms before appearing, so a fast reply never flashes it. Reload the story to watch the gap. */
export const PulseShowDelay: Story = {
  name: "Pulse · show delay",
  render: () => (
    <div className="inline-flex min-h-10 items-center rounded-xl bg-surface-neutral-subtle-hovered px-4">
      <Loader variant="pulse" onTint />
    </div>
  ),
};

/** Which one where — the three contexts side by side. */
export const Choosing: Story = {
  name: "Choosing a loader",
  render: () => (
    <div className="grid w-120 grid-cols-3 gap-4">
      <Card>
        <CardContent>
          <div className="flex h-40 flex-col items-center justify-center gap-3">
            <Loader variant="spinner" size="6" label="Loading trunks" />
            <span className="text-xs text-content-neutral-muted">
              Spinner · a panel refreshing
            </span>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <div className="flex h-40 flex-col items-center justify-center gap-3">
            <Loader variant="fuse" size={56} label="Setting up Clarion" />
            <span className="text-xs text-content-neutral-muted">
              Fuse · first run
            </span>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <div className="flex h-40 flex-col items-center justify-center gap-3">
            <Loader variant="pulse" delay={0} />
            <span className="text-xs text-content-neutral-muted">
              Pulse · Iris thinking
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  ),
};

/** An action in flight is the button's job, not a Loader's. */
export const NotForActions: Story = {
  name: "Actions use the button's loading state",
  render: () => <Button loading>Saving changes</Button>,
};

/**
 * Narrow — 328, a 360 phone minus its gutters. Every other story here pins a
 * width well above that, so this is the one that shows what a phone does to
 * it, and the one the overflow sweep can measure.
 */
export const Narrow: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex w-82 flex-col gap-4">
      <Card>
        <CardContent>
          <div className="flex h-40 flex-col items-center justify-center gap-3">
            <Loader variant="spinner" size="6" label="Loading trunks" />
            <span className="text-xs text-content-neutral-muted">
              Spinner · a panel refreshing
            </span>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <div className="flex h-40 flex-col items-center justify-center gap-3">
            <Loader variant="fuse" size={56} label="Setting up Clarion" />
            <span className="text-xs text-content-neutral-muted">
              Fuse · first run
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  ),
};
