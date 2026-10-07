---
name: ir-pick-ui-library
description: Decide what to build a piece of UI with at IR — a Picasso component first, then what Picasso itself is built on, and only then something new. Use when someone asks "what should I use for…" a dialog, a toast, a chart, a date picker, a code input, icons, a long list, drag and drop, or is about to add a front-end dependency to Picasso or to a product that uses it.
---

# Choosing what to build with, the IR way

The answer is nearly always "Picasso already has it". This skill exists for
the times that is not obvious, and for the few times it is not true.

## Ask in this order

**1. Is it a Picasso component?** Look in `packages/ui/src/components` and
`docs/components`. If it is there, use it as it is. If it is nearly there —
right component, missing variant — the work is in Picasso, not beside it.

**2. Can it be composed from Picasso components?** A filter bar is Chips, an
Input and a Select. Most product UI is this.

**3. Is there a Radix primitive for it?** Picasso's interactive components
are a Radix primitive, `cva` variants and `cn()`. A new one should be too:
Radix carries the focus handling, keyboard behaviour and reading direction
that are slow to get right and easy to get wrong by hand.

**4. Only then, something new** — and it has to pass the test at the end of
this file.

## What IR has already chosen

These are decisions. Do not bring in a second answer to the same question.

| For | Use | Notes |
|---|---|---|
| Dialogs, popovers, menus, tooltips, tabs, accordions, switches, sliders, toasts | **Picasso**, on Radix | Never a `div` with a click handler and hand-managed focus |
| Variants on a component | **`cva`** | When a component has real axes — size, variant, state |
| Joining class names | **`cn()`** from `@/lib/utils` | `clsx` plus `tailwind-merge`. Not template strings |
| Styling | **Tailwind v4 with Picasso's tokens** | Semantic utilities only. No raw colours, no arbitrary values |
| Icons | **Lucide** | No other icon set |
| Calendars and date ranges | **Picasso's `Calendar` and `DatePicker`**, on `react-day-picker` | |
| Date arithmetic and formatting | **`date-fns`**, and `Intl` for anything shown to a person | |
| One-time codes | **Picasso's `Otp`**, on `input-otp` | |
| Charts | **Picasso's `Chart`, `BarChart`, `Sparkline`** | Drawn in `@ir/ui`; there is no chart library. Read `docs/components/chart.md` first |
| Loading | **`Skeleton`** where the layout is known, **`Loader`** where it is not | |
| Motion | **CSS, from the motion tokens** | See `ir-motion`. No animation library is installed, and a fade does not need one |
| Reading direction | **`DirectionProvider`** and `useDirection()` | Radix reads the same provider |
| Numbers, plurals, relative time | **`Intl`** | Never hand-built strings |

## Not chosen yet

Nothing in Picasso covers these, and no library has been picked. Do not
quietly pick one — the first product to need it sets the precedent for the
rest. Say that it is undecided, recommend one against the test below, and
get it agreed before it lands.

- Very long lists and tables (virtualisation)
- Drag and drop
- A command menu
- State shared across a product
- Motion that CSS cannot express — a physics spring, a layout animation

## The test for anything new

A dependency in Picasso becomes a dependency of every product that uses it.

1. **Does it come unstyled?** It has to take Picasso's tokens. A library with
   its own look means two design systems on one screen.
2. **Is it accessible without work?** Keyboard, focus, roles, names.
3. **Does it mirror?** Arabic, Hebrew and Persian are supported. A library
   that assumes left-to-right is a rewrite waiting to happen.
4. **Does it honour reduced motion**, if it moves?
5. **Is it small, and does only what is used get shipped?**
6. **Is it alive?** Recent releases, a licence IR can use, more than one
   maintainer or small enough to own.
7. **Could it be forty lines instead?** A hook is cheaper than a package.

If it fails the first three, it is not a candidate.

## Things to catch

- A toast or dialog built by hand in a product → Picasso has one.
- A second icon set "for one icon" → find the Lucide equivalent or raise it.
- A chart library added for a single chart → extend Picasso's.
- A colour, radius or duration that arrives with a library → it is off-system
  the moment it renders.
- A class string built from three nested ternaries → `cva`.

## What to say

One recommendation and the reason in a sentence. Check `package.json` first:
if the project already has an answer, use it, and if it has a different one,
say so rather than replacing it unasked. If the honest answer is "this is
not decided", say that.
