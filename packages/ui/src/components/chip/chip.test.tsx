import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Chip, chipVariants } from "./chip";

const check = () => document.querySelector("[data-slot=chip-check]");

describe("Chip", () => {
  it("is a button by default, and says so", () => {
    render(<Chip>Sydney</Chip>);
    expect(screen.getByRole("button", { name: "Sydney" })).toHaveAttribute(
      "type",
      "button",
    );
  });

  it("only claims to be a toggle when it is one", () => {
    const { unmount } = render(<Chip>Sydney</Chip>);
    // An action chip has no pressed state to announce.
    expect(screen.getByRole("button")).not.toHaveAttribute("aria-pressed");
    expect(check()).toBeNull();
    unmount();
    render(<Chip selected={false}>Sydney</Chip>);
    expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "false");
    expect(check()).toBeNull();
  });

  it("carries selection with a check, not only with the fill", () => {
    render(<Chip selected>Sydney</Chip>);
    // The fill matches an unselected chip on hover, focus and press, so the
    // check is the only thing distinguishing them in three of five states.
    expect(check()).not.toBeNull();
    expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "true");
    expect(chipVariants({ selected: true })).toContain(
      "bg-surface-neutral-muted",
    );
  });

  it("does not nest a button inside a button when removable", async () => {
    const onRemove = vi.fn();
    const user = userEvent.setup();
    render(<Chip onRemove={onRemove}>probe-04</Chip>);
    const remove = screen.getByRole("button", { name: "Remove" });
    // The chip itself is a span — the ✕ is the only control.
    expect(remove.closest("button")).toBe(remove);
    expect(document.querySelector("[data-slot=chip]")?.tagName).toBe("SPAN");
    await user.click(remove);
    expect(onRemove).toHaveBeenCalledOnce();
  });

  it("lets the remove control be named for its subject", () => {
    render(
      <Chip onRemove={() => {}} removeLabel="Remove probe-04">
        probe-04
      </Chip>,
    );
    expect(
      screen.getByRole("button", { name: "Remove probe-04" }),
    ).toBeInTheDocument();
  });

  it("shows the check on a removable chip too", () => {
    render(
      <Chip selected onRemove={() => {}}>
        probe-04
      </Chip>,
    );
    expect(check()).not.toBeNull();
  });

  it("drops the interactive states when it is not a control", () => {
    // A removable token is not itself clickable, so it takes no hover fill.
    expect(chipVariants({ interactive: false })).not.toContain(
      "hover:bg-surface-neutral-muted-hovered",
    );
    expect(chipVariants({ interactive: true })).toContain(
      "hover:bg-surface-neutral-muted-hovered",
    );
  });

  it("measures as the file draws it", () => {
    const c = chipVariants({});
    expect(c).toContain("h-8");
    expect(c).toContain("rounded-full");
    expect(c).toContain("px-3");
    expect(c).toContain("gap-1.5");
    expect(c).toContain("text-label-md");
    expect(c).toContain("border-line-neutral-muted");
  });

  it("can be handed to another element", () => {
    render(
      <Chip asChild>
        <a href="/sydney">Sydney</a>
      </Chip>,
    );
    expect(screen.getByRole("link", { name: "Sydney" })).toHaveClass(
      "rounded-full",
    );
  });

  it("stops responding when disabled", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(
      <Chip disabled onClick={onClick}>
        Sydney
      </Chip>,
    );
    await user.click(screen.getByRole("button"));
    expect(onClick).not.toHaveBeenCalled();
  });
});
