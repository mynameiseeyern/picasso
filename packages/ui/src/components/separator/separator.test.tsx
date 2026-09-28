import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Separator } from "./separator";

describe("Separator", () => {
  it("is hidden from assistive tech by default", () => {
    const { container } = render(<Separator />);
    // A rule is a visual grouping cue; the headings and landmarks around it
    // already carry the grouping for a screen reader.
    expect(screen.queryByRole("separator")).toBeNull();
    expect(
      container.querySelector("[data-slot=separator]"),
    ).toBeInTheDocument();
  });

  it("is announced when it is the only thing marking the boundary", () => {
    render(<Separator decorative={false} />);
    expect(screen.getByRole("separator")).toBeInTheDocument();
  });

  it("carries its orientation, and reports vertical to assistive tech", () => {
    const { container, rerender } = render(<Separator />);
    const el = () => container.querySelector("[data-slot=separator]")!;
    expect(el()).toHaveAttribute("data-orientation", "horizontal");
    rerender(<Separator orientation="vertical" decorative={false} />);
    expect(el()).toHaveAttribute("data-orientation", "vertical");
    // Horizontal is the ARIA default, so only vertical is spelled out.
    expect(screen.getByRole("separator")).toHaveAttribute(
      "aria-orientation",
      "vertical",
    );
  });

  it("draws the rule as a background, the way the rest of the system does", () => {
    const { container } = render(<Separator />);
    const el = container.querySelector("[data-slot=separator]")!;
    expect(el.className).toContain("bg-line-neutral-muted");
    expect(el.className).toContain("data-[orientation=horizontal]:h-px");
    expect(el.className).toContain("data-[orientation=vertical]:w-px");
  });
});
