import type { Meta, StoryObj } from "@storybook/react";
import { Calendar, Search } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupCheck,
  InputGroupInput,
  InputGroupSpinner,
  InputGroupText,
  InputGroupTooltip,
} from "./input-group";
import { Button } from "../button/button";
import guidance from "./guidance.json";
import { Guidance, GuidanceStory, pairOf } from "@/stories/guidance";

const meta: Meta<typeof InputGroup> = {
  title: "Components/InputGroup",
  component: InputGroup,
  parameters: {
    docs: {
      description: {
        component:
          "An input with things beside it. The group draws the box so the " +
          "focus ring surrounds the addons too, and state is read off the " +
          "input rather than passed to the group.",
      },
    },
  },
  argTypes: { size: { control: "inline-radio", options: ["sm", "md"] } },
  args: { size: "md" },
  decorators: [(S) => <div className="w-80">{S()}</div>],
};
export default meta;
type Story = StoryObj<typeof InputGroup>;

export const Default: Story = {
  render: (args) => (
    <InputGroup {...args}>
      <InputGroupAddon>
        <Search />
      </InputGroupAddon>
      <InputGroupInput aria-label="Search" placeholder="Search endpoints" />
    </InputGroup>
  ),
};

/** A unit belongs beside the value, not in the placeholder where it vanishes. */
export const UnitsAndPrefixes: Story = {
  name: "Units and prefixes",
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-3">
      <InputGroup>
        <InputGroupAddon>
          <InputGroupText>https://</InputGroupText>
        </InputGroupAddon>
        <InputGroupInput aria-label="Host" defaultValue="ir.com" />
      </InputGroup>
      <InputGroup>
        <InputGroupInput aria-label="Threshold" defaultValue="250" />
        <InputGroupAddon align="end">
          <InputGroupText>ms</InputGroupText>
        </InputGroupAddon>
      </InputGroup>
    </div>
  ),
};

/** Working, then settled. Both are announced; neither takes focus. */
export const Feedback: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-3">
      <InputGroup>
        <InputGroupInput aria-label="Host" defaultValue="probe-04.ir.com" />
        <InputGroupAddon align="end">
          <InputGroupSpinner label="Checking host" />
        </InputGroupAddon>
      </InputGroup>
      <InputGroup>
        <InputGroupInput aria-label="Host" defaultValue="probe-04.ir.com" />
        <InputGroupAddon align="end">
          <InputGroupCheck label="Host is reachable" />
        </InputGroupAddon>
      </InputGroup>
    </div>
  ),
};

/** The explanation is a button, so a keyboard can reach it. */
export const WithATooltip: Story = {
  name: "With a tooltip",
  parameters: { controls: { disable: true } },
  render: () => (
    <InputGroup>
      <InputGroupInput aria-label="Threshold" defaultValue="250" />
      <InputGroupAddon align="end">
        <InputGroupText>ms</InputGroupText>
        <InputGroupTooltip label="About the threshold">
          Alerts fire when response time stays above this for a full minute.
        </InputGroupTooltip>
      </InputGroupAddon>
    </InputGroup>
  ),
};

export const WithAButton: Story = {
  name: "With a button",
  parameters: { controls: { disable: true } },
  render: () => (
    <InputGroup>
      <InputGroupAddon>
        <Calendar />
      </InputGroupAddon>
      <InputGroupInput aria-label="Range" defaultValue="Last 7 days" />
      <InputGroupAddon align="end">
        <Button size="sm" variant="ghost">
          Change
        </Button>
      </InputGroupAddon>
    </InputGroup>
  ),
};

/** State is set on the input; the group follows. */
export const States: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-3">
      <InputGroup>
        <InputGroupAddon>
          <Search />
        </InputGroupAddon>
        <InputGroupInput
          aria-label="Invalid"
          aria-invalid
          defaultValue="not a host"
        />
      </InputGroup>
      <InputGroup>
        <InputGroupAddon>
          <Search />
        </InputGroupAddon>
        <InputGroupInput aria-label="Disabled" disabled defaultValue="locked" />
      </InputGroup>
    </div>
  ),
};

export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-3">
      {(["md", "sm"] as const).map((s) => (
        <InputGroup key={s} size={s}>
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
          <InputGroupInput aria-label={s} placeholder={`Size ${s}`} />
        </InputGroup>
      ))}
    </div>
  ),
};

const pair = pairOf(guidance);

export const DoAndDont: Story = {
  name: "Do and Don't",
  parameters: { controls: { disable: true } },
  render: () => (
    <GuidanceStory>
      <Guidance
        pair={pair("units-are-not-placeholders")}
        width="wide"
        dont={
          <InputGroup>
            <InputGroupInput placeholder="Threshold in ms" />
          </InputGroup>
        }
        do={
          <InputGroup>
            <InputGroupInput defaultValue="250" />
            <InputGroupAddon align="end">
              <InputGroupText>ms</InputGroupText>
            </InputGroupAddon>
          </InputGroup>
        }
      />

      <Guidance
        pair={pair("one-job-per-side")}
        width="wide"
        dont={
          <InputGroup>
            <InputGroupInput defaultValue="250" />
            <InputGroupAddon align="end">
              <InputGroupText>ms</InputGroupText>
              <InputGroupSpinner />
              <Button size="xs" variant="ghost">
                Reset
              </Button>
              <Button size="xs" variant="ghost">
                Apply
              </Button>
            </InputGroupAddon>
          </InputGroup>
        }
        do={
          <InputGroup>
            <InputGroupInput defaultValue="250" />
            <InputGroupAddon align="end">
              <InputGroupText>ms</InputGroupText>
            </InputGroupAddon>
          </InputGroup>
        }
      />
    </GuidanceStory>
  ),
};
