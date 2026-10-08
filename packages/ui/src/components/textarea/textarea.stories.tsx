import type { Meta, StoryObj } from "@storybook/react";
import { Textarea } from "./textarea";
import { Input } from "../input/input";
import {
  Field,
  FieldControl,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "../field/field";

import guidance from "./guidance.json";
import { Guidance, GuidanceStory, pairOf } from "@/stories/guidance";

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
  args: {
    placeholder: "What changed, and what it affects",
    "aria-label": "Notes",
  },
  render: (args) => (
    <div className="max-w-sm">
      <Textarea {...args} />
    </div>
  ),
};
const pair = pairOf(guidance);

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
        <Textarea
          size="sm"
          placeholder="sm — a panel or drawer"
          aria-label="Small"
        />
      </div>
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div className="flex max-w-sm flex-col gap-3">
      <Textarea placeholder="Default" aria-label="Default" />
      <Textarea
        defaultValue="Trunk SYD-03 dropped below 3.6 for four minutes."
        aria-label="Filled"
      />
      <Textarea aria-invalid defaultValue="." aria-label="Invalid" />
      <Textarea
        readOnly
        defaultValue="Recorded at 14:15 AEST."
        aria-label="Read only"
      />
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
        <FieldDescription>
          Visible to anyone with access to this probe.
        </FieldDescription>
        <FieldError>
          Notes are required before an incident can be closed.
        </FieldError>
      </Field>
    </div>
  ),
};

/* ------------------------------------------------------------------ */
/* Guidance — rendered, so it breaks when the component does           */
/* ------------------------------------------------------------------ */

const Pair = ({ children }: { children: React.ReactNode }) => (
  <div className="flex flex-wrap gap-4">{children}</div>
);

/**
 * Narrow — 328, a 360 phone minus its gutters. The box keeps its width and the
 * text wraps inside it; nothing scrolls sideways.
 */
export const Narrow: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="w-82 border border-line-neutral-muted p-3">
      <Field>
        <FieldLabel>Notes</FieldLabel>
        <FieldControl>
          <Textarea
            defaultValue="Jitter above threshold on the Sydney trunk from 02:14. Carrier confirmed a reroute; watching for recurrence."
            aria-label="Notes"
          />
        </FieldControl>
        <FieldDescription>
          Visible to everyone on the on-call rotation.
        </FieldDescription>
      </Field>
    </div>
  ),
};

export const DoAndDont: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <GuidanceStory>
      <Guidance
        pair={pair("one-line-is-an-input")}
        stage="tall"
        dont={
          <>
            <Field>
              <FieldLabel>Probe name</FieldLabel>
              <FieldControl>
                <Textarea placeholder="SYD-03" />
              </FieldControl>
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
            </Field>
          </>
        }
      />

      <Guidance
        pair={pair("say-the-limit")}
        stage="tall"
        dont={
          <>
            <Field>
              <FieldLabel>Incident notes</FieldLabel>
              <FieldControl>
                <Textarea
                  maxLength={280}
                  placeholder="What changed, and what it affects"
                />
              </FieldControl>
            </Field>
          </>
        }
        do={
          <>
            <Field>
              <FieldLabel>Incident notes</FieldLabel>
              <FieldControl>
                <Textarea
                  maxLength={280}
                  placeholder="What changed, and what it affects"
                />
              </FieldControl>
              <FieldDescription>Up to 280 characters.</FieldDescription>
            </Field>
          </>
        }
      />

      <Guidance
        pair={pair("let-it-grow")}
        width="wide"
        stage="tall"
        dont={
          <Textarea
            rows={2}
            defaultValue={
              "Collector 4 has not reported since 02:14. Restarted the service, no change. Escalating to the network team."
            }
          />
        }
        do={
          <Textarea
            defaultValue={
              "Collector 4 has not reported since 02:14. Restarted the service, no change. Escalating to the network team."
            }
          />
        }
      />
    </GuidanceStory>
  ),
};
