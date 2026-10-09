import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { ListCard } from "./list-card";

const base = {
  href: "#",
  illustration: "issue-alerts" as const,
  title: "Packet loss above 2%",
};

describe("ListCard", () => {
  it("renders the title, meta and badge", () => {
    render(
      <ListCard {...base} badge="Alert rule" meta="Alert rule · 3 sites" />,
    );
    expect(screen.getByText("Packet loss above 2%")).toBeInTheDocument();
    expect(screen.getByText("Alert rule · 3 sites")).toBeInTheDocument();
    expect(
      document.querySelector("[data-slot='list-card-badge']"),
    ).toHaveTextContent("Alert rule");
  });

  it("omits the badge and meta rather than reserving space for them", () => {
    render(<ListCard {...base} />);
    expect(document.querySelector("[data-slot='list-card-badge']")).toBeNull();
    expect(document.querySelector("[data-slot='list-card-meta']")).toBeNull();
  });

  it("has one accessible name — the art says nothing", () => {
    render(<ListCard {...base} meta="Alert rule · 3 sites" />);
    const art = document.querySelector("[data-slot='list-card-art']")!;
    expect(art).toHaveAttribute("aria-hidden");
    // the drawing inside carries no label of its own
    expect(screen.queryByRole("img")).toBeNull();
  });

  describe("the pointer has to settle", () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it("does not answer a pointer that only crosses the row", () => {
      render(<ListCard {...base} />);
      const card = document.querySelector("[data-slot='list-card']")!;

      fireEvent.pointerEnter(card);
      act(() => void vi.advanceTimersByTime(119));
      expect(card).not.toHaveAttribute("data-active");

      fireEvent.pointerLeave(card);
      act(() => void vi.advanceTimersByTime(500));
      expect(card).not.toHaveAttribute("data-active");
    });

    it("answers once the pointer has rested for 120ms", () => {
      render(<ListCard {...base} />);
      const card = document.querySelector("[data-slot='list-card']")!;

      fireEvent.pointerEnter(card);
      act(() => void vi.advanceTimersByTime(120));
      expect(card).toHaveAttribute("data-active");
    });

    it("stops at once on leaving — a card you have left is not still playing", () => {
      render(<ListCard {...base} />);
      const card = document.querySelector("[data-slot='list-card']")!;

      fireEvent.pointerEnter(card);
      act(() => void vi.advanceTimersByTime(200));
      expect(card).toHaveAttribute("data-active");

      fireEvent.pointerLeave(card);
      expect(card).not.toHaveAttribute("data-active");
    });

    it("turns on immediately for the keyboard — arriving by focus is deliberate", () => {
      render(<ListCard {...base} />);
      const card = document.querySelector("[data-slot='list-card']")!;

      fireEvent.focus(card);
      expect(card).toHaveAttribute("data-active");

      fireEvent.blur(card);
      expect(card).not.toHaveAttribute("data-active");
    });
  });

  it("does not lift — no shadow utility on the row", () => {
    render(<ListCard {...base} />);
    const card = document.querySelector("[data-slot='list-card']")!;
    const classes = card.className.split(/\s+/);
    expect(classes.some((c) => /(^|:)shadow-/.test(c))).toBe(false);
  });

  it("hands the row to a router link with asChild", () => {
    render(
      <ListCard {...base} asChild>
        <a href="/fleets/sydney" data-testid="router">
          {null}
        </a>
      </ListCard>,
    );
    expect(screen.getByTestId("router")).toHaveAttribute(
      "href",
      "/fleets/sydney",
    );
  });
});
