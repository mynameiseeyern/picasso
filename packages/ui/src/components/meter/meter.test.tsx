import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Meter, litSegments } from "./meter";

const lit = (el: HTMLElement) => [...el.children].filter((c) => (c as HTMLElement).dataset.lit).length;

describe("Meter", () => {
  it("moves in 20% steps and always rounds up", () => {
    // The examples from the Figma component's own description.
    expect(litSegments(0, 5)).toBe(0);
    expect(litSegments(0.6, 5)).toBe(2); // 12% → 20%
    expect(litSegments(3.2, 5)).toBe(8); // 64% → 80%
    expect(litSegments(5, 5)).toBe(10);
  });

  it("lights at least one step for any non-zero value", () => {
    // "so any non-zero value lights at least one step" — a reading of 0.01
    // is not nothing, and a bar showing nothing would say it was.
    expect(litSegments(0.01, 100)).toBe(2);
  });

  it("lights nothing at zero, and nothing for nonsense", () => {
    expect(litSegments(0, 5)).toBe(0);
    expect(litSegments(-1, 5)).toBe(0);
    expect(litSegments(1, 0)).toBe(0);
    expect(litSegments(Number.NaN, 5)).toBe(0);
  });

  it("clamps above the ceiling rather than overflowing", () => {
    expect(litSegments(9, 5)).toBe(10);
  });

  it("draws ten segments and lights them from the status palette", () => {
    render(<Meter value={4} max={5} status="healthy" data-testid="m" />);
    const m = screen.getByTestId("m");
    expect(m.children).toHaveLength(10);
    expect(lit(m)).toBe(8);
    expect(m.children[0]).toHaveClass("bg-status-healthy");
    expect(m.children[9]).toHaveClass("bg-line-neutral-muted");
  });

  it("shows nothing at all when the status is unknown", () => {
    render(<Meter value={4} max={5} status="unknown" data-testid="m" />);
    // No reading is not the same as a low reading — an unknown meter that
    // showed 80% would be inventing data.
    expect(lit(screen.getByTestId("m"))).toBe(0);
  });

  it("is hidden from assistive technology", () => {
    render(<Meter value={4} max={5} data-testid="m" />);
    // Figma: "Decorative on its own — always pair with a visible value."
    // The number beside it is what gets read; announcing both says it twice.
    expect(screen.getByTestId("m")).toHaveAttribute("aria-hidden");
  });
});
