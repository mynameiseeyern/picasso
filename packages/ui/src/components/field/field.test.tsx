import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  Field,
  FieldControl,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldOption,
} from "./field";
import { Input } from "../input/input";
import { Checkbox } from "../checkbox/checkbox";

const Example = (props: {
  invalid?: boolean;
  disabled?: boolean;
  required?: boolean;
}) => (
  <Field invalid={props.invalid} disabled={props.disabled}>
    <FieldLabel required={props.required}>Threshold</FieldLabel>
    <FieldControl required={props.required}>
      <Input placeholder="3.6" />
    </FieldControl>
    <FieldDescription>MOS is measured to one decimal.</FieldDescription>
    <FieldError>Use 3.6, not 3.60000.</FieldError>
  </Field>
);

describe("Field", () => {
  it("associates the label with the control, so clicking it focuses", async () => {
    render(<Example />);
    // This is the whole reason the component exists: the association happens
    // by using it, not by remembering to pass an id.
    await userEvent.click(screen.getByText("Threshold"));
    expect(screen.getByRole("textbox")).toHaveFocus();
  });

  it("describes the control with the hint when valid", () => {
    render(<Example />);
    expect(screen.getByRole("textbox")).toHaveAccessibleDescription(
      "MOS is measured to one decimal.",
    );
  });

  it("swaps hint for error when invalid, and describes with the error", () => {
    render(<Example invalid />);
    const control = screen.getByRole("textbox");
    expect(control).toHaveAttribute("aria-invalid", "true");
    expect(control).toHaveAccessibleDescription("Use 3.6, not 3.60000.");
    expect(
      screen.queryByText("MOS is measured to one decimal."),
    ).not.toBeInTheDocument();
  });

  it("announces the error, rather than waiting for focus to reach the control", () => {
    render(<Example invalid />);
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Use 3.6, not 3.60000.",
    );
  });

  it("renders no error while the field is valid", () => {
    render(<Example />);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("disables the control from the Field, not from the caller", () => {
    render(<Example disabled />);
    expect(screen.getByRole("textbox")).toBeDisabled();
  });

  it("marks required on the control, not only with an asterisk", () => {
    render(<Example required />);
    // The asterisk is aria-hidden, so it cannot be the only signal.
    expect(screen.getByRole("textbox")).toHaveAttribute(
      "aria-required",
      "true",
    );
    expect(screen.getByText("*")).toHaveAttribute("aria-hidden", "true");
  });

  it("refuses to be used outside a Field", () => {
    const quiet = { error: console.error };
    console.error = () => {};
    expect(() => render(<FieldLabel>Orphan</FieldLabel>)).toThrow(
      /inside a <Field>/,
    );
    console.error = quiet.error;
  });

  it("adds a help button beside the label that explains the field on focus", async () => {
    const { default: userEvent } = await import("@testing-library/user-event");
    render(
      <Field>
        <FieldLabel help="Probes report every 30 seconds.">
          Poll interval
        </FieldLabel>
        <FieldControl>
          <input />
        </FieldControl>
      </Field>,
    );
    const help = screen.getByRole("button", { name: "About Poll interval" });
    // beside the label, not inside it — a button in a <label> would click the control
    expect(help.closest("label")).toBeNull();
    expect(screen.getByLabelText("Poll interval")).toBeInTheDocument();
    // first stop: it sits beside the label, before the control
    await userEvent.tab();
    expect(help).toHaveFocus();
    expect(await screen.findByRole("tooltip")).toHaveTextContent(
      "Probes report every 30 seconds.",
    );
  });
});

describe("FieldOption", () => {
  it("makes the whole row the target, not the 16px control", async () => {
    render(
      <FieldOption control={<Checkbox />}>Email me when it trips</FieldOption>,
    );
    const box = screen.getByRole("checkbox");
    expect(box).not.toBeChecked();
    // clicking the WORDS is the point — a label that only wraps the control
    // leaves the text dead, which is the thing this component exists to fix
    await userEvent.click(screen.getByText("Email me when it trips"));
    expect(box).toBeChecked();
  });

  it("names the control from the label", () => {
    render(<FieldOption control={<Checkbox />}>Page the on-call</FieldOption>);
    expect(
      screen.getByRole("checkbox", { name: "Page the on-call" }),
    ).toBeInTheDocument();
  });

  it("describes rather than renames, when there is a second line", () => {
    render(
      <FieldOption control={<Checkbox />} description="Weekdays only.">
        Send a digest
      </FieldOption>,
    );
    const box = screen.getByRole("checkbox", { name: "Send a digest" });
    expect(box).toHaveAccessibleDescription("Weekdays only.");
  });

  it("carries 24 everywhere and 44 where the pointer is coarse", () => {
    const { container } = render(
      <FieldOption control={<Checkbox />}>A row</FieldOption>,
    );
    const label = container.querySelector('[data-slot="field-option-label"]')!;
    // 24 is the WCAG 2.2 AA floor (2.5.8); 44 is what a thumb wants.
    expect(label.className).toContain("min-h-6");
    expect(label.className).toContain("pointer-coarse:min-h-11");
  });

  it("disables the control from the row", () => {
    render(
      <FieldOption control={<Checkbox />} disabled>
        Page the on-call
      </FieldOption>,
    );
    expect(screen.getByRole("checkbox")).toBeDisabled();
  });

  it("does not click through when disabled", async () => {
    render(
      <FieldOption control={<Checkbox />} disabled>
        Page the on-call
      </FieldOption>,
    );
    await userEvent.click(screen.getByText("Page the on-call"));
    expect(screen.getByRole("checkbox")).not.toBeChecked();
  });
});
