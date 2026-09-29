import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DatePicker, datePickerTriggerVariants } from "./date-picker";

describe("DatePicker", () => {
  it("is a button, not a text field", async () => {
    render(<DatePicker />);
    // The value is a date, not free text — there is nothing to type into.
    expect(
      screen.getByRole("button", { name: /Pick a date/ }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("textbox")).toBeNull();
  });

  it("opens the calendar and closes once a date is chosen", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <DatePicker
        onValueChange={onValueChange}
        calendarProps={{ defaultMonth: new Date(2026, 0, 1) }}
      />,
    );
    await user.click(screen.getByRole("button", { name: /Pick a date/ }));
    expect(await screen.findByRole("grid")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /15th/i }));
    expect(onValueChange).toHaveBeenCalled();
    expect(screen.queryByRole("grid")).toBeNull();
  });

  it("stays open on a range until both ends are in", async () => {
    const user = userEvent.setup();
    render(
      <DatePicker
        mode="range"
        calendarProps={{ defaultMonth: new Date(2026, 0, 1) }}
      />,
    );
    await user.click(screen.getByRole("button", { name: /Pick a date/ }));
    await user.click(screen.getByRole("button", { name: /10th/i }));
    // Half a range is not an answer.
    expect(screen.getByRole("grid")).toBeInTheDocument();
  });

  it("separates a placeholder from a value by more than the words", () => {
    const { unmount } = render(<DatePicker />);
    expect(screen.getByRole("button")).toHaveClass(
      "text-content-neutral-subtle",
    );
    unmount();
    render(<DatePicker value={new Date(2026, 0, 15)} />);
    expect(screen.getByRole("button")).toHaveClass(
      "text-content-neutral-emphasis",
    );
    expect(screen.getByRole("button")).toHaveAttribute("data-filled");
  });

  it("formats the value, and a range as a span", () => {
    const { unmount } = render(<DatePicker value={new Date(2026, 0, 15)} />);
    expect(screen.getByRole("button")).toHaveTextContent("15 Jan 2026");
    unmount();
    render(
      <DatePicker
        mode="range"
        value={{ from: new Date(2026, 0, 10), to: new Date(2026, 0, 14) }}
      />,
    );
    expect(screen.getByRole("button")).toHaveTextContent(
      "10 Jan 2026 – 14 Jan 2026",
    );
  });

  it("takes a format", () => {
    render(<DatePicker value={new Date(2026, 0, 15)} format="yyyy-MM-dd" />);
    expect(screen.getByRole("button")).toHaveTextContent("2026-01-15");
  });

  it("does not open when disabled", async () => {
    const user = userEvent.setup();
    render(<DatePicker disabled />);
    await user.click(screen.getByRole("button"));
    expect(screen.queryByRole("grid")).toBeNull();
  });

  it("takes the field family's treatment", () => {
    const c = datePickerTriggerVariants({});
    expect(c).toContain("h-8");
    expect(c).toContain("bg-surface-input-default");
    expect(c).toContain("border-line-input-default");
    expect(c).toContain("hover:border-line-input-hovered");
  });
});
