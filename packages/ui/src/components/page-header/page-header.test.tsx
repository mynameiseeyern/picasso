import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { PageHeader } from "./page-header";

/*
 * jsdom has no layout engine, so nothing here proves the header looks right —
 * the 30px title, the 768 cap on the description and the rule are measured in
 * a browser, not asserted from a class. What is worth testing is the contract
 * a page depends on: one h1, a description that is absent rather than empty,
 * and a rule that can be turned off.
 */
describe("PageHeader", () => {
  it("renders the title as the page's only h1", () => {
    render(<PageHeader title="Notification settings" />);
    const headings = screen.getAllByRole("heading", { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveTextContent("Notification settings");
  });

  it("omits the description element when there is no description", () => {
    const { container } = render(<PageHeader title="Overview" />);
    expect(
      container.querySelector('[data-slot="page-header-description"]'),
    ).toBeNull();
  });

  it("renders the description when given one", () => {
    render(<PageHeader title="Overview" description="Last 24 hours." />);
    expect(screen.getByText("Last 24 hours.")).toBeInTheDocument();
  });

  it("draws the rule by default and drops it with divider={false}", () => {
    const { container, rerender } = render(<PageHeader title="Overview" />);
    const header = () =>
      container.querySelector('[data-slot="page-header"]') as HTMLElement;
    expect(header()).toHaveAttribute("data-divider");
    expect(header().className).toContain("border-b");

    rerender(<PageHeader title="Overview" divider={false} />);
    expect(header()).not.toHaveAttribute("data-divider");
    expect(header().className).not.toContain("border-b");
  });

  it("marks its parts with data slots", () => {
    const { container } = render(
      <PageHeader title="Overview" description="Last 24 hours." />,
    );
    for (const slot of [
      "page-header",
      "page-header-title",
      "page-header-description",
    ]) {
      expect(container.querySelector(`[data-slot="${slot}"]`)).not.toBeNull();
    }
  });
});
