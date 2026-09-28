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

  it("keeps room for the placeholder, so the input wraps rather than truncating", () => {
    render(<TagsInput aria-label="Tags" defaultValue={["prod", "apac"]} />);
    // Figma measures "Add a tag…" at 76px. Below that the input holds its
    // line and clips the placeholder, which is the one thing a box that
    // grows in height exists to avoid. min-w-20 is 80px.
    expect(screen.getByLabelText("Tags").className).toContain("min-w-20");
  });

  it("keeps one chip size and a 6px gap at both sizes, as Figma draws them", () => {
    const { rerender, container } = render(<TagsInput aria-label="Tags" defaultValue={["prod"]} />);
    const box = () => container.querySelector("[data-slot=tags-input]") ?? container.firstElementChild!;
    expect(container.querySelector("[data-slot=input-chip]")!.className).toContain("h-7");
    expect(box().className).toContain("min-h-10");
    expect(box().className).toContain("gap-1.5");
    rerender(<TagsInput aria-label="Tags" size="sm" defaultValue={["prod"]} />);
    // sm shrinks the padding only — 36 tall, same chip, same gap.
    expect(container.querySelector("[data-slot=input-chip]")!.className).toContain("h-7");
    expect(box().className).toContain("min-h-9");
    expect(box().className).toContain("gap-1.5");
  });
});
