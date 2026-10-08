import type { Meta, StoryObj } from "@storybook/react";
import { PasswordInput } from "./password-input";
import {
  Field,
  FieldControl,
  FieldDescription,
  FieldLabel,
} from "../field/field";
import guidance from "./guidance.json";
import { Guidance, GuidanceStory, pairOf } from "@/stories/guidance";
import { Input } from "../input/input";

const meta: Meta<typeof PasswordInput> = {
  title: "Components/PasswordInput",
  component: PasswordInput,
  parameters: {
    docs: {
      description: {
        component:
          "Figma Input `Type=Password`: the field plus an eye that shows and hides the value.",
      },
    },
  },
  args: { placeholder: "••••••••", "aria-label": "Password" },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md"] },
    disabled: { control: "boolean" },
  },
  decorators: [
    (S) => (
      <div className="w-72">
        <S />
      </div>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof PasswordInput>;

export const Default: Story = {};
export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-col gap-3">
      <PasswordInput {...args} size="sm" />
      <PasswordInput {...args} size="md" />
    </div>
  ),
};
export const NewPassword: Story = {
  render: () => (
    <Field>
      <FieldLabel required>New password</FieldLabel>
      <FieldControl required>
        <PasswordInput autoComplete="new-password" />
      </FieldControl>
      <FieldDescription>At least 12 characters.</FieldDescription>
    </Field>
  ),
};
export const Disabled: Story = {
  args: { disabled: true, defaultValue: "secret" },
};

/** Invalid is `aria-invalid`, not a prop: the border turns red, and a Field sets it for you. */
export const Invalid: Story = {
  args: { "aria-invalid": true, defaultValue: "secret" },
};

const pair = pairOf(guidance);

/**
 * Narrow — 328, a 360 phone minus its gutters. The reveal button sits inside
 * the field, so the text has to end before it rather than run underneath.
 */
export const Narrow: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="w-82 border border-line-neutral-muted p-3">
      <Field>
        <FieldLabel>Service account password</FieldLabel>
        <FieldControl>
          <PasswordInput
            defaultValue="correct-horse-battery-staple"
            aria-label="Service account password"
          />
        </FieldControl>
        <FieldDescription>Stored encrypted at rest.</FieldDescription>
      </Field>
    </div>
  ),
};

export const DoAndDont: Story = {
  name: "Do and Don't",
  parameters: { controls: { disable: true } },
  render: () => (
    <GuidanceStory>
      <Guidance
        pair={pair("always-offer-show")}
        width="wide"
        stage="tall"
        dont={
          <Field>
            <FieldLabel>Password</FieldLabel>
            <FieldControl>
              <Input type="password" defaultValue="hunter2!" />
            </FieldControl>
          </Field>
        }
        do={
          <Field>
            <FieldLabel>Password</FieldLabel>
            <FieldControl>
              <PasswordInput defaultValue="hunter2!" />
            </FieldControl>
          </Field>
        }
      />

      <Guidance
        pair={pair("no-confirm-field")}
        width="wide"
        stage="tall"
        dont={
          <div className="w-full space-y-3">
            <Field>
              <FieldLabel>Password</FieldLabel>
              <FieldControl>
                <PasswordInput />
              </FieldControl>
            </Field>
            <Field>
              <FieldLabel>Confirm password</FieldLabel>
              <FieldControl>
                <PasswordInput />
              </FieldControl>
            </Field>
          </div>
        }
        do={
          <Field>
            <FieldLabel>Password</FieldLabel>
            <FieldControl>
              <PasswordInput />
            </FieldControl>
            <FieldDescription>
              Reveal it to check what you typed.
            </FieldDescription>
          </Field>
        }
      />
    </GuidanceStory>
  ),
};
