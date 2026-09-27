import type { Meta, StoryObj } from "@storybook/react";
import { Input } from "./input";

const meta: Meta<typeof Input> = {
  title: "Components/Input",
  component: Input,
  parameters: {
    docs: {
      description: {
        component:
          "A single-line text field, always paired with a visible label. " +
          "Figma's Type and State axes are the native type attribute and CSS " +
          "states rather than props — see the component's doc block.",
      },
    },
  },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md"] },
    disabled: { control: "boolean" },
    readOnly: { control: "boolean" },
  },
  args: { placeholder: "SYD-03", "aria-label": "Probe name" },
};
export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {};

export const Sizes: Story = {
  render: () => (
    <div className="flex max-w-sm flex-col gap-3">
      <Input size="sm" placeholder="sm — table row, toolbar" aria-label="Small" />
      <Input size="md" placeholder="md — form field" aria-label="Medium" />
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div className="flex max-w-sm flex-col gap-3">
      <Input placeholder="Default" aria-label="Default" />
      <Input defaultValue="SYD-03" aria-label="Filled" />
      <Input aria-invalid defaultValue="SYD-3" aria-label="Invalid" />
      <Input readOnly defaultValue="SYD-03" aria-label="Read only" />
      <Input disabled placeholder="Disabled" aria-label="Disabled" />
    </div>
  ),
};

export const Types: Story = {
  render: () => (
    <div className="flex max-w-sm flex-col gap-3">
      <Input type="password" defaultValue="hunter2" aria-label="Password" />
      <Input type="number" defaultValue="3.6" aria-label="Threshold" />
      <Input type="file" aria-label="Upload" />
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
      <div className="flex min-h-20 flex-col justify-center gap-1.5">{children}</div>
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

const Label = ({ children }: { children: React.ReactNode }) => (
  <span className="text-label-md text-content-neutral-emphasis">{children}</span>
);

export const DoAndDont: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="space-y-8">
      <Pair>
        <Guidance variant="dont" caption="The placeholder disappears the moment someone types.">
          <Input placeholder="Probe name" aria-label="Probe name" />
        </Guidance>
        <Guidance variant="do" caption="Visible label; the placeholder shows format.">
          <Label>Probe name</Label>
          <Input placeholder="SYD-03" aria-label="Probe name" />
        </Guidance>
      </Pair>

      <Pair>
        <Guidance variant="dont" caption="A red border does not say what is wrong.">
          <Label>Threshold</Label>
          <Input aria-invalid defaultValue="3.60000" aria-label="Threshold" />
        </Guidance>
        <Guidance variant="do" caption="aria-invalid, plus a message that says what to do.">
          <Label>Threshold</Label>
          <Input
            aria-invalid
            aria-describedby="threshold-error"
            defaultValue="3.60000"
            aria-label="Threshold"
          />
          <span id="threshold-error" className="text-body-sm text-content-danger-emphasis">
            MOS is measured to one decimal. Use 3.6.
          </span>
        </Guidance>
      </Pair>

      <Pair>
        <Guidance variant="dont" caption="Disabled is skipped by keyboard and screen readers.">
          <Label>Probe</Label>
          <Input disabled defaultValue="SYD-03" aria-label="Probe" />
        </Guidance>
        <Guidance variant="do" caption="Read-only stays reachable and announceable.">
          <Label>Probe</Label>
          <Input readOnly defaultValue="SYD-03" aria-label="Probe" />
        </Guidance>
      </Pair>
    </div>
  ),
};
