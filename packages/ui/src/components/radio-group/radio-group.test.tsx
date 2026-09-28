import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Radio, RadioGroup } from "./radio-group";

const Group = (props: React.ComponentProps<typeof RadioGroup>) => (
  <RadioGroup aria-label="Severity" {...props}>
    <Radio value="low" aria-label="Low" />
    <Radio value="medium" aria-label="Medium" />
    <Radio value="high" aria-label="High" />
  </RadioGroup>
);

describe("RadioGroup", () => {
  it("is one tab stop, and arrows move within it", async () => {
    const onChange = vi.fn();
    render(<Group defaultValue="low" onValueChange={onChange} />);
    await userEvent.tab();
    expect(screen.getByRole("radio", { name: "Low" })).toHaveFocus();
    // The group is a single tab stop; arrows are how you move inside it, and
    // moving selects — that is what makes it a group rather than three radios.
    //
    // The key is held ("{ArrowDown>}") rather than tapped on purpose. Radix
    // moves focus in a setTimeout and only auto-selects while an arrow key is
    // down; a tapped "{ArrowDown}" fires keyup first, clearing that flag before
    // the deferred focus lands, so selection never happens. A held key is what
    // a real press looks like. Do not "simplify" this back to a tap.
    await userEvent.keyboard("{ArrowDown>}");
    expect(screen.getByRole("radio", { name: "Medium" })).toHaveFocus();
    expect(onChange).toHaveBeenLastCalledWith("medium");
    await userEvent.keyboard("{/ArrowDown}");
  });

  it("cannot be unticked by clicking the selected option", async () => {
    const onChange = vi.fn();
    render(<Group defaultValue="low" onValueChange={onChange} />);
    const low = screen.getByRole("radio", { name: "Low" });
    await userEvent.click(low);
    expect(low).toBeChecked();
    // This is the whole difference from Checkbox, and the reason the guidance
    // asks for a default or an explicit None.
    expect(onChange).not.toHaveBeenCalledWith("");
  });

  it("defaults to md and scales its dot with the size", () => {
    render(<Group defaultValue="low" />);
    expect(screen.getByRole("radio", { name: "Low" })).toHaveClass(
      "size-5",
      "[&_[data-slot=radio-dot]]:size-2",
    );
  });

  it("colours the border when invalid, rather than ringing it", () => {
    render(
      <RadioGroup aria-label="Severity">
        <Radio value="low" aria-label="Low" aria-invalid />
      </RadioGroup>,
    );
    const radio = screen.getByRole("radio", { name: "Low" });
    expect(radio.className).toContain("aria-invalid:border-line-danger-emphasis");
    // A ring that is always on stops reading as focus.
    expect(radio.className).not.toMatch(/(^|\s)ring-line-danger/);
  });

  it("settles the three-way conflict: disabled > invalid > selected", () => {
    render(
      <RadioGroup aria-label="Severity" value="low">
        <Radio value="low" aria-label="Low" aria-invalid />
      </RadioGroup>,
    );
    const radio = screen.getByRole("radio", { name: "Low" });
    // Each of these is a compound selector on purpose. Single-variant rules
    // land in whatever order Tailwind sorts them, so "invalid wins" cannot be
    // left to source order — stacking the variants is what makes it true.
    // Verified against rendered CSS: selected+invalid is a danger border and a
    // danger dot; anything disabled is fully muted, dot included.
    expect(radio.className).toContain("aria-invalid:data-[state=checked]:border-line-danger-emphasis");
    expect(radio.className).toContain("disabled:aria-invalid:border-line-input-disabled");
    expect(radio.className).toContain(
      "disabled:aria-invalid:data-[state=checked]:border-line-input-disabled",
    );
    const dot = radio.querySelector("[data-slot=radio-dot]");
    expect(dot?.className).toContain("group-disabled:group-aria-invalid:bg-content-disabled");
  });

  it("mutes a disabled selection", () => {
    render(<Group defaultValue="low" disabled />);
    const low = screen.getByRole("radio", { name: "Low" });
    expect(low).toBeDisabled();
    expect(low.className).toContain("disabled:data-[state=checked]:border-line-input-disabled");
  });
});
