---
title: Accessibility
description: WCAG 2.1 AA as a build gate, not a review activity.
---

# Accessibility

## The gate is 2.1 AA, and it runs in CI

`npm test` measures **every on-colour pair in the system, in both modes, for
every brand** — 24 pairs per brand — and fails the build below 4.5:1. Body
text is checked on `bg/app` and `bg/card`. The focus ring is checked at 3:1,
because a focus indicator is a UI component and SC 1.4.11 asks for 3:1 rather
than 4.5:1.

A brand's ramp and its on-colours are generated, so this is the gate that
proves the generator right. It exists because the amber flip was found by
hand, in an audit, after it had already shipped.

The test also asserts that it found 24 pairs. If a token is renamed and the
gate quietly stops covering it, that is worse than failing.

## Why 2.1 and not APCA

APCA models saturated colour better than WCAG 2.1 does, and 2.1 genuinely
mis-ranks some of our brand pairs. But APCA is not a standard, and it is not
what an accessibility obligation names.

So: **comply with 2.1, and where 2.1 says pass and the screen says otherwise,
darken.** Never the reverse. The eye overrides upward only.

## Focus is a ring, and the ring is the only indicator

`packages/tokens/theme.css` sets `:focus-visible { outline: none }` globally.
That means a component with no `shadow-ring-focus` has **no visible focus at
all** — there is no browser outline underneath to fall back on.

```tsx
"outline-none focus-visible:shadow-ring-focus"
```

`shadow-ring-focus` is two rings: 2px of the page background, then 2px of
brand. The inner ring is the offset, and it is what makes the indicator read
on a card, on a toolbar, and on a coloured surface alike. See
[Elevation](elevation.md) for why it lives in the shadow namespace.

`switch.tsx` still ships `border border-transparent`, which suppresses its
ring. That is a known defect, not a pattern to copy.

## Invalid: boxes take a border, marks take a ring

| Control | Treatment |
|---|---|
| Input, Select, Textarea, Number, Password — anything in an `InputGroup` | `has-[[aria-invalid=true]]:border-line-input-invalid` on the group |
| Checkbox, Radio, Switch | `aria-invalid:shadow-ring-focus-danger` |

A box already has a border, so invalid recolours it. A mark has no border to
recolour, so it gets a ring instead — and a checked checkbox keeps its fill
while the ring carries the error. One mechanism per shape, decided once.

## Disabled contrast is 2.24:1 on purpose

SC 1.4.3 exempts disabled controls, and the low contrast **is** the signal.
Do not "fix" a disabled state to 4.5:1; it would then read as available.

## Motion

Every animation honours `prefers-reduced-motion` — and honouring it means
substituting, not deleting. A spinner that stops spinning looks broken. See
[Motion](motion.md).

## Icons

Decorative icons take `aria-hidden`. An icon-only button takes `aria-label`,
because the icon sizes have no text child by definition and a screen reader
announces nothing without it. See [Icons](icons.md).

## Per-component notes live with the component

Each component's `guidance.json` carries an `a11y` array — the things an agent
or a reviewer cannot infer from the `.tsx`. Button's says the focus ring is
never removed, that `loading` sets `aria-busy` and must not stay activatable,
and why its disabled contrast is 2.24:1.

Those notes are published to `/llms-components.txt`, so they reach a model
writing code as well as a person reading Storybook. **A new component is not
finished until its `a11y` array says something true.**
