import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  Stepper,
  StepperContent,
  StepperDescription,
  StepperIndicator,
  StepperItem,
  StepperSeparator,
  StepperTitle,
  stepperIndicatorVariants,
} from "./stepper";

const STEPS = ["Your details", "Company", "Invite team", "Done"];

function Fixture(props: React.ComponentProps<typeof Stepper>) {
  return (
    <Stepper {...props}>
      {STEPS.map((s, i) => (
        <StepperItem key={s} index={i}>
          <StepperIndicator />
          <StepperContent>
            <StepperTitle>{s}</StepperTitle>
            <StepperDescription>Step {i + 1}</StepperDescription>
          </StepperContent>
          <StepperSeparator />
        </StepperItem>
      ))}
    </Stepper>
  );
}

const items = () => [
  ...document.querySelectorAll<HTMLElement>("[data-slot=stepper-item]"),
];

describe("Stepper", () => {
  it("is a list of steps, not a row of divs", () => {
    render(<Fixture value={1} />);
    expect(screen.getByRole("list")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(4);
  });

  it("derives each status from where the value sits", () => {
    render(<Fixture value={2} />);
    expect(items().map((i) => i.dataset.status)).toEqual([
      "complete",
      "complete",
      "current",
      "incomplete",
    ]);
  });

  it("tells assistive tech which step you are on", () => {
    render(<Fixture value={2} />);
    expect(items()[2]).toHaveAttribute("aria-current", "step");
    expect(items().filter((i) => i.hasAttribute("aria-current"))).toHaveLength(
      1,
    );
  });

  it("lets a step be marked failed or skipped against the derived order", () => {
    render(
      <Stepper value={2}>
        <StepperItem index={0}>
          <StepperIndicator />
        </StepperItem>
        <StepperItem index={1} status="incomplete">
          <StepperIndicator />
        </StepperItem>
        <StepperItem index={2}>
          <StepperIndicator />
        </StepperItem>
      </Stepper>,
    );
    // Index 1 is before the value, so it would derive as complete.
    expect(items()[1]).toHaveAttribute("data-status", "incomplete");
  });

  it("numbers the steps from one, not from zero", () => {
    render(<Fixture value={3} />);
    expect(
      document.querySelectorAll("[data-slot=stepper-indicator]")[3],
    ).toHaveTextContent("4");
  });

  it("shows a check once a step is done, whichever indicator it uses", () => {
    render(<Fixture value={2} indicator="check" />);
    const first = document.querySelectorAll("[data-slot=stepper-indicator]")[0];
    expect(first.querySelector("svg")).not.toBeNull();
  });

  it("colours completion differently per indicator, as the file draws it", () => {
    // One status, two fills, decided by an axis about the indicator.
    expect(
      stepperIndicatorVariants({ indicator: "check", status: "complete" }),
    ).toContain("bg-surface-primary-emphasis");
    expect(
      stepperIndicatorVariants({ indicator: "number", status: "complete" }),
    ).toContain("bg-surface-success-emphasis");
  });

  it("runs the connector off the step before it, and never after the last", () => {
    render(<Fixture value={2} />);
    const seps = [
      ...document.querySelectorAll("[data-slot=stepper-separator]"),
    ];
    expect(seps).toHaveLength(4);
    // Owned by its step, so the colour follows that step's status.
    expect(seps[0]).toHaveClass("bg-line-primary-emphasis");
    expect(seps[2]).toHaveClass("bg-line-neutral-muted");
    // The last one is hidden rather than absent, so the layout does not shift.
    expect(seps[3]).toHaveClass("group-last/step:hidden");
  });

  it("dims an untouched step's text, which is all that separates it from a done one", () => {
    render(<Fixture value={2} />);
    const titles = [...document.querySelectorAll("[data-slot=stepper-title]")];
    expect(titles[3]).toHaveClass("text-content-disabled");
    expect(titles[0]).toHaveClass("text-content-neutral-muted");
  });

  it("sizes the indicator 24 and 32, as drawn", () => {
    expect(stepperIndicatorVariants({ size: "sm" })).toContain("size-6");
    expect(stepperIndicatorVariants({ size: "md" })).toContain("size-8");
  });
});
