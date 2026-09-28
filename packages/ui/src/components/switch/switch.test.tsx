import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Switch } from "./switch";

describe("Switch", () => {
  it("toggles on click and on Space, and reports both directions", async () => {
    const onChange = vi.fn();
    render(<Switch aria-label="Notifications" onCheckedChange={onChange} />);
    const sw = screen.getByRole("switch", { name: "Notifications" });

    await userEvent.click(sw);
    expect(sw).toBeChecked();
    expect(onChange).toHaveBeenLastCalledWith(true);

    // Unlike a radio, a switch goes back — it is a setting, not a choice.
    await userEvent.click(sw);
    expect(sw).not.toBeChecked();
    expect(onChange).toHaveBeenLastCalledWith(false);

    sw.focus();
    await userEvent.keyboard(" ");
    expect(onChange).toHaveBeenLastCalledWith(true);
  });

  it("is its own tab stop", async () => {
    render(
      <>
        <Switch aria-label="First" />
        <Switch aria-label="Second" />
      </>,
    );
    await userEvent.tab();
    expect(screen.getByRole("switch", { name: "First" })).toHaveFocus();
    // Two switches are two settings, so tab reaches each one. A radio group
    // is the opposite: one tab stop, arrows inside.
    await userEvent.tab();
    expect(screen.getByRole("switch", { name: "Second" })).toHaveFocus();
  });

  it("defaults to md and moves the knob the width of the gap", () => {
    render(<Switch aria-label="Notifications" />);
    const sw = screen.getByRole("switch", { name: "Notifications" });
    // 44 wide − 2×2 padding − 20 knob = 20px of travel.
    expect(sw).toHaveClass("h-6", "w-11");
    expect(sw.className).toContain("[&_[data-slot=switch-thumb]]:size-5");
    expect(sw.className).toContain(
      "[&_[data-slot=switch-thumb]]:data-[state=checked]:translate-x-5",
    );
  });

  it("scales to sm as one piece — track, knob and travel together", () => {
    render(<Switch size="sm" aria-label="Notifications" />);
    const sw = screen.getByRole("switch", { name: "Notifications" });
    // 36 − 4 − 16 = 16px of travel. Change one of these and the knob either
    // stops short or runs off the end.
    expect(sw).toHaveClass("h-5", "w-9");
    expect(sw.className).toContain("[&_[data-slot=switch-thumb]]:size-4");
    expect(sw.className).toContain(
      "[&_[data-slot=switch-thumb]]:data-[state=checked]:translate-x-4",
    );
  });

  it("draws invalid as the danger ring Figma specifies", () => {
    render(<Switch aria-label="Notifications" aria-invalid />);
    const sw = screen.getByRole("switch", { name: "Notifications" });
    // Figma's Invalid variants carry the ring/focus-danger effect style over
    // the resting colours, so the composite token is what the code uses.
    expect(sw.className).toContain("aria-invalid:shadow-ring-focus-danger");
  });

  it("takes the disabled colours from the input family", () => {
    render(<Switch aria-label="Notifications" disabled />);
    const sw = screen.getByRole("switch", { name: "Notifications" });
    expect(sw).toBeDisabled();
    expect(sw.className).toContain("disabled:bg-surface-input-disabled");
    expect(sw.className).toContain("disabled:border-line-input-disabled");
  });

  it("does not toggle when disabled", async () => {
    const onChange = vi.fn();
    render(<Switch aria-label="Notifications" disabled onCheckedChange={onChange} />);
    await userEvent.click(screen.getByRole("switch", { name: "Notifications" }));
    expect(onChange).not.toHaveBeenCalled();
  });
});
