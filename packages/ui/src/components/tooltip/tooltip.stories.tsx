import type { Meta, StoryObj } from "@storybook/react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";
import { Button } from "../button/button";
import guidance from "./guidance.json";
import { Guidance, GuidanceStory, pairOf } from "@/stories/guidance";
import { Info } from "lucide-react";
import {
  Field,
  FieldControl,
  FieldDescription,
  FieldLabel,
} from "../field/field";
import { Input } from "../input/input";

const meta: Meta<typeof Tooltip> = {
  title: "Components/Tooltip",
  component: Tooltip,
  parameters: {
    docs: {
      description: {
        component:
          "A short explanation attached to a control. It describes — it never " +
          "names a control, and it never holds anything the person needs to " +
          "finish the task.",
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof Tooltip>;

export const Default: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline">Threshold</Button>
      </TooltipTrigger>
      <TooltipContent>
        Alerts fire when the value goes above this.
      </TooltipContent>
    </Tooltip>
  ),
};

/** Opens on focus too, so it is not a mouse-only feature. */
export const KeyboardReachable: Story = {
  name: "Keyboard reachable",
  render: () => (
    <div className="flex gap-3">
      <Button variant="outline">Tab from here</Button>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">…to here</Button>
        </TooltipTrigger>
        <TooltipContent>Focus opens it with no delay.</TooltipContent>
      </Tooltip>
    </div>
  ),
};

export const Sides: Story = {
  render: () => (
    <TooltipProvider>
      <div className="flex gap-3">
        {(["top", "right", "bottom", "left"] as const).map((side) => (
          <Tooltip key={side} open>
            <TooltipTrigger asChild>
              <Button variant="outline">{side}</Button>
            </TooltipTrigger>
            <TooltipContent side={side}>On the {side}.</TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  ),
  decorators: [(S) => <div className="py-16">{S()}</div>],
};

/** Several triggers share one provider, so the delay only applies to the first. */
export const SharedProvider: Story = {
  name: "Shared provider",
  render: () => (
    <TooltipProvider delayDuration={300}>
      <div className="flex gap-2">
        {["Copy", "Duplicate", "Archive"].map((label) => (
          <Tooltip key={label}>
            <TooltipTrigger asChild>
              <Button variant="ghost">{label}</Button>
            </TooltipTrigger>
            <TooltipContent>{label} this dashboard.</TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  ),
};

const pair = pairOf(guidance);

export const DoAndDont: Story = {
  name: "Do and Don't",
  parameters: { controls: { disable: true } },
  render: () => (
    <GuidanceStory>
      <Guidance
        pair={pair("never-the-only-copy")}
        width="wide"
        stage="tall"
        dont={
          <div className="w-full">
            <Field>
              <FieldLabel>
                Collector port
                <Info
                  aria-hidden
                  className="size-4 text-content-neutral-muted"
                />
              </FieldLabel>
              <FieldControl>
                <Input defaultValue="8086" />
              </FieldControl>
            </Field>
          </div>
        }
        do={
          <div className="w-full">
            <Field>
              <FieldLabel>Collector port</FieldLabel>
              <FieldControl>
                <Input defaultValue="8086" />
              </FieldControl>
              <FieldDescription>
                Must match the port the collector listens on.
              </FieldDescription>
            </Field>
          </div>
        }
      />
    </GuidanceStory>
  ),
};
