import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  accordionItemVariants,
} from "./accordion";

function Fixture(props: {
  variant?: "faq" | "default";
  iconPosition?: "left" | "right";
  divider?: boolean;
}) {
  return (
    <Accordion
      type="single"
      collapsible
      variant={props.variant}
      iconPosition={props.iconPosition}
    >
      <AccordionItem value="a" divider={props.divider}>
        <AccordionTrigger>Is there a free trial?</AccordionTrigger>
        <AccordionContent>Thirty days.</AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

const icons = () =>
  [...document.querySelectorAll("[data-slot=accordion-icon] svg")].map(
    (s) => s.getAttribute("class") ?? "",
  );

describe("Accordion", () => {
  it("opens and closes from the trigger", async () => {
    const user = userEvent.setup();
    render(<Fixture />);
    const trigger = screen.getByRole("button", {
      name: "Is there a free trial?",
    });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Thirty days.")).toBeVisible();
    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("swaps the icon pair by variant — the one thing Figma's Type axis changes", () => {
    const { unmount } = render(<Fixture variant="default" />);
    expect(icons().join(" ")).toContain("chevron-down");
    expect(icons().join(" ")).toContain("chevron-up");
    unmount();
    render(<Fixture variant="faq" />);
    // Plus and minus promise something appears; a chevron promises it unfolds.
    expect(icons().join(" ")).toContain("circle-plus");
    expect(icons().join(" ")).toContain("circle-minus");
  });

  it("colours the icon by state, not by variant", () => {
    render(<Fixture variant="faq" />);
    const [closed, open] = icons();
    expect(closed).toContain("text-content-neutral-subtle");
    expect(open).toContain("text-content-neutral-emphasis");
  });

  it("puts the icon on the side asked for", () => {
    const { unmount } = render(<Fixture iconPosition="right" />);
    let trigger = screen.getByRole("button");
    expect(trigger.firstElementChild).not.toHaveAttribute(
      "data-slot",
      "accordion-icon",
    );
    expect(trigger.lastElementChild).toHaveAttribute(
      "data-slot",
      "accordion-icon",
    );
    unmount();
    render(<Fixture iconPosition="left" />);
    trigger = screen.getByRole("button");
    expect(trigger.firstElementChild).toHaveAttribute(
      "data-slot",
      "accordion-icon",
    );
  });

  it("insets the content past the icon so it lines up with the title", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<Fixture iconPosition="right" />);
    await user.click(screen.getByRole("button"));
    // 24 for the icon plus the row's 16 gap.
    expect(
      document.querySelector("[data-slot=accordion-content] > div"),
    ).toHaveClass("pe-10");
    unmount();
    render(<Fixture iconPosition="left" />);
    await user.click(screen.getByRole("button"));
    expect(
      document.querySelector("[data-slot=accordion-content] > div"),
    ).toHaveClass("ps-10");
  });

  it("draws the divider above an item, so a list has no trailing rule", () => {
    expect(accordionItemVariants({ divider: true })).toContain("border-t");
    expect(accordionItemVariants({ divider: true })).toContain("pt-6");
    expect(accordionItemVariants({ divider: false })).not.toContain("border-t");
  });

  it("opens and closes on the motion tokens, and as a fade under reduced motion", async () => {
    const user = userEvent.setup();
    render(<Fixture />);
    await user.click(screen.getByRole("button"));
    expect(document.querySelector("[data-slot=accordion-content]")).toHaveClass(
      "data-[state=open]:animate-accordion-down",
      "data-[state=closed]:animate-accordion-up",
    );
  });
});
