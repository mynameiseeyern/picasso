import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Calendar } from "./calendar";

const JAN = new Date(2026, 0, 15);

describe("Calendar", () => {
  it("is a grid, and does not announce the weekday row twice", () => {
    const { container } = render(<Calendar month={JAN} />);
    expect(screen.getByRole("grid")).toBeInTheDocument();
    // The weekday row is aria-hidden on purpose: every day cell carries a
    // full date label, so a "Su" column header would only repeat it.
    expect(container.querySelectorAll("thead th")).toHaveLength(7);
    expect(container.querySelector("thead")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });

  it("names the month it is showing", () => {
    render(<Calendar month={JAN} />);
    expect(screen.getByText("January 2026")).toBeInTheDocument();
  });

  it("moves month on the arrows", async () => {
    const user = userEvent.setup();
    render(<Calendar defaultMonth={JAN} />);
    await user.click(screen.getByRole("button", { name: /previous/i }));
    expect(screen.getByText("December 2025")).toBeInTheDocument();
  });

  it("selects a day and reports it", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<Calendar mode="single" month={JAN} onSelect={onSelect} />);
    await user.click(screen.getByRole("button", { name: /15th/i }));
    expect(onSelect).toHaveBeenCalled();
    expect(onSelect.mock.calls[0][0]).toBeInstanceOf(Date);
  });

  it("marks the selected day on the cell, where assistive tech reads it", () => {
    const { container } = render(
      <Calendar mode="single" month={JAN} selected={JAN} />,
    );
    // aria-selected and data-selected land on the gridcell, not on the
    // button inside it — so styling hangs off the cell too.
    const cell = container.querySelector("[role=gridcell][data-selected]");
    expect(cell).not.toBeNull();
    expect(cell).toHaveAttribute("aria-selected", "true");
  });

  it("refuses a disabled day", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <Calendar
        mode="single"
        month={JAN}
        onSelect={onSelect}
        disabled={{ before: new Date(2026, 0, 20) }}
      />,
    );
    await user.click(screen.getByRole("button", { name: /15th/i }));
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("fills the run between a range's ends, so it reads as one block", () => {
    const { container } = render(
      <Calendar
        mode="range"
        month={JAN}
        selected={{ from: new Date(2026, 0, 10), to: new Date(2026, 0, 14) }}
      />,
    );
    // Range state arrives as classNames on the cell, not as data attributes,
    // which is why the fill has to live there for the run to be continuous.
    const filled = [...container.querySelectorAll("[role=gridcell]")].filter(
      (c) => / bg-surface-primary-subtle(\s|$)/.test(" " + c.className),
    );
    expect(filled).toHaveLength(5);
    expect(
      container.querySelector("[role=gridcell].rounded-l-md"),
    ).not.toBeNull();
    expect(
      container.querySelector("[role=gridcell].rounded-r-md"),
    ).not.toBeNull();
  });

  it("keeps the white-on-solid treatment off the middle of a range", () => {
    const { container } = render(
      <Calendar
        mode="range"
        month={JAN}
        selected={{ from: new Date(2026, 0, 10), to: new Date(2026, 0, 14) }}
      />,
    );
    // react-day-picker marks the whole run as selected, middle included. The
    // solid fill and its white text must skip the middle, or the day numbers
    // go white on bg/primary/subtle.
    const middle = [
      ...container.querySelectorAll("[role=gridcell].range-middle"),
    ];
    expect(middle).toHaveLength(3);
    for (const cell of middle) {
      expect(cell).toHaveAttribute("data-selected", "true");
      expect(cell.className).toContain(
        "[&:not(.range-middle)_button]:text-content-on-primary-emphasis",
      );
      expect(cell.className).not.toMatch(
        /(^|\s)\[&_button\]:text-content-on-primary-emphasis/,
      );
      expect(cell.className).toContain("[&_button]:text-content-neutral-muted");
    }
  });

  it("dims the days that belong to the neighbouring months", () => {
    const { container } = render(<Calendar month={JAN} showOutsideDays />);
    expect(container.querySelectorAll("[data-outside]").length).toBeGreaterThan(
      0,
    );
  });
});
