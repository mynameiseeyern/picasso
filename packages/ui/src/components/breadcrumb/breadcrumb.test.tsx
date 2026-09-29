import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbTrigger,
  breadcrumbListVariants,
} from "./breadcrumb";

function Fixture({ size }: { size?: "md" | "sm" }) {
  return (
    <Breadcrumb size={size}>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink href="/p">Projects</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbEllipsis />
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbTrigger>Sydney</BreadcrumbTrigger>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbPage>Settings</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}

describe("Breadcrumb", () => {
  it("is a landmark a screen reader can jump to", () => {
    render(<Fixture />);
    expect(
      screen.getByRole("navigation", { name: "Breadcrumb" }),
    ).toBeInTheDocument();
  });

  it("marks the last crumb as the current page and does not make it a link", () => {
    render(<Fixture />);
    const page = screen.getByText("Settings");
    expect(page).toHaveAttribute("aria-current", "page");
    expect(page.tagName).not.toBe("A");
    expect(screen.queryByRole("link", { name: "Settings" })).toBeNull();
  });

  it("gives every item its own leading separator and hides the first one", () => {
    render(<Fixture />);
    const seps = document.querySelectorAll("[data-slot=breadcrumb-separator]");
    // One per item, including the first — which is hidden rather than absent,
    // so the gap arithmetic stays the same for every item.
    expect(seps).toHaveLength(5);
    expect(seps[0]).toHaveClass("group-first/item:hidden");
    seps.forEach((s) => expect(s).toHaveAttribute("aria-hidden"));
  });

  it("tightens only the gap at sm — both sizes are body/md", () => {
    expect(breadcrumbListVariants({ size: "md" })).toContain("gap-2.5");
    expect(breadcrumbListVariants({ size: "sm" })).toContain("gap-1.5");
  });

  it("gives the collapsed middle a name, since an ellipsis has none", () => {
    render(<Fixture />);
    expect(screen.getByText("Show hidden levels")).toHaveClass("sr-only");
  });

  it("carries a focus ring, which Figma's Focus variants do not", () => {
    render(<Fixture />);
    // All twelve BreadcrumbItem Focus variants are identical to their Default
    // in the file. A link you cannot see when focused is a keyboard trap.
    expect(screen.getByRole("link", { name: "Home" })).toHaveClass(
      "focus-visible:ring-2",
      "focus-visible:ring-line-focused",
    );
    expect(screen.getByRole("button", { name: "Sydney" })).toHaveClass(
      "focus-visible:ring-2",
    );
  });

  it("makes the dropdown affordance louder than its label, as drawn", () => {
    render(<Fixture />);
    const trigger = screen.getByRole("button", { name: "Sydney" });
    expect(trigger).toHaveClass("text-content-neutral-subtle");
    expect(trigger.querySelector("svg")).toHaveClass(
      "text-content-neutral-emphasis",
    );
  });
});
