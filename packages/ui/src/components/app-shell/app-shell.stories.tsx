import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Activity, Bell, Gauge, Server } from "lucide-react";

import {
  AppShell,
  AppShellContent,
  AppShellHeader,
  AppShellMain,
} from "./app-shell";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
} from "../breadcrumb/breadcrumb";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuLabel,
  SidebarProvider,
  SidebarTrigger,
} from "../sidebar/sidebar";

import guidance from "./guidance.json";
import { Guidance, GuidanceStory, pairOf } from "@/stories/guidance";

const meta: Meta<typeof AppShell> = {
  title: "Components/App shell",
  component: AppShell,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "The frame every product screen starts from. Figma draws ten " +
          "variants across Screen × Sidebar; Screen is breakpoints, which " +
          "the browser does itself, so in code there are none — the shell " +
          "is chrome, and the chrome is fixed. Page padding steps from 16 " +
          "to 24 at 1280, which is IR's lg and Tailwind's xl.",
      },
    },
  },
};
const pair = pairOf(guidance);

export default meta;
type Story = StoryObj<typeof AppShell>;

const NAV = [
  { icon: Gauge, label: "Overview" },
  { icon: Server, label: "Endpoints" },
  { icon: Activity, label: "Metrics" },
  { icon: Bell, label: "Alerts" },
];

function Nav({ active }: { active: string }) {
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-1 text-label-md text-content-neutral-emphasis">
          <span
            aria-hidden
            className="flex size-8 shrink-0 items-center justify-center rounded-md bg-surface-primary-emphasis text-label-sm text-content-on-primary-emphasis"
          >
            IR
          </span>
          <span className="truncate">Clarion</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Monitoring</SidebarGroupLabel>
          <SidebarMenu>
            {NAV.map(({ icon: Icon, label }) => (
              <SidebarMenuItem key={label}>
                <SidebarMenuButton active={label === active}>
                  <Icon aria-hidden />
                  <SidebarMenuLabel>{label}</SidebarMenuLabel>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

function Crumbs({ page }: { page: string }) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="#monitoring">Monitoring</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbPage>{page}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}

function Page({ title, lines = 3 }: { title: string; lines?: number }) {
  return (
    <>
      <h1 className="text-heading-md text-content-neutral-emphasis">{title}</h1>
      <div className="mt-4 space-y-4 text-body-md text-content-neutral-muted">
        {Array.from({ length: lines }, (_, i) => (
          <p key={i}>
            The page header, the page title and the page actions all live here,
            inside the content area — not in the top bar, which stays at 48 and
            carries the toggle and the breadcrumb only.
          </p>
        ))}
      </div>
    </>
  );
}

/** The default canvas: lg (1280), rail expanded. */
export const Default: Story = {
  render: () => (
    <div className="h-150">
      <SidebarProvider>
        <AppShell>
          <Nav active="Endpoints" />
          <AppShellMain>
            <AppShellHeader>
              <SidebarTrigger />
              <Crumbs page="Endpoints" />
            </AppShellHeader>
            <AppShellContent>
              <Page title="Endpoints" />
            </AppShellContent>
          </AppShellMain>
        </AppShell>
      </SidebarProvider>
    </div>
  ),
};

/** Collapsed to the 48 rail. The toggle is in the top bar, where it stays. */
export const Collapsed: Story = {
  render: () => (
    <div className="h-150">
      <SidebarProvider defaultCollapsed>
        <AppShell>
          <Nav active="Endpoints" />
          <AppShellMain>
            <AppShellHeader>
              <SidebarTrigger />
              <Crumbs page="Endpoints" />
            </AppShellHeader>
            <AppShellContent>
              <Page title="Endpoints" />
            </AppShellContent>
          </AppShellMain>
        </AppShell>
      </SidebarProvider>
    </div>
  ),
};

/**
 * `width="prose"` caps the content column at 768 for reading-heavy pages —
 * forms and settings — and leaves it left-aligned.
 */
export const ProseWidth: Story = {
  name: "Prose width",
  render: () => (
    <div className="h-150">
      <SidebarProvider>
        <AppShell>
          <Nav active="Alerts" />
          <AppShellMain>
            <AppShellHeader>
              <SidebarTrigger />
              <Crumbs page="Notification settings" />
            </AppShellHeader>
            <AppShellContent width="prose">
              <Page title="Notification settings" lines={4} />
            </AppShellContent>
          </AppShellMain>
        </AppShell>
      </SidebarProvider>
    </div>
  ),
};

/** Long pages scroll in the content area; the rail and the bar stay put. */
export const Scrolling: Story = {
  render: () => (
    <div className="h-120">
      <SidebarProvider>
        <AppShell>
          <Nav active="Metrics" />
          <AppShellMain>
            <AppShellHeader>
              <SidebarTrigger />
              <Crumbs page="Metrics" />
            </AppShellHeader>
            <AppShellContent>
              <Page title="Metrics" lines={12} />
            </AppShellContent>
          </AppShellMain>
        </AppShell>
      </SidebarProvider>
    </div>
  ),
};

/* ------------------------------------------------------------------ */

/** A top bar, shown twice: overloaded, and as the Rules describe it. */
function TopBar({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full overflow-hidden rounded-md border border-line-neutral-muted">
      <SidebarProvider>
        <AppShell>
          <AppShellMain>
            <AppShellHeader>{children}</AppShellHeader>
            <AppShellContent>
              <p className="text-body-md text-content-neutral-muted">
                Page content
              </p>
            </AppShellContent>
          </AppShellMain>
        </AppShell>
      </SidebarProvider>
    </div>
  );
}

export const DoAndDont: Story = {
  name: "Do and Don't",
  parameters: { controls: { disable: true } },
  render: () => (
    <GuidanceStory>
      <Guidance
        pair={pair("top-bar-is-not-a-header")}
        width="wide"
        dont={
          <>
            <div className="h-32 w-full">
              <TopBar>
                <SidebarTrigger />
                <Crumbs page="Endpoints" />
                <span className="ml-2 truncate text-label-md text-content-neutral-emphasis">
                  Endpoints
                </span>
                <span className="ml-auto flex items-center gap-2 text-body-sm text-content-neutral-muted">
                  <span className="rounded-md border border-line-neutral-muted px-2 py-1">
                    Search
                  </span>
                  <span className="rounded-md border border-line-neutral-muted px-2 py-1">
                    Export
                  </span>
                </span>
              </TopBar>
            </div>
          </>
        }
        do={
          <>
            <div className="h-32 w-full">
              <TopBar>
                <SidebarTrigger />
                <Crumbs page="Endpoints" />
              </TopBar>
            </div>
          </>
        }
      />

      <Guidance
        pair={pair("cap-the-column-not-the-page")}
        width="wide"
        dont={
          <>
            <div className="w-full text-body-md text-content-neutral-muted">
              <div className="mx-auto max-w-80 rounded-md border border-line-neutral-muted p-3">
                Notification settings
              </div>
            </div>
          </>
        }
        do={
          <>
            <div className="w-full text-body-md text-content-neutral-muted">
              <div className="max-w-80 rounded-md border border-line-neutral-muted p-3">
                Notification settings
              </div>
            </div>
          </>
        }
      />
    </GuidanceStory>
  ),
};
