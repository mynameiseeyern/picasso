import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Search } from "lucide-react";
import {
  InputGroup, InputGroupAddon, InputGroupCheck, InputGroupInput,
  InputGroupSpinner, InputGroupText, InputGroupTooltip,
} from "./input-group";

describe("InputGroup", () => {
  it("focuses the input when the box itself is clicked", async () => {
    const user = userEvent.setup();
    render(
      <InputGroup data-testid="grp">
        <InputGroupAddon><Search /></InputGroupAddon>
        <InputGroupInput aria-label="Search" />
      </InputGroup>,
    );
    // A search icon inside a field is part of the field, so clicking it
    // should land the caret in the input rather than doing nothing.
    await user.click(screen.getByTestId("grp"));
    expect(screen.getByLabelText("Search")).toHaveFocus();
  });

  it("leaves a real control inside the group alone", async () => {
    const user = userEvent.setup();
    render(
      <InputGroup>
        <InputGroupInput aria-label="Threshold" />
        <InputGroupAddon align="end">
          <button type="button">Clear</button>
        </InputGroupAddon>
      </InputGroup>,
    );
    await user.click(screen.getByRole("button", { name: "Clear" }));
    expect(screen.getByLabelText("Threshold")).not.toHaveFocus();
  });

  it("does not focus a disabled input", async () => {
    const user = userEvent.setup();
    render(
      <InputGroup data-testid="grp">
        <InputGroupInput aria-label="Locked" disabled />
      </InputGroup>,
    );
    await user.click(screen.getByTestId("grp"));
    expect(screen.getByLabelText("Locked")).not.toHaveFocus();
  });

  it("is a group, and reads its state off the input rather than off props", () => {
    render(
      <InputGroup data-testid="grp">
        <InputGroupInput aria-label="Threshold" aria-invalid />
      </InputGroup>,
    );
    const grp = screen.getByTestId("grp");
    expect(grp).toHaveAttribute("role", "group");
    // The invalid edge is a has-[] selector, so the group needs no prop and
    // cannot disagree with the control it wraps.
    expect(grp.className).toContain("has-[[aria-invalid=true]]:border-line-input-invalid");
    expect(screen.getByLabelText("Threshold")).toHaveAttribute("aria-invalid", "true");
  });

  it("matches Input's metrics at each size", () => {
    const { rerender } = render(
      <InputGroup data-testid="grp"><InputGroupInput aria-label="a" /></InputGroup>,
    );
    expect(screen.getByTestId("grp").className).toContain("h-9");
    expect(screen.getByTestId("grp").className).toContain("px-3");
    rerender(<InputGroup data-testid="grp" size="sm"><InputGroupInput aria-label="a" /></InputGroup>);
    expect(screen.getByTestId("grp").className).toContain("h-8");
    expect(screen.getByTestId("grp").className).toContain("px-2.5");
  });

  it("announces a working field without stealing focus", () => {
    render(
      <InputGroup>
        <InputGroupInput aria-label="Host" />
        <InputGroupAddon align="end"><InputGroupSpinner label="Checking host" /></InputGroupAddon>
      </InputGroup>,
    );
    expect(screen.getByRole("status")).toHaveTextContent("Checking host");
  });

  it("gives the valid tick a name, since a tick alone says nothing", () => {
    render(
      <InputGroup>
        <InputGroupInput aria-label="Host" />
        <InputGroupAddon align="end"><InputGroupCheck label="Host is reachable" /></InputGroupAddon>
      </InputGroup>,
    );
    expect(screen.getByText("Host is reachable")).toHaveClass("sr-only");
  });

  it("makes the tooltip addon a real button, reachable by keyboard", async () => {
    const user = userEvent.setup();
    render(
      <InputGroup>
        <InputGroupInput aria-label="Threshold" />
        <InputGroupAddon align="end">
          <InputGroupTooltip label="About the threshold">Alerts fire above this.</InputGroupTooltip>
        </InputGroupAddon>
      </InputGroup>,
    );
    const btn = screen.getByRole("button", { name: "About the threshold" });
    await user.tab();
    await user.tab();
    expect(btn).toHaveFocus();
    expect(await screen.findByRole("tooltip")).toHaveTextContent("Alerts fire above this.");
  });

  it("sets a unit in mono, so it reads as syntax rather than as a value", () => {
    render(
      <InputGroup>
        <InputGroupInput aria-label="Threshold" />
        <InputGroupAddon align="end"><InputGroupText>ms</InputGroupText></InputGroupAddon>
      </InputGroup>,
    );
    expect(screen.getByText("ms").className).toContain("text-code-md");
  });
});
