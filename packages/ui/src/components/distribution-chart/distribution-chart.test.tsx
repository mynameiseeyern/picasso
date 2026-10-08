import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { DistributionChart } from "./distribution-chart";

const one = (sel: string) => document.querySelector(sel);
const all = (sel: string) => Array.from(document.querySelectorAll(sel));

describe("DistributionChart", () => {
  it("bins the raw samples rather than asking the caller to", () => {
    render(
      <DistributionChart
        values={[0, 0, 0, 10, 10, 20]}
        bins={2}
        min={0}
        max={20}
        label="Latency"
      />,
    );
    const counts = all("[data-slot='chart-bin']").map((b) => b.getAttribute("data-count"));
    // 0–10 holds the three zeros; 10–20 holds the rest, top edge included.
    expect(counts).toEqual(["3", "3"]);
  });

  it("keeps an empty bucket's slot, so the spread does not look narrower", () => {
    render(
      <DistributionChart values={[0, 0, 20, 20]} bins={4} min={0} max={20} label="x" />,
    );
    const bins = all("[data-slot='chart-bin']");
    expect(bins).toHaveLength(4);
    expect(bins.map((b) => b.getAttribute("data-count"))).toEqual(["2", "0", "0", "2"]);
  });

  it("puts the top edge in the last bucket rather than off the end", () => {
    render(<DistributionChart values={[10]} bins={2} min={0} max={10} label="x" />);
    const counts = all("[data-slot='chart-bin']").map((b) => b.getAttribute("data-count"));
    expect(counts).toEqual(["0", "1"]);
  });

  it("draws markers down the measured axis, not across the count axis", () => {
    render(
      <DistributionChart
        values={[0, 5, 10]}
        min={0}
        max={10}
        markers={[{ value: 5, label: "p95" }]}
        label="x"
      />,
    );
    const m = one("[data-slot='chart-marker']") as HTMLElement;
    expect(m).not.toBeNull();
    // Halfway along the measured axis — an inline offset, not a vertical one.
    expect(m.style.getPropertyValue("--at")).toBe("50%");
    expect(m.className).toContain("start-(--at)");
    expect(m.className).toContain("top-0");
  });

  it("does not draw a marker that falls off the scale", () => {
    // Clamping it to the edge would draw a line that says the limit is 10 when
    // it is 500 — a wrong answer rather than a missing one.
    render(
      <DistributionChart
        values={[0, 5, 10]}
        min={0}
        max={10}
        markers={[{ value: 5, label: "in" }, { value: 500, label: "off" }]}
        label="x"
      />,
    );
    const drawn = all("[data-slot='chart-marker']").map((m) => m.getAttribute("data-value"));
    expect(drawn).toEqual(["5"]);
    expect(one("[data-slot='chart-marker-label']")?.textContent).toBe("in");
  });

  it("tucks a marker label inside when it would run off the end", () => {
    render(
      <DistributionChart
        values={[0, 10]}
        min={0}
        max={10}
        markers={[{ value: 10, label: "max" }, { value: 1, label: "min" }]}
        label="x"
      />,
    );
    const labels = all("[data-slot='chart-marker-label']");
    const atEnd = labels.find((l) => l.textContent === "max")!;
    const atStart = labels.find((l) => l.textContent === "min")!;
    expect(atEnd.className).toContain("-translate-x-full");
    expect(atStart.className).not.toContain("-translate-x-full");
  });

  it("uses one series colour, never the categorical slots", () => {
    render(<DistributionChart values={[1, 2, 3]} label="x" />);
    const filled = all("[data-slot='chart-bin'] > div");
    expect(filled.length).toBeGreaterThan(0);
    for (const f of filled) {
      expect(f.className).not.toMatch(/bg-chart-[2-6]\b/);
    }
    expect(filled.some((f) => f.className.includes("bg-chart-1"))).toBe(true);
  });

  it("gives screen readers the numbers", () => {
    render(<DistributionChart values={[1, 2, 3]} bins={2} label="Jitter spread" />);
    expect(one("table caption")?.textContent).toBe("Jitter spread");
    expect(all("tbody tr")).toHaveLength(2);
  });
});
