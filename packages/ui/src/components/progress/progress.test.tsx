import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Progress } from "./progress";

describe("Progress", () => {
  it("announces itself as a progress bar with its value", () => {
    render(<Progress value={42} />);
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuenow", "42");
    expect(bar).toHaveAttribute("aria-valuemax", "100");
  });

  it("omits the value when the length is unknown", () => {
    render(<Progress value={null} />);
    // An indeterminate bar that claimed 0% would be saying nothing has
    // happened, which is a different and usually false statement.
    const bar = screen.getByRole("progressbar");
    expect(bar).not.toHaveAttribute("aria-valuenow");
    expect(bar).toHaveAttribute("data-state", "indeterminate");
  });

  it("clamps rather than overflowing its track", () => {
    const { rerender } = render(<Progress value={140} />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "100");
    rerender(<Progress value={-20} />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "0");
  });

  it("draws a track you can see, so the bar has an end", () => {
    render(<Progress value={40} />);
    // bg/neutral/subtle is the app background in light, so the track vanished
    // and 40% read as a short bar rather than 40% of something.
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveClass("bg-surface-layer-emphasis");
    expect(bar).not.toHaveClass("bg-surface-neutral-subtle");
  });

  it("moves the indicator by a custom property, not an inline transform", () => {
    render(<Progress value={30} />);
    const ind = screen.getByRole("progressbar").querySelector("[data-slot=progress-indicator]");
    // An inline transform is refused by no-inline-styles and a
    // translate-x-[calc(...)] by no-arbitrary-values — both correctly. A
    // variable reference is neither, so the arithmetic stays in JS.
    expect(ind).toHaveClass("translate-x-(--progress-offset)");
    expect((ind as HTMLElement).style.getPropertyValue("--progress-offset")).toBe("-70%");
  });

  it("takes the brand fill by default and neutral on request", () => {
    const { rerender } = render(<Progress value={50} />);
    const ind = () => screen.getByRole("progressbar").querySelector("[data-slot=progress-indicator]");
    expect(ind()).toHaveClass("bg-surface-primary-emphasis");
    rerender(<Progress value={50} variant="neutral" />);
    expect(ind()).toHaveClass("bg-surface-neutral-emphasis");
  });

  it("draws the label row only when there is a label, and fills in the percentage", () => {
    const { rerender } = render(<Progress value={42} />);
    expect(document.querySelector("[data-slot=progress-label]")).toBeNull();
    rerender(<Progress value={42} label="Importing" />);
    expect(screen.getByText("Importing")).toBeInTheDocument();
    expect(screen.getByText("42%")).toBeInTheDocument();
  });

  it("lets the right-hand label be something other than a percentage", () => {
    render(<Progress value={42} label="Importing" valueLabel="420 of 1,000" />);
    expect(screen.getByText("420 of 1,000")).toBeInTheDocument();
    expect(screen.queryByText("42%")).toBeNull();
  });
});
