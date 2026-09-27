import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "./button";

describe("Button", () => {
  it("defaults to the primary variant at md", () => {
    render(<Button>Save changes</Button>);
    const el = screen.getByRole("button", { name: "Save changes" });
    expect(el).toHaveClass("bg-surface-primary-emphasis", "h-9");
    expect(el).toHaveAttribute("data-slot", "button");
  });

  it("keeps ghost transparent at rest", () => {
    render(<Button variant="ghost">Filter</Button>);
    // The audit's most common defect: a ghost with a resting fill reads as
    // Outline, and the hierarchy between primary and tertiary collapses. Only
    // *unprefixed* fills matter — hover: and active: are the point of ghost.
    const el = screen.getByRole("button", { name: "Filter" });
    const resting = el.className.split(/\s+/).filter((c) => !c.includes(":"));
    expect(resting).toContain("bg-transparent");
    expect(resting.filter((c) => c.startsWith("bg-surface-"))).toEqual([]);
  });

  it("gives link no box at any size", () => {
    // Regression: cva applies size after variant, so link used to inherit the
    // size block's h-9/px-4 and render as a button in an invisible box.
    for (const size of ["xs", "sm", "md", "lg", "icon-md"] as const) {
      const { unmount } = render(
        <Button variant="link" size={size}>
          Learn more
        </Button>,
      );
      const el = screen.getByRole("button", { name: "Learn more" });
      expect(el, size).toHaveClass("bg-transparent", "border-0", "rounded-none", "size-auto", "p-0");
      const resting = el.className.split(/\s+/).filter((c) => !c.includes(":"));
      const box = resting.filter((c) => /^(h|w|size|px|py|pt|pb|pl|pr)-\d/.test(c));
      expect(box, size).toEqual([]);
      unmount();
    }
  });

  it("keeps a disabled ghost and link free of an invented fill", () => {
    for (const variant of ["ghost", "link"] as const) {
      const { unmount } = render(
        <Button variant={variant} disabled>
          Filter
        </Button>,
      );
      const el = screen.getByRole("button", { name: "Filter" });
      expect(el.className, variant).toContain("disabled:bg-transparent");
      expect(el.className, variant).not.toContain("disabled:bg-surface-disabled");
      unmount();
    }
  });

  it("marks a loading button busy and blocks activation", async () => {
    const onClick = vi.fn();
    render(
      <Button loading onClick={onClick}>
        Saving
      </Button>,
    );
    const el = screen.getByRole("button", { name: /saving/i });
    expect(el).toHaveAttribute("aria-busy", "true");
    expect(el).toBeDisabled();
    await userEvent.click(el);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("renders as the child element when asChild is set", () => {
    render(
      <Button asChild>
        <a href="/probes">Probes</a>
      </Button>,
    );
    const el = screen.getByRole("link", { name: "Probes" });
    expect(el.tagName).toBe("A");
    expect(el).toHaveClass("bg-surface-primary-emphasis");
  });

  it("makes icon sizes square", () => {
    render(
      <Button size="icon-md" aria-label="Delete probe">
        <svg />
      </Button>,
    );
    expect(screen.getByRole("button", { name: "Delete probe" })).toHaveClass("size-9");
  });
});
