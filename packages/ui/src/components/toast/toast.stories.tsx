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
};
export default meta;
type Story = StoryObj<typeof Toast>;

type Tone = "info" | "destructive" | "warning" | "success";

function Demo({
  variant,
  appearance,
  title,
  description,
  action,
}: {
  variant: Tone;
  appearance: "emphasis" | "subtle";
  title: string;
  description: string;
  action?: string;
}) {
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
        Show toast
      </Button>
      <Toast
        variant={variant}
        appearance={appearance}
        open={open}
        onOpenChange={setOpen}
      >
        <ToastBody>
          <ToastIcon />
          <ToastContent>
            <ToastTitle>{title}</ToastTitle>
            <ToastDescription>{description}</ToastDescription>
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
      <ToastViewport />
    </ToastProvider>
  );
}

/** The everyday case — say what happened, to what. */
export const Success: Story = {
  render: () => (
    <Demo
      variant="success"
      appearance="subtle"
      title="Endpoint added"
      description="probe-07 is reporting to the Sydney collector."
    />
  ),
};

/** Destructive work gets a way back. The moment after the mistake is the only cheap one. */
export const WithUndo: Story = {
  render: () => (
    <Demo
      variant="destructive"
      appearance="subtle"
      title="Endpoint deleted"
      description="probe-04 stopped collecting. Data is kept for 30 days."
      action="Undo"
    />
  ),
};

/**
 * Emphasis fills with the tone. Note the warning card: its on-colour is
 * near-black, not white, and the ✕ follows it — see the note in toast.tsx.
 */
export const Emphasis: Story = {
  render: () => (
    <Demo
      variant="warning"
      appearance="emphasis"
      title="Collector degraded"
      description="Sydney is reporting at 40% capacity."
      action="View"
    />
  ),
};

/** Every tone at both appearances, rendered in place rather than in the viewport. */
export const AllTones: Story = {
  render: () => (
    <ToastProvider duration={Infinity}>
      <div className="flex flex-col gap-3">
        {(["info", "destructive", "warning", "success"] as Tone[]).map(
          (variant) =>
            (["emphasis", "subtle"] as const).map((appearance) => (
              <Toast
                key={variant + appearance}
                variant={variant}
                appearance={appearance}
                open
              >
                <ToastBody>
                  <ToastIcon />
                  <ToastContent>
                    <ToastTitle>New update available</ToastTitle>
                    <ToastDescription>
                      Version 13.3 is ready to install
                    </ToastDescription>
                  </ToastContent>
                </ToastBody>
                <ToastClose />
              </Toast>
            )),
        )}
      </div>
    </ToastProvider>
  ),
};
