import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { MoreHorizontal } from "lucide-react";
import { Button } from "../button/button";
import { Field, FieldLabel } from "../field/field";
import { Input } from "../input/input";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardHeaderText,
  CardTitle,
} from "./card";

import guidance from "./guidance.json";
import { Guidance, GuidanceStory, pairOf } from "@/stories/guidance";

const meta: Meta<typeof Card> = {
  title: "Components/Card",
  component: Card,
  parameters: {
    docs: {
      description: {
        component:
          "A surface that holds one thing. The border and the lift are a " +
          "claim that everything inside belongs together — so a card with " +
          "nothing to unify is just a box, and a nested card says it twice.",
      },
    },
  },
  argTypes: { size: { control: "inline-radio", options: ["default", "sm"] } },
};
const pair = pairOf(guidance);

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  render: (args) => (
    <div className="w-96">
      <Card {...args}>
        <CardHeader>
          <CardHeaderText>
            <CardTitle>Sydney-01</CardTitle>
            <CardDescription>Probe reporting normally</CardDescription>
          </CardHeaderText>
          <CardAction>
            <Button variant="ghost" size="icon-sm" aria-label="Probe options">
              <MoreHorizontal />
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <p className="text-body-md text-content-neutral-emphasis">
            Last call recorded 14 seconds ago. Disk at 38% of its allocation.
          </p>
        </CardContent>
        <CardFooter>
          <Button variant="outline" size="sm">
            View calls
          </Button>
          <Button size="sm">Open probe</Button>
        </CardFooter>
      </Card>
    </div>
  ),
};

/** Every measurement halves; the type does not. */
export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex w-96 flex-col gap-6">
      {(["default", "sm"] as const).map((size) => (
        <Card key={size} size={size}>
          <CardHeader>
            <CardHeaderText>
              <CardTitle>Sydney-01</CardTitle>
              <CardDescription>size={size}</CardDescription>
            </CardHeaderText>
          </CardHeader>
          <CardContent>
            <p className="text-body-md text-content-neutral-emphasis">
              Padding is 24 at default and 16 at sm.
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  ),
};

/** A card is allowed to be just content. Each section brings its own padding. */
export const Sections: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-wrap gap-6 [&>*]:w-64">
      <Card>
        <CardContent>
          <p className="text-body-md text-content-neutral-emphasis">
            Content only.
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardHeaderText>
            <CardTitle>Header only</CardTitle>
            <CardDescription>No content, still padded.</CardDescription>
          </CardHeaderText>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardHeaderText>
            <CardTitle>Header and footer</CardTitle>
          </CardHeaderText>
        </CardHeader>
        <CardFooter>
          <Button size="sm" variant="outline">
            Dismiss
          </Button>
        </CardFooter>
      </Card>
    </div>
  ),
};

/** The card as a form container — Figma's `Login` content and footer. */
export const AsAForm: Story = {
  name: "As a form",
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="w-96">
      <Card>
        <CardHeader>
          <CardHeaderText>
            <CardTitle>Sign in</CardTitle>
            <CardDescription>
              Use your Integrated Research account.
            </CardDescription>
          </CardHeaderText>
        </CardHeader>
        <CardContent>
          <Field>
            <FieldLabel required>Email</FieldLabel>
            <Input type="email" placeholder="you@ir.com" />
          </Field>
          <Field>
            <FieldLabel required>Password</FieldLabel>
            <Input type="password" />
          </Field>
        </CardContent>
        <CardFooter>
          <Button>Sign in</Button>
        </CardFooter>
      </Card>
    </div>
  ),
};

/* ------------------------------------------------------------------ */

const Line = ({ children }: { children: React.ReactNode }) => (
  <p className="text-body-md text-content-neutral-emphasis">{children}</p>
);

export const DoAndDont: Story = {
  name: "Do and Don't",
  parameters: { controls: { disable: true } },
  render: () => (
    <GuidanceStory>
      <Guidance
        pair={pair("no-nesting")}
        width="wide"
        stage="tall"
        dont={
          <Card>
            <CardContent>
              <Card size="sm">
                <CardContent>
                  <Line>Nested</Line>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        }
        do={
          <Card>
            <CardContent>
              <Line>First section</Line>
              <hr className="border-line-neutral-muted" />
              <Line>Second section</Line>
            </CardContent>
          </Card>
        }
      />

      <Guidance
        pair={pair("one-thing-per-card")}
        width="wide"
        stage="tall"
        dont={
          <Card>
            <CardContent>
              <Line>Probe health</Line>
              <Line>Billing contact</Line>
              <Line>Release notes</Line>
            </CardContent>
          </Card>
        }
        do={
          <div className="flex flex-col gap-2">
            <Card size="sm">
              <CardContent>
                <Line>Probe health</Line>
              </CardContent>
            </Card>
            <Card size="sm">
              <CardContent>
                <Line>Billing contact</Line>
              </CardContent>
            </Card>
          </div>
        }
      />

      <Guidance
        pair={pair("actions-belong-together")}
        width="wide"
        stage="tall"
        dont={
          <Card size="sm">
            <CardHeader>
              <CardHeaderText>
                <CardTitle>Sydney-01</CardTitle>
              </CardHeaderText>
              <CardAction>
                <Button size="xs" variant="ghost">
                  Edit
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent>
              <Line>Reporting normally.</Line>
              <div className="flex gap-2">
                <Button size="xs" variant="outline">
                  Restart
                </Button>
                <Button size="xs" variant="outline">
                  Logs
                </Button>
              </div>
            </CardContent>
            <CardFooter>
              <Button size="xs">Open</Button>
            </CardFooter>
          </Card>
        }
        do={
          <Card size="sm">
            <CardHeader>
              <CardHeaderText>
                <CardTitle>Sydney-01</CardTitle>
              </CardHeaderText>
              <CardAction>
                <Button
                  size="icon-sm"
                  variant="ghost"
                  aria-label="Probe options"
                >
                  <MoreHorizontal />
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent>
              <Line>Reporting normally.</Line>
            </CardContent>
            <CardFooter>
              <Button size="xs" variant="outline">
                Logs
              </Button>
              <Button size="xs">Open probe</Button>
            </CardFooter>
          </Card>
        }
      />

      <Guidance
        pair={pair("primary-with-outline")}
        width="wide"
        dont={
          <Card size="sm">
            <CardHeader>
              <CardHeaderText>
                <CardTitle>Sydney-01</CardTitle>
              </CardHeaderText>
            </CardHeader>
            <CardFooter>
              <Button size="sm" variant="secondary">
                Logs
              </Button>
              <Button size="sm">Open probe</Button>
            </CardFooter>
          </Card>
        }
        do={
          <Card size="sm">
            <CardHeader>
              <CardHeaderText>
                <CardTitle>Sydney-01</CardTitle>
              </CardHeaderText>
            </CardHeader>
            <CardFooter>
              <Button size="sm" variant="outline">
                Logs
              </Button>
              <Button size="sm">Open probe</Button>
            </CardFooter>
          </Card>
        }
      />
    </GuidanceStory>
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
    <div className="w-82">
      <Card>
        <CardHeader>
          <CardHeaderText>
            <CardTitle>Sign in</CardTitle>
            <CardDescription>
              Use your Integrated Research account.
            </CardDescription>
          </CardHeaderText>
        </CardHeader>
        <CardContent>
          <Field>
            <FieldLabel required>Email</FieldLabel>
            <Input type="email" placeholder="you@ir.com" />
          </Field>
          <Field>
            <FieldLabel required>Password</FieldLabel>
            <Input type="password" />
          </Field>
        </CardContent>
        <CardFooter>
          <Button>Sign in</Button>
        </CardFooter>
      </Card>
    </div>
  ),
};
