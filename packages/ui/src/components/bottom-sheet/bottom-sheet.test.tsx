import { beforeAll, describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
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

function Fixture({ handle, drag }: { handle?: boolean; drag?: boolean }) {
  return (
    <BottomSheet>
      <BottomSheetTrigger>Open</BottomSheetTrigger>
      <BottomSheetContent handle={handle} drag={drag}>
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

  /* jsdom has no pointer capture and no layout. The capture calls are stubbed
     so the handlers run; offsetHeight staying 0 is useful rather than a
     problem — it pins the threshold at the 64px floor, so these assert the
     floor and not a measured quarter-panel. */
  beforeAll(() => {
    Element.prototype.setPointerCapture = () => {};
    Element.prototype.releasePointerCapture = () => {};
  });

  /** Drag the panel from the header by `dy`, then let go. */
  async function dragBy(dy: number) {
    const panel = screen.getByRole("dialog");
    const grab = document.querySelector(
      "[data-slot='bottom-sheet-header']",
    ) as HTMLElement;
    fireEvent.pointerDown(grab, { pointerId: 1, isPrimary: true, clientY: 0 });
    fireEvent.pointerMove(panel, { pointerId: 1, clientY: dy });
    fireEvent.pointerUp(panel, { pointerId: 1, clientY: dy });
  }

  it("follows the finger down, and settles back when the drag is short", async () => {
    render(<Fixture />);
    await userEvent.click(screen.getByText("Open"));
    const panel = screen.getByRole("dialog");
    const grab = document.querySelector(
      "[data-slot='bottom-sheet-header']",
    ) as HTMLElement;

    fireEvent.pointerDown(grab, { pointerId: 1, isPrimary: true, clientY: 0 });
    fireEvent.pointerMove(panel, { pointerId: 1, clientY: 40 });
    expect(panel).toHaveClass("translate-y-(--sheet-offset)");
    expect(panel.style.getPropertyValue("--sheet-offset")).toBe("40px");
    expect(panel).toHaveAttribute("data-dragging");

    fireEvent.pointerUp(panel, { pointerId: 1, clientY: 40 });
    /* 40 is under the 64 floor and under the 48 a throw has to travel. The
       speed half of that test cannot be exercised here: jsdom gives every
       synthetic event the same timeStamp, so every drag looks instant. */
    expect(screen.queryByRole("dialog")).not.toBeNull();
    expect(panel.style.getPropertyValue("--sheet-offset")).toBe("0px");
    expect(panel).toHaveClass("motion-safe:transition-settle");
  });

  it("resists an upward drag instead of refusing it", async () => {
    render(<Fixture />);
    await userEvent.click(screen.getByText("Open"));
    const panel = screen.getByRole("dialog");
    const grab = document.querySelector(
      "[data-slot='bottom-sheet-header']",
    ) as HTMLElement;
    fireEvent.pointerDown(grab, { pointerId: 1, isPrimary: true, clientY: 0 });
    fireEvent.pointerMove(panel, { pointerId: 1, clientY: -40 });
    // A quarter of the travel, and capped at 24 however far the finger goes.
    expect(panel.style.getPropertyValue("--sheet-offset")).toBe("-10px");
    fireEvent.pointerMove(panel, { pointerId: 1, clientY: -400 });
    expect(panel.style.getPropertyValue("--sheet-offset")).toBe("-24px");
  });

  it("dismisses on a drag past the floor", async () => {
    render(<Fixture />);
    await userEvent.click(screen.getByText("Open"));
    await dragBy(120);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("does not drag from the scrolling body", async () => {
    render(<Fixture />);
    await userEvent.click(screen.getByText("Open"));
    const panel = screen.getByRole("dialog");
    const body = document.querySelector(
      "[data-slot='bottom-sheet-body']",
    ) as HTMLElement;
    fireEvent.pointerDown(body, { pointerId: 1, isPrimary: true, clientY: 0 });
    fireEvent.pointerMove(panel, { pointerId: 1, clientY: 200 });
    expect(panel).not.toHaveAttribute("data-dragging");
    fireEvent.pointerUp(panel, { pointerId: 1, clientY: 200 });
    expect(screen.queryByRole("dialog")).not.toBeNull();
  });

  it("leaves the drag out when drag={false}", async () => {
    render(<Fixture drag={false} />);
    await userEvent.click(screen.getByText("Open"));
    await dragBy(200);
    expect(screen.queryByRole("dialog")).not.toBeNull();
  });

  it("keeps a close button, so the gesture is never the only exit", async () => {
    render(<Fixture />);
    await userEvent.click(screen.getByText("Open"));
    expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument();
    const hidden = document.querySelector(
      "[data-slot='bottom-sheet-dismiss']",
    )!;
    expect(hidden).toHaveAttribute("hidden");
    expect(hidden).toHaveAttribute("aria-hidden");
  });

  it("draws a handle by default, and can drop it", async () => {
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
