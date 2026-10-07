---
title: Motion
description: When something should move and when it should not, the duration and easing scale, the named animations built from it, and what replaces them under reduced motion.
---

# Motion

IR's products are consoles. Someone runs one for a shift, and opens the same
drawer dozens of times before lunch. So motion here has one job: make the
interface feel like it heard you, and then get out of the way.

Picasso animates five things: surfaces that open and close; a press; colour;
the Loader; and illustrations. Everything else changes at once — and for most
of the interface, that is the right answer.

Each rule on this page can be watched, wrong way beside right, in
[Motion, before and after](motion-before-and-after.md).

## Should it move at all?

Decide this first. It is allowed to end the conversation.

**How often is it seen in a working day?**

| Seen | Decision |
|---|---|
| Hundreds of times: a keyboard shortcut, moving through a table, switching pages | Nothing moves — not a short animation, none |
| Dozens of times: a hover, a toggle, a filter chip, a tab | Colour only, or a change small enough to be felt rather than seen |
| Now and then: a dialog, a drawer, a toast, a sheet | A named animation |
| Rarely: first run, an empty state, a long job finishing | The one place a longer or warmer moment is allowed |

Anything a keyboard triggers is in the first row, whatever it is.

**What is it for?** It has to be one of four things: *feedback* (the
interface heard the press), *where it came from* (a panel grows from its
trigger, a toast leaves by the edge it arrived at), *what changed* (a row
opened, a switch moved), or *bridging a jump* (something would otherwise
appear with no connection to what caused it). "It looks good" is not one of
them.

**Is anyone reading it?** Data does not move for style. A chart does not
draw itself in, a KPI does not count up, a table row does not slide.

### What does not move, and why

Each of these was considered and turned down.

| Not animated | Why |
|---|---|
| Charts, KPI tiles, sparklines, meters | Someone is reading the number |
| The Sidebar's rail changing width | Width is a layout property: the page beside it would re-lay out on every frame |
| Sidebar items, table rows, calendar days | Seen hundreds of times a day |
| Tabs and the Segmented control | Navigation and view switches, used all day — colour only |
| KPI rows and chart grids arriving | The dashboard is the product, not an entrance |
| Anything on hover, beyond colour | A control that lifts or grows under the pointer is noise at this density |

## The scale

Three durations and four curves, as tokens (`motion/*` in `core.json`, emitted
as `--motion-*`). The scale is closed: a request for a fourth duration is a
request to make something slower.

| Token | Value | For |
|---|---|---|
| `motion/duration/fast` | 150ms | Small things, and leaving: a press, a popover or tooltip both ways, a dialog closing. Every fade that stands in for travel under reduced motion |
| `motion/duration/base` | 200ms | Arriving: a scrim, a dialog, an accordion row. A drawer, toast or sheet leaving |
| `motion/duration/slow` | 300ms | A surface travelling its own length: a drawer, toast or sheet sliding in. The ceiling |
| `motion/easing/out` | `cubic-bezier(0.23, 1, 0.32, 1)` | The default — arriving, leaving, a press |
| `motion/easing/in-out` | `cubic-bezier(0.77, 0, 0.175, 1)` | Something already on screen that moves or changes shape |
| `motion/easing/drawer` | `cubic-bezier(0.32, 0.72, 0, 1)` | A sheet sliding from an edge. Illustrations' lift uses it too |
| `motion/easing/settle` | `cubic-bezier(0.3, 1.35, 0.5, 1)` | A dragged surface coming back to where it was |

`motion/easing/enter` and `exit` are deprecated. Both now equal `out`, and
both go in the next major release.

The curves are stronger than the CSS keywords of the same names, and that is
deliberate: the keyword `ease-out` barely decelerates, so nothing reads as
intended. Tailwind's own `ease-out` and `ease-in-out` classes are re-pointed
at the tokens, so a class that says `ease-out` means the system's.

## The rules

**Nothing starts slowly.** Arriving and leaving both decelerate on
`easing/out`. There is no ease-in anywhere: a curve that starts slowly holds
back the first frames, which are the ones someone is watching. Leaving feels
quicker because it takes the shorter step, not because it accelerates.

**Nothing appears from nothing.** A surface scales from 96% with a fade,
never from zero.

**An anchored panel grows from its trigger.** Popover, Dropdown menu,
Select's menu and Tooltip point `transform-origin` at the origin Radix
publishes (`origin-(--radix-popover-content-transform-origin)` and its
siblings), so a menu opening below-left of its button grows from that corner.
A Dialog is centred and scales from its centre — it is not anchored to
anything.

**Only `transform` and `opacity` move.** Never `width`, `height`, `margin`,
`padding`, `top` or `left`: they re-lay out the page on every frame, and the
page is charts. The Accordion's height is the one exception — nothing else
opens a row, Radix measures the height so it never animates to `auto`, and it
is kept short.

**Keyframes for what mounts, transitions for what stays.** Radix removes a
closing surface on `animationend` and does not wait for a transition, so
everything that opens and closes is a keyframe animation that holds its last
frame. Anything that stays on the page and changes state — a switch, a
pressed button, a progress bar — is a transition, because a transition can be
interrupted halfway and carry on from where it is.

**It travels its own length.** `translateX(100%)`, never a pixel count.

**Hover is colour.** Nothing changes size or position on hover.

## The named animations

A component never states a duration or a curve. `theme.css` composes the
tokens into named animations, and the component asks for one:

| Utility | Used by | Timing |
|---|---|---|
| `animate-fade-in` · `-out` | The scrim behind Dialog, Drawer and Bottom sheet | base in · fast out |
| `animate-dialog-in` · `-out` | Dialog, and the expanded Drawer | fade and scale from 96%: base in · fast out |
| `animate-popover-in` · `-out` | Popover, Dropdown menu and its submenus, Select's menu, Tooltip | fade and scale from 96%, from the trigger: fast both ways |
| `animate-drawer-in-end` · `-out-end` (and `-start`) | Side Drawer, the Sidebar's phone nav | slide from its edge, the other way in RTL: slow in · base out, on `easing/drawer` |
| `animate-sheet-in` · `-out` | Bottom sheet | slide from the bottom edge: slow in · base out, on `easing/drawer` |
| `animate-toast-in` · `-out` | Toast | fade and slide from the inline end: slow in · base out |
| `animate-accordion-down` · `-up` | Accordion content | height and a fade, to the height Radix measures: base in · fast out |

Applied on Radix's `data-state`, with no `motion-safe:` in front:

```tsx
"data-[state=open]:animate-dialog-in data-[state=closed]:animate-dialog-out"
```

The anchored surfaces take the fast step both ways. They are small and open
under the pointer, so anything longer reads as lag.

Three details the table does not show:

- **A Tooltip animates its delayed open only.** Moving along a row of
  triggers, Radix opens the next tooltip at once; a fade on each would make
  the row feel slower.
- **A Toast follows a swipe.** It tracks the finger, carries on from where it
  is let go and settles back if the swipe is abandoned. In RTL the slide
  mirrors in CSS and `ToastProvider` turns the swipe round from the direction
  provider.
- **A Bottom sheet follows a drag.** Released past a quarter of the panel, or
  thrown, it goes; short of that it comes back on `easing/settle`
  (`transition-settle`), which overshoots a couple of percent so the return
  reads as weight.

To add one: a `@keyframes` and an `@utility` in `theme.css`, built only from
the tokens, with its reduced-motion branch inside it. Then this table, the
list in `packages/ui/src/__tests__/motion.test.ts`, and the changelog.

## The press

A pressable control gives a little under the pointer. `Button` and an
interactive `Chip` scale to 97% while they are held down, and the label and
icon go with them — that is what makes it read as a press rather than a
colour change.

```tsx
"transition-press motion-safe:active:scale-97"
```

`transition-press` is the colours a control already animated, plus `scale`,
on the fast step. It names its properties: Tailwind's bare `transition`
animates eighteen of them.

Not everything pressable presses. A text link does not shrink. A Button
inside a `ButtonGroup` does not either — one member pulling away from its
neighbours reads as the group coming apart. Tabs, sidebar items and table
rows are navigation, and answer with colour.

## Things that move in place

A switch's knob, a chevron turning, a progress bar. These are transitions on
`transform`, and they state a curve but not a duration — the default is the
fast step:

```tsx
"transition-transform ease-out motion-reduce:transition-none"   // a knob, a chevron
"transition-transform ease-linear motion-reduce:transition-none" // a bar reporting progress
```

Progress is linear because it is reporting something; progress does not ease.

## Reduced motion

Reduced motion means gentler, not absent. A surface that simply appears, with
no connection to what opened it, is harder to follow, not easier.

So every named animation carries its own `prefers-reduced-motion` branch, and
under it travel and scale are replaced by a fade on the fast step. A drawer
does not slide; it fades in where it will sit. A dialog does not scale; it
fades. That is why a component writes no `motion-safe:` on them — the
substitution is part of the animation, and cannot be forgotten.

What that leaves to the component:

- **A transition carries `motion-reduce:transition-none`.** The knob changes
  sides without travelling.
- **A press scale sits under `motion-safe:`.** The pressed colour still
  answers.
- **Following a finger is not animation.** A dragged sheet and a swiped toast
  track the pointer under reduced motion too; only the settle is switched
  off.
- **The Loader substitutes rather than stops.** A spinner that does not spin
  looks broken, so travel becomes a slow cross-fade.

## In Figma

Nothing moves on canvas. Figma carries the motion tokens as variables — the
durations as numbers in milliseconds, the curves as strings — hidden from
pickers. A static frame cannot show a transition, so the tokens are the spec,
and a motion change has no Figma impact beyond a variable's value.

## Colour transitions

A control with a hover or focus colour carries `transition-colors` and nothing
else. It states no duration and no curve: `theme.css` sets Tailwind's defaults
to `motion/duration/fast` and `ease`, the curve for a colour change. Tabs,
Sidebar, Calendar and every input do this.

## The Loader

The one piece of authored motion. Its seven utilities are declared in
`packages/tokens/theme.css` rather than in `@ir/ui`, because the package ships
no CSS of its own and every consuming app already imports the tokens:

| Utility | Timing |
|---|---|
| `animate-loader-turn` | 3s linear, infinite |
| `animate-loader-reach` | 1.5s `cubic-bezier(0.45, 0, 0.55, 1)`, infinite |
| `animate-loader-fade` | 1.8s ease-in-out, alternating |
| `animate-loader-pulse-l` · `-m` · `-r` | 1.3s ease-in-out, infinite |
| `animate-loader-pulse-fade` | 1.4s ease-in-out, alternating |

The two Fuse periods — 3s and 1.5s — are out of phase on purpose, so the
gesture never lines up with itself. In Pulse, the outer dots swell as they
spread while the middle swells as they close; three dots scaling together is
a bounce, which is a different component.

Skeleton pulses through Tailwind's own `animate-pulse`.

## Illustrations

Product illustrations answer the pointer. It is the one place Picasso moves
something because a person pointed at it, and it stays outside the console:
marketing pages and docs, not empty states or cards. Inside the product an
`Illustration` takes `interactive={false}` and stays still.

There are three mechanics, one per kind of response. A drawing carries one.

| Mechanic | What happens | Timing |
|---|---|---|
| **Lift** | A discrete change. The gap follows the pointer and shapes slide to make room. | `transition-illustration`: 600ms on `motion/easing/drawer`, 50ms stagger |
| **Magnify** | A continuous one. Each shape swells by its distance from the pointer. | A spring per shape: stiffness 170, damping 22, mass 1 |
| **Sequence** | A stepped loop while the pointer is over the picture. One shape is lit at a time. | `animate-illustration-check`: 2.4s `step-end`, a quarter each · `animate-illustration-flow`: 0.9s linear |

Lift and sequence are CSS, declared in `packages/tokens/theme.css` beside the
Loader's. Magnify is a spring, which cannot be written as a transition, so it
runs in `illustration.tsx` and writes one attribute per shape per frame.

Three rules hold all of them together:

- **The layer that listens never moves.** Hover is read from a still,
  transparent layer and resolved against where the shapes now are. A handler
  on a shape that slides out from under the pointer flickers at every edge.
- **One accent, and it moves.** The open alert, the nearest endpoint, the
  check that is running. It never spreads to several shapes.
- **Nothing is said only on hover.** The picture is decoration; the heading
  beside it carries the meaning.

Under reduced motion nothing travels. Lift changes state without the slide,
magnify moves the accent and leaves the sizes alone, and sequence does not
run — the drawing at rest already says what it means.

## Outside the scale

The Loader's and the illustrations' timings are authored for those two things
and are not part of the scale: `transition-illustration` on a Dialog is as
off-system as `duration-300`.

So a component that wants motion uses one of the named animations above,
`transition-press`, `transition-colors` or `transition-transform` — or does
without, and says which in a comment. Do not reach for `duration-300` or an
arbitrary `ease-[…]`: the linter refuses the arbitrary value, and a bare
Tailwind duration is a number outside the system. If a new surface needs to
move, add a named animation to `theme.css` built from the `motion/*` tokens.

## Building and checking motion

Three skills in `.agents/skills` carry these rules for an agent: `ir-motion`
builds, `ir-motion-review` reviews a diff or the whole repo, and
`ir-motion-opportunities` looks for places that should move and turns down
the ones that should not. `packages/ui/src/__tests__/motion.test.ts` is the
part a machine can check: no curve that starts slowly, nothing over 300ms, no
layout property, and a reduced-motion branch on every named animation.

jsdom cannot play an animation. Before calling motion done, run it in a
browser, slow it down five times, turn on reduced motion, and set
`dir="rtl"` if anything travels sideways.
