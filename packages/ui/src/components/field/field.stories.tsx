import type { Meta, StoryObj } from "@storybook/react";
import {
  Field,
  FieldControl,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldOption,
} from "./field";
import { Input } from "../input/input";
import { Checkbox } from "../checkbox/checkbox";
import { Radio, RadioGroup } from "../radio-group/radio-group";
import { Switch } from "../switch/switch";

import guidance from "./guidance.json";
import { Guidance, GuidanceStory, pairOf } from "@/stories/guidance";

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
const pair = pairOf(guidance);

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
        <FieldControl>
          <Input placeholder="30 s" />
        </FieldControl>
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

const Pair = ({ children }: { children: React.ReactNode }) => (
  <div className="flex flex-wrap gap-4">{children}</div>
);

export const DoAndDont: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <GuidanceStory>
      <Guidance
        pair={pair("invalid-needs-a-message")}
        stage="tall"
        dont={
          <>
            <Field invalid>
              <FieldLabel>Threshold</FieldLabel>
              <FieldControl>
                <Input defaultValue="3.60000" />
              </FieldControl>
              <FieldDescription>
                MOS is measured to one decimal.
              </FieldDescription>
            </Field>
          </>
        }
        do={
          <>
            <Field invalid>
              <FieldLabel>Threshold</FieldLabel>
              <FieldControl>
                <Input defaultValue="3.60000" />
              </FieldControl>
              <FieldError>MOS is measured to one decimal. Use 3.6.</FieldError>
            </Field>
          </>
        }
      />

      <Guidance
        pair={pair("hint-is-not-an-error")}
        stage="tall"
        dont={
          <>
            <Field>
              <FieldLabel>Probe name</FieldLabel>
              <FieldControl>
                <Input placeholder="SYD-03" />
              </FieldControl>
              <FieldDescription>
                Don't use spaces or special characters.
              </FieldDescription>
            </Field>
          </>
        }
        do={
          <>
            <Field>
              <FieldLabel>Probe name</FieldLabel>
              <FieldControl>
                <Input placeholder="SYD-03" />
              </FieldControl>
              <FieldDescription>Letters, digits and hyphens.</FieldDescription>
            </Field>
          </>
        }
      />

      <Guidance
        pair={pair("mark-the-minority")}
        stage="tall"
        dont={
          <>
            <div className="flex flex-col gap-3">
              <Field>
                <FieldLabel required>Probe name</FieldLabel>
                <FieldControl required>
                  <Input placeholder="SYD-03" />
                </FieldControl>
              </Field>
              <Field>
                <FieldLabel required>Threshold</FieldLabel>
                <FieldControl required>
                  <Input placeholder="3.6" />
                </FieldControl>
              </Field>
            </div>
          </>
        }
        do={
          <>
            <div className="flex flex-col gap-3">
              <Field>
                <FieldLabel>Probe name</FieldLabel>
                <FieldControl required>
                  <Input placeholder="SYD-03" />
                </FieldControl>
              </Field>
              <Field>
                <FieldLabel>Threshold</FieldLabel>
                <FieldControl>
                  <Input placeholder="3.6" />
                </FieldControl>
                <FieldDescription>Optional.</FieldDescription>
              </Field>
            </div>
          </>
        }
      />
    </GuidanceStory>
  ),
};

export const Options: Story = {
  name: "Option rows",
  parameters: {
    docs: {
      description: {
        story:
          "A control and its label as one row, and one target. The row is 24 " +
          "tall everywhere and 44 where the pointer is coarse, so a thumb gets " +
          "44 without desktop density changing. Click the words, not just the box.",
      },
    },
  },
  render: () => (
    <div className="flex max-w-100 flex-col gap-1">
      <FieldOption control={<Checkbox defaultChecked />}>
        Email me when a threshold trips
      </FieldOption>
      <FieldOption
        control={<Checkbox />}
        description="Weekdays only, 9am to 6pm Sydney time."
      >
        Send a digest instead of individual alerts
      </FieldOption>
      <FieldOption control={<Checkbox />} disabled>
        Page the on-call engineer
      </FieldOption>
      <RadioGroup defaultValue="every">
        <FieldOption control={<Radio value="every" />}>
          Every occurrence
        </FieldOption>
        <FieldOption
          control={<Radio value="first" />}
          description="One alert, however many times it trips."
        >
          First occurrence only
        </FieldOption>
      </RadioGroup>
      <FieldOption control={<Switch />}>
        Mute during maintenance windows
      </FieldOption>
    </div>
  ),
};
