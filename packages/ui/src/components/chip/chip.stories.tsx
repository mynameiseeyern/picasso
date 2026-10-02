import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { MapPin, Sparkles } from "lucide-react";
import { Chip } from "./chip";
import { Badge } from "../badge/badge";
import { Button } from "../button/button";

import guidance from "./guidance.json";
import { Guidance, GuidanceStory, pairOf } from "@/stories/guidance";

const meta: Meta<typeof Chip> = {
  title: "Components/Chip",
  component: Chip,
  parameters: {
    docs: {
      description: {
        component:
          "A compact token — a filter you toggle, a suggestion you take, or " +
          "a value you remove. One component covers what Figma used to draw " +
          "as five sets: Filter is `selected`, Input is `onRemove`, AI is a " +
          "leading icon, and Assistive and Suggestion are the plain chip.",
      },
    },
  },
  argTypes: {
    selected: { control: "boolean" },
    disabled: { control: "boolean" },
    children: { control: "text" },
  },
  args: { children: "Sydney", selected: false, disabled: false },
};
const pair = pairOf(guidance);

export default meta;
type Story = StoryObj<typeof Chip>;

export const Default: Story = {};

/** Selection is carried by the check. The fill only differs at rest. */
export const Selected: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Chip selected={false}>Sydney</Chip>
      <Chip selected>Melbourne</Chip>
      <Chip selected>Brisbane</Chip>
      <Chip selected={false}>Perth</Chip>
    </div>
  ),
};

/** A faceted filter row — the everyday use. */
export const FilterRow: Story = {
  name: "Filter row",
  parameters: { controls: { disable: true } },
  render: () => {
    const [on, setOn] = React.useState<string[]>(["Degraded"]);
    const toggle = (v: string) =>
      setOn((s) => (s.includes(v) ? s.filter((x) => x !== v) : [...s, v]));
    return (
      <div className="flex flex-wrap gap-2">
        {["Healthy", "Degraded", "Offline", "Maintenance"].map((v) => (
          <Chip key={v} selected={on.includes(v)} onClick={() => toggle(v)}>
            {v}
          </Chip>
        ))}
      </div>
    );
  },
};

/** Removable tokens — Figma's old Input chip. The ✕ is the only control. */
export const Removable: Story = {
  parameters: { controls: { disable: true } },
  render: () => {
    const [tokens, setTokens] = React.useState([
      "probe-01",
      "probe-04",
      "probe-07",
    ]);
    return (
      <div className="flex flex-wrap gap-2">
        {tokens.map((t) => (
          <Chip
            key={t}
            onRemove={() => setTokens((s) => s.filter((x) => x !== t))}
            removeLabel={`Remove ${t}`}
          >
            {t}
          </Chip>
        ))}
        {tokens.length === 0 ? (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setTokens(["probe-01", "probe-04", "probe-07"])}
          >
            Reset
          </Button>
        ) : null}
      </div>
    );
  },
};

/** A leading icon covers what used to be the AI and Assistive chips. */
export const WithAnIcon: Story = {
  name: "With an icon",
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Chip>
        <Sparkles aria-hidden />
        Summarise
      </Chip>
      <Chip>
        <MapPin aria-hidden />
        Sydney
      </Chip>
      <Chip selected>
        <MapPin aria-hidden />
        Melbourne
      </Chip>
    </div>
  ),
};

export const Disabled: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Chip disabled>Sydney</Chip>
      <Chip disabled selected>
        Melbourne
      </Chip>
      <Chip disabled onRemove={() => {}}>
        probe-04
      </Chip>
    </div>
  ),
};

/* ------------------------------------------------------------------ */

/**
 * The "don't" examples below are deliberately hand-rolled spans rather than
 * restyled Chips — `no-restyle` refuses a colour class on a Chip, which is
 * the very rule these examples exist to illustrate.
 */
function HandRolled({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={
        "inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-label-md " +
        "text-content-neutral-emphasis " +
        (className ?? "border-line-neutral-muted")
      }
    >
      {children}
    </span>
  );
}

export const DoAndDont: Story = {
  name: "Do and Don't",
  parameters: { controls: { disable: true } },
  render: () => (
    <GuidanceStory>
      <Guidance
        pair={pair("check-not-colour")}
        width="wide"
        dont={
          <>
            <div className="flex gap-2">
              <HandRolled className="border-line-neutral-muted bg-surface-card">
                Melbourne
              </HandRolled>
              <Chip>Sydney</Chip>
            </div>
          </>
        }
        do={
          <>
            <div className="flex gap-2">
              <Chip selected>Melbourne</Chip>
              <Chip selected={false}>Sydney</Chip>
            </div>
          </>
        }
      />

      <Guidance
        pair={pair("chips-are-not-buttons")}
        width="wide"
        dont={
          <>
            <div className="flex gap-2">
              <Chip>Export CSV</Chip>
              <Chip>Delete endpoint</Chip>
            </div>
          </>
        }
        do={
          <>
            <div className="flex items-center gap-2">
              <Chip selected>Degraded</Chip>
              <Chip>Offline</Chip>
              <Button size="sm">Export CSV</Button>
            </div>
          </>
        }
      />

      <Guidance
        pair={pair("no-tone-variants")}
        width="wide"
        dont={
          <>
            <div className="flex gap-2">
              <HandRolled className="border-line-danger-muted bg-surface-danger-subtle">
                Offline
              </HandRolled>
              <HandRolled className="border-line-success-muted bg-surface-success-subtle">
                Healthy
              </HandRolled>
            </div>
          </>
        }
        do={
          <>
            <div className="flex items-center gap-2">
              <Badge color="danger">Offline</Badge>
              <Badge color="success">Healthy</Badge>
              <Chip selected>Offline only</Chip>
            </div>
          </>
        }
      />
    </GuidanceStory>
  ),
};
