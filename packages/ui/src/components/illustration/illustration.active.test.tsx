import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, render } from "@testing-library/react";
import {
  Illustration,
  illustrationMechanic,
  magnify,
  resultAt,
  widgetAt,
  type IllustrationName,
} from "./illustration";

const NAMES = Object.keys(illustrationMechanic) as IllustrationName[];
const byMechanic = (m: "lift" | "magnify" | "sequence") =>
  NAMES.filter((name) => illustrationMechanic[name] === m);

describe("every drawing", () => {
  it("has a name, and an accent on two shapes at most", () => {
    // Spotkit's limit. A glyph and the tint behind it are one mark.
    for (const name of NAMES) {
      const { container, unmount } = render(<Illustration name={name} />);
      expect(container.querySelector("svg")).toHaveAttribute("aria-label");
      const marks = container.querySelectorAll(
        ".text-content-primary-muted, .fill-surface-primary-emphasis",
      );
      expect({ name, marks: marks.length <= 2 }).toEqual({ name, marks: true });
      unmount();
    }
  });

  it("listens on nothing when it is not interactive", () => {
    for (const name of NAMES) {
      const { container, unmount } = render(
        <Illustration name={name} interactive={false} />,
      );
      expect(
        container.querySelector("[data-slot=illustration-hit]"),
      ).toBeNull();
      expect(container.innerHTML).not.toContain("group-hover/illustration:");
      expect(container.innerHTML).not.toContain("animate-illustration");
      unmount();
    }
  });

  it("uses only semantic colour utilities", () => {
    for (const name of NAMES) {
      const { container, unmount } = render(<Illustration name={name} />);
      expect(container.innerHTML).not.toMatch(/#[0-9a-f]{3,8}\b/i);
      expect(container.innerHTML).not.toMatch(/(fill|stroke)-\[/);
      unmount();
    }
  });
});

describe("active — a parent drives the response", () => {
  it("stops listening to the pointer once a parent drives it", () => {
    for (const name of NAMES) {
      for (const active of [true, false]) {
        const { container, unmount } = render(
          <Illustration name={name} active={active} />,
        );
        expect(
          container.querySelector("[data-slot=illustration-hit]"),
        ).toBeNull();
        expect(container.innerHTML).not.toContain("group-hover/illustration:");
        unmount();
      }
    }
  });

  it("marks the root while it is active", () => {
    const { container, rerender } = render(
      <Illustration name="assistant" active />,
    );
    const svg = container.querySelector("svg")!;
    expect(svg).toHaveAttribute("data-active");
    rerender(<Illustration name="assistant" active={false} />);
    expect(svg).not.toHaveAttribute("data-active");
  });

  it("drives even a picture that is otherwise still", () => {
    const { container } = render(
      <Illustration name="call-readiness" interactive={false} active />,
    );
    expect(container.innerHTML).toContain(
      "group-data-[active]/illustration:animate-illustration-check",
    );
  });

  it("lift: opens the next item, and closes back to the first", () => {
    const slot = {
      "issue-alerts": "illustration-card",
      "search-results": "illustration-result",
      dashboards: "illustration-widget",
    } as Record<string, string>;
    for (const name of byMechanic("lift")) {
      const open = (c: HTMLElement) =>
        [...c.querySelectorAll(`[data-slot=${slot[name]}]`)].findIndex((el) =>
          el.hasAttribute("data-open"),
        );
      const { container, rerender, unmount } = render(
        <Illustration name={name} active={false} />,
      );
      expect({ name, open: open(container) }).toEqual({ name, open: 0 });
      rerender(<Illustration name={name} active />);
      expect({ name, open: open(container) }).toEqual({ name, open: 1 });
      unmount();
    }
  });

  it("sequence: runs on the active flag, guarded by motion-safe", () => {
    for (const name of byMechanic("sequence")) {
      const { container, unmount } = render(
        <Illustration name={name} active />,
      );
      const animated = [
        ...container.querySelectorAll('[class*="animate-illustration"]'),
      ];
      expect(animated.length).toBeGreaterThan(0);
      for (const el of animated)
        expect(el.getAttribute("class")).toMatch(
          /motion-safe:group-data-\[active\]\/illustration:animate-illustration-/,
        );
      unmount();
    }
  });
});

describe("magnify driven by a parent", () => {
  let reduce = false;
  beforeEach(() => {
    reduce = false;
    vi.stubGlobal(
      "matchMedia",
      () => ({ matches: reduce }) as unknown as MediaQueryList,
    );
    vi.useFakeTimers({
      toFake: ["requestAnimationFrame", "cancelAnimationFrame", "performance"],
    });
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  const slot = {
    "fleet-health": "illustration-dot",
    topology: "illustration-node",
    "team-access": "illustration-cell",
  } as Record<string, string>;

  it("swells around the flagged shape, then settles back", () => {
    for (const name of byMechanic("magnify")) {
      const { container, rerender, unmount } = render(
        <Illustration name={name} active={false} />,
      );
      const shapes = () =>
        [
          ...container.querySelectorAll(`[data-slot=${slot[name]}]`),
        ] as SVGCircleElement[];
      const flagged = shapes().findIndex((s) => s.hasAttribute("data-focus"));
      const r = () => Number(shapes()[flagged].getAttribute("r"));
      const rest = r();
      rerender(<Illustration name={name} active />);
      act(() => vi.advanceTimersByTime(2000));
      expect({ name, swelled: r() > 5 }).toEqual({ name, swelled: true });
      rerender(<Illustration name={name} active={false} />);
      act(() => vi.advanceTimersByTime(2000));
      expect(r()).toBeCloseTo(rest, 1);
      unmount();
    }
  });

  it("leaves the radii alone under reduced motion", () => {
    reduce = true;
    const { container } = render(<Illustration name="topology" active />);
    act(() => vi.advanceTimersByTime(2000));
    for (const node of container.querySelectorAll(
      "[data-slot=illustration-node]",
    ))
      expect(Number(node.getAttribute("r"))).toBeLessThan(3.5);
  });

  it("keeps neighbours apart in every field", () => {
    // The tightest field is the fleet at 14; access cells sit 18 apart and
    // start from a larger rest radius.
    for (let t = 0; t <= 18; t += 0.25)
      expect(magnify(t, 3) + magnify(18 - t, 3)).toBeLessThan(16);
  });
});

describe("lift — new drawings", () => {
  it("search results: the result just opened still owns the pointer", () => {
    for (let y = 40; y < 140; y += 1)
      for (const from of [0, 1, 2]) {
        const hit = resultAt(y, from);
        expect(resultAt(y, hit)).toBe(hit);
      }
  });

  it("search results: pointing at the query keeps the open result", () => {
    expect(resultAt(40, 2)).toBe(2);
  });

  it("dashboards: each quadrant owns its widget", () => {
    expect(widgetAt({ x: 40, y: 40 })).toBe(0);
    expect(widgetAt({ x: 120, y: 40 })).toBe(1);
    expect(widgetAt({ x: 40, y: 120 })).toBe(2);
    expect(widgetAt({ x: 120, y: 120 })).toBe(3);
  });
});

describe("sequence — new drawings", () => {
  it("lights four steps a quarter-loop apart", () => {
    for (const name of ["activity-log", "integrations", "assistant"] as const) {
      const { container, unmount } = render(<Illustration name={name} />);
      const delays = [
        ...container.querySelectorAll<SVGElement>(
          "[data-slot=illustration-step]",
        ),
      ].map((step) => step.style.getPropertyValue("--illustration-delay"));
      expect({ name, delays }).toEqual({
        name,
        delays: ["0ms", "600ms", "1200ms", "1800ms"],
      });
      unmount();
    }
  });
});
