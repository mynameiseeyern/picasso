import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Field, FieldControl, FieldDescription, FieldError, FieldLabel } from "./field";
import { Input } from "../input/input";

const Example = (props: { invalid?: boolean; disabled?: boolean; required?: boolean }) => (
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
    expect(screen.queryByText("MOS is measured to one decimal.")).not.toBeInTheDocument();
  });

  it("announces the error, rather than waiting for focus to reach the control", () => {
    render(<Example invalid />);
    expect(screen.getByRole("alert")).toHaveTextContent("Use 3.6, not 3.60000.");
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
    expect(screen.getByRole("textbox")).toHaveAttribute("aria-required", "true");
    expect(screen.getByText("*")).toHaveAttribute("aria-hidden", "true");
  });

  it("refuses to be used outside a Field", () => {
    const quiet = { error: console.error };
    console.error = () => {};
    expect(() => render(<FieldLabel>Orphan</FieldLabel>)).toThrow(/inside a <Field>/);
    console.error = quiet.error;
  });
});
