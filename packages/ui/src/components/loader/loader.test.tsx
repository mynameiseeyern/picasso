import { describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import { Loader } from "./loader";

describe("Loader", () => {
  it("is a polite status region with a default label", () => {
    render(<Loader />);
    const status = screen.getByRole("status");
    expect(status).toHaveAttribute("aria-live", "polite");
    expect(status).toHaveTextContent("Loading");
  });

  it("names the work when given a label", () => {
    render(<Loader variant="fuse" label="Bringing your fleet online" />);
    expect(screen.getByRole("status")).toHaveTextContent(
      "Bringing your fleet online",
    );
  });

  it("is hidden from assistive tech with label={null}", () => {
    const { container } = render(<Loader label={null} />);
    expect(screen.queryByRole("status")).toBeNull();
    expect(container.querySelector("[data-slot=loader]")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });

  it("pulse waits 400ms before appearing", () => {
    vi.useFakeTimers();
    render(<Loader variant="pulse" />);
    expect(screen.queryByRole("status")).toBeNull();
    act(() => vi.advanceTimersByTime(400));
    expect(screen.getByRole("status")).toHaveTextContent("Iris is thinking");
    vi.useRealTimers();
  });

  it("pulse scales the middle dot against the outer pair", () => {
    const { container } = render(<Loader variant="pulse" delay={0} />);
    const dots = container.querySelectorAll("[data-slot=loader-pulse] i");
    expect(dots).toHaveLength(3);
    expect(dots[0].className).toContain("animate-loader-pulse-l");
    expect(dots[1].className).toContain("animate-loader-pulse-m");
    expect(dots[2].className).toContain("animate-loader-pulse-r");
  });

  it("pulse steps the lead blue down on a tinted surface", () => {
    const { container, rerender } = render(
      <Loader variant="pulse" delay={0} />,
    );
    const lead = () => container.querySelector("[data-slot=loader-pulse] i")!;
    expect(lead().className).toContain("bg-chart-4");
    rerender(<Loader variant="pulse" delay={0} onTint />);
    expect(lead().className).toContain("bg-content-info-muted");
  });

  it("fuse carries its own goo filter, unique per instance", () => {
    const { container } = render(
      <>
        <Loader variant="fuse" />
        <Loader variant="fuse" />
      </>,
    );
    const filters = container.querySelectorAll("filter");
    expect(filters).toHaveLength(2);
    expect(filters[0].id).not.toBe(filters[1].id);
    const body = container.querySelector(`[style*="${filters[0].id}"]`);
    expect(body).not.toBeNull();
  });

  it("fuse falls back to a cross-fade under reduced motion", () => {
    const { container } = render(<Loader variant="fuse" />);
    const drop = container.querySelector(".animate-loader-reach")!;
    expect(drop.className).toContain("motion-reduce:animate-loader-fade");
  });
});
