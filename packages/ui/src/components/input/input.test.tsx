import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Input } from "./input";

describe("Input", () => {
  it("defaults to md", () => {
    render(<Input aria-label="Probe name" />);
    expect(screen.getByRole("textbox", { name: "Probe name" })).toHaveClass("h-9", "px-3", "text-body-md");
  });

  it("sizes change height and text, never width", () => {
    render(<Input aria-label="Filter" size="sm" />);
    const el = screen.getByRole("textbox", { name: "Filter" });
    expect(el).toHaveClass("h-8", "text-body-sm", "w-full");
    // w-full is on the base, so a size can never set width
    expect(el.className).not.toMatch(/(^|\s)w-(?!full)/);
  });

  it("takes the invalid state from aria-invalid, not a prop", () => {
    render(<Input aria-label="Threshold" aria-invalid />);
    const el = screen.getByRole("textbox", { name: "Threshold" });
    expect(el).toHaveAttribute("aria-invalid", "true");
    expect(el.className).toContain("aria-invalid:border-line-input-invalid");
  });

  it("keeps a focus ring as well as the border change", () => {
    render(<Input aria-label="Probe name" />);
    const el = screen.getByRole("textbox", { name: "Probe name" });
    // A 1px border change alone is not a sufficient focus indicator.
    expect(el).toHaveClass("focus-visible:border-line-input-focused", "focus-visible:ring-2");
  });

  it("stays reachable when read-only, unlike disabled", async () => {
    render(
      <>
        <Input aria-label="Read only" readOnly defaultValue="SYD-03" />
        <Input aria-label="Disabled" disabled defaultValue="SYD-04" />
      </>,
    );
    const ro = screen.getByRole("textbox", { name: "Read only" });
    const dis = screen.getByRole("textbox", { name: "Disabled" });
    await userEvent.tab();
    expect(ro).toHaveFocus();
    expect(dis).toBeDisabled();
  });

  it("makes read-only visibly different from editable, and from disabled", () => {
    render(
      <>
        <Input aria-label="Editable" defaultValue="SYD-03" />
        <Input aria-label="Read only" readOnly defaultValue="SYD-03" />
      </>,
    );
    const ro = screen.getByRole("textbox", { name: "Read only" });
    const rw = screen.getByRole("textbox", { name: "Editable" });
    // Guidance sends people here instead of disabled, so it has to look unlike
    // an editable field — otherwise they will try to type into it.
    expect(ro.className).toContain("[&:read-only:not(:disabled)]:bg-surface-neutral-muted");
    expect(rw.className).toContain("[&:not(:read-only)]:hover:border-line-input-hovered");
    // ...and it is its own surface, not the disabled one: the two rules are
    // mutually exclusive by :not(:disabled), so they can never both apply.
    expect(ro.className).toContain(":not(:disabled)]:cursor-default");
  });

  it("passes the native type through", () => {
    render(<Input aria-label="Password" type="password" />);
    expect(document.querySelector('input[type="password"]')).not.toBeNull();
  });
});
