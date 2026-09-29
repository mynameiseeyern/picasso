import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarInset,
  SidebarMenu, SidebarMenuBadge, SidebarMenuButton, SidebarMenuItem,
  SidebarMenuLabel, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem,
  SidebarProvider, SidebarTrigger, sidebarMenuButtonVariants,
} from "./sidebar";

function Fixture(props: React.ComponentProps<typeof SidebarProvider>) {
  return (
    <SidebarProvider {...props}>
      <Sidebar>
        <SidebarTrigger />
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Monitoring</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton active>
                  <SidebarMenuLabel>Endpoints</SidebarMenuLabel>
                  <SidebarMenuBadge>23</SidebarMenuBadge>
                </SidebarMenuButton>
                <SidebarMenuSub>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton>Sydney</SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                </SidebarMenuSub>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <SidebarMenuLabel>Alerts</SidebarMenuLabel>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>page</SidebarInset>
    </SidebarProvider>
  );
}

describe("Sidebar", () => {
  it("refuses to render its parts outside a provider", () => {
    const err = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Sidebar />)).toThrow(/SidebarProvider/);
    err.mockRestore();
  });

  it("marks the current page for assistive tech, not just with a fill", () => {
    render(<Fixture />);
    const current = screen.getByRole("button", { name: /Endpoints/ });
    expect(current).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("button", { name: /Alerts/ })).not.toHaveAttribute("aria-current");
  });

  it("carries the active state in the weight as well as the fill", () => {
    // On a rail where several rows share a muted fill, the weight survives.
    expect(sidebarMenuButtonVariants({ active: true })).toContain("text-label-lg");
    expect(sidebarMenuButtonVariants({ active: false })).toContain("text-body-md");
    expect(sidebarMenuButtonVariants({ active: true })).toContain("bg-surface-primary-subtle");
  });

  it("collapses to a rail on the trigger, and says which way it goes", async () => {
    const user = userEvent.setup();
    render(<Fixture />);
    const trigger = screen.getByRole("button", { name: "Collapse sidebar" });
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    await user.click(trigger);
    expect(screen.getByRole("button", { name: "Expand sidebar" })).toHaveAttribute("aria-expanded", "false");
  });

  it("drops the words when collapsed, so the icons can centre", () => {
    render(<Fixture defaultCollapsed />);
    expect(screen.queryByText("Endpoints")).toBeNull();
    expect(screen.queryByText("Monitoring")).toBeNull();
    expect(screen.queryByText("23")).toBeNull();
    // The submenu goes too — there is nowhere for it to live at 48 wide.
    expect(document.querySelector("[data-slot=sidebar-menu-sub]")).toBeNull();
  });

  it("can be driven from outside", async () => {
    const onCollapsedChange = vi.fn();
    const user = userEvent.setup();
    render(<Fixture collapsed={false} onCollapsedChange={onCollapsedChange} />);
    await user.click(screen.getByRole("button", { name: "Collapse sidebar" }));
    expect(onCollapsedChange).toHaveBeenCalledWith(true);
    // Controlled, so it stays open until the prop changes.
    expect(screen.getByRole("button", { name: "Collapse sidebar" })).toBeInTheDocument();
  });

  it("is a list of items, and the submenu is a list inside it", () => {
    render(<Fixture />);
    const lists = screen.getAllByRole("list");
    expect(lists.length).toBeGreaterThanOrEqual(2);
    expect(document.querySelector("[data-slot=sidebar-menu-sub]")?.tagName).toBe("UL");
  });

  it("gives a sub-item the same fill for active and hover, as drawn", () => {
    render(<Fixture />);
    const sub = document.querySelector("[data-slot=sidebar-menu-sub-button]");
    // Both are bg/neutral/subtle-hovered in the file, so a selected sub-item
    // and a hovered one are the same picture.
    expect(sub).toHaveClass("hover:bg-surface-neutral-subtle-hovered");
  });

  it("takes its measurements from the file", () => {
    render(<Fixture />);
    expect(document.querySelector("[data-slot=sidebar-menu-button]")).toHaveClass("h-8", "gap-2", "p-2", "rounded-md");
    expect(document.querySelector("[data-slot=sidebar-menu-sub-button]")).toHaveClass("h-7", "px-2");
    expect(document.querySelector("[data-slot=sidebar-group]")).toHaveClass("p-2");
    expect(document.querySelector("[data-slot=sidebar-group-label]")).toHaveClass("h-8", "text-label-sm");
  });
});
