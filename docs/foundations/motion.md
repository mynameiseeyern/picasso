---
title: Motion
description: Colour transitions, the Loader, and nothing else. Reduced motion substitutes rather than deletes.
---

# Motion

Picasso animates two things: colour, and the Loader. Everything else changes
instantly.

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

## There is no duration or easing scale

No `--duration-fast`, no `--ease-standard`, and no transition on anything but
colour. A Drawer opens instantly; a Sidebar collapses instantly.

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
