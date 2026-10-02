import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ChartGrid, KpiRow } from "./page-grid";

/* Columns are a CSS fact, so the counts live in a browser rather than here:
 * measured at container widths 360 → 2256, the chart grid flips at exactly
 * 768 and 1280 and the tile row runs 1, 2, 3, 4, 4, 5, 6, 9 — the numbers in
 * docs/foundations/responsive.md. What these tests hold is that the rule is
 * expressed against the CONTAINER and not the viewport, which is the part a
 * refactor can quietly break. */
describe("KpiRow", () => {
  it("auto-fills rather than stretching, and gaps with the gutter", () => {
    const { container } = render(
      <KpiRow>
        <div>one</div>
      </KpiRow>,
    );
    const row = container.querySelector('[data-slot="kpi-row"]')!;
    expect(row.className).toContain("grid-cols-tiles");
    expect(row.className).toContain("gap-gutter");
  });

  it("renders what it is given", () => {
    render(
      <KpiRow>
        <div>MOS</div>
      </KpiRow>,
    );
    expect(screen.getByText("MOS")).toBeInTheDocument();
  });
});

describe("ChartGrid", () => {
  it("steps 1 → 2 → 3 on the container, never the viewport", () => {
    const { container } = render(
      <ChartGrid>
        <div>a</div>
      </ChartGrid>,
    );
    const cls = container.querySelector('[data-slot="chart-grid"]')!.className;
    expect(cls).toContain("grid-cols-1");
    expect(cls).toContain("@3xl:grid-cols-2");
    expect(cls).toContain("@7xl:grid-cols-3");
    // the viewport does not know about the rail, the padding or a width cap
    expect(cls).not.toMatch(/(^|\s)(sm|md|lg|xl|2xl):/);
  });

  it("stops at two when a page asks it to", () => {
    const { container } = render(
      <ChartGrid max={2}>
        <div>a</div>
      </ChartGrid>,
    );
    const cls = container.querySelector('[data-slot="chart-grid"]')!.className;
    expect(cls).toContain("@3xl:grid-cols-2");
    expect(cls).not.toContain("@7xl:grid-cols-3");
  });
});
