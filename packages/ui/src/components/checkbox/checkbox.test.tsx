import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Checkbox } from "./checkbox";

describe("Checkbox", () => {
  it("defaults to md", () => {
    render(<Checkbox aria-label="Send notifications" />);
    expect(screen.getByRole("checkbox", { name: "Send notifications" })).toHaveClass("size-5");
  });

  it("toggles on click and on Space", async () => {
    const onChange = vi.fn();
    render(<Checkbox aria-label="Send notifications" onCheckedChange={onChange} />);
    const box = screen.getByRole("checkbox");
    await userEvent.click(box);
    expect(onChange).toHaveBeenLastCalledWith(true);
    box.focus();
    await userEvent.keyboard(" ");
    expect(onChange).toHaveBeenLastCalledWith(false);
  });

  it("announces indeterminate as mixed, not as unchecked", () => {
    render(<Checkbox aria-label="All probes" checked="indeterminate" />);
    // Drawing a dash is not enough — assistive tech needs aria-checked="mixed".
    expect(screen.getByRole("checkbox")).toHaveAttribute("aria-checked", "mixed");
  });

  it("shows the dash uncontrolled too", () => {
    // The indicator picks its glyph from data-state, not from props.checked,
    // which is undefined whenever the checkbox is uncontrolled.
    render(<Checkbox aria-label="All probes" defaultChecked="indeterminate" />);
    expect(screen.getByRole("checkbox")).toHaveAttribute("data-state", "indeterminate");
  });

  it("mutes a disabled checked box", () => {
    render(<Checkbox aria-label="Locked" disabled defaultChecked />);
    const box = screen.getByRole("checkbox");
    // Figma painted this at full primary, identical to a live one.
    expect(box.className).toContain("disabled:data-[state=checked]:bg-surface-disabled");
    expect(box).toBeDisabled();
  });

  it("takes invalid from aria-invalid", () => {
    render(<Checkbox aria-label="Accept" aria-invalid />);
    const box = screen.getByRole("checkbox");
    expect(box).toHaveAttribute("aria-invalid", "true");
    expect(box.className).toContain("aria-invalid:border-line-danger-emphasis");
  });
});
