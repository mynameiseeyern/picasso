import type { Meta, StoryObj } from "@storybook/react";
import { Activity, Bell, Settings } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";

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
    variant: { control: "inline-radio", options: ["underline", "gray", "brand", "border", "minimal"] },
    size: { control: "inline-radio", options: ["sm", "md"] },
    fullWidth: { control: "boolean" },
  },
  args: { variant: "underline", size: "md", fullWidth: false },
};
export default meta;
type Story = StoryObj<typeof Tabs>;

const PANELS = [
  { value: "overview", label: "Overview", body: "Everything about this endpoint at a glance." },
  { value: "trunks", label: "Trunks", body: "12 trunks, 2 degraded." },
  { value: "alerts", label: "Alerts", body: "No alerts in the last 24 hours." },
];

export const Default: Story = {
  render: (args) => (
    <Tabs defaultValue="overview" {...args}>
      <TabsList>
        {PANELS.map((p) => (
          <TabsTrigger key={p.value} value={p.value}>{p.label}</TabsTrigger>
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
      {(["underline", "gray", "brand", "border", "minimal"] as const).map((v) => (
        <div key={v} className="flex flex-col gap-2">
          <span className="text-label-sm text-content-neutral-subtle">{v}</span>
          <Tabs defaultValue="overview" variant={v}>
            <TabsList>
              {PANELS.map((p) => (
                <TabsTrigger key={p.value} value={p.value}>{p.label}</TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      ))}
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
              <TabsTrigger key={p.value} value={p.value}>{p.label}</TabsTrigger>
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
        <p className="text-body-md text-content-neutral-muted">General settings.</p>
      </TabsContent>
      <TabsContent value="trunks">
        <p className="text-body-md text-content-neutral-muted">Trunk configuration.</p>
      </TabsContent>
      <TabsContent value="alerts">
        <p className="text-body-md text-content-neutral-muted">Alerting rules.</p>
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
        <TabsTrigger value="overview"><Activity className="size-4" aria-hidden />Overview</TabsTrigger>
        <TabsTrigger value="alerts"><Bell className="size-4" aria-hidden />Alerts</TabsTrigger>
        <TabsTrigger value="settings"><Settings className="size-4" aria-hidden />Settings</TabsTrigger>
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
            <TabsTrigger key={p.value} value={p.value}>{p.label}</TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  ),
};
