import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { ArrowDown, ArrowUp, Search, X } from "lucide-react";
import {
  BottomSheet,
  BottomSheetBody,
  BottomSheetClose,
  BottomSheetCloseButton,
  BottomSheetContent,
  BottomSheetFooter,
  BottomSheetHeader,
  BottomSheetItem,
  BottomSheetTitle,
  BottomSheetTrigger,
} from "./bottom-sheet";
import { Button } from "../button/button";
import { Checkbox } from "../checkbox/checkbox";
import { Radio, RadioGroup } from "../radio-group/radio-group";
import {
  SegmentedControl,
  SegmentedControlItem,
} from "../segmented-control/segmented-control";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "../input-group/input-group";
import guidance from "./guidance.json";
import { Guidance, GuidanceStory, pairOf } from "@/stories/guidance";

const pair = pairOf(guidance);

const meta: Meta<typeof BottomSheetContent> = {
  title: "Components/Bottom sheet",
  component: BottomSheetContent,
  parameters: {
    viewport: { defaultViewport: "mobile1" },
    docs: {
      description: {
        component:
          "A panel that rises from the bottom edge over a scrim — for one " +
          "decision about the page beneath it on a phone: a filter, a sort, a " +
          "select. Handle, title + close, a scrolling body of 48-tall rows, and " +
          "a footer whose buttons share the width. Below md only; keep the " +
          "Popover from md up.",
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof BottomSheetContent>;

const STATUSES = ["Critical", "Warning", "Healthy", "Offline"] as const;

/** Status filter: a draft of ticks, committed on Apply with the count. */
export const Filter: Story = {
  render: () => {
    const [applied, setApplied] = React.useState<string[]>([
      "Critical",
      "Warning",
    ]);
    const [draft, setDraft] = React.useState<string[]>(applied);
    const [open, setOpen] = React.useState(false);
    const toggle = (s: string) =>
      setDraft((d) => (d.includes(s) ? d.filter((x) => x !== s) : [...d, s]));
    return (
      <BottomSheet
        open={open}
        onOpenChange={(o) => {
          setOpen(o);
          if (o) setDraft(applied);
        }}
      >
        <BottomSheetTrigger asChild>
          <Button variant="outline" size="sm">
            Status · {applied.length}
          </Button>
        </BottomSheetTrigger>
        <BottomSheetContent>
          <BottomSheetHeader>
            <BottomSheetTitle>Status</BottomSheetTitle>
            <BottomSheetCloseButton />
          </BottomSheetHeader>
          <BottomSheetBody>
            <div>
              {STATUSES.map((s) => (
                <BottomSheetItem key={s}>
                  <Checkbox
                    checked={draft.includes(s)}
                    onCheckedChange={() => toggle(s)}
                  />
                  {s}
                </BottomSheetItem>
              ))}
            </div>
          </BottomSheetBody>
          <BottomSheetFooter>
            <Button variant="outline" size="lg" onClick={() => setDraft([])}>
              Clear
            </Button>
            <Button
              size="lg"
              onClick={() => {
                setApplied(draft);
                setOpen(false);
              }}
            >
              Apply{draft.length ? ` · ${draft.length}` : ""}
            </Button>
          </BottomSheetFooter>
        </BottomSheetContent>
      </BottomSheet>
    );
  },
};

/** A long list: search at the top, the body scrolls, the footer stays put. */
export const WithSearch: Story = {
  render: () => (
    <BottomSheet>
      <BottomSheetTrigger asChild>
        <Button variant="outline" size="sm">
          Location
        </Button>
      </BottomSheetTrigger>
      <BottomSheetContent>
        <BottomSheetHeader>
          <BottomSheetTitle>Location</BottomSheetTitle>
          <BottomSheetCloseButton />
        </BottomSheetHeader>
        <BottomSheetBody>
          <InputGroup>
            <InputGroupAddon>
              <Search aria-hidden />
            </InputGroupAddon>
            <InputGroupInput
              placeholder="Search locations"
              aria-label="Search locations"
            />
          </InputGroup>
          <div>
            {[
              "Sydney",
              "Bangalore",
              "Hyderabad",
              "Cebu",
              "Manila CC",
              "London HQ",
              "Austin",
              "Denver",
              "New York",
            ].map((c) => (
              <BottomSheetItem key={c}>
                <Checkbox />
                {c}
              </BottomSheetItem>
            ))}
          </div>
        </BottomSheetBody>
        <BottomSheetFooter>
          <Button variant="outline" size="lg">
            Clear
          </Button>
          <Button size="lg">Apply</Button>
        </BottomSheetFooter>
      </BottomSheetContent>
    </BottomSheet>
  ),
};

/** Sort: one of a few, so a RadioGroup — and the order, which also stays
 * selected, is a SegmentedControl rather than a ButtonGroup. */
export const Sort: Story = {
  render: () => (
    <BottomSheet>
      <BottomSheetTrigger asChild>
        <Button variant="outline" size="sm">
          Sort
        </Button>
      </BottomSheetTrigger>
      <BottomSheetContent>
        <BottomSheetHeader>
          <BottomSheetTitle>Sort</BottomSheetTitle>
          <BottomSheetCloseButton />
        </BottomSheetHeader>
        <BottomSheetBody>
          <RadioGroup defaultValue="status">
            {[
              ["status", "Status"],
              ["alert", "Alert"],
              ["user", "User / Machine"],
              ["score", "Network score"],
            ].map(([v, l]) => (
              <BottomSheetItem key={v}>
                <Radio value={v} />
                {l}
              </BottomSheetItem>
            ))}
          </RadioGroup>
          <SegmentedControl fullWidth aria-label="Order" defaultValue="asc">
            <SegmentedControlItem value="asc">
              <ArrowUp aria-hidden /> Ascending
            </SegmentedControlItem>
            <SegmentedControlItem value="desc">
              <ArrowDown aria-hidden /> Descending
            </SegmentedControlItem>
          </SegmentedControl>
        </BottomSheetBody>
        <BottomSheetFooter>
          <BottomSheetClose asChild>
            <Button size="lg">Done</Button>
          </BottomSheetClose>
        </BottomSheetFooter>
      </BottomSheetContent>
    </BottomSheet>
  ),
};

/* Static stand-ins for the open panel, so the pairs render inline. */
function Panel({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-80 rounded-t-2xl border-t border-line-neutral-muted bg-surface-overlay shadow-lg">
      <div
        aria-hidden
        className="mx-auto mt-2 h-1 w-9 rounded-full bg-surface-layer-emphasis"
      />
      {children}
    </div>
  );
}
const rows = ["Critical", "Warning", "Healthy"];

export const DoAndDont: Story = {
  render: () => (
    <GuidanceStory>
      <Guidance
        pair={pair("rows-are-48")}
        dont={
          <Panel>
            <div className="p-4">
              {rows.map((r) => (
                <div
                  key={r}
                  className="flex h-7 items-center gap-2 text-body-md"
                >
                  <Checkbox />
                  {r}
                </div>
              ))}
            </div>
          </Panel>
        }
        do={
          <Panel>
            <div className="px-4 py-2">
              {rows.map((r) => (
                <BottomSheetItem key={r}>
                  <Checkbox />
                  {r}
                </BottomSheetItem>
              ))}
            </div>
          </Panel>
        }
      />
      <Guidance
        pair={pair("handle-is-decoration")}
        dont={
          <Panel>
            <div className="px-4 pt-2 pb-4 text-heading-md text-content-neutral-emphasis">
              Status
            </div>
          </Panel>
        }
        do={
          <Panel>
            <div className="flex items-center ps-4 pe-2 pt-2 pb-4">
              <span className="flex-1 text-heading-md text-content-neutral-emphasis">
                Status
              </span>
              <Button variant="ghost" size="icon-md" aria-label="Close">
                <XIcon />
              </Button>
            </div>
          </Panel>
        }
      />
    </GuidanceStory>
  ),
};

function XIcon() {
  return <X aria-hidden />;
}
