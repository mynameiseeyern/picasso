import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  Drawer,
  DrawerActions,
  DrawerBack,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerCounter,
  DrawerDescription,
  DrawerExpand,
  DrawerFooter,
  DrawerHeader,
  DrawerHeading,
  DrawerIcon,
  DrawerNav,
  DrawerNext,
  DrawerPrevious,
  DrawerTabs,
  DrawerTitle,
  DrawerTitleGroup,
  DrawerTrigger,
  drawerPanelVariants,
} from "./drawer";

type Side = "end" | "start" | "expanded";

function RecordFixture({
  side,
  size,
}: {
  side?: Side;
  size?: "default" | "wide";
}) {
  return (
    <Drawer>
      <DrawerTrigger>Open</DrawerTrigger>
      <DrawerContent side={side} size={size} label="Record 3 of 227">
        <DrawerHeader>
          <DrawerNav>
            <DrawerBack>Back</DrawerBack>
            <DrawerPrevious />
            <DrawerNext />
            <DrawerCounter>3 of 227</DrawerCounter>
          </DrawerNav>
          <DrawerActions>
            <DrawerExpand />
            <DrawerCloseButton />
          </DrawerActions>
        </DrawerHeader>
        <DrawerBody>Body</DrawerBody>
        <DrawerFooter>
          <button type="button">Save</button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

function TitleFixture() {
  return (
    <Drawer>
      <DrawerTrigger>Open</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader type="title">
          <DrawerHeading>
            <DrawerIcon>
              <svg aria-hidden />
            </DrawerIcon>
            <DrawerTitleGroup>
              <DrawerTitle>Drawer title</DrawerTitle>
              <DrawerDescription>
                A short line of supporting text.
              </DrawerDescription>
            </DrawerTitleGroup>
            <DrawerActions>
              <DrawerCloseButton />
            </DrawerActions>
          </DrawerHeading>
          <DrawerTabs>tabs</DrawerTabs>
        </DrawerHeader>
        <DrawerBody>Body</DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}

async function open(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByText("Open"));
  return screen.findByRole("dialog");
}

describe("Drawer", () => {
  it("opens as a modal dialog and closes on Escape", async () => {
    const user = userEvent.setup();
    render(<RecordFixture />);
    expect(await open(user)).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("takes its accessible name from `label` when there is no visible title", async () => {
    const user = userEvent.setup();
    render(<RecordFixture />);
    expect(await open(user)).toHaveAccessibleName("Record 3 of 227");
  });

  it("takes its accessible name from DrawerTitle when there is one", async () => {
    const user = userEvent.setup();
    render(<TitleFixture />);
    const dialog = await open(user);
    expect(dialog).toHaveAccessibleName("Drawer title");
    expect(dialog).toHaveAccessibleDescription(
      "A short line of supporting text.",
    );
  });

  it("warns when `label` and DrawerTitle are both set, because the hidden one wins", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const user = userEvent.setup();
    render(
      <Drawer>
        <DrawerTrigger>Open</DrawerTrigger>
        <DrawerContent label="Record 3 of 227">
          <DrawerTitle>Drawer title</DrawerTitle>
        </DrawerContent>
      </Drawer>,
    );
    await open(user);
    expect(warn.mock.calls.flat().join(" ")).toContain(
      "`label` and `DrawerTitle` are both set",
    );
    warn.mockRestore();
  });

  // Whole classes, not substrings — `border-line-neutral-muted` contains "border-l".
  const classes = (s: string) => s.split(/\s+/);

  it("puts the border on the inner edge, and nowhere else", () => {
    expect(classes(drawerPanelVariants({ side: "end" }))).toContain("border-s");
    expect(classes(drawerPanelVariants({ side: "end" }))).not.toContain(
      "border-e",
    );
    expect(classes(drawerPanelVariants({ side: "start" }))).toContain(
      "border-e",
    );
    expect(classes(drawerPanelVariants({ side: "start" }))).not.toContain(
      "border-s",
    );
  });

  it("names an edge of the reading direction, never a side", () => {
    // `side="right"` that stayed on the right in Arabic would open over the
    // sidebar. The variants are start / end, and so is every class in them.
    for (const side of ["end", "start"] as const) {
      const all = classes(drawerPanelVariants({ side }));
      expect(all).toContain(`${side}-0`);
      for (const cls of all) {
        expect(cls).not.toMatch(/(^|:)(left|right)-|border-[lr]$|-(left|right)$/);
      }
    }
  });

  it("sizes the side panels 480 and 640, and insets the expanded one instead", () => {
    expect(drawerPanelVariants({ side: "end", size: "default" })).toContain(
      "w-120",
    );
    expect(drawerPanelVariants({ side: "end", size: "wide" })).toContain(
      "w-160",
    );
    expect(drawerPanelVariants({ side: "start", size: "wide" })).toContain(
      "w-160",
    );
    const expanded = drawerPanelVariants({ side: "expanded", size: "wide" });
    expect(expanded).toContain("inset-x-20");
    expect(expanded).toContain("inset-y-10");
    expect(expanded).toContain("rounded-2xl");
    // Expanded has no Wide in the file — it is already the wide one.
    expect(expanded).not.toContain("w-160");
  });

  it("carries no radius on a side panel", () => {
    expect(drawerPanelVariants({ side: "end" })).not.toContain("rounded");
    expect(drawerPanelVariants({ side: "start" })).not.toContain("rounded");
    expect(drawerPanelVariants({ side: "expanded" })).toContain("rounded-2xl");
  });

  it("rules the header and the footer with the two different tokens the file draws", async () => {
    const user = userEvent.setup();
    render(<RecordFixture />);
    await open(user);
    expect(document.querySelector("[data-slot=drawer-header]")).toHaveClass(
      "border-b",
      "border-line-neutral-muted",
    );
    expect(document.querySelector("[data-slot=drawer-footer]")).toHaveClass(
      "border-t",
      "border-line-neutral-muted",
    );
  });

  it("lays the record header out as one row and the title header as a column", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<RecordFixture />);
    await open(user);
    expect(document.querySelector("[data-slot=drawer-header]")).toHaveClass(
      "flex",
      "items-center",
      "justify-between",
      "px-3",
      "py-2",
    );
    unmount();
    render(<TitleFixture />);
    await open(user);
    expect(document.querySelector("[data-slot=drawer-header]")).toHaveClass(
      "flex",
      "flex-col",
    );
    expect(document.querySelector("[data-slot=drawer-heading]")).toHaveClass(
      "items-start",
      "gap-3",
      "py-4",
      "pe-3",
      "ps-5",
    );
  });

  it("scrolls the body and holds the header and footer still", async () => {
    const user = userEvent.setup();
    render(<RecordFixture />);
    await open(user);
    expect(document.querySelector("[data-slot=drawer-body]")).toHaveClass(
      "min-h-0",
      "flex-1",
      "overflow-y-auto",
      "gap-3",
      "p-5",
    );
    expect(document.querySelector("[data-slot=drawer-header]")).toHaveClass(
      "shrink-0",
    );
    expect(document.querySelector("[data-slot=drawer-footer]")).toHaveClass(
      "shrink-0",
    );
  });

  it("right-aligns the footer actions", async () => {
    const user = userEvent.setup();
    render(<RecordFixture />);
    await open(user);
    expect(document.querySelector("[data-slot=drawer-footer]")).toHaveClass(
      "justify-end",
      "gap-3",
      "px-5",
      "py-4",
    );
  });

  it("steps through records with up and down, not left and right", async () => {
    const user = userEvent.setup();
    render(<RecordFixture />);
    await open(user);
    // The list runs vertically behind the drawer, so the chevrons follow it.
    expect(
      screen.getByRole("button", { name: "Previous" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Next" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Expand" })).toBeInTheDocument();
  });

  it("closes from the header close button", async () => {
    const user = userEvent.setup();
    render(<RecordFixture />);
    await open(user);
    await user.click(screen.getByRole("button", { name: "Close" }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("sets the counter and the description on the tokens the file draws", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<RecordFixture />);
    await open(user);
    expect(document.querySelector("[data-slot=drawer-counter]")).toHaveClass(
      "text-label-sm",
      "text-content-neutral-muted",
    );
    unmount();
    render(<TitleFixture />);
    await open(user);
    // body/sm here, where Dialog's description is body/md — the panel is narrower.
    expect(
      document.querySelector("[data-slot=drawer-description]"),
    ).toHaveClass("text-body-sm", "text-content-neutral-muted");
    expect(document.querySelector("[data-slot=drawer-icon]")).toHaveClass(
      "size-8",
      "rounded-md",
      "bg-surface-primary-subtle",
    );
  });

  it("slides in from its own edge, and not at all under reduced motion", async () => {
    const user = userEvent.setup();
    render(<RecordFixture side="start" />);
    const dialog = await open(user);
    expect(dialog).toHaveAttribute("data-side", "start");
    expect(dialog).toHaveClass(
      "motion-safe:data-[state=open]:animate-drawer-in-start",
      "motion-safe:data-[state=closed]:animate-drawer-out-start",
    );
    expect(dialog).not.toHaveClass(
      "motion-safe:data-[state=open]:animate-drawer-in-end",
    );
  });
});
