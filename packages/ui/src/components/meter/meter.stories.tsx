import type { Meta, StoryObj } from "@storybook/react";
import { Meter } from "./meter";

const meta: Meta<typeof Meter> = {
  title: "Components/Meter",
  component: Meter,
  parameters: {
    docs: {
      description: {
        component:
          "A ten-segment bar for a value against a known ceiling. It moves in " +
          "20% steps, always rounding up, and it is hidden from assistive " +
          "technology — so it is always shown beside the number it represents.",
      },
    },
  },
  argTypes: {
    status: {
      control: "inline-radio",
      options: ["healthy", "warning", "critical", "unknown"],
    },
  },
  args: { value: 4, max: 5, status: "healthy" },
};
export default meta;
type Story = StoryObj<typeof Meter>;

export const Default: Story = {
  render: (args) => (
    <div className="w-72">
      <Meter {...args} />
    </div>
  ),
};

/** 20% steps, always rounding up — so any non-zero reading lights something. */
export const Rounding: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex w-96 flex-col gap-2">
      {[0, 0.6, 1, 2.5, 3.2, 4, 5].map((v) => (
        <div key={v} className="flex items-center gap-3">
          <span className="w-16 text-body-sm text-content-neutral-muted">
            {v} / 5
          </span>
          <Meter value={v} max={5} status="healthy" />
        </div>
      ))}
    </div>
  ),
};

export const Statuses: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex w-96 flex-col gap-2">
      {(["healthy", "warning", "critical", "unknown"] as const).map((s) => (
        <div key={s} className="flex items-center gap-3">
          <span className="w-16 text-body-sm text-content-neutral-muted">
            {s}
          </span>
          <Meter value={3.5} max={5} status={s} />
        </div>
      ))}
      <p className="mt-2 text-body-sm text-content-neutral-muted">
        Unknown lights nothing: no reading and a reading of zero are different
        facts.
      </p>
    </div>
  ),
};
