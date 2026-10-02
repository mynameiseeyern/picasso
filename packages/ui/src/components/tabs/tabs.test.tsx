import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";

function Fixture(props: React.ComponentProps<typeof Tabs>) {
  return (
    <Tabs defaultValue="overview" {...props}>
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="trunks">Trunks</TabsTrigger>
        <TabsTrigger value="alerts" disabled>
          Alerts
        </TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">Overview panel</TabsContent>
      <TabsContent value="trunks">Trunks panel</TabsContent>
      <TabsContent value="settings">Settings panel</TabsContent>
    </Tabs>
  );
}

describe("Tabs", () => {
  it("is a tablist of tabs with one panel", () => {
    render(<Fixture />);
    expect(screen.getByRole("tablist")).toBeInTheDocument();
    expect(screen.getAllByRole("tab")).toHaveLength(4);
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Overview panel");
  });

  it("moves with the arrow keys and skips a disabled tab", async () => {
    const user = userEvent.setup();
    render(<Fixture />);
    await user.click(screen.getByRole("tab", { name: "Overview" }));
    // Radix roving focus only moves while the key is held — the same trap as
    // RadioGroup, where a keyup between press and check clears the flag.
    await user.keyboard("{ArrowRight>}{/ArrowRight}");
    expect(screen.getByRole("tab", { name: "Trunks" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await user.keyboard("{ArrowRight>}{/ArrowRight}");
    expect(screen.getByRole("tab", { name: "Settings" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  it("gives every tab a focus ring, including the one Figma forgot", () => {
    render(<Fixture />);
    // Figma's Current=False / Underline / Focus is identical to its Default —
    // no ring at all. A focus state that does not show focus is a trap.
    for (const tab of screen.getAllByRole("tab")) {
      expect(tab.className).toContain("focus-visible:ring-2");
    }
  });

  it("carries the underline indicator over the list's rule", () => {
    render(<Fixture />);
    const tab = screen.getByRole("tab", { name: "Overview" });
    expect(tab.className).toContain("border-b-2");
    // The 2px indicator sits ON the 1px rule rather than below it.
    expect(tab.className).toContain("-mb-px");
    expect(screen.getByRole("tablist").className).toContain("border-b");
  });

  it("flows variant and size from the root, so triggers cannot disagree", () => {
    const { rerender } = render(<Fixture variant="border" size="sm" />);
    expect(screen.getByRole("tablist").className).toContain("rounded-xl");
    expect(screen.getByRole("tab", { name: "Overview" }).className).toContain(
      "text-label-md",
    );
    rerender(<Fixture variant="gray" size="md" />);
    expect(screen.getByRole("tab", { name: "Overview" }).className).toContain(
      "data-[state=active]:bg-surface-neutral-muted",
    );
    expect(screen.getByRole("tab", { name: "Overview" }).className).toContain(
      "text-label-lg",
    );
  });

  it("holds a transparent border where the current tab gains one", () => {
    render(<Fixture variant="brand" />);
    // Brand and Minimal outline the current tab. Without a resting border of
    // the same width, every selection would shift the row by 2px.
    expect(screen.getByRole("tab", { name: "Trunks" }).className).toContain(
      "border-transparent",
    );
  });

  it("lifts the current Border tab rather than outlining it", () => {
    render(<Fixture variant="border" />);
    const cls = screen.getByRole("tab", { name: "Overview" }).className;
    expect(cls).toContain("data-[state=active]:shadow-sm");
    expect(cls).not.toContain("data-[state=active]:border-line");
  });

  it("stretches the tabs when asked", () => {
    render(<Fixture fullWidth />);
    expect(screen.getByRole("tablist").className).toContain("w-full");
    expect(screen.getByRole("tab", { name: "Overview" }).className).toContain(
      "flex-1",
    );
  });

  it("stacks and rules the side when vertical", () => {
    render(<Fixture variant="line" orientation="vertical" />);
    expect(screen.getByRole("tablist").className).toContain("flex-col");
    expect(screen.getByRole("tab", { name: "Overview" }).className).toContain(
      "border-s-2",
    );
  });
});
