import type { Meta, StoryObj } from "@storybook/react";
import { Illustration, type IllustrationName } from "./illustration";

const meta: Meta<typeof Illustration> = {
  title: "Components/Illustration",
  component: Illustration,
  parameters: {
    docs: {
      description: {
        component:
          "Product spot illustrations that answer the pointer. Each drawing " +
          "carries one mechanic: **lift** (the gap follows the pointer), " +
          "**magnify** (each shape swells by its distance from the pointer, " +
          "on a spring) and **sequence** (steps light in turn while the " +
          "pointer is over it). Turn on *Reduce motion* in your OS to see " +
          "the fallbacks: nothing travels. Figma: none yet — code first.",
      },
    },
  },
  argTypes: {
    name: {
      control: "inline-radio",
      options: ["issue-alerts", "fleet-health", "call-readiness"],
    },
    label: { control: "text" },
    interactive: { control: "boolean" },
  },
};
export default meta;
type Story = StoryObj<typeof Illustration>;

/** The page owns the size: the picture fills whatever it is put in. */
const single: Story["decorators"] = [
  (Story) => (
    <div className="w-60">
      <Story />
    </div>
  ),
];

export const Playground: Story = {
  args: { name: "issue-alerts", interactive: true },
  decorators: single,
};

const figures: {
  name: IllustrationName;
  mechanic: string;
  title: string;
  body: string;
}[] = [
  {
    name: "issue-alerts",
    mechanic: "Lift",
    title: "Issue alerts",
    body: "Agents see what is wrong with their setup before the call, and what to do about it.",
  },
  {
    name: "fleet-health",
    mechanic: "Magnify",
    title: "Fleet health",
    body: "Every endpoint in one view, so the one that needs attention is easy to find.",
  },
  {
    name: "call-readiness",
    mechanic: "Sequence",
    title: "Call readiness",
    body: "Headset, machine, platform and network checks roll up into one answer.",
  },
];

/**
 * The three mechanics side by side, as they would sit on a product page.
 * Move the pointer over each. The heading and sentence say everything the
 * picture does, so the picture is hidden from assistive tech.
 */
export const Mechanics: Story = {
  name: "The three mechanics",
  decorators: [
    (Story) => (
      <div className="w-240">
        <Story />
      </div>
    ),
  ],
  render: () => (
    <div className="grid grid-cols-3">
      {figures.map((figure, i) => (
        <div
          key={figure.name}
          className={
            i === 0
              ? "flex flex-col gap-6 pe-8"
              : "flex flex-col gap-6 border-s border-line-neutral-muted px-8"
          }
        >
          <span className="text-xs font-medium text-content-neutral-subtle uppercase">
            Fig {i + 1} · {figure.mechanic}
          </span>
          <div className="mx-auto w-56">
            <Illustration name={figure.name} label={null} />
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="text-md font-medium text-content-neutral-emphasis">
              {figure.title}
            </h3>
            <p className="text-md text-content-neutral-muted">{figure.body}</p>
          </div>
        </div>
      ))}
    </div>
  ),
};

/** Lift — the alert under the pointer opens and the ones below make room. */
export const Lift: Story = {
  args: { name: "issue-alerts" },
  decorators: single,
};

/** Magnify — each endpoint swells by its distance from the pointer, on its own spring. */
export const Magnify: Story = {
  args: { name: "fleet-health" },
  decorators: single,
};

/** Sequence — while the pointer is over it, the four checks light one at a time. */
export const Sequence: Story = {
  args: { name: "call-readiness" },
  decorators: single,
};

/** Inside the product the picture stays still: an empty state is not a control. */
export const Still: Story = {
  name: "Still, for inside the product",
  decorators: [
    (Story) => (
      <div className="w-180">
        <Story />
      </div>
    ),
  ],
  render: () => (
    <div className="grid grid-cols-3 gap-8">
      {figures.map((figure) => (
        <Illustration
          key={figure.name}
          name={figure.name}
          interactive={false}
        />
      ))}
    </div>
  ),
};
