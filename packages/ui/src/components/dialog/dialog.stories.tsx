import type { Meta, StoryObj } from "@storybook/react";
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  type DialogContentProps,
} from "./dialog";
import { Button } from "../button/button";
import { Field, FieldControl, FieldLabel } from "../field/field";
import { Input } from "../input/input";
import guidance from "./guidance.json";
import { Guidance, GuidanceStory, pairOf } from "@/stories/guidance";

// The variants live on DialogContent, not on the Root, so the meta types
// against its props — otherwise `size` is not a known arg.
const meta: Meta<DialogContentProps> = {
  title: "Components/Dialog",
  component: DialogContent,
  parameters: {
    docs: {
      description: {
        component:
          "A modal for a focused task that interrupts the flow, always over " +
          "a scrim. sm for confirmations, md for short forms, lg for " +
          "multi-section work — anything bigger belongs in a Drawer.",
      },
    },
  },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
  },
};
export default meta;
type Story = StoryObj<DialogContentProps>;

/** sm — a confirmation. The verb is on the button. */
/** Drive the width from the controls panel. */
export const Playground: Story = {
  args: { size: "md" },
  render: (args) => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Open dialog</Button>
      </DialogTrigger>
      <DialogContent size={args.size}>
        <DialogHeader>
          <DialogTitle>Add endpoint</DialogTitle>
          <DialogDescription>
            It starts collecting as soon as it is saved.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <Field>
            <FieldLabel>Name</FieldLabel>
            <FieldControl>
              <Input placeholder="probe-07" />
            </FieldControl>
          </Field>
        </DialogBody>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">Cancel</Button>
          </DialogClose>
          <Button>Add endpoint</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const Confirmation: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Delete endpoint</Button>
      </DialogTrigger>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>Delete probe-04?</DialogTitle>
          <DialogDescription>
            It stops collecting immediately. Existing data is kept for 30 days.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">Keep it</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button variant="destructive">Delete endpoint</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

/** md — a short form. */
export const ShortForm: Story = {
  name: "Short form",
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Add endpoint</Button>
      </DialogTrigger>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle>Add an endpoint</DialogTitle>
          <DialogDescription>
            It starts collecting as soon as it is reachable.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <Field>
            <FieldLabel>Name</FieldLabel>
            <FieldControl>
              <Input placeholder="probe-05" />
            </FieldControl>
          </Field>
          <Field>
            <FieldLabel>Host</FieldLabel>
            <FieldControl>
              <Input placeholder="probe-05.ir.com" />
            </FieldControl>
          </Field>
        </DialogBody>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">Cancel</Button>
          </DialogClose>
          <Button>Add endpoint</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

/** No close, for the rare dialog that must be answered. */
export const MustAnswer: Story = {
  name: "Must be answered",
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Accept terms</Button>
      </DialogTrigger>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle close={false}>Accept the new terms</DialogTitle>
          <DialogDescription>
            You will need to accept these before continuing.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">Sign out</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button>Accept</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

const pair = pairOf(guidance);

export const DoAndDont: Story = {
  name: "Do and Don't",
  parameters: { controls: { disable: true } },
  render: () => (
    <GuidanceStory>
      <Guidance
        pair={pair("name-the-action")}
        width="wide"
        dont={
          <div className="w-full rounded-md border border-line-neutral-muted">
            <DialogFooter>
              <Button variant="secondary">Cancel</Button>
              <Button>OK</Button>
            </DialogFooter>
          </div>
        }
        do={
          <div className="w-full rounded-md border border-line-neutral-muted">
            <DialogFooter>
              <Button variant="secondary">Keep endpoint</Button>
              <Button>Delete endpoint</Button>
            </DialogFooter>
          </div>
        }
      />

      <Guidance
        pair={pair("primary-on-the-right")}
        width="wide"
        dont={
          <div className="w-full rounded-md border border-line-neutral-muted">
            <DialogFooter>
              <Button>Save changes</Button>
              <Button variant="ghost">Cancel</Button>
            </DialogFooter>
          </div>
        }
        do={
          <div className="w-full rounded-md border border-line-neutral-muted">
            <DialogFooter>
              <Button variant="secondary">Cancel</Button>
              <Button>Save changes</Button>
            </DialogFooter>
          </div>
        }
      />
    </GuidanceStory>
  ),
};
