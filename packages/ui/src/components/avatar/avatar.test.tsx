import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Avatar, AvatarAddButton, AvatarFallback, AvatarGroup, AvatarImage, AvatarStatus } from "./avatar";

describe("Avatar", () => {
  it("shows the fallback until an image loads", () => {
    render(
      <Avatar>
        <AvatarImage src="/nope.png" alt="Orla Ryan" />
        <AvatarFallback>OR</AvatarFallback>
      </Avatar>,
    );
    // jsdom never loads the image, which is the same path as a broken one.
    expect(screen.getByText("OR")).toBeInTheDocument();
  });

  it("takes the measured box and type ramp for each size", () => {
    const { container, rerender } = render(<Avatar size="xs" />);
    const el = () => container.querySelector("[data-slot=avatar]")!;
    expect(el().className).toContain("size-6");
    expect(el().className).toContain("text-label-xs");
    rerender(<Avatar size="sm" />);
    expect(el().className).toContain("size-8");
    expect(el().className).toContain("text-heading-xs");
    rerender(<Avatar size="md" />);
    expect(el().className).toContain("size-10");
    expect(el().className).toContain("text-heading-sm");
  });

  it("draws the border as an inset ring, so a bordered avatar is the same size", () => {
    const { container } = render(<Avatar ring />);
    const cls = container.querySelector("[data-slot=avatar]")!.className;
    // Figma wraps a 40 box around a 38 avatar — 1px inside, not outside.
    expect(cls).toContain("ring-inset");
    expect(cls).toContain("ring-surface-card");
    expect(cls).toContain("size-10");
  });

  it("does not clip, because the status dot sits on its edge", () => {
    const { container } = render(<Avatar />);
    expect(container.querySelector("[data-slot=avatar]")!.className).not.toContain("overflow-hidden");
  });

  it("gives the status dot a name — a silently green avatar says nothing", () => {
    const { rerender } = render(
      <Avatar>
        <AvatarStatus type="online" />
      </Avatar>,
    );
    expect(screen.getByRole("img", { name: "online" })).toBeInTheDocument();
    rerender(
      <Avatar>
        <AvatarStatus type="count" count={8} />
      </Avatar>,
    );
    expect(screen.getByRole("img", { name: "8 unread" })).toHaveTextContent("8");
  });

  it("sizes the dot from the avatar around it", () => {
    const { container, rerender } = render(
      <Avatar size="xs">
        <AvatarStatus type="online" />
      </Avatar>,
    );
    const dot = () => container.querySelector("[data-slot=avatar-status]")!;
    expect(dot().className).toContain("size-2.5");
    rerender(
      <Avatar size="md">
        <AvatarStatus type="online" />
      </Avatar>,
    );
    expect(dot().className).toContain("size-3.5");
  });

  it("offers the generic person instead of initials", () => {
    const { container } = render(
      <Avatar>
        <AvatarFallback icon />
      </Avatar>,
    );
    expect(container.querySelector("[data-slot=avatar-fallback] svg")).toBeInTheDocument();
  });
});

describe("AvatarGroup", () => {
  it("overlaps by the step Figma measures, not a guessed ratio", () => {
    const { container, rerender } = render(<AvatarGroup size="xs"><Avatar /></AvatarGroup>);
    const stack = () => container.querySelector("[data-slot=avatar-stack]")!;
    // slot item spacing in Figma: xs -4, sm -8, md -12.
    expect(stack().className).toContain("-space-x-1");
    rerender(<AvatarGroup size="sm"><Avatar /></AvatarGroup>);
    expect(stack().className).toContain("-space-x-2");
    rerender(<AvatarGroup size="md"><Avatar /></AvatarGroup>);
    expect(stack().className).toContain("-space-x-3");
  });

  it("sizes and styles its children, the way the group's own axes do", () => {
    const { container } = render(
      <AvatarGroup size="sm" variant="inverse">
        <Avatar />
      </AvatarGroup>,
    );
    const cls = container.querySelector("[data-slot=avatar]")!.className;
    expect(cls).toContain("size-8");
    expect(cls).toContain("bg-surface-neutral-emphasis");
  });

  it("lets one avatar opt out of the group's size", () => {
    const { container } = render(
      <AvatarGroup size="sm">
        <Avatar size="md" data-testid="big" />
      </AvatarGroup>,
    );
    expect(container.querySelector("[data-slot=avatar]")!.className).toContain("size-10");
  });

  it("keeps the trailing action out of the overlap", () => {
    const { container } = render(
      <AvatarGroup action={<AvatarAddButton />}>
        <Avatar />
      </AvatarGroup>,
    );
    const stack = container.querySelector("[data-slot=avatar-stack]")!;
    const add = container.querySelector("[data-slot=avatar-add]")!;
    // Figma composes it as slot + 8px gap + button, so the button is a
    // sibling of the stack rather than another overlapping child.
    expect(stack.contains(add)).toBe(false);
    expect(container.querySelector("[data-slot=avatar-group]")!.className).toContain("gap-2");
  });
});

describe("AvatarAddButton", () => {
  it("is a real button and says what it adds", () => {
    render(<AvatarAddButton />);
    const btn = screen.getByRole("button", { name: "Add person" });
    expect(btn).toHaveAttribute("type", "button");
  });

  it("inherits the group's size and style", () => {
    const { container } = render(
      <AvatarGroup size="xs" variant="inverse" action={<AvatarAddButton />}>
        <Avatar />
      </AvatarGroup>,
    );
    const cls = container.querySelector("[data-slot=avatar-add]")!.className;
    expect(cls).toContain("size-6");
    expect(cls).toContain("bg-surface-neutral-emphasis");
  });

  it("takes one disabled treatment for both styles, as the file draws it", () => {
    const { container } = render(<AvatarAddButton variant="inverse" disabled />);
    const cls = container.querySelector("[data-slot=avatar-add]")!.className;
    expect(cls).toContain("disabled:bg-surface-disabled");
    expect(cls).toContain("disabled:border-line-disabled");
  });
});
describe("AvatarGroup ring", () => {
  it("follows the file and ships unringed, blob and all", () => {
    const { container } = render(<AvatarGroup><Avatar /></AvatarGroup>);
    expect(container.querySelector("[data-slot=avatar]")!.className).not.toContain("ring-inset");
  });

  it("rings every child in one prop, which is the fix if we want it", () => {
    const { container } = render(<AvatarGroup ring><Avatar /><Avatar /></AvatarGroup>);
    for (const el of container.querySelectorAll("[data-slot=avatar]")) {
      expect(el.className).toContain("ring-inset");
    }
  });
});
