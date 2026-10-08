import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import type { DateRange } from "react-day-picker";
import { DatePicker } from "./date-picker";
import { Field, FieldLabel } from "../field/field";
import guidance from "./guidance.json";
import { Guidance, GuidanceStory, pairOf } from "@/stories/guidance";
import { FieldControl, FieldDescription } from "../field/field";

const meta: Meta<typeof DatePicker> = {
  title: "Components/Date picker",
  component: DatePicker,
  parameters: {
    docs: {
      description: {
        component:
          "A field-shaped trigger that opens a calendar. It is a button, not " +
          "an input — the value is a date, not free text. The only thing " +
          "separating a placeholder from a value is the text colour, so the " +
          "placeholder must not look like a date.",
      },
    },
  },
  argTypes: {
    iconPosition: { control: "inline-radio", options: ["left", "right"] },
    disabled: { control: "boolean" },
    placeholder: { control: "text" },
    format: { control: "text" },
  },
  args: {
    iconPosition: "left",
    disabled: false,
    placeholder: "Pick a date",
    format: "d MMM yyyy",
  },
  decorators: [(S) => <div className="w-64 pb-96">{S()}</div>],
};
export default meta;
type Story = StoryObj<typeof DatePicker>;

export const Default: Story = {
  render: (args) => {
    const [date, setDate] = React.useState<Date | undefined>();
    // mode is explicit so the union narrows to the single-date branch
    // before `value` is checked against it.
    return (
      <DatePicker
        {...args}
        mode="single"
        value={date}
        onValueChange={setDate}
      />
    );
  },
};

/** Filled — the value's colour is what says it has been chosen. */
export const Filled: Story = {
  parameters: { controls: { disable: true } },
  render: () => {
    const [date, setDate] = React.useState<Date | undefined>(
      new Date(2026, 0, 15),
    );
    return <DatePicker value={date} onValueChange={setDate} />;
  },
};

/** Range — the popover stays open until both ends are in. */
export const Range: Story = {
  parameters: { controls: { disable: true } },
  render: () => {
    const [range, setRange] = React.useState<DateRange | undefined>();
    return (
      <DatePicker
        mode="range"
        value={range}
        onValueChange={setRange}
        placeholder="Pick a date range"
        calendarProps={{ numberOfMonths: 2 }}
      />
    );
  },
};

/** In a form, with the bound stated rather than left to grey cells. */
export const InAField: Story = {
  name: "In a field",
  parameters: { controls: { disable: true } },
  render: () => {
    const [date, setDate] = React.useState<Date | undefined>();
    return (
      <Field>
        <FieldLabel>Report from</FieldLabel>
        <p className="text-body-sm text-content-neutral-muted">
          Call records are kept for 13 months.
        </p>
        <DatePicker
          value={date}
          onValueChange={setDate}
          calendarProps={{ disabled: { before: new Date(2025, 0, 1) } }}
        />
      </Field>
    );
  },
};

export const Disabled: Story = {
  parameters: { controls: { disable: true } },
  render: () => <DatePicker disabled value={new Date(2026, 0, 15)} />,
};

const pair = pairOf(guidance);

/**
 * Narrow — 328, a 360 phone minus its gutters. The trigger truncates its
 * formatted date rather than growing; the calendar that opens is anchored, so
 * on a real phone it has the same edge problem every anchored panel has.
 */
export const Narrow: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="w-82 border border-line-neutral-muted p-3">
      <DatePicker mode="single" />
    </div>
  ),
};

export const DoAndDont: Story = {
  name: "Do and Don't",
  parameters: { controls: { disable: true } },
  render: () => (
    <GuidanceStory>
      <Guidance
        pair={pair("placeholder-is-not-a-value")}
        width="wide"
        dont={<DatePicker placeholder="6 Oct 2026" />}
        do={<DatePicker placeholder="Pick a date" />}
      />

      <Guidance
        pair={pair("unambiguous-format")}
        width="wide"
        dont={<DatePicker value={new Date(2026, 3, 3)} format="dd/MM/yyyy" />}
        do={<DatePicker value={new Date(2026, 3, 3)} format="d MMM yyyy" />}
      />

      <Guidance
        pair={pair("say-the-bounds")}
        width="wide"
        stage="tall"
        dont={
          <Field>
            <FieldLabel>From</FieldLabel>
            <FieldControl>
              <DatePicker placeholder="Pick a date" />
            </FieldControl>
          </Field>
        }
        do={
          <Field>
            <FieldLabel>From</FieldLabel>
            <FieldControl>
              <DatePicker placeholder="Pick a date" />
            </FieldControl>
            <FieldDescription>Data is kept for 13 months.</FieldDescription>
          </Field>
        }
      />
    </GuidanceStory>
  ),
};
