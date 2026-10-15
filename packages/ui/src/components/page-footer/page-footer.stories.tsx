import type { Meta, StoryObj } from "@storybook/react";
import { PageFooter } from "./page-footer";
import { PageHeader } from "../page-header/page-header";
import { Button } from "../button/button";
import { Field, FieldControl, FieldLabel } from "../field/field";
import { Input } from "../input/input";

import guidance from "./guidance.json";
import { Guidance, GuidanceStory, pairOf } from "@/stories/guidance";

const meta: Meta<typeof PageFooter> = {
  title: "Components/Page footer",
  component: PageFooter,
  parameters: {
    layout: "fullscreen",
    controls: { disable: true },
    docs: {
      description: {
        component:
          "The actions that finish a page, under a rule at the end of it — " +
          "PageHeader's other end. It ends where the content column ends, " +
          "which on a form page is the reading width (768), so the submit " +
          "stays a bounded distance from the last field however wide the " +
          "monitor is.",
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof PageFooter>;

const pair = pairOf(guidance);

/* A form page's content column: padding on the parent, the column capped at
   the reading width and left-aligned, exactly as AppShellContent
   width="reading" builds it. */
const FormPage = ({ children }: { children: React.ReactNode }) => (
  <div className="bg-surface-app p-gutter">
    <div className="@container flex max-w-content-reading flex-col gap-gutter">
      {children}
    </div>
  </div>
);

export const Default: Story = {
  name: "A form page",
  render: () => (
    <FormPage>
      <PageHeader
        title="Notification settings"
        description="Alerts go to the people and channels below when an endpoint crosses a threshold."
      />
      <Field>
        <FieldLabel>Alert email</FieldLabel>
        <FieldControl>
          <Input type="email" defaultValue="noc@example.com" />
        </FieldControl>
      </Field>
      <Field>
        <FieldLabel>Webhook URL</FieldLabel>
        <FieldControl>
          <Input defaultValue="https://hooks.example.com/clarion/alerts" />
        </FieldControl>
      </Field>
      <PageFooter>
        <Button variant="outline">Cancel</Button>
        <Button>Save changes</Button>
      </PageFooter>
    </FormPage>
  ),
};

/**
 * 328 — a 360 phone minus its gutters. Two buttons still fit side by side at
 * this width; the row wraps rather than overflowing if a third arrives or a
 * label is long, and the primary stays last wherever it lands.
 */
export const Narrow: Story = {
  render: () => (
    <div className="w-82 border border-line-neutral-muted p-4">
      <PageFooter>
        <Button variant="outline">Cancel</Button>
        <Button>Create tenant</Button>
      </PageFooter>
    </div>
  ),
};

export const DoAndDont: Story = {
  name: "Do and don't",
  render: () => (
    <GuidanceStory>
      <Guidance
        pair={pair("primary-last")}
        width="wide"
        dont={
          <div className="flex-1">
            <PageFooter>
              <Button>Save changes</Button>
              <Button variant="outline">Cancel</Button>
            </PageFooter>
          </div>
        }
        do={
          <div className="flex-1">
            <PageFooter>
              <Button variant="outline">Cancel</Button>
              <Button>Save changes</Button>
            </PageFooter>
          </div>
        }
      />

      <Guidance
        pair={pair("never-a-ghost")}
        width="wide"
        dont={
          <div className="flex-1">
            <PageFooter>
              <Button variant="ghost">Cancel</Button>
              <Button>Save changes</Button>
            </PageFooter>
          </div>
        }
        do={
          <div className="flex-1">
            <PageFooter>
              <Button variant="outline">Cancel</Button>
              <Button>Save changes</Button>
            </PageFooter>
          </div>
        }
      />
    </GuidanceStory>
  ),
};
