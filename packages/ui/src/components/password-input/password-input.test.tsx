import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PasswordInput } from "./password-input";

describe("PasswordInput", () => {
  it("hides by default and toggles with an announced state", async () => {
    render(<PasswordInput aria-label="Password" defaultValue="hunter2" />);
    const input = screen.getByLabelText("Password");
    expect(input).toHaveAttribute("type", "password");
    const eye = screen.getByRole("button", { name: "Show password" });
    expect(eye).toHaveAttribute("aria-pressed", "false");
    await userEvent.click(eye);
    expect(input).toHaveAttribute("type", "text");
    expect(screen.getByRole("button", { name: "Hide password" })).toHaveAttribute("aria-pressed", "true");
  });

  it("defaults autocomplete for signing in, and switches off autocorrect", () => {
    render(<PasswordInput aria-label="Password" />);
    const input = screen.getByLabelText("Password");
    expect(input).toHaveAttribute("autocomplete", "current-password");
    expect(input).toHaveAttribute("spellcheck", "false");
  });

  it("disables the eye with the field", () => {
    render(<PasswordInput aria-label="Password" disabled />);
    expect(screen.getByRole("button", { name: "Show password" })).toBeDisabled();
  });
});
