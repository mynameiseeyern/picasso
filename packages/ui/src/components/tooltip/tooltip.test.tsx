import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";

function Fixture({ text = "Alerts fire above this." } = {}) {
  return (
    <div>
      <Tooltip>
        <TooltipTrigger asChild>
          <button type="button">Threshold</button>
        </TooltipTrigger>
        <TooltipContent>{text}</TooltipContent>
      </Tooltip>
      <button type="button">Elsewhere</button>
    </div>
  );
}

describe("Tooltip", () => {
  it("opens on keyboard focus, not only on hover", async () => {
    const user = userEvent.setup();
    render(<Fixture />);
    // A tooltip a mouse can reach and a keyboard cannot is a tooltip half the
    // audience never sees. Radix opens on focus with no delay.
    await user.tab();
    expect(await screen.findByRole("tooltip")).toHaveTextContent("Alerts fire above this.");
  });

  it("describes its trigger while open", async () => {
    const user = userEvent.setup();
    render(<Fixture />);
    await user.tab();
    await screen.findByRole("tooltip");
    expect(screen.getByRole("button", { name: "Threshold" })).toHaveAttribute("aria-describedby");
  });

  it("closes on Escape", async () => {
    const user = userEvent.setup();
    render(<Fixture />);
    await user.tab();
    await screen.findByRole("tooltip");
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("tooltip")).toBeNull();
  });

  it("works without an app-level provider", () => {
    // Tooltip self-provides, so one tooltip in isolation does not throw.
    expect(() => render(<Fixture />)).not.toThrow();
  });

  it("draws on the neutral emphasis surface", async () => {
    const user = userEvent.setup();
    render(<Fixture />);
    await user.tab();
    const tip = await screen.findByRole("tooltip");
    expect(tip.className).toContain("bg-surface-neutral-emphasis");
    expect(tip.className).toContain("text-content-on-neutral-emphasis");
  });

  it("portals out, so an overflow-hidden parent cannot clip it", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <div className="overflow-hidden">
        <Fixture />
      </div>,
    );
    await user.tab();
    const tip = await screen.findByRole("tooltip");
    expect(container.contains(tip)).toBe(false);
  });
});
