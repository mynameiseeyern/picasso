import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "../button/button";
import { ButtonGroup } from "./button-group";

const Three = (props: React.ComponentProps<typeof ButtonGroup>) => (
  <ButtonGroup aria-label="Zoom" {...props}>
    <Button>Out</Button>
    <Button>Reset</Button>
    <Button>In</Button>
  </ButtonGroup>
);

describe("ButtonGroup", () => {
  it("is announced as one group, so the buttons have something in common", () => {
    render(<Three />);
    expect(screen.getByRole("group", { name: "Zoom" })).toBeInTheDocument();
    expect(screen.getAllByRole("button")).toHaveLength(3);
  });

  it("rounds by position, not by index", () => {
    render(<Three data-testid="g" />);
    const group = screen.getByTestId("g");
    // The whole point of doing this in CSS: the ends follow whichever
    // children are actually there. Figma has to hardcode the first and last
    // of six, so hiding the last one leaves a square end.
    expect(group.className).toContain("[&>*]:rounded-none");
    expect(group.className).toContain("[&>*:first-child]:rounded-s-md");
    expect(group.className).toContain("[&>*:last-child]:rounded-e-md");
  });

  it("overlaps neighbours by a pixel so two borders read as one line", () => {
    render(<Three data-testid="g" />);
    expect(screen.getByTestId("g").className).toContain("-space-x-px");
  });

  it("draws the divider between solid buttons, which have no border to share", () => {
    render(<Three data-testid="g" />);
    // Figma draws this as a separate 1px rectangle; here it is the
    // neighbour's leading border, keyed off the child's own variant.
    expect(screen.getByTestId("g").className).toContain(
      "[&>[data-variant=default]:not(:first-child)]:border-s-line-primary-muted",
    );
  });

  it("turns the geometry with the orientation", () => {
    render(<Three orientation="vertical" data-testid="g" />);
    const group = screen.getByTestId("g");
    expect(group).toHaveAttribute("data-orientation", "vertical");
    expect(group.className).toContain("-space-y-px");
    expect(group.className).toContain("[&>*:first-child]:rounded-t-md");
    // An icon button sets an explicit square width, which beats items-stretch
    // and leaves the group ending in a half-width stub.
    expect(group.className).toContain("[&>*]:w-full");
  });

  it("lifts the focused button above its neighbours", async () => {
    render(<Three data-testid="g" />);
    // Neighbours overlap, so without this the focus ring is painted over by
    // the next button and reads as a half ring.
    expect(screen.getByTestId("g").className).toContain(
      "[&>*:focus-visible]:z-raised",
    );
    await userEvent.tab();
    expect(screen.getByRole("button", { name: "Out" })).toHaveFocus();
  });

  it("leaves the buttons their own variants", () => {
    render(
      <ButtonGroup aria-label="Mixed">
        <Button variant="outline">One</Button>
        <Button variant="secondary">Two</Button>
      </ButtonGroup>,
    );
    // The group owns the geometry; each button owns its colour. Figma needs a
    // group-level Variant axis because a component cannot read its children.
    expect(screen.getByRole("button", { name: "One" })).toHaveAttribute(
      "data-variant",
      "outline",
    );
    expect(screen.getByRole("button", { name: "Two" })).toHaveAttribute(
      "data-variant",
      "secondary",
    );
  });
});
