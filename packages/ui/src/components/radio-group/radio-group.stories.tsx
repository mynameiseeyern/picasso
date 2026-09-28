import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { Radio, RadioGroup } from "./radio-group";
import { Field, FieldDescription, FieldError, FieldLabel } from "../field/field";

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
            <Labelled key={o.value} value={o.value} label={o.label} size={size} />
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
    <RadioGroup aria-label="Severity" orientation="horizontal" defaultValue="low">
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
          <FieldDescription>Sets how loudly the alert is delivered.</FieldDescription>
        </Field>
      </div>
      <div className="max-w-sm">
        <Field invalid>
          <FieldLabel required>Severity</FieldLabel>
          <RadioGroup aria-label="Severity">
            {OPTIONS.map((o) => (
              <Labelled key={o.value} value={o.value} label={o.label} aria-invalid />
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
}: { value: string; label: string } & Omit<React.ComponentProps<typeof Radio>, "value">) {
  const id = `radio-${React.useId()}`;
  return (
    <div className="flex items-center gap-2.5">
      <Radio id={id} value={value} {...rest} />
      <label htmlFor={id} className="text-body-md text-content-neutral-emphasis">
        {label}
      </label>
    </div>
  );
}

/** A single radio in its own group — the only honest way to show one state. */
function Solo({
  checked,
  label,
  ...rest
}: { checked: boolean; label: string } & Omit<React.ComponentProps<typeof Radio>, "value">) {
  return (
    <RadioGroup aria-label={label} value={checked ? "on" : ""}>
      <Radio value="on" aria-label={label} {...rest} />
    </RadioGroup>
  );
}

/**
 * The anti-pattern, drawn as a wrapper rather than by restyling Radio. A
 * permanent danger ring is what we are arguing against, so it only needs to
 * look like itself — it must not become a shape anyone can copy off a prop.
 */
function Ringed({ value, label }: { value: string; label: string }) {
  const id = `radio-${React.useId()}`;
  return (
    <div className="flex items-center gap-2.5">
      <span className="rounded-full ring-2 ring-line-danger-emphasis ring-offset-2 ring-offset-surface-app">
        <Radio id={id} value={value} />
      </span>
      <label htmlFor={id} className="text-body-md text-content-neutral-emphasis">
        {label}
      </label>
    </div>
  );
}

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

export const DoAndDont: Story = {
  name: "Do and Don't",
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-4">
        <Guidance variant="dont" caption="Nothing preselected and no way to choose nothing — the first click is permanent.">
          <RadioGroup aria-label="Reminder">
            <Labelled value="daily" label="Daily" />
            <Labelled value="weekly" label="Weekly" />
          </RadioGroup>
        </Guidance>
        <Guidance variant="do" caption='Preselect a default, or give "None" a radio of its own.'>
          <RadioGroup aria-label="Reminder" defaultValue="none">
            <Labelled value="none" label="None" />
            <Labelled value="daily" label="Daily" />
            <Labelled value="weekly" label="Weekly" />
          </RadioGroup>
        </Guidance>
      </div>

      <div className="flex flex-wrap gap-4">
        <Guidance variant="dont" caption="Options that can hold together at once are not one-of-many.">
          <RadioGroup aria-label="Notify by">
            <Labelled value="email" label="Email" />
            <Labelled value="sms" label="SMS" />
          </RadioGroup>
        </Guidance>
        <Guidance variant="do" caption="Any-of-many is a set of checkboxes; each one is its own question.">
          <RadioGroup aria-label="Delivery" defaultValue="digest">
            <Labelled value="digest" label="A daily digest" />
            <Labelled value="each" label="Every alert as it happens" />
          </RadioGroup>
        </Guidance>
      </div>

      <div className="flex flex-wrap gap-4">
        <Guidance variant="dont" caption="Ordered by whatever the API returned, so the scale has to be read twice.">
          <RadioGroup aria-label="Severity (unordered)" defaultValue="low">
            <Labelled value="medium" label="Medium" />
            <Labelled value="high" label="High" />
            <Labelled value="low" label="Low" />
          </RadioGroup>
        </Guidance>
        <Guidance variant="do" caption="Ordered by meaning — least to most — so the shape is visible without reading.">
          <RadioGroup aria-label="Severity (ordered)" defaultValue="low">
            {OPTIONS.map((o) => (
              <Labelled key={o.value} value={o.value} label={o.label} />
            ))}
          </RadioGroup>
        </Guidance>
      </div>

      <div className="flex flex-wrap gap-4">
        <Guidance variant="dont" caption="A permanent danger ring reads as focus, so real focus has nothing left to say.">
          <RadioGroup aria-label="Severity (ringed)">
            <Ringed value="low" label="Low" />
            <Ringed value="high" label="High" />
          </RadioGroup>
        </Guidance>
        <Guidance variant="do" caption="Invalid colours the border, as every other control does. The ring stays focus.">
          <RadioGroup aria-label="Severity (invalid)">
            <Labelled value="low" label="Low" aria-invalid />
            <Labelled value="high" label="High" aria-invalid />
          </RadioGroup>
        </Guidance>
      </div>
    </div>
  ),
};
