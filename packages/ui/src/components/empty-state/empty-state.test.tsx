import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Inbox } from "lucide-react";
import { EmptyState } from "./empty-state";

describe("EmptyState", () => {
  it("renders the title and the reason", () => {
    render(
      <EmptyState
        title="No alerts in the last 24 hours"
        description="Widen the time range to see older activity."
      />,
    );
    expect(
      screen.getByText("No alerts in the last 24 hours"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Widen the time range to see older activity."),
    ).toBeInTheDocument();
  });

  it("does not announce itself — a data component owns that", () => {
    render(<EmptyState title="Nothing here" description="Why not." />);
    const el = document.querySelector("[data-slot='empty-state']")!;
    expect(el).not.toHaveAttribute("role");
    expect(el).not.toHaveAttribute("aria-live");
  });

  it("drops the drawing at sm, where a 160 box would be bigger than the hole", () => {
    const { unmount } = render(
      <EmptyState
        illustration="fleet-health"
        title="None"
        description="Why."
      />,
    );
    expect(document.querySelector("[data-slot='illustration']")).not.toBeNull();
    unmount();

    render(
      <EmptyState
        size="sm"
        illustration="fleet-health"
        title="None"
        description="Why."
      />,
    );
    expect(document.querySelector("[data-slot='illustration']")).toBeNull();
  });

  it("hides the drawing from assistive tech — the title says the same thing", () => {
    render(
      <EmptyState
        illustration="issue-alerts"
        title="No issues"
        description="Nothing has crossed a threshold."
      />,
    );
    // label={null}, so it is hidden rather than named twice.
    const art = document.querySelector("[data-slot='illustration']")!;
    expect(art).toHaveAttribute("aria-hidden");
    expect(art).not.toHaveAttribute("aria-label");
    expect(art).not.toHaveAttribute("role");
    // interactive={false} — nothing in an empty state answers the pointer.
    expect(art).not.toHaveAttribute("data-interactive");
  });

  it("marks an icon decorative", () => {
    render(
      <EmptyState
        size="sm"
        icon={<Inbox />}
        title="Empty"
        description="Why."
      />,
    );
    expect(
      document.querySelector("[data-slot='empty-state-icon']"),
    ).toHaveAttribute("aria-hidden");
  });

  it("caps the text rather than the box, so a wide panel still reads", () => {
    render(<EmptyState title="A" description="B" />);
    expect(document.querySelector("[data-slot='empty-state']")!.className)
      .toContain("[&>[data-slot=empty-state-text]]:max-w-80");
  });

  it("renders an action only when given one", () => {
    const { unmount } = render(<EmptyState title="A" description="B" />);
    expect(
      document.querySelector("[data-slot='empty-state-action']"),
    ).toBeNull();
    unmount();
    render(<EmptyState title="A" description="B" action={<button>Go</button>} />);
    expect(
      document.querySelector("[data-slot='empty-state-action']"),
    ).not.toBeNull();
  });
});
