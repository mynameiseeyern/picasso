import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { Heatmap, SCALE_BINS } from "./heatmap";

const one = (sel: string) => document.querySelector(sel);
const all = (sel: string) => Array.from(document.querySelectorAll(sel));

const ROWS = [
  { id: "a", label: "syd-01", values: [0, 5, 10] },
  { id: "b", label: "mel-02", values: [10, null, 0] },
];

describe("Heatmap", () => {
  it("bins a value into one of five, low to high", () => {
    render(<Heatmap x={["1", "2", "3"]} rows={ROWS} min={0} max={10} label="Loss" />);
    const bins = all("[data-slot='heatmap-cell']").map((c) => c.getAttribute("data-bin"));
    expect(bins).toEqual(["0", "2", "4", "4", "none", "0"]);
  });

  it("draws no data as an outlined cell, never as the lowest bin", () => {
    render(<Heatmap x={["1", "2", "3"]} rows={ROWS} min={0} max={10} label="x" />);
    const none = all("[data-slot='heatmap-cell'][data-bin='none']");
    expect(none).toHaveLength(1);
    expect(none[0].className).toContain("border-dashed");
    // and it carries none of the scale's fills
    expect(none[0].className).not.toMatch(/bg-chart-scale-/);
    expect(none[0].getAttribute("title")).toContain("no data");
  });

  it("colours by the sequential scale, never the categorical slots", () => {
    render(<Heatmap x={["1", "2", "3"]} rows={ROWS} min={0} max={10} label="x" />);
    for (const c of all("[data-slot='heatmap-cell'][data-bin]:not([data-bin='none'])")) {
      expect(c.className).toMatch(/bg-chart-scale-[1-5]\b/);
      expect(c.className).not.toMatch(/bg-chart-[1-6]\b/);
    }
  });

  it("honours explicit stops, because a band can mean something", () => {
    render(
      <Heatmap
        x={["1"]}
        rows={[{ id: "a", label: "a", values: [4] }]}
        min={0}
        max={100}
        stops={[1, 2, 3, 5]}
        label="x"
      />,
    );
    // 4 falls between the third and fourth stop -> the fourth bin.
    expect(one("[data-slot='heatmap-cell']")?.getAttribute("data-bin")).toBe("3");
  });

  it("shows a legend of exactly five bands", () => {
    render(<Heatmap x={["1"]} rows={ROWS} label="x" />);
    expect(all("[data-slot='heatmap-legend'] li")).toHaveLength(SCALE_BINS);
  });

  it("gives screen readers the numbers, and says No data in words", () => {
    render(<Heatmap x={["1", "2", "3"]} rows={ROWS} label="Packet loss by host" />);
    expect(one("table caption")?.textContent).toBe("Packet loss by host");
    expect(one("tbody")?.textContent).toContain("No data");
    expect(all("tbody tr")).toHaveLength(2);
  });
});
