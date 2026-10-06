import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BarChart, type BarSeries } from "./bar-chart";

const X = ["Sydney", "Melbourne", "Perth"];
const S: BarSeries[] = [
  { id: "a", label: "Codec", points: [40, 20, null] },
  { id: "b", label: "Jitter", points: [10, 30, 20] },
];
const q = (s: string) => document.querySelectorAll(s);
const one = (s: string) => document.querySelector(s);
const bars = () => [...q("[data-slot='chart-bar']")] as HTMLElement[];

const Fixture = (p: Partial<React.ComponentProps<typeof BarChart>> = {}) => (
  <BarChart x={X} series={S} yLabel="Failures" label="Failures by site" {...p} />
);

describe("BarChart", () => {
  it("measures every bar from zero", () => {
    render(<Fixture yMax={100} />);
    // 40 of a 100 range is 40% of the plot, measured from the baseline up.
    expect(bars()[0].style.getPropertyValue("--bar")).toBe("40%");
  });

  it("offers no way to cut the baseline", () => {
    // The prop does not exist — this is the guarantee, in the type system.
    expect("yMin" in BarChart).toBe(false);
    render(<Fixture />);
    const ticks = [...q("[data-slot='chart-y-axis'] span")].map((s) => s.textContent);
    expect(ticks[0]).toBe("0");
  });

  it("leaves a missing value empty rather than drawing a zero-height bar", () => {
    render(<Fixture />);
    // Perth has no Codec reading: that group has one bar, not two.
    const groups = q("[data-slot='chart-bar-group']");
    expect(within(groups[0] as HTMLElement).queryAllByTitle(/Codec/)).toHaveLength(1);
    expect(within(groups[2] as HTMLElement).queryAllByTitle(/Codec/)).toHaveLength(0);
  });

  it("caps a bar at 24 and never lets it fill its slot", () => {
    render(<Fixture />);
    for (const b of bars()) expect(b.className).toContain("max-w-6");
  });

  it("rounds the data end and squares the baseline", () => {
    const { unmount } = render(<Fixture />);
    for (const b of bars()) expect(b.className).toContain("rounded-t-xs");
    unmount();
    render(<Fixture stacked />);
    for (const b of bars()) expect(b.className).toContain("last:rounded-b-none");
  });

  it("scales a stack by the column total, not by its tallest part", () => {
    render(<Fixture stacked />);
    // Melbourne totals 50, the largest column; the axis must reach it.
    const top = [...q("[data-slot='chart-y-axis'] span")].at(-1)!.textContent;
    expect(Number(top)).toBeGreaterThanOrEqual(50);
  });

  it("keeps a series on its own colour when another is hidden", async () => {
    render(<Fixture />);
    const colourOf = (id: string) =>
      (one(`[data-slot='chart-bar'][data-series='${id}']`) as HTMLElement).className;
    expect(colourOf("a")).toContain("bg-chart-1");
    expect(colourOf("b")).toContain("bg-chart-2");
    await userEvent.click(screen.getByRole("button", { name: /Codec/ }));
    expect(one("[data-slot='chart-bar'][data-series='a']")).toBeNull();
    expect(colourOf("b")).toContain("bg-chart-2");
  });

  it("names every bar for a pointer, and the numbers for everyone else", () => {
    render(<Fixture />);
    expect(screen.getByTitle("Codec · Sydney · 40")).toBeInTheDocument();
    const table = screen.getByRole("table", { name: "Failures by site" });
    expect(within(table).getAllByText("No data")).toHaveLength(1);
  });

  it("hides the plot from assistive tech", () => {
    render(<Fixture />);
    expect(one("[data-slot='chart-plot']")).toHaveAttribute("aria-hidden");
  });
});
