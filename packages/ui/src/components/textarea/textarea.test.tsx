import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Textarea } from "./textarea";

describe("Textarea", () => {
  it("defaults to md", () => {
    render(<Textarea aria-label="Notes" />);
    expect(screen.getByRole("textbox", { name: "Notes" })).toHaveClass(
      "min-h-20",
      "px-3",
      "py-2",
      "text-body-md",
    );
  });

  it("sets a minimum height rather than a fixed one", () => {
    render(<Textarea aria-label="Notes" />);
    const el = screen.getByRole("textbox", { name: "Notes" });
    // A box that cannot grow is why people write three words.
    expect(el).toHaveClass("field-sizing-content");
    const fixedHeight = el.className.split(/\s+/).filter((c) => /^h-\d/.test(c));
    expect(fixedHeight).toEqual([]);
  });

  it("resizes vertically only", () => {
    render(<Textarea aria-label="Notes" />);
    expect(screen.getByRole("textbox", { name: "Notes" })).toHaveClass("resize-y");
  });

  it("drops the resize handle when it cannot be edited", () => {
    render(
      <>
        <Textarea aria-label="Read only" readOnly defaultValue="x" />
        <Textarea aria-label="Disabled" disabled defaultValue="x" />
      </>,
    );
    const ro = screen.getByRole("textbox", { name: "Read only" });
    expect(ro.className).toContain("[&:read-only:not(:disabled)]:resize-none");
    expect(screen.getByRole("textbox", { name: "Disabled" })).toHaveClass("disabled:resize-none");
  });

  it("takes the invalid state from aria-invalid", () => {
    render(<Textarea aria-label="Notes" aria-invalid />);
    const el = screen.getByRole("textbox", { name: "Notes" });
    expect(el).toHaveAttribute("aria-invalid", "true");
    expect(el.className).toContain("aria-invalid:border-line-input-invalid");
  });
});
