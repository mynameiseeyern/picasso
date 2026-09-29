import type { Meta, StoryObj } from "@storybook/react";
import { Avatar, AvatarAddButton, AvatarFallback, AvatarGroup, AvatarImage, AvatarStatus } from "./avatar";

const meta: Meta<typeof Avatar> = {
  title: "Components/Avatar",
  component: Avatar,
  parameters: {
    docs: {
      description: {
        component:
          "A person or tenant, as a picture, initials or a generic mark. " +
          "Always give it something to fall back to — profile pictures fail " +
          "more often than anything else on the page.",
      },
    },
  },
  argTypes: {
    size: { control: "inline-radio", options: ["xs", "sm", "md"] },
    variant: { control: "inline-radio", options: ["default", "inverse"] },
    ring: { control: "boolean" },
  },
  args: { size: "md", variant: "default", ring: false },
};
export default meta;
type Story = StoryObj<typeof Avatar>;

export const Default: Story = {
  render: (args) => (
    <Avatar {...args}>
      <AvatarFallback>OR</AvatarFallback>
    </Avatar>
  ),
};

export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex items-center gap-4">
      {(["xs", "sm", "md"] as const).map((s) => (
        <Avatar key={s} size={s}>
          <AvatarFallback>OR</AvatarFallback>
        </Avatar>
      ))}
    </div>
  ),
};

export const Styles: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar><AvatarFallback>OR</AvatarFallback></Avatar>
      <Avatar variant="inverse"><AvatarFallback>OR</AvatarFallback></Avatar>
      <Avatar><AvatarFallback icon /></Avatar>
      <Avatar variant="inverse"><AvatarFallback icon /></Avatar>
    </div>
  ),
};

/** The fallback is what people actually see when a picture 404s. */
export const WithAnImage: Story = {
  name: "With an image",
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar>
        <AvatarImage src="https://example.invalid/missing.png" alt="Orla Ryan" />
        <AvatarFallback>OR</AvatarFallback>
      </Avatar>
      <span className="text-body-sm text-content-neutral-subtle">image fails → initials</span>
    </div>
  ),
};

/** Each dot carries a name, so it is not colour alone. */
export const Status: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar><AvatarFallback>OR</AvatarFallback><AvatarStatus type="online" /></Avatar>
      <Avatar><AvatarFallback>OR</AvatarFallback><AvatarStatus type="offline" /></Avatar>
      <Avatar><AvatarFallback>OR</AvatarFallback><AvatarStatus type="verified" label="Verified tenant" /></Avatar>
      <Avatar><AvatarFallback>OR</AvatarFallback><AvatarStatus type="count" count={8} /></Avatar>
    </div>
  ),
};

/** The ring separates an avatar from whatever sits behind it. */
export const Ringed: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex items-center gap-4 rounded-lg bg-surface-neutral-emphasis p-4">
      <Avatar ring><AvatarFallback>OR</AvatarFallback></Avatar>
      <Avatar ring variant="inverse"><AvatarFallback>EN</AvatarFallback></Avatar>
    </div>
  ),
};

/** Overlap is 4 / 8 / 12 by size, and the add button sits 8px clear of it. */
export const Group: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-6">
      {(["xs", "sm", "md"] as const).map((s) => (
        <AvatarGroup key={s} size={s} action={<AvatarAddButton label="Add to this incident" />}>
          <Avatar><AvatarFallback>OR</AvatarFallback></Avatar>
          <Avatar><AvatarFallback>EN</AvatarFallback></Avatar>
          <Avatar><AvatarFallback>SK</AvatarFallback></Avatar>
          <Avatar><AvatarFallback>VP</AvatarFallback></Avatar>
        </AvatarGroup>
      ))}
    </div>
  ),
};

/** The group sets Size and Style; a child can still opt out. */
export const GroupInverse: Story = {
  name: "Group, inverse",
  parameters: { controls: { disable: true } },
  render: () => (
    <AvatarGroup variant="inverse" action={<AvatarAddButton />}>
      <Avatar><AvatarFallback>OR</AvatarFallback></Avatar>
      <Avatar><AvatarFallback>EN</AvatarFallback></Avatar>
      <Avatar variant="default"><AvatarFallback>SK</AvatarFallback></Avatar>
    </AvatarGroup>
  ),
};

/** Past about five, cap it and let the +N carry the rest. */
export const GroupOverflow: Story = {
  name: "Group, capped",
  parameters: { controls: { disable: true } },
  render: () => (
    <AvatarGroup max={4} action={<AvatarAddButton />}>
      {["OR", "EN", "SK", "VP", "AM", "JL", "TW"].map((t) => (
        <Avatar key={t}><AvatarFallback>{t}</AvatarFallback></Avatar>
      ))}
    </AvatarGroup>
  ),
};
