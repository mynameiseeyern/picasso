import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { PageFooter } from "./page-footer";

/*
 * jsdom has no layout engine, so nothing here proves the buttons sit at the
 * inline end or that the rule spans the column — both are measured in a
 * browser. What is worth holding is the contract: the children render, in
 * order, inside one marked element that draws a rule.
 */
describe("PageFooter", () => {
  it("renders its actions in the order given", () => {
    render(
      <PageFooter>
        <button type="button">Cancel</button>
        <button type="submit">Save changes</button>
      </PageFooter>,
    );
    const names = screen.getAllByRole("button").map((b) => b.textContent);
    expect(names).toEqual(["Cancel", "Save changes"]);
  });

  it("marks itself and draws the rule", () => {
    const { container } = render(
      <PageFooter>
        <button type="submit">Save</button>
      </PageFooter>,
    );
    const footer = container.querySelector(
      '[data-slot="page-footer"]',
    ) as HTMLElement;
    expect(footer).not.toBeNull();
    expect(footer.className).toContain("border-t");
    expect(footer.className).toContain("justify-end");
  });

  it("is a plain div, not a footer landmark", () => {
    const { container } = render(
      <PageFooter>
        <button type="submit">Save</button>
      </PageFooter>,
    );
    expect(container.querySelector('[data-slot="page-footer"]')?.tagName).toBe(
      "DIV",
    );
    expect(screen.queryByRole("contentinfo")).toBeNull();
  });
});
