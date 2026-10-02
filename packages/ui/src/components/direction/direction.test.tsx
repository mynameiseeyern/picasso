import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DirectionProvider, useDirection } from "./direction";
import { Tabs, TabsList, TabsTrigger } from "../tabs/tabs";

function Probe({ local }: { local?: "ltr" | "rtl" }) {
  return <span data-testid="dir">{useDirection(local)}</span>;
}

function ThreeTabs() {
  return (
    <Tabs defaultValue="a">
      <TabsList>
        <TabsTrigger value="a">Overview</TabsTrigger>
        <TabsTrigger value="b">Trunks</TabsTrigger>
        <TabsTrigger value="c">Alerts</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}

describe("Direction", () => {
  it("is ltr with no provider", () => {
    render(<Probe />);
    expect(screen.getByTestId("dir")).toHaveTextContent("ltr");
  });

  it("hands the provider's direction to anything below it", () => {
    render(
      <DirectionProvider direction="rtl">
        <Probe />
      </DirectionProvider>,
    );
    expect(screen.getByTestId("dir")).toHaveTextContent("rtl");
  });

  it("lets a component's own dir win", () => {
    render(
      <DirectionProvider direction="rtl">
        <Probe local="ltr" />
      </DirectionProvider>,
    );
    expect(screen.getByTestId("dir")).toHaveTextContent("ltr");
  });

  it("is what turns Radix's arrow keys around — the dir attribute alone does not", async () => {
    // The reason the provider exists. With only dir="rtl" in the DOM, the
    // layout mirrors and the keyboard does not: ArrowLeft, which now points
    // at the next tab, goes to the previous one.
    const user = userEvent.setup();
    const { unmount } = render(
      <div dir="rtl">
        <ThreeTabs />
      </div>,
    );
    screen.getByRole("tab", { name: "Overview" }).focus();
    await user.keyboard("{ArrowLeft}");
    expect(screen.getByRole("tab", { name: "Trunks" })).not.toHaveFocus();
    unmount();

    render(
      <div dir="rtl">
        <DirectionProvider direction="rtl">
          <ThreeTabs />
        </DirectionProvider>
      </div>,
    );
    screen.getByRole("tab", { name: "Overview" }).focus();
    await user.keyboard("{ArrowLeft}");
    expect(screen.getByRole("tab", { name: "Trunks" })).toHaveFocus();
  });
});
