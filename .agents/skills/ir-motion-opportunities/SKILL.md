---
name: ir-motion-opportunities
description: Look through a component, a screen or the whole of Picasso for places that would be better with motion — and turn down the ones that would not. Read-only: it proposes, with exact tokens and named animations, and builds nothing. Use when asked what could be animated, where the interface feels flat or abrupt, or how to make something feel more alive. To build a proposal use ir-motion; to check motion that already exists use ir-motion-review.
---

# Finding where motion belongs, the IR way

Most places do not need it. That is the starting position, and this skill is
mostly a filter: expect to turn down more than you propose, and count a short
list as a good result.

It changes no code. Each proposal is written so that `ir-motion` — or a
person — can build it without asking anything further.

## Know the product first

IR's products are monitoring consoles. They are used for hours at a stretch,
they are dense, and the person using them is usually trying to find out what
is wrong. That sets the bar: a marketing page can afford charm, a console
cannot. The docs site and first-run moments have more room than the console
does.

Before proposing anything, read `docs/foundations/motion.md` and list what
already moves, so you do not propose what exists.

## Four questions, in order

A candidate that fails one is out. Write down which one.

**1. How often is it seen?** Hundreds of times a day, or triggered by a key:
out. Dozens of times: colour only, or out. Now and then: eligible. Rarely:
eligible, and the only place anything warmer is allowed.

**2. What is it for?** Feedback, showing where something came from, making a
change legible, or bridging a jump. Nothing else counts.

**3. Does it fit the scale?** It has to work at 150, 200 or 300ms, moving
only `transform` and `opacity`. If it only works slowly, or only by
animating a size, it is out.

**4. Is anyone reading it?** If the thing that would move is data — a chart,
a number, a row — it is out.

## Where to look

- **A control with no answer to a press.** Something you can click that only
  changes colour, or does not change at all.
- **Something that appears or vanishes with no bridge.** A conditional render
  (`{open && …}`), a panel swapped for another, a banner that is suddenly there.
- **A panel with no connection to what opened it.** It should grow from its
  trigger, or slide from the edge it lives on, and leave the same way.
- **A surface a finger drags that stops dead** rather than settling.
- **A rare moment drawn flat.** First run, an empty state, a long job
  finishing. Illustrations already answer the pointer outside the console.

## Already decided — do not propose these again

Each was considered and turned down. Raise one only with a new reason.

| Candidate | Why not |
|---|---|
| Charts drawing in, KPIs counting up, sparklines tracing | Data does not move for style |
| The Sidebar's rail animating its width | A layout property; the page beside it re-lays out every frame |
| Sidebar items, table rows, calendar days, list navigation | Seen hundreds of times a day |
| A tab indicator or a Segmented control thumb sliding across | Navigation and view switches, used all day — colour only |
| KPI rows and chart grids staggering in | The dashboard is the product, not an entrance |
| Anything on a keyboard shortcut | Always out |
| A hover that lifts, grows or shifts | Hover is colour |
| A Loader that spins faster or bounces | Its timings are authored with the brand |

## What to hand back

**1. Proposals** — five at most for a whole app, fewer for one screen, the
most useful first.

| # | Where | Today | For | Seen | Proposal |
|---|---|---|---|---|---|
| 1 | `banner.tsx:40` | Appears at once above the table and pushes it down | Bridging a jump | Now and then | `animate-fade-in`; reserve its height so the table does not move |

Every proposal names a token or a named animation from `ir-motion`, the
properties that move, and what happens under reduced motion. No invented
values.

**2. Turned down** — two to five things you looked at and left alone, each
with the question it failed. This is the half that makes the list worth
trusting.

**3. Where it stands** — one short paragraph: how much motion this surface
needs, how close it already is, and the one proposal worth doing first.

If nothing survives, say that plainly. It usually means the interface is
already right.
