---
title: Motion
description: Colour transitions, the Loader and illustrations, and nothing else. Reduced motion substitutes rather than deletes.
---

# Motion

Picasso animates three things: colour, the Loader, and illustrations.
Everything else changes instantly.

## Colour transitions

A control with a hover or focus colour carries `transition-colors` and nothing
else — no duration, so it runs at Tailwind's default 150ms and easing. Tabs,
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
| **Lift** | A discrete change. The gap follows the pointer and shapes slide to make room. | `transition-illustration`: 600ms `cubic-bezier(0.32, 0.72, 0, 1)`, 50ms stagger |
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

## There is no duration or easing scale

No `--duration-fast`, no `--ease-standard`, and no transition on a control
but colour. A Drawer opens instantly; a Sidebar collapses instantly. The
Loader's and the illustrations' timings are authored for those two things and
are not a scale to borrow from: `transition-illustration` on a Dialog is as
off-system as `duration-300`.

So a component that wants motion uses `transition-colors` or does without, and
says which in a comment. Do not reach for `duration-300` or an arbitrary
`ease-[…]`: the linter refuses the arbitrary value, and a bare Tailwind
duration is a number outside the system.

## Reduced motion is not optional

Every animation honours `prefers-reduced-motion`. Skeleton carries
`motion-reduce:animate-none`; Loader stops all travel and substitutes a fade,
because the component still has to say "working" when it cannot move:

```tsx
"motion-reduce:-translate-x-4 animate-loader-pulse-l motion-reduce:animate-loader-pulse-fade"
```

Reduced motion is not "remove the animation". A spinner that stops spinning
looks broken. Replace travel with a change the eye still reads as alive, and
make sure the component says what it means with motion fully disabled.
Skeleton's test asserts this; copy that pattern.
