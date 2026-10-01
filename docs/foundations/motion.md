---
title: Motion
description: Colour transitions at Tailwind's default, one authored animation, and no scale yet.
---

# Motion

Picasso has less motion than most design systems, and that is the current
state rather than a principle. This page says what exists so nobody invents
the rest.

## What exists

**Colour transitions.** `transition-colors` appears in 26 component files —
Tabs, Sidebar, Calendar, and every control with a hover or focus colour. None
of them sets a duration, so all of them run at Tailwind's default 150ms with
its default easing.

**The Loader.** The one piece of authored motion in the system. Seven
utilities, declared in `packages/tokens/theme.css` rather than in `@ir/ui`,
because the package ships no CSS of its own and every consuming app already
imports the tokens:

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

**The Skeleton pulse**, via Tailwind's own `animate-pulse`.

## What does not exist

**No duration or easing tokens.** There is no `--duration-fast`, no
`--ease-standard`. Two components say so in their own source rather than
quietly inventing one — Sidebar declines to animate its width ("there are no
motion tokens yet"), and Drawer opens with no transition at all ("Figma draws
none, and the system has no transition tokens").

That is the right instinct. Until the scale exists, a component that needs
motion either uses `transition-colors` or does without, and says which in a
comment. Do not reach for `duration-300` or an arbitrary `ease-[…]` — the
linter refuses the arbitrary value, and the bare Tailwind duration is a number
nobody agreed.

## Reduced motion is not optional

Every animation honours `prefers-reduced-motion`. Skeleton carries
`motion-reduce:animate-none`; Loader stops all travel and substitutes a fade,
because the component still has to say "working" when it cannot move:

```tsx
"motion-reduce:-translate-x-4 animate-loader-pulse-l motion-reduce:animate-loader-pulse-fade"
```

Note the second half of that — reduced motion is not "remove the animation".
A spinner that stops spinning looks broken. Replace travel with a change the
eye reads as alive, and make sure the component still communicates its state
with motion fully disabled. Skeleton's test asserts this; copy that pattern.

## When the scale lands

It needs three things, in this order: a duration ramp, an easing set, and a
rule for which state changes are allowed to animate at all. Until then this
page describes the floor, not the ceiling.
