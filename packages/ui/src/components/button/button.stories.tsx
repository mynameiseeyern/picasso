import type { Meta, StoryObj } from "@storybook/react";
import { Download, Plus, Trash2 } from "lucide-react";
import { Button } from "./button";

const variants = ["default", "neutral", "secondary", "outline", "ghost", "destructive", "link"] as const;
const textSizes = ["xs", "sm", "md", "lg"] as const;
const iconSizes = ["icon-xs", "icon-sm", "icon-md", "icon-lg"] as const;

const meta: Meta<typeof Button> = {
  title: "Components/Button",
  component: Button,
  parameters: {
    docs: {
      description: {
        component:
          "Triggers an action. Structure (variants, sizes, states) comes from the Figma " +
          "component; measurements (height, padding, gap, radius) come from shadcn.",
      },
    },
  },
  argTypes: {
    variant: { control: "select", options: variants },
    size: { control: "select", options: [...textSizes, ...iconSizes] },
    loading: { control: "boolean" },
    disabled: { control: "boolean" },
  },
  args: { children: "Save changes", variant: "default", size: "md" },
};
export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {};

export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      {variants.map((v) => (
        <Button key={v} variant={v}>
          {v}
        </Button>
      ))}
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        {textSizes.map((s) => (
          <Button key={s} size={s}>
            {s}
          </Button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        {textSizes.map((s) => (
          <Button key={s} size={s}>
            <Download />
            {s}
          </Button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        {iconSizes.map((s) => (
          <Button key={s} size={s} aria-label={`Add (${s})`}>
            <Plus />
          </Button>
        ))}
      </div>
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div className="space-y-3">
      {variants.map((v) => (
        <div key={v} className="flex flex-wrap items-center gap-3">
          <Button variant={v}>Default</Button>
          <Button variant={v} loading>
            Loading
          </Button>
          <Button variant={v} disabled>
            Disabled
          </Button>
        </div>
      ))}
    </div>
  ),
};

/* ------------------------------------------------------------------ */
/* Guidance — rendered, so it breaks when the component does           */
/* ------------------------------------------------------------------ */

function Guidance({
  variant,
  caption,
  children,
}: {
  variant: "do" | "dont";
  caption: string;
  children: React.ReactNode;
}) {
  const isDo = variant === "do";
  return (
    <figure
      className={
        "m-0 flex-1 min-w-64 rounded-md border-2 p-4 " +
        (isDo ? "border-line-success-emphasis" : "border-line-danger-emphasis")
      }
    >
      <div className="flex min-h-16 items-center gap-3">{children}</div>
      <figcaption className="mt-4 text-label-sm">
        <span className={isDo ? "text-content-success-emphasis" : "text-content-danger-emphasis"}>
          {isDo ? "✓ Do" : "✗ Don't"}
        </span>
        <span className="text-content-neutral-muted"> — {caption}</span>
      </figcaption>
    </figure>
  );
}

const Pair = ({ children }: { children: React.ReactNode }) => (
  <div className="flex flex-wrap gap-4">{children}</div>
);

export const DoAndDont: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="space-y-8">
      <Pair>
        <Guidance variant="dont" caption="“Submit” names the mechanism, not the outcome.">
          <Button>Submit</Button>
          <Button variant="secondary">Cancel</Button>
        </Guidance>
        <Guidance variant="do" caption="Verb first, naming what happens.">
          <Button>Save changes</Button>
          <Button variant="secondary">Cancel</Button>
        </Guidance>
      </Pair>

      <Pair>
        <Guidance
          variant="dont"
          caption="Two primaries in one row — nothing is the obvious next step."
        >
          <Button>Save changes</Button>
          <Button>Export CSV</Button>
        </Guidance>
        <Guidance variant="do" caption="One primary; everything else recedes.">
          <Button>Save changes</Button>
          <Button variant="ghost">Export CSV</Button>
        </Guidance>
      </Pair>

      <Pair>
        <Guidance
          variant="dont"
          caption="Ghost with a resting fill reads as Outline — the hierarchy collapses."
        >
          <Button variant="outline">Filter</Button>
          <Button variant="outline">Sort</Button>
          <Button variant="outline">Group</Button>
        </Guidance>
        <Guidance variant="do" caption="Ghost stays transparent until hover.">
          <Button variant="ghost">Filter</Button>
          <Button variant="ghost">Sort</Button>
          <Button variant="ghost">Group</Button>
        </Guidance>
      </Pair>

      <Pair>
        <Guidance variant="dont" caption="Icon-only with no accessible name announces nothing.">
          <Button size="icon-md">
            <Trash2 />
          </Button>
        </Guidance>
        <Guidance variant="do" caption="aria-label on every icon-* size.">
          <Button size="icon-md" aria-label="Delete probe">
            <Trash2 />
          </Button>
        </Guidance>
      </Pair>
    </div>
  ),
};
