import type { Meta, StoryObj } from "@storybook/react";
import { Textarea } from "./textarea";
import { Input } from "../input/input";
import { Field, FieldControl, FieldDescription, FieldError, FieldLabel } from "../field/field";

const meta: Meta<typeof Textarea> = {
  title: "Components/Textarea",
  component: Textarea,
  parameters: {
    docs: {
      description: {
        component:
          "Input's sibling, for answers longer than a line. Figma's default " +
          "heights become minimums — the field grows with its content rather " +
          "than scrolling inside a fixed box.",
      },
    },
  },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md"] },
    disabled: { control: "boolean" },
    readOnly: { control: "boolean" },
  },
  args: { placeholder: "What changed, and what it affects", "aria-label": "Notes" },
  render: (args) => (
    <div className="max-w-sm">
      <Textarea {...args} />
    </div>
  ),
};
export default meta;
type Story = StoryObj<typeof Textarea>;

export const Default: Story = {};

export const Sizes: Story = {
  render: () => (
    <div className="flex max-w-2xl gap-6">
      <div className="flex-1">
        <Textarea size="md" placeholder="md — a form" aria-label="Medium" />
      </div>
      <div className="flex-1">
        <Textarea size="sm" placeholder="sm — a panel or drawer" aria-label="Small" />
      </div>
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div className="flex max-w-sm flex-col gap-3">
      <Textarea placeholder="Default" aria-label="Default" />
      <Textarea defaultValue="Trunk SYD-03 dropped below 3.6 for four minutes." aria-label="Filled" />
      <Textarea aria-invalid defaultValue="." aria-label="Invalid" />
      <Textarea readOnly defaultValue="Recorded at 14:15 AEST." aria-label="Read only" />
      <Textarea disabled placeholder="Disabled" aria-label="Disabled" />
    </div>
  ),
};

export const InAField: Story = {
  name: "In a Field",
  render: () => (
    <div className="max-w-sm">
      <Field invalid>
        <FieldLabel required>Incident notes</FieldLabel>
        <FieldControl required>
          <Textarea placeholder="What changed, and what it affects" />
        </FieldControl>
        <FieldDescription>Visible to anyone with access to this probe.</FieldDescription>
        <FieldError>Notes are required before an incident can be closed.</FieldError>
      </Field>
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
        <Guidance variant="dont" caption="A three-line box under a one-line question invites a paragraph.">
          <Field>
            <FieldLabel>Probe name</FieldLabel>
            <FieldControl>
              <Textarea placeholder="SYD-03" />
            </FieldControl>
          </Field>
        </Guidance>
        <Guidance variant="do" caption="The size of the box is a promise about the length of the answer.">
          <Field>
            <FieldLabel>Probe name</FieldLabel>
            <FieldControl>
              <Input placeholder="SYD-03" />
            </FieldControl>
          </Field>
        </Guidance>
      </Pair>

      <Pair>
        <Guidance variant="dont" caption="A limit enforced in silence reads as a broken field.">
          <Field>
            <FieldLabel>Incident notes</FieldLabel>
            <FieldControl>
              <Textarea maxLength={280} placeholder="What changed, and what it affects" />
            </FieldControl>
          </Field>
        </Guidance>
        <Guidance variant="do" caption="If the limit is worth enforcing, it is worth saying.">
          <Field>
            <FieldLabel>Incident notes</FieldLabel>
            <FieldControl>
              <Textarea maxLength={280} placeholder="What changed, and what it affects" />
            </FieldControl>
            <FieldDescription>Up to 280 characters.</FieldDescription>
          </Field>
        </Guidance>
      </Pair>
    </div>
  ),
};
