import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import {
  Illustration,
  illustrationMechanic,
  type IllustrationName,
} from "./illustration";

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
      options: Object.keys(illustrationMechanic),
    },
    label: { control: "text" },
    interactive: { control: "boolean" },
    active: { control: "boolean" },
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

/**
 * Narrow — 328, a 360 phone minus its gutters. Every other story here pins a
 * width well above that, so this is the one that shows what a phone does to
 * it, and the one the overflow sweep can measure.
 */
export const Narrow: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex w-82 flex-col gap-8">
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

const NAMES = Object.keys(illustrationMechanic) as IllustrationName[];

/** Every drawing, grouped by the mechanic it carries. Point at each. */
export const Library: Story = {
  name: "All drawings",
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex w-240 flex-col gap-10">
      {(["lift", "magnify", "sequence"] as const).map((mechanic) => (
        <section key={mechanic} className="flex flex-col gap-4">
          <h3 className="text-md font-medium text-content-neutral-emphasis capitalize">
            {mechanic}
          </h3>
          <div className="grid grid-cols-4 gap-6">
            {NAMES.filter((n) => illustrationMechanic[n] === mechanic).map(
              (name) => (
                <figure key={name} className="m-0 flex flex-col gap-2">
                  <Illustration name={name} label={null} />
                  <figcaption className="text-sm text-content-neutral-muted">
                    {name}
                  </figcaption>
                </figure>
              ),
            )}
          </div>
        </section>
      ))}
    </div>
  ),
};

/**
 * A list card owns the hover, so the picture listens to nothing and the card
 * passes `active`. It turns on once the pointer has settled for 120ms, and
 * at once on keyboard focus. See "List cards" in Foundations / Motion.
 */
function ListCardSketch({
  name,
  title,
  meta,
}: {
  name: IllustrationName;
  title: string;
  meta: string;
}) {
  const [active, setActive] = React.useState(false);
  const timer = React.useRef<number>(0);
  const settle = () => {
    window.clearTimeout(timer.current);
    if (!active) timer.current = window.setTimeout(() => setActive(true), 120);
  };
  return (
    <a
      href="#"
      onClick={(event) => event.preventDefault()}
      onPointerEnter={settle}
      onPointerMove={settle}
      onPointerLeave={() => {
        window.clearTimeout(timer.current);
        setActive(false);
      }}
      onFocus={(event) => {
        if (event.currentTarget.matches(":focus-visible")) setActive(true);
      }}
      onBlur={() => setActive(false)}
      className="relative grid h-28 grid-cols-[minmax(0,1fr)_9rem] overflow-hidden rounded-lg border border-line-neutral-muted bg-surface-card ps-5 transition-colors hover:border-line-primary-muted"
    >
      <span className="flex min-w-0 flex-col justify-center gap-1 pe-2">
        <span className="truncate text-lg font-semibold text-content-neutral-emphasis">
          {title}
        </span>
        <span className="truncate text-sm text-content-neutral-subtle">
          {meta}
        </span>
      </span>
      <span aria-hidden className="relative">
        <span className="absolute -end-20 -bottom-30 size-52 rounded-full bg-surface-primary-subtle" />
        <span
          className={
            "absolute -end-2 top-3 w-36 transition-illustration motion-reduce:transition-none " +
            (active ? "-translate-x-1 -translate-y-2 rtl:translate-x-1" : "")
          }
        >
          <Illustration name={name} label={null} active={active} />
        </span>
      </span>
    </a>
  );
}

export const ListCard: Story = {
  name: "In a list card (active)",
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex w-160 flex-col gap-3">
      <ListCardSketch
        name="issue-alerts"
        title="Packet loss above 2%"
        meta="Alert rule · 3 sites"
      />
      <ListCardSketch
        name="topology"
        title="Settlement services"
        meta="Topology · 8 systems"
      />
      <ListCardSketch
        name="integrations"
        title="Webex Calling"
        meta="Integration · Connected"
      />
    </div>
  ),
};

/**
 * The same drawings under Vantage. Nothing is copied and nothing is passed:
 * the accent, tint and hairlines are semantics, so `data-brand` on the root
 * re-points them at the brand's ramp. Switch Brand and Neutral in the
 * toolbar to see the rest.
 *
 * ⚠️ On the root, not on a wrapper. Semantics are declared on `:root`, so a
 * `data-brand` on a nested element changes the primitives there but not the
 * semantics already resolved above it.
 */
export const Brands: Story = {
  name: "Follows the brand",
  globals: { brand: "vantage" },
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="grid w-240 grid-cols-5 gap-6">
      {NAMES.map((name) => (
        <Illustration key={name} name={name} label={null} />
      ))}
    </div>
  ),
};
