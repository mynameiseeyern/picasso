import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { OtpInput, OtpSeparator, OtpSlot } from "./otp";
import { Button } from "../button/button";
import { Field, FieldLabel } from "../field/field";

import guidance from "./guidance.json";
import { Guidance, GuidanceStory, pairOf } from "@/stories/guidance";

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
const pair = pairOf(guidance);

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

export const DoAndDont: Story = {
  name: "Do and Don't",
  parameters: { controls: { disable: true } },
  render: () => (
    <GuidanceStory>
      <Guidance
        pair={pair("invalid-needs-a-way-out")}
        width="wide"
        dont={
          <>
            <div className="flex flex-col gap-2">
              <Six size="sm" invalid defaultValue="482100" />
            </div>
          </>
        }
        do={
          <>
            <div className="flex flex-col items-start gap-2">
              <Six size="sm" invalid defaultValue="482100" />
              <p className="text-body-sm text-content-danger-emphasis">
                That code has expired.
              </p>
              <Button variant="secondary" size="sm">
                Send a new code
              </Button>
            </div>
          </>
        }
      />

      <Guidance
        pair={pair("say-where-it-went")}
        width="wide"
        dont={
          <>
            <div className="flex flex-col gap-2">
              <p className="text-body-md text-content-neutral-emphasis">
                Enter your code
              </p>
              <Six size="sm" />
            </div>
          </>
        }
        do={
          <>
            <div className="flex flex-col gap-2">
              <p className="text-body-md text-content-neutral-emphasis">
                Enter your code
              </p>
              <p className="text-body-sm text-content-neutral-muted">
                Sent by SMS to •••• 4821. Expires in 10 minutes.
              </p>
              <Six size="sm" />
            </div>
          </>
        }
      />

      <Guidance
        pair={pair("size-step-on-phones")}
        width="wide"
        stage="tall"
        dont={
          <div className="w-82 overflow-hidden">
            <Six value="" onChange={() => {}} />
          </div>
        }
        do={
          <div className="w-82">
            <Six size="sm" value="" onChange={() => {}} />
          </div>
        }
      />
    </GuidanceStory>
  ),
};

/**
 * Narrow — 328, a 360 phone minus its gutters. Every other story here pins a
 * width well above that, so this is the one that shows what a phone does to
 * it, and the one the overflow sweep can measure.
 *
 * `sm`, not the default: six `md` boxes are 48 each, and with the 16
 * separator and six 8 gaps the row is 352 — wider than the 328 there is. `sm`
 * is 304 and fits. A code is read off another screen while it is typed, so a
 * row that scrolls hides the digits being compared.
 */
export const Narrow: Story = {
  parameters: { controls: { disable: true } },
  render: function Render() {
    const [value, setValue] = React.useState("");
    return (
      <div className="flex w-82 flex-col gap-4">
        <Field>
          <FieldLabel>Verification code</FieldLabel>
          <p className="text-body-sm text-content-neutral-muted">
            Sent by SMS to •••• 4821. It expires in 10 minutes.
          </p>
          <Six size="sm" value={value} onChange={setValue} />
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
