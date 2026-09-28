import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { Checkbox } from "./checkbox";
import { Field, FieldControl, FieldDescription, FieldLabel } from "../field/field";

const meta: Meta<typeof Checkbox> = {
  title: "Components/Checkbox",
  component: Checkbox,
  parameters: {
    docs: {
      description: {
        component:
          "An independent yes/no. Several of them are several separate " +
          "questions — if ticking one should untick another, that is a Radio.",
      },
    },
  },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md"] },
    disabled: { control: "boolean" },
  },
  args: { "aria-label": "Send notifications" },
};
export default meta;
type Story = StoryObj<typeof Checkbox>;

export const Default: Story = {};

export const States: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      {([false, true, "indeterminate"] as const).map((checked) => (
        <div key={String(checked)} className="flex items-center gap-6">
          <span className="w-28 text-label-sm text-content-neutral-muted">
            {checked === "indeterminate" ? "indeterminate" : checked ? "checked" : "unchecked"}
          </span>
          <Checkbox checked={checked} aria-label="default" />
          <Checkbox checked={checked} aria-invalid aria-label="invalid" />
          <Checkbox checked={checked} disabled aria-label="disabled" />
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
  render: () => (
    <div className="flex items-center gap-6">
      <Checkbox size="md" defaultChecked aria-label="md" />
      <Checkbox size="sm" defaultChecked aria-label="sm" />
    </div>
  ),
};

export const InAField: Story = {
  name: "In a Field",
  render: () => (
    <div className="max-w-sm">
      <Field>
        <div className="flex items-center gap-2.5">
          <FieldControl>
            <Checkbox />
          </FieldControl>
          <FieldLabel>Send notifications</FieldLabel>
        </div>
        <FieldDescription>Sent to the address on your account.</FieldDescription>
      </Field>
    </div>
  ),
};

/** A parent whose state is derived from its children — never clicked into. */
export const ParentAndChildren: Story = {
  name: "Parent and children",
  render: function ParentAndChildrenStory() {
    const [probes, setProbes] = React.useState([true, false, false]);
    const all = probes.every(Boolean);
    const none = probes.every((p) => !p);
    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2.5">
          <Checkbox
            checked={all ? true : none ? false : "indeterminate"}
            onCheckedChange={(v) => setProbes(probes.map(() => v === true))}
            aria-label="All probes"
          />
          <span className="text-label-md text-content-neutral-emphasis">All probes</span>
        </div>
        <div className="flex flex-col gap-2.5 pl-6">
          {["SYD-03", "MEL-01", "BNE-02"].map((name, i) => (
            <div key={name} className="flex items-center gap-2.5">
              <Checkbox
                checked={probes[i]}
                onCheckedChange={(v) =>
                  setProbes(probes.map((p, j) => (i === j ? v === true : p)))
                }
                aria-label={name}
              />
              <span className="text-body-md text-content-neutral-emphasis">{name}</span>
            </div>
          ))}
        </div>
      </div>
    );
  },
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

const Row = ({ label, ...rest }: { label: string } & React.ComponentProps<typeof Checkbox>) => (
  <div className="flex items-center gap-2.5">
    <Checkbox aria-label={label} {...rest} />
    <span className="text-body-md text-content-neutral-emphasis">{label}</span>
  </div>
);

export const DoAndDont: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-4">
        <Guidance variant="dont" caption="A ticked box beside a negative is a double negative.">
          <div className="flex flex-col gap-2.5">
            <Row label="Do not send notifications" defaultChecked />
            <Row label="Do not share usage data" />
          </div>
        </Guidance>
        <Guidance variant="do" caption="Label the positive and let the tick mean yes.">
          <div className="flex flex-col gap-2.5">
            <Row label="Send notifications" />
            <Row label="Share usage data" defaultChecked />
          </div>
        </Guidance>
      </div>

      <div className="flex flex-wrap gap-4">
        <Guidance variant="dont" caption="A disabled tick at full strength invites a click that does nothing.">
          <Row label="Locked by policy" defaultChecked />
        </Guidance>
        <Guidance variant="do" caption="Disabled reads as disabled, ticked or not.">
          <Row label="Locked by policy" defaultChecked disabled />
        </Guidance>
      </div>
    </div>
  ),
};
