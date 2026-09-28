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

  it("draws invalid as the danger ring Figma specifies", () => {
    render(
      <RadioGroup aria-label="Severity">
        <Radio value="low" aria-label="Low" aria-invalid />
      </RadioGroup>,
    );
    const radio = screen.getByRole("radio", { name: "Low" });
    // Figma's Invalid variants carry the ring/focus-danger effect style over
    // the resting colours, so the composite token is what the code uses.
    expect(radio.className).toContain("aria-invalid:shadow-ring-focus-danger");
  });

  it("takes the disabled fill from the input family", () => {
    render(<Group defaultValue="low" disabled />);
    const low = screen.getByRole("radio", { name: "Low" });
    expect(low).toBeDisabled();
    // Figma changes only the fill when disabled — the border and the dot keep
    // their resting colours.
    expect(low.className).toContain("disabled:bg-surface-input-disabled");
    expect(low.className).not.toContain("disabled:data-[state=checked]:border");
  });
});
