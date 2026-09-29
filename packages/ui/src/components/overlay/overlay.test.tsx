import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { OverlayScrim, OverlaySurface, overlaySurfaceVariants } from "./overlay";

describe("OverlaySurface", () => {
  it("draws the compact density Figma measures", () => {
    const { container } = render(<OverlaySurface />);
    const cls = container.querySelector("[data-slot=overlay-surface]")!.className;
    // radius/lg, 4 of padding, shadow/md
    expect(cls).toContain("rounded-lg");
    expect(cls).toContain("p-1");
    expect(cls).toContain("shadow-md");
  });

  it("draws the comfortable density", () => {
    const { container } = render(<OverlaySurface density="comfortable" />);
    const cls = container.querySelector("[data-slot=overlay-surface]")!.className;
    // radius/xl, 16 of padding, 16 gap, shadow/lg
    expect(cls).toContain("rounded-xl");
    expect(cls).toContain("p-4");
    expect(cls).toContain("gap-4");
    expect(cls).toContain("shadow-lg");
  });

  it("takes bg/card on a muted border at both densities", () => {
    for (const d of ["compact", "comfortable"] as const) {
      const { container } = render(<OverlaySurface density={d} />);
      const cls = container.querySelector("[data-slot=overlay-surface]")!.className;
      expect(cls).toContain("bg-surface-card");
      expect(cls).toContain("border-line-neutral-muted");
    }
  });

  it("binds the shadow to the scale rather than restating it", () => {
    // Figma carries raw effects whose values equal shadow/md and shadow/lg.
    // Bound here, so the overlay follows the scale if it ever moves.
    expect(overlaySurfaceVariants({ density: "compact" })).toContain("shadow-md");
    expect(overlaySurfaceVariants({ density: "comfortable" })).toContain("shadow-lg");
  });

  it("exports its classes for use on a primitive's own content element", () => {
    // The surface has to land on Radix's Content, not a wrapper, or
    // positioning and the exit animation come apart.
    const cls = overlaySurfaceVariants({ density: "compact" });
    expect(typeof cls).toBe("string");
    expect(cls).toContain("bg-surface-card");
  });
});

describe("OverlayScrim", () => {
  it("dims at half the scrim token and stays out of the tree", () => {
    const { container } = render(<OverlayScrim />);
    const el = container.querySelector("[data-slot=overlay-scrim]")!;
    expect(el.className).toContain("bg-surface-scrim/50");
    expect(el.className).toContain("fixed");
    // The focus trap and the labelling make a dialog a dialog, not the dimming.
    expect(el).toHaveAttribute("aria-hidden", "true");
  });
});
