import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Select, type SelectOption } from "./select";

const options: SelectOption[] = [
  { value: "created", label: "Created", group: "Lifecycle" },
  { value: "updated", label: "Updated", group: "Lifecycle" },
  { value: "deleted", label: "Deleted", group: "Lifecycle" },
  { value: "login", label: "Signed in", group: "Access" },
  { value: "logout", label: "Signed out", group: "Access", disabled: true },
];

const setup = (props: Partial<React.ComponentProps<typeof Select>> = {}) =>
  render(<Select label="Filter actions…" options={options} {...props} />);

describe("Select", () => {
  it("keeps its label and shows a count once something is chosen", () => {
    setup({ defaultValue: ["created", "login"] });
    const trigger = screen.getByRole("button", { name: /Filter actions/ });
    expect(trigger).toHaveTextContent("Filter actions…");
    expect(trigger).toHaveTextContent("2 selected");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("opens a searchable, grouped, multi-select list with focus in the search", async () => {
    setup();
    await userEvent.click(screen.getByRole("button", { name: /Filter actions/ }));
    const search = screen.getByRole("combobox");
    expect(search).toHaveFocus();
    const list = screen.getByRole("listbox");
    expect(list).toHaveAttribute("aria-multiselectable", "true");
    expect(within(list).getAllByRole("group")).toHaveLength(2);
    expect(within(list).getAllByRole("option")).toHaveLength(5);
    await userEvent.type(search, "sign");
    expect(within(list).getAllByRole("option").map((o) => o.textContent)).toEqual(["Signed inlogin", "Signed outlogout"]);
  });

  it("commits only on Apply, in the options' order", async () => {
    const onValueChange = vi.fn();
    setup({ onValueChange });
    await userEvent.click(screen.getByRole("button", { name: /Filter actions/ }));
    await userEvent.click(screen.getByRole("option", { name: /Deleted/ }));
    await userEvent.click(screen.getByRole("option", { name: /Created/ }));
    expect(screen.getByRole("option", { name: /Created/ })).toHaveAttribute("aria-selected", "true");
    expect(onValueChange).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole("button", { name: "Apply" }));
    expect(onValueChange).toHaveBeenCalledWith(["created", "deleted"]);
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("discards the draft when closed without applying", async () => {
    const onValueChange = vi.fn();
    setup({ onValueChange, defaultValue: ["updated"] });
    await userEvent.click(screen.getByRole("button", { name: /Filter actions/ }));
    await userEvent.click(screen.getByRole("option", { name: /Created/ }));
    await userEvent.keyboard("{Escape}");
    expect(onValueChange).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole("button", { name: /Filter actions/ }));
    expect(screen.getByRole("option", { name: /Created/ })).toHaveAttribute("aria-selected", "false");
    expect(screen.getByRole("option", { name: /Updated/ })).toHaveAttribute("aria-selected", "true");
  });

  it("works from the keyboard: arrows move, Enter ticks, Ctrl+Enter applies; disabled options are skipped", async () => {
    const onValueChange = vi.fn();
    setup({ onValueChange });
    await userEvent.click(screen.getByRole("button", { name: /Filter actions/ }));
    const search = screen.getByRole("combobox");
    await userEvent.keyboard("{ArrowUp}");
    // wraps to the last ENABLED option — "Signed out" is disabled
    expect(search).toHaveAttribute("aria-activedescendant", screen.getByRole("option", { name: /Signed in/ }).id);
    await userEvent.keyboard("{Enter}{Control>}{Enter}{/Control}");
    expect(onValueChange).toHaveBeenCalledWith(["login"]);
  });

  it("Clear empties the draft, and still needs Apply", async () => {
    const onValueChange = vi.fn();
    setup({ onValueChange, defaultValue: ["created"] });
    await userEvent.click(screen.getByRole("button", { name: /Filter actions/ }));
    await userEvent.click(screen.getByRole("button", { name: "Clear" }));
    expect(screen.getByRole("button", { name: "Clear" })).toBeDisabled();
    await userEvent.click(screen.getByRole("button", { name: "Apply" }));
    expect(onValueChange).toHaveBeenCalledWith([]);
  });

  it("draws the checkbox rather than nesting a real control in each option", async () => {
    setup();
    await userEvent.click(screen.getByRole("button", { name: /Filter actions/ }));
    const option = screen.getByRole("option", { name: /Created/ });
    expect(within(option).queryByRole("checkbox")).toBeNull();
    expect(within(option).queryByRole("button")).toBeNull();
  });
});
