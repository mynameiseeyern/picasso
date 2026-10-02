import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { Illustration, alertAt, magnify } from "./illustration";

/** jsdom has no layout, so give the picture a 160 box: 1 px is 1 unit. */
function layOut(container: HTMLElement) {
  const svg = container.querySelector("svg[data-slot=illustration]")!;
  svg.getBoundingClientRect = () =>
    ({ left: 0, top: 0, width: 160, height: 160 }) as DOMRect;
  return {
    svg,
    hit: container.querySelector("[data-slot=illustration-hit]")!,
  };
}

const cards = (c: HTMLElement) =>
  [...c.querySelectorAll("[data-slot=illustration-card]")] as SVGGElement[];
const pushed = (c: HTMLElement) =>
  cards(c).map((card) => card.hasAttribute("data-pushed"));
const open = (c: HTMLElement) =>
  cards(c).findIndex((card) => card.hasAttribute("data-open"));

describe("Illustration", () => {
  it("is an image named for the feature", () => {
    render(<Illustration name="fleet-health" />);
    expect(screen.getByRole("img")).toHaveAccessibleName("Fleet health");
  });

  it("is hidden from assistive tech with label={null}", () => {
    const { container } = render(
      <Illustration name="fleet-health" label={null} />,
    );
    expect(screen.queryByRole("img")).toBeNull();
    expect(container.querySelector("svg")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });

  it("listens on nothing when it is not interactive", () => {
    for (const name of ["issue-alerts", "fleet-health", "call-readiness"] as const) {
      const { container, unmount } = render(
        <Illustration name={name} interactive={false} />,
      );
      expect(container.querySelector("[data-slot=illustration-hit]")).toBeNull();
      expect(container.innerHTML).not.toContain("group-hover/illustration:");
      unmount();
    }
  });

  it("keeps the accent to two shapes at rest", () => {
    // Spotkit's limit. A glyph and the tint behind it are one mark.
    for (const name of ["issue-alerts", "fleet-health", "call-readiness"] as const) {
      const { container, unmount } = render(<Illustration name={name} />);
      const marks = container.querySelectorAll(
        ".text-content-primary-muted, .fill-surface-primary-emphasis",
      );
      expect(marks.length).toBeLessThanOrEqual(2);
      unmount();
    }
  });
});

describe("lift — issue alerts", () => {
  it("opens the first alert at rest and pushes the others down", () => {
    const { container } = render(<Illustration name="issue-alerts" />);
    expect(open(container)).toBe(0);
    expect(pushed(container)).toEqual([false, true, true]);
  });

  it("moves the gap to the alert under the pointer", () => {
    const { container } = render(<Illustration name="issue-alerts" />);
    const { hit } = layOut(container);
    // At rest the third card sits at 106–128.
    fireEvent.pointerMove(hit, { clientX: 80, clientY: 115 });
    expect(open(container)).toBe(2);
    expect(pushed(container)).toEqual([false, false, false]);
  });

  it("does not flicker: the alert just opened still owns the pointer", () => {
    // Opening an alert moves it. If the answer were read from fixed slots,
    // the card would slide out from under the pointer and close again.
    for (let y = 34; y < 140; y += 1) {
      for (const from of [0, 1, 2]) {
        const hit = alertAt(y, from);
        expect({ y, from, again: alertAt(y, hit) }).toEqual({
          y,
          from,
          again: hit,
        });
      }
    }
  });

  it("returns to rest when the pointer leaves", () => {
    const { container } = render(<Illustration name="issue-alerts" />);
    const { hit } = layOut(container);
    fireEvent.pointerMove(hit, { clientX: 80, clientY: 115 });
    fireEvent.pointerLeave(hit);
    expect(open(container)).toBe(0);
  });

  it("staggers the cards that make room, nearest the gap first", () => {
    const { container } = render(<Illustration name="issue-alerts" />);
    const delays = cards(container).map((card) =>
      card.style.getPropertyValue("--illustration-delay"),
    );
    expect(delays).toEqual(["0ms", "0ms", "50ms"]);
  });

  it("moves only one accent", () => {
    const { container } = render(<Illustration name="issue-alerts" />);
    const { hit } = layOut(container);
    fireEvent.pointerMove(hit, { clientX: 80, clientY: 115 });
    expect(container.querySelectorAll(".text-content-primary-muted")).toHaveLength(1);
    expect(
      cards(container)[2].querySelector(".text-content-primary-muted"),
    ).not.toBeNull();
  });

  it("hides every closed alert's detail under a card", () => {
    // The detail is always drawn; only position hides it. A closed alert
    // above the gap is covered by the next card; one below the gap by its
    // own card, pushed down over it. This arithmetic ties the gap to where
    // the detail sits — change either and bars start showing through.
    const card = { y: 34, height: 22, step: 28, gap: 16 };
    for (const isOpen of [0, 1, 2]) {
      for (const i of [0, 1, 2]) {
        if (i === isOpen) continue;
        const detailTop = card.y + i * card.step + card.height + 7;
        const detailBottom = detailTop + 8.8;
        const cover = i > isOpen ? i : i + 1;
        const coverTop =
          card.y + cover * card.step + (cover > isOpen ? card.gap : 0);
        expect(coverTop).toBeLessThanOrEqual(detailTop);
        expect(coverTop + card.height).toBeGreaterThanOrEqual(detailBottom);
      }
    }
  });

  it("drops the slide under reduced motion but keeps the state change", () => {
    const { container } = render(<Illustration name="issue-alerts" />);
    for (const card of cards(container))
      expect(card.getAttribute("class")).toContain("motion-reduce:transition-none");
  });
});

describe("magnify — fleet health", () => {
  const dots = (c: HTMLElement) =>
    [...c.querySelectorAll("[data-slot=illustration-dot]")] as SVGCircleElement[];
  const focus = (c: HTMLElement) =>
    dots(c).findIndex((dot) => dot.hasAttribute("data-focus"));

  let reduce = false;
  beforeEach(() => {
    reduce = false;
    vi.stubGlobal(
      "matchMedia",
      () => ({ matches: reduce }) as unknown as MediaQueryList,
    );
    vi.useFakeTimers({ toFake: ["requestAnimationFrame", "cancelAnimationFrame", "performance"] });
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("gives the accent to one flagged endpoint at rest", () => {
    const { container } = render(<Illustration name="fleet-health" />);
    expect(dots(container)).toHaveLength(28);
    expect(focus(container)).toBe(11);
    expect(dots(container)[11]).toHaveAttribute("r", "3.4");
  });

  it("moves the accent to the endpoint nearest the pointer and swells it", () => {
    const { container } = render(<Illustration name="fleet-health" />);
    const { hit } = layOut(container);
    // The first dot is at 38, 52.
    fireEvent.pointerMove(hit, { clientX: 39, clientY: 53 });
    expect(focus(container)).toBe(0);
    act(() => vi.advanceTimersByTime(2000));
    const r = (i: number) => Number(dots(container)[i].getAttribute("r"));
    expect(r(0)).toBeGreaterThan(4.5);
    expect(r(1)).toBeGreaterThan(2.2);
    expect(r(1)).toBeLessThan(r(0));
    expect(r(27)).toBeCloseTo(2.2, 1);
  });

  it("springs back to rest when the pointer leaves", () => {
    const { container } = render(<Illustration name="fleet-health" />);
    const { hit } = layOut(container);
    fireEvent.pointerMove(hit, { clientX: 39, clientY: 53 });
    act(() => vi.advanceTimersByTime(2000));
    fireEvent.pointerLeave(hit);
    act(() => vi.advanceTimersByTime(2000));
    expect(focus(container)).toBe(11);
    expect(Number(dots(container)[0].getAttribute("r"))).toBeCloseTo(2.2, 1);
    expect(Number(dots(container)[11].getAttribute("r"))).toBeCloseTo(3.4, 1);
  });

  it("treats the summary card as off the grid", () => {
    const { container } = render(<Illustration name="fleet-health" />);
    const { hit } = layOut(container);
    fireEvent.pointerMove(hit, { clientX: 140, clientY: 150 });
    expect(focus(container)).toBe(11);
  });

  it("never lets two neighbours touch", () => {
    // Dots are 14 apart. Wherever the pointer sits between two of them,
    // their radii must leave clear space.
    for (let t = 0; t <= 14; t += 0.25)
      expect(magnify(t) + magnify(14 - t)).toBeLessThan(13);
  });

  it("moves the accent but not the radii under reduced motion", () => {
    reduce = true;
    const { container } = render(<Illustration name="fleet-health" />);
    const { hit } = layOut(container);
    fireEvent.pointerMove(hit, { clientX: 39, clientY: 53 });
    act(() => vi.advanceTimersByTime(2000));
    expect(focus(container)).toBe(0);
    expect(dots(container)[0]).toHaveAttribute("r", "2.2");
  });
});

describe("sequence — call readiness", () => {
  const rings = (c: HTMLElement) => [
    ...c.querySelectorAll("[data-slot=illustration-check-ring]"),
  ];

  it("lights the four checks a quarter-loop apart, so only one is lit", () => {
    const { container } = render(<Illustration name="call-readiness" />);
    const delays = [
      ...container.querySelectorAll<SVGGElement>("[data-slot=illustration-check]"),
    ].map((check) => check.style.getPropertyValue("--illustration-delay"));
    // The loop is 2.4s and each ring is lit for 25% of it (theme.css).
    expect(delays).toEqual(["0ms", "600ms", "1200ms", "1800ms"]);
  });

  it("shows no ring at rest and runs only under the pointer", () => {
    const { container } = render(<Illustration name="call-readiness" />);
    expect(rings(container)).toHaveLength(4);
    for (const ring of rings(container)) {
      const cls = ring.getAttribute("class")!;
      expect(cls).toContain("opacity-0");
      expect(cls).toContain(
        "motion-safe:group-hover/illustration:animate-illustration-check",
      );
    }
  });

  it("does not run under reduced motion", () => {
    // Guarded with motion-safe: on the hover class itself. A
    // `motion-reduce:animate-none` beside it loses to the hover variant in
    // the cascade, so the loop would run for the people who asked it not to.
    const { container } = render(<Illustration name="call-readiness" />);
    const animated = [
      ...container.querySelectorAll('[class*="animate-illustration"]'),
    ];
    expect(animated).toHaveLength(8);
    for (const el of animated) {
      const cls = el.getAttribute("class")!;
      expect(cls).toMatch(/motion-safe:group-hover\/illustration:animate-illustration-/);
      expect(cls).not.toMatch(/(^|\s)group-hover\/illustration:animate-/);
    }
  });
});
