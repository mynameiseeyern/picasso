import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { KpiTile } from "./kpi-tile";

describe("KpiTile", () => {
  it("is a quieter surface than a Card, on purpose", () => {
    render(<KpiTile label="Conversion rate" value="3.5%" data-testid="t" />);
    const tile = screen.getByTestId("t");
    // Card is border/neutral/muted + shadow/xs; a tile sits in a grid of its
    // peers, so Figma gives it a lighter edge and no lift. Not a bug.
    expect(tile).toHaveClass(
      "border-line-neutral-muted",
      "bg-surface-card",
      "rounded-xl",
    );
    expect(tile.className).not.toContain("shadow");
  });

  it("puts the number in the metric face and the label in the quiet one", () => {
    render(
      <KpiTile
        label="Conversion rate"
        value="3.5%"
        unit="of 5"
        data-testid="t"
      />,
    );
    expect(screen.getByText("Conversion rate")).toHaveClass(
      "text-heading-sm",
      "text-content-neutral-muted",
    );
    expect(screen.getByText("3.5%")).toHaveClass(
      "text-metric-xl",
      "text-content-neutral-emphasis",
    );
    expect(screen.getByText("of 5")).toHaveClass(
      "text-body-md",
      "text-content-neutral-muted",
    );
  });

  it("says the status in words, not only in colour", () => {
    render(<KpiTile label="Network MOS" value="4.0" status="healthy" />);
    // The Figma description says the badge exists "so status never relies on
    // colour alone" — which is why the word comes with the tone by default.
    expect(screen.getByText("Healthy")).toBeInTheDocument();
  });

  it("names each tone with its own word", () => {
    for (const [status, word] of [
      ["healthy", "Healthy"],
      ["warning", "Warning"],
      ["critical", "Critical"],
      ["unknown", "Unknown"],
    ] as const) {
      const { unmount } = render(
        <KpiTile label="MOS" value="4.0" status={status} />,
      );
      expect(screen.getByText(word)).toBeInTheDocument();
      unmount();
    }
  });

  it("has no badge when there is no status", () => {
    render(<KpiTile label="Conversion rate" value="3.5%" data-testid="t" />);
    expect(
      screen.getByTestId("t").querySelector("[data-slot=badge]"),
    ).toBeNull();
  });

  it("draws a meter only when one is asked for, and colours it with the status", () => {
    const { rerender } = render(
      <KpiTile label="MOS" value="4.0" status="healthy" data-testid="t" />,
    );
    expect(
      screen.getByTestId("t").querySelector("[data-slot=meter]"),
    ).toBeNull();
    rerender(
      <KpiTile
        label="MOS"
        value="4.0"
        status="critical"
        meter={{ value: 1.2, max: 5 }}
        data-testid="t"
      />,
    );
    const meter = screen.getByTestId("t").querySelector("[data-slot=meter]");
    expect(meter).toHaveAttribute("data-status", "critical");
    expect(meter?.children[0]).toHaveClass("bg-status-critical");
  });

  it("opens the content gap when a meter is present", () => {
    const { rerender } = render(
      <KpiTile label="MOS" value="4.0" data-testid="t" />,
    );
    const content = () =>
      screen.getByTestId("t").querySelector("[data-slot=kpi-tile-content]");
    expect(content()).toHaveClass("gap-2");
    rerender(
      <KpiTile
        label="MOS"
        value="4.0"
        status="healthy"
        meter={{ value: 4, max: 5 }}
        data-testid="t"
      />,
    );
    expect(content()).toHaveClass("gap-3");
  });

  it("takes an action, a comparison and a footer without reordering them", () => {
    render(
      <KpiTile
        label="Endpoints"
        value="3,412"
        action={<button type="button">Options</button>}
        comparison={<span>+2.1%</span>}
        footer={<a href="#all">See all</a>}
        data-testid="t"
      />,
    );
    const tile = screen.getByTestId("t");
    expect(tile.querySelector("[data-slot=kpi-tile-action]")).not.toBeNull();
    expect(
      tile.querySelector("[data-slot=kpi-tile-comparison]"),
    ).not.toBeNull();
    expect(tile.querySelector("[data-slot=kpi-tile-footer]")).not.toBeNull();
  });

  it("sends status=none to the meter as neutral, not unknown", () => {
    const { container } = render(
      <KpiTile
        label="JITTER"
        value="12"
        unit="ms"
        meter={{ value: 60, max: 100 }}
      />,
    );
    const meter = container.querySelector('[data-slot="meter"]')!;
    expect(meter).toHaveAttribute("data-status", "neutral");
    expect(
      [...meter.children].filter((s) =>
        s.className.includes("bg-content-neutral-muted"),
      ),
    ).toHaveLength(6);
  });
});
