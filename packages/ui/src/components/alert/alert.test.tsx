import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Alert, AlertDescription, AlertTitle } from "./alert";

describe("Alert", () => {
  it("carries the tone on the surface and the border, not the icon", () => {
    render(
      <Alert variant="warning" data-testid="a">
        <AlertTitle>Disk nearly full</AlertTitle>
      </Alert>,
    );
    const alert = screen.getByTestId("a");
    expect(alert).toHaveClass(
      "bg-surface-warning-subtle",
      "border-line-warning-emphasis",
    );
    // Figma paints all four tone icons fg/neutral/emphasis. Tinting the icon
    // would double the signal and leave the surface doing nothing.
    // The icon inherits the title row's ink and carries no tone of its own.
    const title = alert.querySelector("[data-slot=alert-title]");
    expect(title?.className).toContain("text-content-neutral-emphasis");
    const icon = alert.querySelector("[data-slot=alert-icon]");
    expect(icon?.getAttribute("class") ?? "").not.toMatch(/text-/);
  });

  it("picks the icon from the tone", () => {
    const { rerender } = render(
      <Alert variant="success" data-testid="a">
        <AlertTitle>Saved</AlertTitle>
      </Alert>,
    );
    const iconOf = () =>
      screen.getByTestId("a").querySelector("svg")?.classList.toString() ?? "";
    expect(iconOf()).toContain("lucide-circle-check");
    rerender(
      <Alert variant="destructive" data-testid="a">
        <AlertTitle>Failed</AlertTitle>
      </Alert>,
    );
    expect(iconOf()).toContain("lucide-octagon-alert");
  });

  it("can drop the icon", () => {
    render(
      <Alert icon={false} data-testid="a">
        <AlertTitle>Quiet</AlertTitle>
      </Alert>,
    );
    expect(
      screen.getByTestId("a").querySelector("[data-slot=alert-icon]"),
    ).toBeNull();
  });

  it("puts the icon and the dismiss inside the title row, as Figma does", () => {
    render(
      <Alert onDismiss={() => {}} data-testid="a">
        <AlertTitle data-testid="t">Disk nearly full</AlertTitle>
        <AlertDescription>
          Two lines, and the icon still sits on the first.
        </AlertDescription>
      </Alert>,
    );
    const title = screen.getByTestId("t");
    // Not a cosmetic detail: as a sibling of the whole body the icon floats
    // against the middle of a two-line block instead of the title.
    expect(title.querySelector("[data-slot=alert-icon]")).not.toBeNull();
    expect(title.querySelector("[data-slot=alert-dismiss]")).not.toBeNull();
  });

  it("has no icon and no dismiss without a title — both live in the title row", () => {
    render(
      <Alert onDismiss={() => {}} data-testid="a">
        <AlertDescription>Description only.</AlertDescription>
      </Alert>,
    );
    const alert = screen.getByTestId("a");
    expect(alert.querySelector("[data-slot=alert-icon]")).toBeNull();
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("gives the dismiss control words, since it is only an ✕", async () => {
    const onDismiss = vi.fn();
    render(
      <Alert onDismiss={onDismiss} dismissLabel="Dismiss disk warning">
        <AlertTitle>Disk nearly full</AlertTitle>
      </Alert>,
    );
    const button = screen.getByRole("button", { name: "Dismiss disk warning" });
    await userEvent.click(button);
    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it("has no dismiss control unless it can actually be dismissed", () => {
    render(
      <Alert>
        <AlertTitle>Standing notice</AlertTitle>
      </Alert>,
    );
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("sets no role of its own — the caller knows if it just happened", () => {
    render(
      <Alert data-testid="a">
        <AlertTitle>On the page since load</AlertTitle>
      </Alert>,
    );
    expect(screen.getByTestId("a")).not.toHaveAttribute("role");
    // and takes one when given
    render(
      <Alert role="status" data-testid="b">
        <AlertTitle>Just succeeded</AlertTitle>
      </Alert>,
    );
    expect(screen.getByTestId("b")).toHaveAttribute("role", "status");
  });

  it("puts the title and description on their own type styles", () => {
    render(
      <Alert>
        <AlertTitle data-testid="t">Title</AlertTitle>
        <AlertDescription data-testid="d">Description</AlertDescription>
      </Alert>,
    );
    expect(screen.getByTestId("t")).toHaveClass(
      "text-label-lg",
      "text-content-neutral-emphasis",
    );
    expect(screen.getByTestId("d")).toHaveClass(
      "text-body-md",
      "text-content-neutral-muted",
    );
  });
});
