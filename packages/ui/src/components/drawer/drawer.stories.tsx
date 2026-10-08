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
  type DrawerContentProps,
} from "./drawer";
import { Button } from "../button/button";
import { Field, FieldControl, FieldLabel } from "../field/field";
import { Input } from "../input/input";
import guidance from "./guidance.json";
import { Guidance, GuidanceStory, pairOf } from "@/stories/guidance";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
} from "lucide-react";

// The variants live on DrawerContent, not on the Root, so the meta types
// against its props — otherwise `side` and `size` are not known args.
const meta: Meta<DrawerContentProps> = {
  title: "Components/Drawer",
  component: DrawerContent,
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
  argTypes: {
    side: { control: "inline-radio", options: ["end", "start", "expanded"] },
    size: { control: "inline-radio", options: ["default", "wide"] },
  },
};
export default meta;
type Story = StoryObj<DrawerContentProps>;

/** A title header — the everyday drawer. Filters, settings, a create flow. */
/** Drive the side and the width from the controls panel. */
export const Playground: Story = {
  args: { side: "end", size: "default" },
  render: (args) => (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline">Open drawer</Button>
      </DrawerTrigger>
      <DrawerContent side={args.side} size={args.size}>
        <DrawerHeader type="title">
          <DrawerHeading>
            <DrawerTitleGroup>
              <DrawerTitle>Endpoint detail</DrawerTitle>
              <DrawerDescription>
                Expanded ignores size — it is already the wide one.
              </DrawerDescription>
            </DrawerTitleGroup>
            <DrawerActions>
              <DrawerCloseButton />
            </DrawerActions>
          </DrawerHeading>
        </DrawerHeader>
        <DrawerBody>
          <p className="text-body-sm text-content-neutral-muted">
            Default is 480, Wide is 640, and Expanded insets 80 by 40.
          </p>
        </DrawerBody>
        <DrawerFooter>
          <Button variant="secondary">Cancel</Button>
          <Button>Save</Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
};

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

/** Start — the left in English, the right in Arabic — for navigation and context that belongs on the side it came from. */
export const Start: Story = {
  render: () => (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline">Open from the start</Button>
      </DrawerTrigger>
      <DrawerContent side="start">
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
            The border sits on the inner edge: the inline end here, the inline
            start on an end drawer.
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

const pair = pairOf(guidance);

/**
 * Narrow — 328, a 360 phone minus its gutters. A side drawer sized 480 is
 * wider than the phone it opens on, so it takes the viewport instead and the
 * footer buttons stack. The sidebar's own phone nav is a drawer for this
 * reason; a filter panel on a phone is usually better as a `BottomSheet`.
 */
export const Narrow: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Drawer defaultOpen>
      <DrawerContent side="end">
        <DrawerHeader type="title">
          <DrawerHeading>
            <DrawerTitleGroup>
              <DrawerTitle>Endpoint detail</DrawerTitle>
              <DrawerDescription>syd-edge-gateway-01</DrawerDescription>
            </DrawerTitleGroup>
            <DrawerActions>
              <DrawerCloseButton />
            </DrawerActions>
          </DrawerHeading>
        </DrawerHeader>
        <DrawerBody>
          <p className="text-body-sm text-content-neutral-muted">
            480 does not fit a 360 phone, so the panel takes the viewport.
          </p>
        </DrawerBody>
        <DrawerFooter>
          <Button variant="secondary">Cancel</Button>
          <Button>Save</Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
};

export const DoAndDont: Story = {
  name: "Do and Don't",
  parameters: { controls: { disable: true } },
  render: () => (
    <GuidanceStory>
      <Guidance
        pair={pair("stepper-follows-the-list")}
        dont={
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon-sm" aria-label="Previous">
              <ChevronLeft aria-hidden />
            </Button>
            <span className="text-body-sm text-content-neutral-muted">
              3 of 227
            </span>
            <Button variant="ghost" size="icon-sm" aria-label="Next">
              <ChevronRight aria-hidden />
            </Button>
          </div>
        }
        do={
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon-sm" aria-label="Previous">
              <ChevronUp aria-hidden />
            </Button>
            <span className="text-body-sm text-content-neutral-muted">
              3 of 227
            </span>
            <Button variant="ghost" size="icon-sm" aria-label="Next">
              <ChevronDown aria-hidden />
            </Button>
          </div>
        }
      />

      <Guidance
        pair={pair("footer-holds-the-commitment")}
        width="wide"
        stage="tall"
        dont={
          <div className="w-full space-y-2 rounded-md border border-line-neutral-muted p-3">
            <p className="text-body-sm text-content-neutral-muted">Severity</p>
            <Button size="sm">Apply</Button>
            <p className="text-body-sm text-content-neutral-muted">Site</p>
            <Button size="sm">Apply</Button>
          </div>
        }
        do={
          <div className="w-full overflow-hidden rounded-md border border-line-neutral-muted">
            <div className="space-y-2 p-3">
              <p className="text-body-sm text-content-neutral-muted">
                Severity
              </p>
              <p className="text-body-sm text-content-neutral-muted">Site</p>
            </div>
            <DrawerFooter>
              <Button variant="secondary" size="sm">
                Reset
              </Button>
              <Button size="sm">Apply</Button>
            </DrawerFooter>
          </div>
        }
      />

      <Guidance
        pair={pair("primary-on-the-right")}
        width="wide"
        dont={
          <div className="w-full rounded-md border border-line-neutral-muted">
            <DrawerFooter>
              <Button>Apply</Button>
              <Button variant="ghost">Reset</Button>
            </DrawerFooter>
          </div>
        }
        do={
          <div className="w-full rounded-md border border-line-neutral-muted">
            <DrawerFooter>
              <Button variant="secondary">Reset</Button>
              <Button>Apply</Button>
            </DrawerFooter>
          </div>
        }
      />
    </GuidanceStory>
  ),
};
