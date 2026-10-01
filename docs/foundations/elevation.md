---
title: Elevation
description: Five shadow steps, two mechanisms, and a z-index ladder that is still de facto.
---

# Elevation

## Shadows are tokens; there are five of them

`shadow-xs` · `shadow-sm` · `shadow-md` · `shadow-lg` · `shadow-xl`

Each is a composite of two drop layers plus an inset, generated from
`_shadow/*` in `light.json` and `dark.json`. Figma binds its effect styles to
the same `_shadow/*` colours, so a shadow cannot drift between the two.

| Step | Who uses it today |
|---|---|
| `shadow-xs` | Card, Kbd, Slider — a resting surface lifted off the page |
| `shadow-sm` | Switch, Tabs, ThresholdSlider — a small raised affordance |
| `shadow-md` | DropdownMenu, Select, Toast, Overlay | 
| `shadow-lg` | Drawer, Popover, Overlay |
| `shadow-xl` | Nothing. The step exists; no component has needed it |

Overlay appears twice because its variants carry different depth, and Dialog
takes its shadow from Overlay rather than setting one.

Four more exist for the embeddable widget — `shadow-widget-panel`,
`-notification`, `-screen`, `-smooth`. They carry that product's own depth,
not the system's, and nothing outside the widget should reach for them.

## Light and dark carry depth differently

This is the part that surprises people. In light mode a shadow is a drop
shadow: near-black (`#161618`) at 4–12% opacity, and the inset layer is fully
transparent. In dark mode the drop layers go to 40–60% of pure black — a dark
surface needs far more to read at all — **and the inset becomes visible**, a
white top highlight from `#FFFFFF0A` at `xs` to `#FFFFFF14` at `xl`.

So in dark mode, elevation is carried partly by a lit top edge rather than
only by a shadow underneath. Never hand-write a shadow for dark mode; the
token already knows.

## Focus rings live in the shadow namespace

They are composites too, so they share it: `shadow-ring-focus`,
`shadow-ring-focus-danger`, `shadow-ring-focus-inset`.

`ring-focus` is two rings, not one. The inner 2px is the page background —
neutral-50 in light, neutral-900 in dark — and the outer 2px is brand-500
(brand-400 in dark). The inner ring is what AGENTS.md calls the offset: it
separates the brand ring from the control so the ring reads on any surface.

Use `shadow-ring-focus-danger` on a control that is both focused and invalid.
The rule for which control gets which is in
[Accessibility](accessibility.md) — boxes take a border, marks take a ring.

## Z-index has no scale yet

What the library actually uses today:

| Value | Where |
|---|---|
| `z-10` | Within a component — the active OTP slot, a ButtonGroup sibling lifted on hover or focus |
| `z-50` | Drawer, Dialog, Tooltip, Popover, Select content, Overlay **and its scrim** |
| `z-100` | The Toast viewport |

That is a de-facto ladder — component-internal, overlay, notification — and it
works. But the scrim sits at the same `z-50` as the dialog it dims, so correct
stacking depends on DOM order rather than on the number, and `z-100` is a lone
value with nothing between it and 50.

**This is an open decision, not a documented rule.** The proposal on the table
is GovTech's scale — 0 / 100 / 400 / 800 / 1600 — plus a rung above `modal`
for notifications, because a toast has to clear a modal's internal stacking
and GovTech's own local layers already run to 2400. Until it lands, do not
invent a new z-index: reuse one of the three above, and say so in review.

## Where the values are

`packages/tokens/tokens/{light,dark}.json` → `_shadow/*` and `shadow/*`;
exposed to Tailwind in `packages/tokens/theme.css`. The resolved values for
both modes are in `/llms-tokens.txt`.
