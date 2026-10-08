import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { Sparkline } from "./sparkline";

const q = (s: string) => document.querySelectorAll(s);
const one = (s: string) => document.querySelector(s);
const line = () => one("[data-slot='sparkline-line']") as SVGPathElement | null;

describe("Sparkline", () => {
  it("draws one path for a complete series", () => {
    render(<Sparkline values={[1, 2, 3, 2]} label="up then down" />);
    expect(q("[data-slot='sparkline-line']")).toHaveLength(1);
  });

  it("breaks the path at a gap rather than bridging it", () => {
    render(<Sparkline values={[1, 2, null, null, 3, 4]} label="with a gap" />);
    const paths = q("[data-slot='sparkline-line']");
    expect(paths).toHaveLength(2);
    // Neither segment may contain a point for the missing readings.
    for (const p of paths) expect(p.getAttribute("d")).not.toContain("NaN");
  });

  it("never plots a gap as the floor", () => {
    render(<Sparkline values={[5, 5, null, 5]} min={0} max={5} label="x" />);
    // y=100 is the floor of the 0–100 box. A bridged gap would put a vertex there.
    for (const p of q("[data-slot='sparkline-line']"))
      expect(p.getAttribute("d")).not.toMatch(/ 100\.00/);
  });

  it("keeps a lone reading between two gaps visible", () => {
    render(<Sparkline values={[1, null, 5, null, 2]} label="three islands" />);
    // Three runs of one: nothing to draw as a line, so each is a point.
    expect(q("[data-slot='sparkline-line']")).toHaveLength(0);
    expect(q("[data-slot='sparkline-point']")).toHaveLength(3);
  });

  it("holds the line at 2px however the box is stretched", () => {
    render(<Sparkline values={[1, 2, 3]} label="x" />);
    expect(line()).toHaveAttribute("stroke-width", "2");
    expect(line()).toHaveAttribute("vector-effect", "non-scaling-stroke");
    expect(line()).toHaveAttribute("stroke-linecap", "round");
  });

  it("pins the scale when told to, and fits the data when not", () => {
    const { unmount } = render(
      <Sparkline values={[4, 5]} min={0} max={10} label="x" />,
    );
    // 4 and 5 of 0–10 sit at 60 and 50 — mid-box, not edge to edge.
    expect(line()!.getAttribute("d")).toBe("M0.00 60.00 L100.00 50.00");
    unmount();
    render(<Sparkline values={[4, 5]} label="x" />);
    // Unpinned, the same two readings fill the box.
    expect(line()!.getAttribute("d")).toBe("M0.00 100.00 L100.00 0.00");
  });

  it("puts a flat series on the centre line, not on the floor", () => {
    render(<Sparkline values={[3, 3, 3]} label="steady" />);
    expect(line()!.getAttribute("d")).toBe("M0.00 50.00 L50.00 50.00 L100.00 50.00");
  });

  it("marks the newest point, and can be asked not to", () => {
    const { unmount } = render(<Sparkline values={[1, 2, 3]} label="x" />);
    expect(one("[data-slot='sparkline-end']")).not.toBeNull();
    unmount();
    render(<Sparkline values={[1, 2, 3]} end={false} label="x" />);
    expect(one("[data-slot='sparkline-end']")).toBeNull();
  });

  it("positions the end dot through custom properties, so it stays a circle", () => {
    render(<Sparkline values={[0, 10]} min={0} max={10} label="x" />);
    const dot = one("[data-slot='sparkline-end']") as HTMLElement;
    // x is clamped so the dot and its 2px ring cannot hang outside the box.
    // A sparkline's last reading is always at 100%, and the 6px of overhang
    // that produced scrolled the whole page sideways on a 360px phone.
    expect(dot.style.getPropertyValue("--spark-x")).toBe(
      "clamp(0.375rem, 100%, calc(100% - 0.375rem))",
    );
    expect(dot.style.getPropertyValue("--spark-y")).toBe("0%");
    expect(dot.className).toContain("rounded-full");
    expect(dot.className).toContain("ring-surface-card");
  });

  it("draws the threshold where it falls, and not at all when it is off-scale", () => {
    const { unmount } = render(
      <Sparkline values={[0, 10]} min={0} max={10} threshold={5} label="x" />,
    );
    expect(one("[data-slot='sparkline-threshold']")).toHaveAttribute("y1", "50");
    unmount();
    render(
      <Sparkline values={[0, 10]} min={0} max={10} threshold={50} label="x" />,
    );
    expect(one("[data-slot='sparkline-threshold']")).toBeNull();
  });

  it("fills under the line only in the area variant", () => {
    const { unmount } = render(<Sparkline values={[1, 2]} label="x" />);
    expect(one("[data-slot='sparkline-area']")).toBeNull();
    unmount();
    render(<Sparkline values={[1, 2]} variant="area" label="x" />);
    // getAttribute, not className: on an SVG element className is an
    // SVGAnimatedString, not a string.
    expect(one("[data-slot='sparkline-area']")!.getAttribute("class")).toContain(
      "fill-current/15",
    );
  });

  it("names itself, or hides, but never guesses", () => {
    const { unmount } = render(
      <Sparkline values={[1, 2]} label="MOS over 24 hours, 4.4 to 4.1" />,
    );
    const el = () => one("[data-slot='sparkline']")!;
    expect(el()).toHaveAttribute("role", "img");
    expect(el()).toHaveAttribute(
      "aria-label",
      "MOS over 24 hours, 4.4 to 4.1",
    );
    unmount();
    render(<Sparkline values={[1, 2]} label={null} />);
    expect(el()).toHaveAttribute("aria-hidden");
    expect(el()).not.toHaveAttribute("role");
  });

  it("marks itself empty when there is not enough to draw", () => {
    render(<Sparkline values={[4]} label={null} />);
    expect(one("[data-slot='sparkline']")).toHaveAttribute("data-empty");
    expect(one("[data-slot='sparkline-line']")).toBeNull();
  });

  it("is not interactive — nothing to read point by point, nothing to tab to", () => {
    render(<Sparkline values={[1, 2, 3]} label="x" />);
    expect(one("[data-slot='sparkline']")).not.toHaveAttribute("tabindex");
    expect(q("title")).toHaveLength(0);
  });
});
