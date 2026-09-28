import type { Meta, StoryObj } from "@storybook/react";
import { Field, FieldControl, FieldDescription, FieldError, FieldLabel } from "./field";
import { Input } from "../input/input";

const meta: Meta<typeof Field> = {
  title: "Components/Field",
  component: Field,
  parameters: {
    docs: {
      description: {
        component:
          "Label, control and message, wired together. The point is the wiring: " +
          "Field generates the ids and hangs htmlFor, aria-describedby and " +
          "aria-invalid off them, so the association happens by using the " +
          "component rather than by remembering to.",
      },
    },
  },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md"] },
    invalid: { control: "boolean" },
    disabled: { control: "boolean" },
  },
  args: { size: "md", invalid: false, disabled: false },
  render: (args) => (
    <div className="max-w-sm">
      <Field {...args}>
        <FieldLabel>Threshold</FieldLabel>
        <FieldControl>
          <Input placeholder="3.6" size={args.size ?? "md"} />
        </FieldControl>
        <FieldDescription>MOS is measured to one decimal.</FieldDescription>
        <FieldError>Use 3.6, not 3.60000.</FieldError>
      </Field>
    </div>
  ),
};
export default meta;
type Story = StoryObj<typeof Field>;

export const Default: Story = {};
export const Invalid: Story = { args: { invalid: true } };
export const Disabled: Story = { args: { disabled: true } };

export const Required: Story = {
  render: () => (
    <div className="max-w-sm">
      <Field>
        <FieldLabel required>Probe name</FieldLabel>
        <FieldControl required>
          <Input placeholder="SYD-03" />
        </FieldControl>
        <FieldDescription>Letters, digits and hyphens.</FieldDescription>
      </Field>
    </div>
  ),
};

export const WithHelp: Story = {
  render: () => (
    <div className="w-72">
      <Field>
        <FieldLabel help="How often each probe reports. Shorter intervals catch outages sooner and cost more.">
          Poll interval
        </FieldLabel>
        <FieldControl><Input placeholder="30 s" /></FieldControl>
        <FieldDescription>Between 10 s and 5 min.</FieldDescription>
      </Field>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex max-w-2xl gap-8">
      {(["md", "sm"] as const).map((s) => (
        // Layout belongs on a wrapper, not on the component — Field's contract
        // takes no classes from outside, and the linter enforces it.
        <div key={s} className="flex-1">
          <Field size={s}>
            <FieldLabel>Threshold ({s})</FieldLabel>
            <FieldControl>
              <Input size={s} placeholder="3.6" />
            </FieldControl>
            <FieldDescription>MOS is measured to one decimal.</FieldDescription>
          </Field>
        </div>
      ))}
    </div>
  ),
};

/* ------------------------------------------------------------------ */
/* Guidance — rendered, so it breaks when the component does           */
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
      <div className="min-h-24">{children}</div>
      <figcaption className="mt-4 text-label-sm">
        <span className={isDo ? "text-content-success-emphasis" : "text-content-danger-emphasis"}>
          {isDo ? "✓ Do" : "✗ Don't"}
        </span>
        <span className="text-content-neutral-muted"> — {caption}</span>
      </figcaption>
    </figure>
  );
}

const Pair = ({ children }: { children: React.ReactNode }) => (
  <div className="flex flex-wrap gap-4">{children}</div>
);

export const DoAndDont: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="space-y-8">
      <Pair>
        <Guidance variant="dont" caption="Invalid with no message says less than valid did.">
          <Field invalid>
            <FieldLabel>Threshold</FieldLabel>
            <FieldControl>
              <Input defaultValue="3.60000" />
            </FieldControl>
            <FieldDescription>MOS is measured to one decimal.</FieldDescription>
          </Field>
        </Guidance>
        <Guidance variant="do" caption="The error carries the format detail the hint was holding.">
          <Field invalid>
            <FieldLabel>Threshold</FieldLabel>
            <FieldControl>
              <Input defaultValue="3.60000" />
            </FieldControl>
            <FieldError>MOS is measured to one decimal. Use 3.6.</FieldError>
          </Field>
        </Guidance>
      </Pair>

      <Pair>
        <Guidance variant="dont" caption="A hint written as a prohibition reads as an error already made.">
          <Field>
            <FieldLabel>Probe name</FieldLabel>
            <FieldControl>
              <Input placeholder="SYD-03" />
            </FieldControl>
            <FieldDescription>Don't use spaces or special characters.</FieldDescription>
          </Field>
        </Guidance>
        <Guidance variant="do" caption="Describe the shape of a valid answer.">
          <Field>
            <FieldLabel>Probe name</FieldLabel>
            <FieldControl>
              <Input placeholder="SYD-03" />
            </FieldControl>
            <FieldDescription>Letters, digits and hyphens.</FieldDescription>
          </Field>
        </Guidance>
      </Pair>

      <Pair>
        <Guidance variant="dont" caption="Every field asterisked — the marks carry no information.">
          <div className="flex flex-col gap-3">
            <Field>
              <FieldLabel required>Probe name</FieldLabel>
              <FieldControl required><Input placeholder="SYD-03" /></FieldControl>
            </Field>
            <Field>
              <FieldLabel required>Threshold</FieldLabel>
              <FieldControl required><Input placeholder="3.6" /></FieldControl>
            </Field>
          </div>
        </Guidance>
        <Guidance variant="do" caption="Mark the smaller set — here, the one that is optional.">
          <div className="flex flex-col gap-3">
            <Field>
              <FieldLabel>Probe name</FieldLabel>
              <FieldControl required><Input placeholder="SYD-03" /></FieldControl>
            </Field>
            <Field>
              <FieldLabel>Threshold</FieldLabel>
              <FieldControl><Input placeholder="3.6" /></FieldControl>
              <FieldDescription>Optional.</FieldDescription>
            </Field>
          </div>
        </Guidance>
      </Pair>
    </div>
  ),
};
