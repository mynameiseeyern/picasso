import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  dropdownMenuItemVariants,
} from "./dropdown-menu";

function Fixture() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>Actions</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Endpoint</DropdownMenuLabel>
        <DropdownMenuItem>
          Copy id<DropdownMenuShortcut>⇧⌘C</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem disabled>Duplicate</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

describe("DropdownMenu", () => {
  it("opens as a menu of menu items", async () => {
    const user = userEvent.setup();
    render(<Fixture />);
    await user.click(screen.getByText("Actions"));
    expect(await screen.findByRole("menu")).toBeInTheDocument();
    expect(screen.getAllByRole("menuitem")).toHaveLength(3);
  });

  it("closes on Escape", async () => {
    const user = userEvent.setup();
    render(<Fixture />);
    await user.click(screen.getByText("Actions"));
    await screen.findByRole("menu");
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("moves with the arrow keys and skips the disabled row", async () => {
    const user = userEvent.setup();
    render(<Fixture />);
    await user.click(screen.getByText("Actions"));
    await screen.findByRole("menu");
    // Radix roving focus only moves while the key is held.
    await user.keyboard("{ArrowDown>}{/ArrowDown}");
    expect(screen.getByRole("menuitem", { name: /Copy id/ })).toHaveFocus();
    await user.keyboard("{ArrowDown>}{/ArrowDown}");
    expect(screen.getByRole("menuitem", { name: "Delete" })).toHaveFocus();
  });

  it("has no hover state at all, which is the file's own instruction", () => {
    // "Focused = focus:bg-accent (Radix moves DOM focus on both pointer and
    // keyboard, so one state covers both) … There is deliberately no separate
    // hover." A hover: class creeping in would double-light the row.
    for (const v of ["default", "destructive"] as const) {
      expect(dropdownMenuItemVariants({ variant: v })).not.toContain("hover:");
    }
    expect(dropdownMenuItemVariants({ variant: "default" })).toContain(
      "focus:bg-surface-neutral-subtle-hovered",
    );
  });

  it("draws destructive rows in danger, and focuses them onto danger subtle", () => {
    const cls = dropdownMenuItemVariants({ variant: "destructive" });
    expect(cls).toContain("text-content-danger-emphasis");
    expect(cls).toContain("focus:bg-surface-danger-subtle");
  });

  it("dims a disabled row to half rather than recolouring it", async () => {
    const user = userEvent.setup();
    render(<Fixture />);
    await user.click(screen.getByText("Actions"));
    const item = await screen.findByRole("menuitem", { name: "Duplicate" });
    expect(item.className).toContain("data-[disabled]:opacity-50");
    expect(item).toHaveAttribute("data-disabled");
  });

  it("sits on the compact overlay surface rather than its own card", async () => {
    const user = userEvent.setup();
    render(<Fixture />);
    await user.click(screen.getByText("Actions"));
    const menu = await screen.findByRole("menu");
    expect(menu.className).toContain("rounded-lg");
    expect(menu.className).toContain("p-1");
    expect(menu.className).toContain("shadow-md");
    expect(menu.className).toContain("bg-surface-card");
  });

  it("rules between groups on the line token, inset to the surface", async () => {
    const user = userEvent.setup();
    render(<Fixture />);
    await user.click(screen.getByText("Actions"));
    await screen.findByRole("menu");
    const sep = document.querySelector("[data-slot=dropdown-menu-separator]")!;
    expect(sep.className).toContain("h-px");
    expect(sep.className).toContain("bg-line-neutral-muted");
    expect(sep.className).not.toContain("-mx-");
  });

  it("brightens the shortcut with its row", async () => {
    const user = userEvent.setup();
    render(<Fixture />);
    await user.click(screen.getByText("Actions"));
    await screen.findByRole("menu");
    const sc = document.querySelector("[data-slot=dropdown-menu-shortcut]")!;
    expect(sc.className).toContain("group-focus:text-content-neutral-emphasis");
  });

  it("holds the drawn row height rather than letting the font decide", async () => {
    const user = userEvent.setup();
    render(<Fixture />);
    await user.click(screen.getByText("Actions"));
    const item = await screen.findByRole("menuitem", { name: /Copy id/ });
    // Padding plus body/md's line-height renders 29 against the drawn 28.
    expect(item.className).toContain("h-7");
  });

  it("grows from its trigger on the motion tokens, and so does a submenu", async () => {
    const user = userEvent.setup();
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Actions</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Move to</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem>Sydney</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    await user.click(screen.getByText("Actions"));
    await screen.findByRole("menu");
    await user.keyboard("{ArrowDown}{ArrowRight}");
    await screen.findByText("Sydney");
    for (const slot of ["dropdown-menu-content", "dropdown-menu-sub-content"])
      expect(document.querySelector(`[data-slot=${slot}]`)).toHaveClass(
        "origin-(--radix-dropdown-menu-content-transform-origin)",
        "data-[state=open]:animate-popover-in",
        "data-[state=closed]:animate-popover-out",
      );
  });
});
