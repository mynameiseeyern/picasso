---
name: ir-motion
description: Build motion the IR way — for Picasso, Clarion and anything else that consumes @ir/tokens. Decides whether something should move at all, then writes it from the motion tokens and named animations, with reduced motion and RTL handled. Use when asked to animate something, add a transition, make a component feel more responsive, or build anything that opens, closes, slides or presses. To check motion that already exists use ir-motion-review; to look for places that should move use ir-motion-opportunities.
---

# Motion, the IR way

IR's products are consoles. Someone runs Clarion for a shift, watching a fleet,
and opens the same drawer dozens of times before lunch. So motion here has
one job: make the interface feel like it heard you, and then get out of the
way. It is never decoration on something a person is trying to read.

This skill writes motion. It does not audit a codebase or critique a diff.

The system it writes into:

- **Tokens** — `motion/*` in `packages/tokens/tokens/core.json`, emitted as `--motion-*`
- **Named animations and transitions** — `packages/tokens/theme.css`
- **The written rules** — `docs/foundations/motion.md`
- **The gate that enforces them** — `packages/ui/src/__tests__/motion.test.ts`

Read `docs/foundations/motion.md` before you write anything. It wins where
this file and it disagree, and if they do disagree, say so.

## Work in this order

The first two steps can end the job. That is a good outcome.

### 1. Should it move at all?

Count how often one person sees it in a working day.

| Seen | Decision |
|---|---|
| Hundreds of times: a keyboard shortcut, moving through a table, switching between pages | **Nothing moves.** Not a short animation — none |
| Dozens of times: a hover, a toggle, a filter chip, a tab | Colour only, or a change so small it is felt rather than seen |
| Now and then: a dialog, a drawer, a toast, a sheet | A named animation from the table below |
| Rarely: first run, an empty state, a job that just finished | The one place a longer or warmer moment is allowed |

Anything a keyboard triggers is in the first row, whatever it is.

And one rule that is specific to what IR builds: **data does not move for
style.** A chart does not draw itself in, a KPI does not count up, a table row
does not slide. The person looking at it is trying to read a number.

If the request fails here, say so in a sentence and offer what does the job
without motion — an instant change, a colour, a clearer resting state.

### 2. What is it for?

Name one before you go on:

- **Feedback** — the interface heard the press
- **Where it came from** — a panel grows from its trigger, a toast leaves by the edge it arrived at
- **What changed** — a row opened, a switch moved
- **Bridging a jump** — something would otherwise appear or vanish with no connection to what caused it

"It looks good" is not on the list. If you cannot name one, stop.

### 3. Use what exists

Reach for these before writing anything new. A component asks for a named
animation and never states a duration or a curve itself.

| You are building | Use | Timing |
|---|---|---|
| A scrim | `animate-fade-in` · `-out` | base in · fast out |
| A centred dialog | `animate-dialog-in` · `-out` | base in · fast out |
| A panel anchored to a trigger: popover, menu, select, tooltip | `animate-popover-in` · `-out`, plus `origin-(--radix-…-content-transform-origin)` | fast both ways |
| A surface sliding from an inline edge | `animate-drawer-in-end` · `-out-end` (or `-start`) | slow in · base out, sheet curve |
| A surface rising from the bottom | `animate-sheet-in` · `-out` | slow in · base out, sheet curve |
| A toast | `animate-toast-in` · `-out` | slow in · base out |
| A row opening | `animate-accordion-down` · `-up` | base in · fast out |
| A pressable control | `transition-press` + `motion-safe:active:scale-97` | fast |
| A hover or focus colour | `transition-colors` | fast, `ease` |
| A knob, a chevron, anything that moves in place | `transition-transform ease-out motion-reduce:transition-none` | fast |
| A bar reporting progress | `transition-transform ease-linear motion-reduce:transition-none` | fast, linear |
| A dragged surface returning | `motion-safe:transition-settle` on `translate` | base, the settle curve |

Applied on Radix's state, with no `motion-safe:` prefix on the named ones:

```tsx
"data-[state=open]:animate-dialog-in data-[state=closed]:animate-dialog-out"
```

### 4. If nothing fits, add one — to the system, not to the component

The tokens:

| Token | Value | For |
|---|---|---|
| `motion/duration/fast` | 150ms | Small things, and leaving |
| `motion/duration/base` | 200ms | Arriving |
| `motion/duration/slow` | 300ms | A surface travelling its own length. The ceiling |
| `motion/easing/out` | `cubic-bezier(0.23, 1, 0.32, 1)` | The default: arriving, leaving, a press |
| `motion/easing/in-out` | `cubic-bezier(0.77, 0, 0.175, 1)` | Something already on screen that moves or changes shape |
| `motion/easing/drawer` | `cubic-bezier(0.32, 0.72, 0, 1)` | A sheet sliding from an edge |
| `motion/easing/settle` | `cubic-bezier(0.3, 1.35, 0.5, 1)` | A dragged surface coming back |

A new named animation is a `@keyframes` and an `@utility` in `theme.css`,
built only from those tokens, with its reduced-motion branch inside it:

```css
@keyframes panel-in {
  from {
    opacity: 0;
    transform: scale(0.96);
  }
}
@utility animate-panel-in {
  animation: panel-in var(--motion-duration-base) var(--motion-easing-out);
  @media (prefers-reduced-motion: reduce) {
    animation: fade-in var(--motion-duration-fast) ease;
  }
}
```

Then add it to the table in `docs/foundations/motion.md`, to the list in
`motion.test.ts`, and to `CHANGELOG.md` with its **Figma impact** line —
which is always "none; nothing moves on canvas", because a static frame
cannot show a transition and the tokens are the spec.

Do not add a duration or a curve. Three and four are enough; a fourth
duration is a request to make something slower, and the answer is no.

## The rules that shape every one of them

**Nothing starts slowly.** Arriving and leaving both use `easing/out`. There
is no ease-in anywhere in the system: it holds back the first frames, which
are the ones someone is watching. Leaving feels quicker because it takes the
shorter step.

**Nothing appears from nothing.** Scale from 96% with a fade, never from 0.

**An anchored panel grows from its trigger.** Point `transform-origin` at
the origin Radix publishes. A centred dialog is the exception — it is not
anchored to anything.

**Only `transform` and `opacity` move.** Never `width`, `height`, `margin`,
`padding`, `top` or `left`: they re-lay out the page on every frame, and the
page is charts. The Accordion's height is the one exception, because nothing
else opens a row. This is why the Sidebar's rail changes width at once.

**Keyframes for what mounts, transitions for what stays.** Radix removes a
closing surface on `animationend` and does not wait for a transition, so
anything that opens and closes is a keyframe animation that holds its last
frame (`both`). Anything that stays on the page and changes state — a switch,
a pressed button, a progress bar — is a transition, because a transition can
be interrupted halfway and carry on from where it is.

**Travel its own length.** `translateX(100%)`, not a pixel count, so the
animation is right whatever size the surface turns out to be.

**Reduced motion is part of the animation.** Not "off": a short fade in place
of the travel, so the surface still arrives. The named animations carry this
themselves. A transition you write carries `motion-reduce:transition-none`,
and a scale on press sits under `motion-safe:`.

**Hover is colour.** Nothing changes size or position on hover. Tailwind's
`hover:` already applies only where a pointer can hover, so a tap on a phone
does not leave it stuck.

**Following a finger is not animation.** A dragged sheet or a swiped toast
tracks the pointer under reduced motion too. Only the release is gated.

**It mirrors.** There is no logical translate. A keyframe that travels
sideways multiplies by `--direction-sign`; a class takes an `rtl:` twin with
the sign turned. See `docs/foundations/rtl.md`.

**No arbitrary values.** `duration-300`, `ease-[…]` and
`transition-[width]` are all refused, by the linter or by review. If you want
one, the system is missing an entry — add the entry.

## Before you call it done

1. **Run it in a browser.** jsdom cannot play an animation; a test that
   asserts a class proves the class is there and nothing else.
2. **Slow it down.** Five times longer, or the Animations panel in DevTools.
   Look for a surface that scales from the wrong corner, two things that
   should move together and do not, and a last frame that flashes back.
3. **Turn on reduced motion** and check it still arrives and still leaves.
4. **Set `dir="rtl"`** if anything travels sideways.
5. **Use it on a phone** if a finger drives it. A drag feels nothing like a
   mouse.

If how it feels cannot be settled from code — the weight of a settle, a fade
against a height — say that, and say what to look at. Do not guess a value.

## What to say when you finish

Keep it to a few lines. The code is the work.

- **The decision** — how often it is seen, and what the motion is for. If you
  declined to animate something, which thing and why.
- **What it is built from** — the named animation or the tokens.
- **What still needs a person** — anything that has to be felt rather than read.
