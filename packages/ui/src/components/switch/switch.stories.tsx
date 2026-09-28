import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { Switch } from "./switch";

const meta: Meta<typeof Switch> = {
  title: "Components/Switch",
  component: Switch,
  parameters: {
    docs: {
      description: {
        component:
          "An immediate change — flipping it does the thing, with no Save " +
          "button behind it. If a Save button confirms the value, the control " +
          "is a Checkbox. If only one of the options may be true, it is a Radio.",
      },
    },
  },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md"] },
    disabled: { control: "boolean" },
    defaultChecked: { control: "boolean" },
  },
  args: { "aria-label": "Send notifications" },
};
export default meta;
type Story = StoryObj<typeof Switch>;

export const Default: Story = {};

export const States: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-4">
      {([false, true] as const).map((on) => (
        <div key={String(on)} className="flex items-center gap-8">
          <span className="w-20 text-label-sm text-content-neutral-muted">
            {on ? "on" : "off"}
          </span>
          <Switch defaultChecked={on} aria-label="default" />
          <Switch defaultChecked={on} aria-invalid aria-label="invalid" />
          <Switch defaultChecked={on} disabled aria-label="disabled" />
        </div>
      ))}
      <div className="flex items-center gap-8 text-label-sm text-content-neutral-muted">
        <span className="w-20" />
        <span className="w-11">—</span>
        <span className="w-11">✗</span>
        <span className="w-11">∅</span>
      </div>
    </div>
  ),
};

export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex items-center gap-8">
      <Switch size="md" defaultChecked aria-label="md" />
      <Switch size="sm" defaultChecked aria-label="sm" />
    </div>
  ),
};

/** A switch earns its label the same way a checkbox does — clickable as one. */
export const WithLabel: Story = {
  name: "With a label",
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex items-center gap-2.5">
      <Switch id="notifications" defaultChecked />
      <label htmlFor="notifications" className="text-body-md text-content-neutral-emphasis">
        Send notifications
      </label>
    </div>
  ),
};

/* ------------------------------------------------------------------ */

function Guidance({
  variant,
  caption,
  children,
}: {
  variant: "do" | "dont";
  caption: string;
  children: React.ReactNode;
}) {
  const isDo = variant === "do";
  return (
    <figure
      className={
        "m-0 flex-1 min-w-72 rounded-md border-2 p-4 " +
        (isDo ? "border-line-success-emphasis" : "border-line-danger-emphasis")
      }
    >
      <div className="min-h-20">{children}</div>
      <figcaption className="mt-4 text-label-sm">
        <span className={isDo ? "text-content-success-emphasis" : "text-content-danger-emphasis"}>
          {isDo ? "✓ Do" : "✗ Don't"}
        </span>
        <span className="text-content-neutral-muted"> — {caption}</span>
      </figcaption>
    </figure>
  );
}

const Setting = ({ label, ...rest }: { label: string } & React.ComponentProps<typeof Switch>) => {
  const id = `sw-${React.useId()}`;
  return (
    <div className="flex items-center gap-2.5">
      <Switch id={id} {...rest} />
      <label htmlFor={id} className="text-body-md text-content-neutral-emphasis">
        {label}
      </label>
    </div>
  );
};

export const DoAndDont: Story = {
  name: "Do and Don't",
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-4">
        <Guidance variant="dont" caption="Save and Cancel behind switches — Cancel cannot undo what already happened.">
          <div className="flex flex-col gap-2.5">
            <Setting label="Send notifications" defaultChecked />
            <Setting label="Share usage data" />
            <div className="mt-2 flex gap-2 text-label-sm text-content-neutral-muted">
              <span className="rounded-sm border border-line-neutral-emphasis px-2 py-1">Cancel</span>
              <span className="rounded-sm bg-surface-primary-emphasis px-2 py-1 text-content-on-primary-emphasis">
                Save
              </span>
            </div>
          </div>
        </Guidance>
        <Guidance variant="do" caption="Each flip applies straight away, so there is nothing to confirm.">
          <div className="flex flex-col gap-2.5">
            <Setting label="Send notifications" defaultChecked />
            <Setting label="Share usage data" />
          </div>
        </Guidance>
      </div>

      <div className="flex flex-wrap gap-4">
        <Guidance variant="dont" caption="Two switches for one question — both can be on, which is impossible.">
          <div className="flex flex-col gap-2.5">
            <Setting label="Metric units" defaultChecked />
            <Setting label="Imperial units" />
          </div>
        </Guidance>
        <Guidance variant="do" caption="One switch per independent setting.">
          <div className="flex flex-col gap-2.5">
            <Setting label="Send notifications" defaultChecked />
            <Setting label="Play a sound" />
          </div>
        </Guidance>
      </div>

      <div className="flex flex-wrap gap-4">
        <Guidance variant="dont" caption="A negative label makes the on position mean off.">
          <Setting label="Turn off notifications" defaultChecked />
        </Guidance>
        <Guidance variant="do" caption="Label the thing being switched, and let on mean on.">
          <Setting label="Notifications" defaultChecked />
        </Guidance>
      </div>
    </div>
  ),
};
