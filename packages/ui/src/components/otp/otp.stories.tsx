import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { OtpInput, OtpSeparator, OtpSlot } from "./otp";
import { Button } from "../button/button";
import { Field, FieldLabel } from "../field/field";

const meta: Meta<typeof OtpInput> = {
  title: "Components/Verification OTP",
  component: OtpInput,
  parameters: {
    docs: {
      description: {
        component:
          "A one-time code, entered as one field behind a row of boxes. The " +
          "boxes are presentation — nothing in them takes focus, so the " +
          "active slot is marked from the hidden field's context rather than " +
          "by :focus-visible.",
      },
    },
  },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    invalid: { control: "boolean" },
    disabled: { control: "boolean" },
  },
  args: { size: "md", invalid: false, disabled: false },
};
export default meta;
type Story = StoryObj<typeof OtpInput>;

function Six(
  props: Omit<React.ComponentProps<typeof OtpInput>, "maxLength" | "children">,
) {
  return (
    <OtpInput aria-label="Verification code" {...props} maxLength={6}>
      <OtpSlot index={0} />
      <OtpSlot index={1} />
      <OtpSlot index={2} />
      <OtpSeparator />
      <OtpSlot index={3} />
      <OtpSlot index={4} />
      <OtpSlot index={5} />
    </OtpInput>
  );
}

export const Default: Story = {
  render: (args) => <Six {...args} />,
};

/** The three sizes. lg is a bigger box at the same 30px, as the file draws it. */
export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-4">
      <Six size="sm" defaultValue="123456" />
      <Six size="md" defaultValue="123456" />
      <Six size="lg" defaultValue="123456" />
    </div>
  ),
};

export const States: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-4">
      <Six defaultValue="1234" />
      <Six invalid defaultValue="123456" />
      <Six disabled defaultValue="123456" />
    </div>
  ),
};

/** In context — the code needs a destination and a way to get another one. */
export const InAForm: Story = {
  name: "In a form",
  parameters: { controls: { disable: true } },
  render: () => {
    const [value, setValue] = React.useState("");
    const wrong = value.length === 6 && value !== "123456";
    return (
      <div className="flex w-100 flex-col gap-4">
        <Field>
          <FieldLabel>Verification code</FieldLabel>
          <p className="text-body-sm text-content-neutral-muted">
            Sent by SMS to •••• 4821. It expires in 10 minutes.
          </p>
          <Six value={value} onChange={setValue} invalid={wrong} />
          {wrong ? (
            <p className="text-body-sm text-content-danger-emphasis">
              That code is not right, or it has expired.
            </p>
          ) : null}
        </Field>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => setValue("")}>
            Send a new code
          </Button>
          <Button disabled={value.length < 6}>Verify</Button>
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
        "m-0 min-w-80 flex-1 rounded-md border-2 p-4 " +
        (isDo ? "border-line-success-emphasis" : "border-line-danger-emphasis")
      }
    >
      <div className="min-h-20">{children}</div>
      <figcaption className="mt-4 text-label-sm">
        <span
          className={
            isDo
              ? "text-content-success-emphasis"
              : "text-content-danger-emphasis"
          }
        >
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
        <Guidance
          variant="dont"
          caption="Red boxes and nothing else — and the code has probably just expired."
        >
          <div className="flex flex-col gap-2">
            <Six size="sm" invalid defaultValue="482100" />
          </div>
        </Guidance>
        <Guidance
          variant="do"
          caption="Say what happened, and offer another code."
        >
          <div className="flex flex-col items-start gap-2">
            <Six size="sm" invalid defaultValue="482100" />
            <p className="text-body-sm text-content-danger-emphasis">
              That code has expired.
            </p>
            <Button variant="secondary" size="sm">
              Send a new code
            </Button>
          </div>
        </Guidance>
      </div>

      <div className="flex flex-wrap gap-4">
        <Guidance
          variant="dont"
          caption="No destination — people check the wrong device and wait."
        >
          <div className="flex flex-col gap-2">
            <p className="text-body-md text-content-neutral-emphasis">
              Enter your code
            </p>
            <Six size="sm" />
          </div>
        </Guidance>
        <Guidance
          variant="do"
          caption="Name where it went and how long it lasts."
        >
          <div className="flex flex-col gap-2">
            <p className="text-body-md text-content-neutral-emphasis">
              Enter your code
            </p>
            <p className="text-body-sm text-content-neutral-muted">
              Sent by SMS to •••• 4821. Expires in 10 minutes.
            </p>
            <Six size="sm" />
          </div>
        </Guidance>
      </div>
    </div>
  ),
};
