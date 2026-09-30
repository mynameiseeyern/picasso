import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ThresholdSlider } from "./threshold-slider";

/** The band widths, in document order, as percentages. */
function bands(container: HTMLElement) {
  return Array.from(
    container.querySelectorAll('[data-slot^="threshold-slider-band-"]'),
  ).map((el) => ({
    tone: el.getAttribute("data-slot")!.replace("threshold-slider-band-", ""),
    span: (el as HTMLElement).style.getPropertyValue("--span"),
  }));
}

function at(container: HTMLElement, which: string) {
  const el = container.querySelector<HTMLElement>(
    `[data-slot="threshold-slider-thumb-${which}"]`,
  )!;
  return el.style.getPropertyValue("--at");
}

describe("ThresholdSlider", () => {
  it("reads low-is-bad from the order of the thresholds", () => {
    // Network MOS: 1–5, critical 3, warning 4. Higher is better.
    const { container } = render(
      <ThresholdSlider min={1} max={5} critical={3} warning={4} step={0.1} />,
    );
    expect(bands(container)).toEqual([
      { tone: "critical", span: "50%" },
      { tone: "warning", span: "25%" },
      { tone: "healthy", span: "25%" },
    ]);
  });

  it("reads high-is-bad from the order of the thresholds", () => {
    // CPU utilisation: 0–100, warning 70, critical 85. Lower is better.
    const { container } = render(
      <ThresholdSlider min={0} max={100} warning={70} critical={85} />,
    );
    expect(bands(container)).toEqual([
      { tone: "healthy", span: "70%" },
      { tone: "warning", span: "15%" },
      { tone: "critical", span: "15%" },
    ]);
  });

  it("places the thumbs on the band boundaries", () => {
    const { container } = render(
      <ThresholdSlider min={0} max={100} warning={70} critical={85} />,
    );
    expect(at(container, "warning")).toBe("70%");
    expect(at(container, "critical")).toBe("85%");
  });

  it("handles a negative range, where the maximum is the better end", () => {
    // Wi-Fi signal: −90 to −30 dBm, critical −80, warning −70.
    const { container } = render(
      <ThresholdSlider min={-90} max={-30} critical={-80} warning={-70} />,
    );
    const [crit, warn, healthy] = bands(container);
    expect(crit).toEqual({
      tone: "critical",
      span: expect.stringContaining("16.66"),
    });
    expect(warn).toEqual({
      tone: "warning",
      span: expect.stringContaining("16.66"),
    });
    expect(healthy).toEqual({
      tone: "healthy",
      span: expect.stringContaining("66.66"),
    });
  });

  it("moves a threshold with the arrow keys, on the step grid", async () => {
    const onChange = vi.fn();
    render(
      <ThresholdSlider
        min={0}
        max={100}
        warning={70}
        critical={85}
        onChange={onChange}
      />,
    );
    const warn = screen.getByRole("slider", { name: "Warning threshold" });
    warn.focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(onChange).toHaveBeenCalledWith({ warning: 71, critical: 85 });
    await userEvent.keyboard("{PageDown}");
    expect(onChange).toHaveBeenLastCalledWith({ warning: 60, critical: 85 });
  });

  it("keeps a fractional step free of floating-point dust", async () => {
    const onChange = vi.fn();
    render(
      <ThresholdSlider
        min={1}
        max={5}
        critical={3}
        warning={4}
        step={0.1}
        onChange={onChange}
      />,
    );
    screen.getByRole("slider", { name: "Critical threshold" }).focus();
    await userEvent.keyboard("{ArrowRight}");
    // 3 + 0.1 is 3.0000000000000004 before it is snapped.
    expect(onChange).toHaveBeenCalledWith({ warning: 4, critical: 3.1 });
  });

  it("lets the thumbs meet but never cross", async () => {
    const onChange = vi.fn();
    render(
      <ThresholdSlider
        min={0}
        max={100}
        warning={70}
        critical={85}
        onChange={onChange}
      />,
    );
    // End would take warning to 100, past critical at 85.
    screen.getByRole("slider", { name: "Warning threshold" }).focus();
    await userEvent.keyboard("{End}");
    expect(onChange).toHaveBeenCalledWith({ warning: 85, critical: 85 });
    onChange.mockClear();
    // Home would take critical to 0, past warning at 70.
    screen.getByRole("slider", { name: "Critical threshold" }).focus();
    await userEvent.keyboard("{Home}");
    expect(onChange).toHaveBeenCalledWith({ warning: 70, critical: 70 });
  });

  it("tells assistive tech the bound is the other thumb, not the track end", () => {
    render(<ThresholdSlider min={0} max={100} warning={70} critical={85} />);
    const warn = screen.getByRole("slider", { name: "Warning threshold" });
    const crit = screen.getByRole("slider", { name: "Critical threshold" });
    expect(warn).toHaveAttribute("aria-valuemin", "0");
    expect(warn).toHaveAttribute("aria-valuemax", "85");
    expect(crit).toHaveAttribute("aria-valuemin", "70");
    expect(crit).toHaveAttribute("aria-valuemax", "100");
  });

  it("speaks values in the caller's format, not raw numbers", () => {
    const format = (v: number) => `${v} dBm`;
    render(
      <ThresholdSlider
        min={-90}
        max={-30}
        critical={-80}
        warning={-70}
        format={format}
      />,
    );
    expect(
      screen.getByRole("slider", { name: "Critical threshold" }),
    ).toHaveAttribute("aria-valuetext", "-80 dBm");
    expect(screen.getByText("-90 dBm")).toBeInTheDocument();
    expect(screen.getByText("-30 dBm")).toBeInTheDocument();
  });

  it("stays readable when disabled, and stops responding", async () => {
    const onChange = vi.fn();
    const { container } = render(
      <ThresholdSlider
        min={0}
        max={100}
        warning={70}
        critical={85}
        disabled
        onChange={onChange}
      />,
    );
    const root = container.querySelector('[data-slot="threshold-slider"]')!;
    expect(root.className).toContain("opacity-50");
    const warn = screen.getByRole("slider", { name: "Warning threshold" });
    // Out of the tab order but still in the accessibility tree: a disabled
    // control is still something you may need to read.
    expect(warn).toHaveAttribute("tabindex", "-1");
    expect(warn).toHaveAttribute("aria-disabled", "true");
    await userEvent.keyboard("{ArrowRight}");
    expect(onChange).not.toHaveBeenCalled();
  });

  it("does not fire onChange when a key would not move anything", async () => {
    const onChange = vi.fn();
    render(
      <ThresholdSlider
        min={0}
        max={100}
        warning={0}
        critical={85}
        onChange={onChange}
      />,
    );
    screen.getByRole("slider", { name: "Warning threshold" }).focus();
    await userEvent.keyboard("{ArrowLeft}");
    expect(onChange).not.toHaveBeenCalled();
  });
});
