import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { Skeleton, SkeletonText } from "./skeleton";

describe("Skeleton", () => {
  it("is hidden from assistive tech", () => {
    const { container } = render(<Skeleton className="h-4 w-32" />);
    // Twelve empty boxes announced one by one tells the person nothing. The
    // container announces the wait once; the skeletons are scenery.
    expect(container.querySelector("[data-slot=skeleton]")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });

  it("stops pulsing under prefers-reduced-motion", () => {
    const { container } = render(<Skeleton />);
    const el = container.querySelector("[data-slot=skeleton]")!;
    expect(el.className).toContain("animate-pulse");
    expect(el.className).toContain("motion-reduce:animate-none");
  });

  it("takes a visible surface, not the one that matches the page", () => {
    const { container } = render(<Skeleton />);
    // bg/neutral/subtle is the app background in light and the card in dark,
    // so a skeleton on it would be invisible on one of them. bg/layer/* is a
    // tint, and is seen on any surface.
    const cls = container.querySelector("[data-slot=skeleton]")!.className;
    expect(cls).toContain("bg-surface-layer-muted");
    expect(cls).not.toContain("bg-surface-neutral-");
  });

  it("takes its shape from a variant, not from outside", () => {
    const { container, rerender } = render(<Skeleton />);
    const el = () => container.querySelector("[data-slot=skeleton]")!;
    expect(el().className).toContain("rounded-md");
    rerender(<Skeleton shape="circle" />);
    // An avatar skeleton is mirroring the content, not restyling the
    // component — so it is a variant rather than a class from the page.
    expect(el().className).toContain("rounded-full");
  });
});

describe("SkeletonText", () => {
  it("stands in for the number of lines asked for", () => {
    const { container } = render(<SkeletonText lines={4} />);
    expect(container.querySelectorAll("[data-slot=skeleton]")).toHaveLength(4);
  });

  it("shortens the last line, because paragraphs end mid-line", () => {
    const { container } = render(<SkeletonText lines={3} />);
    const bars = [...container.querySelectorAll("[data-slot=skeleton]")];
    expect(bars.slice(0, -1).every((b) => !b.className.includes("w-3/5"))).toBe(
      true,
    );
    expect(bars.at(-1)!.className).toContain("w-3/5");
  });

  it("leaves a single line full width — one line is not a paragraph", () => {
    const { container } = render(<SkeletonText lines={1} />);
    expect(
      container.querySelector("[data-slot=skeleton]")!.className,
    ).not.toContain("w-3/5");
  });
});
