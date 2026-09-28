import type { Meta, StoryObj } from "@storybook/react";
import { Avatar, AvatarFallback, AvatarImage, AvatarStatus } from "./avatar";

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
