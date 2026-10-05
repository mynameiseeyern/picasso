import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  Activity,
  Bell,
  ChevronRight,
  Gauge,
  Plus,
  Server,
  CircleHelp,
  Moon,
  Settings,
} from "lucide-react";
import { Switch } from "../switch/switch";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupLabel,
  SidebarBrand,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuLabel,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarTrigger,
} from "./sidebar";
import clarionBrand from "../../brand-assets/Clarion.svg";
import consoleBrand from "../../brand-assets/Console.svg";

const meta: Meta<typeof SidebarProvider> = {
  title: "Components/Sidebar",
  component: SidebarProvider,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "The app's primary navigation rail. Figma draws 56 button variants " +
          "across Type × State × Collapsed; six of the seven Types differ " +
          "only in which children they hold, so those are compositions and " +
          "only Big Icon became a size.",
      },
    },
  },
  argTypes: { defaultCollapsed: { control: "boolean" } },
  args: { defaultCollapsed: false },
};
export default meta;
type Story = StoryObj<typeof SidebarProvider>;

const NAV = [
  { icon: Gauge, label: "Overview" },
  {
    icon: Server,
    label: "Endpoints",
    badge: "23",
    subs: ["Sydney", "Melbourne", "Perth"],
  },
  { icon: Activity, label: "Metrics" },
  { icon: Bell, label: "Alerts", badge: "4" },
];

function Shell({ defaultCollapsed }: { defaultCollapsed?: boolean }) {
  const [active, setActive] = React.useState("Endpoints");
  const [open, setOpen] = React.useState(true);
  return (
    <div className="h-120">
      <SidebarProvider defaultCollapsed={defaultCollapsed}>
        <Sidebar>
          <SidebarHeader>
            <SidebarTrigger />
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>
                Monitoring
                <SidebarGroupAction aria-label="Add endpoint">
                  <Plus aria-hidden />
                </SidebarGroupAction>
              </SidebarGroupLabel>
              <SidebarMenu>
                {NAV.map((item) => (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton
                      active={active === item.label}
                      onClick={() => {
                        setActive(item.label);
                        if (item.subs) setOpen((o) => !o);
                      }}
                    >
                      <item.icon aria-hidden />
                      <SidebarMenuLabel>{item.label}</SidebarMenuLabel>
                      {item.badge ? (
                        <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
                      ) : null}
                      {item.subs ? <ChevronRight aria-hidden /> : null}
                    </SidebarMenuButton>
                    {item.subs && open ? (
                      <SidebarMenuSub variant="border">
                        {item.subs.map((s) => (
                          <SidebarMenuSubItem key={s}>
                            <SidebarMenuSubButton active={s === "Sydney"}>
                              {s}
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    ) : null}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Settings aria-hidden />
                  <SidebarMenuLabel>Settings</SidebarMenuLabel>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <div className="p-6 text-body-md text-content-neutral-muted">
            {active}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}

export const Default: Story = {
  render: (args) => <Shell defaultCollapsed={args.defaultCollapsed} />,
};

/** Collapsed — an icon rail. A fine option, a poor default. */
export const Collapsed: Story = {
  parameters: { controls: { disable: true } },
  render: () => <Shell defaultCollapsed />,
};

/** The three submenu treatments the file draws. */
export const SubmenuVariants: Story = {
  name: "Submenu variants",
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="h-96">
      <SidebarProvider>
        <Sidebar>
          <SidebarContent>
            {(["default", "indent", "border"] as const).map((variant) => (
              <SidebarGroup key={variant}>
                <SidebarGroupLabel>{variant}</SidebarGroupLabel>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton active>
                      <Server aria-hidden />
                      <SidebarMenuLabel>Endpoints</SidebarMenuLabel>
                    </SidebarMenuButton>
                    <SidebarMenuSub variant={variant}>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton>Sydney</SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton>Melbourne</SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroup>
            ))}
          </SidebarContent>
        </Sidebar>
        <SidebarInset />
      </SidebarProvider>
    </div>
  ),
};

function BrandRail({
  caption,
  children,
  collapsed,
}: {
  caption: string;
  children: React.ReactNode;
  collapsed?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-label-sm text-content-neutral-muted">{caption}</p>
      <div className="h-80">
        <SidebarProvider defaultCollapsed={collapsed}>
          <Sidebar>
            <SidebarHeader variant="brand">{children}</SidebarHeader>
            <SidebarContent>
              <SidebarGroup>
                <SidebarMenu>
                  {NAV.slice(0, 3).map((item, i) => (
                    <SidebarMenuItem key={item.label}>
                      <SidebarMenuButton active={i === 1}>
                        <item.icon aria-hidden />
                        <SidebarMenuLabel>{item.label}</SidebarMenuLabel>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <Settings aria-hidden />
                    <SidebarMenuLabel>Settings</SidebarMenuLabel>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarFooter>
          </Sidebar>
        </SidebarProvider>
      </div>
    </div>
  );
}

export const BrandHeader: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "The brand bleeds to three edges, so the header drops its padding " +
          "rather than a product cancelling it from outside. Without an image " +
          "it paints the rail's own surface — a brand with no artwork yet " +
          "reads as a quiet header, not an empty coloured box.",
      },
    },
  },
  render: () => (
    <div className="flex flex-wrap gap-6 p-6">
      <BrandRail caption="Lockup over a second line">
        <SidebarBrand image={clarionBrand} subtitle="powered by Iris" mark="C">
          CLARION
        </SidebarBrand>
      </BrandRail>
      <BrandRail caption="One word">
        <SidebarBrand image={consoleBrand} mark="I">
          Iris
        </SidebarBrand>
      </BrandRail>
      <BrandRail caption="No image — the neutral default">
        <SidebarBrand subtitle="powered by Iris" mark="V">
          Vantage
        </SidebarBrand>
      </BrandRail>
      <BrandRail caption="Collapsed to 48" collapsed>
        <SidebarBrand image={clarionBrand} subtitle="powered by Iris" mark="C">
          CLARION
        </SidebarBrand>
      </BrandRail>
    </div>
  ),
};

/**
 * Phones (below md): `mobile="drawer"` takes the rail off the page and the
 * trigger opens the same tree over it, as a panel from the inline start with a
 * strip of scrim left at the end — tap the strip to leave. Close on the brand,
 * 44-tall items, picking one closes it. Help and theme live in its footer, so
 * the top bar keeps only the trigger, the breadcrumb and the account.
 * Switch the viewport to a phone to try it.
 */
export const PhoneNav: Story = {
  parameters: {
    viewport: { defaultViewport: "mobile1" },
    layout: "fullscreen",
  },
  render: () => {
    const [active, setActive] = React.useState("Endpoints");
    return (
      <div className="h-svh">
        <SidebarProvider>
          <Sidebar mobile="drawer">
            <SidebarHeader variant="brand">
              <SidebarBrand
                image={clarionBrand}
                subtitle="powered by Iris"
                mark="C"
              >
                CLARION
              </SidebarBrand>
            </SidebarHeader>
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel>Workspace</SidebarGroupLabel>
                <SidebarMenu>
                  {NAV.slice(0, 3).map((item) => (
                    <SidebarMenuItem key={item.label}>
                      <SidebarMenuButton
                        active={active === item.label}
                        onClick={() => setActive(item.label)}
                      >
                        <item.icon aria-hidden />
                        <SidebarMenuLabel>{item.label}</SidebarMenuLabel>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <CircleHelp aria-hidden />
                    <SidebarMenuLabel>Help & support</SidebarMenuLabel>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <label className="flex h-11 items-center gap-2 px-2 text-body-md text-content-neutral-emphasis">
                    <Moon aria-hidden className="size-4" />
                    <span className="flex-1">Dark theme</span>
                    <Switch />
                  </label>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarFooter>
          </Sidebar>
          <SidebarInset>
            <header className="flex h-12 items-center gap-2 border-b border-line-neutral-muted px-4">
              <SidebarTrigger />
              <span className="text-label-md text-content-neutral-emphasis">
                {active}
              </span>
            </header>
            <div className="p-4 text-body-md text-content-neutral-muted">
              On a phone the trigger opens the nav as a drawer over the page;
              from md up it collapses the rail as usual.
            </div>
          </SidebarInset>
        </SidebarProvider>
      </div>
    );
  },
};
