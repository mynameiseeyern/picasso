import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import {
  AppShell,
  AppShellContent,
  AppShellHeader,
  AppShellMain,
} from "./app-shell";
import {
  Sidebar,
  SidebarContent,
  SidebarProvider,
  SidebarTrigger,
} from "../sidebar/sidebar";

function classes(el: Element) {
  return el.className.split(/\s+/).filter(Boolean);
}

function Fixture({
  collapsed,
  width,
}: {
  collapsed?: boolean;
  width?: "fluid" | "prose";
}) {
  return (
    <SidebarProvider defaultCollapsed={collapsed}>
      <AppShell>
        <Sidebar>
          <SidebarContent>nav</SidebarContent>
        </Sidebar>
        <AppShellMain>
          <AppShellHeader>
            <SidebarTrigger />
            <span>Endpoints</span>
          </AppShellHeader>
          <AppShellContent width={width}>
            <h1>Page</h1>
          </AppShellContent>
        </AppShellMain>
      </AppShell>
    </SidebarProvider>
  );
}

describe("AppShell", () => {
  it("lays the rail and the page out side by side", () => {
    const { container } = render(<Fixture />);
    const shell = container.querySelector('[data-slot="app-shell"]')!;
    expect(classes(shell)).toEqual(
      expect.arrayContaining(["flex", "h-full", "w-full", "bg-surface-app"]),
    );
  });

  it("does not claim the viewport height", () => {
    const { container } = render(<Fixture />);
    const shell = container.querySelector('[data-slot="app-shell"]')!;
    // A shell that hardcodes h-svh / min-h-svh cannot be put in a panel or a
    // story without a class fighting it. The page owns the height.
    expect(classes(shell)).not.toContain("h-svh");
    expect(classes(shell)).not.toContain("min-h-svh");
  });

  it("lets the column shrink so wide content cannot push the rail", () => {
    const { container } = render(<Fixture />);
    const column = container.querySelector('[data-slot="app-shell-main"]')!;
    expect(classes(column)).toEqual(
      expect.arrayContaining(["min-w-0", "min-h-0", "flex-1"]),
    );
  });

  it("puts the landmarks where HTML wants them", () => {
    render(<Fixture />);
    // <header> is only a banner outside main/aside/nav/section, so the top
    // bar cannot live inside <main>. The content is the main landmark.
    const header = screen.getByRole("banner");
    const main = screen.getByRole("main");
    expect(header).toHaveAttribute("data-slot", "app-shell-header");
    expect(main).toHaveAttribute("data-slot", "app-shell-content");
    expect(main.contains(header)).toBe(false);
  });

  it("gives the header the 48 it is drawn at, and a bottom edge", () => {
    render(<Fixture />);
    const header = screen.getByRole("banner");
    expect(classes(header)).toEqual(
      expect.arrayContaining([
        "h-12",
        "shrink-0",
        "gap-2",
        "border-b",
        "border-line-neutral-muted",
      ]),
    );
  });

  it("steps the page padding at 1280, which is xl", () => {
    const { container } = render(<Fixture />);
    const content = container.querySelector('[data-slot="app-shell-content"]')!;
    const header = screen.getByRole("banner");
    // 16 below 1280, 24 from 1280 up. `xl` is 1280 in screen/desktop/* and
    // in Tailwind; `lg` is 1024 in both and would fire a breakpoint early.
    expect(classes(content)).toEqual(expect.arrayContaining(["p-4", "xl:p-6"]));
    expect(classes(content)).not.toContain("lg:p-6");
    expect(classes(header)).toEqual(
      expect.arrayContaining(["px-4", "xl:px-6"]),
    );
    expect(classes(header)).not.toContain("lg:px-6");
  });

  it("scrolls the content area, not the shell", () => {
    const { container } = render(<Fixture />);
    const shell = container.querySelector('[data-slot="app-shell"]')!;
    const content = container.querySelector('[data-slot="app-shell-content"]')!;
    expect(classes(shell)).toContain("overflow-hidden");
    expect(classes(content)).toContain("overflow-y-auto");
  });

  it("caps the reading column at 768 and leaves it left-aligned", () => {
    const { container } = render(<Fixture width="prose" />);
    const column = container.querySelector(
      '[data-slot="app-shell-content-column"]',
    )!;
    expect(classes(column)).toContain("max-w-192");
    // Left-aligned: the Rules say the column stays put rather than centring.
    expect(classes(column)).not.toContain("mx-auto");
  });

  it("leaves the column uncapped by default", () => {
    const { container } = render(<Fixture />);
    const column = container.querySelector(
      '[data-slot="app-shell-content-column"]',
    )!;
    expect(classes(column)).not.toContain("max-w-192");
  });

  it("keeps the padding outside the capped column", () => {
    const { container } = render(<Fixture width="prose" />);
    const content = container.querySelector('[data-slot="app-shell-content"]')!;
    const column = container.querySelector(
      '[data-slot="app-shell-content-column"]',
    )!;
    // The cap is on the column, the padding on the scroller — otherwise a
    // 768 cap yields a 720 column.
    expect(classes(content)).toContain("p-4");
    expect(classes(column)).not.toContain("p-4");
  });

  it("carries the rail width from the sidebar's own state", () => {
    const { container: open } = render(<Fixture />);
    expect(classes(open.querySelector('[data-slot="sidebar"]')!)).toContain(
      "w-64",
    );
    const { container: shut } = render(<Fixture collapsed />);
    expect(classes(shut.querySelector('[data-slot="sidebar"]')!)).toContain(
      "w-12",
    );
  });
});
