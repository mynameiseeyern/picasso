import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TimeSeriesChart, type TimeSeries } from "./time-series-chart";
import { niceScale } from "./chart";

const X = ["09:00", "10:00", "11:00", "12:00"];
const S: TimeSeries[] = [
  { id: "a", label: "Alpha", points: [4, 4.2, 4.1, 4.3] },
  { id: "b", label: "Bravo", points: [3.2, null, 3.4, 3.5] },
];
const q = (s: string) => document.querySelectorAll(s);
const one = (s: string) => document.querySelector(s);

function Fixture(props: Partial<React.ComponentProps<typeof TimeSeriesChart>> = {}) {
  return (
    <TimeSeriesChart
      x={X}
      series={S}
      yLabel="MOS"
      label="Mean opinion score for two trunks"
      format={(v) => v.toFixed(1)}
      {...props}
    />
  );
}

describe("niceScale", () => {
  it("ends on round numbers rather than on the data", () => {
    const s = niceScale([3.2, 4.37]);
    expect(s.lo).toBe(3);
    expect(s.hi).toBe(4.5);
    expect(s.ticks).toEqual([3, 3.5, 4, 4.5]);
  });

  it("honours pinned ends", () => {
    const s = niceScale([3.2, 4.37], { min: 0, max: 5 });
    expect([s.lo, s.hi]).toEqual([0, 5]);
  });

  it("does not let a flat series collapse the range", () => {
    const s = niceScale([4, 4, 4]);
    expect(s.hi).toBeGreaterThan(s.lo);
  });

  it("walks ticks from the index, so floats do not drift off the step", () => {
    const s = niceScale([0, 1], { min: 0, max: 1, count: 10 });
    for (const t of s.ticks) expect(Number.isFinite(t)).toBe(true);
    expect(new Set(s.ticks).size).toBe(s.ticks.length);
  });
});

describe("TimeSeriesChart", () => {
  it("draws a line per series, and breaks one at a gap", () => {
    render(<Fixture />);
    expect(q("[data-series='a'] [data-slot='chart-line']")).toHaveLength(1);
    // Bravo is split by the missing 10:00 reading. The first run is a single
    // reading with nothing to join it to, so it is drawn as a point rather
    // than vanishing; the second run is the line.
    expect(q("[data-series='b'] [data-slot='chart-line']")).toHaveLength(1);
    expect(q("[data-series='b'] [data-slot='chart-point']")).toHaveLength(1);
  });

  it("hides the picture from assistive tech and carries the numbers in a table", () => {
    render(<Fixture />);
    expect(one("[data-slot='chart-plot']")).toHaveAttribute("aria-hidden");
    const table = screen.getByRole("table", {
      name: "Mean opinion score for two trunks",
    });
    // Every reading, and the gap named rather than left blank.
    expect(within(table).getAllByText("No data")).toHaveLength(1);
    expect(within(table).getByText("4.2")).toBeInTheDocument();
  });

  it("shows a legend from two series up, and none for one", () => {
    const { unmount } = render(<Fixture />);
    expect(one("[data-slot='chart-legend']")).not.toBeNull();
    unmount();
    render(<Fixture series={[S[0]]} />);
    expect(one("[data-slot='chart-legend']")).toBeNull();
  });

  it("keeps a series on its own colour when another is hidden", async () => {
    render(<Fixture />);
    const stroke = (id: string) =>
      one(`[data-series='${id}'] [data-slot='chart-line']`)?.getAttribute("class");
    expect(stroke("a")).toContain("stroke-chart-1");
    expect(stroke("b")).toContain("stroke-chart-2");

    await userEvent.click(screen.getByRole("button", { name: /Alpha/ }));
    expect(one("[data-series='a']")).toBeNull();
    // Bravo must NOT be promoted into slot 1.
    expect(stroke("b")).toContain("stroke-chart-2");
  });

  it("refuses to hide the last visible series", async () => {
    render(<Fixture />);
    await userEvent.click(screen.getByRole("button", { name: /Alpha/ }));
    await userEvent.click(screen.getByRole("button", { name: /Bravo/ }));
    expect(q("[data-slot='chart-series']").length).toBeGreaterThan(0);
  });

  it("fills under one series and refuses to for two", () => {
    const { unmount } = render(<Fixture variant="area" series={[S[0]]} />);
    expect(one("[data-slot='chart-area']")).not.toBeNull();
    unmount();
    render(<Fixture variant="area" />);
    expect(one("[data-slot='chart-area']")).toBeNull();
  });

  it("draws a threshold inside the range and drops one outside it", () => {
    const { unmount } = render(
      <Fixture yMin={0} yMax={5} threshold={{ value: 3.6, label: "SLA" }} />,
    );
    expect(one("[data-slot='chart-threshold']")).not.toBeNull();
    expect(one("[data-slot='chart-threshold-label']")).toHaveTextContent("SLA");
    unmount();
    render(<Fixture yMin={0} yMax={5} threshold={{ value: 50 }} />);
    expect(one("[data-slot='chart-threshold']")).toBeNull();
  });

  it("holds every stroke at its own weight however wide the box", () => {
    render(<Fixture />);
    for (const p of q("[data-slot='chart-line']"))
      expect(p).toHaveAttribute("vector-effect", "non-scaling-stroke");
  });

  it("rules the grid horizontally only — a gridline per reading is a cage", () => {
    render(<Fixture yMin={0} yMax={5} />);
    const lines = [...q("[data-slot='chart-grid'] line")];
    expect(lines.length).toBeGreaterThan(0);
    for (const l of lines)
      expect(l.getAttribute("y1")).toBe(l.getAttribute("y2"));
  });

  it("has no crosshair until a pointer is in the plot", () => {
    render(<Fixture />);
    expect(one("[data-slot='chart-crosshair']")).toBeNull();
    expect(one("[data-slot='chart-tooltip']")).toBeNull();
  });
});

describe("niceScale, pinned ranges", () => {
  it("lands a tick on the top of a pinned range", () => {
    const s = niceScale([3, 4], { min: 2.5, max: 5 });
    expect(s.ticks.at(-1)).toBe(5);
    expect(s.ticks).toEqual([2.5, 3, 3.5, 4, 4.5, 5]);
  });

  it("still ends on round numbers when the range is open", () => {
    const s = niceScale([3.2, 4.37]);
    expect(s.ticks).toEqual([3, 3.5, 4, 4.5]);
  });

  it("handles a pinned range that no nice step divides", () => {
    const s = niceScale([0, 1], { min: 0, max: 7 });
    expect(s.lo).toBe(0);
    expect(s.hi).toBe(7);
    expect(s.ticks.length).toBeGreaterThan(1);
  });
});

describe("ChartYAxis", () => {
  it("tucks its end labels inside the plot instead of hanging them outside", () => {
    render(<Fixture yMin={0} yMax={5} />);
    const labels = [...document.querySelectorAll("[data-slot='chart-y-axis'] span")];
    expect(labels.length).toBeGreaterThan(2);
    // ticks run low → high, so the first sits at the bottom and the last at the top
    expect(labels[0].className).toContain("-translate-y-full");
    expect(labels.at(-1)!.className).toContain("translate-y-0");
    for (const mid of labels.slice(1, -1))
      expect(mid.className).toContain("-translate-y-1/2");
  });
});
