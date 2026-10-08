import type { Meta, StoryObj } from "@storybook/react";
import { Activity, Bell, Settings } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";
import guidance from "./guidance.json";
import { Guidance, GuidanceStory, pairOf } from "@/stories/guidance";

const meta: Meta<typeof Tabs> = {
  title: "Components/Tabs",
  component: Tabs,
  parameters: {
    docs: {
      description: {
        component:
          "Switch between sibling views of the same object. Underline for " +
          "page sections, Minimal inside a card or drawer, and Brand, Gray " +
          "and Border as segmented controls for compact toggles.",
      },
    },
  },
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["underline", "gray", "brand", "border", "minimal"],
    },
    size: { control: "inline-radio", options: ["sm", "md"] },
    fullWidth: { control: "boolean" },
  },
  args: { variant: "underline", size: "md", fullWidth: false },
};
export default meta;
type Story = StoryObj<typeof Tabs>;

const PANELS = [
  {
    value: "overview",
    label: "Overview",
    body: "Everything about this endpoint at a glance.",
  },
  { value: "trunks", label: "Trunks", body: "12 trunks, 2 degraded." },
  { value: "alerts", label: "Alerts", body: "No alerts in the last 24 hours." },
];

export const Default: Story = {
  render: (args) => (
    <Tabs defaultValue="overview" {...args}>
      <TabsList>
        {PANELS.map((p) => (
          <TabsTrigger key={p.value} value={p.value}>
            {p.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {PANELS.map((p) => (
        <TabsContent key={p.value} value={p.value}>
          <p className="text-body-md text-content-neutral-muted">{p.body}</p>
        </TabsContent>
      ))}
    </Tabs>
  ),
};

/** Each type has a place: structure, tray, or compact toggle. */
export const Types: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-8">
      {(["underline", "gray", "brand", "border", "minimal"] as const).map(
        (v) => (
          <div key={v} className="flex flex-col gap-2">
            <span className="text-label-sm text-content-neutral-subtle">
              {v}
            </span>
            <Tabs defaultValue="overview" variant={v}>
              <TabsList>
                {PANELS.map((p) => (
                  <TabsTrigger key={p.value} value={p.value}>
                    {p.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        ),
      )}
    </div>
  ),
};

export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-8">
      {(["md", "sm"] as const).map((s) => (
        <Tabs key={s} defaultValue="overview" variant="gray" size={s}>
          <TabsList>
            {PANELS.map((p) => (
              <TabsTrigger key={p.value} value={p.value}>
                {p.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      ))}
    </div>
  ),
};

/** Past about six sections, or with long labels, go vertical. */
export const Vertical: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Tabs defaultValue="overview" variant="line" orientation="vertical">
      <TabsList>
        <TabsTrigger value="overview">General</TabsTrigger>
        <TabsTrigger value="trunks">Trunks and gateways</TabsTrigger>
        <TabsTrigger value="alerts">Alerting rules</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        <p className="text-body-md text-content-neutral-muted">
          General settings.
        </p>
      </TabsContent>
      <TabsContent value="trunks">
        <p className="text-body-md text-content-neutral-muted">
          Trunk configuration.
        </p>
      </TabsContent>
      <TabsContent value="alerts">
        <p className="text-body-md text-content-neutral-muted">
          Alerting rules.
        </p>
      </TabsContent>
    </Tabs>
  ),
};

export const WithIcons: Story = {
  name: "With icons",
  parameters: { controls: { disable: true } },
  render: () => (
    <Tabs defaultValue="overview" variant="minimal">
      <TabsList>
        <TabsTrigger value="overview">
          <Activity className="size-4" aria-hidden />
          Overview
        </TabsTrigger>
        <TabsTrigger value="alerts">
          <Bell className="size-4" aria-hidden />
          Alerts
        </TabsTrigger>
        <TabsTrigger value="settings">
          <Settings className="size-4" aria-hidden />
          Settings
        </TabsTrigger>
      </TabsList>
    </Tabs>
  ),
};

/** Stretched to fill the row. */
export const FullWidth: Story = {
  name: "Full width",
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="w-144 max-w-full">
      <Tabs defaultValue="overview" fullWidth>
        <TabsList>
          {PANELS.map((p) => (
            <TabsTrigger key={p.value} value={p.value}>
              {p.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  ),
};

const pair = pairOf(guidance);

const LONG = [
  "Overview",
  "Trunks and gateways",
  "Alert rules",
  "Retention policy",
  "Collector health",
  "Scheduled reports",
  "Access and roles",
  "Billing history",
  "Audit log",
];

/**
 * Narrow — 328, a 360 phone minus its gutters. Four tabs is where the labels
 * stop fitting. `fullWidth` divides the room evenly rather than letting the
 * longest label take it all.
 */
export const Narrow: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex w-82 flex-col gap-4 border border-line-neutral-muted p-3">
      <Tabs defaultValue="overview" fullWidth>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <p className="pt-3 text-body-sm text-content-neutral-muted">
            Packet loss, jitter and MOS for the last 24 hours.
          </p>
        </TabsContent>
        <TabsContent value="alerts" />
        <TabsContent value="settings" />
      </Tabs>
    </div>
  ),
};

export const DoAndDont: Story = {
  name: "Do and Don't",
  parameters: { controls: { disable: true } },
  render: () => (
    <GuidanceStory>
      <Guidance
        pair={pair("go-vertical-when-long")}
        width="wide"
        stage="tall"
        dont={
          <div className="w-full">
            <Tabs defaultValue={LONG[0]}>
              <TabsList>
                {LONG.map((l) => (
                  <TabsTrigger key={l} value={l}>
                    {l}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        }
        do={
          <div className="w-full">
            <Tabs defaultValue={LONG[0]}>
              <TabsList>
                {LONG.slice(0, 4).map((l) => (
                  <TabsTrigger key={l} value={l}>
                    {l}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        }
      />
    </GuidanceStory>
  ),
};
