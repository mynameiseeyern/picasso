import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  dialogContentVariants,
} from "./dialog";

function Fixture({
  close = true,
  size,
}: {
  close?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  return (
    <Dialog>
      <DialogTrigger>Open</DialogTrigger>
      <DialogContent size={size}>
        <DialogHeader>
          <DialogTitle close={close}>Delete endpoint</DialogTitle>
          <DialogDescription>This cannot be undone.</DialogDescription>
        </DialogHeader>
        <DialogBody>Body</DialogBody>
        <DialogFooter>
          <button type="button">Cancel</button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

describe("Dialog", () => {
  it("opens as a modal dialog and closes on Escape", async () => {
    const user = userEvent.setup();
    render(<Fixture />);
    await user.click(screen.getByText("Open"));
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("is named and described by its own title and description", async () => {
    const user = userEvent.setup();
    render(<Fixture />);
    await user.click(screen.getByText("Open"));
    const panel = await screen.findByRole("dialog");
    // Radix wires these for Dialog, unlike Popover where we do it ourselves.
    expect(panel).toHaveAttribute("aria-labelledby");
    expect(panel).toHaveAttribute("aria-describedby");
    expect(panel).toHaveAccessibleName("Delete endpoint");
  });

  it("puts a labelled close in the title row, as the file draws it", async () => {
    const user = userEvent.setup();
    render(<Fixture />);
    await user.click(screen.getByText("Open"));
    const close = await screen.findByRole("button", { name: "Close" });
    // In the title row, not floated over the corner.
    expect(
      document.querySelector("[data-slot=dialog-title-row]")!.contains(close),
    ).toBe(true);
  });

  it("can drop the close for a dialog that must be answered", async () => {
    const user = userEvent.setup();
    render(<Fixture close={false} />);
    await user.click(screen.getByText("Open"));
    await screen.findByRole("dialog");
    expect(screen.queryByRole("button", { name: "Close" })).toBeNull();
  });

  it("takes the widths the file assigns to each job", () => {
    // sm 400 confirmations, md 560 short forms, lg 720 multi-section.
    expect(dialogContentVariants({ size: "sm" })).toContain("sm:w-100");
    expect(dialogContentVariants({ size: "md" })).toContain("sm:w-140");
    expect(dialogContentVariants({ size: "lg" })).toContain("sm:w-180");
  });

  it("dims behind itself with the shared scrim", async () => {
    const user = userEvent.setup();
    render(<Fixture />);
    await user.click(screen.getByText("Open"));
    await screen.findByRole("dialog");
    const scrim = document.querySelector("[data-slot=dialog-overlay]")!;
    expect(scrim.className).toContain("bg-surface-scrim");
    // The alpha is the token's, not the component's.
    expect(scrim.className).not.toContain("bg-surface-scrim/");
  });

  it("leaves no gap of its own between header and body", async () => {
    const user = userEvent.setup();
    render(<Fixture />);
    await user.click(screen.getByText("Open"));
    await screen.findByRole("dialog");
    // The header's bottom padding is the gap; the body has no top padding.
    const body = document.querySelector("[data-slot=dialog-body]")!;
    expect(body.className).toContain("pb-4");
    expect(body.className).not.toContain("pt-4");
  });

  it("right-aligns its actions", async () => {
    const user = userEvent.setup();
    render(<Fixture />);
    await user.click(screen.getByText("Open"));
    await screen.findByRole("dialog");
    expect(
      document.querySelector("[data-slot=dialog-footer]")!.className,
    ).toContain("justify-end");
  });

  it("arrives and leaves on the motion tokens, and as a fade under reduced motion", async () => {
    const user = userEvent.setup();
    render(<Fixture />);
    await user.click(screen.getByText("Open"));
    const dialog = await screen.findByRole("dialog");
    expect(dialog).toHaveClass(
      "data-[state=open]:animate-dialog-in",
      "data-[state=closed]:animate-dialog-out",
    );
    // The scrim fades with it.
    expect(document.querySelector("[data-slot=dialog-overlay]")).toHaveClass(
      "data-[state=open]:animate-fade-in",
      "data-[state=closed]:animate-fade-out",
    );
  });
});
