import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  Toast,
  ToastAction,
  ToastBody,
  ToastClose,
  ToastContent,
  ToastDescription,
  ToastIcon,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "./toast";
import { Button } from "../button/button";

import guidance from "./guidance.json";
import { Guidance, GuidanceStory, pairOf } from "@/stories/guidance";

const meta: Meta<typeof Toast> = {
  title: "Components/Toast",
  component: Toast,
  parameters: {
    docs: {
      description: {
        component:
          "Transient confirmation of something that already happened. " +
          "Anything the person still has to act on belongs in an Alert, " +
          "which stays put. Subtle by default; Emphasis when the tone has " +
          "to carry across a busy screen.",
      },
    },
  },
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["info", "destructive", "warning", "success"],
    },
    appearance: { control: "inline-radio", options: ["emphasis", "subtle"] },
  },
  args: { variant: "info", appearance: "subtle" },
};
const pair = pairOf(guidance);

export default meta;
type Story = StoryObj<typeof Toast>;

type Tone = "info" | "destructive" | "warning" | "success";

/**
 * Radix renders every Toast into the Viewport, not where it is written — so
 * a story with no Viewport renders nothing at all.
 *
 * The Viewport is `fixed`, and it is not restyled here: a transformed
 * ancestor becomes the containing block for a fixed descendant, so `Screen`
 * makes the toasts stack in the bottom-right of *this box* rather than of the
 * browser window. That keeps the real component, in its real position, inside
 * a canvas that can show several at once.
 */
function Screen({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={
        "relative transform-gpu overflow-hidden rounded-md border border-line-neutral-muted bg-surface-app " +
        (className ?? "h-80")
      }
    >
      <ToastProvider duration={Infinity}>
        {children}
        <ToastViewport />
      </ToastProvider>
    </div>
  );
}

function Sample({
  variant,
  appearance,
  title,
  description,
  action,
}: {
  variant?: Tone;
  appearance?: "emphasis" | "subtle";
  title: string;
  description?: string;
  action?: string;
}) {
  return (
    <Toast variant={variant} appearance={appearance} open>
      <ToastBody>
        <ToastIcon />
        <ToastContent>
          <ToastTitle>{title}</ToastTitle>
          {description ? (
            <ToastDescription>{description}</ToastDescription>
          ) : null}
        </ToastContent>
      </ToastBody>
      {action ? (
        <ToastAction altText={action} asChild>
          <Button variant="outline" size="xs">
            {action}
          </Button>
        </ToastAction>
      ) : null}
      <ToastClose />
    </Toast>
  );
}

/** Drive the tone and the appearance from the controls panel. */
export const Default: Story = {
  render: (args) => (
    <Screen className="h-40">
      <Sample
        variant={args.variant ?? undefined}
        appearance={args.appearance ?? undefined}
        title="Endpoint added"
        description="probe-07 is reporting to the Sydney collector."
      />
    </Screen>
  ),
};

/** Subtle — the default. The tone tints the card; the text stays neutral. */
export const Tones: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Screen>
      <Sample
        variant="info"
        appearance="subtle"
        title="Maintenance on Sunday"
        description="Reporting is unavailable 02:00–04:00 AEST."
      />
      <Sample
        variant="success"
        appearance="subtle"
        title="Endpoint added"
        description="probe-07 is reporting to the Sydney collector."
      />
      <Sample
        variant="warning"
        appearance="subtle"
        title="Collector degraded"
        description="Sydney is reporting at 40% capacity."
      />
      <Sample
        variant="destructive"
        appearance="subtle"
        title="Endpoint deleted"
        description="probe-04 stopped collecting."
      />
    </Screen>
  ),
};

/**
 * Emphasis fills with the tone. Note the warning card: its on-colour is
 * near-black where the other three are white, and the icon, the text and the
 * ✕ all follow it — see the note in toast.tsx on the token the file uses.
 */
export const Emphasis: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Screen>
      <Sample
        variant="info"
        appearance="emphasis"
        title="Maintenance on Sunday"
        description="Reporting is unavailable 02:00–04:00 AEST."
      />
      <Sample
        variant="success"
        appearance="emphasis"
        title="Endpoint added"
        description="probe-07 is reporting to the Sydney collector."
      />
      <Sample
        variant="warning"
        appearance="emphasis"
        title="Collector degraded"
        description="Sydney is reporting at 40% capacity."
      />
      <Sample
        variant="destructive"
        appearance="emphasis"
        title="Endpoint deleted"
        description="probe-04 stopped collecting."
      />
    </Screen>
  ),
};

/** Every tone at both appearances, side by side. */
export const AllVariants: Story = {
  name: "All variants",
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex gap-4">
      {(["subtle", "emphasis"] as const).map((appearance) => (
        <div key={appearance} className="flex flex-col gap-2">
          <p className="text-label-sm text-content-neutral-muted capitalize">
            {appearance}
          </p>
          <Screen>
            {(["info", "destructive", "warning", "success"] as Tone[]).map(
              (variant) => (
                <Sample
                  key={variant}
                  variant={variant}
                  appearance={appearance}
                  title="New update available"
                  description="Version 13.3 is ready to install"
                />
              ),
            )}
          </Screen>
        </div>
      ))}
    </div>
  ),
};

/** The real thing — fired on a timer, into the fixed viewport, bottom right. */
export const Interactive: Story = {
  parameters: { controls: { disable: true } },
  render: () => {
    const [open, setOpen] = React.useState(false);
    return (
      <ToastProvider>
        <Button
          variant="outline"
          onClick={() => {
            setOpen(false);
            window.setTimeout(() => setOpen(true), 80);
          }}
        >
          Delete endpoint
        </Button>
        <Toast
          variant="destructive"
          appearance="subtle"
          open={open}
          onOpenChange={setOpen}
        >
          <ToastBody>
            <ToastIcon />
            <ToastContent>
              <ToastTitle>Endpoint deleted</ToastTitle>
              <ToastDescription>
                probe-04 stopped collecting. Data is kept for 30 days.
              </ToastDescription>
            </ToastContent>
          </ToastBody>
          <ToastAction altText="Undo" asChild>
            <Button variant="outline" size="xs">
              Undo
            </Button>
          </ToastAction>
          <ToastClose />
        </Toast>
        <ToastViewport />
      </ToastProvider>
    );
  },
};

/* ------------------------------------------------------------------ */

export const DoAndDont: Story = {
  name: "Do and Don't",
  parameters: { controls: { disable: true } },
  render: () => (
    <GuidanceStory>
      <Guidance
        pair={pair("say-what-happened")}
        width="wide"
        dont={
          <>
            <Screen>
              <Sample variant="success" appearance="subtle" title="Success!" />
            </Screen>
          </>
        }
        do={
          <>
            <Screen>
              <Sample
                variant="success"
                appearance="subtle"
                title="Endpoint probe-04 deleted"
                description="Data is kept for 30 days."
              />
            </Screen>
          </>
        }
      />

      <Guidance
        pair={pair("give-destructive-an-undo")}
        width="wide"
        dont={
          <>
            <Screen>
              <Sample
                variant="destructive"
                appearance="subtle"
                title="Endpoint deleted"
                description="probe-04 stopped collecting."
              />
            </Screen>
          </>
        }
        do={
          <>
            <Screen>
              <Sample
                variant="destructive"
                appearance="subtle"
                title="Endpoint deleted"
                description="probe-04 stopped collecting."
                action="Undo"
              />
            </Screen>
          </>
        }
      />

      <Guidance
        pair={pair("do-not-queue-a-wall")}
        width="wide"
        dont={
          <>
            <Screen>
              <Sample
                variant="success"
                appearance="subtle"
                title="probe-01 archived"
              />
              <Sample
                variant="success"
                appearance="subtle"
                title="probe-02 archived"
              />
              <Sample
                variant="success"
                appearance="subtle"
                title="probe-03 archived"
              />
            </Screen>
          </>
        }
        do={
          <>
            <Screen>
              <Sample
                variant="success"
                appearance="subtle"
                title="12 endpoints archived"
                description="Sydney collector, 09:14."
              />
            </Screen>
          </>
        }
      />
    </GuidanceStory>
  ),
};
