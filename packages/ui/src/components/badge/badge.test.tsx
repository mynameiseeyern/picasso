import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Badge } from "./badge";

describe("Badge", () => {
  it("carries the colour on fill, edge and text when subtle", () => {
    render(<Badge color="success" data-testid="b">Healthy</Badge>);
    expect(screen.getByTestId("b")).toHaveClass(
      "bg-surface-success-subtle",
      "border-line-success-muted",
      "text-content-success-emphasis",
    );
  });

  it("uses the measured on-colour ink when emphasis", () => {
    render(<Badge color="warning" variant="emphasis" data-testid="b">Degraded</Badge>);
    // Not white-by-default: fg/on/warning-emphasis is dark ink, because white
    // cannot carry 4.5:1 on the warning fill.
    expect(screen.getByTestId("b")).toHaveClass(
      "bg-surface-warning-emphasis",
      "text-content-on-warning-emphasis",
      "border-transparent",
    );
  });

  it("renders outline identically whatever the colour, as Figma draws it", () => {
    const { rerender } = render(<Badge variant="outline" color="danger" data-testid="b">One</Badge>);
    const danger = screen.getByTestId("b").className;
    rerender(<Badge variant="outline" color="success" data-testid="b">One</Badge>);
    // 40 of Figma's 120 variants collapse to 8 for this reason. It means
    // `variant="outline" color="danger"` is not a red badge — and never was.
    expect(screen.getByTestId("b").className).toBe(danger);
    expect(danger).toContain("bg-surface-neutral-muted");
  });

  it("takes the dot from the status palette, not its own colour", () => {
    render(<Badge color="danger" dot data-testid="b">Critical</Badge>);
    const dot = screen.getByTestId("b").querySelector("[data-slot=badge-dot]");
    // danger → status/critical, so one hue means one thing across the product.
    expect(dot).toHaveClass("bg-status-critical", "size-2");
    expect(dot).toHaveAttribute("aria-hidden");
  });

  it("has no dot unless asked", () => {
    render(<Badge color="success" data-testid="b">Healthy</Badge>);
    expect(screen.getByTestId("b").querySelector("[data-slot=badge-dot]")).toBeNull();
  });

  it("scales padding and type together at lg", () => {
    render(<Badge size="lg" data-testid="b">Large</Badge>);
    expect(screen.getByTestId("b")).toHaveClass("px-2", "py-1", "text-label-lg");
  });

  it("is a span, not a control", () => {
    render(<Badge data-testid="b">Static</Badge>);
    // Nothing happens when you click a badge. One that acts is a Button.
    expect(screen.getByTestId("b").tagName).toBe("SPAN");
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("can become the element it labels", () => {
    render(
      <Badge asChild color="info">
        <a href="/releases">13.3</a>
      </Badge>,
    );
    const link = screen.getByRole("link", { name: "13.3" });
    expect(link).toHaveClass("bg-surface-info-subtle");
  });
});
