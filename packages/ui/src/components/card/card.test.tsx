import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  Card, CardAction, CardContent, CardDescription, CardFooter,
  CardHeader, CardHeaderText, CardTitle,
} from "./card";

describe("Card", () => {
  it("is a bordered, lifted surface at radius/xl", () => {
    render(<Card data-testid="c">body</Card>);
    expect(screen.getByTestId("c")).toHaveClass(
      "rounded-xl",
      "border",
      "border-line-neutral-muted",
      "bg-surface-card",
      "shadow-xs",
    );
  });

  it("pads at 24, and the header leaves its bottom to the next section", () => {
    render(
      <Card>
        <CardHeader data-testid="h">
          <CardHeaderText><CardTitle>Title</CardTitle></CardHeaderText>
        </CardHeader>
        <CardContent data-testid="b">body</CardContent>
        <CardFooter data-testid="f">footer</CardFooter>
      </Card>,
    );
    expect(screen.getByTestId("h")).toHaveClass("px-6", "pt-6");
    expect(screen.getByTestId("b")).toHaveClass("p-6", "gap-6");
    expect(screen.getByTestId("f")).toHaveClass("px-6", "pb-6");
  });

  it("closes the gap when a section is the only one there", () => {
    render(
      <Card>
        <CardHeader data-testid="h">
          <CardHeaderText><CardTitle>Header only</CardTitle></CardHeaderText>
        </CardHeader>
      </Card>,
    );
    // Without this a header-only card sits its title flush against the
    // bottom edge — the cost of letting the next section own the spacing.
    expect(screen.getByTestId("h")).toHaveClass("last:pb-6");
  });

  it("scales every measurement together at sm", () => {
    render(
      <Card size="sm" data-testid="c">
        <CardHeader data-testid="h">
          <CardHeaderText><CardTitle>Title</CardTitle></CardHeaderText>
        </CardHeader>
        <CardContent data-testid="b">body</CardContent>
        <CardFooter data-testid="f">footer</CardFooter>
      </Card>,
    );
    expect(screen.getByTestId("c")).toHaveAttribute("data-size", "sm");
    expect(screen.getByTestId("h")).toHaveClass("px-4", "pt-4");
    expect(screen.getByTestId("b")).toHaveClass("p-4", "gap-4");
    expect(screen.getByTestId("f")).toHaveClass("px-4", "pb-4");
  });

  it("carries the size to sections without being told twice", () => {
    render(
      <Card size="sm">
        <div>
          <CardContent data-testid="b">nested a level down</CardContent>
        </div>
      </Card>,
    );
    // Context, not a class on the root: the size is only ever set on Card,
    // and every section reads it wherever it sits.
    expect(screen.getByTestId("b")).toHaveClass("p-4");
  });

  it("puts the title and description on their own type styles", () => {
    render(
      <Card>
        <CardHeader>
          <CardHeaderText>
            <CardTitle data-testid="t">Title</CardTitle>
            <CardDescription data-testid="d">Supporting text</CardDescription>
          </CardHeaderText>
        </CardHeader>
      </Card>,
    );
    expect(screen.getByTestId("t")).toHaveClass("text-heading-sm", "text-content-neutral-emphasis");
    expect(screen.getByTestId("d")).toHaveClass("text-body-md", "text-content-neutral-subtle");
  });

  it("keeps the trailing action beside the text, not under it", () => {
    render(
      <Card>
        <CardHeader data-testid="h">
          <CardHeaderText><CardTitle>Title</CardTitle></CardHeaderText>
          <CardAction data-testid="a"><button type="button">More</button></CardAction>
        </CardHeader>
      </Card>,
    );
    // The text block flexes and the action does not, so a long title wraps
    // instead of pushing the action off the card.
    expect(screen.getByTestId("h")).toHaveClass("flex", "items-start");
    expect(screen.getByTestId("a")).toHaveClass("shrink-0");
  });
});
