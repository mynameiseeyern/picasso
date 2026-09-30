import type { Meta, StoryObj } from "@storybook/react";
import { Copy, Pencil, Settings, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import { Button } from "../button/button";

const meta: Meta<typeof DropdownMenu> = {
  title: "Components/DropdownMenu",
  component: DropdownMenu,
  parameters: {
    docs: {
      description: {
        component:
          "Actions on a thing, opened from a control. The panel is the " +
          "Compact overlay surface. Rows have no hover state — Radix moves " +
          "focus on pointer-over as well as arrow keys, so focus covers both.",
      },
    },
  },
  decorators: [(S) => <div className="flex justify-center py-12">{S()}</div>],
};
export default meta;
type Story = StoryObj<typeof DropdownMenu>;

export const Default: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Actions</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Endpoint</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <Copy aria-hidden />
            Copy id<DropdownMenuShortcut>⇧⌘C</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Pencil aria-hidden />
            Rename
          </DropdownMenuItem>
          <DropdownMenuItem disabled>
            <Settings aria-hidden />
            Configure
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">
          <Trash2 aria-hidden />
          Delete<DropdownMenuShortcut>⌫</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

/** Destructive last, behind a rule — the pointer travels down the list. */
export const Destructive: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Manage</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>Acknowledge</DropdownMenuItem>
        <DropdownMenuItem>Snooze for an hour</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">
          Delete alert rule
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

/** One level deep, and no more. */
export const WithASubmenu: Story = {
  name: "With a submenu",
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Export</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>Copy link</DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Download as</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem>CSV</DropdownMenuItem>
            <DropdownMenuItem>JSON</DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};
