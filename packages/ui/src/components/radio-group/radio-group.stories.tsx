import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { Radio, RadioGroup } from "./radio-group";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldOption,
} from "../field/field";

import guidance from "./guidance.json";
import { Guidance, GuidanceStory, pairOf } from "@/stories/guidance";

const meta: Meta<typeof Radio> = {
  title: "Components/Radio",
  component: Radio,
  parameters: {
    docs: {
      description: {
        component:
          "One of many. A radio cannot be unticked by the person who ticked " +
          "it, so a group needs either a sensible default or an explicit " +
          '"None" option. If ticking one should not untick another, the ' +
          "control is a Checkbox.",
      },
    },
  },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md"] },
    disabled: { control: "boolean" },
  },
};
const pair = pairOf(guidance);

export default meta;
type Story = StoryObj<typeof Radio>;

const OPTIONS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
] as const;

/** A radio on its own is not a control — every story starts from a group. */
export const Default: Story = {
  render: (args) => (
    <RadioGroup aria-label="Severity" defaultValue="medium">
      {OPTIONS.map((o) => (
        <Labelled key={o.value} {...args} value={o.value} label={o.label} />
      ))}
    </RadioGroup>
  ),
};

export const States: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-4">
      {([false, true] as const).map((checked) => (
        <div key={String(checked)} className="flex items-center gap-6">
          <span className="w-28 text-label-sm text-content-neutral-muted">
            {checked ? "selected" : "unselected"}
          </span>
          <Solo checked={checked} label="default" />
          <Solo checked={checked} label="invalid" aria-invalid />
          <Solo checked={checked} label="disabled" disabled />
        </div>
      ))}
      <div className="flex items-center gap-6 text-label-sm text-content-neutral-muted">
        <span className="w-28" />
        <span className="w-5">—</span>
        <span className="w-5">✗</span>
        <span className="w-5">∅</span>
      </div>
    </div>
  ),
};

export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex items-start gap-10">
      {(["md", "sm"] as const).map((size) => (
        <RadioGroup key={size} aria-label={size} defaultValue="medium">
          {OPTIONS.map((o) => (
            <Labelled
              key={o.value}
              value={o.value}
              label={o.label}
              size={size}
            />
          ))}
        </RadioGroup>
      ))}
    </div>
  ),
};

/**
 * Horizontal is for two or three short options that read as a scale. The
 * orientation is declared, not inferred: it tells assistive technology which
 * arrow keys move, so it has to match what someone sees.
 */
export const Horizontal: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <RadioGroup
      aria-label="Severity"
      orientation="horizontal"
      defaultValue="low"
    >
      {OPTIONS.map((o) => (
        <Labelled key={o.value} value={o.value} label={o.label} />
      ))}
    </RadioGroup>
  ),
};

export const InAField: Story = {
  name: "In a Field",
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-wrap gap-10">
      <div className="max-w-sm">
        <Field>
          <FieldLabel>Severity</FieldLabel>
          <RadioGroup aria-label="Severity" defaultValue="medium">
            {OPTIONS.map((o) => (
              <Labelled key={o.value} value={o.value} label={o.label} />
            ))}
          </RadioGroup>
          <FieldDescription>
            Sets how loudly the alert is delivered.
          </FieldDescription>
        </Field>
      </div>
      <div className="max-w-sm">
        <Field invalid>
          <FieldLabel required>Severity</FieldLabel>
          <RadioGroup aria-label="Severity">
            {OPTIONS.map((o) => (
              <Labelled
                key={o.value}
                value={o.value}
                label={o.label}
                aria-invalid
              />
            ))}
          </RadioGroup>
          <FieldError>Choose a severity.</FieldError>
        </Field>
      </div>
    </div>
  ),
};

/* ------------------------------------------------------------------ */

/** A radio and its label, clickable as one target. */
function Labelled({
  value,
  label,
  ...rest
}: { value: string; label: string } & Omit<
  React.ComponentProps<typeof Radio>,
  "value"
>) {
  // FieldOption generates the id and hangs htmlFor off it, so the row is the
  // target rather than the 16px dot.
  return (
    <FieldOption control={<Radio value={value} {...rest} />}>
      {label}
    </FieldOption>
  );
}

/** A single radio in its own group — the only honest way to show one state. */
function Solo({
  checked,
  label,
  ...rest
}: { checked: boolean; label: string } & Omit<
  React.ComponentProps<typeof Radio>,
  "value"
>) {
  return (
    <RadioGroup aria-label={label} value={checked ? "on" : ""}>
      <Radio value="on" aria-label={label} {...rest} />
    </RadioGroup>
  );
}

export const DoAndDont: Story = {
  name: "Do and Don't",
  parameters: { controls: { disable: true } },
  render: () => (
    <GuidanceStory>
      <Guidance
        pair={pair("no-way-back")}
        dont={
          <>
            <RadioGroup aria-label="Reminder">
              <Labelled value="daily" label="Daily" />
              <Labelled value="weekly" label="Weekly" />
            </RadioGroup>
          </>
        }
        do={
          <>
            <RadioGroup aria-label="Reminder" defaultValue="none">
              <Labelled value="none" label="None" />
              <Labelled value="daily" label="Daily" />
              <Labelled value="weekly" label="Weekly" />
            </RadioGroup>
          </>
        }
      />

      <Guidance
        pair={pair("radio-vs-checkbox")}
        dont={
          <>
            <RadioGroup aria-label="Notify by">
              <Labelled value="email" label="Email" />
              <Labelled value="sms" label="SMS" />
            </RadioGroup>
          </>
        }
        do={
          <>
            <RadioGroup aria-label="Delivery" defaultValue="digest">
              <Labelled value="digest" label="A daily digest" />
              <Labelled value="each" label="Every alert as it happens" />
            </RadioGroup>
          </>
        }
      />

      <Guidance
        pair={pair("order-is-meaning")}
        dont={
          <>
            <RadioGroup aria-label="Severity (unordered)" defaultValue="low">
              <Labelled value="medium" label="Medium" />
              <Labelled value="high" label="High" />
              <Labelled value="low" label="Low" />
            </RadioGroup>
          </>
        }
        do={
          <>
            <RadioGroup aria-label="Severity (ordered)" defaultValue="low">
              {OPTIONS.map((o) => (
                <Labelled key={o.value} value={o.value} label={o.label} />
              ))}
            </RadioGroup>
          </>
        }
      />
    </GuidanceStory>
  ),
};
