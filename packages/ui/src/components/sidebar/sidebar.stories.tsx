import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  Activity,
  Bell,
  ChevronRight,
  Gauge,
  Plus,
  Server,
  Settings,
} from "lucide-react";
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
import clarionPlate from "../../brand-assets/Clarion.svg";
import consolePlate from "../../brand-assets/Console.svg";

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

function PlateRail({
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
            <SidebarHeader variant="plate">{children}</SidebarHeader>
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

export const BrandPlate: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "The plate bleeds to three edges, so the header drops its padding " +
          "rather than a product cancelling it from outside. Without an image " +
          "it paints the rail's own surface — a brand with no artwork yet " +
          "reads as a quiet header, not an empty coloured box.",
      },
    },
  },
  render: () => (
    <div className="flex flex-wrap gap-6 p-6">
      <PlateRail caption="Lockup over a second line">
        <SidebarBrand image={clarionPlate} subtitle="powered by Iris" mark="C">
          CLARION
        </SidebarBrand>
      </PlateRail>
      <PlateRail caption="One word">
        <SidebarBrand image={consolePlate} mark="I">
          Iris
        </SidebarBrand>
      </PlateRail>
      <PlateRail caption="No image — the neutral default">
        <SidebarBrand subtitle="powered by Iris" mark="V">
          Vantage
        </SidebarBrand>
      </PlateRail>
      <PlateRail caption="Collapsed to 48" collapsed>
        <SidebarBrand image={clarionPlate} subtitle="powered by Iris" mark="C">
          CLARION
        </SidebarBrand>
      </PlateRail>
    </div>
  ),
};
