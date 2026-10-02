import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Slider } from "./slider";

const thumbs = () => screen.getAllByRole("slider");

describe("Slider", () => {
  it("is one thumb or two, decided by the values rather than a prop", () => {
    const { unmount } = render(<Slider defaultValue={[40]} />);
    expect(thumbs()).toHaveLength(1);
    unmount();
    // A `type` prop could disagree with the values it describes.
    render(<Slider defaultValue={[20, 60]} />);
    expect(thumbs()).toHaveLength(2);
  });

  it("moves on the arrow keys", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Slider defaultValue={[40]} onValueChange={onValueChange} />);
    thumbs()[0].focus();
    await user.keyboard("{ArrowRight}");
    expect(onValueChange).toHaveBeenCalledWith([41]);
  });

  it("names each thumb, because 'slider' twice tells you nothing", () => {
    render(
      <Slider defaultValue={[20, 60]} thumbLabels={["Minimum", "Maximum"]} />,
    );
    expect(screen.getByRole("slider", { name: "Minimum" })).toBeInTheDocument();
    expect(screen.getByRole("slider", { name: "Maximum" })).toBeInTheDocument();
  });

  it("carries the value range on every thumb", () => {
    render(<Slider defaultValue={[40]} min={0} max={200} />);
    const t = thumbs()[0];
    expect(t).toHaveAttribute("aria-valuemin", "0");
    expect(t).toHaveAttribute("aria-valuemax", "200");
    expect(t).toHaveAttribute("aria-valuenow", "40");
  });

  it("shows that it is disabled, which the file does not", () => {
    render(<Slider defaultValue={[40]} disabled />);
    // Figma draws State=Disabled identical to State=Default on all three
    // Types. A control that looks live when it is not is the same defect as
    // a focus state that shows no focus.
    expect(document.querySelector("[data-slot=slider-range]")).toHaveClass(
      "group-data-[disabled]/slider:bg-surface-disabled",
    );
    expect(document.querySelector("[data-slot=slider-thumb]")).toHaveClass(
      "data-[disabled]:border-line-neutral-muted",
    );
    expect(document.querySelector("[data-slot=slider]")).toHaveClass(
      "data-[disabled]:cursor-not-allowed",
    );
  });

  it("takes its measurements from the file", () => {
    render(<Slider defaultValue={[40]} />);
    expect(document.querySelector("[data-slot=slider-track]")).toHaveClass(
      "h-1.5",
      "rounded-sm",
      "bg-surface-layer-emphasis",
    );
    expect(document.querySelector("[data-slot=slider-thumb]")).toHaveClass(
      "size-4",
      "rounded-full",
      "border-2",
      "border-line-primary-emphasis",
      "bg-surface-card",
    );
  });

  it("declares the group its own range depends on", () => {
    render(<Slider defaultValue={[40]} />);
    // The range's hover and disabled styles are group-scoped; without the
    // group on the root they silently never apply.
    expect(document.querySelector("[data-slot=slider]")).toHaveClass(
      "group/slider",
    );
  });
});
