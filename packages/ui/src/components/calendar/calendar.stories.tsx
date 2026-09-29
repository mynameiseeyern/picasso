import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import type { DateRange } from "react-day-picker";
import { Calendar } from "./calendar";

const meta: Meta<typeof Calendar> = {
  title: "Components/Calendar",
  component: Calendar,
  parameters: {
    docs: {
      description: {
        component:
          "A month grid for picking a date or a span of them. Built on " +
          "react-day-picker, which owns the month maths, the keyboard grid, " +
          "range selection and locale week-start; everything here is " +
          "Picasso's paint over its class hooks.",
      },
    },
  },
  argTypes: {
    size: { control: "inline-radio", options: ["default", "lg"] },
    showOutsideDays: { control: "boolean" },
  },
  args: { size: "default", showOutsideDays: true },
};
export default meta;
type Story = StoryObj<typeof Calendar>;

const JAN = new Date(2026, 0, 15);

export const Default: Story = {
  render: (args) => {
    const [date, setDate] = React.useState<Date | undefined>(JAN);
    return (
      <Calendar
        {...args}
        mode="single"
        selected={date}
        onSelect={setDate}
        defaultMonth={JAN}
      />
    );
  },
};

/** Two months, because most ranges cross a month boundary. */
export const Range: Story = {
  parameters: { controls: { disable: true } },
  render: () => {
    const [range, setRange] = React.useState<DateRange | undefined>({
      from: new Date(2026, 0, 10),
      to: new Date(2026, 0, 22),
    });
    return (
      <Calendar
        mode="range"
        numberOfMonths={2}
        selected={range}
        onSelect={setRange}
        defaultMonth={JAN}
      />
    );
  },
};

/** Bounded — and the rule belongs in words nearby, not only in grey cells. */
export const WithBounds: Story = {
  name: "With bounds",
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-2">
      <p className="text-body-sm text-content-neutral-muted">
        Call records are kept for 13 months.
      </p>
      <Calendar
        mode="single"
        defaultMonth={JAN}
        disabled={{
          before: new Date(2025, 0, 1),
          after: new Date(2026, 0, 31),
        }}
      />
    </div>
  ),
};

/** Pick several days that need not be adjacent. */
export const Multiple: Story = {
  parameters: { controls: { disable: true } },
  render: () => {
    const [days, setDays] = React.useState<Date[] | undefined>([
      new Date(2026, 0, 6),
      new Date(2026, 0, 13),
      new Date(2026, 0, 20),
    ]);
    return (
      <Calendar
        mode="multiple"
        selected={days}
        onSelect={setDays}
        defaultMonth={JAN}
      />
    );
  },
};
