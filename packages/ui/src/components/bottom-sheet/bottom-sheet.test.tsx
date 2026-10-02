import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  BottomSheet,
  BottomSheetBody,
  BottomSheetCloseButton,
  BottomSheetContent,
  BottomSheetFooter,
  BottomSheetHeader,
  BottomSheetItem,
  BottomSheetTitle,
  BottomSheetTrigger,
} from "./bottom-sheet";

function Fixture({ handle }: { handle?: boolean }) {
  return (
    <BottomSheet>
      <BottomSheetTrigger>Open</BottomSheetTrigger>
      <BottomSheetContent handle={handle}>
        <BottomSheetHeader>
          <BottomSheetTitle>Status</BottomSheetTitle>
          <BottomSheetCloseButton />
        </BottomSheetHeader>
        <BottomSheetBody>
          <BottomSheetItem>
            <input type="checkbox" /> Critical
          </BottomSheetItem>
        </BottomSheetBody>
        <BottomSheetFooter>
          <button type="button">Clear</button>
          <button type="button">Apply</button>
        </BottomSheetFooter>
      </BottomSheetContent>
    </BottomSheet>
  );
}

describe("BottomSheet", () => {
  it("opens as a named modal dialog", async () => {
    render(<Fixture />);
    await userEvent.click(screen.getByText("Open"));
    expect(screen.getByRole("dialog", { name: "Status" })).toBeInTheDocument();
  });

  it("is pinned to the bottom edge, capped, with top-only radius", async () => {
    render(<Fixture />);
    await userEvent.click(screen.getByText("Open"));
    const c = screen.getByRole("dialog").className;
    for (const cls of [
      "fixed",
      "inset-x-0",
      "bottom-0",
      "max-h-5/6",
      "rounded-t-2xl",
      "z-modal",
    ])
      expect(c).toContain(cls);
  });

  it("always draws a labelled close button, and it closes", async () => {
    render(<Fixture />);
    await userEvent.click(screen.getByText("Open"));
    await userEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("closes on Escape", async () => {
    render(<Fixture />);
    await userEvent.click(screen.getByText("Open"));
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("draws a decorative handle by default, and can drop it", async () => {
    const { unmount } = render(<Fixture />);
    await userEvent.click(screen.getByText("Open"));
    const h = document.querySelector("[data-slot='bottom-sheet-handle']");
    expect(h).not.toBeNull();
    expect(h).toHaveAttribute("aria-hidden");
    unmount();
    render(<Fixture handle={false} />);
    await userEvent.click(screen.getByText("Open"));
    expect(
      document.querySelector("[data-slot='bottom-sheet-handle']"),
    ).toBeNull();
  });

  it("makes each item a 48-tall label so the whole row is the target", async () => {
    render(<Fixture />);
    await userEvent.click(screen.getByText("Open"));
    const item = document.querySelector("[data-slot='bottom-sheet-item']")!;
    expect(item.tagName).toBe("LABEL");
    expect(item.className).toContain("min-h-12");
  });

  it("shares the footer width between its buttons", async () => {
    render(<Fixture />);
    await userEvent.click(screen.getByText("Open"));
    expect(
      document.querySelector("[data-slot='bottom-sheet-footer']")!.className,
    ).toContain("*:flex-1");
  });

  it("rises from the bottom edge on the motion tokens, and not at all under reduced motion", async () => {
    render(<Fixture />);
    await userEvent.click(screen.getByText("Open"));
    expect(screen.getByRole("dialog")).toHaveClass(
      "motion-safe:data-[state=open]:animate-sheet-in",
      "motion-safe:data-[state=closed]:animate-sheet-out",
    );
    expect(
      document.querySelector("[data-slot=bottom-sheet-overlay]"),
    ).toHaveClass(
      "motion-safe:data-[state=open]:animate-fade-in",
      "motion-safe:data-[state=closed]:animate-fade-out",
    );
  });
});
