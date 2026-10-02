import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  SegmentedControl,
  SegmentedControlItem,
  segmentedControlVariants,
} from "./segmented-control";

function Fixture(
  props: Partial<React.ComponentProps<typeof SegmentedControl>> = {},
) {
  return (
    <SegmentedControl aria-label="Order" defaultValue="asc" {...props}>
      <SegmentedControlItem value="asc">Ascending</SegmentedControlItem>
      <SegmentedControlItem value="desc">Descending</SegmentedControlItem>
      <SegmentedControlItem value="none" disabled>
        Unsorted
      </SegmentedControlItem>
    </SegmentedControl>
  );
}

describe("SegmentedControl", () => {
  it("is a named radio group with one option selected", () => {
    render(<Fixture />);
    expect(
      screen.getByRole("radiogroup", { name: "Order" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Ascending" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Descending" })).not.toBeChecked();
  });

  it("selects on click and reports the value", async () => {
    const onValueChange = vi.fn();
    render(<Fixture onValueChange={onValueChange} />);
    await userEvent.click(screen.getByRole("radio", { name: "Descending" }));
    expect(onValueChange).toHaveBeenCalledWith("desc");
    expect(screen.getByRole("radio", { name: "Descending" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Ascending" })).not.toBeChecked();
  });

  it("moves the selection with the arrow keys, as a row", async () => {
    const user = userEvent.setup();
    render(<Fixture />);
    // Declared horizontal, so Radix binds Left and Right.
    expect(screen.getByRole("radiogroup")).toHaveAttribute(
      "aria-orientation",
      "horizontal",
    );
    await user.tab();
    expect(screen.getByRole("radio", { name: "Ascending" })).toHaveFocus();
    // Held, not tapped: Radix selects on focus only while an arrow key is
    // down, and a tapped key fires keyup first. See the Radio test.
    await user.keyboard("{ArrowRight>}");
    expect(screen.getByRole("radio", { name: "Descending" })).toBeChecked();
    await user.keyboard("{/ArrowRight}");
  });

  it("does not select a disabled option", async () => {
    const onValueChange = vi.fn();
    render(<Fixture onValueChange={onValueChange} />);
    await userEvent.click(screen.getByRole("radio", { name: "Unsorted" }));
    expect(onValueChange).not.toHaveBeenCalled();
    expect(screen.getByRole("radio", { name: "Ascending" })).toBeChecked();
  });

  it("draws the selected option as a thumb on a muted track", () => {
    render(<Fixture />);
    expect(screen.getByRole("radiogroup")).toHaveClass(
      "bg-surface-neutral-muted",
      "rounded-md",
      "p-0.5",
    );
    // The thumb is the card colour, one radius step inside the track.
    expect(screen.getByRole("radio", { name: "Ascending" })).toHaveClass(
      "data-[state=checked]:bg-surface-card",
      "data-[state=checked]:shadow-xs",
      "rounded-sm",
    );
  });

  it("sits at Button's and Input's heights, so it lines up in a row", () => {
    expect(segmentedControlVariants({ size: "md" })).toContain("h-9");
    expect(segmentedControlVariants({ size: "sm" })).toContain("h-8");
  });

  it("can fill its container, sharing the width between options", () => {
    render(<Fixture fullWidth />);
    expect(screen.getByRole("radiogroup")).toHaveClass("flex", "w-full");
    for (const radio of screen.getAllByRole("radio"))
      expect(radio).toHaveClass("flex-1");
  });
});
