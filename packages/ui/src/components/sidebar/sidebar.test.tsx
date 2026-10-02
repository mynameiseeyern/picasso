import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  Sidebar,
  SidebarBrand,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
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
  sidebarMenuButtonVariants,
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
    expect(screen.getByRole("button", { name: /Alerts/ })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("carries the active state in the weight as well as the fill", () => {
    // On a rail where several rows share a muted fill, the weight survives.
    expect(sidebarMenuButtonVariants({ active: true })).toContain(
      "text-label-lg",
    );
    expect(sidebarMenuButtonVariants({ active: false })).toContain(
      "text-body-md",
    );
    expect(sidebarMenuButtonVariants({ active: true })).toContain(
      "bg-surface-primary-subtle",
    );
  });

  it("collapses to a rail on the trigger, and says which way it goes", async () => {
    const user = userEvent.setup();
    render(<Fixture />);
    const trigger = screen.getByRole("button", { name: "Collapse sidebar" });
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    await user.click(trigger);
    expect(
      screen.getByRole("button", { name: "Expand sidebar" }),
    ).toHaveAttribute("aria-expanded", "false");
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
    expect(
      screen.getByRole("button", { name: "Collapse sidebar" }),
    ).toBeInTheDocument();
  });

  it("is a list of items, and the submenu is a list inside it", () => {
    render(<Fixture />);
    const lists = screen.getAllByRole("list");
    expect(lists.length).toBeGreaterThanOrEqual(2);
    expect(
      document.querySelector("[data-slot=sidebar-menu-sub]")?.tagName,
    ).toBe("UL");
  });

  it("gives a sub-item the same fill for active and hover, as drawn", () => {
    render(<Fixture />);
    const sub = document.querySelector("[data-slot=sidebar-menu-sub-button]");
    // One fill for both, so a selected sub-item and a hovered one are the
    // same picture.
    expect(sub).toHaveClass("hover:bg-surface-sidebar-hovered");
  });

  it("hovers and presses on the rail's own pair, never the page's", () => {
    // bg/sidebar is neutral-100 in light — the value subtle-hovered and
    // muted-hovered both resolve to — so the standard hover is invisible here.
    render(<Fixture />);
    for (const slot of [
      "sidebar-menu-button",
      "sidebar-menu-sub-button",
      "sidebar-trigger",
    ]) {
      const classes = (
        document.querySelector(`[data-slot=${slot}]`)?.className ?? ""
      ).split(/\s+/);
      expect(classes).toContain("hover:bg-surface-sidebar-hovered");
      expect(classes).toContain("active:bg-surface-sidebar-pressed");
      expect(classes).not.toContain("hover:bg-surface-neutral-subtle-hovered");
      expect(classes).not.toContain("hover:bg-surface-neutral-muted-hovered");
    }
  });

  it("takes its measurements from the file", () => {
    render(<Fixture />);
    expect(
      document.querySelector("[data-slot=sidebar-menu-button]"),
    ).toHaveClass("h-8", "gap-2", "p-2", "rounded-md");
    expect(
      document.querySelector("[data-slot=sidebar-menu-sub-button]"),
    ).toHaveClass("h-7", "px-2");
    expect(document.querySelector("[data-slot=sidebar-group]")).toHaveClass(
      "p-2",
    );
    expect(
      document.querySelector("[data-slot=sidebar-group-label]"),
    ).toHaveClass("h-8", "text-label-sm");
  });
});

describe("SidebarBrand", () => {
  const plate = (ui: React.ReactNode, collapsed = false) =>
    render(
      <SidebarProvider defaultCollapsed={collapsed}>
        <Sidebar>
          <SidebarHeader variant="plate">{ui}</SidebarHeader>
        </Sidebar>
      </SidebarProvider>,
    );

  it("drops the header's padding so the plate can bleed", () => {
    const { container } = plate(<SidebarBrand>Clarion</SidebarBrand>);
    const header = container.querySelector('[data-slot="sidebar-header"]')!;
    expect(header.className).toContain("p-0");
    expect(header.className).not.toContain("p-2");
  });

  it("paints the rail's own surface when there is no image", () => {
    const { container } = plate(<SidebarBrand>Vantage</SidebarBrand>);
    const brand = container.querySelector('[data-slot="sidebar-brand"]')!;
    expect(brand.className).toContain("bg-surface-sidebar");
    // Nothing to measure a bitmap against, so the neutral case takes neutral ink.
    expect(brand.className).toContain("text-content-neutral-emphasis");
    expect(container.querySelector("img")).toBeNull();
  });

  it("covers the plate with a decorative image, and flips the ink", () => {
    const { container } = plate(
      <SidebarBrand image="/brand.png">Clarion</SidebarBrand>,
    );
    const brand = container.querySelector('[data-slot="sidebar-brand"]')!;
    expect(brand.className).toContain("text-content-on-primary-emphasis");
    expect(brand.className).not.toContain("bg-surface-sidebar");
    const img = container.querySelector("img")!;
    // Decorative: an empty alt and aria-hidden, so it is never announced.
    expect(img).toHaveAttribute("alt", "");
    expect(img).toHaveAttribute("aria-hidden");
  });

  it("takes on-light ink for a pale asset, which nothing can measure for us", () => {
    const { container } = plate(
      <SidebarBrand image="/pale.png" ink="on-light">
        Clarion
      </SidebarBrand>,
    );
    expect(
      container.querySelector('[data-slot="sidebar-brand"]')!.className,
    ).toContain("text-content-neutral-emphasis");
  });

  it("shows the wordmark and its second line when expanded", () => {
    plate(<SidebarBrand subtitle="powered by Iris">CLARION</SidebarBrand>);
    expect(screen.getByText("CLARION")).toBeInTheDocument();
    expect(screen.getByText("powered by Iris")).toBeInTheDocument();
  });

  it("drops to the mark alone when the rail is collapsed", () => {
    plate(
      <SidebarBrand subtitle="powered by Iris" mark="C">
        CLARION
      </SidebarBrand>,
      true,
    );
    expect(screen.getByText("C")).toBeInTheDocument();
    expect(screen.queryByText("CLARION")).toBeNull();
    // 48px of rail cannot carry a second line either.
    expect(screen.queryByText("powered by Iris")).toBeNull();
  });
});
