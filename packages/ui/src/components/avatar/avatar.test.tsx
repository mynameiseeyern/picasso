import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Avatar, AvatarFallback, AvatarImage, AvatarStatus } from "./avatar";

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
