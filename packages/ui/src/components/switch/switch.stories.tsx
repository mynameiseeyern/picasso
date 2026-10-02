import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { Switch } from "./switch";
import { FieldOption } from "../field/field";

import guidance from "./guidance.json";
import { Guidance, GuidanceStory, pairOf } from "@/stories/guidance";

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
const pair = pairOf(guidance);

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
    <FieldOption control={<Switch defaultChecked />}>
      Send notifications
    </FieldOption>
  ),
};

/* ------------------------------------------------------------------ */

const Setting = ({
  label,
  ...rest
}: { label: string } & React.ComponentProps<typeof Switch>) => (
  <FieldOption control={<Switch {...rest} />}>{label}</FieldOption>
);

export const DoAndDont: Story = {
  name: "Do and Don't",
  parameters: { controls: { disable: true } },
  render: () => (
    <GuidanceStory>
      <Guidance
        pair={pair("no-save-button")}
        dont={
          <>
            <div className="flex flex-col gap-2.5">
              <Setting label="Send notifications" defaultChecked />
              <Setting label="Share usage data" />
              <div className="mt-2 flex gap-2 text-label-sm text-content-neutral-muted">
                <span className="rounded-sm border border-line-neutral-emphasis px-2 py-1">
                  Cancel
                </span>
                <span className="rounded-sm bg-surface-primary-emphasis px-2 py-1 text-content-on-primary-emphasis">
                  Save
                </span>
              </div>
            </div>
          </>
        }
        do={
          <>
            <div className="flex flex-col gap-2.5">
              <Setting label="Send notifications" defaultChecked />
              <Setting label="Share usage data" />
            </div>
          </>
        }
      />

      <Guidance
        pair={pair("switch-is-not-a-choice")}
        dont={
          <>
            <div className="flex flex-col gap-2.5">
              <Setting label="Metric units" defaultChecked />
              <Setting label="Imperial units" />
            </div>
          </>
        }
        do={
          <>
            <div className="flex flex-col gap-2.5">
              <Setting label="Send notifications" defaultChecked />
              <Setting label="Play a sound" />
            </div>
          </>
        }
      />

      <Guidance
        pair={pair("label-the-thing-not-the-state")}
        dont={
          <>
            <Setting label="Turn off notifications" defaultChecked />
          </>
        }
        do={
          <>
            <Setting label="Notifications" defaultChecked />
          </>
        }
      />
    </GuidanceStory>
  ),
};
