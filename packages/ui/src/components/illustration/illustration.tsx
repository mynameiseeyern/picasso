import * as React from "react";
import {
  Check,
  Cloud,
  Headset,
  Monitor,
  ShieldCheck,
  TriangleAlert,
  Wifi,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Illustration — product spot illustrations that answer the pointer.
 *
 * Figma: none yet. This is code first, and the three drawings follow the
 * Spotkit spots in `IR Brand/illustrations/product-illustrations` (Issue
 * alerts, Fleet health, Call readiness): a 160 × 160 box, one 0.5 stroke, a
 * panel with a ghost behind it, bars for text, one accent.
 *
 * ⚠️ Two deliberate differences from the Spotkit files. The colours are
 * Picasso semantics, not the `--il-*` preset, so the hairline is
 * `border/neutral/emphasis` and the bars are `bg/layer/emphasis` — one step
 * off the preset's in-between greys. And the glyphs are Lucide, not
 * Phosphor, because Lucide is the only icon library here.
 *
 * Each drawing carries one mechanic. Pick the drawing for what it shows, not
 * for how it moves:
 * - **issue-alerts — lift.** The gap follows the pointer: the alert under it
 *   opens, the ones below slide down 16 to make room, and what was beneath
 *   them is uncovered. Nothing is masked; the cards are opaque and the
 *   detail is simply drawn first.
 * - **fleet-health — magnify.** Each dot's radius is a function of its
 *   distance from the pointer, run through its own spring. The nearest dot
 *   takes the accent.
 * - **call-readiness — sequence.** While the pointer is over it, the four
 *   checks light one at a time in steps and the connectors run inward.
 *
 * Geometry is drawn in SVG attributes on purpose: a corner here is part of a
 * picture, not a control, so it does not follow `--radius`, and distances
 * are box units, not the spacing scale. Colour is always a utility.
 *
 * Motion lives in `@ir/tokens/theme.css` (`transition-illustration`,
 * `animate-illustration-*`, `illustration-float`). Under
 * `prefers-reduced-motion` nothing travels: lift changes state without the
 * slide, magnify moves the accent and leaves the radii alone, and sequence
 * does not run. The drawing still says what it means standing still.
 *
 * Accessibility: `role="img"` with a label naming the feature; `label={null}`
 * hides it when the heading beside it already says the same. The hover
 * response is decoration — nothing is focusable and nothing is said only by
 * it.
 */

export type IllustrationName =
  "issue-alerts" | "fleet-health" | "call-readiness";

export interface IllustrationProps extends Omit<
  React.ComponentProps<"svg">,
  "children" | "viewBox" | "name" | "style"
> {
  /** Which drawing. Each has one mechanic; see the component notes. */
  name: IllustrationName;
  /**
   * What the picture shows, read by screen readers. `null` hides it from
   * assistive tech — use it when a heading beside it says the same thing.
   */
  label?: string | null;
  /**
   * Answer the pointer. Turn off where the picture sits inside the product
   * (an empty state, a card) and should stay still.
   */
  interactive?: boolean;
}

type CSSVars = React.CSSProperties & Record<`--${string}`, string>;
type Point = { x: number; y: number };

const BOX = 160;
const HAIRLINE = 0.5;

const line = "stroke-line-neutral-emphasis";
const bar = "fill-surface-layer-emphasis";
const glyph = "text-content-neutral-subtle";
const accentGlyph = "text-content-primary-muted";
/** One curve for anything that slides or recolours with a lift. */
const move = "transition-illustration motion-reduce:transition-none";

const defaultLabels: Record<IllustrationName, string> = {
  "issue-alerts": "Issue alerts",
  "fleet-health": "Fleet health",
  "call-readiness": "Call readiness",
};

/** The pointer in box units, whatever size the picture is drawn at. */
function toBox(event: React.PointerEvent<SVGElement>): Point | null {
  const svg = event.currentTarget.ownerSVGElement;
  const rect = svg?.getBoundingClientRect();
  if (!rect || !rect.width || !rect.height) return null;
  return {
    x: ((event.clientX - rect.left) / rect.width) * BOX,
    y: ((event.clientY - rect.top) / rect.height) * BOX,
  };
}

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/** The panel every spot sits on, and its ghost one step behind. */
function Backdrop() {
  return (
    <>
      <rect
        x={30}
        y={30}
        width={116}
        height={118}
        rx={10}
        strokeWidth={HAIRLINE}
        className={cn("fill-surface-canvas", line)}
      />
      <rect
        x={22}
        y={22}
        width={116}
        height={118}
        rx={10}
        strokeWidth={HAIRLINE}
        className={cn("fill-surface-app", line)}
      />
    </>
  );
}

/**
 * The layer that listens. It never moves, so a shape sliding out from under
 * the pointer cannot end the hover that moved it.
 */
function HitArea(
  props: Pick<React.ComponentProps<"rect">, "onPointerMove" | "onPointerLeave">,
) {
  return (
    <rect
      data-slot="illustration-hit"
      width={BOX}
      height={BOX}
      className="fill-transparent"
      {...props}
    />
  );
}

/* ── Lift · Issue alerts ─────────────────────────────────────────────────
 * Three alerts in a list. One is open: it floats, takes the accent, and the
 * alerts below it sit 16 lower, which uncovers its detail. Moving the
 * pointer to another alert moves the gap there.
 *
 * The detail for every alert is always drawn, underneath. A closed alert's
 * detail is hidden by a card: the next one if it is above the gap, its own
 * (pushed down over it) if it is below. That is why the gap (16) and the
 * detail's position are tied: change one and bars start showing through.   */
const ALERT = { x: 34, y: 34, width: 92, height: 22, step: 28, gap: 16 };
const ALERTS = [0, 1, 2] as const;
/** Milliseconds between one card starting to move and the next. */
const STAGGER = 50;

/**
 * Which alert the pointer is on, given which one is open. Each alert owns
 * its card and the space under it, so pointing at an alert and having it
 * open never changes the answer — no flicker at the edges.
 */
export function alertAt(y: number, open: number) {
  let hit = 0;
  for (const i of ALERTS) {
    const top = ALERT.y + i * ALERT.step + (i > open ? ALERT.gap : 0);
    if (y >= top) hit = i;
  }
  return hit;
}

function IssueAlerts({ interactive }: { interactive: boolean }) {
  const [open, setOpen] = React.useState(0);

  return (
    <>
      <Backdrop />
      {ALERTS.map((i) => {
        const y = ALERT.y + i * ALERT.step + ALERT.height;
        return (
          <g key={i} data-slot="illustration-detail">
            <circle cx={47} cy={y + 11.4} r={1.6} className={bar} />
            <rect
              x={60}
              y={y + 7}
              width={30}
              height={3.2}
              rx={1.6}
              className={bar}
            />
            <rect
              x={60}
              y={y + 12.6}
              width={46}
              height={3.2}
              rx={1.6}
              className="fill-surface-layer-muted"
            />
          </g>
        );
      })}
      {ALERTS.map((i) => {
        const isOpen = i === open;
        const pushed = i > open;
        const y = ALERT.y + i * ALERT.step;
        return (
          <g
            key={i}
            data-slot="illustration-card"
            data-open={isOpen ? "" : undefined}
            data-pushed={pushed ? "" : undefined}
            className={cn(move, pushed && "translate-y-(--illustration-gap)")}
            style={
              {
                // Cards making room start one after another, nearest the gap
                // first. Cards closing up go together.
                "--illustration-delay": `${pushed ? (i - open - 1) * STAGGER : 0}ms`,
              } as CSSVars
            }
          >
            <rect
              x={ALERT.x}
              y={y}
              width={ALERT.width}
              height={ALERT.height}
              rx={7}
              strokeWidth={HAIRLINE}
              className={cn(
                "fill-surface-card",
                line,
                move,
                isOpen && "illustration-float",
              )}
            />
            <circle
              cx={47}
              cy={y + 11}
              r={7}
              className={cn(
                move,
                isOpen
                  ? "fill-surface-primary-muted"
                  : "fill-surface-layer-muted",
              )}
            />
            <TriangleAlert
              aria-hidden
              x={42.5}
              y={y + 6.5}
              width={9}
              height={9}
              strokeWidth={1.5}
              className={cn(move, isOpen ? accentGlyph : glyph)}
            />
            <rect
              x={60}
              y={y + 6.4}
              width={28}
              height={3.4}
              rx={1.7}
              className={bar}
            />
            <rect
              x={60}
              y={y + 12.2}
              width={52}
              height={3.6}
              rx={1.8}
              className={bar}
            />
          </g>
        );
      })}
      {interactive && (
        <HitArea
          onPointerMove={(event) => {
            const point = toBox(event);
            if (point) setOpen((current) => alertAt(point.y, current));
          }}
          onPointerLeave={() => setOpen(0)}
        />
      )}
    </>
  );
}

/* ── Magnify · Fleet health ──────────────────────────────────────────────
 * A grid of endpoints. Each dot's radius falls off with its distance from
 * the pointer and is chased by its own spring, so the swell trails the
 * pointer slightly and settles without a bounce you would notice.
 *
 * The radius is written straight to the attribute each frame; React never
 * re-renders for it. Only the accent — which dot is nearest — is state.
 *
 * The falloff is capped so two neighbours can never touch: dots are 14
 * apart and the largest pair sums to under 10. The test holds it there.    */
const FLEET = { cols: 7, rows: 4, x: 38, y: 52, step: 14 };
const DOTS: Point[] = Array.from(
  { length: FLEET.cols * FLEET.rows },
  (_, i) => ({
    x: FLEET.x + (i % FLEET.cols) * FLEET.step,
    y: FLEET.y + Math.floor(i / FLEET.cols) * FLEET.step,
  }),
);
/** The endpoint that carries the accent when nothing is pointing. */
const FLAGGED = 11;
const RADIUS = { rest: 2.2, flagged: 3.4, near: 3.8, peak: 6 };
const REACH = { near: 10, far: 34 };
/** Mass 1. Damping ratio 0.84: one small overshoot, then still. */
const SPRING = { stiffness: 170, damping: 22 };

const restRadius = (i: number) =>
  i === FLAGGED ? RADIUS.flagged : RADIUS.rest;

/** A dot's radius for its distance from the pointer, in box units. */
export function magnify(distance: number) {
  if (distance <= REACH.near)
    return RADIUS.peak - (distance / REACH.near) * (RADIUS.peak - RADIUS.near);
  if (distance <= REACH.far)
    return (
      RADIUS.near -
      ((distance - REACH.near) / (REACH.far - REACH.near)) *
        (RADIUS.near - RADIUS.rest)
    );
  return RADIUS.rest;
}

function FleetHealth({ interactive }: { interactive: boolean }) {
  const dots = React.useRef<(SVGCircleElement | null)[]>([]);
  const sim = React.useRef({
    radius: DOTS.map((_, i) => restRadius(i)),
    velocity: DOTS.map(() => 0),
    target: DOTS.map((_, i) => restRadius(i)),
    frame: 0,
    last: 0,
  });
  const [focus, setFocus] = React.useState(FLAGGED);

  React.useEffect(() => {
    const state = sim.current;
    return () => cancelAnimationFrame(state.frame);
  }, []);

  function run() {
    const state = sim.current;
    if (state.frame) return;
    state.last = performance.now();
    const tick = (now: number) => {
      // Clamp the step: a tab coming back from the background would
      // otherwise hand the spring one enormous frame and fling the dots.
      const dt = Math.min((now - state.last) / 1000, 1 / 30);
      state.last = now;
      let moving = false;
      for (let i = 0; i < DOTS.length; i++) {
        const pull = -SPRING.stiffness * (state.radius[i] - state.target[i]);
        state.velocity[i] += (pull - SPRING.damping * state.velocity[i]) * dt;
        state.radius[i] += state.velocity[i] * dt;
        const settled =
          Math.abs(state.velocity[i]) < 0.01 &&
          Math.abs(state.radius[i] - state.target[i]) < 0.01;
        if (settled) {
          state.radius[i] = state.target[i];
          state.velocity[i] = 0;
        } else {
          moving = true;
        }
        dots.current[i]?.setAttribute("r", state.radius[i].toFixed(2));
      }
      state.frame = moving ? requestAnimationFrame(tick) : 0;
    };
    state.frame = requestAnimationFrame(tick);
  }

  function aim(point: Point | null) {
    const distances = DOTS.map((dot) =>
      point ? Math.hypot(point.x - dot.x, point.y - dot.y) : Infinity,
    );
    const nearest = distances.indexOf(Math.min(...distances));
    // Pointing at the summary card, or anywhere off the grid, is rest.
    const onGrid = distances[nearest] <= REACH.far;
    setFocus(onGrid ? nearest : FLAGGED);
    // Reduced motion: the accent moves, the radii do not.
    if (prefersReducedMotion()) return;
    sim.current.target = distances.map((distance, i) =>
      onGrid ? magnify(distance) : restRadius(i),
    );
    run();
  }

  return (
    <>
      <Backdrop />
      <circle cx={32} cy={31} r={1.7} className={bar} />
      <circle cx={37.5} cy={31} r={1.7} className={bar} />
      <circle cx={43} cy={31} r={1.7} className={bar} />
      <path d="M22 39H138" strokeWidth={HAIRLINE} className={line} />
      {DOTS.map((dot, i) => (
        <circle
          key={i}
          ref={(element) => {
            dots.current[i] = element;
          }}
          data-slot="illustration-dot"
          data-focus={i === focus ? "" : undefined}
          cx={dot.x}
          cy={dot.y}
          r={restRadius(i)}
          className={cn(
            "transition-colors",
            i === focus ? "fill-surface-primary-emphasis" : bar,
          )}
        />
      ))}
      <rect
        x={56}
        y={106}
        width={92}
        height={30}
        rx={9}
        strokeWidth={HAIRLINE}
        className={cn("illustration-float fill-surface-card", line)}
      />
      <circle cx={73} cy={121} r={8} className="fill-surface-primary-muted" />
      <Check
        aria-hidden
        x={68.5}
        y={116.5}
        width={9}
        height={9}
        strokeWidth={1.75}
        className={accentGlyph}
      />
      <rect x={88} y={114} width={26} height={3.6} rx={1.8} className={bar} />
      <rect x={88} y={121.4} width={44} height={4} rx={2} className={bar} />
      {interactive && (
        <HitArea
          onPointerMove={(event) => aim(toBox(event))}
          onPointerLeave={() => aim(null)}
        />
      )}
    </>
  );
}

/* ── Sequence · Call readiness ───────────────────────────────────────────
 * Four checks feed one answer. While the pointer is over the picture the
 * checks light in turn — headset, machine, platform, network — each for a
 * quarter of the loop, in steps, and the dashes run toward the shield.
 *
 * One ring is lit at a time, never all four: with the shield that keeps the
 * accent on two shapes, which is the Spotkit limit. If a change makes them
 * accumulate, it has broken the brand rule, not improved the animation.
 *
 * No script. The loop is `group-hover` on the root, so it costs nothing at
 * rest and stops the moment the pointer leaves.
 *
 * ⚠️ `motion-safe:` on the hover class, not `motion-reduce:animate-none`
 * beside it. A hover variant is emitted after `motion-reduce:`, so the
 * override loses and the loop runs anyway — which is what it did at first.  */
const CHECKS = [
  { Icon: Headset, x: 28, y: 40, wire: "M44 48C53.5 48 53.5 69 63 69" },
  { Icon: Monitor, x: 116, y: 40, wire: "M116 48C106.5 48 106.5 69 97 69" },
  { Icon: Cloud, x: 116, y: 88, wire: "M116 96C106.5 96 106.5 69 97 69" },
  { Icon: Wifi, x: 28, y: 88, wire: "M44 96C53.5 96 53.5 69 63 69" },
] as const;
/** A quarter of the 2.4s loop in theme.css. Change them together. */
const CHECK_STEP = 600;

function CallReadiness({ interactive }: { interactive: boolean }) {
  return (
    <>
      <Backdrop />
      {CHECKS.map(({ Icon, x, y, wire }, i) => (
        <g
          key={wire}
          data-slot="illustration-check"
          style={{ "--illustration-delay": `${i * CHECK_STEP}ms` } as CSSVars}
        >
          <path
            d={wire}
            strokeWidth={HAIRLINE}
            strokeDasharray="2.4 3"
            strokeLinecap="round"
            className={cn(
              line,
              interactive &&
                "motion-safe:group-hover/illustration:animate-illustration-flow",
            )}
          />
          <rect
            x={x}
            y={y}
            width={16}
            height={16}
            rx={5}
            strokeWidth={HAIRLINE}
            className={cn("fill-surface-app", line)}
          />
          {interactive && (
            <rect
              data-slot="illustration-check-ring"
              x={x}
              y={y}
              width={16}
              height={16}
              rx={5}
              strokeWidth={1}
              className="stroke-line-primary-emphasis opacity-0 motion-safe:group-hover/illustration:animate-illustration-check"
            />
          )}
          <Icon
            aria-hidden
            x={x + 3}
            y={y + 3}
            width={10}
            height={10}
            strokeWidth={1.5}
            className={glyph}
          />
        </g>
      ))}
      <rect
        x={63}
        y={52}
        width={34}
        height={34}
        rx={11}
        strokeWidth={HAIRLINE}
        className={cn("illustration-float fill-surface-card", line)}
      />
      <ShieldCheck
        aria-hidden
        x={71}
        y={60}
        width={18}
        height={18}
        strokeWidth={1.5}
        className={accentGlyph}
      />
      <rect x={52} y={110} width={56} height={5} rx={2.5} className={bar} />
      <rect x={62} y={120} width={36} height={4.4} rx={2.2} className={bar} />
    </>
  );
}

export function Illustration({
  name,
  label,
  interactive = true,
  className,
  ...rest
}: IllustrationProps) {
  const text = label === undefined ? defaultLabels[name] : label;
  const a11y =
    text === null
      ? { "aria-hidden": true as const }
      : { role: "img", "aria-label": text };

  return (
    <svg
      data-slot="illustration"
      data-name={name}
      data-interactive={interactive ? "" : undefined}
      viewBox="0 0 160 160"
      fill="none"
      className={cn("group/illustration block h-auto w-full", className)}
      style={{ "--illustration-gap": `${ALERT.gap}px` } as CSSVars}
      {...a11y}
      {...rest}
    >
      {name === "issue-alerts" && <IssueAlerts interactive={interactive} />}
      {name === "fleet-health" && <FleetHealth interactive={interactive} />}
      {name === "call-readiness" && <CallReadiness interactive={interactive} />}
    </svg>
  );
}
