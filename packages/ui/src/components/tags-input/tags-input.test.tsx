import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TagsInput } from "./tags-input";

describe("TagsInput", () => {
  it("adds on Enter and comma, and ignores duplicates", async () => {
    const onValueChange = vi.fn();
    render(<TagsInput aria-label="Hosts" onValueChange={onValueChange} />);
    const input = screen.getByRole("textbox", { name: "Hosts" });
    await userEvent.type(input, "syd-03{Enter}mel-01,SYD-03,");
    expect(onValueChange).toHaveBeenLastCalledWith(["syd-03", "mel-01"]);
    expect(screen.getByRole("button", { name: "Remove syd-03" })).toBeInTheDocument();
  });

  it("removes the last tag with Backspace in an empty field, and one tag with its ×", async () => {
    render(<TagsInput aria-label="Hosts" defaultValue={["a", "b", "c"]} />);
    await userEvent.click(screen.getByRole("textbox"));
    await userEvent.keyboard("{Backspace}");
    expect(screen.queryByText("c")).toBeNull();
    await userEvent.click(screen.getByRole("button", { name: "Remove a" }));
    expect(screen.queryByText("a")).toBeNull();
    expect(screen.getByText("b")).toBeInTheDocument();
  });

  it("splits a pasted list", async () => {
    const onValueChange = vi.fn();
    render(<TagsInput aria-label="Hosts" onValueChange={onValueChange} />);
    await userEvent.click(screen.getByRole("textbox"));
    await userEvent.paste("a, b\nc");
    expect(onValueChange).toHaveBeenLastCalledWith(["a", "b", "c"]);
  });

  it("keeps a rejected entry in the field to be corrected", async () => {
    render(<TagsInput aria-label="Emails" validate={(t) => t.includes("@")} />);
    const input = screen.getByRole("textbox");
    await userEvent.type(input, "not-an-email{Enter}");
    expect(input).toHaveValue("not-an-email");
    expect(screen.queryByRole("button", { name: /Remove/ })).toBeNull();
  });
});
