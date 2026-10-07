---
title: Motion, before and after
description: Each motion rule as a pair you can play — what not to do, and what Picasso does — with the reasoning behind it.
---

# Motion, before and after

The rules in [Motion](motion.md) are easier to believe when you can watch
them. Each one here is a pair: the wrong way on the left, what Picasso does on
the right, and one button that plays both at once.

Turn on **Slow motion** to run both sides five times longer. Most of these
differences are a few frames long, and that is the point — they are felt
before they are seen.

Three of the left-hand sides are not invented. They are what Picasso itself
did until 7 October 2026, and they are marked.

Reading this on GitHub, the examples do not play. They are on the docs site,
and in Storybook under **Foundations / Motion before and after**.

## Data does not move for style

**Before** — `Count-up over 1.2s, bars grow over 800ms`.

**Now** — `No animation`. The value is there when the tile is.

<Story id="foundations-motion-before-and-after--data-does-not-move" title="A KPI tile that counts up, beside one that shows its value at once" />

This is the first question for anything that might move — should it move at
all — and for data the answer is no.

Someone opens a dashboard to read a number: is the fleet healthy, how many
trunks are down. For the first second, a tile that counts up shows numbers
that are not true. A quarter of a second in, the example reads about 780
trunks reporting; the answer is 1,284.

On a monitoring console it is worse than slow, because here movement means
change. A bar that is growing reads as a metric that is rising. And it does
not happen once: it replays on every load, every filter and every refresh, to
someone who is on this screen all day.

So charts, KPI tiles, sparklines and meters appear with their values, and a
value that updates changes at once.

## Nothing starts slowly

**Before** — `In 200ms cubic-bezier(0, 0, 0.2, 1), out 150ms cubic-bezier(0.4, 0, 1, 1)`.
Picasso's Dialog did this until 7 October 2026.

**Now** — `animate-dialog-in, animate-dialog-out`. Both decelerate on
`motion/easing/out`: 200ms in, 150ms out.

<Story id="foundations-motion-before-and-after--nothing-starts-slowly" title="A dialog closing on an ease-in, beside one closing on an ease-out" />

Watch the first moment after Close.

The old closing curve was an ease-in: it starts slowly and leaves at speed.
That sounds right for something going away, and it is wrong for a reason you
can measure. A third of the way through its time, the old close had covered
about a sixth of the distance. The new one has covered seven eighths.

Those first frames are the ones that matter. They come straight after the
click or the Escape, when the person is looking at the dialog and waiting for
it to answer. An ease-in spends them barely moving, so the dialog seems to
hesitate before it goes.

Leaving still feels quicker than arriving. It does that by taking the shorter
step — 150ms against 200 — not by accelerating. There is no ease-in anywhere
in the system now, and a test fails if one is added.

## Nothing appears from nothing

**Before** — `scale(0) to scale(1)`.

**Now** — `animate-popover-in: scale(0.96) and a fade`.

<Story id="foundations-motion-before-and-after--nothing-from-nothing" title="A menu scaling up from zero, beside one arriving from 96 percent" />

Both sides take the same 150ms on the same curve. The only difference is
where they start.

From zero, the panel passes through every size on its way to full size, so
what the eye follows is the growing — a shape flying outwards — and the words
inside cannot be read until it stops. Closing is the same in reverse: the
menu shrinks to a dot, and the dot is where the eye is left.

From 96%, the panel is already its own shape in its own place. The fade does
the arriving. The scale is only there to give it a direction.

## An anchored panel grows from its trigger

**Before** — `transform-origin: center`.

**Now** — `transform-origin at the trigger`. On a real component that is the
origin Radix publishes, such as
`origin-(--radix-popover-content-transform-origin)`.

<Story id="foundations-motion-before-and-after--grows-from-its-trigger" title="A menu growing from its own centre, beside one growing from its trigger" />

This one is small on purpose. Four percent of a menu is a few pixels, so turn
on slow motion to see it.

From its centre, a menu appears beside its button. From the corner nearest
the trigger, it comes out of the button. That is what ties a panel to the
control that opened it, and it matters most in a toolbar or a table, where
several similar buttons each have a menu of their own.

It applies to Popover, Dropdown menu, Select's menu and Tooltip. A Dialog is
the exception: it is centred on the page and anchored to nothing, so it
scales from its centre.

## 300 is the ceiling

**Before** — `500ms ease-in-out, both ways`.

**Now** — `animate-drawer-in-end, animate-drawer-out-end`. 300ms in and 200ms
out, on `motion/easing/drawer`.

<Story id="foundations-motion-before-and-after--three-hundred-is-the-ceiling" title="A drawer sliding over half a second, beside one sliding over 300 milliseconds" />

Half a second each way is a second of waiting for every look, and a drawer is
opened dozens of times in a shift.

The curve does more than the number. A tenth of a second in, the slow drawer
has moved about 8% of the way. The Picasso drawer has moved 88%, because the
sheet curve covers most of the distance at once and spends the rest settling.
It can be read almost as soon as it is asked for.

Nothing in the interface takes longer than 300ms. The scale has three
durations — 150, 200 and 300 — and it is closed: a request for a fourth is a
request to make something slower.

## Only transform and opacity move

**Before** — `transition: width 200ms`. Picasso's Sidebar did this from 2 to
7 October 2026.

**Now** — `No transition`. The rail changes width at once.

<Story id="foundations-motion-before-and-after--only-transform-and-opacity" title="A sidebar animating its width, beside one that changes width at once" />

Each example counts how many times the page beside the rail changed size.
Animated, it is about twelve — once for every frame of the transition. Changed
at once, it is one.

In the example the page is four empty boxes, so twelve resizes cost nothing.
In Clarion it is charts and tables. Every one of those resizes is every chart
measuring itself and drawing again, twelve times, for a transition nobody
asked to watch.

`transform` and `opacity` do not touch layout, which is why everything else
that moves in Picasso moves on those two. There is no transform that makes a
rail narrower without squashing what is in it, so the rail does not animate.

The one exception is the Accordion's height. Nothing else opens a row, the
height is measured rather than guessed, and it is kept to 200ms.

## A press, not a hover

**Before** — `hover: scale(1.05), nothing on press`.

**Now** — `transition-press, active:scale-97`. Hover changes colour; a press
scales the control to 97%.

<Story id="foundations-motion-before-and-after--a-press-not-a-hover" title="A button that grows on hover, beside one that gives under a press" />

There is no play button here. Move across each button, then press and hold
it.

Hover is not a decision. On a dense screen the pointer crosses a dozen
controls on its way to the one it wants, and each of them would twitch as it
passed. A control that grows also moves its own edges under the pointer and
leans into its neighbours. And a finger has no hover at all.

A press is a decision, and it deserves an answer. The button gives 3% for as
long as it is held, and the label and icon go with it — that is what makes it
read as a press and not as a colour change.

`Button` and a pressable `Chip` do this. A text link does not, and neither
does a button inside a `ButtonGroup`, where one member pulling away from its
neighbours looks like the group coming apart.

## Reduced motion is a fade

**Before** — `No animation`. Picasso did this until 7 October 2026: every
surface appeared and vanished at once.

**Now** — `A 150ms fade, in place`.

<Story id="foundations-motion-before-and-after--reduced-motion-is-a-fade" title="A drawer that appears at once, beside one that fades in where it will sit" />

Both sides show what someone who has asked for reduced motion sees.

The setting asks for less movement. It does not ask for less information.
Sliding and scaling are what cause trouble, and a change in opacity is not
movement. A drawer that is simply there, with nothing connecting it to what
opened it, is harder to follow than one that fades in where it will sit.

So every named animation carries its own reduced-motion version, and in it the
travel and the scale are replaced by a short fade. Because it is built into
the animation, a component cannot forget it.

Two things stay as they were. Following a finger is not animation, so a
dragged sheet still tracks the pointer. And the Loader substitutes rather than
stops, because a spinner that does not spin looks broken.

## How these are built

The right-hand side of every pair is the real named animation from
`@ir/tokens/theme.css`, on the same `data-state` that Radix sets. It cannot
drift from what ships.

The left-hand side cannot be written as a class, and that is the linter doing
its job: an ease-in, a 500ms duration and an animated width are all refused.
They live in `packages/ui/.storybook/motion-specimens.css` as `data-specimen`
rules — in Storybook only, never in the package, and never somewhere a
component can reach for them.

If your system asks for reduced motion, the left-hand examples stay still and
the right-hand ones fade. A page about motion honours the setting it
describes.

The rules themselves, the tokens and the full list of named animations are in
[Motion](motion.md).
