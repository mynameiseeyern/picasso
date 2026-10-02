import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Kbd, KbdGroup } from "./kbd";

describe("Kbd", () => {
  it("renders a <kbd> at the default background", () => {
    render(<Kbd>Ctrl</Kbd>);
    const el = screen.getByText("Ctrl");
    expect(el.tagName).toBe("KBD");
    expect(el).toHaveAttribute("data-slot", "kbd");
    expect(el).toHaveClass(
      "bg-surface-neutral-muted",
      "text-content-neutral-muted",
      "h-5",
    );
  });

  it("uses radius/sm, not a larger radius", () => {
    // Regression: Figma had Kbd on radius/lg (10px), which reads as a pill
    // at 20px tall. Kbd is rounded-sm (6px) — 28 Sept.
    for (const background of [
      "default",
      "neutral",
      "brand",
      "opaque",
      "on-emphasis",
    ] as const) {
      const { unmount } = render(<Kbd background={background}>K</Kbd>);
      const el = screen.getByText("K");
      expect(el, background).toHaveClass("rounded-sm");
      expect(el.className, background).not.toMatch(
        /\brounded-(md|lg|xl|full)\b/,
      );
      unmount();
    }
  });

  it("draws the key cap as a bottom border only", () => {
    render(<Kbd background="brand">⌘</Kbd>);
    const el = screen.getByText("⌘");
    expect(el).toHaveClass("border-b", "border-line-focused");
    expect(el).not.toHaveClass("border");
  });

  it("groups keys in a <kbd> with gap-1", () => {
    render(
      <KbdGroup data-testid="group">
        <Kbd>Ctrl</Kbd>
        <Kbd>K</Kbd>
      </KbdGroup>,
    );
    const group = screen.getByTestId("group");
    expect(group.tagName).toBe("KBD");
    expect(group).toHaveClass("inline-flex", "gap-1");
    expect(group.querySelectorAll('[data-slot="kbd"]')).toHaveLength(2);
  });
});
