import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OtpInput, OtpSeparator, OtpSlot, otpSlotVariants } from "./otp";

function Fixture({
  invalid,
  disabled,
  size,
}: {
  invalid?: boolean;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  return (
    <OtpInput
      maxLength={6}
      invalid={invalid}
      disabled={disabled}
      size={size}
      aria-label="Verification code"
    >
      <OtpSlot index={0} />
      <OtpSlot index={1} />
      <OtpSlot index={2} />
      <OtpSeparator />
      <OtpSlot index={3} />
      <OtpSlot index={4} />
      <OtpSlot index={5} />
    </OtpInput>
  );
}

const slots = () => [...document.querySelectorAll("[data-slot=otp-slot]")];

describe("Verification OTP", () => {
  it("is one field behind six boxes, not six fields", () => {
    render(<Fixture />);
    // Six focusable inputs would be six tab stops and six paste targets.
    expect(screen.getAllByRole("textbox")).toHaveLength(1);
    expect(slots()).toHaveLength(6);
  });

  it("fills the boxes as you type", async () => {
    const user = userEvent.setup();
    render(<Fixture />);
    await user.type(screen.getByRole("textbox"), "1234");
    expect(
      slots()
        .map((s) => s.textContent)
        .join(""),
    ).toBe("1234");
  });

  it("marks the slot the caret is in, since the slot cannot take focus itself", async () => {
    const user = userEvent.setup();
    render(<Fixture />);
    await user.type(screen.getByRole("textbox"), "12");
    // Active is a data state read from the hidden input's context.
    expect(slots()[2]).toHaveAttribute("data-active");
    expect(slots()[0]).not.toHaveAttribute("data-active");
  });

  it("tells assistive tech about an invalid code, not just the border", () => {
    render(<Fixture invalid />);
    expect(screen.getByRole("textbox")).toHaveAttribute("aria-invalid", "true");
    expect(slots()[0]).toHaveClass("border-line-input-invalid");
  });

  it("has no active slot to point at when disabled", async () => {
    const user = userEvent.setup();
    render(<Fixture disabled />);
    const input = screen.getByRole("textbox");
    expect(input).toBeDisabled();
    await user.type(input, "1");
    expect(slots().some((s) => s.hasAttribute("data-active"))).toBe(false);
    expect(slots()[0]).toHaveClass("bg-surface-input-disabled");
  });

  it("keeps the separator out of the accessibility tree", () => {
    render(<Fixture />);
    const sep = document.querySelector("[data-slot=otp-separator]");
    // The grouping is visual; the value is one string.
    expect(sep).toHaveAttribute("aria-hidden");
  });

  it("grows the box at lg but not the type, as drawn", () => {
    expect(otpSlotVariants({ size: "sm" })).toContain("size-10");
    expect(otpSlotVariants({ size: "sm" })).toContain("text-metric-lg");
    expect(otpSlotVariants({ size: "md" })).toContain("size-12");
    expect(otpSlotVariants({ size: "md" })).toContain("text-metric-xl");
    expect(otpSlotVariants({ size: "lg" })).toContain("size-14");
    // lg is a bigger box at the same 30px — the file draws it that way.
    expect(otpSlotVariants({ size: "lg" })).toContain("text-metric-xl");
  });
});
