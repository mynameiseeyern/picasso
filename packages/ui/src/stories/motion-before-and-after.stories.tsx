import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { Button } from "../components/button/button";
import { FieldOption } from "../components/field/field";
import { Switch } from "../components/switch/switch";
import { cn } from "@/lib/utils";

import { Guidance, GuidanceStory, type GuidancePair } from "./guidance";
import doc from "./motion-before-and-after.json";

/**
 * Foundations / Motion before and after — each motion rule as a pair you can
 * play: what not to do on the left, what Picasso does on the right.
 *
 * The page these are embedded in, with the reasoning in full, is
 * docs/foundations/motion-before-and-after.md. One story per pair, and each
 * story's export name is its pair's id, so the docs page can embed them one
 * at a time.
 *
 * ⭐ The right-hand side is never written here. It is the real named
 * animation from @ir/tokens/theme.css, on the same `data-state` Radix sets,
 * so it cannot drift from what ships.
 *
 * ⚠️ The left-hand side cannot be written here either — and that is the
 * linter working. An ease-in, a 500ms duration and an animated width are all
 * refused in a class. They live in .storybook/motion-specimens.css as
 * `data-specimen` attribute rules, where no component can reach for them.
 *
 * The surfaces are drawings, not the real Dialog and Drawer: two real
 * dialogs cannot be open side by side, and a portal would leave the figure.
 * What is real is the animation on them.
 */
const meta: Meta = {
  title: "Foundations/Motion before and after",
  parameters: { layout: "fullscreen", controls: { disable: true } },
};
export default meta;
type Story = StoryObj;

interface MotionPair extends GuidancePair {
  dontValue: string;
  doValue: string;
}

/** Loud on a missing id, like `pairOf` — a renamed pair breaks the story. */
function pair(id: string): MotionPair {
  const found = (doc.pairs as MotionPair[]).find((p) => p.id === id);
  if (!found) {
    throw new Error(
      `motion-before-and-after.json has no pair "${id}". ` +
        `It has: ${doc.pairs.map((p) => p.id).join(", ")}`,
    );
  }
  return found;
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = React.useState(false);
  React.useEffect(() => {
    // jsdom has no matchMedia; a test is not a reader with a preference.
    if (typeof window.matchMedia !== "function") return;
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);
  return reduced;
}

/**
 * Something that opens and closes, the way Radix does it: `data-state` goes
 * to "closed", and the node is removed when the animation that state started
 * has ended — or at once, if it started none.
 */
function Surface({
  open,
  specimen,
  className,
  children,
}: {
  open: boolean;
  /** A rule from motion-specimens.css. Absent on the "now" side. */
  specimen?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = React.useState(open);
  if (open && !mounted) setMounted(true);

  React.useLayoutEffect(() => {
    if (open || !mounted) return;
    const node = ref.current;
    const running =
      node && typeof node.getAnimations === "function"
        ? node.getAnimations().length
        : 0;
    if (running === 0) setMounted(false);
  }, [open, mounted]);

  if (!mounted) return null;
  return (
    <div
      ref={ref}
      data-specimen={specimen}
      data-state={open ? "open" : "closed"}
      onAnimationEnd={(event) => {
        if (!open && event.target === event.currentTarget) setMounted(false);
      }}
      className={className}
    >
      {children}
    </div>
  );
}

/** The box an example plays in, and the value underneath that says what. */
function Stage({
  value,
  children,
}: {
  value: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex w-full min-w-0 flex-col gap-2">
      <div className="relative h-48 w-full overflow-hidden rounded-md border border-line-neutral-muted bg-surface-app">
        {children}
      </div>
      <code className="text-code-xs text-content-neutral-muted">{value}</code>
    </div>
  );
}

interface Playing {
  /** Open or closed, for a pair that toggles. */
  open: boolean;
  /** Counts replays, for a pair that plays once per press. */
  run: number;
  slow: boolean;
  reduced: boolean;
}

/**
 * One pair: the control that plays both sides at once, the slow-motion
 * switch, and the Do-and-Don't figure every other guidance story uses.
 */
function Pair({
  id,
  control,
  hint,
  children,
}: {
  id: string;
  /** What the button does. `none` for a pair the reader plays by hand. */
  control:
    | { kind: "toggle"; open: string; close: string }
    | { kind: "replay"; label: string }
    | { kind: "none" };
  hint?: string;
  children: (playing: Playing) => {
    dont: React.ReactNode;
    do: React.ReactNode;
  };
}) {
  const p = pair(id);
  const [open, setOpen] = React.useState(false);
  const [run, setRun] = React.useState(0);
  const [slow, setSlow] = React.useState(false);
  const reduced = usePrefersReducedMotion();
  const sides = children({ open, run, slow, reduced });

  return (
    <GuidanceStory>
      <div
        data-slot="motion-pair"
        data-pair={p.id}
        data-motion-speed={slow ? "slow" : undefined}
        className="space-y-4"
      >
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          {control.kind === "toggle" ? (
            <Button
              variant="outline"
              size="sm"
              aria-pressed={open}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? control.close : control.open}
            </Button>
          ) : null}
          {control.kind === "replay" ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRun((n) => n + 1)}
            >
              {control.label}
            </Button>
          ) : null}
          <FieldOption
            control={<Switch checked={slow} onCheckedChange={setSlow} />}
          >
            Slow motion, 5×
          </FieldOption>
          {hint ? (
            <p className="text-body-sm text-content-neutral-muted">{hint}</p>
          ) : null}
        </div>
        {reduced ? (
          <p className="text-body-sm text-content-neutral-muted">
            Your system asks for reduced motion, so the left-hand examples stay
            still and the right-hand ones fade.
          </p>
        ) : null}
        <Guidance
          pair={p}
          dont={<Stage value={p.dontValue}>{sides.dont}</Stage>}
          do={<Stage value={p.doValue}>{sides.do}</Stage>}
        />
      </div>
    </GuidanceStory>
  );
}

/* ── The drawings ─────────────────────────────────────────────────────── */

const line = "h-2 rounded-full bg-surface-layer-muted";

/** A page behind whatever opens: a few rows, enough to read as content. */
function Backdrop() {
  return (
    <div aria-hidden className="flex h-full flex-col gap-3 p-4">
      <div className={cn(line, "w-24")} />
      <div className={cn(line, "w-full")} />
      <div className={cn(line, "w-5/6")} />
      <div className={cn(line, "w-full")} />
      <div className={cn(line, "w-2/3")} />
    </div>
  );
}

function DialogDrawing() {
  return (
    <>
      <p className="text-heading-xs text-content-neutral-emphasis">
        Delete endpoint
      </p>
      <p className="mt-1 text-body-sm text-content-neutral-muted">
        SBC-SYD-07 stops reporting at once.
      </p>
    </>
  );
}

const dialogBox =
  "w-60 rounded-xl border border-line-neutral-muted bg-surface-card p-4";

function MenuDrawing() {
  return (
    <ul className="text-body-md text-content-neutral-emphasis">
      {["Rename", "Duplicate", "Move to", "Delete"].map((item) => (
        <li key={item} className="flex h-7 items-center rounded-md px-2">
          {item}
        </li>
      ))}
    </ul>
  );
}

const menuBox =
  "absolute start-4 top-14 w-44 rounded-lg border border-line-neutral-muted bg-surface-card p-1 shadow-md";

/** Where the menu hangs from. A drawing of a trigger, not a control. */
function TriggerDrawing() {
  return (
    <div
      aria-hidden
      className="absolute start-4 top-4 flex h-8 items-center rounded-md border border-line-neutral-muted bg-surface-card px-3 text-label-sm text-content-neutral-emphasis"
    >
      Actions
    </div>
  );
}

function DrawerDrawing() {
  return (
    <>
      <p className="text-heading-xs text-content-neutral-emphasis">
        SBC-SYD-07
      </p>
      <div aria-hidden className="mt-3 flex flex-col gap-3">
        <div className={cn(line, "w-full")} />
        <div className={cn(line, "w-3/4")} />
        <div className={cn(line, "w-full")} />
        <div className={cn(line, "w-1/2")} />
      </div>
    </>
  );
}

const drawerBox =
  "absolute inset-y-0 end-0 w-44 border-s border-line-neutral-muted bg-surface-card p-4 shadow-lg";

/* ── Should it move at all? ───────────────────────────────────────────── */

const TRUNKS = 1284;
const BARS = ["h-6", "h-9", "h-7", "h-12", "h-10", "h-14", "h-11", "h-16"];

/** Counts from zero to `target` — the thing the rule says not to do. */
function useCountUp(target: number, run: number, ms: number, still: boolean) {
  const [value, setValue] = React.useState(target);
  React.useEffect(() => {
    if (still || run === 0) {
      setValue(target);
      return;
    }
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / ms);
      // The same shape as motion/easing/out, near enough for a specimen.
      setValue(Math.round(target * (1 - Math.pow(1 - t, 4))));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, run, ms, still]);
  return value;
}

function Tile({ value, bars }: { value: number; bars: React.ReactNode }) {
  return (
    <div className="flex h-full flex-col justify-between p-4">
      <div>
        <p className="text-label-sm text-content-neutral-muted">
          Trunks reporting
        </p>
        <p className="ltr-island text-metric-xl text-content-neutral-emphasis">
          {new Intl.NumberFormat("en").format(value)}
        </p>
      </div>
      {bars}
    </div>
  );
}

function Bars({ specimen }: { specimen?: string }) {
  return (
    <div
      aria-hidden
      data-specimen={specimen}
      className="flex h-16 items-end gap-1.5"
    >
      {BARS.map((height, i) => (
        <div key={i} className={cn("w-full rounded-xs bg-chart-1", height)} />
      ))}
    </div>
  );
}

function CountingTile({ run, slow, reduced }: Playing) {
  const value = useCountUp(TRUNKS, run, slow ? 6000 : 1200, reduced);
  return (
    <Tile
      value={value}
      // Remounted on every replay, so the bars grow again.
      bars={<Bars key={run} specimen={run > 0 ? "bars-grow" : undefined} />}
    />
  );
}

export const DataDoesNotMove: Story = {
  render: () => (
    <Pair
      id="data-does-not-move"
      control={{ kind: "replay", label: "Load the tile" }}
    >
      {(playing) => ({
        dont: <CountingTile {...playing} />,
        do: <Tile value={TRUNKS} bars={<Bars />} />,
      })}
    </Pair>
  ),
};

/* ── Curves, starts and origins ───────────────────────────────────────── */

export const NothingStartsSlowly: Story = {
  render: () => (
    <Pair
      id="nothing-starts-slowly"
      control={{ kind: "toggle", open: "Open both", close: "Close both" }}
      hint="Watch the first moment after Close."
    >
      {({ open }) => ({
        dont: (
          <div className="flex h-full items-center justify-center">
            <Surface open={open} specimen="ease-in-close" className={dialogBox}>
              <DialogDrawing />
            </Surface>
          </div>
        ),
        do: (
          <div className="flex h-full items-center justify-center">
            <Surface
              open={open}
              className={cn(
                dialogBox,
                "data-[state=open]:animate-dialog-in data-[state=closed]:animate-dialog-out",
              )}
            >
              <DialogDrawing />
            </Surface>
          </div>
        ),
      })}
    </Pair>
  ),
};

export const NothingFromNothing: Story = {
  render: () => (
    <Pair
      id="nothing-from-nothing"
      control={{ kind: "toggle", open: "Open both", close: "Close both" }}
    >
      {({ open }) => ({
        dont: (
          <>
            <TriggerDrawing />
            <Surface
              open={open}
              specimen="from-zero"
              className={cn(menuBox, "origin-top-left rtl:origin-top-right")}
            >
              <MenuDrawing />
            </Surface>
          </>
        ),
        do: (
          <>
            <TriggerDrawing />
            <Surface
              open={open}
              className={cn(
                menuBox,
                "origin-top-left rtl:origin-top-right",
                "data-[state=open]:animate-popover-in data-[state=closed]:animate-popover-out",
              )}
            >
              <MenuDrawing />
            </Surface>
          </>
        ),
      })}
    </Pair>
  ),
};

export const GrowsFromItsTrigger: Story = {
  render: () => (
    <Pair
      id="grows-from-its-trigger"
      control={{ kind: "toggle", open: "Open both", close: "Close both" }}
      hint="It is a small difference. Slow motion shows it."
    >
      {({ open }) => ({
        dont: (
          <>
            <TriggerDrawing />
            <Surface
              open={open}
              specimen="centre-origin"
              className={cn(
                menuBox,
                "data-[state=open]:animate-popover-in data-[state=closed]:animate-popover-out",
              )}
            >
              <MenuDrawing />
            </Surface>
          </>
        ),
        do: (
          <>
            <TriggerDrawing />
            <Surface
              open={open}
              className={cn(
                menuBox,
                // Radix publishes the origin for a real menu; this drawing
                // hangs from the top inline-start corner, so that is it.
                "origin-top-left rtl:origin-top-right",
                "data-[state=open]:animate-popover-in data-[state=closed]:animate-popover-out",
              )}
            >
              <MenuDrawing />
            </Surface>
          </>
        ),
      })}
    </Pair>
  ),
};

/* ── How long ─────────────────────────────────────────────────────────── */

export const ThreeHundredIsTheCeiling: Story = {
  render: () => (
    <Pair
      id="three-hundred-is-the-ceiling"
      control={{ kind: "toggle", open: "Open both", close: "Close both" }}
    >
      {({ open }) => ({
        dont: (
          <>
            <Backdrop />
            <Surface open={open} specimen="half-second" className={drawerBox}>
              <DrawerDrawing />
            </Surface>
          </>
        ),
        do: (
          <>
            <Backdrop />
            <Surface
              open={open}
              className={cn(
                drawerBox,
                "data-[state=open]:animate-drawer-in-end data-[state=closed]:animate-drawer-out-end",
              )}
            >
              <DrawerDrawing />
            </Surface>
          </>
        ),
      })}
    </Pair>
  ),
};

/* ── What is allowed to move ──────────────────────────────────────────── */

/**
 * A rail and the page beside it. The count is how many times the page
 * changed size since the rail was last toggled — once if the width simply
 * changes, once a frame if it is animated.
 */
function Shell({
  collapsed,
  specimen,
}: {
  collapsed: boolean;
  specimen?: string;
}) {
  const page = React.useRef<HTMLDivElement>(null);
  const [count, setCount] = React.useState(0);
  const counting = React.useRef(false);

  React.useEffect(() => {
    const node = page.current;
    if (!node || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => {
      if (counting.current) setCount((n) => n + 1);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // Start again on every toggle, and not on the first paint.
  const first = React.useRef(true);
  React.useLayoutEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    counting.current = true;
    setCount(0);
  }, [collapsed]);

  return (
    <div className="flex h-full">
      <div
        data-specimen={specimen}
        className={cn(
          "flex shrink-0 flex-col gap-3 border-e border-line-neutral-muted bg-surface-sidebar p-3",
          collapsed ? "w-10" : "w-32",
        )}
      >
        <div className={cn(line, "w-full")} />
        <div className={cn(line, "w-full")} />
        <div className={cn(line, "w-full")} />
      </div>
      <div ref={page} className="grid min-w-0 flex-1 grid-cols-2 gap-2 p-3">
        {BARS.slice(0, 4).map((_, i) => (
          <div
            key={i}
            className="rounded-md border border-line-neutral-muted bg-surface-card"
          />
        ))}
      </div>
      <p
        data-slot="layout-count"
        className="absolute end-2 bottom-2 rounded-sm bg-surface-neutral-emphasis px-2 py-0.5 text-label-sm text-content-on-neutral-emphasis"
      >
        {count === 0
          ? "Toggle the rail to count"
          : `Page resized ${count} ${count === 1 ? "time" : "times"}`}
      </p>
    </div>
  );
}

export const OnlyTransformAndOpacity: Story = {
  render: () => (
    <Pair
      id="only-transform-and-opacity"
      control={{ kind: "toggle", open: "Collapse both", close: "Expand both" }}
    >
      {({ open }) => ({
        // The rail starts expanded, so the button's "open" is collapsed.
        dont: <Shell collapsed={open} specimen="width-transition" />,
        do: <Shell collapsed={open} />,
      })}
    </Pair>
  ),
};

/* ── Feedback ─────────────────────────────────────────────────────────── */

export const APressNotAHover: Story = {
  render: () => (
    <Pair
      id="a-press-not-a-hover"
      control={{ kind: "none" }}
      hint="Move across each button, then press and hold it."
    >
      {() => ({
        dont: (
          <div className="flex h-full items-center justify-center">
            <Button data-specimen="hover-grow">Save changes</Button>
          </div>
        ),
        do: (
          <div className="flex h-full items-center justify-center">
            <Button>Save changes</Button>
          </div>
        ),
      })}
    </Pair>
  ),
};

/* ── Reduced motion ───────────────────────────────────────────────────── */

export const ReducedMotionIsAFade: Story = {
  render: () => (
    <Pair
      id="reduced-motion-is-a-fade"
      control={{ kind: "toggle", open: "Open both", close: "Close both" }}
      hint="Both sides show what someone with reduced motion sees."
    >
      {({ open }) => ({
        dont: (
          <>
            <Backdrop />
            <Surface open={open} specimen="reduced-none" className={drawerBox}>
              <DrawerDrawing />
            </Surface>
          </>
        ),
        do: (
          <>
            <Backdrop />
            <Surface open={open} specimen="reduced-fade" className={drawerBox}>
              <DrawerDrawing />
            </Surface>
          </>
        ),
      })}
    </Pair>
  ),
};
