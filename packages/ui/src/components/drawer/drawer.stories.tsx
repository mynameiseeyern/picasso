import type { Meta, StoryObj } from "@storybook/react";
import { Filter, SlidersHorizontal } from "lucide-react";
import {
  Drawer,
  DrawerActions,
  DrawerBack,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerCounter,
  DrawerDescription,
  DrawerExpand,
  DrawerFooter,
  DrawerHeader,
  DrawerHeading,
  DrawerIcon,
  DrawerNav,
  DrawerNext,
  DrawerPrevious,
  DrawerTitle,
  DrawerTitleGroup,
  DrawerTrigger,
} from "./drawer";
import { Button } from "../button/button";
import { Field, FieldControl, FieldLabel } from "../field/field";
import { Input } from "../input/input";

const meta: Meta<typeof Drawer> = {
  title: "Components/Drawer",
  component: Drawer,
  parameters: {
    docs: {
      description: {
        component:
          "A side panel over a scrim, for secondary tasks, filters and " +
          "drilldowns — work the page behind still matters to. Right or " +
          "Left at 480 (Default) or 640 (Wide); Expanded is a centred panel " +
          "inset 80 by 40, and has no Wide of its own.",
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof Drawer>;

/** A title header — the everyday drawer. Filters, settings, a create flow. */
export const Filters: Story = {
  render: () => (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline">
          <Filter aria-hidden />
          Filters
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader type="title">
          <DrawerHeading>
            <DrawerIcon>
              <SlidersHorizontal aria-hidden />
            </DrawerIcon>
            <DrawerTitleGroup>
              <DrawerTitle>Filter endpoints</DrawerTitle>
              <DrawerDescription>
                Applies to the current view only.
              </DrawerDescription>
            </DrawerTitleGroup>
            <DrawerActions>
              <DrawerCloseButton />
            </DrawerActions>
          </DrawerHeading>
        </DrawerHeader>
        <DrawerBody>
          <Field>
            <FieldLabel>Name contains</FieldLabel>
            <FieldControl>
              <Input placeholder="probe-" />
            </FieldControl>
          </Field>
          <Field>
            <FieldLabel>Location</FieldLabel>
            <FieldControl>
              <Input placeholder="Sydney" />
            </FieldControl>
          </Field>
        </DrawerBody>
        <DrawerFooter>
          <Button variant="secondary">Reset</Button>
          <Button>Apply</Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
};

/**
 * A record header — for stepping through a list without leaving it. The
 * chevrons point up and down because that is the direction the list runs.
 * `label` gives the drawer a name, since a counter is not one.
 */
export const Record: Story = {
  render: () => (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline">Open record</Button>
      </DrawerTrigger>
      <DrawerContent size="wide" label="Endpoint 3 of 227: probe-04">
        <DrawerHeader>
          <DrawerNav>
            <DrawerBack>All endpoints</DrawerBack>
            <DrawerPrevious />
            <DrawerNext />
            <DrawerCounter>3 of 227</DrawerCounter>
          </DrawerNav>
          <DrawerActions>
            <DrawerExpand />
            <DrawerCloseButton />
          </DrawerActions>
        </DrawerHeader>
        <DrawerBody>
          <p className="text-body-md text-content-neutral-emphasis">
            probe-04 · Sydney
          </p>
          <p className="text-body-sm text-content-neutral-muted">
            Wide suits a drilldown that carries tiles or a table. Default is
            enough for a form.
          </p>
        </DrawerBody>
        <DrawerFooter>
          <Button variant="secondary">Export</Button>
          <Button>Edit endpoint</Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
};

/** Left, for navigation and context that belongs on the side it came from. */
export const Left: Story = {
  render: () => (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline">Open from the left</Button>
      </DrawerTrigger>
      <DrawerContent side="left">
        <DrawerHeader type="title">
          <DrawerHeading>
            <DrawerTitleGroup>
              <DrawerTitle>Saved views</DrawerTitle>
            </DrawerTitleGroup>
            <DrawerActions>
              <DrawerCloseButton />
            </DrawerActions>
          </DrawerHeading>
        </DrawerHeader>
        <DrawerBody>
          <p className="text-body-sm text-content-neutral-muted">
            The border sits on the inner edge — right here, left on a right
            drawer.
          </p>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  ),
};

/**
 * Expanded — a centred panel inset 80 by 40, with a border on all four sides
 * and radius/2xl. `size` does not apply: this is already the wide one.
 */
export const Expanded: Story = {
  render: () => (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline">Open expanded</Button>
      </DrawerTrigger>
      <DrawerContent side="expanded" label="Endpoint 3 of 227: probe-04">
        <DrawerHeader>
          <DrawerNav>
            <DrawerPrevious />
            <DrawerNext />
            <DrawerCounter>3 of 227</DrawerCounter>
          </DrawerNav>
          <DrawerActions>
            <DrawerExpand label="Restore" />
            <DrawerCloseButton />
          </DrawerActions>
        </DrawerHeader>
        <DrawerBody>
          <p className="text-body-sm text-content-neutral-muted">
            Where a drilldown needs the room a side panel cannot give it.
          </p>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  ),
};
