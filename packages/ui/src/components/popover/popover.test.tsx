import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "./popover";

function Fixture({ header = true }: { header?: boolean }) {
  return (
    <Popover>
      <PopoverTrigger>Dimensions</PopoverTrigger>
      <PopoverContent>
        {header ? (
          <PopoverHeader>
            <PopoverTitle>Dimensions</PopoverTitle>
            <PopoverDescription>
              Set the dimensions for the layer.
            </PopoverDescription>
          </PopoverHeader>
        ) : null}
        <div>Body</div>
      </PopoverContent>
    </Popover>
  );
}

describe("Popover", () => {
  it("opens on the trigger and closes on Escape", async () => {
    const user = userEvent.setup();
    render(<Fixture />);
    expect(screen.queryByText("Body")).toBeNull();
    await user.click(screen.getByText("Dimensions", { selector: "button" }));
    expect(await screen.findByText("Body")).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(screen.queryByText("Body")).toBeNull();
  });

  it("draws the comfortable overlay surface rather than restating it", async () => {
    const user = userEvent.setup();
    const { container } = render(<Fixture />);
    await user.click(screen.getByText("Dimensions", { selector: "button" }));
    const panel = document.querySelector("[data-slot=popover-content]")!;
    // Comfortable: radius/xl, 16 padding, 16 gap, shadow/lg, bg/card.
    expect(panel.className).toContain("rounded-xl");
    expect(panel.className).toContain("p-4");
    expect(panel.className).toContain("shadow-lg");
    expect(panel.className).toContain("bg-surface-card");
    // Portalled, so an overflow-hidden ancestor cannot clip it.
    expect(container.contains(panel)).toBe(false);
  });

  it("names and describes itself from whatever it actually renders", async () => {
    const user = userEvent.setup();
    render(<Fixture />);
    await user.click(screen.getByText("Dimensions", { selector: "button" }));
    const panel = document.querySelector("[data-slot=popover-content]")!;
    const titleId = document.querySelector("[data-slot=popover-title]")!.id;
    const descId = document.querySelector(
      "[data-slot=popover-description]",
    )!.id;
    expect(panel.getAttribute("aria-labelledby")).toBe(titleId);
    expect(panel.getAttribute("aria-describedby")).toBe(descId);
  });

  it("points at nothing when there is no header, rather than a missing id", async () => {
    const user = userEvent.setup();
    render(<Fixture header={false} />);
    await user.click(screen.getByText("Dimensions", { selector: "button" }));
    const panel = document.querySelector("[data-slot=popover-content]")!;
    // Radix does not wire these for Popover the way it does for Dialog, so a
    // dangling aria-labelledby is the easy mistake here.
    expect(panel.getAttribute("aria-labelledby")).toBeNull();
    expect(panel.getAttribute("aria-describedby")).toBeNull();
  });

  it("sets the header's type from the file", async () => {
    const user = userEvent.setup();
    render(<Fixture />);
    await user.click(screen.getByText("Dimensions", { selector: "button" }));
    expect(
      document.querySelector("[data-slot=popover-title]")!.className,
    ).toContain("text-heading-xs");
    expect(
      document.querySelector("[data-slot=popover-description]")!.className,
    ).toContain("text-body-md");
    // _PopoverHeader stacks at gap 4.
    expect(
      document.querySelector("[data-slot=popover-header]")!.className,
    ).toContain("gap-1");
  });

  it("grows from its trigger on the motion tokens, and not at all under reduced motion", async () => {
    const user = userEvent.setup();
    render(<Fixture />);
    await user.click(screen.getByText("Dimensions", { selector: "button" }));
    expect(document.querySelector("[data-slot=popover-content]")).toHaveClass(
      "origin-(--radix-popover-content-transform-origin)",
      "motion-safe:data-[state=open]:animate-popover-in",
      "motion-safe:data-[state=closed]:animate-popover-out",
    );
  });
});
