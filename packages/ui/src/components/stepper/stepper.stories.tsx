import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  Stepper,
  StepperContent,
  StepperDescription,
  StepperIndicator,
  StepperItem,
  StepperSeparator,
  StepperTitle,
  StepperTrack,
} from "./stepper";

const meta: Meta<typeof Stepper> = {
  title: "Components/Stepper",
  component: Stepper,
  parameters: {
    docs: {
      description: {
        component:
          "Where someone is in a linear flow. Figma draws five layouts over " +
          "two shared primitives, so this is one composable component and " +
          "the layouts are compositions — shown below — rather than props.",
      },
    },
  },
  argTypes: {
    value: { control: { type: "number", min: 0, max: 3 } },
    size: { control: "inline-radio", options: ["sm", "md"] },
    indicator: { control: "inline-radio", options: ["number", "check"] },
    orientation: {
      control: "inline-radio",
      options: ["horizontal", "vertical"],
    },
  },
  args: {
    value: 2,
    size: "md",
    indicator: "number",
    orientation: "horizontal",
  },
};
export default meta;
type Story = StoryObj<typeof Stepper>;

const STEPS = [
  { title: "Your details", description: "Name and email" },
  { title: "Company", description: "Tenant and region" },
  { title: "Invite team", description: "Optional" },
  { title: "Confirm", description: "Review and finish" },
];

/** Icons connected — the default. Indicators joined by a line. */
export const Default: Story = {
  render: (args) => (
    <div className="w-160">
      <Stepper {...args}>
        {STEPS.map((s, i) => (
          <StepperItem key={s.title} index={i}>
            <StepperIndicator />
            <StepperSeparator />
          </StepperItem>
        ))}
      </Stepper>
    </div>
  ),
};

/** Icons minimal — for a dialog or a drawer, where the labels will not fit. */
export const IconsMinimal: Story = {
  name: "Icons minimal",
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex w-80 items-center gap-3">
      <div className="flex-1">
        <Stepper value={2} size="sm" indicator="check">
          {STEPS.map((s, i) => (
            <StepperItem key={s.title} index={i}>
              <StepperIndicator />
              <StepperSeparator />
            </StepperItem>
          ))}
        </Stepper>
      </div>
      <span className="text-label-sm text-content-neutral-muted">
        Step 3 of 4
      </span>
    </div>
  ),
};

/** Icons centered — title and supporting text under each indicator. */
export const IconsCentered: Story = {
  name: "Icons centered",
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="w-240">
      <Stepper value={2} layout="stacked">
        {STEPS.map((s, i) => (
          <StepperItem key={s.title} index={i}>
            <StepperTrack>
              <StepperIndicator />
              <StepperSeparator />
            </StepperTrack>
            <StepperContent>
              <StepperTitle>{s.title}</StepperTitle>
              <StepperDescription>{s.description}</StepperDescription>
            </StepperContent>
          </StepperItem>
        ))}
      </Stepper>
    </div>
  ),
};

/** Vertical, icon left — onboarding and set-up, where each step is described. */
export const Vertical: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="w-96">
      <Stepper value={1} orientation="vertical">
        {STEPS.map((s, i) => (
          <StepperItem key={s.title} index={i}>
            <StepperTrack>
              <StepperIndicator />
              <StepperSeparator />
            </StepperTrack>
            <StepperContent>
              <StepperTitle>{s.title}</StepperTitle>
              <StepperDescription>{s.description}</StepperDescription>
            </StepperContent>
          </StepperItem>
        ))}
      </Stepper>
    </div>
  ),
};

/** Driven — the value is state, and the steps follow it. */
export const Interactive: Story = {
  parameters: { controls: { disable: true } },
  render: () => {
    const [value, setValue] = React.useState(0);
    return (
      <div className="flex w-160 flex-col gap-6">
        <Stepper value={value}>
          {STEPS.map((s, i) => (
            <StepperItem key={s.title} index={i}>
              <StepperIndicator />
              <StepperSeparator />
            </StepperItem>
          ))}
        </Stepper>
        <div className="flex gap-2">
          <button
            type="button"
            className="text-label-md text-content-link-default"
            onClick={() => setValue((v) => Math.max(0, v - 1))}
          >
            Back
          </button>
          <button
            type="button"
            className="text-label-md text-content-link-default"
            onClick={() => setValue((v) => Math.min(STEPS.length, v + 1))}
          >
            Next
          </button>
        </div>
      </div>
    );
  },
};
