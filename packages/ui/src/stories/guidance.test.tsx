import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { Guidance, pairOf, type GuidanceDoc } from "./guidance";
import badge from "../components/badge/guidance.json";

const doc: GuidanceDoc = {
  component: "Test",
  summary: "",
  pairs: [
    {
      id: "only-one",
      dont: "Do the wrong thing.",
      do: "Do the right thing.",
      why: "Because.",
    },
  ],
};

describe("pairOf", () => {
  it("finds a pair by id", () => {
    expect(pairOf(doc)("only-one").why).toBe("Because.");
  });

  it("throws on an id the file does not have, and says what it does have", () => {
    // The point of reading guidance.json: a renamed pair breaks the story
    // instead of quietly leaving stale prose on screen.
    expect(() => pairOf(doc)("typo")).toThrow(/has no pair "typo"/);
    expect(() => pairOf(doc)("typo")).toThrow(/only-one/);
  });

  it("reads a real component's guidance file", () => {
    expect(pairOf(badge as GuidanceDoc)("never-colour-alone").dont).toBe(
      "Signal status with colour and nothing else.",
    );
  });
});

describe("Guidance", () => {
  const pair = pairOf(doc)("only-one");

  it("takes its words from the pair, not the story", () => {
    render(
      <Guidance pair={pair} dont={<span>bad</span>} do={<span>good</span>} />,
    );
    expect(screen.getByText(/Do the wrong thing\./)).toBeInTheDocument();
    expect(screen.getByText(/Do the right thing\./)).toBeInTheDocument();
    expect(screen.getByText("Because.")).toBeInTheDocument();
  });

  it("puts each example in its own panel", () => {
    const { container } = render(
      <Guidance pair={pair} dont={<span>bad</span>} do={<span>good</span>} />,
    );
    const dont = container.querySelector('[data-slot="guidance-dont"]')!;
    const good = container.querySelector('[data-slot="guidance-do"]')!;
    expect(dont).toContainElement(screen.getByText("bad"));
    expect(good).toContainElement(screen.getByText("good"));
    expect(dont.className).toContain("border-line-danger-emphasis");
    expect(good.className).toContain("border-line-success-emphasis");
  });

  it("exposes width and stage, and nothing else", () => {
    const { container } = render(
      <Guidance
        pair={pair}
        width="narrow"
        stage="tall"
        dont={<span>bad</span>}
        do={<span>good</span>}
      />,
    );
    const panel = container.querySelector('[data-slot="guidance-dont"]')!;
    expect(panel.className).toContain("min-w-64");
    expect(panel.firstElementChild!.className).toContain("min-h-28");
  });

  it("defaults to the middle of both scales", () => {
    const { container } = render(
      <Guidance pair={pair} dont={<span>bad</span>} do={<span>good</span>} />,
    );
    const panel = container.querySelector('[data-slot="guidance-dont"]')!;
    expect(panel.className).toContain("min-w-72");
    expect(panel.firstElementChild!.className).toContain("min-h-20");
  });
});
