import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NumberInput } from "./number-input";

describe("NumberInput", () => {
  it("is a spinbutton with its range announced", () => {
    render(<NumberInput aria-label="Retries" defaultValue={3} min={0} max={5} />);
    const el = screen.getByRole("spinbutton", { name: "Retries" });
    expect(el).toHaveAttribute("aria-valuenow", "3");
    expect(el).toHaveAttribute("aria-valuemin", "0");
    expect(el).toHaveAttribute("aria-valuemax", "5");
  });

  it("steps with the buttons and stops at the bounds", async () => {
    const onValueChange = vi.fn();
    render(<NumberInput aria-label="Retries" defaultValue={4} min={0} max={5} onValueChange={onValueChange} />);
    const plus = screen.getByRole("button", { name: "Increase" });
    await userEvent.click(plus);
    expect(onValueChange).toHaveBeenLastCalledWith(5);
    expect(plus).toBeDisabled();
    expect(plus).toHaveAttribute("tabindex", "-1");
  });

  it("steps with the keyboard: arrows, page keys, home and end", async () => {
    render(<NumberInput aria-label="Timeout" defaultValue={10} min={0} max={100} />);
    const el = screen.getByRole("spinbutton");
    el.focus();
    await userEvent.keyboard("{ArrowUp}");
    expect(el).toHaveValue("11");
    await userEvent.keyboard("{PageDown}");
    expect(el).toHaveValue("1");
    await userEvent.keyboard("{End}");
    expect(el).toHaveValue("100");
    await userEvent.keyboard("{Home}");
    expect(el).toHaveValue("0");
  });

  it("lets you type freely and clamps on blur", async () => {
    render(<NumberInput aria-label="Retries" defaultValue={1} min={0} max={5} />);
    const el = screen.getByRole("spinbutton");
    await userEvent.clear(el);
    await userEvent.type(el, "12");
    expect(el).toHaveValue("12");
    await userEvent.tab();
    expect(el).toHaveValue("5");
  });

  it("keeps decimals to the step's precision", async () => {
    render(<NumberInput aria-label="Ratio" defaultValue={0.1} step={0.1} />);
    const el = screen.getByRole("spinbutton");
    el.focus();
    await userEvent.keyboard("{ArrowUp}{ArrowUp}");
    expect(el).toHaveValue("0.3");
  });
});
