import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  Toast,
  ToastBody,
  ToastClose,
  ToastContent,
  ToastDescription,
  ToastIcon,
  ToastProvider,
  ToastTitle,
  ToastViewport,
  toastVariants,
} from "./toast";

type Tone = "info" | "destructive" | "warning" | "success";

function Fixture({
  variant,
  appearance = "emphasis",
  onOpenChange,
}: {
  variant?: Tone;
  appearance?: "emphasis" | "subtle";
  onOpenChange?: (o: boolean) => void;
}) {
  return (
    <ToastProvider duration={Infinity}>
      <Toast
        variant={variant}
        appearance={appearance}
        open
        onOpenChange={onOpenChange}
      >
        <ToastBody>
          <ToastIcon />
          <ToastContent>
            <ToastTitle>New update available</ToastTitle>
            <ToastDescription>
              Version 13.3 is ready to install
            </ToastDescription>
          </ToastContent>
        </ToastBody>
        <ToastClose />
      </Toast>
      <ToastViewport />
    </ToastProvider>
  );
}

describe("Toast", () => {
  it("announces itself and can be dismissed by name", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(<Fixture onOpenChange={onOpenChange} />);
    expect(screen.getAllByText("New update available").length).toBeGreaterThan(
      0,
    );
    await user.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("fills with the tone at emphasis and tints it at subtle", () => {
    const pairs: [Tone, string][] = [
      ["info", "info"],
      ["destructive", "danger"],
      ["warning", "warning"],
      ["success", "success"],
    ];
    for (const [variant, token] of pairs) {
      const em = toastVariants({ variant, appearance: "emphasis" });
      expect(em).toContain(`bg-surface-${token}-emphasis`);
      expect(em).toContain(`border-line-${token}-emphasis`);
      expect(em).toContain(`text-content-on-${token}-emphasis`);
      const sub = toastVariants({ variant, appearance: "subtle" });
      expect(sub).toContain(`bg-surface-${token}-subtle`);
      expect(sub).toContain(`border-line-${token}-muted`);
    }
  });

  it("lets the text inherit the on-colour at emphasis and names it at subtle", () => {
    const { unmount } = render(<Fixture appearance="emphasis" />);
    // Nothing sets a colour — the card's own text-content-on-{tone}-emphasis carries it.
    expect(document.querySelector("[data-slot=toast-title]")).not.toHaveClass(
      "text-content-neutral-emphasis",
    );
    unmount();
    render(<Fixture appearance="subtle" />);
    expect(document.querySelector("[data-slot=toast-title]")).toHaveClass(
      "text-content-neutral-emphasis",
    );
    expect(document.querySelector("[data-slot=toast-description]")).toHaveClass(
      "text-content-neutral-muted",
    );
  });

  it("keeps the close on its own toast's on-colour, not primary's", () => {
    // Figma paints the ✕ with fg/on/primary-emphasis. That is white, while
    // fg/on/warning-emphasis is near-black — so a warning toast would draw a
    // white ✕ on a light amber surface. The close inherits instead.
    render(<Fixture variant="warning" appearance="emphasis" />);
    const close = document.querySelector("[data-slot=toast-close]");
    expect(close).not.toHaveClass("text-content-on-primary-emphasis");
    expect(close?.className).not.toContain("text-content-");
  });

  it("switches the tone icon with the tone", () => {
    const { unmount } = render(<Fixture variant="success" />);
    expect(
      document
        .querySelector("[data-slot=toast-icon] svg")
        ?.getAttribute("class"),
    ).toContain("circle-check");
    unmount();
    render(<Fixture variant="warning" />);
    expect(
      document
        .querySelector("[data-slot=toast-icon] svg")
        ?.getAttribute("class"),
    ).toContain("triangle-alert");
  });

  it("stacks in a fixed viewport that does not scroll the page away", () => {
    render(<Fixture />);
    expect(document.querySelector("[data-slot=toast-viewport]")).toHaveClass(
      "fixed",
      "end-0",
      "bottom-0",
      "max-h-screen",
    );
  });

  it("arrives and leaves on the motion tokens, and not at all under reduced motion", () => {
    render(<Fixture />);
    expect(document.querySelector("[data-slot=toast]")).toHaveClass(
      "motion-safe:data-[state=open]:animate-toast-in",
      "motion-safe:data-[state=closed]:animate-toast-out",
    );
  });

  it("follows a swipe, and only the settle back is motion", () => {
    render(<Fixture />);
    const toast = document.querySelector("[data-slot=toast]")!;
    // Following the finger is direct manipulation, so it is not gated.
    expect(toast).toHaveClass(
      "data-[swipe=move]:translate-x-(--radix-toast-swipe-move-x)",
      "data-[swipe=end]:translate-x-(--radix-toast-swipe-end-x)",
      "data-[swipe=cancel]:translate-x-0",
      "motion-safe:data-[swipe=cancel]:transition-transform",
    );
  });
});
